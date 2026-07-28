#!/usr/bin/env node
/**
 * Vérification de l'espace payant (CDC §21 à §24).
 * Contrôle la fermeture par défaut, la reprise du profil sans ressaisie, la
 * présence du Next Best Action avec ses cinq composantes, la feuille de route
 * et l'absence de gamification interdite.
 *
 * Prérequis : serveur lancé AVEC ADMITTO_SESSION_SECRET, et Playwright.
 * Usage : ADMITTO_SESSION_SECRET=… node scripts/verify-dashboard.mjs [url-base]
 */

const BASE = (process.argv[2] ?? "http://127.0.0.1:3000").replace(/\/$/, "");

if (!process.env.ADMITTO_SESSION_SECRET) {
  console.error("✗ ADMITTO_SESSION_SECRET absent : l'espace payant est fermé par défaut.");
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

const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const consoleErrors = [];
page.on("pageerror", (e) => consoleErrors.push(String(e)));
page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));

// ── Fermé par défaut ───────────────────────────────────────────────────────
await page.goto(`${BASE}/app/dashboard`, { waitUntil: "domcontentloaded" });
check("Espace payant fermé sans accès", page.url().includes("/diagnostic"), page.url());

// ── Un diagnostic est soumis ───────────────────────────────────────────────
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
await page.getByPlaceholder("Prénom").fill("Jules");
await page.getByPlaceholder("Adresse email").fill("jules@example.com");
await page.getByRole("button", { name: "Obtenir mon résultat" }).click();
await page.waitForURL("**/resultat/**", { timeout: 20000 });

// ── Ouverture de l'accès depuis le résultat ────────────────────────────────
await page.getByRole("button", { name: "Accéder à ma feuille de route" }).click();
await page.waitForURL("**/app/dashboard", { timeout: 20000 });
check("Accès ouvert depuis le résultat", page.url().endsWith("/app/dashboard"));

const board = await page.locator("body").innerText();
const has = (needle) => board.toLowerCase().includes(needle.toLowerCase());

// Reprise du profil sans ressaisie (CDC §10).
check("Profil repris sans ressaisie", has("Jules"));
check("Phase actuelle affichée", has("Phase actuelle"));

// Next Best Action et ses cinq composantes (CDC §23).
check("Prochaine action affichée", has("Prochaine action"));
for (const [label, needle] of [
  ["la raison", "pourquoi maintenant"],
  ["le temps nécessaire", "temps nécessaire"],
  ["la date", "à faire avant le"],
  ["le risque du retard", "risque en cas de retard"],
]) {
  check(`Next Best Action — ${label}`, has(needle));
}

// Progression, tâches, étapes clés, documents (CDC §21).
for (const section of ["Progression", "Vos tâches du moment", "Étapes clés", "Vos documents"]) {
  check(`Bloc « ${section} » présent`, has(section));
}

// Gamification limitée (CDC §24) : rien qui ressemble à un jeu.
const interdits = ["points d'expérience", "niveau ", "série ", "classement", "badge"];
check(
  "Aucune gamification interdite",
  !interdits.some((mot) => board.toLowerCase().includes(mot)),
  interdits.filter((m) => board.toLowerCase().includes(m)).join(", ")
);

// La progression ne démarre pas gonflée : rien n'est coché à la place de l'utilisateur.
check("Progression initiale à zéro", /\b0\s*%/.test(board), board.match(/\d+\s*%/)?.[0] ?? "?");

// ── Changement de statut ───────────────────────────────────────────────────
const done = page.getByRole("button", { name: "Complété" }).first();
await done.click();
await page.waitForTimeout(1500);
const after = await page.locator("body").innerText();
check("Statut modifiable et progression recalculée", !/\b0\s*%/.test(after), after.match(/\d+\s*%/)?.[0] ?? "?");

// ── Feuille de route ───────────────────────────────────────────────────────
await page.goto(`${BASE}/app/roadmap`, { waitUntil: "networkidle" });
const roadmap = (await page.locator("body").innerText()).toLowerCase();
check("Feuille de route affichée par phases", roadmap.includes("candidatures"));
check(
  "Tâches hors parcours signalées plutôt que masquées",
  roadmap.includes("sans objet pour votre parcours")
);
check("Aucune éligibilité affirmée", !/vous êtes éligible/i.test(roadmap));

check("Aucune erreur console", consoleErrors.length === 0, consoleErrors.join(" | "));

await browser.close();

if (failures.length) {
  console.error(`\n${failures.length} point(s) en échec.`);
  process.exit(1);
}
console.log("\n✓ Espace payant : conforme.");
