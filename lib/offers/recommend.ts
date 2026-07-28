import type { Verdict } from "@/lib/engine-b/verdict";
import type { JourneyType } from "@/lib/profile/derive";

/**
 * Offre recommandée dans le rapport (CDC §17 et §30).
 * Aucune offre n'est recommandée à un profil pour lequel elle serait prématurée :
 * un projet à clarifier ou non recommandé n'est pas orienté vers la plateforme.
 */
export const RECOMMENDABLE_OFFERS = ["DIAGNOSTIC", "PLATFORM", "GUIDED"] as const;
export type RecommendedOffer = (typeof RECOMMENDABLE_OFFERS)[number];

export function recommendOffer(verdict: Verdict, journeyType: JourneyType | null): RecommendedOffer {
  // Tant que l'objectif n'est pas arrêté ou que le projet n'est pas recommandé,
  // vendre un outil d'exécution n'aurait pas de sens.
  if (verdict === "NEEDS_CLARIFICATION" || verdict === "NOT_CURRENTLY_RECOMMENDED") {
    return "DIAGNOSTIC";
  }
  if (verdict === "PREMATURE") return "DIAGNOSTIC";

  // Les situations les plus contraintes justifient un accompagnement humain.
  if (verdict === "POSSIBLE_BUT_RISKY" || verdict === "VIABLE_WITH_MAJOR_PLANNING") {
    return journeyType === "BAR_CANDIDATE" || journeyType === "LLM_APPLICANT"
      ? "GUIDED"
      : "PLATFORM";
  }

  return "PLATFORM";
}
