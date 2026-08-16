/**
 * Séquence de conversion par email (CDC §19) et base légale (CDC §34).
 *
 * Distinction structurante : les emails nécessaires à l'exécution du service
 * reposent sur le contrat et partent toujours ; les emails promotionnels
 * exigent un consentement distinct, facultatif et non pré-coché, et ne partent
 * qu'à ceux qui l'ont donné.
 */

/** Séquence de conversion, envoyée à date fixe depuis la soumission (CDC §19). */
export const SEQUENCE_KINDS = [
  "J0_CONFIRMATION", // résultat préliminaire, confirmation, délai, lien de correction
  "J2_REPORT", // rapport, résumé, risques, offre recommandée, déduction
  "J5_FOLLOWUP", // email court : des questions ?
  "J12_CONTENT", // ressource liée au risque principal
  "J25_DEDUCTION_EXPIRY", // rappel de la date limite et de l'offre
] as const;

export type SequenceKind = (typeof SEQUENCE_KINDS)[number];

/**
 * Emails déclenchés par l'état de la feuille de route, sans date fixe (CDC §22).
 * Séparés de la séquence : ils n'ont pas de décalage depuis la soumission, et
 * les mélanger ferait planifier un rappel d'échéance à J+12.
 */
export const TRIGGERED_KINDS = [
  "DEADLINE_NOTICE",
  "BOOKING_CONFIRMATION",
  "BOOKING_REMINDER",
  "BOOKING_SUMMARY",
] as const;

export type TriggeredKind = (typeof TRIGGERED_KINDS)[number];

export const EMAIL_KINDS = [...SEQUENCE_KINDS, ...TRIGGERED_KINDS] as const;

export type EmailKind = SequenceKind | TriggeredKind;

export const LEGAL_BASES = ["CONTRACT", "CONSENT"] as const;
export type LegalBasis = (typeof LEGAL_BASES)[number];

/** Base légale de chaque email. Ne jamais requalifier un promotionnel en transactionnel. */
export const EMAIL_LEGAL_BASIS: Record<EmailKind, LegalBasis> = {
  J0_CONFIRMATION: "CONTRACT",
  J2_REPORT: "CONTRACT",
  J5_FOLLOWUP: "CONTRACT",
  J12_CONTENT: "CONSENT",
  J25_DEDUCTION_EXPIRY: "CONSENT",
  // Rappel d'échéance : exécution du service payé, jamais promotionnel.
  DEADLINE_NOTICE: "CONTRACT",
  /*
   * Confirmation de séance : exécution du service, jamais promotionnel.
   *
   * La qualifier autrement la ferait cesser de partir pour qui n'a pas consenti
   * aux contenus — c'est-à-dire priver d'une confirmation de rendez-vous
   * quelqu'un qui vient de réserver une séance qu'il a payée.
   */
  BOOKING_CONFIRMATION: "CONTRACT",
  /* Rappel de séance : exécution du service, comme la confirmation. */
  BOOKING_REMINDER: "CONTRACT",
  /* Annonce du compte rendu : le livrable de la séance payée. */
  BOOKING_SUMMARY: "CONTRACT",
};

/** Décalage d'envoi, en jours, depuis la soumission du questionnaire. */
export const EMAIL_OFFSET_DAYS: Record<SequenceKind, number> = {
  J0_CONFIRMATION: 0,
  J2_REPORT: 2,
  J5_FOLLOWUP: 5,
  J12_CONTENT: 12,
  J25_DEDUCTION_EXPIRY: 25,
};

export interface ScheduledEmail {
  kind: EmailKind;
  legalBasis: LegalBasis;
  sendAt: string;
}

export interface RenderedEmail {
  subject: string;
  body: string;
  legalBasis: LegalBasis;
}
