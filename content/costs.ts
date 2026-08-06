import type { CostEstimate } from "@/lib/costs/estimate";

/**
 * Libellés de la fourchette de coût (CDC §15 et §17).
 *
 * Ces quatre lignes paraissent à DEUX endroits — le résultat préliminaire et le
 * rapport — et elles y étaient écrites en dur, deux fois, à l'identique. Deux
 * rendus séparés d'une même donnée divergent sans que rien ne le signale :
 * c'est exactement pour cela que le rapport n'a qu'un composant, partagé par la
 * version imprimable et par la page du destinataire.
 *
 * Les clés sont celles de `CostEstimate` : ajouter un poste sans lui donner de
 * libellé ne compile pas, et un libellé qui ne correspond à aucun poste non
 * plus. C'est le compilateur qui tient l'accord, pas la relecture.
 */

/** `notIncluded` n'est pas une fourchette : il se rend en phrase, pas en ligne. */
export type CostLine = Exclude<keyof CostEstimate, "notIncluded">;

export const COST_LINES: readonly CostLine[] = ["academic", "living", "barAndAdmission", "total"];

export const COST_LABELS: Record<CostLine, string> = {
  academic: "Coût académique",
  living: "Coût de la vie",
  barAndAdmission: "Barreau et admission",
  total: "Total indicatif",
};

/** Les postes non chiffrés, dits pour éviter l'illusion d'exhaustivité. */
export const COSTS_NOT_INCLUDED_LEAD = "Non compris à ce stade :";
