#!/usr/bin/env node
/**
 * Matrice d'accès entre utilisateurs.
 *
 * Les stores filtrent sur l'évaluation et des tests unitaires le prouvent. Ce
 * qu'ils ne prouvent pas, c'est le comportement au niveau HTTP : qu'une
 * personne connectée ne puisse pas atteindre le résultat, le rapport ou les
 * données d'une autre en changeant l'identifiant dans l'URL.
 *
 * Six situations sont couvertes, pour le résultat comme pour le rapport :
 *
 *   diagnostic non revendiqué  × visiteur anonyme  → ouvert (le J+0 part avant
 *                                                     qu'aucun compte n'existe)
 *   diagnostic revendiqué      × son titulaire     → ouvert
 *   diagnostic revendiqué      × visiteur anonyme  → refusé
 *   diagnostic revendiqué      × un autre compte   → refusé
 *
 * Le refus renvoie vers la connexion plutôt qu'un 404 : la personne concernée
 * a une action à portée de main, et l'existence du diagnostic n'est de toute
 * façon pas un secret pour qui détient le lien.
 *
 * Prérequis : serveur lancé AVEC AUTH_SECRET, DATABASE_URL et ADMITTO_MAIL_LOG.
 * Usage : node scripts/verify-acces.mjs [url]
 */

const BASE = (process.argv[2] ?? "http://127.0.0.1:3000").replace(/\/$/, "");
const { verifyEmail } = await import("./lib/identity.mjs");
const ALICE = verifyEmail("alice");
const BOB = verifyEmail("bob");

if (!process.env.AUTH_SECRET) {
  console.error("✗ AUTH_SECRET requis.");
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
const { warmUp } = await import("./lib/wait.mjs");
const { submitDiagnostic } = await import("./lib/questionnaire.mjs");

const failures = [];
const check = (label, ok, detail = "") => {
  console.log(`${ok ? "✓" : "✗"} ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures.push(label);
};

const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
});

/** Réponses communes : un profil banal, l'accès étant le seul sujet ici. */
const LABELS = [
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
];

/** Soumet un diagnostic et rend son identifiant. */
async function submit(page, firstName, email) {
  const { id } = await submitDiagnostic(page, BASE, { labels: LABELS, firstName, email });
  return id;
}

/** Statut et destination d'une navigation, redirections non suivies. */
async function reach(page, path) {
  const response = await page.request.get(`${BASE}${path}`, {
    maxRedirects: 0,
    failOnStatusCode: false,
  });
  return { status: response.status(), location: response.headers()["location"] ?? "" };
}

const anon = await browser.newPage();
const consoleErrors = [];
anon.on("pageerror", (e) => consoleErrors.push(String(e)));

await warmUp(anon, BASE);

// ── Diagnostic non revendiqué : le lien suffit ─────────────────────────────
const orphan = await submit(anon, "Orpheline", verifyEmail("orpheline"));
{
  const { status } = await reach(anon, `/resultat/${orphan}`);
  check("Résultat non revendiqué : ouvert au visiteur", status === 200, String(status));
}
{
  // Le rapport n'est pas encore envoyé : la page annonce l'attente, elle ne
  // refuse pas l'accès. Un 404 ici serait un contresens — le diagnostic existe.
  const { status } = await reach(anon, `/rapport/${orphan}`);
  check("Rapport non revendiqué : page servie", status === 200, String(status));
}

// ── Alice revendique son diagnostic ────────────────────────────────────────
const alicePage = await browser.newPage();
const aliceAssessment = await submit(alicePage, "Alice", ALICE);
check("Connexion d'Alice", await signInByEmail(alicePage, BASE, ALICE));

{
  const { status } = await reach(alicePage, `/resultat/${aliceAssessment}`);
  check("Son propre résultat : ouvert à Alice", status === 200, String(status));
}
{
  const { status } = await reach(alicePage, `/rapport/${aliceAssessment}`);
  check("Son propre rapport : ouvert à Alice", status === 200, String(status));
}

// ── Le même diagnostic, vu par un visiteur anonyme ─────────────────────────
{
  const { status, location } = await reach(anon, `/resultat/${aliceAssessment}`);
  const denied = status >= 300 && status < 400 && /connexion/.test(location);
  check("Résultat revendiqué : refusé au visiteur", denied, `${status} ${location}`);
}
{
  const { status, location } = await reach(anon, `/rapport/${aliceAssessment}`);
  const denied = status >= 300 && status < 400 && /connexion/.test(location);
  check("Rapport revendiqué : refusé au visiteur", denied, `${status} ${location}`);
}

// ── Le même diagnostic, vu par un autre compte ─────────────────────────────
const bobPage = await browser.newPage();
await submit(bobPage, "Bob", BOB);
check("Connexion de Bob", await signInByEmail(bobPage, BASE, BOB));

{
  const { status, location } = await reach(bobPage, `/resultat/${aliceAssessment}`);
  const denied = status >= 300 && status < 400 && /connexion/.test(location);
  check("Résultat d'Alice : refusé à Bob", denied, `${status} ${location}`);
}
{
  const { status, location } = await reach(bobPage, `/rapport/${aliceAssessment}`);
  const denied = status >= 300 && status < 400 && /connexion/.test(location);
  check("Rapport d'Alice : refusé à Bob", denied, `${status} ${location}`);
}

// ── L'espace payant de Bob ne montre que le profil de Bob ──────────────────
await bobPage.goto(`${BASE}/app/dashboard`, { waitUntil: "networkidle" });
const bobBoard = await bobPage.locator("body").innerText();
check("Bob voit son propre tableau de bord", /Bob/.test(bobBoard));
check("Aucune donnée d'Alice dans l'espace de Bob", !/Alice/.test(bobBoard));

// ── L'export ne rend que les données de son titulaire ──────────────────────
{
  const response = await bobPage.request.get(`${BASE}/app/donnees/export`);
  const payload = await response.json();
  check("Export au nom de Bob", payload?.account?.email === BOB, payload?.account?.email ?? "—");
  const ids = (payload?.assessments ?? []).map((a) => a.id);
  check("L'export de Bob ne contient pas le diagnostic d'Alice", !ids.includes(aliceAssessment));
}

// ── Le back-office reste clos pour un compte ordinaire ─────────────────────
{
  const { status } = await reach(bobPage, "/admin");
  check("Back-office invisible à un compte client", status === 404, String(status));
}
{
  const { status } = await reach(bobPage, `/admin/rapports/${aliceAssessment}`);
  check("Rapport en back-office invisible à un client", status === 404, String(status));
}

check("Aucune erreur console", consoleErrors.length === 0, consoleErrors.join(" | "));

await browser.close();

if (failures.length) {
  console.error(`\n${failures.length} point(s) en échec.`);
  process.exit(1);
}
console.log("\n✓ Matrice d'accès : conforme.");
