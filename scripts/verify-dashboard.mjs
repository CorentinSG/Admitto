#!/usr/bin/env node
/**
 * Vérification de l'espace payant (CDC §21 à §24).
 * Contrôle la fermeture par défaut, la reprise du profil sans ressaisie, la
 * présence du Next Best Action avec ses cinq composantes, la feuille de route
 * et l'absence de gamification interdite.
 *
 * Prérequis : serveur lancé AVEC AUTH_SECRET, et Playwright.
 * Usage : AUTH_SECRET=… node scripts/verify-dashboard.mjs [url-base]
 */

const BASE = (process.argv[2] ?? "http://127.0.0.1:3000").replace(/\/$/, "");
const { verifyEmail } = await import("./lib/identity.mjs");
const EMAIL = verifyEmail("jules");

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
const { waitFor, waitForTextChange, warmUp } = await import("./lib/wait.mjs");
const { answerScreens } = await import("./lib/questionnaire.mjs");

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

// Réchauffage : la première navigation d'une suite paie sinon le démarrage
// à froid (compilation, client Prisma, Auth.js) et c'est elle qui expire.
await warmUp(page, BASE);

// ── Fermé par défaut ───────────────────────────────────────────────────────
await page.goto(`${BASE}/app/dashboard`, { waitUntil: "domcontentloaded" });
check("Espace payant fermé sans compte", page.url().includes("/connexion"), page.url());

// ── Un diagnostic est soumis ───────────────────────────────────────────────
await page.goto(`${BASE}/diagnostic`, { waitUntil: "networkidle" });
const beforeStart = await page.locator("body").innerText();
await page.getByRole("button", { name: "Commencer" }).click();
await waitForTextChange(page, beforeStart);
// Chaque écran attend le changement réel plutôt qu'un délai deviné.
await answerScreens(page, [
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
]);
await page.getByPlaceholder("Prénom").fill("Jules");
await page.getByPlaceholder("Adresse email").fill(EMAIL);
await page.getByRole("button", { name: "Obtenir mon résultat" }).click();
await page.waitForURL("**/resultat/**", { timeout: 20000 });

// ── Ouverture de l'accès depuis le résultat ────────────────────────────────
const connected = await signInByEmail(page, BASE, EMAIL);
check("Connexion par lien email", connected);
await page.goto(`${BASE}/app/dashboard`, { waitUntil: "networkidle" });
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
// La progression est recalculée côté serveur : on attend qu'elle quitte 0 %.
const after = (await waitFor(async () => {
  const text = await page.locator("body").innerText();
  return /\b0\s*%/.test(text) ? null : text;
})) ?? (await page.locator("body").innerText());
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
