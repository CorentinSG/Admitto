import type { Milestone } from "@/lib/roadmap/types";
import { db, usingDatabase } from "@/lib/db/client";

/**
 * Date de première acquisition d'un Milestone Challenge (CDC §24).
 *
 * Prisma quand `DATABASE_URL` est défini, mémoire du processus sinon.
 *
 * Ce store n'enregistre qu'une date, jamais un état. L'acquisition reste
 * calculée à partir des tâches : si l'utilisateur rouvre une tâche, le
 * challenge n'est plus acquis — la date conservée dit seulement quand il
 * l'a été la première fois. Stocker l'état lui-même permettrait qu'un
 * challenge reste affiché comme acquis alors que le travail a été défait.
 */

const globalStore = globalThis as typeof globalThis & {
  __admittoMilestones?: Map<string, Map<Milestone, string>>;
};
const memory = (globalStore.__admittoMilestones ??= new Map());

export const milestoneStore = {
  async dates(assessmentId: string): Promise<Partial<Record<Milestone, string>>> {
    if (!usingDatabase()) return Object.fromEntries(memory.get(assessmentId) ?? new Map());
    const rows = await db().milestoneAward.findMany({ where: { assessmentId } });
    return Object.fromEntries(
      rows.map((r) => [r.milestone as Milestone, r.achievedAt.toISOString()])
    );
  },

  /** Première acquisition seulement : une nouvelle acquisition ne réécrit pas la date. */
  async recordFirst(assessmentId: string, milestone: Milestone, at: string): Promise<boolean> {
    if (!usingDatabase()) {
      const forAssessment = memory.get(assessmentId) ?? new Map<Milestone, string>();
      if (forAssessment.has(milestone)) return false;
      forAssessment.set(milestone, at);
      memory.set(assessmentId, forAssessment);
      return true;
    }
    const existing = await db().milestoneAward.findUnique({
      where: { assessmentId_milestone: { assessmentId, milestone } },
    });
    if (existing) return false;
    await db().milestoneAward.create({
      data: { assessmentId, milestone, achievedAt: new Date(at) },
    });
    return true;
  },
};
