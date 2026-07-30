#!/usr/bin/env node
/**
 * Garde-fou des suites de vérification.
 *
 * Une suite qui appelle un helper qu'elle n'a pas importé ne plante pas à la
 * lecture : elle plante **au milieu de l'exécution**, après trois minutes de
 * navigateur, une connexion par email et un questionnaire rempli. Le message
 * est alors « waitForText is not defined » — un oubli d'import déguisé en
 * panne de suite, qui déclenche en prime une reprise inutile dans
 * `verify-all`.
 *
 * ESLint ne le voit pas : les helpers arrivent par un `import()` dynamique
 * déstructuré, et la règle `no-undef` n'est pas active sur ces fichiers.
 *
 * Ce script compare donc, pour chaque suite, les helpers utilisés à ceux
 * réellement déstructurés — et signale au passage un import inutile, qui fait
 * échouer le lint.
 *
 * Usage : node scripts/check-suites.mjs
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DIR = "scripts";
const HELPER_MODULES = ["./lib/wait.mjs", "./lib/questionnaire.mjs", "./lib/sign-in.mjs", "./lib/identity.mjs"];

/** Helpers exportés par les modules d'aide. */
function exportedHelpers() {
  const names = new Set();
  for (const file of readdirSync(join(DIR, "lib"))) {
    const source = readFileSync(join(DIR, "lib", file), "utf8");
    for (const match of source.matchAll(/export (?:async )?function (\w+)/g)) names.add(match[1]);
    for (const match of source.matchAll(/export const (\w+)/g)) names.add(match[1]);
  }
  return names;
}

const helpers = exportedHelpers();
const failures = [];

for (const file of readdirSync(DIR).filter((f) => f.startsWith("verify-") && f !== "verify-all.mjs")) {
  const path = join(DIR, file);
  const source = readFileSync(path, "utf8");

  // Noms déstructurés depuis un import de module d'aide.
  const imported = new Set();
  for (const match of source.matchAll(/const \{([^}]+)\} = await import\(\s*["']([^"']+)["']/g)) {
    if (!HELPER_MODULES.includes(match[2])) continue;
    for (const name of match[1].split(",")) {
      const clean = name.trim().split(":")[0].trim();
      if (clean) imported.add(clean);
    }
  }

  // Corps du fichier, imports retirés : cherche les helpers appelés.
  const body = source.replace(/const \{[^}]+\} = await import\([^)]+\);?/g, "");

  for (const helper of helpers) {
    const used = new RegExp(`\\b${helper}\\s*\\(`).test(body);
    if (used && !imported.has(helper)) {
      failures.push(`${path} : « ${helper} » est appelé sans être importé.`);
    }
    if (!used && imported.has(helper)) {
      failures.push(`${path} : « ${helper} » est importé sans être utilisé (le lint échouera).`);
    }
  }
}

if (failures.length) {
  for (const failure of failures) console.error(`✗ ${failure}`);
  console.error(`\n${failures.length} point(s) en échec.`);
  process.exit(1);
}
console.log("✓ check:suites — chaque suite importe exactement les helpers qu'elle utilise.");
