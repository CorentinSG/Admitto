"use client";

import { useState, useTransition } from "react";
import { colors, fonts, alpha, gradients } from "@/design/tokens";
import { STATUS_LABELS } from "@/content/dashboard";
import { TASK_STATUSES, type TaskStatus } from "@/lib/roadmap/types";
import { setTaskStatus } from "../actions";

/** Statuts que l'utilisateur peut choisir — « non applicable » est déduit. */
const SELECTABLE = TASK_STATUSES.filter((s) => s !== "NOT_APPLICABLE");

export function TaskStatusControl({ taskId, status }: { taskId: string; status: TaskStatus }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {SELECTABLE.map((candidate) => {
          const current = candidate === status;
          return (
            <button
              key={candidate}
              type="button"
              disabled={current || pending}
              onClick={() =>
                startTransition(async () => {
                  setError(null);
                  const result = await setTaskStatus(taskId, candidate);
                  if (result?.error) setError(result.error);
                })
              }
              style={{
                padding: "7px 13px",
                fontFamily: fonts.sans,
                fontSize: "0.72rem",
                letterSpacing: "0.03em",
                cursor: current ? "default" : "pointer",
                border: `1px solid ${current ? colors.gold : alpha.cardGridGap}`,
                background: current ? gradients.goldButton : "transparent",
                color: current ? colors.navy900 : colors.slate,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!current) e.currentTarget.style.borderColor = colors.gold;
              }}
              onMouseLeave={(e) => {
                if (!current) e.currentTarget.style.borderColor = alpha.cardGridGap;
              }}
            >
              {STATUS_LABELS[candidate]}
            </button>
          );
        })}
      </div>
      {error && (
        <p style={{ fontFamily: fonts.sans, fontSize: "0.78rem", margin: "8px 0 0", color: colors.goldText }}>
          {error}
        </p>
      )}
    </div>
  );
}
