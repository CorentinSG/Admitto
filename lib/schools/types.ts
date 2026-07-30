/**
 * Sélecteur d'écoles (CDC §22, tâche T-SEL-03).
 *
 * La feuille de route demande de « finaliser votre liste d'écoles » — 240
 * minutes estimées, une échéance, un jalon, un type de document et même une
 * séance de relecture dédiée. Jusqu'ici, le produit demandait ce travail sans
 * fournir d'outil pour le faire, alors qu'il détient déjà les accords
 * applicables, les coûts et le profil. La liste finissait dans un tableur, hors
 * du produit — donc hors de la feuille de route, hors des échéances et hors de
 * ce que la relecture peut voir.
 *
 * **Le produit ne classe jamais une école.** L'ambition (« ambitieuse »,
 * « cible », « sûre ») est déclarée par l'utilisateur, jamais déduite : classer
 * une école reviendrait à énoncer une chance d'admission, ce que le CDC §14.4
 * interdit et qu'aucune donnée de ce dépôt ne permet. Le produit compte ce qui
 * a été déclaré et signale un déséquilibre ; il ne dit pas quelle école est
 * quoi.
 */

/**
 * Ambition déclarée. Trois niveaux, parce que deux (« sûre » / « ambitieuse »)
 * poussent à tout ranger dans un extrême, et que la tâche T-SEL-03 demande
 * précisément un équilibre.
 */
export const AMBITIONS = ["REACH", "TARGET", "SAFETY"] as const;
export type Ambition = (typeof AMBITIONS)[number];

/**
 * Avancement de la candidature à cette école.
 *
 * `SHORTLISTED` et `SUBMITTED` sont distincts de `CONSIDERING` : une liste où
 * tout resterait « à l'étude » ne dirait pas si le travail avance.
 */
export const SCHOOL_STATUSES = ["CONSIDERING", "SHORTLISTED", "SUBMITTED", "DISCARDED"] as const;
export type SchoolStatus = (typeof SCHOOL_STATUSES)[number];

export interface SchoolChoice {
  id: string;
  assessmentId: string;
  /** Nom de l'école tel qu'affiché. Saisi ou repris d'un accord. */
  name: string;
  /**
   * Accord d'origine, quand l'école vient de la base de partenariats. Permet
   * de rappeler à l'écran ce que l'accord dit — et de ne PAS le réafficher si
   * l'accord disparaît de la base à un import suivant.
   */
  partnershipId: string | null;
  ambition: Ambition;
  status: SchoolStatus;
  /** Date limite de candidature notée par l'utilisateur, ISO `YYYY-MM-DD`. */
  applicationDeadline: string | null;
  notes: string | null;
  addedAt: string;
}

/** Plafond de la liste. Au-delà, ce n'est plus une sélection. */
export const MAX_SCHOOLS = 20;

export const MAX_NAME_LENGTH = 120;
export const MAX_NOTES_LENGTH = 600;

export type AddRefusal =
  | "EMPTY_NAME"
  | "NAME_TOO_LONG"
  | "NOTES_TOO_LONG"
  | "UNKNOWN_AMBITION"
  | "UNKNOWN_STATUS"
  | "INVALID_DEADLINE"
  | "DUPLICATE"
  | "LIMIT_REACHED";

export type AddDecision =
  | { accepted: true; name: string; notes: string | null; applicationDeadline: string | null }
  | { accepted: false; reason: AddRefusal };

/** Comparaison des noms d'école, casse, accents et espaces ignorés. */
export function normalizeName(name: string): string {
  return name
    .normalize("NFD")
    // Construit par échappement plutôt qu'écrit avec de vrais diacritiques :
    // une classe de caractères combinants tapée littéralement est invisible à
    // la relecture et se corrompt au premier copier-coller.
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Décide avant toute écriture, comme le coffre : ce qui est refusé n'aura
 * jamais existé côté serveur.
 *
 * Le doublon est refusé sur le nom normalisé et non sur l'identifiant d'accord :
 * une même école peut être saisie à la main puis reprise d'un accord, et deux
 * lignes identiques dans une liste de sélection sont une gêne, pas une donnée.
 */
export function decideAdd(input: {
  name: string;
  ambition: string;
  status: string;
  applicationDeadline?: string | null;
  notes?: string | null;
  existing: Array<{ name: string }>;
}): AddDecision {
  const name = input.name.trim().replace(/\s+/g, " ");
  if (!name) return { accepted: false, reason: "EMPTY_NAME" };
  if (name.length > MAX_NAME_LENGTH) return { accepted: false, reason: "NAME_TOO_LONG" };

  if (!(AMBITIONS as readonly string[]).includes(input.ambition)) {
    return { accepted: false, reason: "UNKNOWN_AMBITION" };
  }
  if (!(SCHOOL_STATUSES as readonly string[]).includes(input.status)) {
    return { accepted: false, reason: "UNKNOWN_STATUS" };
  }

  const notes = input.notes?.trim() || null;
  if (notes && notes.length > MAX_NOTES_LENGTH) {
    return { accepted: false, reason: "NOTES_TOO_LONG" };
  }

  const deadline = input.applicationDeadline?.trim() || null;
  if (deadline !== null) {
    // Le format ET la validité : « 2027-02-31 » passe la première épreuve et
    // pas la seconde, et produirait une échéance qui n'existe pas.
    if (!ISO_DATE.test(deadline) || Number.isNaN(new Date(`${deadline}T00:00:00Z`).getTime())) {
      return { accepted: false, reason: "INVALID_DEADLINE" };
    }
    if (new Date(`${deadline}T00:00:00Z`).toISOString().slice(0, 10) !== deadline) {
      return { accepted: false, reason: "INVALID_DEADLINE" };
    }
  }

  const wanted = normalizeName(name);
  if (input.existing.some((school) => normalizeName(school.name) === wanted)) {
    return { accepted: false, reason: "DUPLICATE" };
  }
  if (input.existing.length >= MAX_SCHOOLS) {
    return { accepted: false, reason: "LIMIT_REACHED" };
  }

  return { accepted: true, name, notes, applicationDeadline: deadline };
}
