import { fireRules, type StructuredProfile } from "./evaluate";
import { RULES, TEXT_BLOCKS } from "./rules.seed";
import type { EngineAOutput, PreliminaryPath, Rule } from "./types";

/**
 * Moteur A — exécution (CDC §14.1).
 *
 * Priorité entre voies : une information manquante l'emporte sur tout, puis les
 * constats structurels, puis les voies de droit. À défaut de règle déclenchée,
 * la sortie est « revue humaine » — jamais une conclusion par défaut.
 *
 * Le moteur ne conclut JAMAIS à une éligibilité définitive.
 */

/** Du plus prioritaire au moins prioritaire. */
const PATH_PRIORITY: PreliminaryPath[] = [
  "INSUFFICIENT_INFORMATION",
  "HUMAN_REVIEW_REQUIRED",
  "EDUCATION_LIKELY_INSUFFICIENT",
  "DIRECT_PATH_TO_EXAMINE",
  "NY_VIA_LLM_SUBJECT_TO_BOLE",
  "ALTERNATIVE_TO_EXAMINE",
];

export function runEngineA(
  profile: StructuredProfile,
  rules: Rule[] = RULES
): EngineAOutput & { textBlocks: string[] } {
  const fired = fireRules(rules, profile);

  const paths = fired
    .map((f) => f.fact as PreliminaryPath)
    .filter((p): p is PreliminaryPath => PATH_PRIORITY.includes(p));

  const path =
    PATH_PRIORITY.find((candidate) => paths.includes(candidate)) ?? "HUMAN_REVIEW_REQUIRED";

  const textBlocks = fired
    .filter((f) => f.fact === path)
    .map((f) => TEXT_BLOCKS[f.textBlockId])
    .filter(Boolean);

  return {
    path,
    facts: fired.map((f) => f.fact),
    // Traçabilité exigée par le CDC : identifiant + version de chaque règle
    // déclenchée, figés dans l'évaluation.
    firedRules: fired.map((f) => ({ id: f.id, version: f.version })),
    textBlocks: textBlocks.length ? textBlocks : [TEXT_BLOCKS["TB-HUMAN-REVIEW"]],
  };
}

/** Règles actives dépourvues de vérification : doit toujours être vide. */
export function unverifiedActiveRules(rules: Rule[] = RULES): Rule[] {
  return rules.filter((r) => r.active && (!r.verifiedAt || !r.sourceUrl));
}
