/**
 * Heure des consultations, ancrée sur Paris (CDC §31).
 *
 * Le reste du produit formate les dates côté serveur en UTC, à dessein : une
 * échéance ou une date d'ajout se lisent au jour près, et UTC est un fuseau
 * FIXE, donc déterministe — le serveur et le navigateur rendent la même chose,
 * et l'arbre React ne se régénère pas.
 *
 * Une consultation, elle, n'est pas une date mais un INSTANT précis, et
 * « 14:00 UTC » n'est l'heure de personne : le destinataire doit convertir de
 * tête, et peut manquer sa séance. Le fuseau de Paris règle les deux problèmes
 * à la fois — il reste FIXE (donc aussi déterministe qu'UTC, et sans risque
 * d'hydratation, à la différence du fuseau du NAVIGATEUR que la règle interdit),
 * et c'est l'heure du fondateur qui donne la séance : l'ancrage naturel.
 *
 * Tout passe donc par « heure de Paris », à l'entrée comme à l'affichage.
 */

const PARIS = "Europe/Paris";

/**
 * Décalage de Paris sur UTC, en millisecondes, à l'instant donné.
 *
 * Calculé par `formatToParts` plutôt qu'en reparsant une chaîne localisée :
 * reparser dépendrait du fuseau du SERVEUR (ici UTC, ailleurs non), et le
 * décalage deviendrait faux hors de ce conteneur. Ici, il ne dépend que de la
 * date et de la base de fuseaux — le même résultat partout.
 */
function parisOffsetMs(instant: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: PARIS,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(instant);

  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const asUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour") % 24,
    get("minute"),
    get("second")
  );
  return asUtc - instant.getTime();
}

const NAIVE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/;

/**
 * Convertit une heure murale de Paris (« 2026-07-15T14:00 », sans fuseau, telle
 * que la donne un champ `datetime-local`) en instant UTC ISO.
 *
 * L'entrée du back-office n'a pas de fuseau : `new Date("…T14:00")` l'aurait
 * interprétée dans le fuseau du serveur (UTC), si bien que le fondateur qui
 * saisit « 14:00 » en pensant Paris stockait 14:00 UTC — et le client lisait
 * une heure encore décalée. On l'interprète donc explicitement comme Paris.
 *
 * Renvoie `null` sur une entrée malformée : l'appelant refuse alors le créneau
 * plutôt que d'en inventer un.
 */
export function parisWallClockToIso(naive: string): string | null {
  const match = NAIVE.exec(naive);
  if (!match) return null;
  const [, y, mo, d, h, mi] = match.map(Number);

  // Première estimation : lire l'heure murale COMME SI elle était UTC.
  const asUtc = Date.UTC(y, mo - 1, d, h, mi);

  /*
   * `Date.UTC` NORMALISE au lieu de refuser : le mois 13 devient janvier de
   * l'année suivante, le jour 40 déborde sur le mois d'après, et « 99:99 » se
   * reporte de plusieurs jours. On obtiendrait un instant parfaitement valide,
   * sans rapport avec ce qui a été saisi — un créneau ouvert un autre jour que
   * celui voulu. Même piège que la date limite du sélecteur d'écoles, et même
   * parade : comparer la normalisation à l'entrée.
   */
  const normalised = new Date(asUtc);
  const sameAsTyped =
    normalised.getUTCFullYear() === y &&
    normalised.getUTCMonth() === mo - 1 &&
    normalised.getUTCDate() === d &&
    normalised.getUTCHours() === h &&
    normalised.getUTCMinutes() === mi;
  if (!sameAsTyped) return null;
  // Le vrai instant est cette estimation moins le décalage de Paris. On raffine
  // une fois : près d'un changement d'heure, le décalage à l'estimation et au
  // résultat peuvent différer, et la seconde passe tombe du bon côté.
  let real = asUtc - parisOffsetMs(new Date(asUtc));
  real = asUtc - parisOffsetMs(new Date(real));

  const iso = new Date(real);
  return Number.isNaN(iso.getTime()) ? null : iso.toISOString();
}

/** Jour et heure d'un créneau, en heure de Paris, prêts à afficher. */
export function parisParts(iso: string): { date: string; time: string } {
  const instant = new Date(iso);
  return {
    date: instant.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      timeZone: PARIS,
    }),
    time: instant.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: PARIS,
    }),
  };
}

/** Libellé complet d'un créneau : « lundi 3 novembre à 14:00 (heure de Paris) · 60 min ». */
export function slotLabel(iso: string, minutes: number): string {
  const { date, time } = parisParts(iso);
  return `${date} à ${time} (heure de Paris) · ${minutes} min`;
}
