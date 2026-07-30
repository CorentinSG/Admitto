"use server";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { computeAssessment } from "@/lib/assessment/compute";
import { liveMatrices } from "@/lib/matrices/load";
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
import { UNIVERSITY_IDS } from "@/content/universities";
import { callerIp, checkRateLimit } from "@/lib/security/rate-limit";
import { security } from "@/content/security";
import {
  boundedText,
  validEmail,
  MAX_COMMENT,
  MAX_FIRST_NAME,
} from "@/lib/questionnaire/limits";

/**
 * Soumission du questionnaire. Les réponses arrivent du client : elles sont
 * revalidées ici contre les unions fermées du CDC — jamais de valeur libre
 * acceptée telle quelle.
 */

const oneOf = <T extends string>(list: readonly T[], value: unknown): T | undefined =>
  typeof value === "string" && (list as readonly string[]).includes(value) ? (value as T) : undefined;

function parseAnswers(raw: Record<string, unknown>): Answers {
  // Bornes dans lib/ : le prénom est repris dans le sujet de chaque email et
  // dans le titre du rapport, l'adresse sert de clé au compteur de tentatives.
  // Ni l'un ni l'autre n'était borné, sur un formulaire public et anonyme.
  const email = validEmail(raw.email);
  const firstName = boundedText(raw.firstName, MAX_FIRST_NAME);
  const comment = boundedText(raw.comment, MAX_COMMENT);

  return {
    status: oneOf(JOURNEY_STATUS, raw.status),
    education: oneOf(EDUCATION, raw.education),
    university:
      typeof raw.university === "string" && UNIVERSITY_IDS.includes(raw.university)
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
    firstName,
    email,
    // Minimisation : le champ libre est plafonné, il n'a pas vocation à
    // recueillir de données sensibles (CDC §29, §34).
    comment,
    // Consentement marketing : accepté seulement s'il vaut littéralement true.
    // Toute autre valeur (absente, chaîne, 0) vaut refus (CDC §34).
    consentMarketing: raw.consentMarketing === true,
  };
}

export async function submitQuestionnaire(raw: Record<string, unknown>) {
  const answers = parseAnswers(raw);

  // `validEmail` a déjà écarté ce qui n'a pas la forme d'une adresse ou
  // dépasse la longueur admise par la RFC : il ne reste qu'à constater
  // l'absence, et le message est le même dans les deux cas — dire « trop
  // longue » à quelqu'un qui a fait une faute de frappe n'aiderait personne.
  if (!answers.email) {
    return { error: "Merci d'indiquer une adresse email valide." };
  }
  if (!answers.firstName) {
    return { error: "Merci d'indiquer votre prénom." };
  }

  // Plafond avant toute écriture et tout envoi : une soumission refusée ne doit
  // ni entrer en file, ni faire partir d'email vers l'adresse fournie.
  const limit = await checkRateLimit("DIAGNOSTIC", {
    ip: callerIp(await headers()),
    email: answers.email,
  });
  if (!limit.ok) return { error: security.tooManyAttempts(limit.retryAfterMinutes) };

  const id = randomUUID();
  // Règles et blocs de voie en vigueur MAINTENANT (CDC §33) : une règle
  // activée depuis le back-office gouverne le diagnostic suivant sans commit.
  const now = new Date();
  const assessment = computeAssessment(answers, now, id, await liveMatrices(now));
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
