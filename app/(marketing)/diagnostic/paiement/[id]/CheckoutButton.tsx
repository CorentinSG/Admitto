"use client";

import { useState, useTransition } from "react";
import { colors, fonts, gradients, alpha } from "@/design/tokens";
import { checkout } from "@/content/checkout";
import { startCheckout } from "./actions";

/** Bouton de paiement. Désactivé tant que Stripe n'est pas configuré (Phase 1A). */
export function CheckoutButton({
  assessmentId,
  enabled,
  priceLabel,
}: {
  assessmentId: string;
  enabled: boolean;
  priceLabel: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!enabled) {
    return (
      <div style={{ marginTop: 36 }}>
        <p
          style={{
            fontFamily: fonts.sans,
            fontSize: "0.88rem",
            lineHeight: 1.7,
            margin: 0,
            padding: "14px 18px",
            backgroundColor: alpha.goldBadgeBg,
            color: colors.goldLight,
          }}
        >
          {checkout.betaNotice}
        </p>
        <a
          href={`/resultat/${assessmentId}`}
          style={{
            display: "inline-block",
            marginTop: 20,
            background: gradients.goldButton,
            color: colors.navy900,
            padding: "18px 44px",
            fontSize: "0.88rem",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            fontFamily: fonts.sans,
            textDecoration: "none",
          }}
        >
          {checkout.betaCta}
        </a>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 36 }}>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const result = await startCheckout(assessmentId, window.location.origin);
            if (result.url) window.location.href = result.url;
            else setError(result.error ?? checkout.error);
          })
        }
        style={{
          background: gradients.goldButton,
          color: colors.navy900,
          border: "none",
          padding: "18px 44px",
          fontSize: "0.88rem",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          fontFamily: fonts.sans,
          cursor: pending ? "progress" : "pointer",
          opacity: pending ? 0.7 : 1,
        }}
      >
        {checkout.cta.replace("{price}", priceLabel)}
      </button>
      {error && (
        <p
          style={{
            fontFamily: fonts.sans,
            fontSize: "0.85rem",
            margin: "14px 0 0",
            color: colors.goldLight,
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
