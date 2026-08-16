import type { Assessment } from "@/lib/assessment/compute";
import { defaultInputs } from "./defaults";
import type { ScenarioInputs } from "./types";

/**
 * Premier scénario proposé, pré-rempli depuis LE diagnostic de la personne
 * (plan de personnalisation, point 1.1).
 *
 * Le simulateur s'ouvrait sur « Mon scénario », gabarit identique pour tous,
 * alors que le diagnostic avait déjà calculé une fourchette pour cette personne
 * et qu'elle avait déclaré son budget, son projet géographique, son statut.
 * Quelqu'un qui a répondu « moins de 30 000 $ » et lisait « Total : 78 000 $ »
 * sur un scénario vierge ne se sentait pas attendu.
 *
 * Deux règles tiennent ce module :
 *
 * - **Rien n'est inventé.** Chaque écart au gabarit vient d'une réponse de la
 *   personne ou de la fourchette DÉJÀ RENDUE sur son résultat : la somme
 *   scolarité + frais universitaires égale le MILIEU de sa fourchette
 *   académique — qui porte déjà l'effet de son partenariat et de sa recherche
 *   de bourses ; le poste visa suit son besoin migratoire dérivé ; la période
 *   sans revenu reprend l'hypothèse que sa fourchette faisait déjà pour un
 *   projet « rester aux États-Unis ». Un montant qu'elle n'a pas déclaré
 *   (bourse obtenue, accord chiffré) reste à zéro : le pré-remplir serait
 *   l'inventer.
 *
 * - **Proposé, jamais enregistré d'office** (CDC §24 : rien n'est décidé à la
 *   place de la personne). C'est l'état initial de l'éditeur quand aucun
 *   scénario n'existe ; il ne devient un scénario que par son clic.
 */

/** Milieu d'une fourchette, arrondi à la centaine — l'unité des écrans de coût. */
const midpoint = (range: { lowUsd: number; highUsd: number }): number =>
  Math.round((range.lowUsd + range.highUsd) / 2 / 100) * 100;

/**
 * Année de la rentrée visée, calculée depuis la date de SOUMISSION — jamais
 * depuis l'horloge : le libellé d'un scénario ne doit pas changer tout seul au
 * passage du nouvel an (déterminisme, comme `lib/profile/derive.ts`).
 */
export function intakeYearOf(assessment: Assessment): number | null {
  const intake = assessment.answers.intake;
  if (!intake || intake === "UNDECIDED" || intake === "ALREADY_STARTED") return null;
  const offset = { Y1: 1, Y2: 2, Y3: 3, LATER: 4 }[intake];
  return new Date(assessment.createdAt).getUTCFullYear() + offset;
}

export function seedScenario(assessment: Assessment): ScenarioInputs {
  const year = intakeYearOf(assessment);
  const seed = defaultInputs(
    year ? `Votre point de départ — rentrée ${year}` : "Votre point de départ"
  );

  /*
   * Scolarité : le milieu de LEUR fourchette académique. Elle exclut LSAC et
   * traductions (dits « non compris » sur leur résultat), et couvre scolarité
   * + frais annexes : on retranche donc les frais annexes du gabarit pour que
   * la SOMME des deux postes tombe exactement sur leur milieu de fourchette.
   */
  const academicMid = midpoint(assessment.costs.academic);
  seed.tuition = Math.max(0, academicMid - seed.universityFees);

  // Le poste visa suit le besoin migratoire dérivé : une double nationalité
  // américaine le rend sans objet — c'est déjà écrit sur leur résultat.
  if (assessment.derived.visaNeed === "UNLIKELY") seed.visa = 0;

  /*
   * Rester aux États-Unis suppose de tenir plus longtemps sans revenu : leur
   * fourchette le disait déjà (+12 000 $ en haut de fourchette, soit trois à
   * quatre mois de vie sur place). Le scénario reprend la même hypothèse, pas
   * une nouvelle.
   */
  if (assessment.answers.geoGoal === "STAY_US") seed.noIncomeMonths = 6;

  return seed;
}
