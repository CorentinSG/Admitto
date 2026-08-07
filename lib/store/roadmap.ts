import type { TaskStatus } from "@/lib/roadmap/types";
import { db, usingDatabase } from "@/lib/db/client";

/**
 * Statuts et notes de tâches par évaluation (CDC §22).
 *
 * Prisma quand `DATABASE_URL` est défini, mémoire du processus sinon — voir
 * `assessments.ts` pour le raisonnement.
 *
 * Seuls les écarts au statut initial sont conservés ; la feuille de route
 * elle-même est régénérée depuis les modèles, ce qui permet d'ajouter des
 * tâches sans migration de données. Une note se conserve de la même façon :
 * elle vit sur la même ligne que le statut, si bien qu'écrire une note sur une
 * tâche encore à son statut d'origine matérialise ce statut — c'est le prix,
 * assumé, de ne pas tenir deux tables à aligner.
 */

interface TaskEntry {
  status: TaskStatus;
  note: string | null;
}

const globalStore = globalThis as typeof globalThis & {
  __admittoTaskEntries?: Map<string, Map<string, TaskEntry>>;
};
const memory = (globalStore.__admittoTaskEntries ??= new Map());

const forAssessment = (assessmentId: string): Map<string, TaskEntry> => {
  const existing = memory.get(assessmentId);
  if (existing) return existing;
  const created = new Map<string, TaskEntry>();
  memory.set(assessmentId, created);
  return created;
};

export const roadmapStore = {
  async statuses(assessmentId: string): Promise<Record<string, TaskStatus>> {
    if (!usingDatabase()) {
      return Object.fromEntries(
        [...(memory.get(assessmentId) ?? new Map())].map(([taskId, entry]) => [taskId, entry.status])
      );
    }
    const rows = await db().taskStatus.findMany({ where: { assessmentId } });
    return Object.fromEntries(rows.map((r) => [r.taskId, r.status as TaskStatus]));
  },

  /** Notes de suivi par tâche. Une tâche sans note n'y figure pas. */
  async notes(assessmentId: string): Promise<Record<string, string>> {
    if (!usingDatabase()) {
      return Object.fromEntries(
        [...(memory.get(assessmentId) ?? new Map())]
          .filter(([, entry]) => entry.note !== null)
          .map(([taskId, entry]) => [taskId, entry.note as string])
      );
    }
    const rows = await db().taskStatus.findMany({
      where: { assessmentId, note: { not: null } },
      select: { taskId: true, note: true },
    });
    return Object.fromEntries(rows.map((r) => [r.taskId, r.note as string]));
  },

  /** L'utilisateur a-t-il déjà touché à sa feuille de route ? */
  async hasAny(assessmentId: string): Promise<boolean> {
    if (!usingDatabase()) return (memory.get(assessmentId)?.size ?? 0) > 0;
    // `count` plutôt que `findMany` : on ne charge pas des lignes pour savoir
    // s'il en existe au moins une, y compris quand il y en a des dizaines.
    return (await db().taskStatus.count({ where: { assessmentId } })) > 0;
  },

  async setStatus(assessmentId: string, taskId: string, status: TaskStatus): Promise<void> {
    if (!usingDatabase()) {
      const map = forAssessment(assessmentId);
      map.set(taskId, { status, note: map.get(taskId)?.note ?? null });
      return;
    }
    // `note` absent de create ET d'update : une écriture de statut ne doit
    // jamais toucher la note que la personne a posée à côté.
    await db().taskStatus.upsert({
      where: { assessmentId_taskId: { assessmentId, taskId } },
      create: { assessmentId, taskId, status },
      update: { status },
    });
  },

  /**
   * Écrit (ou efface, avec `null`) la note d'une tâche.
   *
   * `fallbackStatus` remplit la colonne de statut quand la ligne n'existe pas
   * encore : une tâche jamais touchée n'a pas de ligne, et écrire sa note doit
   * en créer une SANS changer le statut effectif que la personne voit — d'où le
   * statut courant, transmis par l'appelant qui l'a sous la main.
   */
  async setNote(
    assessmentId: string,
    taskId: string,
    note: string | null,
    fallbackStatus: TaskStatus
  ): Promise<void> {
    if (!usingDatabase()) {
      const map = forAssessment(assessmentId);
      map.set(taskId, { status: map.get(taskId)?.status ?? fallbackStatus, note });
      return;
    }
    await db().taskStatus.upsert({
      where: { assessmentId_taskId: { assessmentId, taskId } },
      create: { assessmentId, taskId, status: fallbackStatus, note },
      update: { note },
    });
  },
};
