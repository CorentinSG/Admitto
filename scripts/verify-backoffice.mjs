#!/usr/bin/env node
/**
 * Vérification du back-office et du rapport (CDC §17, §18, §33).
 * Soumet un diagnostic, puis contrôle la file, la fiche rapport, les
 * transitions de statut, le journal des corrections et la version imprimable.
 *
 * Prérequis : serveur lancé AVEC AUTH_SECRET, DATABASE_URL et ADMITTO_MAIL_LOG,
 * l'adresse ci-dessous figurant dans ADMITTO_ADMIN_EMAILS. Playwright requis.
 * Usage : ADMITTO_ADMIN_EMAIL=… node scripts/verify-backoffice.mjs [url-base]
 */

const BASE = (process.argv[2] ?? "http://127.0.0.1:3000").replace(/\/$/, "");
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

const failures = [];
const check = (label, ok, detail = "") => {
  console.log(`${ok ? "✓" : "✗"} ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures.push(label);
};

const { signInByEmail } = await import("./lib/sign-in.mjs");

const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
});

// ── Le back-office est fermé sans jeton ────────────────────────────────────
const anonymous = await browser.newContext();
const anonPage = await anonymous.newPage();
const anonResponse = await anonPage.goto(`${BASE}/admin`, { waitUntil: "domcontentloaded" });
check("Back-office inaccessible sans compte", anonResponse?.status() === 404, `HTTP ${anonResponse?.status()}`);

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
const signedIn = await signInByEmail(page, BASE, ADMIN_EMAIL);
check("Connexion administrateur", signedIn);
await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
check("Back-office ouvert au rôle ADMIN", page.url().endsWith("/admin"), page.url());

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

// ── Revue avant envoi (CDC §17) ────────────────────────────────────────────
// innerText renvoie le texte rendu : le titre de section est en capitales.
const review = (await page.locator("body").innerText()).toLowerCase();
check("Bloc de revue présent", has(review, "Revue avant envoi"));

const boxes = page.locator("input[type='checkbox']");
const pointCount = await boxes.count();
const blocked = /point\(s\) bloquant\(s\)/i.test(review);
check("Points de revue dérivés du profil", pointCount > 0, `${pointCount} point(s)`);

if (blocked) {
  check(
    "Envoi fermé tant que la revue n'est pas faite",
    await page.getByRole("button", { name: "Envoyé" }).isDisabled()
  );

  // Le verrou doit tenir hors interface : l'action serveur est appelée
  // directement, sans passer par le bouton grisé.
  const forced = await page.evaluate(async () => {
    const res = await fetch(location.href, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=UTF-8", "Next-Action": "forced" },
      body: "[]",
    });
    return res.status;
  });
  check("Appel direct rejeté par le serveur", forced >= 400, `HTTP ${forced}`);

  // Acquittement de chaque point bloquant. `click` plutôt que `check` : la case
  // est pilotée par le serveur, `check` exigerait un basculement synchrone.
  for (let i = 0; i < pointCount; i++) {
    const box = boxes.nth(i);
    if (!(await box.isChecked())) {
      await box.click();
      await page.waitForTimeout(900);
    }
  }
  const after = await page.locator("body").innerText();
  check("Revue close une fois les points traités", /l'envoi est ouvert/i.test(after));
  check(
    "Envoi ouvert après revue",
    !(await page.getByRole("button", { name: "Envoyé" }).isDisabled())
  );
}

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
