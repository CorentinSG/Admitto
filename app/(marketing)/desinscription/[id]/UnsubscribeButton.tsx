"use client";

import { useState, useTransition } from "react";
import { colors, fonts } from "@/design/tokens";
import { desinscription } from "@/content/desinscription";
import { confirmUnsubscribe } from "./actions";

/**
 * Geste explicite de retrait.
 *
 * Le bouton disparaît une fois le retrait enregistré : le laisser inviterait à
 * recliquer, et l'écran ne dirait pas clairement que c'est acquis.
 */
export function UnsubscribeButton({ id }: { id: string }) {
  const [state, setState] = useState<"IDLE" | "DONE" | "ERROR">("IDLE");
  const [pending, startTransition] = useTransition();

  if (state === "DONE") {
    return (
      <p
        style={{
          fontFamily: fonts.sans,
          fontSize: "0.92rem",
          lineHeight: 1.8,
          margin: "26px 0 0",
          color: colors.navy900,
        }}
        role="status"
      >
        {desinscription.done}
      </p>
    );
  }

  return (
    <div style={{ marginTop: 26 }}>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await confirmUnsubscribe(id);
            setState(result.ok ? "DONE" : "ERROR");
          })
        }
        style={{
          fontFamily: fonts.sans,
          fontSize: "0.82rem",
          letterSpacing: "0.08em",
          padding: "13px 28px",
          color: colors.navy900,
          backgroundColor: "transparent",
          border: `1px solid ${colors.gold}`,
          cursor: pending ? "wait" : "pointer",
        }}
      >
        {pending ? desinscription.pending : desinscription.action}
      </button>

      {state === "ERROR" ? (
        <p
          style={{
            fontFamily: fonts.sans,
            fontSize: "0.88rem",
            lineHeight: 1.75,
            margin: "14px 0 0",
            color: colors.navy900,
          }}
          role="alert"
        >
          {desinscription.error}
        </p>
      ) : null}
    </div>
  );
}
