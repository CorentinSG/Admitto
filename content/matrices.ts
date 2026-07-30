import type { BlockRefusal } from "@/lib/matrices/blocks";
import type { RuleRefusal } from "@/lib/matrices/rules";

/** Copie du back-office des matrices (CDC §33). */
export const matrices = {
  title: "Matrices",
  intro:
    "Règles du Moteur A et blocs de texte du rapport, éditables sans déploiement. Chaque enregistrement crée une révision — rien n'est écrasé, et les rapports déjà produits citent les blocs tels qu'ils étaient à leur date.",

  rules: {
    title: "Règles du Moteur A",
    intro:
      "La condition d'une règle reste dans le code : ce qui s'édite ici est son activation, sa source et sa date de vérification. Une règle ne peut pas être activée sans les deux — c'est la même exigence que le garde-fou du dépôt.",
    active: "Active",
    inactive: "Inactive",
    source: "Source officielle",
    verifiedAt: "Vérifiée le",
    version: (v: number) => `version ${v}`,
    revised: (n: number, at: string) => `révision ${n} du ${at}`,
    fromCode: "état du code, jamais révisée",
    produces: "Produit",
    condition: "Condition (code)",
    save: "Enregistrer la règle",
    saved: "Révision enregistrée.",
  },

  blocks: {
    title: "Blocs de texte",
    intro:
      "Textes du résultat immédiat et du rapport. Le vocabulaire interdit et les variables y sont refusés à l'enregistrement : un bloc qui promet un résultat n'existera jamais, même une seconde.",
    families: {
      VOIE: "Résultat immédiat — voies préliminaires",
      VERDICT: "Rapport — verdicts",
      RISK: "Rapport — risques et actions",
    },
    titleField: "Titre",
    textField: "Texte",
    bodyField: "Corps",
    actionsField: "Actions correctrices (une par ligne)",
    save: "Enregistrer le bloc",
    saved: "Révision enregistrée.",
    revised: (n: number, at: string) => `révision ${n} du ${at}`,
    fromCode: "état du code, jamais révisé",
  },

  errors: {
    access: "Session expirée ou rôle insuffisant.",
  },
} as const;

export const RULE_REFUSAL_MESSAGES: Record<RuleRefusal["reason"], string> = {
  UNKNOWN_RULE: "Cette règle n'existe pas dans le code.",
  ACTIVE_WITHOUT_SOURCE:
    "Une règle ne peut pas être activée sans source officielle. Renseignez la source, ou laissez la règle inactive.",
  ACTIVE_WITHOUT_VERIFICATION:
    "Une règle ne peut pas être activée sans date de vérification : la confronter à sa source EST le travail qui autorise l'activation.",
  INVALID_DATE: "Cette date n'existe pas. Format attendu : AAAA-MM-JJ.",
  VERIFIED_IN_FUTURE:
    "La date de vérification est dans le futur. Une vérification prévue n'est pas une vérification faite.",
};

export const BLOCK_REFUSAL_MESSAGES: Record<BlockRefusal["reason"], (detail?: string) => string> =
  {
    UNKNOWN_KEY: () => "Ce bloc n'existe pas.",
    WRONG_SHAPE: () => "Le contenu ne correspond pas à la forme de ce bloc.",
    EMPTY_PART: (d) => `Une partie du bloc est vide : ${d}.`,
    TOO_LONG: (d) => `Une partie du bloc dépasse la longueur admise : ${d}.`,
    TOO_MANY_ACTIONS: () => "Trop d'actions : six au maximum, les plus utiles d'abord.",
    PLACEHOLDER: (d) =>
      `Ce bloc ne passe par aucune substitution : « ${d} » serait affiché tel quel au lecteur.`,
    FORBIDDEN_VOCABULARY: (d) => `Vocabulaire refusé. ${d}`,
  };
