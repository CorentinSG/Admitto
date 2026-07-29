import {
  EMAIL_LEGAL_BASIS,
  EMAIL_OFFSET_DAYS,
  SEQUENCE_KINDS,
  type ScheduledEmail,
} from "./types";

/**
 * Calendrier d'envoi de la séquence (CDC §19).
 *
 * Un email dont la base légale est le consentement n'est planifié que si le
 * consentement marketing a été donné. Le retirer plus tard doit suffire à
 * annuler les envois restants : la planification est donc recalculée, jamais
 * figée à la soumission.
 */
export function scheduleSequence(
  submittedAt: Date,
  consentMarketing: boolean
): ScheduledEmail[] {
  // Seule la séquence est planifiée ici : les rappels d'échéance sont
  // déclenchés par l'état de la feuille de route, pas par une date de départ.
  return SEQUENCE_KINDS.filter(
    (kind) => EMAIL_LEGAL_BASIS[kind] === "CONTRACT" || consentMarketing
  ).map((kind) => {
    const sendAt = new Date(submittedAt);
    sendAt.setUTCDate(sendAt.getUTCDate() + EMAIL_OFFSET_DAYS[kind]);
    return { kind, legalBasis: EMAIL_LEGAL_BASIS[kind], sendAt: sendAt.toISOString() };
  });
}

/** Emails dus à une date donnée et pas encore envoyés. */
export function dueEmails(
  schedule: ScheduledEmail[],
  alreadySent: string[],
  now: Date
): ScheduledEmail[] {
  return schedule.filter((e) => e.sendAt <= now.toISOString() && !alreadySent.includes(e.kind));
}
