/**
 * Simulateur de coût (CDC §26) — types fermés.
 *
 * Les dix-sept postes du cahier des charges sont tous représentés. Les montants
 * sont en dollars, unité dans laquelle les écoles publient leurs tarifs.
 *
 * Le simulateur ne garantit aucun retour sur investissement : il chiffre une
 * dépense, il ne prédit pas un revenu.
 */

/** Villes proposées, qui préremplissent logement et vie quotidienne. */
export const CITIES = [
  "NEW_YORK",
  "BOSTON",
  "WASHINGTON",
  "CHICAGO",
  "LOS_ANGELES",
  "BERKELEY",
  "OTHER",
] as const;
export type City = (typeof CITIES)[number];

/**
 * Entrées du simulateur. Les montants « mensuels » sont multipliés par la durée
 * ; les autres sont des totaux pour l'ensemble du projet.
 */
export interface ScenarioInputs {
  label: string;

  // ── Académique ──────────────────────────────────────────────────────────
  tuition: number; // frais de scolarité, total
  universityFees: number; // frais universitaires annexes
  lsac: number; // frais LSAC / dossier
  translations: number; // traductions et certifications

  // ── Vie sur place ───────────────────────────────────────────────────────
  city: City;
  studyMonths: number; // durée du séjour d'études
  housingMonthly: number;
  dailyLivingMonthly: number; // alimentation, quotidien
  transportMonthly: number;
  insurance: number; // assurance santé, total
  visa: number; // frais de visa et démarches
  travel: number; // voyages aller-retour

  // ── Barreau ─────────────────────────────────────────────────────────────
  barPrep: number; // prestataire de préparation
  exams: number; // frais d'examen
  retake: number; // budget d'un éventuel repassage

  // ── Après le diplôme ────────────────────────────────────────────────────
  admission: number; // frais d'admission et procédure
  noIncomeMonths: number; // période sans revenu après le diplôme

  // ── Ressources déduites ─────────────────────────────────────────────────
  scholarships: number;
  partnerships: number;
}

/** Les six sorties imposées par le CDC §26. */
export interface ScenarioOutputs {
  academic: number;
  living: number;
  bar: number;
  postGraduation: number;
  total: number;
  net: number;
}

export interface Scenario {
  id: string;
  inputs: ScenarioInputs;
  outputs: ScenarioOutputs;
}

/** Trois scénarios comparés au maximum (CDC §26). */
export const MAX_SCENARIOS = 3;
