#!/usr/bin/env node
/**
 * Garde-fou design (PLAN.md §10) : aucune couleur hex hors de la palette
 * Admitto dans app/ et design/. Les rgba dérivés des tokens sont autorisés.
 *
 * Usage : node scripts/check-design-tokens.mjs
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOTS = ["app", "design"];
const EXTS = new Set([".ts", ".tsx", ".css"]);

// Palette officielle (design/tokens.ts) — seule source de couleurs autorisée.
const PALETTE = new Set(
  [
    "#0A1628", "#0E1D3A", "#142240", "#1E3561", // navy
    "#FAFAF7", "#3D4F6B", // ivory, slate
    "#C9A84C", "#E8C87A", // gold
    "#826A27", // goldText — doré du TEXTE sur fond clair (AA)
    "#FFFFFF", "#FFF", "#000000", // blanc/noir purs (texte hover, ombres)
  ].map((c) => c.toUpperCase())
);

const HEX_RE = /#[0-9a-fA-F]{3,8}\b/g;

function* walk(dir) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const entry of entries) {
    if (entry === "node_modules" || entry === ".next" || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) yield* walk(full);
    else if (EXTS.has(extname(entry))) yield full;
  }
}

let violations = 0;
for (const root of ROOTS) {
  for (const file of walk(root)) {
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, i) => {
      for (const match of line.matchAll(HEX_RE)) {
        const hex = match[0].toUpperCase();
        if (!PALETTE.has(hex)) {
          console.error(`✗ ${file}:${i + 1} — couleur hors palette : ${match[0]}`);
          violations++;
        }
      }
    });
  }
}

if (violations > 0) {
  console.error(`\n${violations} couleur(s) hors palette. Palette officielle : design/tokens.ts.`);
  process.exit(1);
}
console.log("✓ check:tokens — toutes les couleurs proviennent de la palette Admitto.");
