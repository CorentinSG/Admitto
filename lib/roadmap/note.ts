/**
 * Note personnelle attachée à une tâche de la feuille de route (CDC §22).
 *
 * La feuille de route cesse d'être une liste à cocher : sur chaque tâche, la
 * personne inscrit son propre état de travail — « relance envoyée à Assas le
 * 3 novembre, réponse attendue », « attendre le score TOEFL avant de déposer ».
 * C'est ce qui sépare un outil dans lequel on travaille pendant des mois d'une
 * check-list figée.
 *
 * La note est de la donnée que la personne ÉCRIT, comme les notes du sélecteur
 * d'écoles : texte libre borné, jamais lu ni indexé par le produit, effacé avec
 * le diagnostic et rendu dans l'export d'accès (elle vit sur `TaskStatus`, déjà
 * couverte par les deux).
 */

/** Assez pour quelques phrases de suivi, trop peu pour y coller un dossier. */
export const MAX_NOTE_LENGTH = 600;

export type NoteDecision =
  | { accepted: true; note: string | null }
  | { accepted: false; reason: "TOO_LONG" };

/**
 * Décide avant écriture, comme le coffre et le sélecteur d'écoles.
 *
 * Une note vide (ou blanche) EFFACE la note : c'est le geste attendu quand on
 * a fini de suivre un point. Elle est donc normalisée en `null`, jamais en
 * chaîne vide — deux façons de dire « rien » qui divergeraient au stockage.
 */
export function decideNote(raw: string): NoteDecision {
  const note = raw.trim();
  if (note.length === 0) return { accepted: true, note: null };
  if (note.length > MAX_NOTE_LENGTH) return { accepted: false, reason: "TOO_LONG" };
  return { accepted: true, note };
}
