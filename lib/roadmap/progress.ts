import { applicableTasks, phaseIndex } from "./generate";
import { MILESTONES, type Milestone, type Task } from "./types";
import type { Phase } from "@/lib/profile/derive";

/**
 * Progression et gamification professionnelle (CDC §24).
 *
 * La V1 n'inclut QUE : progression par phases, checklists, Next Best Action,
 * Milestone Challenges et statistiques personnelles. Elle exclut points
 * d'expérience, niveaux, séries, classements, monnaie virtuelle et badges
 * décoratifs. Ne rien ajouter ici qui ressemble à un jeu.
 */

export interface Progress {
  /** Tâches accomplies sur tâches applicables. */
  done: number;
  total: number;
  /** Pourcentage entier, 0 quand aucune tâche n'est applicable. */
  percent: number;
}

export function computeProgress(tasks: Task[]): Progress {
  const applicable = applicableTasks(tasks);
  const done = applicable.filter((t) => t.status === "DONE").length;
  return {
    done,
    total: applicable.length,
    percent: applicable.length === 0 ? 0 : Math.round((done / applicable.length) * 100),
  };
}

export interface PhaseProgress extends Progress {
  phase: Phase;
  /** Vrai quand toutes les tâches applicables de la phase sont accomplies. */
  complete: boolean;
}

export function progressByPhase(tasks: Task[]): PhaseProgress[] {
  const applicable = applicableTasks(tasks);
  const phases = [...new Set(applicable.map((t) => t.phase))].sort(
    (a, b) => phaseIndex(a) - phaseIndex(b)
  );

  return phases.map((phase) => {
    const inPhase = applicable.filter((t) => t.phase === phase);
    const done = inPhase.filter((t) => t.status === "DONE").length;
    return {
      phase,
      done,
      total: inPhase.length,
      percent: Math.round((done / inPhase.length) * 100),
      complete: done === inPhase.length,
    };
  });
}

export interface MilestoneState {
  milestone: Milestone;
  /** Tâches contribuant au challenge, dans la feuille de route de l'utilisateur. */
  total: number;
  done: number;
  achieved: boolean;
  /** Vrai lorsque le challenge ne concerne pas ce profil. */
  notApplicable: boolean;
}

/**
 * État des Milestone Challenges. Un challenge n'est acquis que si toutes ses
 * tâches contributrices sont accomplies — et ces tâches sont, par construction,
 * des actions contrôlées par l'utilisateur.
 */
export function milestoneStates(tasks: Task[]): MilestoneState[] {
  return MILESTONES.map((milestone) => {
    const contributing = applicableTasks(tasks).filter((t) => t.milestone === milestone);
    const done = contributing.filter((t) => t.status === "DONE").length;
    return {
      milestone,
      total: contributing.length,
      done,
      achieved: contributing.length > 0 && done === contributing.length,
      notApplicable: contributing.length === 0,
    };
  });
}

/** Statistiques personnelles affichées au tableau de bord (CDC §24). */
export interface PersonalStats {
  tasksDone: number;
  tasksRemaining: number;
  /** Tâches en attente d'un tiers : hors du contrôle de l'utilisateur. */
  waitingOnOthers: number;
  /** Échéances dépassées, non accomplies. */
  overdue: number;
  nextDeadline: string | null;
}

export function personalStats(tasks: Task[], reference: Date): PersonalStats {
  const applicable = applicableTasks(tasks);
  const today = reference.toISOString().slice(0, 10);
  const open = applicable.filter((t) => t.status !== "DONE");

  const upcoming = open
    .map((t) => t.dueDate)
    .filter((d): d is string => d !== null && d >= today)
    .sort();

  return {
    tasksDone: applicable.filter((t) => t.status === "DONE").length,
    tasksRemaining: open.length,
    waitingOnOthers: applicable.filter((t) => t.status === "WAITING_THIRD_PARTY").length,
    overdue: open.filter((t) => t.dueDate !== null && t.dueDate < today).length,
    nextDeadline: upcoming[0] ?? null,
  };
}
