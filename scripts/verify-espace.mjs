#!/usr/bin/env node
/**
 * Vérification du coffre de documents (CDC §29) et des modules (CDC §25).
 *
 * Contrôle ce qu'aucun test unitaire ne voit : que le refus d'une pièce
 * sensible remonte bien à l'écran, qu'un module non rédigé n'est ni lié ni
 * accessible par URL directe, et que le module publié se lit avec son
 * disclaimer.
 *
 * Prérequis : serveur lancé AVEC AUTH_SECRET, et Playwright.
 * Usage : AUTH_SECRET=… node scripts/verify-espace.mjs [url-base]
 */

const BASE = (process.argv[2] ?? "http://127.0.0.1:3000").replace(/\/$/, "");
const EMAIL = "alix@example.com";

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

const failures = [];
const check = (label, ok, detail = "") => {
  console.log(`${ok ? "✓" : "✗"} ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures.push(label);
};

/**
 * `innerText` renvoie le texte *rendu* : un titre en `text-transform: uppercase`
 * en revient en capitales. Toute comparaison de contenu passe donc par ici.
 */
const contains = (haystack, needle) => haystack.toLowerCase().includes(needle.toLowerCase());

const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const consoleErrors = [];
page.on("pageerror", (e) => consoleErrors.push(String(e)));
page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));

// ── Fermé par défaut ───────────────────────────────────────────────────────
for (const path of ["/app/documents", "/app/modules", "/app/modules/module-0-decision"]) {
  await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded" });
  check(`${path} fermé sans compte`, page.url().includes("/connexion"), page.url());
}

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
await page.getByPlaceholder("Prénom").fill("Alix");
await page.getByPlaceholder("Adresse email").fill(EMAIL);
await page.getByRole("button", { name: "Obtenir mon résultat" }).click();
await page.waitForURL("**/resultat/**", { timeout: 20000 });
const connected = await signInByEmail(page, BASE, EMAIL);
check("Connexion par lien email", connected);
await page.goto(`${BASE}/app/dashboard`, { waitUntil: "networkidle" });

// ── Coffre de documents (CDC §29) ──────────────────────────────────────────
await page.goto(`${BASE}/app/documents`, { waitUntil: "networkidle" });
const vaultText = await page.locator("body").innerText();

for (const type of ["CV", "Personal statement", "Liste d'écoles", "Document de travail", "Checklist"]) {
  check(`Type « ${type} » proposé`, contains(vaultText, type));
}

// Exactement cinq panneaux : un sixième type signalerait un élargissement du
// coffre, que le CDC §29 n'autorise pas.
const panels = await page.locator("form input[name='type']").count();
check("Cinq types, pas un sixième", panels === 5, `${panels} panneaux`);

check("Catégories refusées annoncées", contains(vaultText, "Ce que le coffre n'accueille jamais"));
for (const refused of [
  "Passeport et pièces d'identité",
  "Dossier Character and Fitness",
  "Documents médicaux ou disciplinaires",
  "Relevés bancaires",
  "Dossiers de visa complets",
]) {
  check(`Refus annoncé : « ${refused} »`, contains(vaultText, refused));
}

// Le stockage n'est pas configuré dans cette vérification : le coffre bascule
// en déclaration, et doit le dire au lieu de laisser croire à un envoi.
// « Choisir un fichier » est un aria-label, absent de innerText : le régime se
// lit sur la présence du champ de dépôt, pas sur le texte de la page.
const declarative = contains(vaultText, "Dépôt de fichiers indisponible");
const fileInputs = await page.locator("input[type='file']").count();
check(
  "Régime de stockage annoncé",
  declarative ? fileInputs === 0 : fileInputs === 5,
  `${declarative ? "déclaration" : "dépôt"}, ${fileInputs} champ(s) de fichier`
);

/**
 * Les deux régimes sont vérifiés par le même scénario.
 *
 * En déclaration, le nom est saisi ; avec stockage actif, un vrai fichier est
 * transmis. Dans les deux cas la politique de refus doit produire le même
 * verdict — c'est précisément ce que cette vérification cherche à établir :
 * activer le stockage n'assouplit rien.
 */
const submitLabel = declarative ? "Déclarer ce document" : "Ajouter";
const proposeCv = async (fileName) => {
  if (declarative) {
    await page.getByLabel("Déclarer ce document — CV").fill(fileName);
  } else {
    await page.getByLabel("Choisir un fichier — CV").setInputFiles({
      name: fileName,
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4 contenu de vérification"),
    });
  }
  await page.getByRole("button", { name: submitLabel }).first().click();
  await page.waitForTimeout(900);
  return page.locator("body").innerText();
};

// Une pièce sensible déposée sous un type légitime doit être refusée.
const refusal = await proposeCv("passeport-scan.pdf");
check(
  "Pièce sensible refusée à l'écran",
  /catégorie que le coffre n'accueille pas/i.test(refusal),
  refusal.match(/Catégorie concernée[^\n]*/)?.[0] ?? ""
);
check("Catégorie du refus expliquée", /Passeport et pièces d'identité/.test(refusal));
check("Pièce sensible non enregistrée", !/passeport-scan\.pdf\s*·/i.test(refusal));

// Un format image est refusé même sous un nom anodin.
check("Format image refusé", /pas des images/i.test(await proposeCv("mon-cv.png")));

// Un document légitime est accepté et listé.
const accepted = await proposeCv("cv-alix.pdf");
check("Document légitime accepté", contains(accepted, "cv-alix.pdf"));
check(
  "Régime de conservation signalé",
  declarative ? /Document déclaré/i.test(accepted) : !/Document déclaré/i.test(accepted)
);

// Le tableau de bord reprend le coffre.
await page.goto(`${BASE}/app/dashboard`, { waitUntil: "networkidle" });
check("Coffre repris au tableau de bord", contains(await page.locator("body").innerText(), "cv-alix.pdf"));

// Retrait.
await page.goto(`${BASE}/app/documents`, { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Retirer" }).first().click();
await page.waitForTimeout(900);
check("Document retirable", !contains(await page.locator("body").innerText(), "cv-alix.pdf"));

// ── Modules (CDC §25) ──────────────────────────────────────────────────────
await page.goto(`${BASE}/app/modules`, { waitUntil: "networkidle" });
const library = await page.locator("body").innerText();

const moduleCount = (library.match(/MODULE \d+/gi) ?? []).length;
check("Onze modules listés", moduleCount === 11, `${moduleCount}`);
check("Module 0 lisible", contains(library, "Lire le module"));
const inProduction = (library.match(/En cours de production/gi) ?? []).length;
check("Modules non rédigés annoncés en production", inProduction === 10, `${inProduction}`);
check("Un seul module lié", (await page.locator('a[href^="/app/modules/"]').count()) === 1);

// Un module non rédigé ne s'ouvre pas non plus par URL directe. La navigation
// vers un 404 journalise une erreur réseau attendue : on borne la fenêtre
// plutôt que de relâcher l'assertion « aucune erreur console ».
const errorsBefore404 = consoleErrors.length;
const direct = await page.goto(`${BASE}/app/modules/module-5-bole`, { waitUntil: "domcontentloaded" });
check("Module non rédigé inaccessible par URL directe", direct?.status() === 404, String(direct?.status()));

// Retrait par correspondance, jamais par position : retirer « les N suivantes »
// écarterait une vraie erreur survenue dans la même fenêtre.
for (let i = consoleErrors.length - 1; i >= errorsBefore404; i--) {
  if (/404/.test(consoleErrors[i]) && /failed to load resource/i.test(consoleErrors[i])) {
    consoleErrors.splice(i, 1);
  }
}

await page.goto(`${BASE}/app/modules/module-0-decision`, { waitUntil: "networkidle" });
const article = await page.locator("body").innerText();
check("Module 0 s'ouvre", contains(article, "Faut-il faire ce parcours ?"));
const keyPointBlocks = (article.match(/À retenir/gi) ?? []).length;
check("Sections rendues avec leurs points clés", keyPointBlocks >= 5, `${keyPointBlocks} blocs`);
check("Disclaimer présent", /ne constitue pas un conseil juridique/i.test(article));
check("Aucune éligibilité affirmée", !/vous êtes éligible/i.test(article));
check("Aucune garantie de résultat", !/(résultat|admission|succès) garanti/i.test(article));

check("Aucune erreur console", consoleErrors.length === 0, consoleErrors.join(" | "));

await browser.close();

if (failures.length) {
  console.error(`\n${failures.length} point(s) en échec.`);
  process.exit(1);
}
console.log("\n✓ Coffre de documents et modules : conformes.");
