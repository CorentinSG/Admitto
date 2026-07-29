import { applicableTasks } from "@/lib/roadmap/generate";
import type { Task } from "@/lib/roadmap/types";

/**
 * Notifications d'échéances (CDC §22 et §23).
 *
 * Trois principes portent tout le module.
 *
 * 1. **Rien sur ce qui ne dépend plus de l'utilisateur.** Une tâche accomplie
 *    ou sans objet ne produit aucun rappel. Une tâche en attente d'un tiers en
 *    produit encore : l'échéance court même si l'action est chez quelqu'un
 *    d'autre, et c'est justement le moment de relancer.
 *
 * 2. **Jamais de rattrapage en rafale.** Si personne n'a été prévenu depuis
 *    quarante jours, on n'envoie pas quatre rappels d'un coup : seul le palier
 *    le plus urgent encore dû part. Un rattrapage bruyant se fait ignorer, et
 *    l'échéance suivante avec lui.
 *
 * 3. **Base contractuelle.** Ces rappels exécutent le service payé. Ils ne
 *    sont pas promotionnels et ne peuvent pas être requalifiés en tels.
 */

/** Paliers d'alerte, en jours avant l'échéance. Du plus lointain au plus proche. */
export const NOTICE_DAYS = [30, 14, 7, 1] as const;

export type NoticeLevel = (typeof NOTICE_DAYS)[number] | "OVERDUE";

export interface DeadlineNotice {
  /** Identifiant stable : c'est lui qui rend l'envoi idempotent. */
  id: string;
  taskId: string;
  taskTitle: string;
  dueDate: string;
  level: NoticeLevel;
  /** Jours restants à la date de référence. Négatif si l'échéance est passée. */
  daysRemaining: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Différence en jours pleins entre deux dates ISO, en UTC. */
function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((Date.parse(`${toIso}T00:00:00Z`) - Date.parse(`${fromIso}T00:00:00Z`)) / DAY_MS);
}

function noticeId(taskId: string, level: NoticeLevel): string {
  return `${taskId}:${level}`;
}

/**
 * Rang d'urgence : 0 est le plus urgent. Sert à ne jamais envoyer un rappel
 * moins urgent que le dernier parti — « il reste 7 jours » après « c'est
 * demain » donnerait l'impression que l'échéance s'est éloignée.
 */
function urgencyRank(level: NoticeLevel): number {
  return level === "OVERDUE" ? 0 : NOTICE_DAYS.length - NOTICE_DAYS.indexOf(level);
}

/**
 * Paliers atteints pour une tâche, du plus urgent au moins urgent.
 * « Atteint » signifie que la date de référence a franchi le palier, pas qu'il
 * tombe exactement ce jour-là : un rappel manqué d'un jour reste dû.
 */
function reachedLevels(daysRemaining: number): NoticeLevel[] {
  if (daysRemaining < 0) return ["OVERDUE"];
  return NOTICE_DAYS.filter((d) => daysRemaining <= d).sort((a, b) => a - b);
}

/** Rang du rappel le plus urgent déjà envoyé pour cette tâche, `Infinity` si aucun. */
function mostUrgentSent(taskId: string, alreadySent: readonly string[]): number {
  let best = Number.POSITIVE_INFINITY;
  for (const level of [...NOTICE_DAYS, "OVERDUE" as const]) {
    if (alreadySent.includes(noticeId(taskId, level))) {
      best = Math.min(best, urgencyRank(level));
    }
  }
  return best;
}

/**
 * Rappels dus à la date de référence, hors ceux déjà envoyés.
 * Au plus un par tâche — le plus urgent (voir principe 2).
 */
export function dueNotices(
  tasks: Task[],
  reference: Date,
  alreadySent: readonly string[] = []
): DeadlineNotice[] {
  const today = reference.toISOString().slice(0, 10);
  const notices: DeadlineNotice[] = [];

  for (const task of applicableTasks(tasks)) {
    if (task.status === "DONE" || task.dueDate === null) continue;

    const daysRemaining = daysBetween(today, task.dueDate);
    const sentRank = mostUrgentSent(task.id, alreadySent);

    for (const level of reachedLevels(daysRemaining)) {
      // Un palier moins urgent qu'un rappel déjà parti est périmé, pas en retard.
      if (urgencyRank(level) >= sentRank) continue;
      const id = noticeId(task.id, level);
      if (alreadySent.includes(id)) continue;
      notices.push({
        id,
        taskId: task.id,
        taskTitle: task.title,
        dueDate: task.dueDate,
        level,
        daysRemaining,
      });
      break; // Un seul rappel par tâche et par passage.
    }
  }

  // Les échéances les plus proches d'abord : si un envoi partiel échoue, ce
  // sont les rappels utiles qui sont partis.
  return notices.sort((a, b) => a.daysRemaining - b.daysRemaining);
}

/**
 * Récapitulatif des échéances, une par ligne.
 *
 * Un rappel par email donnerait quatre messages simultanés le jour où quatre
 * échéances se rejoignent — ce qui se lit comme du démarchage et finit en
 * indésirables, emportant les rappels suivants.
 */
export function deadlineList(notices: DeadlineNotice[]): string {
  return notices.map((n) => `— ${n.taskTitle} : ${n.dueDate} (${noticeLead(n)})`).join("\n");
}

/** Formulation du délai, à insérer dans l'email. */
export function noticeLead(notice: DeadlineNotice): string {
  if (notice.level === "OVERDUE") {
    const late = Math.abs(notice.daysRemaining);
    return late === 1 ? "était à faire hier" : `est en retard de ${late} jours`;
  }
  if (notice.daysRemaining <= 0) return "est à faire aujourd'hui";
  if (notice.daysRemaining === 1) return "est à faire demain";
  return `est à faire dans ${notice.daysRemaining} jours`;
}
