"use server";

import { headers } from "next/headers";
import { signIn } from "@/auth";
import { auth as copy } from "@/content/auth";
import { callerIp, checkRateLimit } from "@/lib/security/rate-limit";
import { security } from "@/content/security";
import { accountsAvailable } from "@/lib/config/capabilities";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Demande de lien de connexion (CDC §10).
 *
 * La réponse ne dit jamais si l'adresse correspond à un compte : la page de
 * confirmation est la même dans tous les cas. Distinguer les deux transformerait
 * le formulaire en outil d'énumération des clients.
 */
export async function requestSignIn(email: string) {
  if (!accountsAvailable()) {
    return { error: copy.closedBody };
  }

  const trimmed = email.trim().toLowerCase();
  if (!EMAIL.test(trimmed)) return { error: copy.invalidEmail };

  // Chaque demande envoie un email à l'adresse indiquée : sans plafond, le
  // formulaire suffit à inonder la boîte de n'importe qui.
  const limit = await checkRateLimit("SIGN_IN", { ip: callerIp(await headers()), email: trimmed });
  if (!limit.ok) return { error: security.tooManyAttempts(limit.retryAfterMinutes) };

  await signIn("email", { email: trimmed, redirectTo: "/app/dashboard" });
  return { ok: true };
}
