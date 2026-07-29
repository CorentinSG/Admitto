import type { TaskStatus } from "@/lib/roadmap/types";
import { db, usingDatabase } from "@/lib/db/client";

/**
 * Statuts de tâches par évaluation (CDC §22).
 *
 * Prisma quand `DATABASE_URL` est défini, mémoire du processus sinon — voir
 * `assessments.ts` pour le raisonnement.
 *
 * Seuls les écarts au statut initial sont conservés ; la feuille de route
 * elle-même est régénérée depuis les modèles, ce qui permet d'ajouter des
 * tâches sans migration de données.
 */

const globalStore = globalThis as typeof globalThis & {
  __admittoTaskStatuses?: Map<string, Map<string, TaskStatus>>;
};
const memory = (globalStore.__admittoTaskStatuses ??= new Map());

export const roadmapStore = {
  async statuses(assessmentId: string): Promise<Record<string, TaskStatus>> {
    if (!usingDatabase()) return Object.fromEntries(memory.get(assessmentId) ?? new Map());
    const rows = await db().taskStatus.findMany({ where: { assessmentId } });
    return Object.fromEntries(rows.map((r) => [r.taskId, r.status as TaskStatus]));
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
      const forAssessment = memory.get(assessmentId) ?? new Map<string, TaskStatus>();
      forAssessment.set(taskId, status);
      memory.set(assessmentId, forAssessment);
      return;
    }
    await db().taskStatus.upsert({
      where: { assessmentId_taskId: { assessmentId, taskId } },
      create: { assessmentId, taskId, status },
      update: { status },
    });
  },
};
