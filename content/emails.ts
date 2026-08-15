import type { EmailKind } from "@/lib/email/types";

/**
 * Blocs pré-rédigés de la séquence email (CDC §19).
 * Mêmes règles que le rapport : aucun texte produit librement, variables
 * limitées à la liste autorisée de `lib/email/render.ts`.
 */

/**
 * Fragments du J+2 qui dépendent de l'état du dossier.
 *
 * Ils sont ici, avec le reste de la copie, plutôt que construits dans la
 * logique d'envoi — c'est la règle du CDC §19 : aucun texte produit librement.
 *
 * Deux situations ne pouvaient pas être écrites dans un gabarit unique :
 *
 * - **Aucun axe fragile.** Mesuré sur 18 900 rapports : 14 % des profils n'en
 *   ont aucun. Le gabarit écrivait alors « risque principal identifié : » suivi
 *   de rien. Un rapport solide n'a pas de ligne vide à afficher, il a autre
 *   chose à dire.
 * - **Aucune déduction.** En régime Phase 1A le diagnostic est gratuit, donc
 *   aucun montant n'est déductible. L'email exigeait pourtant la déduction pour
 *   se rendre, si bien qu'il n'aurait jamais été envoyé — et que le J+5, lui,
 *   serait parti demander si le rapport avait été lu.
 */
export const J2_FRAGMENTS = {
  riskLine: (mainRisk: string) => `— risque principal identifié : ${mainRisk}`,
  riskLineNone: "— aucun axe ne ressort comme fragile : l'enjeu est l'exécution",
  offerWithDeduction: (offerName: string, amount: string, expiry: string) =>
    `L'offre qui correspond à votre situation est ${offerName}. Le montant de votre diagnostic, ${amount}, en est déduit jusqu'au ${expiry}.`,
  offerWithoutDeduction: (offerName: string) =>
    `L'offre qui correspond à votre situation est ${offerName}. Le diagnostic vous a été offert : il n'y a donc aucun montant à déduire.`,
};

export const EMAIL_TEMPLATES: Record<EmailKind, { subject: string; body: string }> = {
  J0_CONFIRMATION: {
    subject: "Votre résultat préliminaire — Admitto",
    body: `Bonjour {firstName},

Votre résultat préliminaire est disponible : {resultUrl}

Il reprend la voie préliminaire identifiée, les partenariats détectés, vos principales échéances, les éléments migratoires généraux et une première fourchette de coût.

Votre rapport éducatif et stratégique personnalisé est en préparation. Délai annoncé : {delay}.

Une information à corriger ? Répondez simplement à cet email : votre rapport n'est pas encore rédigé, la correction sera prise en compte.

Corentin Saint-Girons
Founder`,
  },

  J2_REPORT: {
    subject: "Votre rapport personnalisé — Admitto",
    body: `Bonjour {firstName},

Votre rapport est prêt : {reportUrl}

En résumé :
— voie préliminaire : {pathLabel}
— viabilité du projet : {verdictTitle}
{riskLine}

{offerParagraph}

Ce rapport est un produit éducatif et stratégique. Il ne constitue pas un conseil juridique et ne vaut décision d'aucune autorité.

Corentin Saint-Girons
Founder`,
  },

  J5_FOLLOWUP: {
    subject: "Des questions sur votre rapport ?",
    body: `Bonjour {firstName},

Avez-vous eu le temps de lire votre rapport ?

Si un point demande une précision, répondez à cet email. Je lis chaque réponse.

Corentin Saint-Girons
Founder`,
  },

  J12_CONTENT: {
    subject: "Une ressource sur votre point de vigilance principal",
    body: `Bonjour {firstName},

Votre rapport identifiait un point de vigilance prioritaire : {mainRisk}.

Voici une ressource qui traite précisément ce point : {resourceUrl}

Vous recevez cet email parce que vous avez accepté de recevoir nos contenus. Vous pouvez vous désinscrire à tout moment : {unsubscribeUrl}

Corentin Saint-Girons
Founder`,
  },

  J25_DEDUCTION_EXPIRY: {
    subject: "Votre déduction expire le {deductionExpiry}",
    body: `Bonjour {firstName},

La déduction de {deductionAmount} sur l'offre {offerName} expire le {deductionExpiry}.

Passé cette date, l'offre reste accessible au tarif plein. Aucune relance supplémentaire ne vous sera envoyée à ce sujet.

Vous recevez cet email parce que vous avez accepté de recevoir nos contenus. Vous pouvez vous désinscrire à tout moment : {unsubscribeUrl}

Corentin Saint-Girons
Founder`,
  },

  DEADLINE_NOTICE: {
    subject: "Échéance : {taskTitle}",
    body: `Bonjour {firstName},

{taskTitle} {noticeLead}.

{deadlineList}

Ces dates sont calculées à rebours de la rentrée que vous visez. Si votre calendrier a changé, mettez-le à jour depuis votre feuille de route : les échéances suivantes se recalculeront.

Voir votre feuille de route : {dashboardUrl}

Ce rappel fait partie du service auquel vous avez souscrit. Il ne vous est pas envoyé à des fins promotionnelles.

Corentin Saint-Girons
Founder`,
  },

  /*
   * Confirmation de séance (CDC §31).
   *
   * Réserver une séance ne produisait AUCUN email : la personne venait de poser
   * un rendez-vous et n'avait rien à mettre dans son agenda, rien à retrouver
   * dans sa boîte. Pour le seul rendez-vous humain du produit, et le plus cher,
   * c'est la confirmation qui fait exister le service.
   *
   * L'heure porte son fuseau, comme à l'écran : « 14:00 » sans fuseau dans un
   * email est une heure que le destinataire doit deviner.
   *
   * Le périmètre EXCLU figure dans le corps, pas seulement les inclusions. Un
   * périmètre qui n'énonce que ce qu'il couvre se lit comme ouvert — c'est ainsi
   * qu'une séance de méthode devient, dans l'esprit de la personne, une
   * relecture juridique (CDC §30).
   */
  BOOKING_CONFIRMATION: {
    subject: "Séance confirmée — {consultationName}",
    body: `Bonjour {firstName},

Votre séance est réservée.

{consultationName}
{slotLabel}

Ce que cette séance couvre :
{consultationCovers}

Ce qu'elle ne couvre pas :
{consultationExcludes}

Vous pouvez annuler ou reprogrammer depuis votre espace : {consultationsUrl}

Cette confirmation fait partie du service auquel vous avez souscrit. Elle ne vous est pas envoyée à des fins promotionnelles.

Corentin Saint-Girons
Founder`,
  },
};
