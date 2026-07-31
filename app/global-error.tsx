"use client";

import { colors } from "@/design/tokens";
import { ErrorScreen } from "./_components/ErrorScreen";

/**
 * Écran de dernier recours (lot D).
 *
 * `global-error` REMPLACE la mise en page racine : ni nav, ni pied de page, ni
 * polices chargées — d'où les repli `serif` / `sans-serif` des tokens, et
 * l'obligation de porter soi-même `<html>` et `<body>`. Un écran d'erreur qui
 * dépend de ce qui vient de casser ne s'affiche pas.
 *
 * Il partage son rendu avec `app/error.tsx` : voir `ErrorScreen`.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, backgroundColor: colors.navy900 }}>
        <ErrorScreen digest={error.digest} reset={reset} standalone />
      </body>
    </html>
  );
}
