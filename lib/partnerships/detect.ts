import { PARTNERSHIPS, type Partnership } from "./data";

/**
 * Détection des partenariats applicables (CDC §13 et §27).
 * Seuls les partenariats actifs ET vérifiés sont retournés : un partenariat non
 * vérifié ne doit jamais apparaître dans un résultat utilisateur.
 */
export interface PartnershipDetection {
  matches: Partnership[];
  /** L'université de l'utilisateur est-elle couverte par la base ? */
  universityCovered: boolean;
  /** Renseigne la métrique « taux de détection des partenariats » (CDC §27). */
  universityQueried: string | null;
}

export function detectPartnerships(
  university: string | undefined,
  partnerships: Partnership[] = PARTNERSHIPS
): PartnershipDetection {
  if (!university) {
    return { matches: [], universityCovered: false, universityQueried: null };
  }

  const matches = partnerships.filter(
    (p) => p.active && p.verifiedAt !== null && p.frenchUniversity === university
  );

  return {
    matches,
    universityCovered: matches.length > 0,
    universityQueried: university,
  };
}
