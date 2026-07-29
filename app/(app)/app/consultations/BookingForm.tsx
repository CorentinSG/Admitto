"use client";

import { useState, useTransition } from "react";
import { colors, fonts, alpha, gradients } from "@/design/tokens";
import { consultations } from "@/content/consultations";
import type { ConsultationType } from "@/lib/consultations/types";
import { bookConsultation, cancelConsultation } from "./actions";

/** Créneau présenté au client : le libellé est formaté côté serveur. */
export interface SlotView {
  id: string;
  label: string;
}

/**
 * Réservation d'une séance (CDC §31).
 *
 * Les libellés de date arrivent formatés du serveur : formater ici donnerait
 * un rendu différent selon le fuseau du navigateur et casserait l'hydratation.
 */
export function BookingForm({
  type,
  slots,
  disabled,
}: {
  type: ConsultationType;
  slots: SlotView[];
  disabled: boolean;
}) {
  const [slotId, setSlotId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  if (disabled || slots.length === 0) return null;

  return (
    <div style={{ marginTop: 18 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        <select
          value={slotId}
          aria-label={`${consultations.chooseSlot} — ${type}`}
          onChange={(e) => setSlotId(e.target.value)}
          style={{
            padding: "9px 12px",
            minWidth: 240,
            fontFamily: fonts.sans,
            fontSize: "0.85rem",
            color: colors.navy900,
            border: `1px solid ${alpha.cardGridGap}`,
            background: colors.ivory,
          }}
        >
          <option value="">{consultations.chooseSlot}</option>
          {slots.map((slot) => (
            <option key={slot.id} value={slot.id}>
              {slot.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          disabled={!slotId}
          onClick={() =>
            startTransition(async () => {
              setError(null);
              const res = await bookConsultation(type, slotId);
              if (res?.error) setError(res.error);
              else setSlotId("");
            })
          }
          style={{
            padding: "9px 18px",
            fontFamily: fonts.sans,
            fontSize: "0.76rem",
            letterSpacing: "0.06em",
            cursor: slotId ? "pointer" : "default",
            border: `1px solid ${colors.gold}`,
            background: gradients.goldButton,
            color: colors.navy900,
            opacity: slotId ? 1 : 0.45,
          }}
        >
          {consultations.book}
        </button>
      </div>

      {error && (
        <p
          role="alert"
          style={{
            fontFamily: fonts.sans,
            fontSize: "0.82rem",
            lineHeight: 1.7,
            margin: "10px 0 0",
            maxWidth: 620,
            color: colors.gold,
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

export function CancelButton({ bookingId }: { bookingId: string }) {
  const [, startTransition] = useTransition();
  return (
    <button
      type="button"
      onClick={() => startTransition(() => void cancelConsultation(bookingId))}
      style={{
        padding: "6px 12px",
        fontFamily: fonts.sans,
        fontSize: "0.72rem",
        cursor: "pointer",
        border: `1px solid ${alpha.cardGridGap}`,
        background: "transparent",
        color: colors.slate,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = colors.gold;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = alpha.cardGridGap;
      }}
    >
      {consultations.cancel}
    </button>
  );
}
