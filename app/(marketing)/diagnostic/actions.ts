"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { computeAssessment } from "@/lib/assessment/compute";
import { assessmentStore } from "@/lib/store/assessments";
import { reportStore } from "@/lib/store/reports";
import { dispatchEmail, emailVariables } from "@/lib/email/dispatch";
import {
  BUDGET,
  CAREER_GOAL,
  EDUCATION,
  ENGLISH,
  FOREIGN_BAR,
  FUNDING,
  GEO_GOAL,
  INTAKE,
  JOURNEY_STATUS,
  US_STATUS,
  type Answers,
} from "@/lib/questionnaire/types";
import { FRENCH_UNIVERSITIES } from "@/lib/partnerships/data";

/**
 * Soumission du questionnaire. Les réponses arrivent du client : elles sont
 * revalidées ici contre les unions fermées du CDC — jamais de valeur libre
 * acceptée telle quelle.
 */

const oneOf = <T extends string>(list: readonly T[], value: unknown): T | undefined =>
  typeof value === "string" && (list as readonly string[]).includes(value) ? (value as T) : undefined;

function parseAnswers(raw: Record<string, unknown>): Answers {
  const email = typeof raw.email === "string" ? raw.email.trim() : "";
  const firstName = typeof raw.firstName === "string" ? raw.firstName.trim() : "";
  const comment = typeof raw.comment === "string" ? raw.comment.trim() : "";

  return {
    status: oneOf(JOURNEY_STATUS, raw.status),
    education: oneOf(EDUCATION, raw.education),
    university:
      typeof raw.university === "string" &&
      (FRENCH_UNIVERSITIES as readonly string[]).includes(raw.university)
        ? raw.university
        : undefined,
    foreignBar: oneOf(FOREIGN_BAR, raw.foreignBar),
    careerGoal: oneOf(CAREER_GOAL, raw.careerGoal),
    geoGoal: oneOf(GEO_GOAL, raw.geoGoal),
    budget: oneOf(BUDGET, raw.budget),
    funding: oneOf(FUNDING, raw.funding),
    intake: oneOf(INTAKE, raw.intake),
    english: oneOf(ENGLISH, raw.english),
    usStatus: oneOf(US_STATUS, raw.usStatus),
    firstName: firstName || undefined,
    email: email || undefined,
    // Minimisation : le champ libre est plafonné, il n'a pas vocation à
    // recueillir de données sensibles (CDC §29, §34).
    comment: comment ? comment.slice(0, 800) : undefined,
    // Consentement marketing : accepté seulement s'il vaut littéralement true.
    // Toute autre valeur (absente, chaîne, 0) vaut refus (CDC §34).
    consentMarketing: raw.consentMarketing === true,
  };
}

export async function submitQuestionnaire(raw: Record<string, unknown>) {
  const answers = parseAnswers(raw);

  if (!answers.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(answers.email)) {
    return { error: "Merci d'indiquer une adresse email valide." };
  }
  if (!answers.firstName) {
    return { error: "Merci d'indiquer votre prénom." };
  }

  const id = randomUUID();
  const assessment = computeAssessment(answers, new Date(), id);
  await assessmentStore.save(assessment);
  // Le rapport entre en file dès la soumission : c'est ce compteur qui pilote
  // le délai annoncé à l'utilisateur (CDC §18). Priorité « gratuit » en phase
  // bêta ; les rapports payants passeront devant en Phase 1B.
  await reportStore.create(assessment, "FREE");

  // Email transactionnel J+0 (CDC §19). Un échec d'envoi ne doit pas priver
  // l'utilisateur de son résultat : il est journalisé, le parcours continue.
  const active = await reportStore.activeCount();
  const sent = await dispatchEmail(
    "J0_CONFIRMATION",
    answers.email,
    emailVariables(assessment, active),
    answers.consentMarketing === true
  );
  if (!sent.ok) {
    console.error(`[email] J+0 non envoyé pour ${id} : ${sent.error}`);
  }

  redirect(`/resultat/${id}`);
}
