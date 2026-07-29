/**
 * Base de partenariats (CDC §27).
 *
 * Chaque partenariat porte université française, law school américaine, type
 * d'avantage, conditions, procédure, deadline, source, date de vérification et
 * statut — les neuf champs exigés par le cahier des charges.
 *
 * La donnée provient du dépôt `corentinsg/llm-partnerships`, importée par
 * `scripts/import-partnerships.mjs`.
 */

/** Type d'avantage — liste fermée, reprise de la base source. */
export const PARTNERSHIP_TYPES = [
  "reserved_seat",
  "preferential_treatment",
  "reserved_seat_and_preferential_treatment",
  "pipeline",
  "dual_degree",
  "to_confirm",
] as const;
export type PartnershipType = (typeof PARTNERSHIP_TYPES)[number];

/** Catégorie de frais de scolarité dans l'université partenaire. */
export const TUITION_CATEGORIES = [
  "no_tuition",
  "fixed_fee",
  "reduced_tuition",
  "scholarship_possible",
  "full_or_unknown",
  "to_confirm",
] as const;
export type TuitionCategory = (typeof TUITION_CATEGORIES)[number];

/** Fiabilité de la fiche. Seule « confirmed » est opposable à un utilisateur. */
export const RELIABILITY_STATUSES = ["confirmed", "to_confirm", "incomplete"] as const;
export type ReliabilityStatus = (typeof RELIABILITY_STATUSES)[number];

/** Niveau minimal requis, normalisé. `null` quand la source ne tranche pas. */
export type RequiredLevel = "M1" | "M2" | null;

export interface LanguageTest {
  test: string;
  minimumScore: string;
  details: string | null;
}

export interface PartnerUniversity {
  id: string;
  name: string;
  city: string;
}

export interface Partnership {
  id: string;
  frenchUniversityId: string;
  frenchUniversity: string;
  usLawSchool: string;
  city: string | null;
  state: string | null;
  partnershipType: PartnershipType;
  tuitionCategory: TuitionCategory;
  tuitionDisplay: string | null;
  financialAid: string | null;
  seatsDisplay: string | null;
  seatsMin: number | null;
  seatsMax: number | null;
  requiredLevel: RequiredLevel;
  requiredLevelRaw: string | null;
  programLanguage: string | null;
  duration: string | null;
  specialties: string[];
  admissionConditions: string | null;
  languageTests: LanguageTest[];
  applicationDeadline: string | null;
  shortDescription: string | null;
  officialLink: string | null;
  reliability: ReliabilityStatus;
  missingInformation: string[];
  notes: string | null;
  /** Actif = fiche confirmée, donc affichable à un utilisateur. */
  active: boolean;
  /** Date de l'instantané source (CDC §27 : date de vérification obligatoire). */
  verifiedAt: string;
}
