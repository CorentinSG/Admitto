import { SCREEN_IDS, type Answers, type CareerGoal, type ScreenId } from "./types";

/**
 * Logique conditionnelle du questionnaire (CDC §12.4).
 *
 * Le cahier des charges impose quatre comportements :
 *  1. une personne déjà inscrite en LL.M. ne voit pas les questions de sélection
 *     initiale (choix de la rentrée visée : elle indique une date de début) ;
 *  2. une personne de nationalité américaine ne reçoit pas les branches liées au
 *     besoin de visa — l'écran de statut est le dernier du parcours, la
 *     conséquence se joue donc en aval (axe migratoire neutralisé, bloc visa
 *     masqué dans le résultat) ;
 *  3. une personne en licence peut répondre « trop tôt pour le dire » sur son
 *     objectif professionnel ;
 *  4. un avocat reçoit les questions adaptées à son statut professionnel
 *     (écran barreau étranger, année d'admission, statut actif).
 *
 * Contrainte dure : douze écrans visibles au maximum (CDC §12.2).
 */

/** L'écran « barreau étranger » n'est montré que lorsqu'il est pertinent. */
export function showsForeignBarScreen(answers: Answers): boolean {
  if (answers.status === "LAWYER_EXPLORING" || answers.status === "TARGETING_BAR") return true;
  return (
    answers.education === "CRFPA" ||
    answers.education === "CAPA" ||
    answers.education === "DOCTORAT"
  );
}

/** « Trop tôt pour le dire » n'est proposé qu'aux profils très amont. */
export function allowsTooEarlyGoal(answers: Answers): boolean {
  return answers.education === "LICENCE" || answers.status === "EXPLORING_LLM";
}

/** Une personne déjà admise ou inscrite indique une date de début, pas une rentrée visée. */
export function isAlreadyEnrolled(answers: Answers): boolean {
  return answers.status === "ADMITTED_OR_ENROLLED";
}

/** Aucune branche relative au besoin de visa pour un double national américain. */
export function needsVisaBranch(answers: Answers): boolean {
  return answers.usStatus !== "US_DUAL_NATIONAL";
}

/**
 * Écrans qui ne sont PAS montrés à tout le monde.
 *
 * Doit rester exactement l'ensemble des écrans que `visibleScreens` peut
 * omettre — un test de parité le vérifie contre des profils réels, parce que
 * les deux ne peuvent pas diverger sans conséquence : l'entonnoir mesure
 * l'abandon en comparant un écran au suivant, et comparer à un écran que la
 * moitié des gens ne voit jamais fabrique des abandons qui n'ont pas eu lieu.
 */
export const CONDITIONAL_SCREENS = ["foreignBar"] as const satisfies readonly ScreenId[];

export const isConditionalScreen = (id: ScreenId): boolean =>
  (CONDITIONAL_SCREENS as readonly ScreenId[]).includes(id);

/** Écrans effectivement visibles, dans l'ordre. */
export function visibleScreens(answers: Answers): ScreenId[] {
  return SCREEN_IDS.filter((id) => (id === "foreignBar" ? showsForeignBarScreen(answers) : true));
}

/** Options d'objectif professionnel effectivement proposées. */
export function careerGoalOptions(answers: Answers, all: readonly CareerGoal[]): CareerGoal[] {
  return all.filter((goal) => goal !== "TOO_EARLY" || allowsTooEarlyGoal(answers));
}

/** Progression affichée : index de l'écran courant sur le nombre d'écrans visibles. */
export function progress(answers: Answers, current: ScreenId): { step: number; total: number } {
  const screens = visibleScreens(answers);
  return { step: screens.indexOf(current) + 1, total: screens.length };
}
