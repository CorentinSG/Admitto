import { assessmentStore } from "@/lib/store/assessments";
import { reportStore } from "@/lib/store/reports";
import { noticeStore } from "@/lib/store/notifications";
import { baseUrl, dispatchEmail, emailVariables } from "./dispatch";
import { eligibility } from "./eligibility";
import { dueEmails, scheduleSequence } from "./schedule";
import { EMAIL_OFFSET_DAYS, type SequenceKind } from "./types";
import { log } from "@/lib/observability/log";

/**
 * Passage d'envoi de la séquence J+0 → J+25 (CDC §19).
 *
 * Jusqu'ici, `scheduleSequence` et `dueEmails` existaient, étaient testés, et
 * personne ne les appelait : seul le J+0 partait, depuis la soumission du
 * questionnaire. Les quatre suivants — dont le J+2 qui porte le rapport —
 * n'ont jamais quitté le produit. La séquence de conversion du CDC §19 était
 * écrite et morte.
 *
 * Quatre règles portent l'implémentation :
 *
 * 1. **Le calendrier est recalculé à chaque passage, jamais figé.** Retirer son
 *    consentement doit suffire à annuler les envois restants ; un calendrier
 *    figé à la soumission continuerait de les réclamer.
 *
 * 2. **Le consentement effectif est la réponse ET l'absence de retrait.** Voir
 *    `assessmentStore.unsubscribe` : la réponse d'origine reste la preuve.
 *
 * 3. **Le journal n'est écrit qu'après un envoi réussi**, comme les rappels
 *    d'échéance : un échec de transport laisse l'email dû et le passage suivant
 *    le reprend.
 *
 * 4. **Aucun rattrapage en masse.** Un email dont la date est dépassée de plus
 *    de `MAX_LATE_DAYS` n'est plus envoyé. Sans cette borne, brancher le
 *    déclencheur pour la première fois expédierait d'un coup toute la séquence
 *    à des mois d'anciens diagnostics — un J+25 « votre déduction expire »
 *    arrivant six mois trop tard n'informe personne et abîme la confiance.
 *
 * 5. **Un email n'est envoyé que si ce qu'il affirme est vrai** — voir
 *    `eligibility.ts`. Un email non éligible n'est PAS marqué envoyé : sa
 *    condition peut devenir vraie plus tard, et le rapport marqué envoyé au
 *    quatrième jour doit encore déclencher le J+2.
 */

/**
 * Au-delà, l'email a manqué son moment. Sept jours laissent passer une panne de
 * déclencheur d'une semaine sans rien perdre d'utile.
 */
export const MAX_LATE_DAYS = 7;

/**
 * Ancienneté au-delà de laquelle un diagnostic ne peut plus rien recevoir.
 *
 * Le dernier email de la séquence part à J+25, et rien de plus tardif que
 * `MAX_LATE_DAYS` n'est expédié : passé J+32, la liste des emails dus est vide
 * par construction. Le passage balayait pourtant TOUS les diagnostics jamais
 * soumis, à chaque tour, et lisait le journal de chacun pour découvrir à chaque
 * fois qu'il n'y avait rien à faire. Le coût du passage grandissait avec
 * l'histoire du produit, non avec son activité — un déclencheur horaire sur
 * cinquante mille diagnostics, c'est cinquante mille lectures par heure pour
 * n'envoyer aucun email.
 *
 * La borne est CALCULÉE depuis le calendrier, jamais écrite en dur : ajouter un
 * J+40 à la séquence sans y penser rendrait sinon cet email impossible — le
 * défaut exact que trois emails de cette séquence portaient déjà.
 */
export const SEQUENCE_SPAN_DAYS = Math.max(...Object.values(EMAIL_OFFSET_DAYS)) + MAX_LATE_DAYS;

/** Préfixe du journal : la séquence partage la table des rappels envoyés. */
const JOURNAL_PREFIX = "SEQ:";

export const journalId = (kind: SequenceKind) => `${JOURNAL_PREFIX}${kind}`;

export interface SequenceSummary {
  /** Emails dus au moment du passage. */
  due: number;
  sent: number;
  /** Écartés : date trop ancienne, consentement retiré. */
  skipped: number;
  /** En attente : ce que l'email affirme n'est pas encore vrai. */
  waiting: number;
  failed: number;
}

export async function runEmailSequence(reference: Date): Promise<SequenceSummary> {
  const summary: SequenceSummary = { due: 0, sent: 0, skipped: 0, waiting: 0, failed: 0 };
  const activeReports = await reportStore.activeCount();
  const url = baseUrl();
  const floor = new Date(reference.getTime() - MAX_LATE_DAYS * 86_400_000).toISOString();

  // Bornée : au-delà de la portée de la séquence, aucun email ne peut plus
  // être dû. Voir `SEQUENCE_SPAN_DAYS`.
  const oldest = new Date(reference.getTime() - SEQUENCE_SPAN_DAYS * 86_400_000);

  for (const assessment of await assessmentStore.createdSince(oldest)) {
    const email = assessment.answers.email;
    if (!email) continue;

    const consent =
      assessment.answers.consentMarketing === true &&
      !(await assessmentStore.isUnsubscribed(assessment.id));

    const schedule = scheduleSequence(new Date(assessment.createdAt), consent);
    const journal = await noticeStore.sent(assessment.id);
    const alreadySent = journal
      .filter((id) => id.startsWith(JOURNAL_PREFIX))
      .map((id) => id.slice(JOURNAL_PREFIX.length));

    const due = dueEmails(schedule, alreadySent, reference);
    summary.due += due.length;

    for (const scheduled of due) {
      if (scheduled.sendAt < floor) {
        // Trop tard pour être utile. Marqué envoyé pour ne pas rester dû
        // indéfiniment et faire grossir le décompte à chaque passage.
        await noticeStore.markSent(assessment.id, journalId(scheduled.kind as SequenceKind));
        summary.skipped += 1;
        continue;
      }

      const kind = scheduled.kind as SequenceKind;
      const verdict = await eligibility(kind, {
        assessment,
        // L'identifiant du rapport EST celui du diagnostic (voir
        // `reportStore.create`) : pas de recherche par relation à ajouter.
        report: await reportStore.get(assessment.id),
        baseUrl: url,
        now: reference,
      });

      if (!verdict.ok) {
        // Volontairement NON marqué envoyé : la condition peut devenir vraie
        // plus tard. Un rapport marqué envoyé le quatrième jour doit encore
        // déclencher le J+2 — la borne de retard s'en chargera si elle ne
        // l'est jamais.
        summary.waiting += 1;
        continue;
      }

      const result = await dispatchEmail(
        kind,
        email,
        { ...emailVariables(assessment, activeReports), ...verdict.variables },
        consent
      );

      if (result.ok && result.skipped === "CONSENT") {
        summary.skipped += 1;
        continue;
      }
      if (result.ok) {
        await noticeStore.markSent(assessment.id, journalId(kind));
        summary.sent += 1;
      } else {
        summary.failed += 1;
      }
    }
  }


  // `failed` élève le niveau : un email de la séquence qui ne part pas est
  // une promesse non tenue — le J+2 porte le rapport, le J+25 annonce une
  // expiration. Les compteurs seuls, jamais une adresse.
  log(summary.failed > 0 ? "warn" : "info", "email.sequence.done", { ...summary });
  return summary;
}
