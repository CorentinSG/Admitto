import type { TaskStatus } from "@/lib/roadmap/types";

/**
 * Statuts de tâches par évaluation (CDC §22).
 *
 * ⚠️ Même implémentation de transition que les autres stores : mémoire du
 * processus accrochée à globalThis, à remplacer par Prisma avant la bêta.
 * Seuls les écarts au statut initial sont conservés — la feuille de route
 * elle-même est régénérée depuis les modèles, ce qui permet d'ajouter des
 * tâches sans migration.
 */

const globalStore = globalThis as typeof globalThis & {
  __admittoTaskStatuses?: Map<string, Map<string, TaskStatus>>;
};
const memory = (globalStore.__admittoTaskStatuses ??= new Map());

export const roadmapStore = {
  async statuses(assessmentId: string): Promise<Record<string, TaskStatus>> {
    return Object.fromEntries(memory.get(assessmentId) ?? new Map());
  },

  async setStatus(assessmentId: string, taskId: string, status: TaskStatus): Promise<void> {
    const forAssessment = memory.get(assessmentId) ?? new Map<string, TaskStatus>();
    forAssessment.set(taskId, status);
    memory.set(assessmentId, forAssessment);
  },
};
