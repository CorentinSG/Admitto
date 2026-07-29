import type { DocumentType, VaultDocument } from "@/lib/vault/types";

/**
 * Métadonnées du coffre (CDC §29).
 *
 * ⚠️ Même implémentation de transition que les autres stores : mémoire du
 * processus accrochée à globalThis, à remplacer par Prisma avant la bêta.
 *
 * Ne sont conservés que le type, le nom, la taille et la date. Aucun contenu
 * n'est indexé ni résumé : le coffre range des documents, il ne les lit pas.
 */

const globalStore = globalThis as typeof globalThis & {
  __admittoDocuments?: Map<string, VaultDocument[]>;
};
const memory = (globalStore.__admittoDocuments ??= new Map<string, VaultDocument[]>());

export const documentStore = {
  async list(assessmentId: string): Promise<VaultDocument[]> {
    return memory.get(assessmentId) ?? [];
  },

  async countOfType(assessmentId: string, type: DocumentType): Promise<number> {
    return (memory.get(assessmentId) ?? []).filter((d) => d.type === type).length;
  },

  async add(document: VaultDocument): Promise<void> {
    const existing = memory.get(document.assessmentId) ?? [];
    memory.set(document.assessmentId, [...existing, document]);
  },

  async get(assessmentId: string, documentId: string): Promise<VaultDocument | null> {
    return (memory.get(assessmentId) ?? []).find((d) => d.id === documentId) ?? null;
  },

  async remove(assessmentId: string, documentId: string): Promise<void> {
    const existing = memory.get(assessmentId) ?? [];
    memory.set(
      assessmentId,
      existing.filter((d) => d.id !== documentId)
    );
  },
};
