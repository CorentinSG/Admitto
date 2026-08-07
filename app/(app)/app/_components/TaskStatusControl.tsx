"use client";

import { useState, useTransition } from "react";
import { colors, fonts, alpha, gradients } from "@/design/tokens";
import { dashboard, STATUS_LABELS } from "@/content/dashboard";
import { TASK_STATUSES, type TaskStatus } from "@/lib/roadmap/types";
import { MAX_NOTE_LENGTH } from "@/lib/roadmap/note";
import { setTaskNote, setTaskStatus } from "../actions";

/** Statuts que l'utilisateur peut choisir — « non applicable » est déduit. */
const SELECTABLE = TASK_STATUSES.filter((s) => s !== "NOT_APPLICABLE");

export function TaskStatusControl({
  taskId,
  status,
  note = null,
}: {
  taskId: string;
  status: TaskStatus;
  note?: string | null;
}) {
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

      <TaskNote taskId={taskId} note={note} onError={setError} />

      {error && (
        <p style={{ fontFamily: fonts.sans, fontSize: "0.78rem", margin: "8px 0 0", color: colors.goldText }}>
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * La note de suivi, repliée par défaut.
 *
 * Repliée pour ne pas alourdir une feuille de route de vingt tâches : un champ
 * de texte ouvert sous chacune la transformerait en formulaire. Il s'ouvre au
 * clic, et reste ouvert dès qu'une note existe — sinon la note écrite
 * disparaîtrait de la vue à la première actualisation.
 */
function TaskNote({
  taskId,
  note,
  onError,
}: {
  taskId: string;
  note: string | null;
  onError: (message: string | null) => void;
}) {
  const [open, setOpen] = useState(note !== null);
  const [value, setValue] = useState(note ?? "");
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const c = dashboard.taskNote;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          marginTop: 12,
          padding: 0,
          background: "none",
          border: "none",
          cursor: "pointer",
          fontFamily: fonts.sans,
          fontSize: "0.76rem",
          color: colors.goldText,
        }}
      >
        + {c.empty}
      </button>
    );
  }

  return (
    <div style={{ marginTop: 14, maxWidth: 640 }}>
      <label
        htmlFor={`note-${taskId}`}
        style={{
          display: "block",
          fontFamily: fonts.sans,
          fontSize: "0.72rem",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: colors.slate,
          marginBottom: 6,
        }}
      >
        {c.label}
      </label>
      <textarea
        id={`note-${taskId}`}
        value={value}
        maxLength={MAX_NOTE_LENGTH}
        rows={3}
        placeholder={c.placeholder}
        onChange={(e) => {
          setValue(e.target.value);
          setSaved(false);
        }}
        style={{
          width: "100%",
          padding: "10px 12px",
          fontFamily: fonts.sans,
          fontSize: "0.84rem",
          lineHeight: 1.6,
          color: colors.navy900,
          background: alpha.whiteFaint,
          border: `1px solid ${alpha.cardGridGap}`,
          resize: "vertical",
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              onError(null);
              const result = await setTaskNote(taskId, value);
              if (result?.error) onError(result.error);
              else setSaved(true);
            })
          }
          style={{
            padding: "7px 15px",
            fontFamily: fonts.sans,
            fontSize: "0.74rem",
            letterSpacing: "0.03em",
            cursor: "pointer",
            border: "none",
            background: gradients.goldButton,
            color: colors.navy900,
          }}
        >
          {c.save}
        </button>
        {saved && (
          <span style={{ fontFamily: fonts.sans, fontSize: "0.76rem", color: colors.slate }}>
            {c.saved}
          </span>
        )}
      </div>
      <p
        style={{
          fontFamily: fonts.sans,
          fontSize: "0.72rem",
          lineHeight: 1.6,
          margin: "8px 0 0",
          color: colors.slate,
        }}
      >
        {c.hint}
      </p>
    </div>
  );
}
