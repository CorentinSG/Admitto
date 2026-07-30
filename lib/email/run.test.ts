import { beforeEach, describe, expect, it, vi } from "vitest";
import { computeAssessment } from "@/lib/assessment/compute";
import { assessmentStore } from "@/lib/store/assessments";
import { reportStore } from "@/lib/store/reports";
import { noticeStore } from "@/lib/store/notifications";
import { createDeduction } from "@/lib/payments/deduction";
import type { Answers } from "@/lib/questionnaire/types";
import { MAX_LATE_DAYS, journalId, runEmailSequence } from "./run";

/**
 * Passage d'envoi de la séquence.
 *
 * Les envois sont interceptés au niveau du transport : on vérifie QUI reçoit
 * QUOI et QUAND, pas la mise en forme, déjà couverte par `email.test.ts`.
 *
 * Chaque cas a sa propre adresse. Le passage balaie TOUS les diagnostics du
 * store, partagé entre les tests : compter les envois sans filtrer sur
 * l'adresse mesurerait aussi ceux des tests précédents.
 */

const sent: Array<{ to: string; subject: string }> = [];

vi.mock("./transport", async () => {
  const actual = await vi.importActual<typeof import("./transport")>("./transport");
  return {
    ...actual,
    getTransport: () => ({
      async send(email: { to: string; subject: string }) {
        sent.push({ to: email.to, subject: email.subject });
        return { ok: true };
      },
    }),
  };
});

const ANSWERS: Answers = {
  status: "APPLYING",
  education: "M2",
  university: "assas",
  foreignBar: "NONE",
  careerGoal: "BIG_LAW",
  geoGoal: "KEEP_BOTH",
  budget: "60_100K",
  funding: "BOTH",
  intake: "Y1",
  english: "TEST_TAKEN",
  usStatus: "FR_NO_STATUS",
  firstName: "Camille",
  consentMarketing: true,
};

const SUBMITTED = new Date("2026-07-01T09:00:00.000Z");
const later = (days: number) => new Date(SUBMITTED.getTime() + days * 86_400_000);

/**
 * Suffixe unique par exécution : avec `DATABASE_URL`, les lignes survivent
 * d'un run à l'autre. Des identifiants déterministes rejouaient donc un
 * journal déjà rempli, et plus aucun email n'était dû — la suite passait au
 * vert en ne testant rien.
 */
const RUN = Math.floor(Date.now() % 1_000_000).toString(36);
let counter = 0;

/**
 * Sème un diagnostic dont le J+0 est déjà parti — c'est l'état réel après une
 * soumission, l'action du questionnaire ayant envoyé le J+0 elle-même.
 */
async function seed(options: {
  consent?: boolean;
  /** Rapport rédigé, relu et marqué envoyé depuis le back-office. */
  reportSent?: boolean;
  /** Diagnostic payé : ouvre la déduction de trente jours. */
  paid?: boolean;
} = {}) {
  const id = `seq-${RUN}-${++counter}`;
  const email = `${id}@example.com`;
  const assessment = computeAssessment(
    { ...ANSWERS, email, consentMarketing: options.consent ?? true },
    SUBMITTED,
    id
  );
  await assessmentStore.save({ ...assessment, createdAt: SUBMITTED.toISOString() });
  await noticeStore.markSent(id, journalId("J0_CONFIRMATION"));

  await reportStore.create(assessment);
  if (options.paid) await reportStore.markPaid(id, createDeduction(7_900, SUBMITTED));
  if (options.reportSent) await reportStore.setStatus(id, "SENT", later(1).toISOString());

  return { id, email };
}

const to = (email: string) => sent.filter((m) => m.to === email);

beforeEach(() => {
  sent.length = 0;
});

describe("séquence J+0 → J+25", () => {
  it("n'envoie rien avant la première échéance", async () => {
    const { email } = await seed({ reportSent: true, paid: true });
    await runEmailSequence(later(1));
    expect(to(email)).toHaveLength(0);
  });

  it("envoie le J+2 le moment venu, une seule fois", async () => {
    const { email } = await seed({ reportSent: true, paid: true });

    await runEmailSequence(later(2));
    expect(to(email)).toHaveLength(1);

    // Le journal empêche le doublon : c'est lui, et non un état en mémoire,
    // qui porte l'idempotence.
    sent.length = 0;
    await runEmailSequence(later(2));
    expect(to(email)).toHaveLength(0);
  });

  it("n'annonce pas un rapport qui n'a pas été envoyé", async () => {
    // Le rapport est rédigé à la main : à J+2 il peut ne pas être prêt.
    // « Votre rapport est prêt » serait alors une fausse affirmation.
    const { email } = await seed({ paid: true });
    await runEmailSequence(later(2));

    // Assertion portée par l'adresse et non par le compteur du résumé : le
    // passage balaie tous les diagnostics de la base, et un compteur global
    // serait satisfait par n'importe quel autre profil.
    expect(to(email)).toHaveLength(0);
  });

  it("envoie le J+2 dès que le rapport part, même en retard", async () => {
    const { id, email } = await seed({ paid: true });

    // Trois jours sans rapport : rien ne part, et rien n'est consommé.
    await runEmailSequence(later(2));
    expect(to(email)).toHaveLength(0);

    await reportStore.setStatus(id, "SENT", later(4).toISOString());
    sent.length = 0;
    await runEmailSequence(later(4));
    // Marquer l'email envoyé au premier passage l'aurait perdu définitivement.
    expect(to(email)).toHaveLength(1);
  });

  it("n'annonce aucune expiration de déduction en l'absence de paiement", async () => {
    // Sans diagnostic payé il n'y a rien à faire expirer : annoncer une
    // échéance inexistante fabriquerait une urgence.
    const { email } = await seed({ reportSent: true });
    await runEmailSequence(later(25));
    expect(to(email).some((m) => m.subject.includes("déduction"))).toBe(false);
  });

  it("n'envoie aucun email promotionnel sans consentement", async () => {
    const { email } = await seed({ consent: false, reportSent: true, paid: true });

    // Passages successifs, comme un déclencheur quotidien : un seul passage à
    // J+12 laisserait le J+2 hors délai et ne prouverait rien du consentement.
    for (const day of [2, 5, 12, 25]) await runEmailSequence(later(day));

    // J+2 et J+5 sont contractuels et partent ; J+12 et J+25 reposent sur le
    // consentement et ne partent pas.
    expect(to(email)).toHaveLength(2);
  });

  it("cesse d'envoyer après un retrait de consentement", async () => {
    const { id, email } = await seed({ reportSent: true, paid: true });
    await noticeStore.markSent(id, journalId("J2_REPORT"));
    await noticeStore.markSent(id, journalId("J5_FOLLOWUP"));
    await assessmentStore.unsubscribe(id);

    await runEmailSequence(later(12));
    // Le calendrier est recalculé à chaque passage : figé à la soumission, il
    // réclamerait encore le J+12 malgré le retrait.
    expect(to(email)).toHaveLength(0);
  });

  it("ne rattrape pas un email trop en retard", async () => {
    const { email } = await seed({ reportSent: true, paid: true });

    // Premier passage très tardif : sans borne, toute la séquence partirait
    // d'un coup, dont un rapport annoncé « prêt » dix jours après l'être.
    // Les emails encore dans la fenêtre partent, eux : la borne écarte ce qui
    // a manqué son moment, pas la séquence entière.
    await runEmailSequence(later(2 + MAX_LATE_DAYS + 1));
    expect(to(email).some((m) => m.subject.includes("rapport personnalisé"))).toBe(false);
  });

  it("n'écarte pas un email juste en retard", async () => {
    const { email } = await seed({ reportSent: true, paid: true });

    // Une panne de déclencheur de quelques jours ne doit rien faire perdre.
    await runEmailSequence(later(2 + MAX_LATE_DAYS - 1));
    expect(to(email).length).toBeGreaterThan(0);
  });

  it("ignore un diagnostic sans adresse", async () => {
    const id = `seq-${RUN}-${++counter}`;
    const assessment = computeAssessment({ ...ANSWERS, email: undefined }, SUBMITTED, id);
    await assessmentStore.save({ ...assessment, createdAt: SUBMITTED.toISOString() });

    const summary = await runEmailSequence(later(2));
    // Un diagnostic sans adresse est ignoré, pas compté en échec : un profil
    // anonyme du régime mémoire ne doit pas faire échouer un passage.
    expect(summary.failed).toBe(0);
  });
});

describe("retrait de consentement", () => {
  it("est idempotent et n'efface pas la réponse d'origine", async () => {
    const { id } = await seed();

    expect(await assessmentStore.isUnsubscribed(id)).toBe(false);
    await assessmentStore.unsubscribe(id);
    await assessmentStore.unsubscribe(id);
    expect(await assessmentStore.isUnsubscribed(id)).toBe(true);

    // La réponse reste la preuve de ce qui a été consenti : l'écraser
    // rendrait impossible de démontrer que le consentement avait été recueilli.
    const stored = await assessmentStore.get(id);
    expect(stored?.answers.consentMarketing).toBe(true);
  });

  it("rend false pour un diagnostic inconnu, sans lever", async () => {
    expect(await assessmentStore.unsubscribe("inexistant")).toBe(false);
  });
});
