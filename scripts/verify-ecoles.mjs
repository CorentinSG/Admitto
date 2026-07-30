#!/usr/bin/env node
/**
 * Vérification du sélecteur d'écoles (tâche T-SEL-03).
 *
 * Ce qu'aucun test unitaire ne voit : que les accords de l'université de
 * l'utilisateur sont bien proposés à l'écran, qu'ajouter une école la fait
 * disparaître des propositions, que le doublon est refusé côté serveur, que
 * l'équilibre se recalcule, et que la feuille de route mène désormais à
 * l'outil au lieu de demander le travail sans le proposer.
 *
 * Prérequis : serveur lancé AVEC AUTH_SECRET, DATABASE_URL et ADMITTO_MAIL_LOG.
 * Usage : node scripts/verify-ecoles.mjs [url]
 */

const BASE = (process.argv[2] ?? "http://127.0.0.1:3000").replace(/\/$/, "");
const { verifyEmail } = await import("./lib/identity.mjs");
const EMAIL = verifyEmail("thomas");

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
const { waitFor, waitForText, waitForTextGone, waitForTextChange, warmUp } = await import(
  "./lib/wait.mjs"
);
const { answerScreens } = await import("./lib/questionnaire.mjs");

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

await warmUp(page, BASE);

// ── Fermé par défaut ───────────────────────────────────────────────────────
await page.goto(`${BASE}/app/ecoles`, { waitUntil: "domcontentloaded" });
check("Liste d'écoles fermée sans session", page.url().includes("/connexion"), page.url());

// ── Un diagnostic avec une université couverte par la base d'accords ───────
await page.goto(`${BASE}/diagnostic`, { waitUntil: "networkidle" });
const beforeStart = await page.locator("body").innerText();
await page.getByRole("button", { name: "Commencer" }).click();
await waitForTextChange(page, beforeStart);
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
await page.getByPlaceholder("Prénom").fill("Thomas");
await page.getByPlaceholder("Adresse email").fill(EMAIL);
await page.getByRole("button", { name: "Obtenir mon résultat" }).click();
await page.waitForURL("**/resultat/**", { timeout: 20000 });
check("Connexion par lien email", await signInByEmail(page, BASE, EMAIL));

// ── Liste vide : le produit dit quoi faire, sans rien préremplir ───────────
await page.goto(`${BASE}/app/ecoles`, { waitUntil: "networkidle" });
let text = await page.locator("body").innerText();
check("Page accessible une fois connecté", contains(text, "Votre liste d'écoles"));
check("Liste vide annoncée", contains(text, "Aucune école n'est encore enregistrée"));
check(
  "Le classement est présenté comme celui de l'utilisateur",
  contains(text, "Le classement en ambitieuse, cible ou sûre est le vôtre")
);
check(
  "Aucune appréciation des chances d'admission",
  contains(text, "n'apprécie ni vos chances d'admission")
);

// ── Les accords de l'université sont proposés ──────────────────────────────
const candidateCount = await page.getByRole("button", { name: /^Ajouter — / }).count();
check("Accords de l'université proposés", candidateCount > 0, `${candidateCount} proposition(s)`);

const firstCandidate = await page
  .getByRole("button", { name: /^Ajouter — / })
  .first()
  .getAttribute("aria-label");
const candidateName = firstCandidate.replace(/^Ajouter — /, "");

await page.getByRole("button", { name: firstCandidate }).click();
// Attendre le badge et non le nom de l'école : ce nom figure déjà dans les
// propositions, donc l'attendre rendait un écran d'avant la revalidation et
// l'assertion portait sur l'état précédent.
text = (await waitForText(page, "Issue d'un accord")) ?? "";
check("École ajoutée depuis un accord", contains(text, "Issue d'un accord"));

// Retirée des propositions : la reproposer ferait croire à deux écoles.
check(
  "École ajoutée retirée des propositions",
  Boolean(
    await waitFor(async () => (await page.getByRole("button", { name: firstCandidate }).count()) === 0)
  )
);

// ── Le doublon est refusé côté serveur ─────────────────────────────────────
await page.getByLabel("Nom de l'école").fill(candidateName.toUpperCase());
await page.getByRole("button", { name: "Ajouter à ma liste" }).click();
check(
  "Doublon refusé, casse ignorée",
  Boolean(await waitForText(page, "figure déjà dans votre liste"))
);

// Pas de contrôle navigateur sur une date inexistante : un champ `type=date`
// assainit « 2027-02-31 » en chaîne vide avant même l'envoi, si bien que le
// serveur ne voit jamais le cas. Le refus est prouvé par le test unitaire de
// `decideAdd`, qui s'adresse à la décision elle-même.

// ── Ajout manuel et recalcul de l'équilibre ────────────────────────────────
for (const [name, ambition] of [
  ["Northwestern Pritzker School of Law", "REACH"],
  ["University of Miami School of Law", "SAFETY"],
]) {
  await page.getByLabel("Nom de l'école").fill(name);
  await page.locator("#new-ambition").selectOption(ambition);
  await page.getByRole("button", { name: "Ajouter à ma liste" }).click();
  check(`École ajoutée à la main — ${name}`, Boolean(await waitForText(page, name)));
}

text = await page.locator("body").innerText();
check("Équilibre recalculé", contains(text, "3 école(s) en lice"));
check(
  "Absence de date limite signalée",
  contains(text, "sans date limite") || contains(text, "Aucune date limite")
);

// Une école classée sûre existe : le constat correspondant disparaît.
check(
  "Le constat « aucune école sûre » disparaît quand il cesse d'être vrai",
  !contains(text, "Vous n'avez classé aucune école comme sûre")
);

// ── Modification sur place ────────────────────────────────────────────────
const targetSchool = "Northwestern Pritzker School of Law";
// Le <li> qui porte le nom : viser le premier select de la page prendrait
// celui d'une autre école et le test passerait en vérifiant autre chose.
const targetRow = page.locator("li").filter({ hasText: targetSchool }).first();
await targetRow.locator("select[name='status']").selectOption("SHORTLISTED");
await targetRow.getByRole("button", { name: `Enregistrer — ${targetSchool}` }).click();
check(
  "Avancement enregistré",
  Boolean(await waitForTextGone(page, "la liste est toujours à l'étude"))
);

// ── Retrait ────────────────────────────────────────────────────────────────
const before = await page.getByRole("button", { name: /^Retirer — / }).count();
await page
  .getByRole("button", { name: `Retirer — ${targetSchool}` })
  .first()
  .click();
check(
  "École retirée",
  Boolean(
    await waitFor(async () => (await page.getByRole("button", { name: /^Retirer — / }).count()) < before)
  )
);

// ── La feuille de route mène à l'outil ─────────────────────────────────────
await page.goto(`${BASE}/app/roadmap`, { waitUntil: "networkidle" });
check(
  "La tâche « liste d'écoles » mène à l'outil",
  (await page.locator('a[href="/app/ecoles"]').count()) > 0
);
check(
  "Les tâches documentaires mènent au coffre",
  (await page.locator('a[href="/app/documents"]').count()) > 0
);

check("Aucune erreur console", consoleErrors.length === 0, consoleErrors.join(" | "));

await browser.close();

if (failures.length) {
  console.error(`\n${failures.length} point(s) en échec.`);
  process.exit(1);
}
console.log("\n✓ Sélecteur d'écoles : conforme.");
