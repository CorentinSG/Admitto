"use server";

import { signOut } from "@/auth";

/** Fin de session, retour à l'accueil. */
export async function endSession() {
  await signOut({ redirectTo: "/" });
}
