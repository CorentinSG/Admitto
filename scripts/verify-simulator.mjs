#!/usr/bin/env node
/**
 * Vérification du simulateur de coût (CDC §26).
 * Contrôle les six sorties, la présence des dix-sept postes, la réaction du
 * calcul à la saisie, la limite de trois scénarios comparés et l'absence de
 * toute promesse de rentabilité.
 *
 * Prérequis : serveur lancé AVEC AUTH_SECRET, et Playwright.
 * Usage : AUTH_SECRET=… node scripts/verify-simulator.mjs [url-base]
 */

const BASE = (process.argv[2] ?? "http://127.0.0.1:3000").replace(/\/$/, "");
// Adresse propre à cette vérification : deux suites qui partagent une adresse
// partagent un compte, donc un diagnostic — et se gênent en série.
const { verifyEmail } = await import("./lib/identity.mjs");
const EMAIL = verifyEmail("simulateur");

if (!process.env.AUTH_SECRET) {
  console.error("✗ AUTH_SECRET absent : les comptes sont désactivés.");
  process.exit(1);
}

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.error("✗ Playwright absent. npm i -D playwright && npx playwright install chromium");
  process.exit(1);
}

const { signInByEmail } = await import("./lib/sign-in.mjs");
const { waitFor, waitForText, waitForTextChange, warmUp } = await import("./lib/wait.mjs");
const { answerScreens } = await import("./lib/questionnaire.mjs");

const failures = [];
const check = (label, ok, detail = "") => {
  console.log(`${ok ? "✓" : "✗"} ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures.push(label);
};

const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
const consoleErrors = [];
page.on("pageerror", (e) => consoleErrors.push(String(e)));
page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));

// Réchauffage : la première navigation d'une suite paie sinon le démarrage
// à froid (compilation, client Prisma, Auth.js) et c'est elle qui expire.
await warmUp(page, BASE);

// ── Accès ──────────────────────────────────────────────────────────────────
await page.goto(`${BASE}/app/simulateur`, { waitUntil: "domcontentloaded" });
check("Simulateur fermé sans compte", page.url().includes("/connexion"), page.url());

await page.goto(`${BASE}/diagnostic`, { waitUntil: "networkidle" });
const beforeStart = await page.locator("body").innerText();
await page.getByRole("button", { name: "Commencer" }).click();
await waitForTextChange(page, beforeStart);
// Chaque écran attend le changement réel plutôt qu'un délai deviné.
await answerScreens(page, [
  "Je prépare mes candidatures",
  "Master 2",
  "Université de Bordeaux",
  "Arbitrage international",
  "Garder les deux options ouvertes",
  "60 000 à 100 000 $",
  "Les deux",
  "L'an prochain",
  "Test déjà passé",
  "Français, sans statut américain",
]);
await page.getByPlaceholder("Prénom").fill("Sacha");
await page.getByPlaceholder("Adresse email").fill(EMAIL);
await page.getByRole("button", { name: "Obtenir mon résultat" }).click();
await page.waitForURL("**/resultat/**", { timeout: 20000 });
const connected = await signInByEmail(page, BASE, EMAIL);
check("Connexion par lien email", connected);
await page.goto(`${BASE}/app/dashboard`, { waitUntil: "networkidle" });

await page.goto(`${BASE}/app/simulateur`, { waitUntil: "networkidle" });
const body = await page.locator("body").innerText();
const has = (needle) => body.toLowerCase().includes(needle.toLowerCase());

// ── Les six sorties du CDC §26 ─────────────────────────────────────────────
for (const sortie of [
  "Coût académique",
  "Coût de la vie",
  "Coût du barreau",
  "Coût post-graduation",
  "Coût total",
  "Coût net",
]) {
  check(`Sortie « ${sortie} » affichée`, has(sortie));
}

// ── Les dix-sept postes de saisie ──────────────────────────────────────────
const champs = await page.locator('input[type="number"]').count();
check("Dix-sept postes de saisie au moins", champs >= 17, `${champs} champs`);
check("Sélecteur de ville présent", (await page.locator("select").count()) === 1);

// ── Le calcul réagit à la saisie ───────────────────────────────────────────
const readNet = async () => {
  const texte = await page.locator("body").innerText();
  const bloc = texte.split(/Coût net/i)[1] ?? "";
  return bloc.match(/[\d\s  ]+\$/)?.[0]?.replace(/\D/g, "") ?? null;
};
const avant = await readNet();
const tuition = page.locator('input[type="number"]').first();
await tuition.fill("100000");
// Le recalcul est local mais passe par un rendu React : on attend que la
// valeur ait effectivement bougé.
const apres = (await waitFor(async () => {
  const value = await readNet();
  return value !== avant ? value : null;
})) ?? (await readNet());
check("Le coût net réagit à la saisie", avant !== apres, `${avant} → ${apres}`);

// Les bourses abaissent le net sans changer le total.
const readTotal = async () => {
  const texte = await page.locator("body").innerText();
  const bloc = texte.split(/Coût total/i)[1] ?? "";
  return bloc.match(/[\d\s  ]+\$/)?.[0]?.replace(/\D/g, "") ?? null;
};
const totalAvant = await readTotal();
const bourses = page.getByLabel(/Bourses/i);
await bourses.fill("20000");
// Le total ne doit PAS bouger : on attend que le net, lui, ait changé, faute
// de quoi l'assertion vérifierait un écran pas encore recalculé.
await waitFor(async () => (await readNet()) !== apres);
check("Les bourses n'abaissent que le coût net", (await readTotal()) === totalAvant);

// ── Comparaison, limitée à trois ───────────────────────────────────────────
for (let i = 1; i <= 3; i++) {
  await page.getByLabel(/Nom du scénario/i).fill(`Scénario ${i}`);
  await page.getByRole("button", { name: "Enregistrer ce scénario" }).click();
  await waitForText(page, `${i} / 3`);
}
const compare = await page.locator("body").innerText();
check("Trois scénarios comparés", /3\s*\/\s*3/.test(compare), compare.match(/\d\s*\/\s*3/)?.[0] ?? "?");

await page.getByLabel(/Nom du scénario/i).fill("Scénario 4");
await page.getByRole("button", { name: "Enregistrer ce scénario" }).click();
await waitForText(page, "trois scénarios au maximum");
check(
  "Le quatrième scénario est refusé avec une explication",
  (await page.locator("body").innerText()).includes("trois scénarios au maximum".toLowerCase()) ||
    /Trois scénarios au maximum/i.test(await page.locator("body").innerText())
);

// ── Aucune promesse de rentabilité ─────────────────────────────────────────
const final = (await page.locator("body").innerText()).toLowerCase();
check("Aucun retour sur investissement promis", !/rentabilit[ée] (assur|garant)/.test(final));
check("Mention explicite de l'absence de ROI", final.includes("ne prédit aucun revenu"));
check("Valeurs annoncées comme ordres de grandeur", final.includes("ordres de grandeur"));

check("Aucune erreur console", consoleErrors.length === 0, consoleErrors.join(" | "));

await browser.close();

if (failures.length) {
  console.error(`\n${failures.length} point(s) en échec.`);
  process.exit(1);
}
console.log("\n✓ Simulateur de coût : conforme.");
