"use client";

import { useState, useTransition } from "react";
import { colors, fonts, alpha } from "@/design/tokens";
import { donnees } from "@/content/donnees";
import { eraseAccount } from "./actions";

/**
 * Confirmation par saisie d'un mot (revue §A1.2).
 *
 * Le bouton reste inactif tant que le mot n'est pas saisi. Ce n'est pas la
 * garantie — le serveur revérifie, c'est lui qui décide — mais l'écran ne doit
 * pas présenter comme un clic ordinaire une action qui efface des mois de
 * travail. Un simple `confirm()` du navigateur ne demande, lui, aucun geste
 * distinct d'un clic.
 */
export function EraseForm({ disabled }: { disabled: boolean }) {
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const matches = confirmation.trim() === donnees.erase.confirmWord;
  const blocked = disabled || !matches || pending;

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          const result = await eraseAccount(formData);
          // Une suppression réussie ne revient pas ici : l'action redirige.
          if (result?.error) setError(result.error);
        });
      }}
      style={{ marginTop: 20 }}
    >
      <label
        htmlFor="confirmation"
        style={{
          display: "block",
          fontFamily: fonts.sans,
          fontSize: "0.78rem",
          letterSpacing: "0.08em",
          color: colors.navy900,
          marginBottom: 8,
        }}
      >
        {donnees.erase.confirmLabel}
      </label>
      <input
        id="confirmation"
        name="confirmation"
        type="text"
        autoComplete="off"
        value={confirmation}
        onChange={(event) => {
          setConfirmation(event.target.value);
          setError(null);
        }}
        disabled={disabled}
        style={{
          fontFamily: fonts.sans,
          fontSize: "0.9rem",
          padding: "10px 12px",
          width: 240,
          maxWidth: "100%",
          color: colors.navy900,
          backgroundColor: colors.ivory,
          border: `1px solid ${alpha.cardGridGap}`,
        }}
      />

      <button
        type="submit"
        disabled={blocked}
        style={{
          display: "block",
          marginTop: 16,
          fontFamily: fonts.sans,
          fontSize: "0.82rem",
          letterSpacing: "0.08em",
          padding: "12px 26px",
          color: blocked ? colors.slate : colors.navy900,
          backgroundColor: "transparent",
          border: `1px solid ${blocked ? alpha.cardGridGap : colors.gold}`,
          cursor: blocked ? "not-allowed" : "pointer",
        }}
      >
        {pending ? donnees.erase.pending : donnees.erase.action}
      </button>

      {error ? (
        <p
          style={{
            fontFamily: fonts.sans,
            fontSize: "0.85rem",
            lineHeight: 1.7,
            margin: "14px 0 0",
            color: colors.navy900,
          }}
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </form>
  );
}
