"use client";

import { useState, useTransition } from "react";
import { colors, fonts, alpha, gradients } from "@/design/tokens";
import { adminConsultations } from "@/content/consultations";
import { OFFER_CODES } from "@/lib/payments/offers";
import { closeSlot, grantConsultations, openSlot, saveSummary } from "./actions";
import { MAX_SUMMARY_LENGTH } from "@/lib/consultations/summary";

/** Ouverture d'un créneau (CDC §31). */
export function OpenSlotForm() {
  const [startsAt, setStartsAt] = useState("");
  const [minutes, setMinutes] = useState("45");
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        <input
          type="datetime-local"
          value={startsAt}
          aria-label="Début du créneau"
          onChange={(e) => setStartsAt(e.target.value)}
          style={field}
        />
        <input
          type="number"
          value={minutes}
          min={15}
          max={180}
          step={15}
          aria-label="Durée en minutes"
          onChange={(e) => setMinutes(e.target.value)}
          style={{ ...field, minWidth: 100 }}
        />
        <button
          type="button"
          disabled={!startsAt}
          onClick={() =>
            startTransition(async () => {
              setError(null);
              /*
               * La saisie part TELLE QUELLE, sans fuseau.
               *
               * `new Date(startsAt).toISOString()` la convertissait ici, donc
               * dans le fuseau du NAVIGATEUR : le même créneau saisi depuis
               * Paris ou depuis New York ne produisait pas le même instant.
               * Le serveur l'interprète en heure de Paris — l'heure du
               * fondateur qui donne la séance, et la seule que le client verra.
               */
              const res = await openSlot(startsAt, Number(minutes));
              if (res?.error) setError(res.error);
              else setStartsAt("");
            })
          }
          style={{ ...button, opacity: startsAt ? 1 : 0.45 }}
        >
          {adminConsultations.addSlot}
        </button>
      </div>
      {error && <Error>{error}</Error>}
    </div>
  );
}

export function CloseSlotButton({ slotId }: { slotId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  return (
    <span>
      <button
        type="button"
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const res = await closeSlot(slotId);
            if (res?.error) setError(res.error);
          })
        }
        style={{
          padding: "5px 11px",
          fontFamily: fonts.sans,
          fontSize: "0.72rem",
          cursor: "pointer",
          border: `1px solid ${alpha.cardGridGap}`,
          background: "transparent",
          color: colors.slate,
        }}
      >
        {adminConsultations.removeSlot}
      </button>
      {error && <Error>{error}</Error>}
    </span>
  );
}

/** Attribution de séances à un utilisateur (CDC §31). */
export function GrantForm({
  assessmentId,
  offer,
  granted,
}: {
  assessmentId: string;
  offer: string | null;
  granted: number;
}) {
  const [selectedOffer, setSelectedOffer] = useState(offer ?? "");
  const [count, setCount] = useState(String(granted));
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [, startTransition] = useTransition();

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
      <select
        value={selectedOffer}
        aria-label={`Offre — ${assessmentId}`}
        onChange={(e) => setSelectedOffer(e.target.value)}
        style={{ ...field, minWidth: 150 }}
      >
        <option value="">Aucune offre</option>
        {OFFER_CODES.map((code) => (
          <option key={code} value={code}>
            {code}
          </option>
        ))}
      </select>
      <input
        type="number"
        value={count}
        min={0}
        max={20}
        aria-label={`Séances accordées — ${assessmentId}`}
        onChange={(e) => setCount(e.target.value)}
        style={{ ...field, minWidth: 80 }}
      />
      {/* Le nom accessible porte l'identifiant : la page compte autant de
          boutons « Accorder » que d'utilisateurs, et rien ne les distinguerait
          sinon — ni pour un lecteur d'écran, ni pour une vérification. */}
      <button
        type="button"
        aria-label={`${adminConsultations.grant} — ${assessmentId}`}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            setSaved(false);
            const res = await grantConsultations(assessmentId, selectedOffer, Number(count));
            if (res?.error) setError(res.error);
            else setSaved(true);
          })
        }
        style={button}
      >
        {adminConsultations.grant}
      </button>
      {saved && !error && (
        <span style={{ fontFamily: fonts.sans, fontSize: "0.75rem", color: colors.goldText }}>✓</span>
      )}
      {error && <Error>{error}</Error>}
    </div>
  );
}

/**
 * Compte rendu d'une séance (CDC §31).
 *
 * Rendu seulement pour une séance COMMENCÉE — c'est la page serveur qui en
 * décide, et l'action le revérifie : un compte rendu d'une séance à venir
 * serait une invention.
 */
export function SummaryForm({ bookingId, summary }: { bookingId: string; summary: string | null }) {
  const [value, setValue] = useState(summary ?? "");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const existing = summary !== null;

  return (
    <div style={{ margin: "10px 0 4px", maxWidth: 640 }}>
      <textarea
        value={value}
        rows={4}
        maxLength={MAX_SUMMARY_LENGTH}
        aria-label={`Compte rendu — ${bookingId}`}
        placeholder={adminConsultations.summaryPlaceholder}
        onChange={(e) => {
          setValue(e.target.value);
          setStatus(null);
        }}
        style={{ ...field, width: "100%", lineHeight: 1.6, resize: "vertical" }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              setError(null);
              const result = await saveSummary(bookingId, value);
              if (result?.error) setError(result.error);
              else
                setStatus(
                  result?.firstTime
                    ? adminConsultations.summarySaved
                    : adminConsultations.summaryUpdated
                );
            })
          }
          style={button}
        >
          {existing ? adminConsultations.summaryUpdate : adminConsultations.summarySave}
        </button>
        {status && (
          <span style={{ fontFamily: fonts.sans, fontSize: "0.78rem", color: colors.slate }}>
            {status}
          </span>
        )}
      </div>
      {error && <Error>{error}</Error>}
    </div>
  );
}

const field: React.CSSProperties = {
  padding: "9px 12px",
  fontFamily: fonts.sans,
  fontSize: "0.85rem",
  color: colors.navy900,
  border: `1px solid ${alpha.cardGridGap}`,
  background: colors.ivory,
};

const button: React.CSSProperties = {
  padding: "9px 18px",
  fontFamily: fonts.sans,
  fontSize: "0.76rem",
  letterSpacing: "0.06em",
  cursor: "pointer",
  border: `1px solid ${colors.gold}`,
  background: gradients.goldButton,
  color: colors.navy900,
};

function Error({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="alert"
      style={{ fontFamily: fonts.sans, fontSize: "0.8rem", margin: "8px 0 0", color: colors.goldText }}
    >
      {children}
    </p>
  );
}
