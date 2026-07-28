#!/usr/bin/env node
/**
 * Garde-fou CDC §14.1 : chaque règle du Moteur A doit porter un identifiant,
 * une condition, un fait produit, un bloc de texte, une source officielle, une
 * date de vérification, une version et un statut.
 *
 * Règle dure : une règle ACTIVE sans source ni date de vérification est refusée.
 * Une règle non vérifiée reste inactive, et le moteur retombe alors sur la
 * catégorie « revue humaine » — comportement voulu par le cahier des charges.
 *
 * Alerte : une source vérifiée il y a plus de STALE_MONTHS mois est signalée
 * (les règles du BOLE et des autorités migratoires évoluent).
 */
import { readFileSync } from "node:fs";

const STALE_MONTHS = 12;
const SRC = "lib/engine-a/rules.seed.ts";
const TODAY = new Date();

const source = readFileSync(SRC, "utf8");

// Extraction textuelle : le fichier est du TypeScript, on ne l'exécute pas.
const blocks = source.split(/\n\s*\{\s*\n\s*id:/).slice(1);
if (blocks.length === 0) {
  console.error(`✗ Aucune règle trouvée dans ${SRC}.`);
  process.exit(1);
}

const field = (block, name) => {
  const m = block.match(new RegExp(`${name}:\\s*("[^"]*"|null|true|false|\\d+)`));
  return m ? m[1].replace(/"/g, "") : null;
};

let errors = 0;
let warnings = 0;
let active = 0;

for (const block of blocks) {
  const id = (block.match(/^\s*"([^"]+)"/) ?? [])[1] ?? "(sans id)";
  const isActive = field(block, "active") === "true";
  const verifiedAt = field(block, "verifiedAt");
  const sourceUrl = field(block, "sourceUrl");
  const version = field(block, "version");
  const textBlockId = field(block, "textBlockId");
  const factProduced = field(block, "factProduced");

  for (const [label, value] of [
    ["factProduced", factProduced],
    ["textBlockId", textBlockId],
    ["version", version],
  ]) {
    if (!value) {
      console.error(`✗ ${id} — champ obligatoire manquant : ${label}`);
      errors++;
    }
  }

  if (isActive) {
    active++;
    if (!sourceUrl) {
      console.error(`✗ ${id} — règle ACTIVE sans source officielle.`);
      errors++;
    }
    if (!verifiedAt || verifiedAt === "null") {
      console.error(`✗ ${id} — règle ACTIVE sans date de vérification.`);
      errors++;
    } else {
      const months =
        (TODAY.getFullYear() - new Date(verifiedAt).getFullYear()) * 12 +
        (TODAY.getMonth() - new Date(verifiedAt).getMonth());
      if (months > STALE_MONTHS) {
        console.warn(`⚠ ${id} — source vérifiée il y a ${months} mois, à re-contrôler.`);
        warnings++;
      }
    }
  }
}

if (errors > 0) {
  console.error(`\n${errors} règle(s) non conforme(s) au CDC §14.1.`);
  process.exit(1);
}
console.log(
  `✓ check:rules — ${blocks.length} règle(s), dont ${active} active(s) ; toutes sourcées et datées${
    warnings ? ` (${warnings} alerte(s) de fraîcheur)` : ""
  }.`
);
