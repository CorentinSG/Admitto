#!/usr/bin/env node
/**
 * Vérification de bout en bout du parcours de diagnostic (CDC §12 et §15).
 * Pilote un vrai navigateur : logique conditionnelle, validation du contact,
 * redirection et présence des six blocs du résultat immédiat.
 *
 * Prérequis : serveur lancé + Playwright.
 * Usage : node scripts/verify-questionnaire.mjs [url-base]
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

await page.goto(`${BASE}/diagnostic`, { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Commencer" }).click();
await page.waitForTimeout(400);

// Profil avocat français : l'écran « barreau étranger » doit apparaître (CDC §12.4).
const ANSWERS = [
  "Je suis avocat et j'étudie mes options",
  "CAPA obtenu",
  "Université Paris-Panthéon-Assas",
  "Oui, en France",
  "Arbitrage international",
  "Garder les deux options ouvertes",
  "60 000 à 100 000 $",
  "Les deux",
  "L'an prochain",
  "Test déjà passé",
  "Français, sans statut américain",
];

const totals = [];
for (const label of ANSWERS) {
  const step = await page.locator("text=Étape").first().innerText();
  totals.push(Number(step.match(/sur (\d+)/)[1]));
  await page.getByRole("button", { name: label, exact: true }).click();
  await page.waitForTimeout(280);
}

check("Écran barreau ajouté pour un profil avocat", totals.at(-1) === 12, `${totals.at(-1)} écrans`);
check("Jamais plus de douze écrans visibles (CDC §12.2)", Math.max(...totals) <= 12);

// Le contact refuse une adresse invalide.
await page.getByPlaceholder("Prénom").fill("Corentin");
await page.getByPlaceholder("Adresse email").fill("pas-un-email");
await page.getByRole("button", { name: "Obtenir mon résultat" }).click();
await page.waitForTimeout(800);
check("Adresse email invalide refusée", (await page.locator("text=adresse email valide").count()) > 0);

// Soumission valide → résultat.
await page.getByPlaceholder("Adresse email").fill("test@example.com");
await page.getByRole("button", { name: "Obtenir mon résultat" }).click();
await page.waitForURL("**/resultat/**", { timeout: 20000 });
await page.waitForTimeout(600);
check("Redirection vers le résultat", /\/resultat\//.test(page.url()));

// Les six blocs imposés par le CDC §15.
for (const section of [
  "Voie préliminaire",
  "Partenariats détectés",
  "Principales échéances",
  "Éléments migratoires généraux",
  "Première fourchette de coût",
  "Limites de cette analyse",
]) {
  check(`Bloc « ${section} » présent`, (await page.locator(`text=${section}`).count()) > 0);
}

// Aucune éligibilité affirmée, disclaimer présent.
const body = await page.locator("body").innerText();
check("Aucune affirmation d'éligibilité", !/vous êtes éligible/i.test(body));
check("Disclaimer affiché", /ne constitue pas un conseil juridique/i.test(body));

// Le test d'anglais étant déjà passé, l'échéance correspondante doit disparaître.
check("Échéance sans objet écartée", !/Test d'anglais passé/.test(body));

// Partenariats (CDC §27) : détectés par université ET par niveau d'études.
check(
  "Partenariats détectés pour une université couverte",
  /accords? confirmés? concernent? votre université|accord confirmé concerne votre université/i.test(body)
);
check("Fiabilité rendue lisible", !/partenariat garanti/i.test(body));

check("Aucune erreur console", consoleErrors.length === 0, consoleErrors.join(" | "));

await browser.close();

if (failures.length) {
  console.error(`\n${failures.length} point(s) en échec.`);
  process.exit(1);
}
console.log("\n✓ Parcours de diagnostic : conforme.");
