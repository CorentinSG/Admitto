import type { Phase } from "@/lib/profile/derive";
import type { ConsultationType } from "./types";

/**
 * La séance mise en avant, choisie d'après la phase actuelle
 * (plan de personnalisation, point 1.5).
 *
 * Les quatre types étaient listés dans le même ordre pour tout le monde : un
 * candidat en pleine sélection d'écoles voyait « Cadrage du projet » avant
 * « Revue de la liste d'écoles », et quelqu'un à trois semaines de l'examen
 * lisait d'abord une séance d'orientation. Le produit connaît pourtant sa
 * phase depuis le diagnostic.
 *
 * Trois règles tiennent ce module :
 *
 * - **Mise en avant, jamais rétrécissement.** Les quatre types restent tous
 *   listés et tous réservables : réduire l'offre à ce que le produit croit
 *   pertinent déciderait à la place de la personne (CDC §24).
 * - **Correspondance, pas recommandation.** Le libellé dit que cette séance
 *   correspond à SON étape — c'est tout ce que le produit sait. Écrire qu'elle
 *   « convient » ou qu'elle est « conseillée » serait un conseil que rien ne
 *   fonde.
 * - **Table FERMÉE sur les treize phases** : une phase ajoutée au produit sans
 *   décision ne compile pas. `null` est une réponse légitime — plusieurs phases
 *   n'ont aucune séance qui leur corresponde mieux qu'une autre, et forcer un
 *   type pour remplir la case serait inventer une pertinence.
 */

export const CONSULTATION_BY_PHASE: Record<Phase, ConsultationType | null> = {
  // Avant toute sélection, la question est le projet lui-même.
  CLARIFICATION: "ORIENTATION",
  CAREER_STRATEGY: "ORIENTATION",
  // La liste d'écoles se construit et s'arbitre.
  LLM_SELECTION: "SCHOOL_LIST_REVIEW",
  // Le dossier s'écrit : c'est la relecture qui sert.
  APPLICATIONS: "APPLICATION_REVIEW",
  /*
   * Financement et visa : aucune séance ne les traite spécifiquement, et le
   * périmètre de chaque type EXCLUT explicitement les démarches auprès d'une
   * autorité. Mettre en avant un type ici laisserait croire que la séance
   * porte sur ce que la personne a en tête à ce moment-là.
   */
  FUNDING: null,
  VISA: null,
  // Sur place, le sujet redevient la trajectoire.
  LLM_START: "ORIENTATION",
  /*
   * Dossier d'évaluation : la seule séance qui l'approche est la planification
   * de l'examen, mais elle exclut toute conclusion sur l'accès à l'examen —
   * ce qui est précisément la question de cette phase. Rien n'est mis en avant.
   */
  BOLE: null,
  NETWORKING_INTERNSHIPS: null,
  // L'examen se prépare : calendrier, programme, démarches autour des sessions.
  BAR_PREPARATION: "BAR_PLANNING",
  EXAM: "BAR_PLANNING",
  // Après l'examen, la question redevient celle de la suite.
  ADMISSION: null,
  POST_ADMISSION_STRATEGY: "ORIENTATION",
};

/** Type mis en avant pour cette phase, ou `null` si aucun ne correspond mieux. */
export function suggestedConsultation(phase: Phase | null): ConsultationType | null {
  return phase ? CONSULTATION_BY_PHASE[phase] : null;
}
