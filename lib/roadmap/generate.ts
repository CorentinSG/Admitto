import { TASK_TEMPLATES } from "@/content/roadmap-tasks";
import { PHASES, type JourneyType, type Phase } from "@/lib/profile/derive";
import type { Answers } from "@/lib/questionnaire/types";
import type { Task, TaskStatus, TaskTemplate } from "./types";

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
  journeyType: JourneyType | null
): TaskStatus {
  if (!journeyType || !template.journeyTypes.includes(journeyType)) return "NOT_APPLICABLE";
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
      status: initialStatus(template, journeyType),
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
