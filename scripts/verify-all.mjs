#!/usr/bin/env node
/**
 * Enchaîne les huit suites navigateur et résume (revue §B2).
 *
 * Deux raisons d'exister plutôt que de lancer les suites à la main :
 *
 * 1. **Ordre stable.** Chaque suite écrit en base ; les lancer dans un ordre
 *    fixe rend les échecs comparables d'une exécution à l'autre.
 *
 * 2. **Une seule reprise par suite, jamais par assertion.** Un plantage de
 *    Playwright — navigateur qui meurt, navigation perdue — n'apprend rien et
 *    mérite une seconde chance. Un échec d'assertion, lui, doit rester rouge :
 *    reprendre au niveau de l'assertion transformerait la suite en machine à
 *    fabriquer du vert. La distinction se lit sur le code de sortie : 1 pour
 *    des assertions en échec, autre chose pour un plantage.
 *
 * Usage : ADMITTO_ADMIN_EMAIL=… node scripts/verify-all.mjs [url-base]
 */

import { spawn } from "node:child_process";

const BASE = process.argv[2] ?? "http://localhost:3000";

/** Ordre d'exécution : du plus indépendant au plus dépendant de l'état. */
const SUITES = [
  "verify-animations",
  "verify-questionnaire",
  "verify-checkout",
  "verify-dashboard",
  "verify-espace",
  "verify-simulator",
  "verify-backoffice",
  "verify-consultations",
];

/**
 * Une exception non rattrapée fait sortir Node avec le code 1 — exactement
 * celui d'un échec d'assertion. Le code ne suffit donc pas à les distinguer :
 * c'est la ligne de bilan que chaque suite imprime en propre qui tranche.
 */
const ASSERTION_SUMMARY = /point\(s\) en échec\./;
const isAssertionFailure = (output) => ASSERTION_SUMMARY.test(output);

function run(suite) {
  return new Promise((resolve) => {
    const child = spawn("node", [`scripts/${suite}.mjs`, BASE], {
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env,
    });

    let output = "";
    child.stdout.on("data", (chunk) => (output += chunk));
    child.stderr.on("data", (chunk) => (output += chunk));
    child.on("close", (code) => resolve({ code: code ?? -1, output }));
  });
}

const results = [];

for (const suite of SUITES) {
  process.stdout.write(`${suite.padEnd(24)}`);

  let attempt = await run(suite);

  // Une seule reprise, et seulement sur plantage.
  if (attempt.code !== 0 && !isAssertionFailure(attempt.output)) {
    process.stdout.write(`plantage, reprise… `);
    attempt = await run(suite);
  }

  const failures = (attempt.output.match(/^✗ /gm) ?? []).length;
  const checks = (attempt.output.match(/^[✓✗] /gm) ?? []).length;

  if (attempt.code === 0) {
    console.log(`✓ ${checks} points`);
  } else if (isAssertionFailure(attempt.output)) {
    console.log(`✗ ${failures} échec(s) sur ${checks} points`);
  } else {
    console.log(`✗ plantage persistant après reprise (${checks} points atteints)`);
  }

  results.push({ suite, ...attempt, failures, checks });
}

const broken = results.filter((r) => r.code !== 0);

console.log(
  `\n${results.length - broken.length}/${results.length} suites conformes, ` +
    `${results.reduce((n, r) => n + r.checks, 0)} points vérifiés.`
);

if (broken.length) {
  // Le détail n'est imprimé que pour ce qui a échoué : une sortie de 300 lignes
  // vertes noie les quatre lignes qui comptent.
  for (const result of broken) {
    console.error(`\n─── ${result.suite} ───`);
    const lines = result.output.split("\n").filter((l) => /^✗ |échec|Error|error/i.test(l));
    console.error(lines.slice(0, 20).join("\n") || result.output.slice(-1500));
  }
  process.exit(1);
}
