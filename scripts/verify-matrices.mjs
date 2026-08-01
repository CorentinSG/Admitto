#!/usr/bin/env node
/**
 * Vérification des matrices éditables (CDC §33).
 *
 * Ce qu'aucun test unitaire ne voit : que l'édition depuis le back-office
 * gouverne RÉELLEMENT le diagnostic suivant, que l'histoire n'est pas
 * réécrite (une évaluation d'avant la révision garde son texte d'avant, à
 * l'écran comme au rapport), que l'activation d'une règle change la voie
 * produite, et que les refus — activation sans vérification, vocabulaire
 * interdit — s'affichent au lieu d'écrire.
 *
 * La suite remet les matrices dans leur état d'origine à la fin : les
 * révisions étant append-only, « remettre » signifie réviser à nouveau vers
 * le contenu capturé au départ.
 *
 * Prérequis : serveur lancé AVEC AUTH_SECRET, DATABASE_URL et ADMITTO_MAIL_LOG,
 * ADMITTO_ADMIN_EMAIL figurant dans ADMITTO_ADMIN_EMAILS.
 * Usage : ADMITTO_ADMIN_EMAIL=… node scripts/verify-matrices.mjs [url]
 */

const BASE = (process.argv[2] ?? "http://127.0.0.1:3000").replace(/\/$/, "");
const ADMIN_EMAIL = process.env.ADMITTO_ADMIN_EMAIL;
const TAG = `rev-${Date.now().toString(36)}`;

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
const { waitFor, warmUp } = await import("./lib/wait.mjs");
const { submitDiagnostic } = await import("./lib/questionnaire.mjs");
const { verifyEmail } = await import("./lib/identity.mjs");

const failures = [];
const check = (label, ok, detail = "") => {
  console.log(`${ok ? "✓" : "✗"} ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures.push(label);
};
const contains = (haystack, needle) => haystack.toLowerCase().includes(needle.toLowerCase());

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

const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
const consoleErrors = [];
page.on("pageerror", (e) => consoleErrors.push(String(e)));
page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));

await warmUp(page, BASE);

// ── Fermé par défaut ───────────────────────────────────────────────────────
{
  const response = await page.request.get(`${BASE}/admin/matrices`, {
    failOnStatusCode: false,
  });
  check("Matrices invisibles sans session", response.status() === 404, String(response.status()));
}

// ── Une évaluation AVANT toute révision ────────────────────────────────────
const anon = await browser.newPage();
const { id: beforeId } = await submitDiagnostic(anon, BASE, {
  labels: LABELS,
  firstName: "Avant",
  email: verifyEmail("avant"),
});
await anon.goto(`${BASE}/resultat/${beforeId}`, { waitUntil: "networkidle" });
check(
  // Depuis la vérification du 2026-08-01, ce profil M2 emprunte la voie LL.M.
  // et non plus la revue humaine par défaut.
  "Diagnostic d'avant : texte de voie d'origine",
  contains(await anon.locator("body").innerText(), "New York Board of Law Examiners")
);

// ── Back-office ────────────────────────────────────────────────────────────
check("Connexion administrateur", await signInByEmail(page, BASE, ADMIN_EMAIL));
await page.goto(`${BASE}/admin/matrices`, { waitUntil: "networkidle" });
const adminText = await page.locator("body").innerText();
check("Règles listées avec leur condition", contains(adminText, "R-NY-001"));
check("Blocs listés par famille", contains(adminText, "Rapport — verdicts"));

const blockForm = (key) =>
  page.locator("form").filter({ has: page.locator(`input[name="key"][value="${key}"]`) });
const ruleForm = (ruleId) =>
  page.locator("form").filter({ has: page.locator(`input[name="ruleId"][value="${ruleId}"]`) });

const FEEDBACK = /Révision enregistrée|Vocabulaire refusé|affiché tel quel|sans date de vérification/i;

/**
 * Soumet un formulaire et attend SON feedback, en deux phases.
 *
 * Deux pièges réels, tous deux rencontrés :
 * — le feedback est scellé au formulaire, sinon « Révision enregistrée »
 *   affiché ailleurs sur la page satisferait l'attente ;
 * — React 19 RÉINITIALISE un formulaire quand son action se termine. Remplir
 *   le champ pendant qu'une soumission précédente est en vol, c'est voir sa
 *   saisie écrasée par le reset entre le fill et le click — la suite a
 *   enregistré un bloc SANS le marqueur qu'elle venait de taper. D'où la
 *   première phase : attendre que le feedback précédent ait disparu, preuve
 *   que la transition en cours est passée.
 */
async function submitAndAwait(form, buttonName) {
  await page.getByRole("button", { name: buttonName }).click();
  // Phase 1 : l'ancien feedback s'efface au démarrage de la transition. Si le
  // serveur répond plus vite que notre premier regard, cette phase expire —
  // c'est un délai, pas un échec.
  await waitFor(
    async () => (FEEDBACK.test(await form.innerText()) ? null : true),
    { timeoutMs: 3_000 }
  );
  // Phase 2 : le feedback de CETTE soumission.
  return (await waitFor(async () => {
    const text = await form.innerText();
    return FEEDBACK.test(text) ? text : null;
  })) ?? "";
}

// ── Refus : activation sans date de vérification ───────────────────────────
{
  const form = ruleForm("R-NY-001");
  await form.locator('input[name="verifiedAt"]').fill("");
  await form.locator('input[name="active"]').check();
  const feedback = await submitAndAwait(form, "Enregistrer la règle — R-NY-001");
  check("Activation sans vérification refusée", contains(feedback, "sans date de vérification"));
  await form.locator('input[name="active"]').uncheck();
}

// ── Refus : vocabulaire interdit dans un bloc ──────────────────────────────
// Le bloc révisé est celui de la voie que ce profil emprunte RÉELLEMENT :
// réviser un bloc qu'il n'atteint plus ne testerait rien du mécanisme.
const voieKey = "VOIE:TB-NY-VIA-LLM";
const originalVoie = await blockForm(voieKey).locator('textarea[name="text"]').inputValue();
{
  await blockForm(voieKey).locator('textarea[name="text"]').fill("Votre admission garantie.");
  check(
    "Vocabulaire interdit refusé",
    contains(
      await submitAndAwait(blockForm(voieKey), `Enregistrer le bloc — ${voieKey}`),
      "Vocabulaire refusé"
    )
  );
}

// ── Refus : variable dans un bloc jamais substitué ─────────────────────────
{
  await blockForm(voieKey).locator('textarea[name="text"]').fill("Bonjour {prenom}, à bientôt.");
  check(
    "Variable refusée",
    contains(
      await submitAndAwait(blockForm(voieKey), `Enregistrer le bloc — ${voieKey}`),
      "affiché tel quel"
    )
  );
}

// ── Révision d'un bloc de voie ─────────────────────────────────────────────
const revisedVoie = `${originalVoie} Révision ${TAG}.`;
{
  await blockForm(voieKey).locator('textarea[name="text"]').fill(revisedVoie);
  check(
    "Bloc de voie révisé",
    contains(
      await submitAndAwait(blockForm(voieKey), `Enregistrer le bloc — ${voieKey}`),
      "Révision enregistrée"
    )
  );
}

// ── Révision d'un verdict ──────────────────────────────────────────────────
// Le verdict du profil est CONSTATÉ sur le rapport d'avant, jamais présumé :
// la première version de cette suite visait un verdict codé en dur, et le
// profil en produisait un autre — le marqueur n'apparaissait nulle part.
await page.goto(`${BASE}/admin/rapports/${beforeId}/impression`, { waitUntil: "networkidle" });
const beforeReport = await page.locator("body").innerText();
await page.goto(`${BASE}/admin/matrices`, { waitUntil: "networkidle" });

let verdictKey = null;
let originalVerdictTitle = null;
for (const keyInput of await page.locator('input[name="key"][value^="VERDICT:"]').all()) {
  const key = await keyInput.getAttribute("value");
  const title = await blockForm(key).locator('input[name="title"]').inputValue();
  if (beforeReport.includes(title)) {
    verdictKey = key;
    originalVerdictTitle = title;
    break;
  }
}
check("Verdict du profil identifié", Boolean(verdictKey), verdictKey ?? "aucun");

const verdictForm = blockForm(verdictKey);
{
  await verdictForm.locator('input[name="title"]').fill(`${originalVerdictTitle} (${TAG})`);
  check(
    "Verdict révisé",
    contains(
      await submitAndAwait(verdictForm, `Enregistrer le bloc — ${verdictKey}`),
      "Révision enregistrée"
    )
  );
}

// ── Le diagnostic suivant utilise les révisions ────────────────────────────
const { id: afterId } = await submitDiagnostic(anon, BASE, {
  labels: LABELS,
  firstName: "Apres",
  email: verifyEmail("apres"),
});
await anon.goto(`${BASE}/resultat/${afterId}`, { waitUntil: "networkidle" });
check(
  "Diagnostic d'après : texte de voie révisé",
  contains(await anon.locator("body").innerText(), `Révision ${TAG}`)
);

// L'histoire n'est pas réécrite : l'évaluation d'avant garde son texte.
await anon.goto(`${BASE}/resultat/${beforeId}`, { waitUntil: "networkidle" });
check(
  "Diagnostic d'avant : texte inchangé",
  !contains(await anon.locator("body").innerText(), `Révision ${TAG}`)
);

// Même gel côté rapport : la version imprimable résout les blocs à la date
// de l'évaluation, pas à celle du rendu.
await page.goto(`${BASE}/admin/rapports/${afterId}/impression`, { waitUntil: "networkidle" });
check(
  "Rapport d'après : verdict révisé",
  contains(await page.locator("body").innerText(), `(${TAG})`)
);
await page.goto(`${BASE}/admin/rapports/${beforeId}/impression`, { waitUntil: "networkidle" });
check(
  "Rapport d'avant : verdict d'origine",
  !contains(await page.locator("body").innerText(), `(${TAG})`)
);

// ── Une révision gouverne réellement le moteur ─────────────────────────────
//
// La démonstration se fait dans le sens de la FERMETURE : on désactive
// R-NY-001 depuis le back-office et le diagnostic suivant retombe en revue
// humaine. Le sens inverse ne se démontre plus — depuis la correction de
// `PATH_PRIORITY`, R-ALT-001 et R-NY-002 sont masquées par R-NY-001, qui vise
// les mêmes profils et prime. C'est d'ailleurs ce que cette suite a constaté la
// première.
//
// Ce sens est aussi le plus sûr : si la suite tombe en cours de route, elle
// laisse une règle de droit ÉTEINTE, jamais allumée.
await page.goto(`${BASE}/admin/matrices`, { waitUntil: "networkidle" });
{
  const form = ruleForm("R-NY-001");
  await form.locator('input[name="active"]').uncheck();
  check(
    "Désactivation enregistrée avec sa source et sa date",
    contains(await submitAndAwait(form, "Enregistrer la règle — R-NY-001"), "Révision enregistrée")
  );
}

const { id: altId } = await submitDiagnostic(anon, BASE, {
  labels: LABELS,
  firstName: "Ferme",
  email: verifyEmail("ferme"),
});
await anon.goto(`${BASE}/resultat/${altId}`, { waitUntil: "networkidle" });
check(
  "La règle désactivée retire réellement la voie du diagnostic suivant",
  contains(await anon.locator("body").innerText(), "lecture humaine")
);

// ── Remise en état ─────────────────────────────────────────────────────────
await page.goto(`${BASE}/admin/matrices`, { waitUntil: "networkidle" });
{
  const form = ruleForm("R-NY-001");
  await form.locator('input[name="sourceUrl"]').fill("https://www.nycourts.gov/ctapps/520rules10.htm");
  await form.locator('input[name="verifiedAt"]').fill("2026-08-01");
  await form.locator('input[name="active"]').check();
  await submitAndAwait(form, "Enregistrer la règle — R-NY-001");

  await blockForm(voieKey).locator('textarea[name="text"]').fill(originalVoie);
  await submitAndAwait(blockForm(voieKey), `Enregistrer le bloc — ${voieKey}`);

  await verdictForm.locator('input[name="title"]').fill(originalVerdictTitle);
  await submitAndAwait(verdictForm, `Enregistrer le bloc — ${verdictKey}`);
}

// La remise en état est vérifiée, pas supposée : un diagnostic final revient
// au comportement d'origine.
const { id: finalId } = await submitDiagnostic(anon, BASE, {
  labels: LABELS,
  firstName: "Final",
  email: verifyEmail("final"),
});
await anon.goto(`${BASE}/resultat/${finalId}`, { waitUntil: "networkidle" });
const finalText = await anon.locator("body").innerText();
check(
  "État d'origine rétabli",
  !contains(finalText, TAG) && contains(finalText, "New York Board of Law Examiners")
);

check("Aucune erreur console", consoleErrors.length === 0, consoleErrors.join(" | "));

await browser.close();

if (failures.length) {
  console.error(`\n${failures.length} point(s) en échec.`);
  process.exit(1);
}
console.log("\n✓ Matrices éditables : conformes.");
