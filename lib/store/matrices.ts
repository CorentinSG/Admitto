import type { BlockPayload, BlockRevisionRow } from "@/lib/matrices/blocks";
import type { RuleRevisionRow } from "@/lib/matrices/rules";
import { db, usingDatabase } from "@/lib/db/client";

/**
 * Révisions des matrices (CDC §33) — règles du Moteur A et blocs de texte.
 *
 * Prisma quand `DATABASE_URL` est défini, mémoire du processus sinon, comme
 * les huit autres stores. En pratique l'édition n'est atteignable qu'avec une
 * base (le back-office exige Auth.js, qui exige la base), mais le régime
 * mémoire reste couvert par le contrat de `stores.test.ts` : c'est lui qui
 * garantit que les deux implémentations ne divergent pas.
 *
 * APPEND-ONLY : on n'écrit que des révisions nouvelles, on ne modifie ni ne
 * supprime jamais une ligne. La clé composée (identifiant, révision) fait
 * qu'un numéro de révision ne peut pas être pris deux fois, même si deux
 * onglets sauvegardent en même temps — le second échoue et réessaie avec le
 * numéro suivant.
 */

const globalStore = globalThis as typeof globalThis & {
  __admittoRuleRevisions?: RuleRevisionRow[];
  __admittoBlockRevisions?: BlockRevisionRow[];
};
const ruleMemory = (globalStore.__admittoRuleRevisions ??= []);
const blockMemory = (globalStore.__admittoBlockRevisions ??= []);

/** Nombre d'essais en cas de collision de numéro de révision. */
const MAX_ATTEMPTS = 3;

const isUniqueViolation = (error: unknown): boolean =>
  (error as { code?: string }).code === "P2002";

export const ruleRevisionStore = {
  /** Dernière révision de chaque règle. */
  async latest(): Promise<Map<string, RuleRevisionRow>> {
    const rows = usingDatabase()
      ? (await db().ruleRevision.findMany()).map(toRuleDomain)
      : [...ruleMemory];

    const latest = new Map<string, RuleRevisionRow>();
    for (const row of rows) {
      const current = latest.get(row.ruleId);
      if (!current || row.revision > current.revision) latest.set(row.ruleId, row);
    }
    return latest;
  },

  async history(ruleId: string): Promise<RuleRevisionRow[]> {
    if (!usingDatabase()) {
      return ruleMemory
        .filter((row) => row.ruleId === ruleId)
        .sort((a, b) => a.revision - b.revision);
    }
    const rows = await db().ruleRevision.findMany({
      where: { ruleId },
      orderBy: { revision: "asc" },
    });
    return rows.map(toRuleDomain);
  },

  async add(input: {
    ruleId: string;
    active: boolean;
    sourceUrl: string;
    verifiedAt: string | null;
  }): Promise<RuleRevisionRow> {
    if (!usingDatabase()) {
      const revision =
        Math.max(0, ...ruleMemory.filter((r) => r.ruleId === input.ruleId).map((r) => r.revision)) +
        1;
      const row: RuleRevisionRow = { ...input, revision, createdAt: new Date().toISOString() };
      ruleMemory.push(row);
      return row;
    }

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const last = await db().ruleRevision.findFirst({
        where: { ruleId: input.ruleId },
        orderBy: { revision: "desc" },
        select: { revision: true },
      });
      try {
        const row = await db().ruleRevision.create({
          data: {
            ruleId: input.ruleId,
            revision: (last?.revision ?? 0) + 1,
            active: input.active,
            sourceUrl: input.sourceUrl,
            verifiedAt: input.verifiedAt ? new Date(`${input.verifiedAt}T00:00:00.000Z`) : null,
          },
        });
        return toRuleDomain(row);
      } catch (error) {
        // Collision de numéro : un autre enregistrement vient de prendre la
        // révision. On relit et on réessaie — jamais d'écrasement.
        if (!isUniqueViolation(error) || attempt === MAX_ATTEMPTS - 1) throw error;
      }
    }
    throw new Error("unreachable");
  },
};

export const blockRevisionStore = {
  /** Toutes les révisions : la résolution « à la date » est pure, dans lib/. */
  async all(): Promise<BlockRevisionRow[]> {
    if (!usingDatabase()) return [...blockMemory];
    const rows = await db().blockRevision.findMany({ orderBy: { createdAt: "asc" } });
    return rows.map(toBlockDomain);
  },

  async add(key: string, payload: BlockPayload): Promise<BlockRevisionRow> {
    if (!usingDatabase()) {
      const revision =
        Math.max(0, ...blockMemory.filter((r) => r.key === key).map((r) => r.revision)) + 1;
      const row: BlockRevisionRow = { key, revision, payload, createdAt: new Date().toISOString() };
      blockMemory.push(row);
      return row;
    }

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const last = await db().blockRevision.findFirst({
        where: { key },
        orderBy: { revision: "desc" },
        select: { revision: true },
      });
      try {
        const row = await db().blockRevision.create({
          data: { key, revision: (last?.revision ?? 0) + 1, payload: payload as object },
        });
        return toBlockDomain(row);
      } catch (error) {
        if (!isUniqueViolation(error) || attempt === MAX_ATTEMPTS - 1) throw error;
      }
    }
    throw new Error("unreachable");
  },
};

interface RuleRow {
  ruleId: string;
  revision: number;
  active: boolean;
  sourceUrl: string;
  verifiedAt: Date | null;
  createdAt: Date;
}

const toRuleDomain = (row: RuleRow): RuleRevisionRow => ({
  ruleId: row.ruleId,
  revision: row.revision,
  active: row.active,
  sourceUrl: row.sourceUrl,
  // Date sans heure : c'est un jour de vérification, pas un instant.
  verifiedAt: row.verifiedAt ? row.verifiedAt.toISOString().slice(0, 10) : null,
  createdAt: row.createdAt.toISOString(),
});

interface BlockRow {
  key: string;
  revision: number;
  payload: unknown;
  createdAt: Date;
}

const toBlockDomain = (row: BlockRow): BlockRevisionRow => ({
  key: row.key,
  revision: row.revision,
  payload: row.payload as BlockPayload,
  createdAt: row.createdAt.toISOString(),
});
