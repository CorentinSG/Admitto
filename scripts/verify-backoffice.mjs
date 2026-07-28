#!/usr/bin/env node
/**
 * Vérification du back-office et du rapport (CDC §17, §18, §33).
 * Soumet un diagnostic, puis contrôle la file, la fiche rapport, les
 * transitions de statut, le journal des corrections et la version imprimable.
 *
 * Prérequis : serveur lancé AVEC ADMITTO_ADMIN_TOKEN, et Playwright.
 * Usage : ADMITTO_ADMIN_TOKEN=… node scripts/verify-backoffice.mjs [url-base]
 */

const BASE = (process.argv[2] ?? "http://127.0.0.1:3000").replace(/\/$/, "");
const TOKEN = process.env.ADMITTO_ADMIN_TOKEN;

if (!TOKEN) {
  console.error("✗ ADMITTO_ADMIN_TOKEN absent : le back-office est fermé par défaut.");
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

// ── Le back-office est fermé sans jeton ────────────────────────────────────
const anonymous = await browser.newContext();
const anonPage = await anonymous.newPage();
const anonResponse = await anonPage.goto(`${BASE}/admin`, { waitUntil: "domcontentloaded" });
check("Back-office inaccessible sans jeton", anonResponse?.status() === 404, `HTTP ${anonResponse?.status()}`);

// ── Un diagnostic est soumis pour alimenter la file ────────────────────────
await anonPage.goto(`${BASE}/diagnostic`, { waitUntil: "networkidle" });
await anonPage.getByRole("button", { name: "Commencer" }).click();
await anonPage.waitForTimeout(300);
for (const label of [
  "Je prépare mes candidatures",
  "Master 2",
  "Université Paris 1 Panthéon-Sorbonne",
  "Grand cabinet international",
  "Rester aux États-Unis",
  "Moins de 30 000 $",
  "Aucune option identifiée",
  "L'an prochain",
  "Pas encore commencé",
  "Français, sans statut américain",
]) {
  await anonPage.getByRole("button", { name: label, exact: true }).click();
  await anonPage.waitForTimeout(220);
}
await anonPage.getByPlaceholder("Prénom").fill("Camille");
await anonPage.getByPlaceholder("Adresse email").fill("camille@example.com");
await anonPage.getByRole("button", { name: "Obtenir mon résultat" }).click();
await anonPage.waitForURL("**/resultat/**", { timeout: 20000 });
const assessmentId = anonPage.url().split("/resultat/")[1];
check("Diagnostic soumis et mis en file", Boolean(assessmentId));

// ── Accès authentifié au back-office ───────────────────────────────────────
const admin = await browser.newContext();
const page = await admin.newPage();
await page.goto(`${BASE}/admin?token=${encodeURIComponent(TOKEN)}`, { waitUntil: "networkidle" });
check("Jeton accepté et cookie posé", page.url().endsWith("/admin"), page.url());

const queueText = await page.locator("body").innerText();
check("File affichée avec le demandeur", /Camille/.test(queueText));
check("Délai annoncé affiché (CDC §18)", /sous 48 heures|sous 3 jours/.test(queueText));

// ── Fiche rapport ──────────────────────────────────────────────────────────
await page.goto(`${BASE}/admin/rapports/${assessmentId}`, { waitUntil: "networkidle" });
// innerText restitue le texte RENDU : les titres en text-transform: uppercase
// remontent en majuscules. La comparaison doit donc être insensible à la casse.
const detail = (await page.locator("body").innerText()).toLowerCase();
const has = (haystack, needle) => haystack.includes(needle.toLowerCase());
for (const section of ["Sorties des moteurs", "Cinq axes", "Journal des corrections"]) {
  check(`Section « ${section} » présente`, has(detail, section));
}
check("Verdict du Moteur B affiché", /projet .+/.test(detail));
check("Règles déclenchées tracées", /r-[a-z]+-\d+ v\d+|aucune/.test(detail));

// ── Transition de statut ───────────────────────────────────────────────────
await page.getByRole("button", { name: "En relecture" }).click();
await page.waitForTimeout(1200);
check(
  "Statut passé en relecture",
  await page.getByRole("button", { name: "En relecture" }).isDisabled()
);

// ── Journal des corrections ────────────────────────────────────────────────
await page.locator("textarea").fill("Fourchette de coût ajustée après vérification.");
await page.getByRole("button", { name: "Consigner" }).click();
await page.waitForTimeout(1200);
check(
  "Correction consignée et horodatée",
  (await page.locator("text=Fourchette de coût ajustée").count()) > 0
);

// ── Version imprimable ─────────────────────────────────────────────────────
await page.goto(`${BASE}/admin/rapports/${assessmentId}/impression`, { waitUntil: "networkidle" });
const printed = (await page.locator("body").innerText()).toLowerCase();
for (const section of [
  "Synthèse",
  "Voie préliminaire",
  "Partenariats",
  "Viabilité du projet",
  "Risques principaux",
  "Prochaines étapes",
  "Timeline",
  "Scénarios de coût",
  "Offre recommandée",
  "Sources et dates de vérification",
]) {
  check(`Rapport — section « ${section} »`, has(printed, section));
}
check("Signé « Founder », jamais « Esq. »", /founder/.test(printed) && !/esq\.|attorney at law/.test(printed));
check("Disclaimer présent", /not legal advice/i.test(printed));
check("Aucune éligibilité affirmée", !/vous êtes éligible/i.test(printed));

await browser.close();

if (failures.length) {
  console.error(`\n${failures.length} point(s) en échec.`);
  process.exit(1);
}
console.log("\n✓ Back-office et rapport : conformes.");
