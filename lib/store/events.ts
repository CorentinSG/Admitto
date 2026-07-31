import type { EventKind } from "@/lib/analytics/events";
import { EVENT_KINDS } from "@/lib/analytics/events";
import type { ScreenId } from "@/lib/questionnaire/types";
import { db, usingDatabase } from "@/lib/db/client";

/**
 * Journal des événements produit (CDC §36).
 *
 * Prisma quand `DATABASE_URL` est défini, mémoire du processus sinon, comme
 * les autres stores. En mémoire, seuls des COMPTEURS sont tenus — pas même la
 * liste des événements : rien à conserver puisque rien n'est corrélé, et un
 * tableau qui grossit sans fin dans un processus long est un défaut, pas une
 * fonctionnalité.
 *
 * Les lectures ne rendent que des agrégats. Il n'existe volontairement AUCUNE
 * méthode qui rende des événements un par un : la seule chose qu'on pourrait
 * en faire de plus que compter serait de reconstituer un parcours.
 */

const globalStore = globalThis as typeof globalThis & {
  __admittoEventCounts?: Map<string, number>;
  __admittoScreenCounts?: Map<string, number>;
};
const kindMemory = (globalStore.__admittoEventCounts ??= new Map<string, number>());
const screenMemory = (globalStore.__admittoScreenCounts ??= new Map<string, number>());

const bump = (map: Map<string, number>, key: string) => map.set(key, (map.get(key) ?? 0) + 1);

export const eventStore = {
  async record(kind: EventKind, screen: ScreenId | null): Promise<void> {
    if (!usingDatabase()) {
      bump(kindMemory, kind);
      if (screen) bump(screenMemory, screen);
      return;
    }
    await db().productEvent.create({ data: { kind, screen } });
  },

  /** Compteur par type. Tous les types sont présents, à zéro le cas échéant. */
  async countsByKind(): Promise<Record<EventKind, number>> {
    const counts = Object.fromEntries(EVENT_KINDS.map((kind) => [kind, 0])) as Record<
      EventKind,
      number
    >;

    if (!usingDatabase()) {
      for (const kind of EVENT_KINDS) counts[kind] = kindMemory.get(kind) ?? 0;
      return counts;
    }

    const rows = await db().productEvent.groupBy({ by: ["kind"], _count: { _all: true } });
    for (const row of rows) {
      // Un type retiré du code laisse des lignes en base : elles sont ignorées
      // plutôt que d'apparaître comme une clé inconnue dans l'entonnoir.
      if (row.kind in counts) counts[row.kind as EventKind] = row._count._all;
    }
    return counts;
  },

  /** Compteur par écran atteint — la matière de la courbe d'abandon. */
  async countsByScreen(): Promise<Record<string, number>> {
    if (!usingDatabase()) return Object.fromEntries(screenMemory);

    const rows = await db().productEvent.groupBy({
      by: ["screen"],
      where: { kind: "SCREEN_REACHED", screen: { not: null } },
      _count: { _all: true },
    });
    return Object.fromEntries(rows.map((row) => [row.screen as string, row._count._all]));
  },
};
