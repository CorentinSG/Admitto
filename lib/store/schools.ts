import type { Ambition, SchoolChoice, SchoolStatus } from "@/lib/schools/types";
import { db, usingDatabase } from "@/lib/db/client";

/**
 * Liste d'écoles (tâche T-SEL-03).
 *
 * Deux implémentations dans le même fichier, comme les sept autres stores :
 * Prisma quand `DATABASE_URL` est défini, mémoire du processus sinon. Le
 * contrat commun est vérifié par `lib/store/stores.test.ts` contre le backend
 * actif.
 *
 * Toute lecture et toute écriture sont bornées par `assessmentId`. Un
 * identifiant d'école deviné n'atteint donc pas la liste de quelqu'un d'autre —
 * `update` et `remove` filtrent sur les deux colonnes, jamais sur l'identifiant
 * seul.
 */

const globalStore = globalThis as typeof globalThis & {
  __admittoSchools?: Map<string, SchoolChoice[]>;
};
const memory = (globalStore.__admittoSchools ??= new Map<string, SchoolChoice[]>());

interface SchoolRow {
  id: string;
  assessmentId: string;
  name: string;
  partnershipId: string | null;
  ambition: string;
  status: string;
  applicationDeadline: Date | null;
  notes: string | null;
  addedAt: Date;
}

const toDomain = (row: SchoolRow): SchoolChoice => ({
  id: row.id,
  assessmentId: row.assessmentId,
  name: row.name,
  partnershipId: row.partnershipId,
  ambition: row.ambition as Ambition,
  status: row.status as SchoolStatus,
  // Seule la date compte, pas l'heure : une date limite de candidature n'a pas
  // d'heure, et en transporter une inventerait un fuseau.
  applicationDeadline: row.applicationDeadline
    ? row.applicationDeadline.toISOString().slice(0, 10)
    : null,
  notes: row.notes,
  addedAt: row.addedAt.toISOString(),
});

export interface SchoolPatch {
  ambition?: Ambition;
  status?: SchoolStatus;
  applicationDeadline?: string | null;
  notes?: string | null;
}

export const schoolStore = {
  async list(assessmentId: string): Promise<SchoolChoice[]> {
    if (!usingDatabase()) return memory.get(assessmentId) ?? [];
    const rows = await db().schoolChoice.findMany({
      where: { assessmentId },
      orderBy: { addedAt: "asc" },
    });
    return rows.map(toDomain);
  },

  async add(school: SchoolChoice): Promise<void> {
    if (!usingDatabase()) {
      memory.set(school.assessmentId, [...(memory.get(school.assessmentId) ?? []), school]);
      return;
    }
    await db().schoolChoice.create({
      data: {
        id: school.id,
        assessmentId: school.assessmentId,
        name: school.name,
        partnershipId: school.partnershipId,
        ambition: school.ambition,
        status: school.status,
        applicationDeadline: school.applicationDeadline
          ? new Date(`${school.applicationDeadline}T00:00:00.000Z`)
          : null,
        notes: school.notes,
        addedAt: new Date(school.addedAt),
      },
    });
  },

  /** Rend `true` si une ligne a bien été modifiée — donc si elle existait. */
  async update(assessmentId: string, schoolId: string, patch: SchoolPatch): Promise<boolean> {
    if (!usingDatabase()) {
      const list = memory.get(assessmentId) ?? [];
      const index = list.findIndex((school) => school.id === schoolId);
      if (index === -1) return false;
      list[index] = { ...list[index], ...patch };
      memory.set(assessmentId, [...list]);
      return true;
    }

    const { count } = await db().schoolChoice.updateMany({
      where: { id: schoolId, assessmentId },
      data: {
        ...(patch.ambition !== undefined ? { ambition: patch.ambition } : {}),
        ...(patch.status !== undefined ? { status: patch.status } : {}),
        ...(patch.notes !== undefined ? { notes: patch.notes } : {}),
        ...(patch.applicationDeadline !== undefined
          ? {
              applicationDeadline: patch.applicationDeadline
                ? new Date(`${patch.applicationDeadline}T00:00:00.000Z`)
                : null,
            }
          : {}),
      },
    });
    return count > 0;
  },

  async remove(assessmentId: string, schoolId: string): Promise<boolean> {
    if (!usingDatabase()) {
      const list = memory.get(assessmentId) ?? [];
      const next = list.filter((school) => school.id !== schoolId);
      memory.set(assessmentId, next);
      return next.length !== list.length;
    }
    const { count } = await db().schoolChoice.deleteMany({
      where: { id: schoolId, assessmentId },
    });
    return count > 0;
  },
};
