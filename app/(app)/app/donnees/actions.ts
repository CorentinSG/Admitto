"use server";

import { signOut } from "@/auth";
import { currentUser } from "@/lib/auth/current";
import { usingDatabase } from "@/lib/db/client";
import { erasePersonalData } from "@/lib/legal/personal-data";
import { donnees } from "@/content/donnees";

/**
 * Effacement du compte à la demande (RGPD art. 17 — revue §A1.2).
 *
 * Le mot de confirmation est vérifié **côté serveur**. Le vérifier seulement
 * dans le formulaire ferait qu'un appel direct à l'action — c'est-à-dire une
 * requête POST, rien de plus exotique — effacerait un compte sans confirmation.
 * Même raison que `canSend` pour la relecture des rapports : le garde-fou
 * appartient au serveur, pas à l'écran.
 *
 * La déconnexion suit la suppression et n'est pas facultative : la session
 * survivrait à la ligne `User` qu'elle désigne, et l'espace payant tenterait
 * ensuite de lire un compte disparu.
 */
export async function eraseAccount(formData: FormData) {
  const confirmation = String(formData.get("confirmation") ?? "").trim();
  if (confirmation !== donnees.erase.confirmWord) {
    return { error: donnees.erase.mismatch };
  }

  if (!usingDatabase()) return { error: donnees.erase.unavailable };

  const user = await currentUser();
  if (!user) return { error: donnees.erase.accessError };

  await erasePersonalData(user.id);
  // `redirectTo` plutôt qu'un `redirect` séparé : la déconnexion et le départ
  // vers l'accueil doivent être une seule opération, sinon un échec entre les
  // deux laisse une session pointant vers un compte effacé.
  await signOut({ redirectTo: "/" });
}
