import { runEngineA } from "@/lib/engine-a/run";
import { RULES } from "@/lib/engine-a/rules.seed";
import { deriveProfile, flattenForRules, type DerivedProfile } from "@/lib/profile/derive";
import {
  bestCostAdvantage,
  detectPartnerships,
  type PartnershipDetection,
} from "@/lib/partnerships/detect";
import { estimateCosts, type CostEstimate } from "@/lib/costs/estimate";
import { computeDeadlines, type Deadline } from "@/lib/deadlines/compute";
import type { Answers } from "@/lib/questionnaire/types";
import type { PreliminaryPath } from "@/lib/engine-a/types";

/**
 * Assemblage du résultat préliminaire immédiat (CDC §15) :
 * voie préliminaire, partenariats détectés, principales échéances, éléments
 * migratoires généraux, première fourchette de coût et limites de l'analyse.
 *
 * Le Moteur B (viabilité, cinq axes) n'intervient PAS ici : il alimente le
 * rapport personnalisé, pas le résultat immédiat.
 */
export interface Assessment {
  id: string;
  createdAt: string;
  answers: Answers;
  derived: DerivedProfile;
  path: PreliminaryPath;
  textBlocks: string[];
  partnerships: PartnershipDetection;
  costs: CostEstimate;
  deadlines: Deadline[];
  /** Version des règles utilisées, figée pour la traçabilité (CDC §14.1). */
  rulesSnapshot: Array<{ id: string; version: number }>;
}

export function computeAssessment(answers: Answers, reference: Date, id: string): Assessment {
  const derived = deriveProfile(answers, reference);
  const engineA = runEngineA(flattenForRules(answers, derived), RULES);

  // La détection croise l'université d'origine ET le niveau atteint : un
  // partenariat réservé aux M2 n'est pas proposé à un étudiant en licence.
  const partnerships = detectPartnerships(answers.university, answers.education);
  const costAdvantage = bestCostAdvantage(partnerships);

  return {
    id,
    createdAt: reference.toISOString(),
    answers,
    derived,
    path: engineA.path,
    textBlocks: engineA.textBlocks,
    partnerships,
    costs: estimateCosts(answers, costAdvantage),
    deadlines: computeDeadlines(answers, reference),
    rulesSnapshot: engineA.firedRules,
  };
}
