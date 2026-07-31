#!/usr/bin/env node
/**
 * Vérification automatisée de la checklist design/animations (PLAN.md §10.1).
 * Pilote un vrai navigateur et contrôle les valeurs mesurées, pas le code source.
 *
 * Prérequis : un serveur lancé (`npm run build && npx next start -p 3000`)
 * et Playwright disponible (`npm i -D playwright`).
 *
 * Usage : node scripts/verify-animations.mjs [url]
 */

const URL = process.argv[2] ?? "http://127.0.0.1:3000/";

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.error("✗ Playwright absent. Installer avec : npm i -D playwright && npx playwright install chromium");
  process.exit(1);
}

const failures = [];
const check = (label, ok, detail = "") => {
  console.log(`${ok ? "✓" : "✗"} ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures.push(label);
};

const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const { warmUp } = await import("./lib/wait.mjs");
// Réchauffage : la première navigation paie sinon le démarrage à froid.
// Les délais fixes qui suivent sont, eux, légitimes : ils attendent la fin
// de transitions CSS dont la durée est précisément ce qui est vérifié.
await warmUp(page, URL, [""]);
const consoleErrors = [];
page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));
page.on("pageerror", (e) => consoleErrors.push(String(e)));

await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForTimeout(1600); // cascade hero : 1,2 s

// 1. Nav transparente en haut de page
const navBefore = await page.$eval("nav", (n) => getComputedStyle(n).backgroundColor);
check("Nav transparente à froid", navBefore === "rgba(0, 0, 0, 0)", navBefore);

// 2. Hero exactement 100vh, indicateur « défiler » au-dessus de la ligne de flottaison
const hero = await page.evaluate(() => {
  const s = document.querySelector("#top");
  return { h: Math.round(s.getBoundingClientRect().height), vh: window.innerHeight };
});
check("Hero à 100vh", hero.h === hero.vh, `${hero.h}px / ${hero.vh}px`);

// 3. Les 4 keyframes officielles sont réellement injectées.
//    Contrôle indispensable : un `animation: shimmer …` inline se lit dans le
//    style calculé même quand la keyframe est absente — seule la présence de la
//    règle @keyframes prouve que l'animation tourne vraiment.
const keyframes = await page.evaluate(() =>
  [...document.styleSheets].flatMap((sheet) => {
    try {
      return [...sheet.cssRules].filter((r) => r.type === CSSRule.KEYFRAMES_RULE).map((r) => r.name);
    } catch {
      return [];
    }
  })
);
for (const name of ["shimmer", "pulse-gold", "fadeInUp", "fadeIn"]) {
  check(`Keyframe @${name} injectée`, keyframes.includes(name));
}

// 4. Shimmer permanent sur le mot doré, effectivement en cours d'exécution
const shimmerRunning = await page.evaluate(() =>
  document.getAnimations().some((a) => a.animationName === "shimmer" && a.playState === "running")
);
check("Shimmer du titre en cours d'exécution", shimmerRunning);

// 5. Défilement fluide activé (ancres de la nav)
const smooth = await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior);
check("scroll-behavior: smooth actif", smooth === "smooth", smooth);

// 6. Nav après 41 px de scroll
await page.evaluate(() => window.scrollTo(0, 120));
await page.waitForTimeout(700);
const navAfter = await page.$eval("nav", (n) => {
  const s = getComputedStyle(n);
  return { bg: s.backgroundColor, blur: s.backdropFilter, border: s.borderBottomWidth };
});
check("Nav opaque + blur 24px après scroll", navAfter.bg === "rgba(10, 22, 40, 0.97)" && navAfter.blur === "blur(24px)", `${navAfter.bg} / ${navAfter.blur}`);
check("Bordure dorée présente après scroll", navAfter.border === "1px", navAfter.border);

// 7. Pastilles de la timeline : onde décalée de 0,4 s, démarrée à la révélation
await page.evaluate(() => document.querySelector("#parcours").scrollIntoView({ block: "start" }));
await page.waitForTimeout(1400);
const delays = await page.$$eval("#parcours span", (els) =>
  els.filter((e) => getComputedStyle(e).animationName === "pulse-gold").map((e) => getComputedStyle(e).animationDelay)
);
check("Pulse-gold en onde (5 pastilles, +0,4 s)", JSON.stringify(delays) === JSON.stringify(["0s", "0.4s", "0.8s", "1.2s", "1.6s"]), delays.join(" / "));

// 8. Aucune animation de sortie : rien ne se re-cache en remontant
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(800);
const stillVisible = await page.$eval("#problematique h2", (h) => getComputedStyle(h).opacity);
check("Rien ne se rejoue / ne se re-cache en remontant", stillVisible === "1", `opacity ${stillVisible}`);

// 9. prefers-reduced-motion : transitions neutralisées
const reduced = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
await reduced.goto(URL, { waitUntil: "networkidle" });
await reduced.waitForTimeout(400);
const duration = await reduced.$eval("#top h1", (h) => getComputedStyle(h).transitionDuration);
// Le navigateur sérialise 0,01 ms en « 1e-05s » : comparer des durées, pas des chaînes.
const longest = Math.max(...duration.split(",").map((d) => parseFloat(d)));
check("prefers-reduced-motion neutralise les transitions", longest <= 0.001, duration);

// 10. Pas de débordement horizontal sur mobile
const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mobile.goto(URL, { waitUntil: "networkidle" });
await mobile.waitForTimeout(600);
const overflow = await mobile.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
check("Aucun débordement horizontal à 390 px", !overflow);

// 11. Console propre
check("Aucune erreur console", consoleErrors.length === 0, consoleErrors.join(" | "));

/*
 * 12. Budget de JavaScript de la page d'accueil (lot E).
 *
 * Mesure ce qui est réellement TÉLÉCHARGÉ — corps compressés, tels que les
 * reçoit un navigateur — et non les tailles annoncées par le build, qui sont
 * décompressées et ne disent pas ce que paie l'utilisateur.
 *
 * Ce qu'un budget attrape et qu'aucune relecture ne voit : un import qui
 * traverse la frontière serveur/client. Sur `/admin/rapports/[id]`, importer
 * une constante de trois chaînes depuis le module du store y amenait le client
 * Prisma — 18,9 Ko pour trois boutons. Rien dans le diff ne le montrait.
 *
 * Contexte neuf, sans cache : une seconde visite ne télécharge rien et
 * mesurerait zéro.
 */
const budgetContext = await browser.newContext();
const budgetPage = await budgetContext.newPage();
const budgetResponses = [];
budgetPage.on("response", (response) => {
  // Pas de `new URL(...)` ici : `URL` est déjà, dans ce script, l'adresse
  // testée passée en argument. Le motif ignore donc la chaîne de requête
  // à la main.
  if (/\.js(\?|#|$)/.test(response.url().split(/[?#]/)[0])) budgetResponses.push(response);
});
await budgetPage.goto(URL, { waitUntil: "networkidle" });

/*
 * `sizes().responseBodySize` : les octets réellement passés sur le fil.
 *
 * Une première version lisait l'en-tête `content-length` quand il existait et
 * la longueur du corps sinon — donc la taille COMPRESSÉE pour les unes et
 * DÉCOMPRESSÉE pour les autres, dans la même somme. Le même chargement
 * mesurait 21 Ko ou 174 Ko selon les réponses reçues. Un budget calculé sur
 * une unité instable n'aurait rien protégé du tout.
 */
let jsBytes = 0;
for (const response of budgetResponses) {
  try {
    jsBytes += (await response.request().sizes()).responseBodySize;
  } catch {
    // Requête déjà libérée : mieux vaut une ressource non comptée qu'une suite
    // qui tombe sur sa propre mesure.
  }
}
await budgetContext.close();

/*
 * 117 Ko mesurés au moment d'écrire ce budget, socle commun compris.
 *
 * Ce plafond-ci est nécessairement large : le socle partagé domine, et une
 * régression de quinze kilo-octets s'y perdrait. Il attrape les accidents
 * francs — une dépendance entière tirée dans le navigateur. Le contrôle fin,
 * route par route et hors socle, est celui de `check:bundle`.
 */
const BUDGET_KO = 140;
check(
  `JavaScript de l'accueil sous ${BUDGET_KO} Ko`,
  jsBytes / 1024 < BUDGET_KO,
  `${(jsBytes / 1024).toFixed(1)} Ko`
);

await browser.close();

if (failures.length) {
  console.error(`\n${failures.length} point(s) de la checklist en échec.`);
  process.exit(1);
}
console.log("\n✓ Checklist design/animations : conforme.");
