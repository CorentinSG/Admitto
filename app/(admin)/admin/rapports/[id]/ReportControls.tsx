"use client";

import { useState, useTransition } from "react";
import { colors, fonts, alpha, gradients } from "@/design/tokens";
import { addCorrection, setReportStatus } from "../../actions";
import { REPORT_STATUSES, type ReportStatus } from "@/lib/store/reports";
import { STATUS_LABELS } from "@/content/admin";

/**
 * Transitions de statut et journal des corrections (CDC §18, §33).
 *
 * `sendBlocked` grise le bouton d'envoi, mais ne le protège pas : le refus
 * réel est côté serveur. Ce n'est qu'un moyen d'éviter un clic inutile.
 */
export function ReportControls({
  id,
  status,
  sendBlocked,
}: {
  id: string;
  status: ReportStatus;
  sendBlocked: boolean;
}) {
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const run = (fn: () => Promise<{ error?: string } | undefined>) =>
    startTransition(async () => {
      setError(null);
      const res = await fn();
      if (res?.error) setError(res.error);
    });

  return (
    <div style={{ marginTop: 40 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {REPORT_STATUSES.map((candidate) => {
          const current = candidate === status;
          const blocked = candidate === "SENT" && sendBlocked;
          return (
            <button
              key={candidate}
              type="button"
              disabled={current || pending || blocked}
              title={blocked ? "Revue incomplète : traitez les points bloquants." : undefined}
              onClick={() => run(() => setReportStatus(id, candidate))}
              style={{
                padding: "12px 20px",
                fontFamily: fonts.sans,
                fontSize: "0.8rem",
                letterSpacing: "0.04em",
                cursor: current || blocked ? "default" : "pointer",
                border: `1px solid ${current ? colors.gold : alpha.cardGridGap}`,
                background: current ? gradients.goldButton : "transparent",
                color: current ? colors.navy900 : colors.slate,
                opacity: blocked ? 0.45 : 1,
              }}
            >
              {STATUS_LABELS[candidate]}
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 28 }}>
        <label
          style={{
            display: "block",
            fontFamily: fonts.sans,
            fontSize: "0.72rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: colors.goldText,
          }}
        >
          Journal des corrections
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Correction apportée au projet de rapport, ou dérogation à la méthodologie."
          maxLength={1000}
          style={{
            width: "100%",
            maxWidth: 640,
            minHeight: 90,
            marginTop: 12,
            padding: "14px 16px",
            fontFamily: fonts.sans,
            fontSize: "0.9rem",
            border: `1px solid ${alpha.cardGridGap}`,
            backgroundColor: colors.ivory,
            color: colors.navy900,
            resize: "vertical",
          }}
        />
        <button
          type="button"
          disabled={pending || !note.trim()}
          onClick={() =>
            run(async () => {
              const res = await addCorrection(id, note);
              if (!res?.error) setNote("");
              return res;
            })
          }
          style={{
            display: "block",
            marginTop: 12,
            padding: "12px 22px",
            fontFamily: fonts.sans,
            fontSize: "0.8rem",
            letterSpacing: "0.04em",
            border: `1px solid ${colors.gold}`,
            background: "transparent",
            color: colors.navy900,
            cursor: note.trim() ? "pointer" : "default",
            opacity: note.trim() ? 1 : 0.5,
          }}
        >
          Consigner
        </button>
      </div>

      {error && (
        <p style={{ fontFamily: fonts.sans, fontSize: "0.85rem", color: colors.goldText }}>{error}</p>
      )}
    </div>
  );
}
