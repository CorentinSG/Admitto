"use client";

import { useState, useTransition } from "react";
import { colors, fonts, gradients } from "@/design/tokens";
import { dashboard } from "@/content/dashboard";
import { grantPlatformAccess } from "./access-actions";

/**
 * Ouverture de l'espace payant depuis le résultat (CDC §10).
 * Le bouton n'apparaît que si l'espace est activé côté serveur.
 */
export function AccessButton({ assessmentId }: { assessmentId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div style={{ marginTop: 20 }}>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const result = await grantPlatformAccess(assessmentId);
            if (result?.error) setError(result.error);
          })
        }
        style={{
          background: gradients.goldButton,
          color: colors.navy900,
          border: "none",
          padding: "16px 34px",
          fontSize: "0.82rem",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          fontFamily: fonts.sans,
          cursor: pending ? "progress" : "pointer",
          opacity: pending ? 0.7 : 1,
        }}
      >
        {dashboard.betaAccess}
      </button>
      {error && (
        <p
          style={{
            fontFamily: fonts.sans,
            fontSize: "0.82rem",
            margin: "12px 0 0",
            color: colors.goldLight,
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
