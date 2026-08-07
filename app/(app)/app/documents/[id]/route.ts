import { currentAssessmentId } from "@/lib/auth/current";
import { documentStore } from "@/lib/store/documents";
import { vaultStorage } from "@/lib/vault/storage";

/**
 * Relecture d'une pièce du coffre (CDC §29).
 *
 * La route vit DANS le groupe `(app)`, sous `/app/documents/…`, et non sous
 * `/api` : le middleware ne protège que `/admin` et `/app`, si bien qu'une
 * route de téléchargement placée sous `/api` serait ouverte par défaut. La
 * propriété est malgré tout revérifiée ici — un jour où le périmètre du
 * middleware changerait, ce fichier ne doit pas devenir la fuite.
 *
 * Trois règles portent la réponse :
 *
 * 1. **Un document qui n'est pas le vôtre est INTROUVABLE, pas interdit.**
 *    `documentStore.get` borne déjà la lecture à l'évaluation du compte ; un
 *    403 apprendrait à qui devine un identifiant que le document existe.
 * 2. **Jamais rendu dans le navigateur.** `attachment` et un type générique :
 *    l'extension est contrôlée au dépôt, pas le contenu, et un fichier nommé
 *    `.pdf` peut porter du HTML. Servi en pièce jointe, il ne s'exécute pas.
 * 3. **Le nom d'origine ne sort qu'assaini.** Il vient de l'utilisateur ; les
 *    guillemets et les sauts de ligne y fabriqueraient un second en-tête.
 */

/** Type volontairement opaque : le coffre restitue des octets, il ne les interprète pas. */
const OPAQUE = "application/octet-stream";

/**
 * Un nom d'en-tête n'admet ni guillemet, ni antislash, ni caractère de contrôle.
 *
 * La classe est construite par échappement plutôt qu'en littéral, comme les
 * diacritiques de `lib/vault/policy.ts` : une plage de caractères invisibles
 * écrite telle quelle dans le source se corrompt au premier copier-coller.
 */
const HEADER_UNSAFE = new RegExp('["\\\\\\u0000-\\u001f\\u007f]', "g");

function headerSafeName(fileName: string): string {
  return fileName.replace(HEADER_UNSAFE, "").trim() || "document";
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const assessmentId = await currentAssessmentId();
  if (!assessmentId) return new Response(null, { status: 404 });

  const document = await documentStore.get(assessmentId, id);
  // Un document seulement DÉCLARÉ n'a pas de clé : il n'y a aucun octet à
  // rendre, et prétendre le contraire servirait un fichier vide.
  if (!document?.storageKey) return new Response(null, { status: 404 });

  const bytes = await vaultStorage.get(document.storageKey);
  if (!bytes) return new Response(null, { status: 404 });

  const name = headerSafeName(document.fileName);
  return new Response(new Uint8Array(bytes), {
    headers: {
      "content-type": OPAQUE,
      // `filename*` porte les accents ; `filename` reste là pour les clients
      // qui ne lisent que lui, sans quoi « Relevé.pdf » arrive tronqué.
      "content-disposition": `attachment; filename="${name}"; filename*=UTF-8''${encodeURIComponent(name)}`,
      "content-length": String(bytes.byteLength),
      // Une pièce personnelle ne se met en cache nulle part.
      "cache-control": "private, no-store",
    },
  });
}
