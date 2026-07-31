"use client";

import { ErrorScreen } from "./_components/ErrorScreen";

/**
 * Limite d'erreur des pages (lot D).
 *
 * `global-error` ne suffisait pas : il ne prend le relais que si la MISE EN
 * PAGE RACINE échoue. Une erreur de rendu d'une page ordinaire — une base
 * injoignable pendant l'affichage d'un résultat, par exemple — remontait
 * jusqu'à la page 500 par défaut de Next.js : un corps vide.
 *
 * Conséquence observée avant ce fichier : l'utilisateur voyait une page
 * blanche, et le `digest` journalisé côté serveur ne lui parvenait jamais.
 * La référence qui relie son signalement à la ligne du journal n'existait
 * donc que pour un incident dont personne ne pouvait parler.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorScreen digest={error.digest} reset={reset} />;
}
