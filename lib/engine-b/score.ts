import type { Answers } from "@/lib/questionnaire/types";
import { OTHER_UNIVERSITY_ID } from "@/content/universities";
import type { DerivedProfile } from "@/lib/profile/derive";
import type { CostEstimate } from "@/lib/costs/estimate";
import type { AxisScore, AxisScores, VerdictInput } from "./verdict";

/**
 * Moteur B — notation des cinq axes (CDC §14.2).
 *
 * Chaque axe est noté de 1 à 4 selon des règles explicites et déterministes.
 * Aucune note n'est une probabilité : ce sont des niveaux de préparation
 * observables à partir des réponses. Le verdict lui-même est calculé par
 * `computeVerdict`, qui applique les plafonnements du CDC §14.3.
 */

const clamp = (n: number): AxisScore => Math.min(4, Math.max(1, n)) as AxisScore;

/**
 * Axe 1 — Solidité académique.
 * Le niveau atteint prime ; l'université n'est jamais le seul critère
 * (exigence explicite du CDC §14.2), elle ne pèse qu'un demi-point.
 */
export function academicStrength(answers: Answers, derived: DerivedProfile): AxisScore {
  const years = derived.lawYearsValidated;
  if (years === null) return 2; // parcours atypique : ni valorisé ni pénalisé
  const base = years >= 6 ? 4 : years >= 5 ? 3 : years >= 4 ? 2 : 1;
  // L'université est stockée sous forme d'identifiant, pas de libellé :
  // comparer à un libellé donnerait le bonus à tout le monde.
  const known = Boolean(answers.university && answers.university !== OTHER_UNIVERSITY_ID);
  // L'université peut faire remonter un cursus d'un cran, jamais décrocher la
  // note maximale : celle-ci reste réservée à un cursus achevé (CDC §14.2,
  // « l'université ne doit pas être le seul critère »).
  const withBonus = known ? base + 1 : base;
  return clamp(years >= 6 ? withBonus : Math.min(3, withBonus));
}

/**
 * Axe 2 — Adéquation financière.
 * Croisement du budget déclaré et de la fourchette de coût. Un budget faible
 * ne dégrade pas mécaniquement la note : il déclenche d'abord une recherche de
 * financement, conformément au CDC §14.2.
 */
export function financialFit(
  answers: Answers,
  costs: CostEstimate,
  hasCostAdvantage = false
): AxisScore {
  const budgetFloor: Record<string, number> = {
    UNDER_30K: 30_000,
    "30_60K": 60_000,
    "60_100K": 100_000,
    OVER_100K: 200_000,
  };

  if (!answers.budget || answers.budget === "UNDEFINED") return 2;

  const ceiling = budgetFloor[answers.budget];
  const ratio = ceiling / costs.total.lowUsd;
  let score = ratio >= 1.5 ? 4 : ratio >= 1 ? 3 : ratio >= 0.6 ? 2 : 1;

  // Une recherche de financement engagée relève d'un cran un budget insuffisant.
  if (score <= 2 && (answers.funding === "SCHOLARSHIPS" || answers.funding === "BOTH")) score += 1;
  // Aucune piste de financement identifiée avec un budget serré : signal fort.
  if (score >= 2 && answers.funding === "NONE" && ratio < 1) score -= 1;

  // Un partenariat confirmé de l'université d'origine est un levier financier concret,
  // pas une hypothèse : il relève la note d'un cran.
  if (hasCostAdvantage) score += 1;

  return clamp(score);
}

/**
 * Axe 3 — Réalisme professionnel.
 * Croisement de l'objectif, du niveau de formation, du statut de barreau et de
 * la préférence géographique.
 */
export function professionalRealism(answers: Answers, derived: DerivedProfile): AxisScore {
  if (!answers.careerGoal || answers.careerGoal === "UNDECIDED" || answers.careerGoal === "TOO_EARLY") {
    return 2; // objectif non défini : le verdict le traitera comme « à clarifier »
  }

  let score = 3;
  // L'écran « barreau étranger » n'est pas montré à tous les profils : une
  // réponse absente vaut « pas admis », jamais « admis ». Tester `!== "NONE"`
  // ferait passer tout profil non interrogé pour un avocat inscrit.
  const admittedSomewhere =
    answers.foreignBar === "FRANCE" || answers.foreignBar === "OTHER_COUNTRY";
  const qualified = derived.journeyType === "FOREIGN_QUALIFIED_LAWYER" || admittedSomewhere;

  // Les segments les plus sélectifs supposent un profil déjà avancé.
  if (answers.careerGoal === "BIG_LAW") score = qualified ? 3 : 2;
  // Un objectif de retour en France est le moins dépendant du marché américain.
  if (answers.careerGoal === "RETURN_FRANCE") score = 4;
  // Rester aux États-Unis avec un objectif indéterminé côté marché reste exigeant.
  if (answers.geoGoal === "STAY_US" && !qualified) score -= 1;
  if (qualified) score += 1;

  return clamp(score);
}

/**
 * Axe 4 — Faisabilité du calendrier.
 * Mois restants avant la rentrée, état du test d'anglais, phase du parcours.
 */
export function timelineFeasibility(answers: Answers, derived: DerivedProfile): AxisScore {
  const months = derived.monthsUntilIntake;
  if (months === null) return 2; // rentrée non décidée : ni faisable ni infaisable
  if (months === 0) return 4; // parcours déjà engagé

  let score = months >= 18 ? 4 : months >= 12 ? 3 : months >= 8 ? 2 : 1;

  if (answers.english === "TEST_TAKEN") score += 1;
  if (answers.english === "NOT_STARTED" && months < 12) score -= 1;

  return clamp(score);
}

/**
 * Axe 5 — Risque migratoire.
 * Neutralisé lorsqu'aucun visa n'est nécessaire ; plus prudent lorsque
 * l'utilisateur exige de rester aux États-Unis (CDC §14.2).
 */
export function immigrationRisk(answers: Answers, derived: DerivedProfile): AxisScore {
  if (derived.visaNeed === "UNLIKELY") return 4; // axe neutralisé
  let score = derived.visaNeed === "TO_CONFIRM" ? 3 : 2;
  if (answers.geoGoal === "STAY_US") score -= 1;
  if (answers.geoGoal === "RETURN_FRANCE") score += 1;
  return clamp(score);
}

export function scoreAxes(
  answers: Answers,
  derived: DerivedProfile,
  costs: CostEstimate,
  hasCostAdvantage = false
): AxisScores {
  return {
    ACADEMIC_STRENGTH: academicStrength(answers, derived),
    FINANCIAL_FIT: financialFit(answers, costs, hasCostAdvantage),
    PROFESSIONAL_REALISM: professionalRealism(answers, derived),
    TIMELINE_FEASIBILITY: timelineFeasibility(answers, derived),
    IMMIGRATION_RISK: immigrationRisk(answers, derived),
  };
}

/**
 * Entrée complète du calcul de verdict, drapeaux de plafonnement compris.
 * Une timeline critique doit déplacer le projet vers une rentrée ultérieure ;
 * un objectif trop flou produit un verdict « à clarifier » (CDC §14.3).
 */
export function buildVerdictInput(
  answers: Answers,
  derived: DerivedProfile,
  costs: CostEstimate,
  hasCostAdvantage = false
): VerdictInput {
  const months = derived.monthsUntilIntake;
  return {
    scores: scoreAxes(answers, derived, costs, hasCostAdvantage),
    timelineCritical:
      months !== null && months > 0 && months < 8 && answers.status !== "ADMITTED_OR_ENROLLED",
    goalTooVague:
      !answers.careerGoal || answers.careerGoal === "UNDECIDED" || answers.careerGoal === "TOO_EARLY",
  };
}
