import type { DocumentType, VaultDocument } from "@/lib/vault/types";
import { db, usingDatabase } from "@/lib/db/client";

/**
 * Métadonnées du coffre (CDC §29).
 *
 * Prisma quand `DATABASE_URL` est défini, mémoire du processus sinon.
 *
 * Ne sont conservés que le type, le nom, la taille et la date. Aucun contenu
 * n'est indexé ni résumé : le coffre range des documents, il ne les lit pas.
 */

const globalStore = globalThis as typeof globalThis & {
  __admittoDocuments?: Map<string, VaultDocument[]>;
};
const memory = (globalStore.__admittoDocuments ??= new Map<string, VaultDocument[]>());

interface DocumentRow {
  id: string;
  assessmentId: string;
  type: string;
  fileName: string;
  sizeBytes: number;
  uploadedAt: Date;
  storageKey: string | null;
}

const toDomain = (row: DocumentRow): VaultDocument => ({
  id: row.id,
  assessmentId: row.assessmentId,
  type: row.type as DocumentType,
  fileName: row.fileName,
  sizeBytes: row.sizeBytes,
  uploadedAt: row.uploadedAt.toISOString(),
  storageKey: row.storageKey,
});

export const documentStore = {
  async list(assessmentId: string): Promise<VaultDocument[]> {
    if (!usingDatabase()) return memory.get(assessmentId) ?? [];
    const rows = await db().document.findMany({
      where: { assessmentId },
      orderBy: { uploadedAt: "asc" },
    });
    return rows.map(toDomain);
  },

  async countOfType(assessmentId: string, type: DocumentType): Promise<number> {
    if (!usingDatabase()) {
      return (memory.get(assessmentId) ?? []).filter((d) => d.type === type).length;
    }
    return db().document.count({ where: { assessmentId, type } });
  },

  async add(document: VaultDocument): Promise<void> {
    if (!usingDatabase()) {
      const existing = memory.get(document.assessmentId) ?? [];
      memory.set(document.assessmentId, [...existing, document]);
      return;
    }
    await db().document.create({
      data: {
        id: document.id,
        assessmentId: document.assessmentId,
        type: document.type,
        fileName: document.fileName,
        sizeBytes: document.sizeBytes,
        uploadedAt: new Date(document.uploadedAt),
        storageKey: document.storageKey,
      },
    });
  },

  async get(assessmentId: string, documentId: string): Promise<VaultDocument | null> {
    if (!usingDatabase()) {
      return (memory.get(assessmentId) ?? []).find((d) => d.id === documentId) ?? null;
    }
    // La lecture est bornée à l'évaluation : un identifiant deviné n'atteint
    // pas le coffre de quelqu'un d'autre.
    const row = await db().document.findFirst({ where: { id: documentId, assessmentId } });
    return row ? toDomain(row) : null;
  },

  async remove(assessmentId: string, documentId: string): Promise<void> {
    if (!usingDatabase()) {
      const existing = memory.get(assessmentId) ?? [];
      memory.set(
        assessmentId,
        existing.filter((d) => d.id !== documentId)
      );
      return;
    }
    await db().document.deleteMany({ where: { id: documentId, assessmentId } });
  },
};
