"use client";

import { useMemo, useState, useTransition } from "react";
import { colors, fonts, alpha, gradients } from "@/design/tokens";
import { FIELD_GROUPS, simulator } from "@/content/simulator";
import { computeScenario, formatUsd } from "@/lib/simulator/compute";
import { applyCityPreset, CITY_PRESETS, defaultInputs } from "@/lib/simulator/defaults";
import { CITIES, MAX_SCENARIOS, type City, type ScenarioInputs } from "@/lib/simulator/types";
import { removeScenario, saveScenario } from "./actions";

/**
 * Simulateur de coût (CDC §26).
 *
 * Le calcul est instantané côté client — il est pur et sans effet de bord, le
 * refaire à chaque frappe ne coûte rien. L'enregistrement passe par une action
 * serveur, qui revalide les montants.
 */
export function Simulator({
  saved,
}: {
  saved: Array<{ id: string; inputs: ScenarioInputs }>;
}) {
  const [inputs, setInputs] = useState<ScenarioInputs>(() => defaultInputs("Mon scénario"));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const outputs = useMemo(() => computeScenario(inputs), [inputs]);

  const comparison = useMemo(
    () => saved.map((s) => ({ ...s, outputs: computeScenario(s.inputs) })),
    [saved]
  );
  const cheapestId = useMemo(() => {
    if (comparison.length < 2) return null;
    return comparison.reduce((best, s) => (s.outputs.net < best.outputs.net ? s : best)).id;
  }, [comparison]);

  const setField = (key: keyof ScenarioInputs, value: number) =>
    setInputs((prev) => ({ ...prev, [key]: value }));

  function submit() {
    startTransition(async () => {
      setMessage(null);
      const result = await saveScenario(editingId, inputs as unknown as Record<string, unknown>);
      if (result.error === "LIMIT_REACHED") setMessage(simulator.limitReached);
      else if (result.error) setMessage(result.error);
      else {
        setMessage(simulator.saved);
        setEditingId(null);
      }
    });
  }

  return (
    <div>
      {/* ── Sorties, visibles en permanence ─────────────────────────────── */}
      <section
        style={{
          marginTop: 32,
          padding: "30px 28px",
          background: gradients.darkSection,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 14,
          }}
        >
          {(["academic", "living", "bar", "postGraduation"] as const).map((key) => (
            <Output key={key} label={simulator.outputs[key]} value={outputs[key]} />
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 14,
            marginTop: 14,
          }}
        >
          <Output label={simulator.outputs.total} value={outputs.total} large />
          <Output label={simulator.outputs.net} value={outputs.net} large highlight />
        </div>

        <p
          style={{
            fontFamily: fonts.sans,
            fontSize: "0.78rem",
            lineHeight: 1.7,
            margin: "18px 0 0",
            color: alpha.whiteDesc,
          }}
        >
          {simulator.netNote} {simulator.noRoi}
        </p>
      </section>

      {/* ── Saisie ──────────────────────────────────────────────────────── */}
      <div style={{ marginTop: 40, display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end" }}>
        <label style={{ display: "block" }}>
          <span style={labelStyle}>{simulator.scenarioName}</span>
          <input
            type="text"
            value={inputs.label}
            maxLength={60}
            onChange={(e) => setInputs((prev) => ({ ...prev, label: e.target.value }))}
            style={{ ...inputStyle, width: 260 }}
          />
        </label>

        <label style={{ display: "block" }}>
          <span style={labelStyle}>{simulator.cityLabel}</span>
          <select
            value={inputs.city}
            onChange={(e) => setInputs((prev) => applyCityPreset(prev, e.target.value as City))}
            style={{ ...inputStyle, width: 260 }}
          >
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {CITY_PRESETS[city].label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p style={{ fontFamily: fonts.sans, fontSize: "0.78rem", margin: "10px 0 0", color: colors.slate }}>
        {simulator.cityNote}
      </p>

      {FIELD_GROUPS.map((group) => (
        <section key={group.title} style={{ marginTop: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ display: "block", width: 32, height: 1, backgroundColor: colors.gold }} />
            <h2
              style={{
                fontFamily: fonts.sans,
                fontSize: "0.7rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: colors.gold,
                margin: 0,
              }}
            >
              {group.title}
            </h2>
          </div>
          {group.note && (
            <p style={{ fontFamily: fonts.sans, fontSize: "0.78rem", margin: "10px 0 0", color: colors.slate }}>
              {group.note}
            </p>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
              gap: 16,
              marginTop: 18,
            }}
          >
            {group.fields.map((field) => (
              <label key={field.key} style={{ display: "block" }}>
                <span style={labelStyle}>
                  {field.label}
                  {field.unit === "usdMonthly" && " ($ / mois)"}
                  {field.unit === "usd" && " ($)"}
                  {field.unit === "months" && " (mois)"}
                </span>
                <input
                  type="number"
                  min={0}
                  value={inputs[field.key] as number}
                  onChange={(e) => setField(field.key, Number(e.target.value))}
                  style={inputStyle}
                />
              </label>
            ))}
          </div>
        </section>
      ))}

      <div style={{ marginTop: 36, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          style={{
            background: gradients.goldButton,
            color: colors.navy900,
            border: "none",
            padding: "15px 30px",
            fontFamily: fonts.sans,
            fontSize: "0.8rem",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            cursor: pending ? "progress" : "pointer",
            opacity: pending ? 0.7 : 1,
          }}
        >
          {simulator.save}
        </button>
        <button
          type="button"
          onClick={() => {
            setInputs(defaultInputs("Nouveau scénario"));
            setEditingId(null);
            setMessage(null);
          }}
          style={{
            background: "transparent",
            border: `1px solid ${alpha.cardGridGap}`,
            color: colors.slate,
            padding: "15px 24px",
            fontFamily: fonts.sans,
            fontSize: "0.8rem",
            cursor: "pointer",
          }}
        >
          {simulator.newScenario}
        </button>
        {message && (
          <span style={{ fontFamily: fonts.sans, fontSize: "0.84rem", color: colors.gold }}>
            {message}
          </span>
        )}
      </div>

      {/* ── Comparaison ─────────────────────────────────────────────────── */}
      <section style={{ marginTop: 56 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ display: "block", width: 32, height: 1, backgroundColor: colors.gold }} />
          <h2
            style={{
              fontFamily: fonts.sans,
              fontSize: "0.7rem",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: colors.gold,
              margin: 0,
            }}
          >
            {simulator.comparisonTitle} ({comparison.length} / {MAX_SCENARIOS})
          </h2>
        </div>

        {comparison.length === 0 ? (
          <p style={{ fontFamily: fonts.sans, fontSize: "0.88rem", margin: "16px 0 0", color: colors.slate }}>
            {simulator.comparisonEmpty}
          </p>
        ) : (
          <div style={{ marginTop: 20, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
              <thead>
                <tr>
                  <th style={thStyle} />
                  {comparison.map((s) => (
                    <th key={s.id} style={{ ...thStyle, textAlign: "right" }}>
                      {s.inputs.label}
                      {s.id === cheapestId && (
                        <span style={{ display: "block", fontSize: "0.62rem", color: colors.gold }}>
                          {simulator.cheapest}
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(["academic", "living", "bar", "postGraduation", "total", "net"] as const).map((key) => (
                  <tr key={key} style={{ borderTop: `1px solid ${alpha.cardGridGap}` }}>
                    <td
                      style={{
                        padding: "11px 0",
                        fontFamily: fonts.sans,
                        fontSize: "0.85rem",
                        color: key === "net" ? colors.navy900 : colors.slate,
                        fontWeight: key === "net" ? 500 : 400,
                      }}
                    >
                      {simulator.outputs[key]}
                    </td>
                    {comparison.map((s) => (
                      <td
                        key={s.id}
                        style={{
                          padding: "11px 0",
                          textAlign: "right",
                          fontFamily: fonts.serif,
                          fontSize: key === "net" ? "1.05rem" : "0.92rem",
                          color: key === "net" && s.id === cheapestId ? colors.gold : colors.navy900,
                        }}
                      >
                        {formatUsd(s.outputs[key])}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr style={{ borderTop: `1px solid ${alpha.cardGridGap}` }}>
                  <td />
                  {comparison.map((s) => (
                    <td key={s.id} style={{ padding: "14px 0", textAlign: "right" }}>
                      <button
                        type="button"
                        onClick={() =>
                          startTransition(async () => {
                            await removeScenario(s.id);
                          })
                        }
                        style={{
                          background: "transparent",
                          border: "none",
                          padding: 0,
                          fontFamily: fonts.sans,
                          fontSize: "0.78rem",
                          color: colors.slate,
                          cursor: "pointer",
                        }}
                      >
                        {simulator.remove}
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontFamily: fonts.sans,
  fontSize: "0.72rem",
  letterSpacing: "0.04em",
  color: colors.slate,
  marginBottom: 6,
} as const;

const inputStyle = {
  width: "100%",
  padding: "11px 13px",
  fontFamily: fonts.sans,
  fontSize: "0.9rem",
  border: `1px solid ${alpha.cardGridGap}`,
  backgroundColor: colors.ivory,
  color: colors.navy900,
} as const;

const thStyle = {
  padding: "0 0 12px",
  textAlign: "left",
  fontFamily: fonts.sans,
  fontSize: "0.72rem",
  letterSpacing: "0.06em",
  color: colors.slate,
  fontWeight: 400,
} as const;

function Output({
  label,
  value,
  large,
  highlight,
}: {
  label: string;
  value: number;
  large?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        padding: "16px 16px",
        backgroundColor: highlight ? alpha.goldItemHoverBg : alpha.whiteFaint,
        border: `1px solid ${highlight ? alpha.goldBorderHover : alpha.goldBorderFaint}`,
      }}
    >
      <span
        style={{
          display: "block",
          fontFamily: fonts.sans,
          fontSize: "0.64rem",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: colors.gold,
        }}
      >
        {label}
      </span>
      <span
        style={{
          display: "block",
          fontFamily: fonts.serif,
          fontSize: large ? "1.7rem" : "1.15rem",
          margin: "8px 0 0",
          color: colors.ivory,
        }}
      >
        {formatUsd(value)}
      </span>
    </div>
  );
}
