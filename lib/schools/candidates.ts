import type { PartnershipDetection } from "@/lib/partnerships/detect";
import type { Partnership } from "@/lib/partnerships/types";
import { normalizeName, type SchoolChoice } from "./types";

/**
 * Écoles proposées au départ, tirées des accords déjà détectés (CDC §27).
 *
 * C'est l'apport propre du produit sur cette tâche : l'utilisateur n'a pas à
 * retrouver quels accords existent pour son université, il les a devant lui
 * avec leur date limite et leur régime de frais.
 *
 * Trois règles reprises de la détection, et pour les mêmes raisons :
 *
 * 1. **Une fiche non confirmée n'est jamais présentée comme acquise.** Elle est
 *    proposée comme piste, marquée telle quelle.
 * 2. **Aucune ambition n'est pré-remplie.** Suggérer « sûre » pour une école
 *    partenaire reviendrait à annoncer une chance d'admission à partir de
 *    l'existence d'un accord, qui ne dit rien de l'admission.
 * 3. **Une école déjà dans la liste ne réapparaît pas** — comparaison sur le
 *    nom normalisé, la même que celle du refus de doublon.
 */

export interface SchoolCandidate {
  partnershipId: string;
  name: string;
  city: string | null;
  state: string | null;
  /** Ce que l'accord dit des frais, tel quel. */
  tuitionDisplay: string | null;
  applicationDeadline: string | null;
  officialLink: string | null;
  /** Fiche confirmée, ou piste à vérifier auprès de l'université. */
  confirmed: boolean;
}

function toCandidate(partnership: Partnership, confirmed: boolean): SchoolCandidate {
  return {
    partnershipId: partnership.id,
    name: partnership.usLawSchool,
    city: partnership.city,
    state: partnership.state,
    tuitionDisplay: partnership.tuitionDisplay,
    applicationDeadline: partnership.applicationDeadline,
    officialLink: partnership.officialLink,
    confirmed,
  };
}

/**
 * Candidats restants, dans l'ordre : accords confirmés d'abord, pistes ensuite.
 *
 * Les accords fermés au niveau d'études actuel (`aboveLevel`) sont exclus : les
 * proposer ferait construire une liste sur des portes fermées aujourd'hui. Ils
 * restent visibles dans le rapport, à leur place, comme information de cursus.
 */
export function candidatesFor(
  detection: PartnershipDetection,
  alreadyChosen: SchoolChoice[]
): SchoolCandidate[] {
  const taken = new Set(alreadyChosen.map((school) => normalizeName(school.name)));

  const candidates = [
    ...detection.confirmed.map((p) => toCandidate(p, true)),
    ...detection.toConfirm.map((p) => toCandidate(p, false)),
  ];

  const seen = new Set<string>();
  return candidates.filter((candidate) => {
    const key = normalizeName(candidate.name);
    // Deux accords peuvent viser la même law school (double diplôme et place
    // réservée, par exemple) : la proposer deux fois donnerait à croire à deux
    // écoles distinctes.
    if (taken.has(key) || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
