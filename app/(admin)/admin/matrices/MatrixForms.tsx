"use client";

import { useState, useTransition } from "react";
import { colors, fonts, alpha } from "@/design/tokens";
import type { BlockPayload } from "@/lib/matrices/blocks";
import { matrices } from "@/content/matrices";
import { saveBlockRevision, saveRuleRevision } from "./actions";

/**
 * Formulaires d'édition des matrices (CDC §33).
 *
 * Les champs sont préremplis avec l'état EFFECTIF (code + révisions), pas avec
 * le code : rouvrir un bloc révisé doit montrer ce que les clients lisent.
 * La validation vit côté serveur ; ces formulaires ne font que rendre les
 * refus lisibles à l'endroit où l'on tape.
 */

const field = {
  fontFamily: fonts.sans,
  fontSize: "0.88rem",
  padding: "9px 11px",
  color: colors.navy900,
  backgroundColor: colors.ivory,
  border: `1px solid ${alpha.cardGridGap}`,
  width: "100%",
} as const;

const label = {
  display: "block",
  fontFamily: fonts.sans,
  fontSize: "0.7rem",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: colors.goldText,
  margin: "14px 0 6px",
} as const;

const meta = {
  fontFamily: fonts.sans,
  fontSize: "0.75rem",
  color: colors.slate,
} as const;

function SaveButton({ pending, name }: { pending: boolean; name: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      aria-label={name}
      style={{
        marginTop: 16,
        fontFamily: fonts.sans,
        fontSize: "0.8rem",
        letterSpacing: "0.08em",
        padding: "10px 22px",
        color: colors.navy900,
        backgroundColor: "transparent",
        border: `1px solid ${colors.gold}`,
        cursor: pending ? "wait" : "pointer",
      }}
    >
      Enregistrer
    </button>
  );
}

function Feedback({ error, saved }: { error: string | null; saved: boolean }) {
  if (error) {
    return (
      <p style={{ ...meta, color: colors.navy900, marginTop: 10 }} role="alert">
        {error}
      </p>
    );
  }
  if (saved) {
    return (
      <p style={{ ...meta, color: colors.goldText, marginTop: 10 }} role="status">
        {matrices.rules.saved}
      </p>
    );
  }
  return null;
}

export interface RuleView {
  id: string;
  produces: string;
  conditionSummary: string;
  active: boolean;
  sourceUrl: string;
  /** `AAAA-MM-JJ` ou vide — valeur brute du champ date, indépendante du fuseau. */
  verifiedAtValue: string;
  version: number;
  /** Libellé de provenance, déjà formaté côté serveur. */
  revisionLabel: string;
  /**
   * Avertissement lorsque la révision CONTREDIT le code, `null` sinon.
   *
   * Une règle activée en code et éteinte par une vieille révision reste
   * éteinte : c'est la révision qui gouverne. Le libellé de provenance disait
   * « révision 26 » sans le dire, et l'activation faite en code passait
   * inaperçue — c'est arrivé sur R-ALT-001, éteinte par le résidu d'une suite
   * de vérification.
   */
  divergence: string | null;
}

export function RuleForm({ rule }: { rule: RuleView }) {
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) =>
        startTransition(async () => {
          setError(null);
          setSaved(false);
          const result = await saveRuleRevision(formData);
          if (result?.error) setError(result.error);
          else setSaved(true);
        })
      }
      style={{ padding: "20px 0", borderTop: `1px solid ${alpha.cardGridGap}` }}
    >
      <input type="hidden" name="ruleId" value={rule.id} />

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 12 }}>
        <h3
          style={{
            fontFamily: fonts.serif,
            fontWeight: 400,
            fontSize: "1.1rem",
            margin: 0,
            color: colors.navy900,
          }}
        >
          {rule.id}
        </h3>
        <span style={meta}>
          {matrices.rules.produces} {rule.produces} · {matrices.rules.version(rule.version)} ·{" "}
          {rule.revisionLabel}
        </span>
        {rule.divergence && (
          <span style={{ ...meta, color: colors.goldText, display: "block", marginTop: 4 }}>
            {rule.divergence}
          </span>
        )}
      </div>

      <p style={{ ...meta, margin: "8px 0 0" }}>
        {matrices.rules.condition} : {rule.conditionSummary}
      </p>

      <div
        className="matrix-grid"
        style={{ display: "grid", gridTemplateColumns: "1fr 200px 140px", gap: 14 }}
      >
        <div>
          <label style={label} htmlFor={`source-${rule.id}`}>
            {matrices.rules.source}
          </label>
          <input
            id={`source-${rule.id}`}
            name="sourceUrl"
            type="text"
            defaultValue={rule.sourceUrl}
            style={field}
          />
        </div>
        <div>
          <label style={label} htmlFor={`verified-${rule.id}`}>
            {matrices.rules.verifiedAt}
          </label>
          <input
            id={`verified-${rule.id}`}
            name="verifiedAt"
            type="date"
            defaultValue={rule.verifiedAtValue}
            style={field}
          />
        </div>
        <div>
          <label style={label} htmlFor={`active-${rule.id}`}>
            {rule.active ? matrices.rules.active : matrices.rules.inactive}
          </label>
          <input
            id={`active-${rule.id}`}
            name="active"
            type="checkbox"
            defaultChecked={rule.active}
            style={{ width: 20, height: 20, marginTop: 8 }}
          />
        </div>
      </div>

      <SaveButton pending={pending} name={`${matrices.rules.save} — ${rule.id}`} />
      <Feedback error={error} saved={saved} />
    </form>
  );
}

export interface BlockView {
  key: string;
  label: string;
  payload: BlockPayload;
  revisionLabel: string;
}

export function BlockForm({ block }: { block: BlockView }) {
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const { payload } = block;

  return (
    <form
      action={(formData) =>
        startTransition(async () => {
          setError(null);
          setSaved(false);
          const result = await saveBlockRevision(formData);
          if (result?.error) setError(result.error);
          else setSaved(true);
        })
      }
      style={{ padding: "20px 0", borderTop: `1px solid ${alpha.cardGridGap}` }}
    >
      <input type="hidden" name="key" value={block.key} />

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 12 }}>
        <h3
          style={{
            fontFamily: fonts.sans,
            fontWeight: 500,
            fontSize: "0.95rem",
            margin: 0,
            color: colors.navy900,
          }}
        >
          {block.label}
        </h3>
        <span style={meta}>{block.revisionLabel}</span>
      </div>

      {payload.kind === "TEXT" ? (
        <>
          <label style={label} htmlFor={`text-${block.key}`}>
            {matrices.blocks.textField}
          </label>
          <textarea
            id={`text-${block.key}`}
            name="text"
            rows={4}
            defaultValue={payload.text}
            style={{ ...field, resize: "vertical" }}
          />
        </>
      ) : (
        <>
          <label style={label} htmlFor={`title-${block.key}`}>
            {matrices.blocks.titleField}
          </label>
          <input
            id={`title-${block.key}`}
            name="title"
            type="text"
            defaultValue={payload.title}
            style={field}
          />
          <label style={label} htmlFor={`body-${block.key}`}>
            {matrices.blocks.bodyField}
          </label>
          <textarea
            id={`body-${block.key}`}
            name="body"
            rows={4}
            defaultValue={payload.body}
            style={{ ...field, resize: "vertical" }}
          />
          {payload.kind === "RISK" ? (
            <>
              <label style={label} htmlFor={`actions-${block.key}`}>
                {matrices.blocks.actionsField}
              </label>
              <textarea
                id={`actions-${block.key}`}
                name="actions"
                rows={4}
                defaultValue={payload.actions.join("\n")}
                style={{ ...field, resize: "vertical" }}
              />
            </>
          ) : null}
        </>
      )}

      <SaveButton pending={pending} name={`${matrices.blocks.save} — ${block.key}`} />
      <Feedback error={error} saved={saved} />
    </form>
  );
}
