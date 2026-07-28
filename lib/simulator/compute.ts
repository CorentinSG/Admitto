import type { ScenarioInputs, ScenarioOutputs } from "./types";

/**
 * Calcul du simulateur de coût (CDC §26).
 *
 * Répartition des dix-sept postes dans les six sorties imposées :
 *
 * - **académique** : scolarité, frais universitaires, LSAC, traductions —
 *   tout ce qui relève des études et des candidatures ;
 * - **vie** : logement, quotidien, transport sur la durée du séjour, plus
 *   assurance, visa et voyages — tout ce qui relève de l'installation ;
 * - **barreau** : préparation, examen et budget d'un éventuel repassage ;
 * - **post-graduation** : frais d'admission et période sans revenu, valorisée
 *   au coût de vie mensuel réel ;
 * - **total** : la somme des quatre ;
 * - **net** : le total diminué des bourses et des partenariats.
 *
 * Aucune sortie n'est un retour sur investissement. Le simulateur chiffre une
 * dépense, il ne prédit aucun revenu ni aucune rentabilité.
 */

/** Coût de vie mensuel, hors postes ponctuels. */
export function monthlyLiving(inputs: ScenarioInputs): number {
  return Math.max(0, inputs.housingMonthly + inputs.dailyLivingMonthly + inputs.transportMonthly);
}

/** Un montant négatif saisi n'a pas de sens : il est ramené à zéro. */
const positive = (n: number): number => (Number.isFinite(n) && n > 0 ? n : 0);

export function computeScenario(inputs: ScenarioInputs): ScenarioOutputs {
  const months = positive(inputs.studyMonths);
  const monthly = monthlyLiving(inputs);

  const academic =
    positive(inputs.tuition) +
    positive(inputs.universityFees) +
    positive(inputs.lsac) +
    positive(inputs.translations);

  const living =
    monthly * months + positive(inputs.insurance) + positive(inputs.visa) + positive(inputs.travel);

  const bar = positive(inputs.barPrep) + positive(inputs.exams) + positive(inputs.retake);

  const postGraduation = positive(inputs.admission) + monthly * positive(inputs.noIncomeMonths);

  const total = academic + living + bar + postGraduation;

  // Les ressources ne peuvent pas rendre un coût négatif : au mieux, elles le
  // ramènent à zéro.
  const resources = positive(inputs.scholarships) + positive(inputs.partnerships);
  const net = Math.max(0, total - resources);

  return { academic, living, bar, postGraduation, total, net };
}

/** Écart entre deux scénarios, sur le coût net — la seule comparaison utile. */
export function compareNet(a: ScenarioOutputs, b: ScenarioOutputs): number {
  return a.net - b.net;
}

export function formatUsd(amount: number): string {
  return `${Math.round(amount).toLocaleString("fr-FR")} $`;
}
