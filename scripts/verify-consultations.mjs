#!/usr/bin/env node
/**
 * Vérification des consultations (CDC §30 et §31).
 *
 * Contrôle ce qu'aucun test unitaire ne voit : que le solde est affiché avant
 * toute réservation, qu'une offre sans séance le dit au lieu de laisser un
 * bouton actif, que le périmètre exclu est visible à l'écran, et que le
 * parcours ouverture de créneau → réservation → annulation fonctionne.
 *
 * Prérequis : serveur lancé AVEC ADMITTO_SESSION_SECRET et ADMITTO_ADMIN_TOKEN.
 * Usage : ADMITTO_SESSION_SECRET=… ADMITTO_ADMIN_TOKEN=… node scripts/verify-consultations.mjs [url]
 */

const BASE = (process.argv[2] ?? "http://127.0.0.1:3000").replace(/\/$/, "");
const ADMIN_TOKEN = process.env.ADMITTO_ADMIN_TOKEN;

if (!process.env.ADMITTO_SESSION_SECRET || !ADMIN_TOKEN) {
  console.error("✗ ADMITTO_SESSION_SECRET et ADMITTO_ADMIN_TOKEN requis.");
  process.exit(1);
}

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
const contains = (haystack, needle) => haystack.toLowerCase().includes(needle.toLowerCase());

const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
const consoleErrors = [];
page.on("pageerror", (e) => consoleErrors.push(String(e)));
page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));

// ── Fermé par défaut ───────────────────────────────────────────────────────
await page.goto(`${BASE}/app/consultations`, { waitUntil: "domcontentloaded" });
check("Consultations fermées sans accès", page.url().includes("/diagnostic"), page.url());

// ── Ouverture d'un accès ───────────────────────────────────────────────────
await page.goto(`${BASE}/diagnostic`, { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Commencer" }).click();
await page.waitForTimeout(300);
for (const label of [
  "Je prépare mes candidatures",
  "Master 2",
  "Université Paris 1 Panthéon-Sorbonne",
  "Grand cabinet international",
  "Garder les deux options ouvertes",
  "60 000 à 100 000 $",
  "Les deux",
  "L'an prochain",
  "Test déjà passé",
  "Français, sans statut américain",
]) {
  await page.getByRole("button", { name: label, exact: true }).click();
  await page.waitForTimeout(220);
}
await page.getByPlaceholder("Prénom").fill("Sacha");
await page.getByPlaceholder("Adresse email").fill("sacha@example.com");
await page.getByRole("button", { name: "Obtenir mon résultat" }).click();
await page.waitForURL("**/resultat/**", { timeout: 20000 });
const assessmentId = page.url().split("/resultat/")[1].split(/[?#]/)[0];
await page.getByRole("button", { name: "Accéder à ma feuille de route" }).click();
await page.waitForURL("**/app/dashboard", { timeout: 20000 });

// ── Sans droit : le solde est affiché, la réservation est impossible ───────
await page.goto(`${BASE}/app/consultations`, { waitUntil: "networkidle" });
let text = await page.locator("body").innerText();

check("Solde affiché avant toute réservation", contains(text, "Séances restantes"));
check("Solde nul annoncé", contains(text, "0 sur 0"));
check("Absence de séance expliquée", contains(text, "Aucune séance dans votre offre"));
check("Aucun accès ouvert promis", contains(text, "nombre illimité"));
check("Aucun bouton de réservation actif", (await page.getByRole("button", { name: "Réserver" }).count()) === 0);

// Le périmètre exclu est visible, pas seulement les inclusions.
check("Périmètre exclu affiché", contains(text, "Cette séance ne couvre pas"));
check(
  "Aucune conclusion promise sur l'accès à l'examen",
  contains(text, "relève de l'autorité compétente")
);

// ── Back-office : ouverture d'un créneau et attribution ────────────────────
await page.goto(`${BASE}/admin?token=${ADMIN_TOKEN}`, { waitUntil: "networkidle" });
await page.goto(`${BASE}/admin/consultations`, { waitUntil: "networkidle" });
check("Back-office consultations accessible", contains(await page.locator("body").innerText(), "Créneaux ouverts"));

// Créneau dans huit jours, bien au-delà du délai de prévenance.
const slotDate = new Date(Date.now() + 8 * 86_400_000);
const local = new Date(slotDate.getTime() - slotDate.getTimezoneOffset() * 60_000)
  .toISOString()
  .slice(0, 16);
await page.getByLabel("Début du créneau").fill(local);
await page.getByRole("button", { name: "Ouvrir le créneau" }).click();
await page.waitForTimeout(1200);
check("Créneau ouvert", contains(await page.locator("body").innerText(), "Libre"));

// Un créneau dans le passé est refusé.
await page.getByLabel("Début du créneau").fill("2020-01-01T10:00");
await page.getByRole("button", { name: "Ouvrir le créneau" }).click();
await page.waitForTimeout(1000);
check(
  "Créneau passé refusé",
  /ne s'ouvre pas dans le passé/i.test(await page.locator("body").innerText())
);

// Attribution de séances à cet utilisateur.
await page.getByLabel(`Offre — ${assessmentId}`).selectOption("GUIDED");
await page.getByLabel(`Séances accordées — ${assessmentId}`).fill("0");
await page.getByRole("button", { name: "Accorder" }).first().click();
await page.waitForTimeout(1200);
check("Offre attribuée", contains(await page.locator("body").innerText(), "restante(s) sur 3"));

// Un nombre hors bornes est refusé plutôt que tronqué.
await page.getByLabel(`Séances accordées — ${assessmentId}`).fill("999");
await page.getByRole("button", { name: "Accorder" }).first().click();
await page.waitForTimeout(1000);
check(
  "Attribution hors bornes refusée",
  /entre 0 et 20/i.test(await page.locator("body").innerText())
);

// ── Réservation ────────────────────────────────────────────────────────────
await page.goto(`${BASE}/app/consultations`, { waitUntil: "networkidle" });
text = await page.locator("body").innerText();
check("Solde mis à jour", contains(text, "3 sur 3"));

await page.getByLabel("Choisir un créneau — ORIENTATION").selectOption({ index: 1 });
await page.getByRole("button", { name: "Réserver" }).first().click();
await page.waitForTimeout(1500);
text = await page.locator("body").innerText();
check("Séance réservée", contains(text, "Vos séances à venir"));
check("Solde décrémenté", contains(text, "2 sur 3"));

// Le créneau réservé n'est plus proposé.
const remaining = await page.getByLabel("Choisir un créneau — SCHOOL_LIST_REVIEW").count();
if (remaining > 0) {
  const options = await page.getByLabel("Choisir un créneau — SCHOOL_LIST_REVIEW").locator("option").count();
  check("Créneau réservé retiré des propositions", options === 1, `${options} option(s)`);
}

// ── Annulation ─────────────────────────────────────────────────────────────
await page.getByRole("button", { name: "Annuler" }).first().click();
await page.waitForTimeout(1500);
text = await page.locator("body").innerText();
check("Séance annulable", contains(text, "3 sur 3"));

check("Aucune erreur console", consoleErrors.length === 0, consoleErrors.join(" | "));

await browser.close();

if (failures.length) {
  console.error(`\n${failures.length} point(s) en échec.`);
  process.exit(1);
}
console.log("\n✓ Consultations : conformes.");
