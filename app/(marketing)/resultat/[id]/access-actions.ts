"use server";

import { signIn } from "@/auth";
import { assessmentStore } from "@/lib/store/assessments";
import { paymentsEnabled } from "@/lib/payments/offers";
import { reportStore } from "@/lib/store/reports";
import { auth as copy } from "@/content/auth";
import { accountsAvailable } from "@/lib/config/capabilities";

/**
 * Ouverture de l'espace payant depuis le résultat (CDC §10 et §21).
 *
 * Envoie un lien de connexion à l'adresse déjà donnée dans le diagnostic. Le
 * profil suit donc l'utilisateur sans ressaisie : à la connexion, ses
 * diagnostics portant cette adresse sont rattachés au compte.
 *
 * Le bouton n'ouvre plus l'accès lui-même. C'était le principe du jeton de
 * transition : cliquer suffisait. Passer par l'email vérifie que la personne
 * contrôle l'adresse — sans quoi un identifiant d'évaluation deviné ouvrirait
 * le dossier de quelqu'un d'autre.
 *
 * Phase 1A (paiement désactivé) : ouvert aux participants de la bêta.
 * Phase 1B et au-delà : suppose un rapport marqué payant par le webhook Stripe.
 */
export async function requestPlatformAccess(assessmentId: string) {
  if (!accountsAvailable()) {
    return { error: copy.closedBody };
  }

  const assessment = await assessmentStore.get(assessmentId);
  if (!assessment) return { error: "Évaluation introuvable." };

  const email = assessment.answers.email?.trim().toLowerCase();
  if (!email) return { error: "Aucune adresse email n'est rattachée à ce diagnostic." };

  if (paymentsEnabled()) {
    const report = await reportStore.get(assessmentId);
    if (report?.priority !== "PAID") {
      return { error: "Cet accès suppose un paiement confirmé." };
    }
  }

  await signIn("email", { email, redirectTo: "/app/dashboard" });
  return { ok: true };
}
