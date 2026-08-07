import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
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

  /**
   * Relecture d'une pièce déposée.
   *
   * Elle manquait, et son absence n'était pas visible : les fichiers entraient
   * dans le coffre et n'en ressortaient jamais. L'écran listait un nom, une
   * date et un bouton « Retirer » — le seul geste possible sur un document
   * était de le détruire. Un coffre qu'on ne rouvre pas ne rend aucun service,
   * et conserver des fichiers sans usage est le contraire de la minimisation.
   *
   * `null` plutôt qu'une exception quand le fichier manque : un enregistrement
   * dont l'octet a disparu (répertoire local non persistant, cf. l'avertissement
   * plus haut) doit produire un « introuvable » et non une page en erreur.
   */
  async get(key: string): Promise<Uint8Array | null> {
    const dir = vaultDirectory();
    if (!dir) return null;
    try {
      return await readFile(path.join(dir, key));
    } catch {
      return null;
    }
  },

  async remove(key: string): Promise<void> {
    const dir = vaultDirectory();
    if (!dir) return;
    await rm(path.join(dir, key), { force: true });
  },

  /**
   * Retire TOUTES les pièces d'une évaluation — le geste de l'effacement.
   *
   * Les chemins d'effacement (compte supprimé, purge de rétention) suppriment
   * les lignes, et la cascade du schéma emporte les lignes `Document` ; mais
   * les OCTETS écrits sous `ADMITTO_VAULT_DIR` n'étaient retirés nulle part
   * ailleurs que par le bouton « Retirer ». Après un effacement de compte, le
   * CV et le personal statement restaient donc sur le disque, orphelins :
   * plus aucune ligne ne les désignait, et plus personne ne pouvait les
   * supprimer — la donnée qu'aucun geste humain ne peut retirer, très
   * exactement ce que la politique de rétention existe pour empêcher.
   *
   * Le répertoire entier est visé plutôt que les clés une à une : la clé de
   * chaque pièce vit sous `<assessmentId>/`, et une liste lue en base juste
   * avant sa suppression peut manquer une ligne écrite entre les deux.
   */
  async removeAll(assessmentId: string): Promise<void> {
    const dir = vaultDirectory();
    if (!dir) return;
    const segment = sanitizeSegment(assessmentId);
    // Un identifiant réduit à rien effacerait la RACINE du coffre.
    if (!segment) return;
    await rm(path.join(dir, segment), { recursive: true, force: true });
  },
};
