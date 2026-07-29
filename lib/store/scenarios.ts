import { MAX_SCENARIOS, type ScenarioInputs } from "@/lib/simulator/types";
import { db, usingDatabase } from "@/lib/db/client";

/**
 * Scénarios de coût par évaluation (CDC §26 : trois au maximum).
 *
 * Prisma quand `DATABASE_URL` est défini, mémoire du processus sinon.
 *
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
    if (!usingDatabase()) return memory.get(assessmentId) ?? [];
    const rows = await db().scenario.findMany({ where: { assessmentId } });
    return rows.map((r) => ({ id: r.id, inputs: r.inputs as unknown as ScenarioInputs }));
  },

  /** Ajoute ou remplace un scénario. Refuse au-delà de la limite du CDC. */
  async save(
    assessmentId: string,
    scenario: StoredScenario
  ): Promise<{ ok: true } | { ok: false; reason: "LIMIT_REACHED" }> {
    if (!usingDatabase()) {
      const existing = memory.get(assessmentId) ?? [];
      const index = existing.findIndex((s) => s.id === scenario.id);

      if (index === -1 && existing.length >= MAX_SCENARIOS) {
        return { ok: false, reason: "LIMIT_REACHED" };
      }

      const next =
        index === -1
          ? [...existing, scenario]
          : existing.map((s, i) => (i === index ? scenario : s));
      memory.set(assessmentId, next);
      return { ok: true };
    }

    // Le plafond se vérifie sur les scénarios EXISTANTS hors celui édité :
    // compter la mise à jour d'un scénario existant comme un ajout refuserait
    // toute modification une fois la limite atteinte.
    const existing = await db().scenario.findUnique({ where: { id: scenario.id } });
    if (!existing) {
      const count = await db().scenario.count({ where: { assessmentId } });
      if (count >= MAX_SCENARIOS) return { ok: false, reason: "LIMIT_REACHED" };
    }

    await db().scenario.upsert({
      where: { id: scenario.id },
      create: { id: scenario.id, assessmentId, inputs: scenario.inputs as object },
      update: { inputs: scenario.inputs as object },
    });
    return { ok: true };
  },

  async remove(assessmentId: string, scenarioId: string): Promise<void> {
    if (!usingDatabase()) {
      const existing = memory.get(assessmentId) ?? [];
      memory.set(
        assessmentId,
        existing.filter((s) => s.id !== scenarioId)
      );
      return;
    }
    // Bornée à l'évaluation : un identifiant deviné ne supprime pas le
    // scénario de quelqu'un d'autre.
    await db().scenario.deleteMany({ where: { id: scenarioId, assessmentId } });
  },
};
