import { phaseIndex } from "./generate";
import { NOT_ACTIONABLE, type Importance, type Task } from "./types";

/**
 * Next Best Action (CDC §23).
 *
 * Principe UX imposé par le cahier des charges : « l'utilisateur ne doit jamais
 * devoir parcourir toute la roadmap pour comprendre ce qu'il doit faire
 * aujourd'hui. » Le tableau de bord présente donc toujours une action, et une
 * seule.
 */

export interface NextBestAction {
  task: Task;
  /** Pourquoi cette action maintenant. */
  reason: string;
  /** Temps nécessaire, formaté. */
  duration: string;
  /** Date d'échéance, ou null si la rentrée n'est pas décidée. */
  dueDate: string | null;
  /** Risque encouru en cas de retard. */
  delayRisk: string;
  /** Lien vers la ressource associée, le cas échéant. */
  resourceUrl: string | null;
  /** Vrai lorsque l'échéance est dépassée ou imminente. */
  urgent: boolean;
}

const IMPORTANCE_RANK: Record<Importance, number> = { CRITICAL: 0, HIGH: 1, NORMAL: 2 };

const URGENT_WINDOW_DAYS = 30;

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.round((minutes / 60) * 10) / 10;
  return `≈ ${hours % 1 === 0 ? hours : hours.toFixed(1)} h`;
}

function reasonFor(task: Task, urgent: boolean): string {
  if (urgent) return "L'échéance est proche ou dépassée.";
  if (task.importance === "CRITICAL") {
    return "Cette action conditionne les suivantes de la même phase.";
  }
  return "C'est la prochaine action de votre phase actuelle.";
}

/**
 * Sélection : parmi les tâches sur lesquelles l'utilisateur peut agir, la plus
 * urgente d'abord, puis la plus importante, puis la plus amont dans le parcours.
 *
 * Les tâches en attente d'un tiers ou bloquées sont écartées : les proposer
 * comme « prochaine action » serait mensonger, l'utilisateur ne peut pas les
 * faire avancer.
 */
export function selectNextBestAction(tasks: Task[], reference: Date): NextBestAction | null {
  const candidates = tasks.filter((t) => !NOT_ACTIONABLE.includes(t.status));
  if (candidates.length === 0) return null;

  const today = reference.toISOString().slice(0, 10);
  const horizon = new Date(reference);
  horizon.setUTCDate(horizon.getUTCDate() + URGENT_WINDOW_DAYS);
  const horizonIso = horizon.toISOString().slice(0, 10);

  const isUrgent = (task: Task) => task.dueDate !== null && task.dueDate <= horizonIso;

  const sorted = [...candidates].sort((a, b) => {
    const urgencyDiff = Number(isUrgent(b)) - Number(isUrgent(a));
    if (urgencyDiff !== 0) return urgencyDiff;

    if (a.dueDate && b.dueDate && a.dueDate !== b.dueDate) {
      return a.dueDate.localeCompare(b.dueDate);
    }
    // Une tâche sans échéance passe après une tâche datée.
    if (a.dueDate === null && b.dueDate !== null) return 1;
    if (b.dueDate === null && a.dueDate !== null) return -1;

    const byImportance = IMPORTANCE_RANK[a.importance] - IMPORTANCE_RANK[b.importance];
    if (byImportance !== 0) return byImportance;

    return phaseIndex(a.phase) - phaseIndex(b.phase);
  });

  const task = sorted[0];
  const urgent = isUrgent(task);

  return {
    task,
    reason: reasonFor(task, urgent),
    duration: formatDuration(task.estimatedMinutes),
    dueDate: task.dueDate,
    delayRisk: task.delayRisk,
    resourceUrl: task.moduleSlug ? `/modules/${task.moduleSlug}` : null,
    urgent: urgent && task.dueDate !== null && task.dueDate >= today ? true : urgent,
  };
}
