import type { Deadline } from "@/lib/deadlines/compute";
import type { Task } from "./types";
import { buildTimeline } from "./timeline";
import { dashboard, STATUS_LABELS } from "@/content/dashboard";
import type { TimelineView } from "@/app/(app)/app/roadmap/Timeline";

/**
 * Projection du modèle de timeline vers la vue (CDC §22).
 *
 * Un seul endroit, parce que DEUX pages rendent la même timeline — feuille de
 * route et tableau de bord — et que deux projections divergeraient sans que
 * rien ne le signale : mêmes libellés, mêmes dates, même axe, ou rien.
 *
 * Tout le formatage de dates vit ICI, côté serveur, en UTC : un composant
 * client qui formate une date fait diverger les deux rendus à cheval sur
 * minuit (règle du dépôt). Le client ne reçoit que des chaînes prêtes.
 */

const dateFr = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

const monthFr = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("fr-FR", {
    month: "short",
    year: "2-digit",
    timeZone: "UTC",
  });

const leftLabel = (daysLeft: number): string =>
  daysLeft < 0 ? dashboard.timeline.lateBy(-daysLeft) : dashboard.timeline.inDays(daysLeft);

export function buildTimelineView(
  tasks: Task[],
  deadlines: Deadline[],
  reference: Date,
  /** Jour d'arrivée : départage « à rattraper » de « en retard ». */
  startedOn: string | null = null
): TimelineView | null {
  const model = buildTimeline(tasks, reference, deadlines, startedOn);
  if (!model) return null;

  const points = model.entries.map((entry) => ({
    id: entry.id,
    title: entry.title,
    state: entry.state,
    position: entry.position,
    dateLabel: dateFr(entry.date),
    leftLabel:
      entry.state === "DONE"
        ? STATUS_LABELS[entry.status]
        : // « en retard de 240 jours » sur une tâche déjà passée à l'inscription
          // compte un retard qui n'appartient pas à la personne.
          entry.state === "BEHIND"
          ? dashboard.timeline.behind
          : leftLabel(entry.daysLeft),
    statusLabel: STATUS_LABELS[entry.status],
    delayRisk: entry.delayRisk,
    toolHref: entry.toolHref,
    toolLabel: entry.toolLabel,
  }));

  return {
    points,
    deadlines: model.deadlines.map((deadline) => ({
      key: deadline.key,
      label: deadline.label,
      note: deadline.note,
      position: deadline.position,
      dateLabel: dateFr(deadline.date),
      leftLabel: leftLabel(deadline.daysLeft),
      passed: deadline.passed,
    })),
    // Des références aux points de l'axe, pas des copies : la liste « à
    // commencer » sélectionne les mêmes entrées que les pastilles.
    toStart: model.toStartIds
      .map((id) => points.find((point) => point.id === id))
      .filter((point): point is (typeof points)[number] => point !== undefined),
    todayPosition: model.todayPosition,
    ticks: model.ticks.map((tick) => ({ label: monthFr(tick.date), position: tick.position })),
    doneCount: model.doneCount,
    totalCount: model.totalCount,
    undatedNote: model.undatedCount > 0 ? dashboard.timeline.undated(model.undatedCount) : "",
  };
}
