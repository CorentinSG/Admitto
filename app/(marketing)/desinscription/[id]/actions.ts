"use server";

import { assessmentStore } from "@/lib/store/assessments";

/**
 * Enregistre le retrait du consentement (CDC §34).
 *
 * Aucune session n'est exigée : la personne qui se désinscrit n'a pas
 * nécessairement de compte, et lui demander de se connecter pour cesser de
 * recevoir des emails ferait de la sortie un parcours plus long que l'entrée.
 * La possession du lien suffit — et son seul pouvoir est de faire cesser des
 * envois, jamais d'en révéler le contenu ni d'en déclencher.
 *
 * Un identifiant inconnu rend `ok` : la personne n'a rien à corriger, et le
 * résultat qu'elle cherche est acquis dans les deux cas.
 */
export async function confirmUnsubscribe(id: string) {
  await assessmentStore.unsubscribe(id);
  return { ok: true };
}
