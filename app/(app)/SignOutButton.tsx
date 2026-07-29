"use client";

import { useTransition } from "react";
import { colors, fonts, alpha } from "@/design/tokens";
import { auth as copy } from "@/content/auth";
import { endSession } from "./sign-out-action";

/** Déconnexion. Présente sur toutes les pages de l'espace payant. */
export function SignOutButton() {
  const [, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(() => void endSession())}
      style={{
        padding: "7px 14px",
        fontFamily: fonts.sans,
        fontSize: "0.76rem",
        letterSpacing: "0.04em",
        cursor: "pointer",
        border: `1px solid ${alpha.goldBorderHover}`,
        background: "transparent",
        color: alpha.whiteCtaText,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = colors.goldLight;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = alpha.whiteCtaText;
      }}
    >
      {copy.signOut}
    </button>
  );
}
