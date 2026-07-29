import { PARTNERSHIPS_DATA } from "@/content/partnerships.generated";
import type { Education } from "@/lib/questionnaire/types";
import type { Partnership, RequiredLevel } from "./types";

/**
 * Détection des partenariats applicables (CDC §13 et §27).
 *
 * Deux critères, et deux seulement : l'université d'origine et le niveau
 * d'études atteint. Rien d'autre n'est inféré — un partenariat ne dit RIEN de
 * l'éligibilité au barreau, qui relève exclusivement du New York Board of Law
 * Examiners.
 *
 * La fiabilité de la fiche est rendue lisible plutôt que masquée : les fiches
 * confirmées sont présentées comme telles, celles à vérifier sont signalées
 * comme des pistes. Aucune fiche incomplète n'est montrée à un utilisateur.
 */

export interface PartnershipDetection {
  /** Fiches confirmées, ouvertes au niveau d'études déclaré. */
  confirmed: Partnership[];
  /** Fiches probables, à confirmer auprès de l'université. */
  toConfirm: Partnership[];
  /** Fiches confirmées mais fermées au niveau actuel — utiles à connaître. */
  aboveLevel: Partnership[];
  /** L'université de l'utilisateur figure-t-elle dans la base ? */
  universityCovered: boolean;
  universityId: string | null;
}

/** Rang du diplôme, pour comparer au niveau minimal exigé par un partenariat. */
const EDUCATION_RANK: Record<Education, number> = {
  LICENCE: 3,
  M1: 4,
  M2: 5,
  CRFPA: 5,
  CAPA: 6,
  DOCTORAT: 8,
  AUTRE: 0,
};

const LEVEL_RANK: Record<Exclude<RequiredLevel, null>, number> = { M1: 4, M2: 5 };

/**
 * Le niveau atteint permet-il de candidater ?
 * Un niveau requis inconnu ne ferme jamais la porte : la fiche est proposée,
 * charge à l'utilisateur de vérifier. Fermer sur une donnée absente écarterait
 * à tort — c'est la même règle que partout ailleurs dans le produit.
 */
export function meetsLevel(partnership: Partnership, education: Education | undefined): boolean {
  if (partnership.requiredLevel === null) return true;
  if (!education || education === "AUTRE") return true;
  return EDUCATION_RANK[education] >= LEVEL_RANK[partnership.requiredLevel];
}

export function detectPartnerships(
  universityId: string | undefined,
  education: Education | undefined,
  partnerships: Partnership[] = PARTNERSHIPS_DATA
): PartnershipDetection {
  if (!universityId) {
    return {
      confirmed: [],
      toConfirm: [],
      aboveLevel: [],
      universityCovered: false,
      universityId: null,
    };
  }

  const forUniversity = partnerships.filter((p) => p.frenchUniversityId === universityId);
  const eligible = forUniversity.filter((p) => meetsLevel(p, education));

  return {
    confirmed: eligible.filter((p) => p.active),
    // Une fiche « à confirmer » reste une piste : la taire priverait
    // l'utilisateur d'une information utile, la présenter comme acquise
    // serait faux.
    toConfirm: eligible.filter((p) => !p.active && p.reliability === "to_confirm"),
    aboveLevel: forUniversity.filter((p) => p.active && !meetsLevel(p, education)),
    universityCovered: forUniversity.length > 0,
    universityId,
  };
}

/** Métrique du CDC §27 : part des utilisateurs dont l'université est couverte. */
export function coverageRate(universityIds: Array<string | undefined>): number {
  if (universityIds.length === 0) return 0;
  const covered = universityIds.filter(
    (id) => id && PARTNERSHIPS_DATA.some((p) => p.frenchUniversityId === id)
  ).length;
  return Math.round((covered / universityIds.length) * 100);
}

/**
 * Un partenariat abaisse-t-il réellement le coût ? Utilisé par le Moteur B
 * (adéquation financière) et par la fourchette de coût du résultat immédiat.
 */
export function reducesCost(partnership: Partnership): boolean {
  return (
    partnership.tuitionCategory === "no_tuition" ||
    partnership.tuitionCategory === "fixed_fee" ||
    partnership.tuitionCategory === "reduced_tuition"
  );
}

/** Meilleur avantage financier confirmé, ou null. */
export function bestCostAdvantage(detection: PartnershipDetection): Partnership | null {
  const order = ["no_tuition", "fixed_fee", "reduced_tuition"];
  const candidates = detection.confirmed
    .filter(reducesCost)
    .sort((a, b) => order.indexOf(a.tuitionCategory) - order.indexOf(b.tuitionCategory));
  return candidates[0] ?? null;
}
