import type { PreliminaryPath } from "@/lib/engine-a/types";

/**
 * Copie de la page de résultat préliminaire (CDC §15).
 * Chaque libellé de voie est un bloc pré-rédigé : aucun texte n'est produit
 * librement, et aucune voie n'emporte de conclusion d'éligibilité.
 */

export const PATH_LABELS: Record<PreliminaryPath, string> = {
  NY_VIA_LLM_SUBJECT_TO_BOLE: "Voie New York via un LL.M., sous réserve du BOLE",
  DIRECT_PATH_TO_EXAMINE: "Voie directe à examiner",
  EDUCATION_LIKELY_INSUFFICIENT: "Formation encore en cours à ce stade",
  ALTERNATIVE_TO_EXAMINE: "Option alternative à examiner",
  HUMAN_REVIEW_REQUIRED: "Situation nécessitant une revue humaine",
  INSUFFICIENT_INFORMATION: "Informations insuffisantes à ce stade",
};

export const result = {
  badge: "✦ RÉSULTAT PRÉLIMINAIRE",
  greeting: (firstName?: string) =>
    firstName ? `${firstName}, voici votre point de départ.` : "Voici votre point de départ.",
  sections: {
    path: "Voie préliminaire",
    partnerships: "Partenariats détectés",
    deadlines: "Principales échéances",
    immigration: "Éléments migratoires généraux",
    costs: "Première fourchette de coût",
    limits: "Limites de cette analyse",
  },
  partnershipsNone:
    "Aucun partenariat n'est enregistré pour votre université à ce jour. Cela ne signifie pas qu'il n'en existe pas : la base est enrichie et vérifiée au fil des diagnostics, et le point sera repris dans votre rapport.",
  partnershipsFound: (n: number) =>
    n === 1
      ? "Un accord confirmé concerne votre université et votre niveau d'études. Ses conditions relèvent de l'université et de la law school, qui décident seules de l'admission."
      : `${n} accords confirmés concernent votre université et votre niveau d'études. Leurs conditions relèvent des universités et des law schools, qui décident seules de l'admission.`,
  partnershipsNoneAtLevel:
    "Des accords existent pour votre université, mais aucun ne correspond au niveau d'études que vous avez indiqué. Ils sont listés ci-dessous à titre d'information.",
  partnershipsToConfirm: (n: number) =>
    n === 1
      ? "Un autre accord est mentionné pour votre université, sans que l'information soit encore suffisamment fiable pour être présentée comme acquise. À confirmer auprès de votre faculté :"
      : `${n} autres accords sont mentionnés pour votre université, sans que l'information soit encore suffisamment fiable pour être présentée comme acquise. À confirmer auprès de votre faculté :`,
  partnershipsAboveLevel: (n: number) =>
    n === 1
      ? "Un accord supplémentaire existe, ouvert à un niveau d'études plus avancé que le vôtre aujourd'hui."
      : `${n} accords supplémentaires existent, ouverts à un niveau d'études plus avancé que le vôtre aujourd'hui.`,
  immigration: {
    LIKELY:
      "Un statut étudiant sera probablement nécessaire pour suivre un LL.M. aux États-Unis. Les conditions, les délais et les pièces relèvent des autorités migratoires américaines, seules compétentes pour se prononcer.",
    TO_CONFIRM:
      "Votre statut actuel doit être confronté à l'usage que vous envisagez : un statut existant ne couvre pas automatiquement des études ou un emploi. Ce point est à confirmer auprès des autorités compétentes.",
    UNLIKELY:
      "Votre nationalité américaine rend la question du visa étudiant sans objet pour ce projet. Les autres démarches du parcours restent inchangées.",
  },
  costsIntro:
    "Ordre de grandeur pour une année de LL.M., à confirmer école par école. Ce n'est pas encore le simulateur détaillé, qui compare des scénarios complets.",
  costsNotIncluded: "Non compris à ce stade :",
  limits: [
    "Ce résultat est préliminaire et repose uniquement sur les réponses que vous venez de donner.",
    "Il ne constitue ni un conseil juridique, ni une détermination d'éligibilité, ni une décision d'une autorité.",
    "Seules les autorités compétentes — universités, New York Board of Law Examiners, autorités migratoires — prennent les décisions officielles.",
    "Les règles évoluent : chaque élément retenu dans votre rapport portera sa source et sa date de vérification.",
  ],
  nextTitle: "La suite",
  nextBody:
    "Votre rapport éducatif et stratégique personnalisé est en préparation. Il détaille les cinq axes de viabilité de votre projet, les risques principaux, les actions permettant de les réduire, votre timeline et vos scénarios de coût.",
  nextDelay: (delay: string) => `Délai annoncé : ${delay}.`,
  nextCta: "Voir ce que contient le rapport",
  emailConfirmation: (email: string) => `Une confirmation vient d'être envoyée à ${email}.`,
  homeCta: "Revenir à l'accueil",
  disclaimer:
    "Ce diagnostic est un produit éducatif et stratégique fondé sur les informations que vous avez communiquées, des sources publiques, des parcours documentés et l'expérience personnelle du fondateur. Il ne constitue pas un conseil juridique, ne crée aucune relation avocat-client et ne vaut décision d'aucune université, autorité de barreau, autorité migratoire ou employeur.",
};
