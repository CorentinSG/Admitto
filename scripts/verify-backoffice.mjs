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
const { verifyEmail } = await import("./lib/identity.mjs");
const ADMIN_EMAIL = process.env.ADMITTO_ADMIN_EMAIL;
const REQUESTER_EMAIL = verifyEmail("camille");

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

const { waitFor, waitForText, waitForTextChange, warmUp } = await import("./lib/wait.mjs");
const { answerScreens } = await import("./lib/questionnaire.mjs");

const failures = [];
const check = (label, ok, detail = "") => {
  console.log(`${ok ? "✓" : "✗"} ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures.push(label);
};

const { signInByEmail } = await import("./lib/sign-in.mjs");

const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
});

// Réchauffage : la première navigation paie sinon le démarrage à froid.
const warmPage = await browser.newPage();
await warmUp(warmPage, BASE);
await warmPage.close();

// ── Le back-office est fermé sans jeton ────────────────────────────────────
const anonymous = await browser.newContext();
const anonPage = await anonymous.newPage();
const anonResponse = await anonPage.goto(`${BASE}/admin`, { waitUntil: "domcontentloaded" });
check("Back-office inaccessible sans compte", anonResponse?.status() === 404, `HTTP ${anonResponse?.status()}`);

// ── Un diagnostic est soumis pour alimenter la file ────────────────────────
await anonPage.goto(`${BASE}/diagnostic`, { waitUntil: "networkidle" });
const beforeStart = await anonPage.locator("body").innerText();
await anonPage.getByRole("button", { name: "Commencer" }).click();
await waitForTextChange(anonPage, beforeStart);
// Chaque écran attend le changement réel plutôt qu'un délai deviné.
await answerScreens(anonPage, [
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
]);
await anonPage.getByPlaceholder("Prénom").fill("Camille");
await anonPage.getByPlaceholder("Adresse email").fill(REQUESTER_EMAIL);
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
// Les trois paliers, pas deux : le libellé dépend du nombre de rapports en
// file, qui s'accumule d'une exécution à l'autre. N'accepter que les deux
// premiers faisait échouer la suite dès que la file de test dépassait
// vingt-cinq entrées — alors que le troisième palier est le comportement voulu.
check(
  "Délai annoncé affiché (CDC §18)",
  /sous 48 heures|sous 3 jours|délai actuellement allongé/.test(queueText)
);

// ── Fiche rapport ──────────────────────────────────────────────────────────
/*
 * Budget de JavaScript de la fiche (lot E).
 *
 * C'est la page la plus lourde du produit, et elle l'était pour une raison
 * qu'aucune relecture ne montrait : un composant client importait la liste des
 * statuts depuis le module du store, ce qui y amenait le client Prisma —
 * 18,9 Ko de JavaScript pour dessiner trois boutons. La constante vit
 * désormais dans un module sans dépendance.
 *
 * Le budget est mesuré ici, sur la page réellement ouverte et authentifiée :
 * `verify:animations` ne se connecte pas, il ne pourrait donc pas la voir.
 * Contexte neuf pour ne pas mesurer un cache déjà rempli, mais MÊME session —
 * sans quoi la page redirigerait vers la connexion et le budget mesurerait
 * l'écran de connexion.
 */
const budgetContext = await browser.newContext({
  storageState: await page.context().storageState(),
});
const budgetPage = await budgetContext.newPage();
const budgetResponses = [];
budgetPage.on("response", (response) => {
  if (/\.js(\?|#|$)/.test(response.url().split(/[?#]/)[0])) budgetResponses.push(response);
});
await budgetPage.goto(`${BASE}/admin/rapports/${assessmentId}`, { waitUntil: "networkidle" });

// Octets réellement transmis — voir `verify-animations.mjs` pour la raison de
// ne pas mélanger `content-length` et longueur de corps.
let ficheJsBytes = 0;
for (const response of budgetResponses) {
  try {
    ficheJsBytes += (await response.request().sizes()).responseBodySize;
  } catch {
    // Requête libérée : ressource non comptée plutôt que suite en échec.
  }
}
await budgetContext.close();

// 110 Ko mesurés, socle commun compris — voir `verify-animations.mjs` : ce
// plafond attrape les accidents francs, `check:bundle` la variation propre à
// la route.
const FICHE_BUDGET_KO = 132;
check(
  `JavaScript de la fiche rapport sous ${FICHE_BUDGET_KO} Ko`,
  ficheJsBytes / 1024 < FICHE_BUDGET_KO,
  `${(ficheJsBytes / 1024).toFixed(1)} Ko`
);

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
// Le bouton se désactive quand le statut est appliqué : c'est le signal.
check(
  "Statut passé en relecture",
  Boolean(await waitFor(() => page.getByRole("button", { name: "En relecture" }).isDisabled()))
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
    if (!(await box.isChecked())) await box.click();
  }

  /**
   * Attendre que la CASE soit cochée ne prouverait rien : elle l'est
   * immédiatement, par affichage optimiste, avant même que le serveur réponde.
   * Le seul signal confirmé côté serveur est l'ouverture du bouton d'envoi,
   * calculée à partir des acquittements réellement enregistrés.
   */
  const sendOpen = await waitFor(
    async () => !(await page.getByRole("button", { name: "Envoyé" }).isDisabled())
  );
  check("Envoi ouvert après revue", Boolean(sendOpen));
  check(
    "Revue close une fois les points traités",
    /l'envoi est ouvert/i.test(await page.locator("body").innerText())
  );
}

// ── Journal des corrections ────────────────────────────────────────────────
await page.locator("textarea").fill("Fourchette de coût ajustée après vérification.");
await page.getByRole("button", { name: "Consigner" }).click();
check(
  "Correction consignée et horodatée",
  Boolean(await waitForText(page, "Fourchette de coût ajustée"))
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

// ── Le rapport, du côté de celui qui l'a demandé ───────────────────────────
// Il n'existait aucun écran où le destinataire puisse le lire : l'email
// « votre rapport est prêt » menait au résultat préliminaire gratuit.
{
  // Tant qu'il n'est pas marqué envoyé, la page annonce l'attente : afficher
  // un rapport non relu court-circuiterait la revue humaine du CDC §17.
  const fresh = await anonPage.goto(`${BASE}/rapport/${assessmentId}`, {
    waitUntil: "domcontentloaded",
  });
  check("Page du rapport servie", fresh?.status() === 200, String(fresh?.status()));

  await page.goto(`${BASE}/admin/rapports/${assessmentId}`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Envoyé" }).click();

  // Attendre le texte « Envoyé » ne prouverait rien : c'est le libellé du
  // bouton lui-même, présent avant comme après. Le seul signal confirmé par
  // le serveur est la bascule de la page du lecteur, qui n'affiche le
  // document qu'une fois le statut réellement enregistré.
  const readerReady = await waitFor(async () => {
    await anonPage.goto(`${BASE}/rapport/${assessmentId}`, { waitUntil: "domcontentloaded" });
    const body = await anonPage.locator("body").innerText();
    return /synthèse/i.test(body) ? body : null;
  });
  check("Rapport marqué envoyé et publié au lecteur", Boolean(readerReady));

  const readerView = (readerReady ?? "").toLowerCase();
  check("Le destinataire lit la synthèse", has(readerView, "Synthèse"));
  check("Le destinataire lit les cinq axes", has(readerView, "Viabilité du projet"));
  check("Le destinataire lit les sources", has(readerView, "Sources et dates de vérification"));
  check("Aucune éligibilité affirmée au lecteur", !/vous êtes éligible/i.test(readerView));

  // Le résultat préliminaire mène désormais au rapport plutôt qu'à un délai.
  await anonPage.goto(`${BASE}/resultat/${assessmentId}`, { waitUntil: "networkidle" });
  check(
    "Le résultat mène au rapport une fois celui-ci envoyé",
    (await anonPage.locator(`a[href="/rapport/${assessmentId}"]`).count()) > 0
  );
}

// ── Entonnoir du questionnaire (CDC §36) ───────────────────────────────────
// Le parcours ci-dessus a émis de vrais événements : questionnaire commencé,
// écrans atteints, soumission, résultat consulté, rapport ouvert.
{
  await page.goto(`${BASE}/admin/metriques`, { waitUntil: "networkidle" });
  const metrics = await page.locator("body").innerText();

  check("Écran des métriques — section entonnoir", /Entonnoir du questionnaire/i.test(metrics));
  check(
    "L'écran dit que la mesure est anonyme",
    /aucun identifiant n['’]est enregistré/i.test(metrics)
  );
  check("Abandon par écran affiché", /Abandon par écran/i.test(metrics));

  // Les compteurs sont GLOBAUX au serveur : leur valeur absolue dépend des
  // exécutions précédentes et ne prouve rien. Ce qui prouve que la chaîne
  // fonctionne — navigateur → /api/events → base → écran — c'est qu'une
  // consultation de plus fasse monter le compteur correspondant.
  const readCount = (body, label) => {
    const found = new RegExp(`${label}\\s+(\\d+)`).exec(body);
    return found ? Number(found[1]) : null;
  };

  const before = readCount(metrics, "Résultat consulté");
  check("Compteur « Résultat consulté » lisible", before !== null, String(before));

  await anonPage.goto(`${BASE}/resultat/${assessmentId}`, { waitUntil: "networkidle" });

  // `sendBeacon` ne rend pas la main sur l'enregistrement : on attend que le
  // compteur monte, jamais un délai fixe.
  const raised = await waitFor(async () => {
    await page.goto(`${BASE}/admin/metriques`, { waitUntil: "networkidle" });
    const body = await page.locator("body").innerText();
    const after = readCount(body, "Résultat consulté");
    return after !== null && before !== null && after > before ? after : null;
  });
  check(
    "Une consultation de plus fait monter le compteur",
    Boolean(raised),
    `avant ${before}, après ${raised}`
  );

  // Le compteur des soumissions ne peut PAS être alimenté depuis le
  // navigateur : l'action redirige, `redirect()` lève, et tout appel placé
  // après elle est du code mort. Le défaut est invisible à l'œil — l'écran
  // affiche « 0 » sans rien signaler — donc il se vérifie ici, et par une
  // hausse plutôt qu'une valeur absolue : les compteurs sont globaux et une
  // base déjà remplie ferait passer l'assertion sans rien prouver.
  const submitBefore = readCount(await page.locator("body").innerText(), "Questionnaire soumis");
  check("Compteur « Questionnaire soumis » lisible", submitBefore !== null, String(submitBefore));

  const second = await browser.newContext();
  const secondPage = await second.newPage();
  await secondPage.goto(`${BASE}/diagnostic`, { waitUntil: "networkidle" });
  const beforeSecond = await secondPage.locator("body").innerText();
  await secondPage.getByRole("button", { name: "Commencer" }).click();
  await waitForTextChange(secondPage, beforeSecond);
  await answerScreens(secondPage, [
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
  ]);
  await secondPage.getByPlaceholder("Prénom").fill("Dominique");
  await secondPage.getByPlaceholder("Adresse email").fill(verifyEmail("dominique"));
  await secondPage.getByRole("button", { name: "Obtenir mon résultat" }).click();
  await secondPage.waitForURL("**/resultat/**", { timeout: 20000 });

  const submitRaised = await waitFor(async () => {
    await page.goto(`${BASE}/admin/metriques`, { waitUntil: "networkidle" });
    const body = await page.locator("body").innerText();
    const after = readCount(body, "Questionnaire soumis");
    return after !== null && submitBefore !== null && after > submitBefore ? after : null;
  });
  check(
    "Une soumission acceptée fait monter le compteur",
    Boolean(submitRaised),
    `avant ${submitBefore}, après ${submitRaised}`
  );
  await second.close();

  // Aucune part supérieure à 100 % : l'écran en affichait « 137 % » et
  // « 174 % » parce qu'il rapportait au départ des compteurs qui ne portent
  // pas sur la même population (ouvertures de page rouvertes depuis un email,
  // rapports payés antérieurs à la mesure). Lu comme un taux de conversion,
  // un tel nombre oriente une décision sur une comparaison qui n'existe pas.
  // Le titre est mis en capitales par le style, et `innerText` rend le texte
  // TEL QU'AFFICHÉ : un `indexOf` sensible à la casse renvoyait -1, donc
  // `slice(-1)` ne gardait qu'un caractère et les assertions portant sur cette
  // section passaient sur une chaîne vide.
  const funnelSectionOf = (body) => {
    const at = body.search(/Entonnoir du questionnaire/i);
    return at === -1 ? "" : body.slice(at);
  };
  {
    const section = funnelSectionOf(await page.locator("body").innerText());
    check("Section entonnoir localisée dans la page", section.length > 0);
    const parts = [...section.matchAll(/(\d+)\s%/g)].map((m) => Number(m[1]));
    check(
      "Aucune part au-dessus de 100 %",
      parts.every((p) => p <= 100),
      parts.filter((p) => p > 100).join(", ")
    );
    check("Au moins une part calculée", parts.length > 0, String(parts.length));
  }

  // Aucun identifiant ne doit apparaître sur cet écran : ni l'adresse du
  // demandeur, ni l'identifiant du diagnostic. L'entonnoir ne compte pas
  // des personnes, il compte des passages.
  const funnelSection = funnelSectionOf(await page.locator("body").innerText());
  check("Section entonnoir non vide pour le contrôle d'identifiants", funnelSection.length > 0);
  check(
    "L'entonnoir n'expose aucune adresse ni identifiant",
    !funnelSection.includes(REQUESTER_EMAIL) && !funnelSection.includes(assessmentId)
  );
}

/*
 * Écran de configuration.
 *
 * Chaque capacité du produit est fermée par défaut et s'ouvre par
 * configuration ; c'était vrai, documenté, et invisible — pour savoir si le
 * paiement était actif il fallait ouvrir une page de paiement. Trois capacités
 * s'ouvraient d'ailleurs à MOITIÉ configurées sans que rien ne le dise.
 *
 * La vérification porte sur les deux propriétés qui comptent : l'écran dit ce
 * qui manque, et il ne dit JAMAIS la valeur de ce qui est présent.
 */
{
  await page.goto(`${BASE}/admin/configuration`, { waitUntil: "networkidle" });
  const text = await page.locator("body").innerText();

  check("Écran de configuration servi", text.includes("Configuration"));

  // Le régime de vérification a une base, un secret de session et une boîte
  // aux lettres de développement : les comptes sont ouverts, l'envoi ne l'est
  // pas. L'écran doit distinguer les deux.
  check("Capacité ouverte signalée", text.includes("Comptes et espace payant"));
  check("Capacité fermée signalée", text.includes("Expédition des emails"));
  check("Ce qui manque est nommé", /Il manque\s*:/.test(text), text.match(/Il manque[^\n]*/)?.[0] ?? "");
  check(
    "Les variables absentes sont citées par leur nom",
    text.includes("RESEND_API_KEY") || text.includes("STRIPE_SECRET_KEY")
  );

  /*
   * Aucune VALEUR de variable ne doit paraître. Le contrôle porte sur les
   * secrets réellement définis dans l'environnement de la vérification : c'est
   * le seul moyen de distinguer « la page n'affiche pas de secret » de « il
   * n'y avait pas de secret à afficher ».
   */
  const secrets = [process.env.AUTH_SECRET, process.env.DATABASE_URL].filter(Boolean);
  check(
    "Aucune valeur de variable affichée",
    secrets.length > 0 && secrets.every((value) => !text.includes(value)),
    `${secrets.length} secret(s) contrôlé(s)`
  );

  // Les mentions légales manquantes relèvent de la même question : ce qui
  // reste à faire avant d'ouvrir.
  check("Mentions légales reprises", text.includes("Mentions légales"));

  // Accessible depuis la file, sans quoi personne ne la trouverait.
  await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
  check(
    "Lien depuis la file de rapports",
    (await page.getByRole("link", { name: /Configuration/ }).count()) > 0
  );
}

await browser.close();

if (failures.length) {
  console.error(`\n${failures.length} point(s) en échec.`);
  process.exit(1);
}
console.log("\n✓ Back-office et rapport : conformes.");
