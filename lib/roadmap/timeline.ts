import type { Task, TaskStatus } from "./types";
import type { Deadline } from "@/lib/deadlines/compute";
import { applicableTasks } from "./generate";

/**
 * Timeline du parcours (CDC §22) — le modèle, pur et daté par paramètre.
 *
 * La feuille de route est une LISTE : elle dit quoi faire, pas où l'on se
 * situe. Ce module projette les mêmes tâches sur un axe de temps — du départ
 * à la dernière échéance — pour qu'un regard suffise à lire : ce qui est
 * derrière (accompli ou en retard), où l'on est aujourd'hui, ce qui approche,
 * ce qui est loin. Elle avance mécaniquement : l'état vient des statuts de la
 * feuille de route, jamais d'un compteur propre — cocher une tâche LÀ-BAS la
 * remplit ICI, il n'existe pas de second état à désynchroniser.
 *
 * Tout calcul prend `reference` en paramètre : jamais de `Date.now()`
 * implicite (règle du dépôt — déterminisme des tests).
 */

/** Lecture d'une tâche sur l'axe. Un seul mot par état, exclusifs. */
export const TIMELINE_STATES = [
  "DONE", // accomplie (ou accomplie côté utilisateur, tiers en attente)
  "OVERDUE", // échéance passée sans accomplissement
  "URGENT", // échéance dans la fenêtre d'alerte
  "IN_PROGRESS", // commencée
  "UPCOMING", // à venir, hors fenêtre d'alerte
] as const;
export type TimelineState = (typeof TIMELINE_STATES)[number];

/** En deçà, une échéance « approche » : même fenêtre que les rappels (§22). */
export const URGENT_WINDOW_DAYS = 30;

export interface TimelineEntry {
  id: string;
  title: string;
  status: TaskStatus;
  state: TimelineState;
  /** Échéance ISO `AAAA-MM-JJ`. */
  date: string;
  /** Position sur l'axe, 0–100, proportionnelle au temps. */
  position: number;
  /** Jours restants (négatif si passée) — affiché tel quel. */
  daysLeft: number;
  toolHref?: string;
  toolLabel?: string;
  delayRisk: string;
}

export interface TimelineTick {
  /** Premier jour du mois, ISO — le libellé est formaté côté serveur. */
  date: string;
  position: number;
}

/**
 * Échéance officielle sur l'axe (CDC §15) : celles du diagnostic — test
 * d'anglais, dossiers, visa, évaluation. Distinctes des tâches : une tâche
 * est un travail à soi, une échéance est une porte qui ferme. Les deux
 * cohabitent sur le même axe pour que « ce que je fais » se lise contre
 * « ce qui m'attend ».
 */
export interface TimelineDeadline {
  key: string;
  label: string;
  note: string;
  date: string;
  position: number;
  daysLeft: number;
  passed: boolean;
}

export interface TimelineModel {
  entries: TimelineEntry[];
  deadlines: TimelineDeadline[];
  /** Position d'aujourd'hui sur l'axe, 0–100. */
  todayPosition: number;
  ticks: TimelineTick[];
  doneCount: number;
  totalCount: number;
  /** Tâches applicables mais sans échéance (rentrée non décidée) : dites, pas cachées. */
  undatedCount: number;
  /**
   * Les prochaines tâches À COMMENCER : non entamées, la plus proche d'abord —
   * une tâche en retard est la plus urgente à commencer, elle vient en tête.
   * Des identifiants, pas des copies : la liste pointe les entrées de l'axe.
   */
  toStartIds: string[];
}

const DAY = 86_400_000;

const dayOf = (iso: string) => iso.slice(0, 10);
const toMs = (isoDay: string) => new Date(`${isoDay}T00:00:00.000Z`).getTime();

/**
 * L'accomplissement retient DONE et « en attente d'un tiers » : la part de
 * l'utilisateur est faite, c'est ce que la timeline mesure — le même choix
 * que la progression (§22).
 */
const isDone = (status: TaskStatus) => status === "DONE" || status === "WAITING_THIRD_PARTY";

function stateOf(task: Task, todayIso: string, reference: Date): TimelineState {
  if (isDone(task.status)) return "DONE";
  const date = dayOf(task.dueDate!);
  if (date < todayIso) return "OVERDUE";
  const days = Math.ceil((toMs(date) - reference.getTime()) / DAY);
  if (days <= URGENT_WINDOW_DAYS) return "URGENT";
  if (task.status === "IN_PROGRESS") return "IN_PROGRESS";
  return "UPCOMING";
}

/**
 * Construit la timeline. Rend `null` si aucune tâche n'est datée : sans
 * rentrée décidée il n'y a pas d'axe de temps, et en dessiner un serait une
 * invention — l'appelant affiche pourquoi, au lieu d'un axe vide.
 */
export function buildTimeline(
  tasks: Task[],
  reference: Date,
  officialDeadlines: Deadline[] = []
): TimelineModel | null {
  const applicable = applicableTasks(tasks);
  const dated = applicable
    .filter((task) => task.dueDate !== null)
    .sort((a, b) => a.dueDate!.localeCompare(b.dueDate!));

  if (dated.length === 0) return null;

  const todayIso = reference.toISOString().slice(0, 10);
  const todayMs = toMs(todayIso);

  // L'axe couvre du plus ancien repère (échéance passée comprise : un retard
  // se VOIT derrière soi, il ne sort pas de l'écran) à la dernière échéance —
  // tâches ET échéances officielles : un marqueur hors axe serait invisible.
  const deadlineMs = officialDeadlines.map((deadline) => toMs(dayOf(deadline.date)));
  const firstMs = Math.min(todayMs, toMs(dayOf(dated[0].dueDate!)), ...deadlineMs);
  const lastMs = Math.max(todayMs, toMs(dayOf(dated[dated.length - 1].dueDate!)), ...deadlineMs);
  // Une seule échéance, le jour même : l'étendue serait nulle, chaque position
  // une division par zéro. Un mois d'étendue rend l'axe lisible.
  const span = Math.max(lastMs - firstMs, 30 * DAY);

  const position = (ms: number) => Math.round(((ms - firstMs) / span) * 1000) / 10;

  const entries: TimelineEntry[] = dated.map((task) => {
    const date = dayOf(task.dueDate!);
    return {
      id: task.id,
      title: task.title,
      status: task.status,
      state: stateOf(task, todayIso, reference),
      date,
      position: position(toMs(date)),
      daysLeft: Math.ceil((toMs(date) - todayMs) / DAY),
      toolHref: task.toolHref,
      toolLabel: task.toolLabel,
      delayRisk: task.delayRisk,
    };
  });

  // Graduations : le premier jour de chaque mois couvert. Au-delà de douze,
  // une graduation sur deux — des libellés qui se chevauchent ne gradent rien.
  const ticks: TimelineTick[] = [];
  const cursor = new Date(firstMs);
  cursor.setUTCDate(1);
  cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  while (cursor.getTime() <= lastMs) {
    ticks.push({ date: cursor.toISOString().slice(0, 10), position: position(cursor.getTime()) });
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  const thinned = ticks.length > 12 ? ticks.filter((_, i) => i % 2 === 0) : ticks;

  const deadlines: TimelineDeadline[] = [...officialDeadlines]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((deadline) => {
      const date = dayOf(deadline.date);
      return {
        key: deadline.key,
        label: deadline.label,
        note: deadline.note,
        date,
        position: position(toMs(date)),
        daysLeft: Math.ceil((toMs(date) - todayMs) / DAY),
        passed: date < todayIso,
      };
    });

  // À commencer : non entamées (TODO ou bloquées — débloquer, c'est commencer),
  // la plus proche d'abord. `entries` est déjà trié par date, et une tâche en
  // retard précède les autres naturellement.
  const toStartIds = entries
    .filter((entry) => entry.status === "TODO" || entry.status === "BLOCKED")
    .slice(0, 3)
    .map((entry) => entry.id);

  return {
    entries,
    deadlines,
    todayPosition: position(todayMs),
    ticks: thinned,
    doneCount: entries.filter((entry) => entry.state === "DONE").length,
    totalCount: entries.length,
    undatedCount: applicable.length - dated.length,
    toStartIds,
  };
}
