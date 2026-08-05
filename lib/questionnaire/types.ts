/**
 * Questionnaire initial (CDC §12) — types fermés.
 * Toute liste du cahier des charges est une union fermée : jamais de string libre.
 */

export const JOURNEY_STATUS = [
  "EXPLORING_LLM", // Explorer un LL.M.
  "APPLYING", // Candidater
  "ADMITTED_OR_ENROLLED", // Déjà admis ou inscrit
  "TARGETING_BAR", // Viser le barreau
  "LAWYER_EXPLORING", // Avocat étudiant ses options
] as const;

export const EDUCATION = ["LICENCE", "M1", "M2", "CRFPA", "CAPA", "DOCTORAT", "AUTRE"] as const;

/**
 * Admission à un barreau — et, pour l'étranger, sur QUELLE BASE.
 *
 * `OTHER_COUNTRY` a été scindé le 2026-08-03, après lecture des instructions du
 * BOLE. Ce qui distingue deux avocats étrangers n'est pas le pays : c'est la
 * façon dont l'admission a été obtenue. Le § 520.6(b)(1) vise celui qui tient
 * son admission d'un diplôme de droit ; le § 520.6(b)(2) vise celui qui la
 * tient d'une combinaison d'études et de formation en cabinet — c'est
 * explicitement le cas des parcours britanniques de conversion, que le Board
 * nomme et traite à part. Deux régimes distincts, que la réponse « oui, dans un
 * autre pays » ne permettait pas de séparer.
 *
 * Le pays lui-même n'est PAS demandé, et ce n'est pas un oubli : le BOLE ne
 * publie aucune liste des juridictions relevant de la common law et apprécie
 * chaque dossier individuellement. Une liste posée ici inventerait le critère
 * qu'il refuse de publier. Le pays est relevé à la relecture humaine, où il est
 * constaté et non classé (voir `lib/report/review.ts`).
 *
 * Le plafond de douze écrans (CDC §12.2) interdisait par ailleurs d'en ouvrir
 * un treizième : un profil d'avocat en voit déjà douze.
 */
export const FOREIGN_BAR = [
  "NONE",
  "FRANCE",
  "OTHER_COUNTRY_LAW_DEGREE",
  "OTHER_COUNTRY_TRAINING",
] as const;

export const CAREER_GOAL = [
  "BIG_LAW",
  "SMALLER_FIRM",
  "IMMIGRATION",
  "ARBITRATION",
  "IN_HOUSE_COMPLIANCE",
  "INTERNATIONAL_ORG",
  "RETURN_FRANCE",
  "UNDECIDED",
  "TOO_EARLY", // proposé uniquement aux profils très amont (CDC §12.4)
] as const;

export const GEO_GOAL = ["STAY_US", "RETURN_FRANCE", "KEEP_BOTH"] as const;

export const BUDGET = ["UNDER_30K", "30_60K", "60_100K", "OVER_100K", "UNDEFINED"] as const;

export const FUNDING = ["LOAN", "SCHOLARSHIPS", "BOTH", "NONE", "NOT_CONSIDERED"] as const;

export const INTAKE = ["Y1", "Y2", "Y3", "LATER", "UNDECIDED", "ALREADY_STARTED"] as const;

export const ENGLISH = ["TEST_TAKEN", "TEST_PLANNED", "PREP_STARTED", "NOT_STARTED"] as const;

export const US_STATUS = ["FR_NO_STATUS", "EXISTING_VISA_STATUS", "US_DUAL_NATIONAL", "OTHER"] as const;

/**
 * Cette personne est-elle admise à un barreau, où que ce soit ?
 *
 * Écrit une fois plutôt que comparé à la main partout : la liste des valeurs
 * « admis » s'est déjà allongée une fois, et chaque comparaison dispersée est
 * un endroit qui aurait pu être oublié. Une réponse ABSENTE ne vaut jamais
 * « admis » — l'écran n'est pas montré à tous les profils, et tester
 * `!== "NONE"` ferait passer tout profil non interrogé pour un avocat inscrit.
 */
export function isBarAdmitted(value: ForeignBar | undefined): boolean {
  return value !== undefined && value !== "NONE";
}

export type JourneyStatus = (typeof JOURNEY_STATUS)[number];
export type Education = (typeof EDUCATION)[number];
export type ForeignBar = (typeof FOREIGN_BAR)[number];
export type CareerGoal = (typeof CAREER_GOAL)[number];
export type GeoGoal = (typeof GEO_GOAL)[number];
export type Budget = (typeof BUDGET)[number];
export type Funding = (typeof FUNDING)[number];
export type Intake = (typeof INTAKE)[number];
export type English = (typeof ENGLISH)[number];
export type UsStatus = (typeof US_STATUS)[number];

/** Réponses brutes du questionnaire — champs directs du CDC §13. */
export interface Answers {
  status?: JourneyStatus;
  education?: Education;
  university?: string; // IDENTIFIANT de content/universities.ts, jamais le libellé
  foreignBar?: ForeignBar;
  foreignBarYear?: number;
  foreignBarActive?: boolean;
  careerGoal?: CareerGoal;
  geoGoal?: GeoGoal;
  budget?: Budget;
  funding?: Funding;
  intake?: Intake;
  english?: English;
  usStatus?: UsStatus;
  firstName?: string;
  email?: string;
  comment?: string; // seul champ libre, facultatif (CDC §12.2)
  /**
   * Consentement marketing (CDC §34) : distinct, facultatif, jamais pré-coché.
   * Son absence n'empêche aucun email d'exécution du service.
   */
  consentMarketing?: boolean;
}

/** Identifiants d'écran, dans l'ordre du CDC §12.3. */
export const SCREEN_IDS = [
  "status",
  "education",
  "university",
  "foreignBar",
  "careerGoal",
  "geoGoal",
  "budget",
  "funding",
  "intake",
  "english",
  "usStatus",
  "contact",
] as const;

export type ScreenId = (typeof SCREEN_IDS)[number];
