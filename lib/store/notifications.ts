import { db, usingDatabase } from "@/lib/db/client";

/**
 * Journal des rappels d'échéance envoyés (CDC §22).
 *
 * Prisma quand `DATABASE_URL` est défini, mémoire du processus sinon.
 *
 * Ce journal EST le mécanisme d'idempotence : un identifiant de rappel n'y
 * entre qu'après un envoi réussi. Un échec de transport laisse donc le rappel
 * dû, et le passage suivant le renverra — comportement voulu. En base, la clé
 * composée (évaluation, rappel) rend un double envoi impossible même si deux
 * passages se chevauchent.
 */

const globalStore = globalThis as typeof globalThis & {
  __admittoSentNotices?: Map<string, Set<string>>;
};
const memory = (globalStore.__admittoSentNotices ??= new Map<string, Set<string>>());

export const noticeStore = {
  async sent(assessmentId: string): Promise<string[]> {
    if (!usingDatabase()) return [...(memory.get(assessmentId) ?? [])];
    const rows = await db().sentNotice.findMany({ where: { assessmentId } });
    return rows.map((r) => r.noticeId);
  },

  async markSent(assessmentId: string, noticeId: string): Promise<void> {
    if (!usingDatabase()) {
      const set = memory.get(assessmentId) ?? new Set<string>();
      set.add(noticeId);
      memory.set(assessmentId, set);
      return;
    }
    await db().sentNotice.upsert({
      where: { assessmentId_noticeId: { assessmentId, noticeId } },
      create: { assessmentId, noticeId },
      update: {},
    });
  },
};
