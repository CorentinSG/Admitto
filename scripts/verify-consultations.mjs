#!/usr/bin/env node
/**
 * Vérification des consultations (CDC §30 et §31).
 *
 * Contrôle ce qu'aucun test unitaire ne voit : que le solde est affiché avant
 * toute réservation, qu'une offre sans séance le dit au lieu de laisser un
 * bouton actif, que le périmètre exclu est visible à l'écran, et que le
 * parcours ouverture de créneau → réservation → annulation fonctionne.
 *
 * Prérequis : serveur lancé AVEC AUTH_SECRET, DATABASE_URL et ADMITTO_MAIL_LOG,
 * ADMITTO_ADMIN_EMAIL figurant dans ADMITTO_ADMIN_EMAILS. Playwright requis.
 * Usage : ADMITTO_ADMIN_EMAIL=… node scripts/verify-consultations.mjs [url]
 */

const BASE = (process.argv[2] ?? "http://127.0.0.1:3000").replace(/\/$/, "");
const { verifyEmail } = await import("./lib/identity.mjs");
const EMAIL = verifyEmail("sacha");
const ADMIN_EMAIL = process.env.ADMITTO_ADMIN_EMAIL;

if (!process.env.AUTH_SECRET || !ADMIN_EMAIL) {
  console.error("✗ AUTH_SECRET et ADMITTO_ADMIN_EMAIL requis.");
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
const contains = (haystack, needle) => haystack.toLowerCase().includes(needle.toLowerCase());

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

// ── Fermé par défaut ───────────────────────────────────────────────────────
await page.goto(`${BASE}/app/consultations`, { waitUntil: "domcontentloaded" });
check("Consultations fermées sans accès", page.url().includes("/connexion"), page.url());

// ── Ouverture d'un accès ───────────────────────────────────────────────────
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
await page.getByPlaceholder("Prénom").fill("Sacha");
await page.getByPlaceholder("Adresse email").fill(EMAIL);
await page.getByRole("button", { name: "Obtenir mon résultat" }).click();
await page.waitForURL("**/resultat/**", { timeout: 20000 });
const assessmentId = page.url().split("/resultat/")[1].split(/[?#]/)[0];
const connected = await signInByEmail(page, BASE, EMAIL);
check("Connexion par lien email", connected);
await page.goto(`${BASE}/app/dashboard`, { waitUntil: "networkidle" });

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
// L'administration se fait dans un contexte distinct : mélanger les deux
// sessions masquerait une confusion de rôles.
const adminPage = await browser.newPage();
check("Connexion administrateur", await signInByEmail(adminPage, BASE, ADMIN_EMAIL));
await adminPage.goto(`${BASE}/admin/consultations`, { waitUntil: "networkidle" });
check("Back-office consultations accessible", contains(await adminPage.locator("body").innerText(), "Créneaux ouverts"));

// Créneau dans huit jours, bien au-delà du délai de prévenance.
const slotDate = new Date(Date.now() + 8 * 86_400_000);
const local = new Date(slotDate.getTime() - slotDate.getTimezoneOffset() * 60_000)
  .toISOString()
  .slice(0, 16);
// Comptés avant : les créneaux s'accumulent en base d'une exécution à l'autre,
// donc « Libre » est déjà présent et attendre ce texte n'attendrait rien. Seule
// l'augmentation du nombre prouve que le créneau a été créé — et attendre cette
// confirmation avant de saisir la suite évite de remplir le formulaire pendant
// que le serveur le régénère.
const openBefore = await adminPage.locator("li:has-text('Libre')").count();
await adminPage.getByLabel("Début du créneau").fill(local);
await adminPage.getByRole("button", { name: "Ouvrir le créneau" }).click();
check(
  "Créneau ouvert",
  Boolean(
    await waitFor(async () => (await adminPage.locator("li:has-text('Libre')").count()) > openBefore)
  )
);

// Un créneau dans le passé est refusé.
await adminPage.getByLabel("Début du créneau").fill("2020-01-01T10:00");
await adminPage.getByRole("button", { name: "Ouvrir le créneau" }).click();
check(
  "Créneau passé refusé",
  Boolean(await waitForText(adminPage, "ne s'ouvre pas dans le passé"))
);

// Attribution de séances à cet utilisateur.
await adminPage.getByLabel(`Offre — ${assessmentId}`).selectOption("GUIDED");
await adminPage.getByLabel(`Séances accordées — ${assessmentId}`).fill("0");
await adminPage.getByRole("button", { name: `Accorder — ${assessmentId}` }).click();
check("Offre attribuée", Boolean(await waitForText(adminPage, "restante(s) sur 3")));

// Un nombre hors bornes est refusé plutôt que tronqué.
await adminPage.getByLabel(`Séances accordées — ${assessmentId}`).fill("999");
await adminPage.getByRole("button", { name: `Accorder — ${assessmentId}` }).click();
check("Attribution hors bornes refusée", Boolean(await waitForText(adminPage, "entre 0 et 20")));

// ── Réservation ────────────────────────────────────────────────────────────
await page.goto(`${BASE}/app/consultations`, { waitUntil: "networkidle" });
text = await page.locator("body").innerText();
check("Solde mis à jour", contains(text, "3 sur 3"));

// Comptés avant réservation : chaque exécution ouvre un créneau, et le total
// s'accumule en base. Seule la variation prouve que le créneau pris disparaît.
const slotsBefore = await page
  .getByLabel("Choisir un créneau — SCHOOL_LIST_REVIEW")
  .locator("option")
  .count();

await page.getByLabel("Choisir un créneau — ORIENTATION").selectOption({ index: 1 });
await page.getByRole("button", { name: "Réserver — ORIENTATION" }).click();
text = (await waitForText(page, "Vos séances à venir")) ?? "";
check("Séance réservée", contains(text, "Vos séances à venir"));
/*
 * L'heure est celle de PARIS, et le dit.
 *
 * Les créneaux étaient affichés en UTC — « 12:00 UTC » n'est l'heure de
 * personne : le client devait convertir de tête pour une séance qu'il a payée,
 * et pouvait la manquer. Paris est l'heure du fondateur qui donne la séance, et
 * reste un fuseau FIXE, donc aussi déterministe qu'UTC côté rendu.
 */
check("L'heure du rendez-vous porte son fuseau", contains(text, "heure de Paris"));
check("Plus aucune heure affichée en UTC", !contains(text, "UTC"));

/*
 * La réservation produit une CONFIRMATION par email.
 *
 * Réserver ne produisait aucun message : la personne posait un rendez-vous et
 * n'avait rien à mettre dans son agenda. Le corps est lu dans la boîte aux
 * lettres de développement — aucune route n'expose les emails.
 */
{
  const { readFileSync } = await import("node:fs");
  const mails = readFileSync(process.env.ADMITTO_MAIL_LOG, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => { try { return JSON.parse(line); } catch { return null; } })
    .filter((mail) => mail && mail.to === EMAIL && /Séance confirmée/.test(mail.subject ?? ""));
  const confirmation = mails.at(-1);

  check("Confirmation de séance envoyée", Boolean(confirmation), confirmation?.subject ?? "aucune");
  if (confirmation) {
    check("La confirmation porte l'heure avec son fuseau", /heure de Paris/.test(confirmation.body));
    // Un périmètre qui n'énonce que ses inclusions se lit comme ouvert.
    check("La confirmation énonce ce qui n'est PAS couvert", /ne couvre pas/i.test(confirmation.body));
    // Base contractuelle : aucune désinscription à proposer sur une confirmation
    // de rendez-vous.
    check("La confirmation ne se présente pas comme promotionnelle",
      /pas envoyée à des fins promotionnelles/.test(confirmation.body));
  }
}

/*
 * Compte rendu (CDC §31) : ce que la suite peut atteindre.
 *
 * La séance réservée ici est à venir — le back-office doit donc REFUSER d'en
 * rédiger le compte rendu, et le dire. Le parcours complet (séance passée,
 * publication, lecture par le client, email d'annonce) est couvert par les
 * tests du contrat de store et de la décision : une séance passée ne se
 * fabrique pas depuis le navigateur, `openSlot` refuse le passé.
 */
{
  await adminPage.goto(`${BASE}/admin/consultations`, { waitUntil: "networkidle" });
  const adminText = await adminPage.locator("body").innerText();
  check(
    "Compte rendu refusé tant que la séance n'a pas eu lieu",
    contains(adminText, "le compte rendu se rédige après")
  );
}
check("Solde décrémenté", contains(text, "2 sur 3"));

// Le créneau réservé n'est plus proposé aux autres types de séance.
if ((await page.getByLabel("Choisir un créneau — SCHOOL_LIST_REVIEW").count()) > 0) {
  const slotsAfter = await page
    .getByLabel("Choisir un créneau — SCHOOL_LIST_REVIEW")
    .locator("option")
    .count();
  check(
    "Créneau réservé retiré des propositions",
    slotsAfter === slotsBefore - 1,
    `${slotsBefore} → ${slotsAfter}`
  );
}

// ── Annulation ─────────────────────────────────────────────────────────────
await page.getByRole("button", { name: "Annuler" }).first().click();
text = (await waitForText(page, "3 sur 3")) ?? "";
check("Séance annulable", contains(text, "3 sur 3"));

check("Aucune erreur console", consoleErrors.length === 0, consoleErrors.join(" | "));

await browser.close();

if (failures.length) {
  console.error(`\n${failures.length} point(s) en échec.`);
  process.exit(1);
}
console.log("\n✓ Consultations : conformes.");
