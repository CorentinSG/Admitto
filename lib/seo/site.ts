/**
 * Adresse publique du site (lot E).
 *
 * Une seule question, posée une seule fois : ce serveur est-il l'exemplaire
 * public du site, ou une prévisualisation ?
 *
 * La réponse vient de `ADMITTO_BASE_URL`, déjà nécessaire pour que les liens
 * des emails pointent quelque part. On n'ajoute pas un second interrupteur
 * pour dire « ce site est public » : deux réglages qui doivent s'accorder
 * finissent par se contredire, et c'est celui qu'on oublie qui décide.
 *
 * Tant qu'elle est absente — ou locale — le site se déclare non indexable.
 * Ce sens de défaut est délibéré, et il vaut au-delà du confort :
 *
 * - une prévisualisation indexée fait concurrence au site réel sur ses
 *   propres termes, et se retire lentement ;
 * - les mentions légales portent encore des valeurs `PENDING` (jalon F4 du
 *   plan). Un site référencé avec des mentions incomplètes est une infraction
 *   qui a l'air d'un site normal. Fermer par défaut fait de l'ouverture un
 *   geste explicite, au moment où quelqu'un décide vraiment de publier.
 */

const LOCAL = /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(:\d+)?$/i;

/** URL publique canonique, sans barre finale — ou `null` si le site n'est pas public. */
export function publicBaseUrl(): string | null {
  const raw = process.env.ADMITTO_BASE_URL?.trim();
  if (!raw) return null;

  const url = raw.replace(/\/+$/, "");
  if (LOCAL.test(url)) return null;

  // Une valeur mal formée ne doit pas produire un sitemap d'URL cassées.
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
  } catch {
    return null;
  }

  return url;
}

/** Le site se présente-t-il comme l'exemplaire public ? */
export function isPublicSite(): boolean {
  return publicBaseUrl() !== null;
}

/**
 * Balise canonique d'une page — absolue, ou absente.
 *
 * Jamais relative. Next.js résout `alternates.canonical` contre
 * `metadataBase` ; sans domaine connu à la compilation, il émettait
 * `<link rel="canonical" href="/offres">`. Une canonique relative est
 * ambiguë — Lighthouse la refuse, et Google demande une URL absolue — mais
 * elle a surtout l'air correcte : la balise est là, elle a un href, rien ne
 * signale qu'elle ne remplit pas son rôle.
 *
 * Ne rien émettre est plus honnête : une page sans canonique est une page qui
 * n'affirme rien, ce qui est exactement l'état d'un build qui ignore où il
 * sera servi. Même régime que le reste — non configuré vaut inerte, pas
 * approximatif.
 */
export function canonical(path: string): { canonical: string } | undefined {
  const base = publicBaseUrl();
  if (!base) return undefined;
  return { canonical: path === "/" ? base : `${base}${path}` };
}
