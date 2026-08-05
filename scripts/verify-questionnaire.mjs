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

const { waitForText, waitForTextChange, warmUp } = await import("./lib/wait.mjs");
const { answerScreens } = await import("./lib/questionnaire.mjs");

const { verifyEmail } = await import("./lib/identity.mjs");
const EMAIL = verifyEmail("test");

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

await warmUp(page, BASE);

// ── Reprise d'un parcours interrompu ───────────────────────────────────────
// Douze écrans souvent parcourus sur mobile : l'interruption est la règle, pas
// l'exception. Le rechargement ci-dessous EST l'interruption.
{
  await page.goto(`${BASE}/diagnostic`, { waitUntil: "networkidle" });
  const avant = await page.locator("body").innerText();
  await page.getByRole("button", { name: "Commencer" }).click();
  await waitForTextChange(page, avant);
  await answerScreens(page, [
    "Je suis avocat et j'étudie mes options",
    "CAPA obtenu",
    "Université Paris-Panthéon-Assas",
  ]);

  await page.reload({ waitUntil: "networkidle" });
  const reprise = page.getByRole("button", { name: /Reprendre mes \d+ réponses/ });
  check("Reprise proposée après rechargement", (await reprise.count()) > 0);
  check(
    "Le nombre de réponses reprises est annoncé",
    // Le bouton est en capitales par `text-transform`, et `innerText` rend le
    // texte TEL QU'AFFICHÉ : comparer en casse pliée.
    /Reprendre mes 3 réponses/i.test(await page.locator("body").innerText())
  );

  // Un navigateur est souvent partagé, et le brouillon survit à la fermeture
  // de l'onglet : rien de ce qui identifie ne doit s'y trouver.
  const brouillon = await page.evaluate(() =>
    window.localStorage.getItem("admitto.diagnostic.brouillon")
  );
  check(
    "Aucun champ identifiant dans le brouillon",
    Boolean(brouillon) && !/firstName|email|comment|consentMarketing/.test(brouillon),
    brouillon ?? "absent"
  );

  await reprise.click();
  check(
    "Reprise à la première question sans réponse",
    Boolean(await waitForText(page, "Êtes-vous admis à un barreau ?"))
  );
  // L'écran « barreau » n'existe QUE pour un profil avocat : le voir prouve
  // que les réponses précédentes ont bien été restituées, pas seulement l'index.
  check(
    "L'écran conditionnel suit le profil restitué",
    /Étape 4 sur 12/.test(await page.locator("body").innerText())
  );

  /*
   * L'écran est là : c'est le moment de contrôler ce qu'il demande. Il recueille
   * la BASE de l'admission — c'est elle qui sépare deux textes du règlement — et
   * jamais le pays. Le BOLE ne publie aucune liste des juridictions relevant de
   * la common law : une liste posée ici inventerait le critère qu'il refuse de
   * publier, et le produit se prononcerait à sa place.
   */
  const bases = await page.locator('button:has-text("Oui, à l\'étranger")').allInnerTexts();
  check("Les deux bases d'admission sont proposées", bases.length === 2, `${bases.length}`);
  check(
    "Chacune porte de quoi la reconnaître",
    bases.some((o) => /diplôme universitaire de droit/.test(o)) &&
      bases.some((o) => /training contract/.test(o)),
    bases.join(" | ").replace(/\n/g, " ")
  );

  // Repartir de zéro efface : sinon le brouillon reviendrait au chargement
  // suivant, contre le geste qui vient d'être fait.
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Repartir de zéro" }).click();
  await page.reload({ waitUntil: "networkidle" });
  check(
    "« Repartir de zéro » efface le brouillon",
    (await page.getByRole("button", { name: /Reprendre mes/ }).count()) === 0
  );
}

await page.goto(`${BASE}/diagnostic`, { waitUntil: "networkidle" });
const beforeStart = await page.locator("body").innerText();
await page.getByRole("button", { name: "Commencer" }).click();
await waitForTextChange(page, beforeStart);

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

// Chaque écran attend le changement réel plutôt qu'un délai deviné.
const totals = await answerScreens(page, ANSWERS);

check("Écran barreau ajouté pour un profil avocat", totals.at(-1) === 12, `${totals.at(-1)} écrans`);

check("Jamais plus de douze écrans visibles (CDC §12.2)", Math.max(...totals) <= 12);

// Le contact refuse une adresse invalide.
await page.getByPlaceholder("Prénom").fill("Corentin");
await page.getByPlaceholder("Adresse email").fill("pas-un-email");
await page.getByRole("button", { name: "Obtenir mon résultat" }).click();
check("Adresse email invalide refusée", Boolean(await waitForText(page, "adresse email valide")));

// Soumission valide → résultat.
await page.getByPlaceholder("Adresse email").fill(EMAIL);
await page.getByRole("button", { name: "Obtenir mon résultat" }).click();
await page.waitForURL("**/resultat/**", { timeout: 30000 });
await waitForText(page, "Voie préliminaire");
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

// La liste n'énonce plus sous chaque école ce qui vaut pour toutes : ce qui
// les distingue — ville, niveau attendu — s'y noyait.
const commune = body.match(
  /Frais, (?:pour tous ces accords|sauf mention contraire sous l'école) : (.+)/
);
check("Condition de frais commune énoncée une fois", Boolean(commune));

// Le défaut mesuré valait pour une phrase de frais LONGUE, répétée sous
// chacune des neuf écoles. Le seuil écarte les lignes courtes — ville, type
// d'accord, catégorie de frais — qui se ressemblent légitimement.
const longues = body
  .split("\n")
  .map((l) => l.trim())
  .filter((l) => l.length > 80);
const repetee = longues.find((l, i) => longues.indexOf(l) !== i);
check("Aucune phrase longue répétée dans le résultat", !repetee, repetee ?? "");

check("Aucune erreur console", consoleErrors.length === 0, consoleErrors.join(" | "));

await browser.close();

if (failures.length) {
  console.error(`\n${failures.length} point(s) en échec.`);
  process.exit(1);
}
console.log("\n✓ Parcours de diagnostic : conforme.");
