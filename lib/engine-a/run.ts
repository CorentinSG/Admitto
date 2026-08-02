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

/**
 * Du plus prioritaire au moins prioritaire.
 *
 * `NY_VIA_LLM_SUBJECT_TO_BOLE` passe DEVANT `DIRECT_PATH_TO_EXAMINE` depuis la
 * vérification du 2026-08-01. L'ordre inverse disait le contraire du texte : un
 * profil admis à un barreau étranger recevait la voie directe et jamais la voie
 * LL.M., alors que le § 520.6(b)(2) exige un LL.M. en plus de l'admission
 * étrangère — et qu'il est réservé aux systèmes de common law. La voie qui
 * suppose le plus de conditions ne peut pas primer celle qui en suppose moins :
 * elle en est un cas particulier, pas une dispense.
 *
 * Depuis le 2026-08-02, `DIRECT_PATH_TO_EXAMINE` n'est plus produite par aucune
 * règle : ni le § 520.6(b)(2) ni le § 520.10 ne décrivent une voie qui se passe
 * d'un passage aux États-Unis. Sa place ici n'est donc plus qu'une réponse à la
 * question « et si une règle la produisait un jour ».
 */
const PATH_PRIORITY: PreliminaryPath[] = [
  "INSUFFICIENT_INFORMATION",
  "HUMAN_REVIEW_REQUIRED",
  "EDUCATION_LIKELY_INSUFFICIENT",
  "NY_VIA_LLM_SUBJECT_TO_BOLE",
  "DIRECT_PATH_TO_EXAMINE",
  "ALTERNATIVE_TO_EXAMINE",
];

export function runEngineA(
  profile: StructuredProfile,
  rules: Rule[] = RULES,
  // Blocs de voie éditables sans code (CDC §33) : le défaut reste le fichier.
  blocks: Record<string, string> = TEXT_BLOCKS
): EngineAOutput & { textBlocks: string[] } {
  const fired = fireRules(rules, profile);

  const paths = fired
    .map((f) => f.fact as PreliminaryPath)
    .filter((p): p is PreliminaryPath => PATH_PRIORITY.includes(p));

  const path =
    PATH_PRIORITY.find((candidate) => paths.includes(candidate)) ?? "HUMAN_REVIEW_REQUIRED";

  const textBlocks = fired
    .filter((f) => f.fact === path)
    .map((f) => blocks[f.textBlockId] ?? TEXT_BLOCKS[f.textBlockId])
    .filter(Boolean);

  return {
    path,
    facts: fired.map((f) => f.fact),
    // Traçabilité exigée par le CDC : identifiant + version de chaque règle
    // déclenchée, figés dans l'évaluation.
    firedRules: fired.map((f) => ({ id: f.id, version: f.version })),
    textBlocks: textBlocks.length
      ? textBlocks
      : [blocks["TB-HUMAN-REVIEW"] ?? TEXT_BLOCKS["TB-HUMAN-REVIEW"]],
  };
}

/** Règles actives dépourvues de vérification : doit toujours être vide. */
export function unverifiedActiveRules(rules: Rule[] = RULES): Rule[] {
  return rules.filter((r) => r.active && (!r.verifiedAt || !r.sourceUrl));
}
