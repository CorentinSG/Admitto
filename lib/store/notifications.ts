/**
 * Journal des rappels d'échéance envoyés (CDC §22).
 *
 * ⚠️ Même implémentation de transition que les autres stores : mémoire du
 * processus accrochée à globalThis, à remplacer par Prisma avant la bêta.
 *
 * Ce journal EST le mécanisme d'idempotence : un identifiant de rappel n'y
 * entre qu'après un envoi réussi. Un échec de transport laisse donc le rappel
 * dû, et le passage suivant le renverra — ce qui est le comportement voulu.
 */

const globalStore = globalThis as typeof globalThis & {
  __admittoSentNotices?: Map<string, Set<string>>;
};
const memory = (globalStore.__admittoSentNotices ??= new Map<string, Set<string>>());

export const noticeStore = {
  async sent(assessmentId: string): Promise<string[]> {
    return [...(memory.get(assessmentId) ?? [])];
  },

  async markSent(assessmentId: string, noticeId: string): Promise<void> {
    const set = memory.get(assessmentId) ?? new Set<string>();
    set.add(noticeId);
    memory.set(assessmentId, set);
  },
};
