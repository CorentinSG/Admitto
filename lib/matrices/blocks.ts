import type { Axis, Verdict } from "@/lib/engine-b/verdict";
import { AXES, VERDICTS } from "@/lib/engine-b/verdict";
import { TEXT_BLOCKS } from "@/lib/engine-a/rules.seed";
import { RISK_BLOCKS, VERDICT_BLOCKS, AXIS_LABELS } from "@/content/report-blocks";
import { PATH_LABELS } from "@/content/result";
import { vocabularyViolation } from "./vocabulary";

/**
 * Blocs de texte éditables sans code (CDC §33).
 *
 * Trois familles, celles dont la rédaction s'affine avec les rapports réels :
 * les textes de voie préliminaire (résultat immédiat), les six verdicts et les
 * cinq risques du rapport. Le reste — commentaires d'axe, prochaines étapes,
 * blocs d'offre, emails — reste dans le code : soit structurel, soit commercial,
 * soit hors de portée du verrou de vocabulaire à l'exécution.
 *
 * Deux principes, hérités du reste du produit :
 *
 * 1. **Append-only.** Une modification crée une révision, jamais un écrasement.
 *    L'assemblage résout les blocs À LA DATE de l'évaluation : un rapport
 *    rouvert six mois plus tard cite les blocs tels qu'ils étaient à sa
 *    génération, sans qu'on ait rien eu à figer de plus.
 *
 * 2. **La décision précède l'écriture** (`decideBlockRevision`) : forme du
 *    contenu, longueurs, vocabulaire interdit et absence de variable sont
 *    contrôlés dans lib/, si bien qu'un appel direct à l'action serveur se
 *    heurte aux mêmes refus que le formulaire.
 */

export type BlockPayload =
  | { kind: "TEXT"; text: string }
  | { kind: "TITLED"; title: string; body: string }
  | { kind: "RISK"; title: string; body: string; actions: string[] };

export type BlockKind = BlockPayload["kind"];

export interface BlockDefinition {
  key: string;
  kind: BlockKind;
  /** Où ce bloc apparaît — affiché dans le back-office. */
  label: string;
  defaultPayload: BlockPayload;
}

/** Préfixes de clés : la famille est lisible dans la clé elle-même. */
const VOIE = (id: string) => `VOIE:${id}`;
const VERDICT = (v: Verdict) => `VERDICT:${v}`;
const RISK = (a: Axis) => `RISK:${a}`;

function buildRegistry(): Map<string, BlockDefinition> {
  const registry = new Map<string, BlockDefinition>();

  for (const [id, text] of Object.entries(TEXT_BLOCKS)) {
    registry.set(VOIE(id), {
      key: VOIE(id),
      kind: "TEXT",
      label: `Résultat immédiat — ${id}`,
      defaultPayload: { kind: "TEXT", text },
    });
  }

  for (const verdict of VERDICTS) {
    const block = VERDICT_BLOCKS[verdict];
    registry.set(VERDICT(verdict), {
      key: VERDICT(verdict),
      kind: "TITLED",
      label: `Rapport, verdict — ${block.title}`,
      defaultPayload: { kind: "TITLED", title: block.title, body: block.body },
    });
  }

  for (const axis of AXES) {
    const block = RISK_BLOCKS[axis];
    registry.set(RISK(axis), {
      key: RISK(axis),
      kind: "RISK",
      label: `Rapport, risque — ${AXIS_LABELS[axis]}`,
      defaultPayload: {
        kind: "RISK",
        title: block.title,
        body: block.body,
        actions: [...block.actions],
      },
    });
  }

  return registry;
}

export const BLOCK_REGISTRY = buildRegistry();

// Utilisé par le back-office pour lister — l'ordre du registre est l'ordre
// d'affichage : voies, puis verdicts, puis risques.
export const BLOCK_DEFINITIONS = [...BLOCK_REGISTRY.values()];

/** Bornes : au-delà, ce n'est plus un bloc, c'est une page. */
export const MAX_TITLE_LENGTH = 120;
export const MAX_BODY_LENGTH = 1200;
export const MAX_ACTIONS = 6;

export type BlockRefusal =
  | { reason: "UNKNOWN_KEY" }
  | { reason: "WRONG_SHAPE" }
  | { reason: "EMPTY_PART"; detail: string }
  | { reason: "TOO_LONG"; detail: string }
  | { reason: "TOO_MANY_ACTIONS" }
  | { reason: "PLACEHOLDER"; detail: string }
  | { reason: "FORBIDDEN_VOCABULARY"; detail: string };

export type BlockDecision =
  | { accepted: true; payload: BlockPayload }
  | { accepted: false; refusal: BlockRefusal };

/**
 * Ces blocs ne passent par AUCUNE substitution de variables : un `{prenom}`
 * écrit de bonne foi serait rendu littéralement dans le rapport. Refusé à la
 * sauvegarde plutôt que découvert par un client.
 */
const PLACEHOLDER = /\{[a-zA-Z]+\}/;

const clean = (value: unknown): string => (typeof value === "string" ? value.trim() : "");

function checkText(part: string, name: string): BlockRefusal | null {
  if (!part) return { reason: "EMPTY_PART", detail: name };
  if (name.includes("titre") && part.length > MAX_TITLE_LENGTH) {
    return { reason: "TOO_LONG", detail: name };
  }
  if (!name.includes("titre") && part.length > MAX_BODY_LENGTH) {
    return { reason: "TOO_LONG", detail: name };
  }
  const placeholder = part.match(PLACEHOLDER);
  if (placeholder) return { reason: "PLACEHOLDER", detail: placeholder[0] };
  const violation = vocabularyViolation(part);
  if (violation) return { reason: "FORBIDDEN_VOCABULARY", detail: violation.why };
  return null;
}

/** Valide une soumission brute et rend le contenu normalisé, ou le refus. */
export function decideBlockRevision(
  key: string,
  raw: { title?: unknown; text?: unknown; body?: unknown; actions?: unknown }
): BlockDecision {
  const definition = BLOCK_REGISTRY.get(key);
  if (!definition) return { accepted: false, refusal: { reason: "UNKNOWN_KEY" } };

  if (definition.kind === "TEXT") {
    const text = clean(raw.text);
    const problem = checkText(text, "le texte");
    if (problem) return { accepted: false, refusal: problem };
    return { accepted: true, payload: { kind: "TEXT", text } };
  }

  const title = clean(raw.title);
  const body = clean(raw.body);
  for (const [part, name] of [
    [title, "le titre"],
    [body, "le corps"],
  ] as const) {
    const problem = checkText(part, name);
    if (problem) return { accepted: false, refusal: problem };
  }

  if (definition.kind === "TITLED") {
    return { accepted: true, payload: { kind: "TITLED", title, body } };
  }

  // RISK : les actions arrivent une par ligne depuis le formulaire.
  const actions =
    typeof raw.actions === "string"
      ? raw.actions
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
      : [];
  if (actions.length === 0) {
    return { accepted: false, refusal: { reason: "EMPTY_PART", detail: "les actions" } };
  }
  if (actions.length > MAX_ACTIONS) {
    return { accepted: false, refusal: { reason: "TOO_MANY_ACTIONS" } };
  }
  for (const action of actions) {
    const problem = checkText(action, "une action");
    if (problem) return { accepted: false, refusal: problem };
  }

  return { accepted: true, payload: { kind: "RISK", title, body, actions } };
}

// ── Résolution « à la date » ────────────────────────────────────────────────

export interface BlockRevisionRow {
  key: string;
  revision: number;
  payload: BlockPayload;
  createdAt: string;
}

/**
 * Blocs effectifs à une date : la dernière révision ANTÉRIEURE à la date
 * l'emporte sur le défaut du code. C'est ce qui rend le gel automatique — une
 * évaluation d'avant la révision se rend avec le texte d'avant, une évaluation
 * d'après avec le texte d'après, sans qu'aucune des deux ne stocke le bloc.
 *
 * Une révision de forme inattendue (donnée corrompue, ancienne version du
 * produit) est ignorée au profit du défaut du code : mieux vaut un texte
 * d'origine qu'un rapport qui ne se rend plus.
 */
export function resolveBlocksAsOf(
  revisions: BlockRevisionRow[],
  date: Date
): Map<string, BlockPayload> {
  const cutoff = date.toISOString();
  const resolved = new Map<string, BlockPayload>();
  const best = new Map<string, BlockRevisionRow>();

  for (const row of revisions) {
    if (row.createdAt > cutoff) continue;
    const definition = BLOCK_REGISTRY.get(row.key);
    if (!definition || row.payload?.kind !== definition.kind) continue;
    const current = best.get(row.key);
    if (!current || row.revision > current.revision) best.set(row.key, row);
  }

  for (const definition of BLOCK_REGISTRY.values()) {
    resolved.set(definition.key, best.get(definition.key)?.payload ?? definition.defaultPayload);
  }
  return resolved;
}

// ── Projections vers les formes que consomment les moteurs ────────────────

export function voieBlocksFrom(resolved: Map<string, BlockPayload>): Record<string, string> {
  const blocks: Record<string, string> = {};
  for (const id of Object.keys(TEXT_BLOCKS)) {
    const payload = resolved.get(VOIE(id));
    blocks[id] = payload?.kind === "TEXT" ? payload.text : TEXT_BLOCKS[id];
  }
  return blocks;
}

export function verdictBlocksFrom(
  resolved: Map<string, BlockPayload>
): Record<Verdict, { title: string; body: string }> {
  const blocks = {} as Record<Verdict, { title: string; body: string }>;
  for (const verdict of VERDICTS) {
    const payload = resolved.get(VERDICT(verdict));
    blocks[verdict] =
      payload?.kind === "TITLED"
        ? { title: payload.title, body: payload.body }
        : VERDICT_BLOCKS[verdict];
  }
  return blocks;
}

export function riskBlocksFrom(
  resolved: Map<string, BlockPayload>
): Record<Axis, { title: string; body: string; actions: string[] }> {
  const blocks = {} as Record<Axis, { title: string; body: string; actions: string[] }>;
  for (const axis of AXES) {
    const payload = resolved.get(RISK(axis));
    blocks[axis] =
      payload?.kind === "RISK"
        ? { title: payload.title, body: payload.body, actions: payload.actions }
        : RISK_BLOCKS[axis];
  }
  return blocks;
}

/** Libellé humain d'une voie, pour l'affichage des blocs VOIE au back-office. */
export { PATH_LABELS };
