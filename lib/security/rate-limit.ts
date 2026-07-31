import { db, usingDatabase } from "@/lib/db/client";

/**
 * Limitation de débit des formulaires publics (revue §A2).
 *
 * Les deux formulaires ouverts au public déclenchent chacun un email vers une
 * adresse **fournie par l'appelant** : la soumission du diagnostic envoie le
 * résultat, la connexion envoie un lien. Sans plafond, l'un et l'autre servent
 * à bombarder la boîte de quelqu'un d'autre, et la soumission sature en plus la
 * file de rapports — dont le délai annoncé à l'utilisateur basculle à
 * vingt-cinq rapports actifs (CDC §18).
 *
 * Deux clés, toutes deux contraignantes :
 *
 * - **par adresse IP** : arrête le script qui essaie mille adresses ;
 * - **par adresse email** : protège une personne précise, même si l'attaquant
 *   change d'IP à chaque requête.
 *
 * Le refus est identique dans les deux cas : la réponse ne dit jamais laquelle
 * des deux limites a été atteinte, sans quoi elle renseignerait sur le trafic
 * des autres.
 */

export const RATE_LIMIT_SCOPES = ["DIAGNOSTIC", "SIGN_IN", "EVENT"] as const;
export type RateLimitScope = (typeof RATE_LIMIT_SCOPES)[number];

interface Limit {
  /** Tentatives autorisées par adresse IP dans la fenêtre. */
  perIp: number;
  /**
   * Tentatives autorisées par adresse email dans la fenêtre.
   *
   * `null` — et non zéro — quand le périmètre ne comporte aucune adresse. Zéro
   * se lirait comme un plafond, et le premier appel le dépasserait : un
   * périmètre sans email refuserait tout dès la première requête. La valeur
   * doit dire « cette clé n'existe pas ici », pas « elle vaut zéro ».
   */
  perEmail: number | null;
  windowMinutes: number;
}

/**
 * Plafonds.
 *
 * Les deux clés ne jouent pas le même rôle, et leurs plafonds ne se ressemblent
 * donc pas :
 *
 * - **Par email, serré.** Une personne soumet son diagnostic une fois, deux si
 *   elle se corrige. C'est ce plafond qui empêche de noyer une boîte précise,
 *   et il est le seul qui doive être strict.
 *
 * - **Par IP, large.** Une adresse IP n'identifie pas une personne : un campus
 *   de droit, un cabinet, un espace de coworking sortent tous par une seule
 *   adresse. Un plafond serré y bloquerait des candidats légitimes — c'est
 *   arrivé pendant la revue, la suite de vérification s'est bloquée elle-même à
 *   cinq par heure. Ce plafond n'a pas à distinguer deux personnes de trois : il
 *   doit arrêter un script, et un script produit des centaines de requêtes, pas
 *   des dizaines.
 */
export const RATE_LIMITS: Record<RateLimitScope, Limit> = {
  // Le plafond par email le plus strict est ici, et c'est voulu : une
  // soumission écrit en base, entre dans la file de rapports et déclenche un
  // email de résultat. Trois par heure et par adresse couvre la personne qui se
  // corrige, et rien de plus.
  DIAGNOSTIC: { perIp: 30, perEmail: 3, windowMinutes: 60 },
  // Un lien de connexion est moins nocif qu'un résultat : il n'écrit rien
  // d'exploitable et ne révèle rien à qui ne contrôle pas la boîte. Ce qui
  // protège la victime d'un envoi massif, c'est l'existence du plafond bien
  // plus que sa valeur exacte — huit messages par quart d'heure restent « quelques
  // emails », y compris venus d'un réseau de machines. En revanche un plafond
  // trop bas gêne la personne qui n'a pas reçu son lien et redemande.
  SIGN_IN: { perIp: 30, perEmail: 8, windowMinutes: 15 },
  // Les événements produit (CDC §36) n'écrivent qu'un compteur anonyme, mais
  // la route est publique : sans plafond, elle serait un moyen d'écriture
  // illimitée en base. Un parcours de questionnaire en émet une quinzaine ;
  // trois cents par heure laissent passer une vingtaine de parcours depuis
  // une même IP — un campus ou un cabinet — et arrêtent un script.
  // `perEmail` est nul au sens propre : aucune adresse n'entre dans un
  // événement, il n'y a donc pas de seconde clé à plafonner.
  EVENT: { perIp: 300, perEmail: null, windowMinutes: 60 },
};

/** Durée de conservation des tentatives : la plus longue fenêtre, doublée. */
export const HIT_RETENTION_MINUTES =
  2 * Math.max(...Object.values(RATE_LIMITS).map((l) => l.windowMinutes));

export type RateLimitVerdict =
  | { ok: true }
  | { ok: false; retryAfterMinutes: number };

/**
 * Adresse IP de l'appelant, telle que la voit le proxy.
 *
 * `x-forwarded-for` n'est digne de confiance que derrière un proxy qui la
 * réécrit — c'est le cas sur Vercel, où la plateforme impose la valeur. Un
 * déploiement auto-hébergé doit s'en assurer, sinon l'en-tête est déclaratif
 * et la limite par IP contournable en une ligne.
 *
 * `null` quand l'IP est inconnue : la limite par email s'applique alors seule.
 * Rabattre tout le monde sur une clé commune bloquerait l'ensemble des
 * visiteurs dès qu'un seul dépasse.
 */
export function callerIp(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    // Le premier élément est le client d'origine ; les suivants sont les proxys.
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip")?.trim() || null;
}

const globalStore = globalThis as typeof globalThis & {
  __admittoRateHits?: Array<{ scope: string; key: string; at: number }>;
};
const memory = (globalStore.__admittoRateHits ??= []);

async function recordAndCount(
  scope: RateLimitScope,
  key: string,
  windowMinutes: number,
  reference: Date
): Promise<number> {
  const since = new Date(reference.getTime() - windowMinutes * 60_000);

  if (!usingDatabase()) {
    memory.push({ scope, key, at: reference.getTime() });
    // Purge opportuniste : sans base, personne d'autre ne le fera.
    const floor = reference.getTime() - HIT_RETENTION_MINUTES * 60_000;
    for (let i = memory.length - 1; i >= 0; i--) {
      if (memory[i].at < floor) memory.splice(i, 1);
    }
    return memory.filter((h) => h.scope === scope && h.key === key && h.at >= since.getTime())
      .length;
  }

  await db().rateLimitHit.create({ data: { scope, key, at: reference } });
  return db().rateLimitHit.count({ where: { scope, key, at: { gte: since } } });
}

/**
 * Enregistre la tentative et rend le verdict.
 *
 * L'enregistrement précède le comptage, et vaut aussi pour une tentative
 * refusée : voir le commentaire du modèle `RateLimitHit`.
 */
export async function checkRateLimit(
  scope: RateLimitScope,
  caller: { ip: string | null; email?: string | null },
  reference: Date = new Date()
): Promise<RateLimitVerdict> {
  const limit = RATE_LIMITS[scope];
  // Un périmètre dont `perEmail` est nul ne comporte pas de clé email : une
  // adresse qui lui parviendrait quand même n'est ni comptée ni ENREGISTRÉE.
  // La ranger dans le journal des tentatives ferait entrer une donnée
  // personnelle dans un périmètre dont la politique dit qu'il n'en porte pas.
  // Le plafond par IP continue de s'appliquer : rien n'y devient illimité.
  const email = limit.perEmail === null ? undefined : caller.email?.trim().toLowerCase();

  const counts = await Promise.all([
    caller.ip
      ? recordAndCount(scope, `ip:${caller.ip}`, limit.windowMinutes, reference)
      : Promise.resolve(0),
    email
      ? recordAndCount(scope, `email:${email}`, limit.windowMinutes, reference)
      : Promise.resolve(0),
  ]);

  const [ipCount, emailCount] = counts;
  const exceeded =
    (caller.ip !== null && ipCount > limit.perIp) ||
    (Boolean(email) && limit.perEmail !== null && emailCount > limit.perEmail);

  return exceeded ? { ok: false, retryAfterMinutes: limit.windowMinutes } : { ok: true };
}

/** Purge des tentatives périmées. Appelée par la route cron. */
export async function purgeRateLimitHits(reference: Date = new Date()): Promise<number> {
  const floor = new Date(reference.getTime() - HIT_RETENTION_MINUTES * 60_000);

  if (!usingDatabase()) {
    const before = memory.length;
    for (let i = memory.length - 1; i >= 0; i--) {
      if (memory[i].at < floor.getTime()) memory.splice(i, 1);
    }
    return before - memory.length;
  }

  const { count } = await db().rateLimitHit.deleteMany({ where: { at: { lt: floor } } });
  return count;
}
