#!/usr/bin/env node
/**
 * Vérification SEO des pages publiques (lot E).
 *
 * Fait tourner l'audit SEO de Lighthouse — le vrai, pas une liste de contrôles
 * réécrite à la main — sur chaque page destinée à être indexée.
 *
 * Le serveur sous test doit se déclarer PUBLIC, c'est-à-dire porter un
 * `ADMITTO_BASE_URL` non local. Sans cela `robots.txt` interdit toute
 * exploration, et c'est le comportement voulu : mais Lighthouse le constate et
 * fait chuter la note. Un audit lancé contre une prévisualisation mesurerait
 * donc la fermeture volontaire du site, pas la qualité de ses pages.
 *
 * Prérequis : serveur lancé avec ADMITTO_BASE_URL public + Playwright.
 * Usage : ADMITTO_BASE_URL=https://… node scripts/verify-seo.mjs [url-base]
 */

const BASE = (process.argv[2] ?? "http://127.0.0.1:3000").replace(/\/$/, "");
const SEUIL = 95;

let chromium;
let lighthouse;
try {
  ({ chromium } = await import("playwright"));
  ({ default: lighthouse } = await import("lighthouse"));
} catch {
  console.error("✗ Playwright ou Lighthouse absent. npm i -D playwright lighthouse");
  process.exit(1);
}

/*
 * Liste des pages auditées.
 *
 * Répétée ici plutôt qu'importée : ce script est en JavaScript, et charger
 * `content/pages.ts` ne marche qu'au prix d'un avertissement de Node à chaque
 * exécution. La parité avec `INDEXABLE_PATHS` est tenue par un test
 * (`lib/seo/site.test.ts`), qui LIT ce fichier — même motif que
 * `check:vocabulary` et son miroir d'exécution. Une page indexable oubliée ici
 * n'aurait jamais de note, et rien ne le dirait.
 */
const PAGES = [
  "/",
  "/offres",
  "/faq",
  "/a-propos",
  "/mentions-legales",
  "/confidentialite",
  "/conditions-generales",
];

const failures = [];
const check = (label, ok, detail = "") => {
  console.log(`${ok ? "✓" : "✗"} ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures.push(label);
};

// Vérifier d'abord que le serveur se déclare public : sinon chaque page
// échouera sur « is-crawlable » et le rapport dirait la même chose sept fois.
const robots = await fetch(`${BASE}/robots.txt`).then((r) => r.text());
if (/Disallow: \/\s*$/m.test(robots) && !/Allow: \//.test(robots)) {
  console.error(
    "✗ Le serveur ne se déclare pas public (robots.txt interdit tout).\n" +
      "  Relancer le serveur avec ADMITTO_BASE_URL=https://un-domaine.exemple"
  );
  process.exit(1);
}

const PORT = 9222;
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
  args: [`--remote-debugging-port=${PORT}`],
});

for (const path of PAGES) {
  const url = `${BASE}${path === "/" ? "" : path}`;
  const run = await lighthouse(url, {
    port: PORT,
    output: "json",
    onlyCategories: ["seo"],
    logLevel: "silent",
    // Bureau plutôt que mobile simulé : on mesure le SEO, pas la performance,
    // et l'émulation mobile n'ajoute ici qu'une minute par page.
    formFactor: "desktop",
    screenEmulation: { disabled: true },
  });

  const score = Math.round((run.lhr.categories.seo.score ?? 0) * 100);
  const rates = Object.values(run.lhr.audits).filter(
    (audit) => audit.score !== null && audit.score < 1 && audit.scoreDisplayMode !== "informative"
  );

  check(
    `SEO ${path} ≥ ${SEUIL}`,
    score >= SEUIL,
    `${score}/100${rates.length ? " — " + rates.map((a) => a.id).join(", ") : ""}`
  );
}

await browser.close();

if (failures.length) {
  console.error(`\n${failures.length} point(s) en échec.`);
  process.exit(1);
}
console.log(`\n✓ SEO : les ${PAGES.length} pages publiques sont à ${SEUIL}/100 ou plus.`);
