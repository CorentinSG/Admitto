import type { Answers } from "@/lib/questionnaire/types";
import { needsVisaBranch } from "@/lib/questionnaire/visibility";

/**
 * Profil structuré (CDC §13) : champs directs conservés tels quels, champs
 * inférés calculés ici. Aucun de ces calculs n'emporte de conclusion juridique.
 */

/** Parcours types (CDC §20) — liste fermée. */
export const JOURNEY_TYPES = [
  "PRE_LLM_EXPLORER",
  "LLM_APPLICANT",
  "CURRENT_LLM_STUDENT",
  "BAR_CANDIDATE",
  "FOREIGN_QUALIFIED_LAWYER",
] as const;
export type JourneyType = (typeof JOURNEY_TYPES)[number];

/** Phases de la roadmap (CDC §22) — liste fermée. */
export const PHASES = [
  "CLARIFICATION",
  "CAREER_STRATEGY",
  "LLM_SELECTION",
  "APPLICATIONS",
  "FUNDING",
  "VISA",
  "LLM_START",
  "BOLE",
  "NETWORKING_INTERNSHIPS",
  "BAR_PREPARATION",
  "EXAM",
  "ADMISSION",
  "POST_ADMISSION_STRATEGY",
] as const;
export type Phase = (typeof PHASES)[number];

/** Besoin de visa : jamais affirmé, seulement « probable », « improbable » ou « à confirmer ». */
export const VISA_NEED = ["LIKELY", "UNLIKELY", "TO_CONFIRM"] as const;
export type VisaNeed = (typeof VISA_NEED)[number];

export interface DerivedProfile {
  lawYearsValidated: number | null;
  journeyType: JourneyType | null;
  visaNeed: VisaNeed;
  monthsUntilIntake: number | null;
  currentPhase: Phase | null;
  /** Vrai lorsqu'un champ indispensable au diagnostic manque. */
  hasBlockingGaps: boolean;
}

/**
 * Années d'études juridiques validées, approximation assumée (CDC §13 :
 * « nombre approximatif »). Le détail — mention, mentions obtenues — n'est
 * demandé qu'après le premier questionnaire.
 */
export function lawYearsValidated(answers: Answers): number | null {
  switch (answers.education) {
    case "LICENCE":
      return 3;
    case "M1":
      return 4;
    case "M2":
    case "CRFPA":
      return 5;
    case "CAPA":
      return 6;
    case "DOCTORAT":
      return 8;
    case "AUTRE":
    default:
      return null;
  }
}

export function journeyType(answers: Answers): JourneyType | null {
  switch (answers.status) {
    case "EXPLORING_LLM":
      return "PRE_LLM_EXPLORER";
    case "APPLYING":
      return "LLM_APPLICANT";
    case "ADMITTED_OR_ENROLLED":
      return "CURRENT_LLM_STUDENT";
    case "TARGETING_BAR":
      return "BAR_CANDIDATE";
    case "LAWYER_EXPLORING":
      return "FOREIGN_QUALIFIED_LAWYER";
    default:
      return null;
  }
}

/**
 * Un double national américain n'a pas besoin de visa étudiant ; un statut
 * existant doit être confirmé au regard de l'usage envisagé. Aucun autre cas
 * n'est tranché automatiquement.
 */
export function visaNeed(answers: Answers): VisaNeed {
  if (!needsVisaBranch(answers)) return "UNLIKELY";
  if (answers.usStatus === "EXISTING_VISA_STATUS") return "TO_CONFIRM";
  if (answers.usStatus === "FR_NO_STATUS") return "LIKELY";
  return "TO_CONFIRM";
}

/**
 * Mois restants avant la rentrée visée. `reference` est injectée pour rendre le
 * calcul déterministe et testable (jamais de Date.now() implicite).
 */
export function monthsUntilIntake(answers: Answers, reference: Date): number | null {
  if (!answers.intake || answers.intake === "UNDECIDED") return null;
  if (answers.intake === "ALREADY_STARTED") return 0;

  const offsetYears = { Y1: 1, Y2: 2, Y3: 3, LATER: 4 }[answers.intake];
  // Les LL.M. américains démarrent en août : on vise le 15 août de l'année cible.
  const intakeDate = new Date(Date.UTC(reference.getUTCFullYear() + offsetYears, 7, 15));
  const months =
    (intakeDate.getUTCFullYear() - reference.getUTCFullYear()) * 12 +
    (intakeDate.getUTCMonth() - reference.getUTCMonth());
  return Math.max(0, months);
}

export function currentPhase(answers: Answers): Phase | null {
  switch (answers.status) {
    case "EXPLORING_LLM":
      return answers.careerGoal && answers.careerGoal !== "TOO_EARLY" && answers.careerGoal !== "UNDECIDED"
        ? "LLM_SELECTION"
        : "CLARIFICATION";
    case "APPLYING":
      return "APPLICATIONS";
    case "ADMITTED_OR_ENROLLED":
      return "LLM_START";
    case "TARGETING_BAR":
      return "BAR_PREPARATION";
    case "LAWYER_EXPLORING":
      return "CAREER_STRATEGY";
    default:
      return null;
  }
}

/** Champs sans lesquels aucune voie préliminaire ne peut être proposée. */
export function hasBlockingGaps(answers: Answers): boolean {
  return !answers.status || !answers.education || !answers.usStatus;
}

export function deriveProfile(answers: Answers, reference: Date): DerivedProfile {
  return {
    lawYearsValidated: lawYearsValidated(answers),
    journeyType: journeyType(answers),
    visaNeed: visaNeed(answers),
    monthsUntilIntake: monthsUntilIntake(answers, reference),
    currentPhase: currentPhase(answers),
    hasBlockingGaps: hasBlockingGaps(answers),
  };
}

/** Profil à plat consommé par le moteur de règles (champs directs + inférés). */
export function flattenForRules(answers: Answers, derived: DerivedProfile): Record<string, unknown> {
  return { ...answers, ...derived };
}
