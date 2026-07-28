/**
 * Moteur A — faits objectifs et voies préliminaires (CDC §14.1).
 * Le moteur évalue des règles déterministes versionnées. Il ne conclut
 * JAMAIS à une éligibilité définitive.
 */

/** Les 6 catégories de voie préliminaire — liste fermée (CDC §14.1). */
export const PRELIMINARY_PATHS = [
  "NY_VIA_LLM_SUBJECT_TO_BOLE",
  "DIRECT_PATH_TO_EXAMINE",
  "EDUCATION_LIKELY_INSUFFICIENT",
  "ALTERNATIVE_TO_EXAMINE",
  "HUMAN_REVIEW_REQUIRED",
  "INSUFFICIENT_INFORMATION",
] as const;

export type PreliminaryPath = (typeof PRELIMINARY_PATHS)[number];

/** Une règle du Moteur A. Stockée en base, versionnée, éditable sans code (CDC §33). */
export interface Rule {
  id: string;
  /** Condition JSON évaluée contre le profil structuré. */
  condition: RuleCondition;
  /** Fait produit lorsque la condition est vraie. */
  factProduced: string;
  /** Référence du bloc de texte pré-rédigé associé. */
  textBlockId: string;
  /** Source officielle (BOLE, université, autorité migratoire). */
  sourceUrl: string;
  /** Date de dernière vérification de la source. */
  verifiedAt: string;
  version: number;
  active: boolean;
}

export type RuleCondition =
  | { field: string; op: "eq" | "neq" | "in" | "gte" | "lte"; value: unknown }
  | { all: RuleCondition[] }
  | { any: RuleCondition[] };

export interface EngineAOutput {
  path: PreliminaryPath;
  facts: string[];
  /** Identifiants + versions des règles déclenchées (traçabilité, CDC §14.1). */
  firedRules: Array<{ id: string; version: number }>;
}
