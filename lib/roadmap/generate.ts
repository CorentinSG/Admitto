import { TASK_TEMPLATES } from "@/content/roadmap-tasks";
import { PHASES, type JourneyType, type Phase } from "@/lib/profile/derive";
import type { Answers } from "@/lib/questionnaire/types";
import type { Task, TaskStatus, TaskTemplate } from "./types";
import { needsVisaBranch } from "@/lib/questionnaire/visibility";

/**
 * Génération de la feuille de route (CDC §22).
 *
 * Le parcours type contrôle les phases, les tâches, les échéances et les
 * alertes (CDC §20). Une tâche hors périmètre pour un profil n'est pas
 * masquée : elle existe en `NOT_APPLICABLE`, ce qui rend le raisonnement
 * lisible plutôt que magique.
 */

/** Ordre canonique des phases, utilisé pour trier et pour situer l'utilisateur. */
export const PHASE_ORDER: Phase[] = [...PHASES];

export function phaseIndex(phase: Phase): number {
  return PHASE_ORDER.indexOf(phase);
}

/** Échéance d'une tâche, calculée depuis la rentrée visée. */
export function dueDateFor(
  template: TaskTemplate,
  answers: Answers,
  reference: Date
): string | null {
  if (!answers.intake || answers.intake === "UNDECIDED") return null;

  const offsetYears = { Y1: 1, Y2: 2, Y3: 3, LATER: 4, ALREADY_STARTED: 0 }[answers.intake];
  const intake = new Date(Date.UTC(reference.getUTCFullYear() + offsetYears, 7, 15));

  /*
   * « Mon LL.M. a déjà commencé » : la rentrée est PASSÉE, par définition.
   *
   * Le décalage de zéro année la plaçait au 15 août de l'année COURANTE —
   * c'est-à-dire dans le futur pour qui s'inscrit entre janvier et mi-août,
   * soit sept mois sur douze. Mesuré : une inscription en février datait six
   * tâches dans l'avenir, dont « finaliser votre liste d'écoles » pour le mois
   * d'avril suivant. Le produit demandait de choisir ses écoles à quelqu'un
   * qui était déjà en cours de scolarité.
   *
   * On recule donc d'un an tant que la rentrée calculée n'est pas derrière
   * nous. La règle qui suit peut alors s'appliquer toute l'année, et non
   * seulement après le 15 août.
   */
  if (answers.intake === "ALREADY_STARTED" && intake > reference) {
    intake.setUTCFullYear(intake.getUTCFullYear() - 1);
  }

  /*
   * Rentrée déjà passée : les tâches d'AVANT la rentrée n'ont plus de date.
   *
   * « J'ai déjà commencé » donne un décalage de zéro année, donc une rentrée
   * au 15 août de l'année courante. Passée cette date, tout ce qui se compte
   * « N mois avant » tombe dans le passé : mesuré, 11 tâches sur 11 et 12 sur
   * 12 marquées à rattraper dès le premier jour. Le pire accueil du produit
   * était réservé au profil le plus avancé.
   *
   * Ces dates ne sont pas seulement démoralisantes, elles sont FAUSSES : une
   * échéance « douze mois avant la rentrée » n'a aucun sens pour qui est déjà
   * entré. La tâche reste, sans date — elle rejoint les tâches non datées que
   * la timeline sait déjà annoncer. Les tâches d'APRÈS la rentrée (décalage
   * négatif : évaluation, barreau, admission) gardent la leur, et ce sont
   * précisément celles qui comptent à ce stade.
   */
  if (intake < reference && template.monthsBeforeIntake > 0) return null;

  const due = new Date(
    Date.UTC(intake.getUTCFullYear(), intake.getUTCMonth() - template.monthsBeforeIntake, 15)
  );
  return due.toISOString().slice(0, 10);
}

/**
 * Statut initial d'une tâche.
 *
 * Une tâche hors parcours type est `NOT_APPLICABLE`. Toutes les autres partent
 * à `TODO`, y compris celles des phases antérieures à la phase déclarée.
 *
 * Présumer accomplies les tâches amont serait doublement faux : la progression
 * afficherait un avancement que l'utilisateur n'a pas réalisé, et un Milestone
 * Challenge serait acquis sans qu'aucune action ne l'ait mérité — précisément
 * l'artifice de gamification que le CDC §24 proscrit. C'est l'utilisateur qui
 * coche, jamais le système à sa place.
 */
function initialStatus(
  template: TaskTemplate,
  journeyType: JourneyType | null,
  answers: Answers
): TaskStatus {
  if (!journeyType || !template.journeyTypes.includes(journeyType)) return "NOT_APPLICABLE";

  /*
   * Hors périmètre au vu d'une réponse EXPLICITE, et non d'une présomption.
   *
   * Un binational américain n'a pas de statut étudiant à demander. Le
   * questionnaire le sait déjà — `needsVisaBranch` lui épargne la branche
   * correspondante — mais la feuille de route lui proposait quand même la
   * tâche. Répondre à une question puis se voir ignoré est pire que ne pas
   * avoir été interrogé.
   *
   * `NOT_APPLICABLE` et non `DONE` : la tâche n'a pas été accomplie, elle ne
   * le concerne pas. La progression compte les tâches applicables, donc le
   * dénominateur s'ajuste au lieu que le numérateur soit gonflé — ce qui
   * serait l'artifice que le CDC §24 proscrit.
   */
  if (template.phase === "VISA" && !needsVisaBranch(answers)) return "NOT_APPLICABLE";

  return "TODO";
}

export function generateRoadmap(
  answers: Answers,
  journeyType: JourneyType | null,
  reference: Date,
  templates: TaskTemplate[] = TASK_TEMPLATES
): Task[] {
  return templates
    .map((template) => ({
      ...template,
      status: initialStatus(template, journeyType, answers),
      dueDate: dueDateFor(template, answers, reference),
    }))
    .sort((a, b) => {
      const byPhase = phaseIndex(a.phase) - phaseIndex(b.phase);
      if (byPhase !== 0) return byPhase;
      return b.monthsBeforeIntake - a.monthsBeforeIntake; // du plus lointain au plus proche
    });
}

/** Tâches applicables, c'est-à-dire hors périmètre exclu. */
export function applicableTasks(tasks: Task[]): Task[] {
  return tasks.filter((t) => t.status !== "NOT_APPLICABLE");
}

/** Phases effectivement présentes dans la feuille de route d'un profil. */
export function activePhases(tasks: Task[]): Phase[] {
  const present = new Set(applicableTasks(tasks).map((t) => t.phase));
  return PHASE_ORDER.filter((phase) => present.has(phase));
}
