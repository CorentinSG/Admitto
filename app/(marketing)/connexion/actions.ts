"use server";

import { signIn } from "@/auth";
import { usingDatabase } from "@/lib/db/client";
import { auth as copy } from "@/content/auth";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Demande de lien de connexion (CDC §10).
 *
 * La réponse ne dit jamais si l'adresse correspond à un compte : la page de
 * confirmation est la même dans tous les cas. Distinguer les deux transformerait
 * le formulaire en outil d'énumération des clients.
 */
export async function requestSignIn(email: string) {
  if (!usingDatabase() || !process.env.AUTH_SECRET) {
    return { error: copy.closedBody };
  }

  const trimmed = email.trim().toLowerCase();
  if (!EMAIL.test(trimmed)) return { error: copy.invalidEmail };

  await signIn("email", { email: trimmed, redirectTo: "/app/dashboard" });
  return { ok: true };
}
