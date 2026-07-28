/**
 * Moteur B — viabilité du projet (CDC §14.2–14.4).
 * 5 axes notés 1–4, verdict PLAFONNÉ (jamais une simple moyenne).
 * Les verdicts sont qualitatifs : jamais de pourcentage ni de chance chiffrée.
 */

export const AXES = [
  "ACADEMIC_STRENGTH",
  "FINANCIAL_FIT",
  "PROFESSIONAL_REALISM",
  "TIMELINE_FEASIBILITY",
  "IMMIGRATION_RISK",
] as const;

export type Axis = (typeof AXES)[number];
export type AxisScore = 1 | 2 | 3 | 4;
export type AxisScores = Record<Axis, AxisScore>;

/** Les 6 verdicts — liste fermée (CDC §14.4). */
export const VERDICTS = [
  "HIGHLY_RELEVANT", // Projet fortement pertinent
  "VIABLE_WITH_MAJOR_PLANNING", // Projet viable avec planification importante
  "POSSIBLE_BUT_RISKY", // Projet possible mais risqué
  "PREMATURE", // Projet prématuré
  "NOT_CURRENTLY_RECOMMENDED", // Projet actuellement non recommandé
  "NEEDS_CLARIFICATION", // Projet à clarifier avant évaluation
] as const;

export type Verdict = (typeof VERDICTS)[number];

export interface VerdictInput {
  scores: AxisScores;
  /** Timeline critique : impose de viser une rentrée ultérieure (CDC §14.3). */
  timelineCritical: boolean;
  /** Objectif professionnel trop flou → « à clarifier ». */
  goalTooVague: boolean;
}

/**
 * Règles de plafonnement (CDC §14.3) :
 * - un axe à 1/4 empêche « fortement pertinent » ;
 * - deux axes faibles (≤2) imposent au minimum « planification importante » ;
 * - un objectif trop flou produit « à clarifier ».
 * Le drapeau timelineCritical est retourné tel quel : il déplace la rentrée,
 * il ne change pas le verdict à lui seul.
 */
export function computeVerdict(input: VerdictInput): { verdict: Verdict; shiftIntake: boolean } {
  const { scores, timelineCritical, goalTooVague } = input;

  if (goalTooVague) return { verdict: "NEEDS_CLARIFICATION", shiftIntake: timelineCritical };

  const values = AXES.map((a) => scores[a]);
  const hasBlocking = values.some((v) => v === 1);
  const weakCount = values.filter((v) => v <= 2).length;
  const average = values.reduce((s, v) => s + v, 0) / values.length;

  let verdict: Verdict;
  if (average >= 3.5) verdict = "HIGHLY_RELEVANT";
  else if (average >= 2.8) verdict = "VIABLE_WITH_MAJOR_PLANNING";
  else if (average >= 2.2) verdict = "POSSIBLE_BUT_RISKY";
  else if (average >= 1.8) verdict = "PREMATURE";
  else verdict = "NOT_CURRENTLY_RECOMMENDED";

  // Plafonnements — un facteur bloquant l'emporte sur la moyenne.
  if (hasBlocking && verdict === "HIGHLY_RELEVANT") verdict = "VIABLE_WITH_MAJOR_PLANNING";
  if (weakCount >= 2 && verdict === "HIGHLY_RELEVANT") verdict = "VIABLE_WITH_MAJOR_PLANNING";

  return { verdict, shiftIntake: timelineCritical };
}
