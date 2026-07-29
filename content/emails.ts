import type { EmailKind } from "@/lib/email/types";

/**
 * Blocs pré-rédigés de la séquence email (CDC §19).
 * Mêmes règles que le rapport : aucun texte produit librement, variables
 * limitées à la liste autorisée de `lib/email/render.ts`.
 */

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
— risque principal identifié : {mainRisk}

L'offre qui correspond à votre situation est {offerName}. Le montant de votre diagnostic, {deductionAmount}, en est déduit jusqu'au {deductionExpiry}.

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
};
