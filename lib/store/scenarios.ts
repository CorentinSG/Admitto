import { MAX_SCENARIOS, type ScenarioInputs } from "@/lib/simulator/types";

/**
 * Scénarios de coût par évaluation (CDC §26 : trois au maximum).
 *
 * ⚠️ Même implémentation de transition que les autres stores : mémoire du
 * processus accrochée à globalThis, à remplacer par Prisma avant la bêta.
 * Seules les entrées sont conservées — les sorties sont recalculées, ce qui
 * évite qu'un scénario enregistré porte un total devenu faux après un
 * changement de formule.
 */

export interface StoredScenario {
  id: string;
  inputs: ScenarioInputs;
}

const globalStore = globalThis as typeof globalThis & {
  __admittoScenarios?: Map<string, StoredScenario[]>;
};
const memory = (globalStore.__admittoScenarios ??= new Map<string, StoredScenario[]>());

export const scenarioStore = {
  async list(assessmentId: string): Promise<StoredScenario[]> {
    return memory.get(assessmentId) ?? [];
  },

  /** Ajoute ou remplace un scénario. Refuse au-delà de la limite du CDC. */
  async save(
    assessmentId: string,
    scenario: StoredScenario
  ): Promise<{ ok: true } | { ok: false; reason: "LIMIT_REACHED" }> {
    const existing = memory.get(assessmentId) ?? [];
    const index = existing.findIndex((s) => s.id === scenario.id);

    if (index === -1 && existing.length >= MAX_SCENARIOS) {
      return { ok: false, reason: "LIMIT_REACHED" };
    }

    const next = index === -1 ? [...existing, scenario] : existing.map((s, i) => (i === index ? scenario : s));
    memory.set(assessmentId, next);
    return { ok: true };
  },

  async remove(assessmentId: string, scenarioId: string): Promise<void> {
    const existing = memory.get(assessmentId) ?? [];
    memory.set(
      assessmentId,
      existing.filter((s) => s.id !== scenarioId)
    );
  },
};
