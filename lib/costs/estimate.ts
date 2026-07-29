import type { Answers } from "@/lib/questionnaire/types";
import type { Partnership } from "@/lib/partnerships/types";

/**
 * Première fourchette de coût affichée dans le résultat immédiat (CDC §15).
 *
 * Il ne s'agit PAS du simulateur complet du CDC §26 (dix-sept postes, trois
 * scénarios comparés), livré en Phase 2. C'est une fourchette large, assumée
 * comme telle, destinée à situer l'ordre de grandeur du projet.
 *
 * Les montants sont des fourchettes publiques d'ordre de grandeur, exprimées en
 * dollars, à confirmer école par école. Aucun retour sur investissement n'est
 * annoncé.
 */

export interface CostRange {
  lowUsd: number;
  highUsd: number;
}

export interface CostEstimate {
  academic: CostRange; // tuition + frais universitaires
  living: CostRange; // logement, assurance, transport, quotidien
  barAndAdmission: CostRange; // bar preparation, examens, admission
  total: CostRange;
  /** Postes non chiffrés à ce stade, listés pour éviter l'illusion d'exhaustivité. */
  notIncluded: string[];
}

const ACADEMIC: CostRange = { lowUsd: 25_000, highUsd: 80_000 };
const LIVING: CostRange = { lowUsd: 18_000, highUsd: 40_000 };
const BAR: CostRange = { lowUsd: 4_000, highUsd: 9_000 };

const add = (a: CostRange, b: CostRange): CostRange => ({
  lowUsd: a.lowUsd + b.lowUsd,
  highUsd: a.highUsd + b.highUsd,
});

/**
 * La fourchette n'est pas « personnalisée » au sens d'un calcul individuel :
 * elle est resserrée par le bas lorsque l'utilisateur envisage bourses ou
 * partenariats, et par le haut lorsqu'il vise exclusivement les États-Unis
 * (période sans revenu plus longue, coût de bar preparation complet).
 */
export function estimateCosts(answers: Answers, costAdvantage?: Partnership | null): CostEstimate {
  const academic = { ...ACADEMIC };
  const living = { ...LIVING };
  const bar = { ...BAR };

  // Une recherche de financement engagée abaisse le plancher du coût net.
  if (answers.funding === "SCHOLARSHIPS" || answers.funding === "BOTH") {
    academic.lowUsd = Math.round(academic.lowUsd * 0.6);
  }

  // Un partenariat confirmé de l'université d'origine abaisse le plancher
  // académique — c'est son intérêt principal. L'effet dépend du type d'accord ;
  // il ne touche jamais le plafond, l'utilisateur pouvant viser une autre école.
  if (costAdvantage) {
    const facteur = {
      no_tuition: 0.1,
      fixed_fee: 0.25,
      reduced_tuition: 0.6,
    }[costAdvantage.tuitionCategory as "no_tuition" | "fixed_fee" | "reduced_tuition"];
    if (facteur) academic.lowUsd = Math.round(academic.lowUsd * facteur);
  }

  // Rester aux États-Unis suppose de tenir plus longtemps sans revenu.
  if (answers.geoGoal === "STAY_US") {
    living.highUsd += 12_000;
  }

  // Un retour en France sans passage par le barreau réduit le poste examen.
  if (answers.geoGoal === "RETURN_FRANCE" && answers.status !== "TARGETING_BAR") {
    bar.lowUsd = 0;
  }

  return {
    academic,
    living,
    barAndAdmission: bar,
    total: add(add(academic, living), bar),
    notIncluded: [
      "traductions et frais LSAC",
      "frais de visa et de voyages",
      "période sans revenu au-delà du LL.M.",
      "éventuel repassage de l'examen",
    ],
  };
}

/** Formatage en dollars, sans décimales, pour l'affichage. */
export function formatUsd(amount: number): string {
  return `${Math.round(amount / 1000)} 000 $`;
}
