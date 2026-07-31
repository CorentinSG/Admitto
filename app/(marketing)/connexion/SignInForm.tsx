"use client";

import { useState, useTransition } from "react";
import { colors, fonts, alpha, gradients } from "@/design/tokens";
import { auth as copy } from "@/content/auth";
import { requestSignIn } from "./actions";

/** Formulaire de demande de lien de connexion (CDC §10). */
export function SignInForm({ disabled }: { disabled: boolean }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (disabled) return null;

  return (
    <form
      action={() =>
        startTransition(async () => {
          setError(null);
          const result = await requestSignIn(email);
          if (result?.error) setError(result.error);
        })
      }
      style={{ marginTop: 28, maxWidth: 420 }}
    >
      <label
        htmlFor="email"
        style={{
          display: "block",
          fontFamily: fonts.sans,
          fontSize: "0.68rem",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: colors.goldText,
        }}
      >
        {copy.emailLabel}
      </label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="vous@exemple.com"
        style={{
          display: "block",
          width: "100%",
          marginTop: 10,
          padding: "13px 16px",
          fontFamily: fonts.sans,
          fontSize: "0.95rem",
          color: colors.navy900,
          border: `1px solid ${alpha.cardGridGap}`,
          background: colors.ivory,
        }}
      />

      <button
        type="submit"
        disabled={pending}
        style={{
          marginTop: 18,
          padding: "15px 34px",
          fontFamily: fonts.sans,
          fontSize: "0.78rem",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          cursor: pending ? "default" : "pointer",
          border: `1px solid ${colors.gold}`,
          background: gradients.goldButton,
          color: colors.navy900,
        }}
      >
        {pending ? copy.sending : copy.submit}
      </button>

      {error && (
        <p
          role="alert"
          style={{
            fontFamily: fonts.sans,
            fontSize: "0.85rem",
            lineHeight: 1.7,
            margin: "14px 0 0",
            color: colors.goldText,
          }}
        >
          {error}
        </p>
      )}
    </form>
  );
}
