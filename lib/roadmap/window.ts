import type { Answers } from "@/lib/questionnaire/types";
import type { Task } from "./types";
import { applicableTasks } from "./generate";

/**
 * La rentrée visée est-elle encore tenable ? (constat, pas conseil)
 *
 * Le produit sait deux choses qu'il ne rapprochait jamais : combien de mois
 * séparent la personne de la rentrée qu'elle vise, et combien de mois son
 * calendrier suppose — la tâche la plus amont se situe quatorze mois avant.
 * Quand la première est plus petite que la seconde, la feuille de route naît
 * avec des tâches déjà dépassées, et personne ne le lui dit.
 *
 * Ce module ne fait que l'arithmétique et la nomme. Il ne décide rien : ni
 * décaler la rentrée, ni comprimer le calendrier — comprimer reviendrait à
 * affirmer qu'un dossier se monte en trois mois, ce que la feuille de route
 * existe pour démentir. Il énonce l'écart et nomme le cycle suivant, à charge
 * pour la personne de trancher.
 *
 * Rend `null` quand la question ne se pose pas : rentrée non décidée, parcours
 * déjà commencé, ou aucune tâche datée.
 */
export interface IntakeWindow {
  /** Mois restants avant la rentrée visée. */
  monthsLeft: number;
  /** Mois que le calendrier suppose, de la tâche la plus amont à la rentrée. */
  monthsNeeded: number;
  /** Tâches dont l'échéance est déjà passée. */
  behindCount: number;
  /** Nombre total de tâches datées. */
  datedCount: number;
  /** Vrai lorsque le temps restant ne couvre pas le calendrier complet. */
  tight: boolean;
  /** Année civile de la rentrée visée, et de la suivante. */
  targetYear: number;
  nextYear: number;
}

const OFFSET_YEARS: Record<string, number> = { Y1: 1, Y2: 2, Y3: 3, LATER: 4 };

export function intakeWindow(
  tasks: Task[],
  answers: Answers,
  reference: Date
): IntakeWindow | null {
  const offset = answers.intake ? OFFSET_YEARS[answers.intake] : undefined;
  // `UNDECIDED` et `ALREADY_STARTED` sont absents de la table : dans les deux
  // cas il n'y a pas de fenêtre à mesurer, et l'écran le dit déjà autrement.
  if (offset === undefined) return null;

  const dated = applicableTasks(tasks).filter((task) => task.dueDate !== null);
  if (dated.length === 0) return null;

  const intake = new Date(Date.UTC(reference.getUTCFullYear() + offset, 7, 15));
  const monthsLeft = Math.max(
    0,
    (intake.getUTCFullYear() - reference.getUTCFullYear()) * 12 +
      (intake.getUTCMonth() - reference.getUTCMonth())
  );

  /*
   * Ce que le calendrier suppose : la tâche la plus AMONT donne la longueur
   * du chemin. On la lit sur les tâches réellement retenues pour ce profil,
   * pas sur le catalogue — un parcours qui n'a que des tâches tardives n'a
   * pas besoin de quatorze mois.
   */
  const monthsNeeded = Math.max(...dated.map((task) => task.monthsBeforeIntake));

  const today = reference.toISOString().slice(0, 10);
  const behindCount = dated.filter((task) => task.dueDate! < today).length;

  return {
    monthsLeft,
    monthsNeeded,
    behindCount,
    datedCount: dated.length,
    tight: monthsLeft < monthsNeeded,
    targetYear: intake.getUTCFullYear(),
    nextYear: intake.getUTCFullYear() + 1,
  };
}
