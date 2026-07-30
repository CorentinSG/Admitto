#!/usr/bin/env node
/**
 * Vérification des pages légales et du parcours de droits (revue §A1).
 *
 * Ce que les tests unitaires ne voient pas : qu'une adresse citée dans le pied
 * de page réponde vraiment, que l'export produise un fichier lisible, et
 * surtout que la suppression **efface en base** au lieu de se contenter de
 * déconnecter. Ce dernier point est le seul qui compte vraiment : une
 * suppression qui affiche « compte supprimé » sans rien effacer est une fausse
 * déclaration, et rien à l'écran ne la distingue d'une vraie.
 *
 * Le contrôle en base passe par le produit lui-même : un diagnostic effacé
 * rend 404 sur son adresse de résultat, qu'aucune session ne peut simuler.
 *
 * Prérequis : serveur lancé AVEC AUTH_SECRET, DATABASE_URL et ADMITTO_MAIL_LOG.
 * Usage : node scripts/verify-legal.mjs [url]
 */

const BASE = (process.argv[2] ?? "http://127.0.0.1:3000").replace(/\/$/, "");
const { verifyEmail } = await import("./lib/identity.mjs");
const EMAIL = verifyEmail("nadia");

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

await warmUp(page, BASE);

// ── Les trois adresses du pied de page répondent ───────────────────────────
const DOCUMENTS = [
  { slug: "mentions-legales", title: "Mentions légales" },
  { slug: "confidentialite", title: "Politique de confidentialité" },
  { slug: "conditions-generales", title: "Conditions générales" },
];

for (const document of DOCUMENTS) {
  const response = await page.goto(`${BASE}/${document.slug}`, { waitUntil: "domcontentloaded" });
  check(`Page ${document.slug} servie`, response?.status() === 200, String(response?.status()));
  const text = await page.locator("body").innerText();
  check(`Titre de ${document.slug}`, contains(text, document.title));
  check(`Date de révision affichée — ${document.slug}`, contains(text, "dernière mise à jour"));
}

// ── Le pied de page mène réellement aux documents ──────────────────────────
await page.goto(BASE, { waitUntil: "networkidle" });
for (const document of DOCUMENTS) {
  const count = await page.locator(`footer a[href="/${document.slug}"]`).count();
  check(`Lien du pied de page vers ${document.slug}`, count > 0);
}

// ── Ce qui manque est dit, pas masqué ──────────────────────────────────────
await page.goto(`${BASE}/mentions-legales`, { waitUntil: "domcontentloaded" });
let text = await page.locator("body").innerText();
check("Mentions à compléter signalées", contains(text, "à compléter"));
check("Hébergeur réclamé", contains(text, "hébergeur"));
check(
  "Nature du service énoncée",
  contains(text, "ni conseil juridique") || contains(text, "n'est pas un cabinet")
);

await page.goto(`${BASE}/confidentialite`, { waitUntil: "domcontentloaded" });
text = await page.locator("body").innerText();
check("Base légale de chaque traitement", contains(text, "base légale"));
check("Consentement distingué du contrat", contains(text, "consentement"));
check("Durées de conservation publiées", contains(text, "durées de conservation"));
check("Droits énumérés", contains(text, "portabilité") && contains(text, "effacement"));
check("Autorité de contrôle indiquée", contains(text, "cnil"));
check("Absence de traceur publicitaire annoncée", contains(text, "aucun cookie publicitaire"));

await page.goto(`${BASE}/conditions-generales`, { waitUntil: "domcontentloaded" });
text = await page.locator("body").innerText();
check("Droit de rétractation exposé", contains(text, "quatorze jours"));
check("Périmètre exclu énoncé", contains(text, "ne comprend en aucun cas"));
check("Aucun résultat promis", contains(text, "aucun résultat n'est promis"));

// ── Désinscription : le lien porté par chaque email promotionnel ──────────
// Cette adresse figurait dans les emails avant d'exister. Un lien de
// désinscription qui rend 404 est la seule sortie offerte à quelqu'un qui ne
// veut plus être écrit : l'annoncer sans la fournir est pire que se taire.
{
  const response = await page.goto(`${BASE}/desinscription/inexistant`, {
    waitUntil: "domcontentloaded",
  });
  check("Page de désinscription servie", response?.status() === 200, String(response?.status()));
  const body = await page.locator("body").innerText();
  check("Lien périmé traité calmement", contains(body, "vous ne recevez plus"));
  check(
    "Les emails du service sont annoncés comme maintenus",
    contains(body, "lien de connexion")
  );
}

// ── Espace des droits : fermé par défaut ───────────────────────────────────
await page.goto(`${BASE}/app/donnees`, { waitUntil: "domcontentloaded" });
check("Page « Vos données » fermée sans session", page.url().includes("/connexion"), page.url());

const exportClosed = await page.request.get(`${BASE}/app/donnees/export`, {
  maxRedirects: 0,
  failOnStatusCode: false,
});
check(
  "Export fermé sans session",
  exportClosed.status() === 401 || exportClosed.status() >= 300,
  String(exportClosed.status())
);

// ── Un compte, un diagnostic ───────────────────────────────────────────────
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
await page.getByPlaceholder("Prénom").fill("Nadia");
await page.getByPlaceholder("Adresse email").fill(EMAIL);
await page.getByRole("button", { name: "Obtenir mon résultat" }).click();
await page.waitForURL("**/resultat/**", { timeout: 20000 });
const assessmentId = page.url().split("/resultat/")[1].split(/[?#]/)[0];

check("Connexion par lien email", await signInByEmail(page, BASE, EMAIL));

// ── Accès et portabilité ───────────────────────────────────────────────────
await page.goto(`${BASE}/app/donnees`, { waitUntil: "networkidle" });
text = await page.locator("body").innerText();
check("Page « Vos données » accessible", contains(text, "Vos données"));
check("Ce qui est détenu est énuméré", contains(text, "Ce qui est enregistré"));
check("Export proposé", contains(text, "Télécharger mes données"));

const exported = await page.request.get(`${BASE}/app/donnees/export`);
check("Export servi", exported.status() === 200, String(exported.status()));
check(
  "Export téléchargeable comme fichier",
  contains(exported.headers()["content-disposition"] ?? "", "attachment")
);

let payload = null;
try {
  payload = JSON.parse(await exported.text());
} catch {
  payload = null;
}
check("Export lisible", payload !== null);
check("Export porte le compte", payload?.account?.email === EMAIL, payload?.account?.email ?? "—");
check(
  "Export porte le diagnostic",
  Array.isArray(payload?.assessments) && payload.assessments.some((a) => a.id === assessmentId)
);
check("Export porte les réponses au questionnaire", Boolean(payload?.assessments?.[0]?.answers));
check("Export dit ce qu'il ne contient pas", (payload?.notIncluded?.length ?? 0) > 0);

// ── Retrait du consentement, sur un diagnostic réel ───────────────────────
await page.goto(`${BASE}/desinscription/${assessmentId}`, { waitUntil: "domcontentloaded" });
check(
  "Retrait proposé, jamais exécuté au chargement",
  (await page.getByRole("button", { name: "Confirmer ma désinscription" }).count()) === 1
);
await page.getByRole("button", { name: "Confirmer ma désinscription" }).click();
check("Retrait enregistré", Boolean(await waitForText(page, "C'est fait")));

// Rechargée, la page constate l'état au lieu de reproposer le geste.
await page.reload({ waitUntil: "domcontentloaded" });
check(
  "Retrait constaté au rechargement",
  (await page.getByRole("button", { name: "Confirmer ma désinscription" }).count()) === 0
);

await page.goto(`${BASE}/app/donnees`, { waitUntil: "networkidle" });

// ── Effacement : refusé sans confirmation exacte ───────────────────────────
await page.getByLabel("Pour confirmer, saisissez SUPPRIMER").fill("supprimer");
check(
  "Effacement bloqué tant que la confirmation ne correspond pas",
  await page.getByRole("button", { name: "Supprimer définitivement" }).isDisabled()
);

// Le serveur refuse aussi de son côté : l'action appelée directement, sans
// passer par l'écran, ne doit pas effacer davantage.
const forced = await page.request.post(`${BASE}/app/donnees`, {
  form: { confirmation: "oui" },
  failOnStatusCode: false,
});
check(
  "Appel direct sans confirmation sans effet",
  forced.status() !== 500,
  String(forced.status())
);
const stillThere = await page.request.get(`${BASE}/resultat/${assessmentId}`, {
  failOnStatusCode: false,
});
check(
  "Diagnostic toujours en base après refus",
  stillThere.status() === 200,
  String(stillThere.status())
);

// ── Effacement : effectif ──────────────────────────────────────────────────
await page.getByLabel("Pour confirmer, saisissez SUPPRIMER").fill("SUPPRIMER");
await page.getByRole("button", { name: "Supprimer définitivement" }).click();

// La déconnexion suit la suppression : la preuve est la fermeture de l'espace.
check(
  "Session close après suppression",
  Boolean(
    await waitFor(async () => {
      const response = await page.request.get(`${BASE}/app/donnees`, {
        maxRedirects: 0,
        failOnStatusCode: false,
      });
      return response.status() >= 300 && response.status() < 400;
    })
  )
);

// Contrôle en base, par le produit : un diagnostic effacé n'a plus d'adresse.
check(
  "Diagnostic réellement effacé",
  Boolean(
    await waitFor(async () => {
      const response = await page.request.get(`${BASE}/resultat/${assessmentId}`, {
        failOnStatusCode: false,
      });
      return response.status() === 404;
    })
  )
);

// Le compte lui-même est parti : une nouvelle connexion repart de zéro et ne
// retrouve aucun diagnostic, donc l'espace renvoie au diagnostic.
check("Compte recréé sans historique", await signInByEmail(page, BASE, EMAIL));
await page.goto(`${BASE}/app/dashboard`, { waitUntil: "networkidle" });
check(
  "Aucun diagnostic rattaché après suppression",
  page.url().includes("/diagnostic"),
  page.url()
);

check("Aucune erreur console", consoleErrors.length === 0, consoleErrors.join(" | "));

await browser.close();

if (failures.length) {
  console.error(`\n${failures.length} point(s) en échec.`);
  process.exit(1);
}
console.log("\n✓ Pages légales et parcours de droits : conformes.");
