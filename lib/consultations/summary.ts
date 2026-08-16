import { vocabularyViolation } from "@/lib/matrices/vocabulary";
import type { ConsultationSlot } from "./types";

/**
 * Compte rendu de séance (CDC §31).
 *
 * Rédigé par le fondateur après la séance, lu par le client dans son espace :
 * ce qui a été décidé, ce qui reste à faire. C'est ce qui transforme la séance
 * en trace exploitable dans le parcours plutôt qu'en conversation perdue.
 *
 * Trois règles portent la décision, prises AVANT toute écriture — comme le
 * coffre, le sélecteur d'écoles et la note de suivi :
 *
 * - **Jamais avant la séance.** Un compte rendu d'une séance qui n'a pas eu
 *   lieu serait une invention ; le refus vaut aussi pour un créneau retiré.
 * - **Jamais de vocabulaire interdit.** Le texte est écrit au back-office et lu
 *   par un client : `check:vocabulary` ne le voit jamais, c'est donc le miroir
 *   d'exécution qui décide — le même que pour les blocs des matrices. Un compte
 *   rendu qui affirmerait une éligibilité ou promettrait un résultat est
 *   refusé avant d'exister.
 * - **Le vide est refusé, pas traité comme un effacement.** À la différence de
 *   la note de suivi, un compte rendu publié est un livrable : le blanchir le
 *   rétracterait en silence. Une correction le REMPLACE, elle ne l'efface pas.
 */

/** Assez pour « décidé / à faire / points ouverts », trop peu pour un rapport bis. */
export const MAX_SUMMARY_LENGTH = 4_000;

export type SummaryRefusal =
  | { reason: "EMPTY" }
  | { reason: "TOO_LONG" }
  | { reason: "SESSION_NOT_STARTED" }
  | { reason: "FORBIDDEN_VOCABULARY"; why: string };

export type SummaryDecision = { accepted: true; summary: string } | ({ accepted: false } & SummaryRefusal);

export function decideSummary(
  input: { text: string; slot: ConsultationSlot | null },
  reference: Date
): SummaryDecision {
  const summary = input.text.trim();
  if (summary.length === 0) return { accepted: false, reason: "EMPTY" };
  if (summary.length > MAX_SUMMARY_LENGTH) return { accepted: false, reason: "TOO_LONG" };

  // Créneau retiré ou encore à venir : rien à raconter qui ait eu lieu.
  if (!input.slot || Date.parse(input.slot.startsAt) > reference.getTime()) {
    return { accepted: false, reason: "SESSION_NOT_STARTED" };
  }

  const violation = vocabularyViolation(summary);
  if (violation) return { accepted: false, reason: "FORBIDDEN_VOCABULARY", why: violation.why };

  return { accepted: true, summary };
}
