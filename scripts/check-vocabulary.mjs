#!/usr/bin/env node
/**
 * Garde-fou CDC §5/§6/§7/§14.4 : aucun vocabulaire de garantie de résultat,
 * aucune présentation « avocat » du service, dans tout texte visible
 * (app/, content/, lib/report/, emails).
 *
 * Usage : node scripts/check-vocabulary.mjs
 * Sort avec code 1 si un terme interdit est trouvé.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOTS = ["app", "content", "lib", "design"];
const EXTS = new Set([".ts", ".tsx", ".md", ".mdx", ".json", ".txt"]);

// Chaque entrée : [regex, explication]. Insensible à la casse.
const FORBIDDEN = [
  [/attorney[- ]reviewed/i, "CDC §6 : ne jamais dire que les rapports sont revus par un avocat."],
  [/\bEsq\.?\b/, "CDC §7 : jamais de signature « Esq. »."],
  [/attorney at law/i, "CDC §7 : jamais de signature « Attorney at Law »."],
  [/admission garantie|résultat garanti|resultat garanti|succès garanti|succes garanti/i,
    "CDC §5 : aucun vocabulaire suggérant qu'un résultat est garanti."],
  [/guaranteed (admission|result|job|visa|success)/i,
    "CDC §5 : aucun vocabulaire suggérant qu'un résultat est garanti."],
  [/vous êtes éligible|vous etes eligible|you are eligible/i,
    "CDC §14.1 : le moteur ne détermine jamais une éligibilité définitive."],
  [/probabilité de réussite|probabilite de reussite|probability of success/i,
    "CDC §14.4 : aucun verdict présenté comme une probabilité de réussite."],
  [/consultations? illimitée?s?|unlimited consultations?/i,
    "CDC §30 : aucune offre ne promet des consultations illimitées."],
];

// Fichiers où les termes apparaissent légitimement (docs internes, ce script).
const ALLOWLIST = new Set([
  "scripts/check-vocabulary.mjs",
  // Le miroir d'exécution de ce script : il PORTE la liste des motifs pour
  // refuser un bloc édité au back-office. Même statut que le script lui-même.
  "lib/matrices/vocabulary.ts",
  "PLAN.md",
  "CLAUDE.md",
]);

/**
 * Les fichiers de test sont hors périmètre : ils citent nécessairement les
 * termes interdits pour vérifier qu'ils n'apparaissent PAS dans la copie
 * (`expect(signature).not.toMatch(/Esq\./)`). Le garde-fou vise le texte
 * livré à l'utilisateur, et les tests ne sont jamais livrés.
 */
const isTestFile = (path) => /\.test\.tsx?$/.test(path);

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
    if (ALLOWLIST.has(file.replaceAll("\\", "/")) || isTestFile(file)) continue;
    const text = readFileSync(file, "utf8");
    const lines = text.split("\n");
    for (const [re, why] of FORBIDDEN) {
      lines.forEach((line, i) => {
        if (re.test(line)) {
          console.error(`✗ ${file}:${i + 1} — « ${line.trim().slice(0, 90)} »\n  ${why}`);
          violations++;
        }
      });
    }
  }
}

if (violations > 0) {
  console.error(`\n${violations} violation(s) de vocabulaire. Voir PLAN.md §8 et CDC §5–7.`);
  process.exit(1);
}
console.log("✓ check:vocabulary — aucun vocabulaire interdit détecté.");
