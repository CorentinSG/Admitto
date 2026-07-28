/**
 * Séquence de conversion par email (CDC §19) et base légale (CDC §34).
 *
 * Distinction structurante : les emails nécessaires à l'exécution du service
 * reposent sur le contrat et partent toujours ; les emails promotionnels
 * exigent un consentement distinct, facultatif et non pré-coché, et ne partent
 * qu'à ceux qui l'ont donné.
 */

export const EMAIL_KINDS = [
  "J0_CONFIRMATION", // résultat préliminaire, confirmation, délai, lien de correction
  "J2_REPORT", // rapport, résumé, risques, offre recommandée, déduction
  "J5_FOLLOWUP", // email court : des questions ?
  "J12_CONTENT", // ressource liée au risque principal
  "J25_DEDUCTION_EXPIRY", // rappel de la date limite et de l'offre
] as const;

export type EmailKind = (typeof EMAIL_KINDS)[number];

export const LEGAL_BASES = ["CONTRACT", "CONSENT"] as const;
export type LegalBasis = (typeof LEGAL_BASES)[number];

/** Base légale de chaque email. Ne jamais requalifier un promotionnel en transactionnel. */
export const EMAIL_LEGAL_BASIS: Record<EmailKind, LegalBasis> = {
  J0_CONFIRMATION: "CONTRACT",
  J2_REPORT: "CONTRACT",
  J5_FOLLOWUP: "CONTRACT",
  J12_CONTENT: "CONSENT",
  J25_DEDUCTION_EXPIRY: "CONSENT",
};

/** Décalage d'envoi, en jours, depuis la soumission du questionnaire. */
export const EMAIL_OFFSET_DAYS: Record<EmailKind, number> = {
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
