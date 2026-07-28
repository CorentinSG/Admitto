#!/usr/bin/env node
/**
 * Vérification du tunnel de paiement et du consentement (CDC §16.2, §34).
 *
 * Contrôle que les six mentions obligatoires du tunnel sont affichées avant le
 * bouton de paiement, que la case de consentement marketing existe et n'est pas
 * pré-cochée, et que le webhook Stripe refuse une requête non signée.
 *
 * Prérequis : serveur lancé + Playwright.
 * Usage : node scripts/verify-checkout.mjs [url-base]
 */

const BASE = (process.argv[2] ?? "http://127.0.0.1:3000").replace(/\/$/, "");

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.error("✗ Playwright absent. npm i -D playwright && npx playwright install chromium");
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
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const consoleErrors = [];
page.on("pageerror", (e) => consoleErrors.push(String(e)));
page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));

// ── Consentement marketing sur l'écran de contact ──────────────────────────
await page.goto(`${BASE}/diagnostic`, { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Commencer" }).click();
await page.waitForTimeout(300);
for (const label of [
  "J'explore l'idée d'un LL.M.",
  "Master 2",
  "Université de Bordeaux",
  "Arbitrage international",
  "Garder les deux options ouvertes",
  "60 000 à 100 000 $",
  "Les deux",
  "Dans deux ans",
  "Test déjà passé",
  "Français, sans statut américain",
]) {
  await page.getByRole("button", { name: label, exact: true }).click();
  await page.waitForTimeout(220);
}

const consent = page.locator('input[type="checkbox"]');
check("Case de consentement marketing présente", (await consent.count()) === 1);
check("Consentement NON pré-coché (CDC §34)", !(await consent.first().isChecked()));

const contactText = await page.locator("body").innerText();
check(
  "Distinction entre emails de service et emails promotionnels",
  /indépendamment de ce choix/i.test(contactText)
);

await page.getByPlaceholder("Prénom").fill("Alex");
await page.getByPlaceholder("Adresse email").fill("alex@example.com");
await page.getByRole("button", { name: "Obtenir mon résultat" }).click();
await page.waitForURL("**/resultat/**", { timeout: 20000 });
const assessmentId = page.url().split("/resultat/")[1].split("?")[0];

// ── Tunnel de paiement ─────────────────────────────────────────────────────
await page.goto(`${BASE}/diagnostic/paiement/${assessmentId}`, { waitUntil: "networkidle" });
const checkoutText = (await page.locator("body").innerText()).toLowerCase();
const has = (needle) => checkoutText.includes(needle.toLowerCase());

for (const [label, needle] of [
  ["Contenu du rapport", "ce que contient le rapport"],
  ["Délai", "délai"],
  ["Nature éducative et stratégique", "produit éducatif et stratégique"],
  ["Absence de conseil juridique", "ne constitue pas un conseil juridique"],
  ["Mécanisme de déduction", "déduit de l'offre"],
  ["Droit de rétractation", "rétractation"],
  ["Politique de remboursement", "remboursement"],
]) {
  check(`Mention obligatoire — ${label}`, has(needle));
}

check("Fenêtre de déduction de trente jours annoncée", has("trente jours"));
check("Aucune promesse de résultat", !/garanti/i.test(checkoutText));

// ── Webhook Stripe ─────────────────────────────────────────────────────────
const unsigned = await page.request.post(`${BASE}/api/stripe/webhook`, {
  data: { type: "checkout.session.completed", data: { object: { metadata: { assessmentId } } } },
});
check(
  "Webhook refuse une requête non signée",
  unsigned.status() === 400 || unsigned.status() === 503,
  `HTTP ${unsigned.status()}`
);

check("Aucune erreur console", consoleErrors.length === 0, consoleErrors.join(" | "));

await browser.close();

if (failures.length) {
  console.error(`\n${failures.length} point(s) en échec.`);
  process.exit(1);
}
console.log("\n✓ Tunnel de paiement et consentement : conformes.");
