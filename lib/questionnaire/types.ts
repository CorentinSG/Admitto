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

export const FOREIGN_BAR = ["NONE", "FRANCE", "OTHER_COUNTRY"] as const;

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
  university?: string; // libellé issu de la liste, ou "AUTRE"
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
