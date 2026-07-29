import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { ALLOWED_EXTENSIONS } from "./types";

/**
 * Stockage des pièces du coffre (CDC §29).
 *
 * Sans `ADMITTO_VAULT_DIR`, le stockage est inerte : le coffre fonctionne alors
 * en suivi de documents — l'utilisateur déclare ce qu'il a préparé, aucun
 * fichier ne quitte sa machine. Même bascule par configuration que Stripe et
 * Resend : l'absence de clé ne casse rien, elle ferme une capacité.
 *
 * ⚠️ Implémentation de transition. Un répertoire local ne survit pas à un
 * déploiement sans volume persistant ; à remplacer par un stockage objet
 * chiffré au repos avant la bêta.
 */

export function vaultDirectory(): string | null {
  const dir = process.env.ADMITTO_VAULT_DIR?.trim();
  return dir ? dir : null;
}

export function storageEnabled(): boolean {
  return vaultDirectory() !== null;
}

/**
 * Clé de stockage. L'identifiant d'évaluation et l'identifiant du document
 * suffisent : le nom d'origine n'entre jamais dans le chemin, ce qui écarte
 * d'un coup la traversée de répertoire et les noms de fichiers parlants sur
 * le disque.
 */
export function storageKeyFor(assessmentId: string, documentId: string, extension: string): string {
  // L'extension est déjà validée en amont ; la revalider ici évite qu'un futur
  // appelant écrive sur le disque une extension que la politique refuse.
  const safeExtension = (ALLOWED_EXTENSIONS as readonly string[]).includes(extension.toLowerCase())
    ? extension.toLowerCase()
    : "";
  return path.posix.join(sanitizeSegment(assessmentId), `${sanitizeSegment(documentId)}${safeExtension}`);
}

function sanitizeSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, "");
}

export const vaultStorage = {
  enabled: storageEnabled,

  async put(key: string, bytes: Uint8Array): Promise<void> {
    const dir = vaultDirectory();
    if (!dir) return;
    const target = path.join(dir, key);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, bytes);
  },

  async remove(key: string): Promise<void> {
    const dir = vaultDirectory();
    if (!dir) return;
    await rm(path.join(dir, key), { force: true });
  },
};
