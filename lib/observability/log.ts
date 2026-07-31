/**
 * Journal structuré (lot D).
 *
 * Une ligne JSON par événement, sur la sortie standard : c'est le format que
 * tout collecteur sait lire, et il reste lisible sans collecteur.
 *
 * ## Pourquoi un journal est un sujet de minimisation, ici plus qu'ailleurs
 *
 * `check:legal` relie chaque modèle Prisma à la politique de confidentialité :
 * une donnée écrite en base ne peut pas passer inaperçue. Un journal n'est pas
 * un modèle. Une adresse email écrite dans un log n'échoue à aucun garde-fou,
 * ne figure dans aucun registre, et survit à l'effacement du compte qu'elle
 * désigne — `lib/legal/personal-data.ts` efface la base, pas les fichiers de
 * sortie du serveur.
 *
 * Le journal est donc conçu pour qu'aucune donnée personnelle n'y entre :
 *
 * 1. **Les noms d'événements sont une union fermée.** On ne journalise pas
 *    « ce qu'on veut au moment où on en a besoin » : ajouter un événement est
 *    une modification de type, visible en revue.
 * 2. **Toute chaîne traverse `redact()`** avant d'être écrite. Les adresses
 *    email et les jetons longs sont remplacés, jamais tronqués — une adresse
 *    tronquée reste une adresse.
 * 3. **Ce qui QUITTE la machine est plus pauvre que ce qui reste dessus.**
 *    Voir `notify()` plus bas : le webhook ne reçoit jamais de message
 *    d'erreur, parce qu'un message d'erreur cite les valeurs qui l'ont causé.
 */

export const LOG_EVENTS = [
  "server.error",
  "cron.rejected",
  "cron.done",
  "notifications.done",
  "email.sequence.done",
  "purge.done",
  "stripe.rejected",
  "stripe.accepted",
  "auth.signin",
  "auth.admin.bootstrap",
] as const;

export type LogEvent = (typeof LOG_EVENTS)[number];
export type LogLevel = "info" | "warn" | "error";

/**
 * Valeurs admises dans un champ de journal.
 *
 * Les compteurs et les booléens ne désignent personne. Les chaînes sont
 * admises parce que certains champs en exigent une — un nom de classe
 * d'erreur, un motif de refus — mais elles passent toutes par `redact()`.
 */
export type LogValue = number | boolean | string | null | undefined;
export type LogFields = Record<string, LogValue>;

const EMAIL = /[^\s"',;<>()[\]]+@[^\s"',;<>()[\]]+\.[a-z]{2,}/gi;

/**
 * Jetons opaques : identifiants d'évaluation, jetons de connexion, clés.
 *
 * Dans ce produit, l'identifiant d'une évaluation est une CAPACITÉ — il ouvre
 * la page de résultat à qui le détient (`lib/access/result.ts`). L'écrire,
 * c'est déposer une clé dans un fichier que personne ne considère comme
 * sensible.
 *
 * La règle exige des lettres ET des chiffres, et non « longue chaîne sans
 * espace ». Une première version prenait tout ce qui dépassait seize
 * caractères, et remplaçait `PrismaClientInitializationError` par
 * « [identifiant] » : le champ sur lequel on trie les erreurs devenait
 * illisible, et le journal ne servait plus à rien au moment précis où on
 * l'ouvre. Les jetons de ce produit — cuid, uuid, hexadécimal — mêlent tous
 * les deux ; un nom de classe, jamais.
 */
const OPAQUE = /\b(?=[A-Za-z0-9_-]*\d)(?=[A-Za-z0-9_-]*[A-Za-z])[A-Za-z0-9_-]{16,}\b/g;

/** Remplace ce qui désigne quelqu'un. Remplacement, jamais troncature. */
export function redact(value: string): string {
  const cleaned = value.replace(EMAIL, "[courriel]").replace(OPAQUE, "[identifiant]");
  // Une ligne de journal démesurée n'est plus lue par personne, et un message
  // long a d'autant plus de chances de citer une valeur.
  return cleaned.length > 200 ? `${cleaned.slice(0, 200)}…` : cleaned;
}

function clean(fields: LogFields): Record<string, number | boolean | string | null> {
  const out: Record<string, number | boolean | string | null> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined) continue;
    out[key] = typeof value === "string" ? redact(value) : value;
  }
  return out;
}

/**
 * Écrit une ligne. Ne jette jamais.
 *
 * Un journal qui fait tomber la requête qu'il décrit est pire que pas de
 * journal : il transforme un incident observable en panne.
 */
export function log(level: LogLevel, event: LogEvent, fields: LogFields = {}): void {
  let line: string;
  try {
    line = JSON.stringify({ level, event, at: new Date().toISOString(), ...clean(fields) });
  } catch {
    line = JSON.stringify({ level, event, at: new Date().toISOString(), serialisation: false });
  }
  // `console` et non `process.stdout` : ce module est atteint depuis le
  // runtime Edge (middleware, `auth.config.ts`), où `node:process` n'existe pas.
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

/**
 * Champs d'une erreur serveur, tels qu'ils sont sûrs à journaliser.
 *
 * `route` est le PATRON de route (`/rapport/[id]`), jamais le chemin appelé.
 * Le chemin résolu contient l'identifiant, et cet identifiant ouvre la page :
 * un journal d'erreurs deviendrait une liste de liens d'accès.
 */
export type ServerErrorFields = {
  route: string;
  method: string;
  name: string;
  digest?: string;
  routeType?: string;
};

/**
 * Journalise une erreur serveur, et la signale au webhook s'il est configuré.
 *
 * Sans `ADMITTO_ERROR_WEBHOOK`, la fonction se contente d'écrire : même régime
 * que le reste du produit — ce qui n'est pas configuré est inerte.
 */
export async function reportServerError(fields: ServerErrorFields, message?: string): Promise<void> {
  // Le message reste SUR la machine : Prisma, Auth.js et Stripe citent
  // volontiers la valeur qui a causé l'erreur — une adresse, un identifiant.
  // `redact()` couvre les adresses et les jetons, pas un prénom.
  log("error", "server.error", { ...fields, message });

  const url = process.env.ADMITTO_ERROR_WEBHOOK;
  if (!url) return;

  // Ce qui SORT de la machine est délibérément plus pauvre : ni message, ni
  // pile d'appels. Le `digest` suffit à relier l'alerte à la ligne locale, et
  // c'est le même code que voit l'utilisateur sur l'écran d'erreur.
  try {
    await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        source: "admitto",
        at: new Date().toISOString(),
        route: fields.route,
        method: fields.method,
        name: fields.name,
        digest: fields.digest ?? null,
      }),
    });
  } catch {
    // Un webhook injoignable ne doit pas produire une seconde erreur : on
    // perdrait l'alerte ET la requête.
  }
}
