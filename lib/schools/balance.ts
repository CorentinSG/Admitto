import { AMBITIONS, type Ambition, type SchoolChoice, type SchoolStatus } from "./types";

/**
 * Lecture d'une liste d'écoles (tâche T-SEL-03).
 *
 * Ce module compte et compare ; il ne recommande aucune école et n'énonce
 * aucune chance d'admission. Chaque observation porte sur ce que
 * l'utilisateur a lui-même déclaré : « aucune école n'est classée sûre » est
 * un constat sur sa liste, pas un pronostic sur les écoles.
 *
 * La distinction n'est pas cosmétique. « Votre liste est risquée » supposerait
 * de savoir ce que valent les candidatures ; « vous n'avez déclaré aucune
 * école sûre » ne suppose rien et laisse la décision où elle doit être.
 */

/** Une liste plus courte n'a pas encore d'équilibre à examiner. */
export const MIN_LIST_FOR_BALANCE = 3;

/** En deçà, la sélection ne couvre pas le risque d'un refus (CDC §22). */
export const RECOMMENDED_ACTIVE = 4;

export const OBSERVATION_KINDS = [
  "EMPTY",
  "TOO_FEW",
  "NO_SAFETY",
  "ONLY_REACH",
  "NOTHING_SHORTLISTED",
  "MISSING_DEADLINES",
  "DEADLINE_SOON",
] as const;
export type ObservationKind = (typeof OBSERVATION_KINDS)[number];

export interface Observation {
  kind: ObservationKind;
  /** Valeur qui a déclenché l'observation — affichée telle quelle. */
  detail?: string;
}

export interface SchoolBalance {
  total: number;
  /** Écoles encore en lice : tout sauf celles écartées. */
  active: number;
  byAmbition: Record<Ambition, number>;
  byStatus: Record<SchoolStatus, number>;
  /** Prochaine date limite déclarée, parmi les écoles actives. */
  nextDeadline: { name: string; date: string } | null;
  observations: Observation[];
}

const emptyAmbitions = (): Record<Ambition, number> => ({ REACH: 0, TARGET: 0, SAFETY: 0 });
const emptyStatuses = (): Record<SchoolStatus, number> => ({
  CONSIDERING: 0,
  SHORTLISTED: 0,
  SUBMITTED: 0,
  DISCARDED: 0,
});

/**
 * `reference` est un paramètre, jamais `Date.now()` implicite : c'est la règle
 * du dépôt pour tout calcul de date, et sans elle les tests dépendraient du
 * jour où on les exécute.
 */
export function analyseList(schools: SchoolChoice[], reference: Date = new Date()): SchoolBalance {
  const byAmbition = emptyAmbitions();
  const byStatus = emptyStatuses();

  for (const school of schools) {
    byStatus[school.status] += 1;
    // Une école écartée ne pèse plus dans l'équilibre : la compter ferait
    // paraître couverte une liste dont il ne reste rien.
    if (school.status !== "DISCARDED") byAmbition[school.ambition] += 1;
  }

  const activeSchools = schools.filter((school) => school.status !== "DISCARDED");
  const active = activeSchools.length;

  const dated = activeSchools
    .filter((school) => school.applicationDeadline !== null)
    .sort((a, b) => a.applicationDeadline!.localeCompare(b.applicationDeadline!));

  const today = reference.toISOString().slice(0, 10);
  const upcoming = dated.find((school) => school.applicationDeadline! >= today) ?? null;

  const observations: Observation[] = [];

  if (schools.length === 0) {
    observations.push({ kind: "EMPTY" });
    return {
      total: 0,
      active: 0,
      byAmbition,
      byStatus,
      nextDeadline: null,
      observations,
    };
  }

  if (active < RECOMMENDED_ACTIVE) {
    observations.push({ kind: "TOO_FEW", detail: String(active) });
  }

  if (active >= MIN_LIST_FOR_BALANCE) {
    if (byAmbition.SAFETY === 0) observations.push({ kind: "NO_SAFETY" });
    if (byAmbition.REACH === active) observations.push({ kind: "ONLY_REACH" });
  }

  if (byStatus.SHORTLISTED === 0 && byStatus.SUBMITTED === 0 && active > 0) {
    observations.push({ kind: "NOTHING_SHORTLISTED" });
  }

  const undated = active - dated.length;
  if (undated > 0) observations.push({ kind: "MISSING_DEADLINES", detail: String(undated) });

  if (upcoming) {
    const days = Math.ceil(
      (new Date(`${upcoming.applicationDeadline!}T00:00:00Z`).getTime() -
        new Date(`${today}T00:00:00Z`).getTime()) /
        86_400_000
    );
    if (days <= 30) observations.push({ kind: "DEADLINE_SOON", detail: String(days) });
  }

  return {
    total: schools.length,
    active,
    byAmbition,
    byStatus,
    nextDeadline: upcoming
      ? { name: upcoming.name, date: upcoming.applicationDeadline! }
      : null,
    observations,
  };
}

/** Ordre d'affichage : les écoles écartées en dernier, le reste par ambition. */
const AMBITION_ORDER: Record<Ambition, number> = { REACH: 0, TARGET: 1, SAFETY: 2 };

export function sortForDisplay(schools: SchoolChoice[]): SchoolChoice[] {
  return [...schools].sort((a, b) => {
    if ((a.status === "DISCARDED") !== (b.status === "DISCARDED")) {
      return a.status === "DISCARDED" ? 1 : -1;
    }
    const ambition = AMBITION_ORDER[a.ambition] - AMBITION_ORDER[b.ambition];
    if (ambition !== 0) return ambition;
    return a.addedAt.localeCompare(b.addedAt);
  });
}

export { AMBITIONS };
