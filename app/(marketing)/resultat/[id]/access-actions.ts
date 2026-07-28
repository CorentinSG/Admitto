"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_COOKIE, ACCESS_DAYS, issueAccessToken } from "@/lib/access/session";
import { assessmentStore } from "@/lib/store/assessments";
import { paymentsEnabled } from "@/lib/payments/offers";
import { reportStore } from "@/lib/store/reports";

/**
 * Ouverture de l'accès à l'espace payant (CDC §10 et §21).
 *
 * Le profil déjà constitué suit l'utilisateur : aucune ressaisie après achat.
 *
 * Phase 1A (paiement désactivé) : l'accès est ouvert aux participants de la
 * bêta depuis leur résultat. Phase 1B et au-delà : il suppose un paiement
 * confirmé, c'est-à-dire un rapport marqué payant par le webhook Stripe.
 */
export async function grantPlatformAccess(assessmentId: string) {
  const assessment = await assessmentStore.get(assessmentId);
  if (!assessment) return { error: "Évaluation introuvable." };

  if (paymentsEnabled()) {
    const report = await reportStore.get(assessmentId);
    if (report?.priority !== "PAID") {
      return { error: "Cet accès suppose un paiement confirmé." };
    }
  }

  const token = await issueAccessToken(assessmentId, new Date());
  if (!token) return { error: "L'espace payant n'est pas activé." };

  (await cookies()).set(ACCESS_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ACCESS_DAYS * 24 * 60 * 60,
  });

  redirect("/app/dashboard");
}
