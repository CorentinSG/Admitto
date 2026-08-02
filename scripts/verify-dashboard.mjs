#!/usr/bin/env node
/**
 * Vérification de l'espace payant (CDC §21 à §24).
 * Contrôle la fermeture par défaut, la reprise du profil sans ressaisie, la
 * présence du Next Best Action avec ses cinq composantes, la feuille de route
 * et l'absence de gamification interdite.
 *
 * Prérequis : serveur lancé AVEC AUTH_SECRET, et Playwright.
 * Usage : AUTH_SECRET=… node scripts/verify-dashboard.mjs [url-base]
 */

const BASE = (process.argv[2] ?? "http://127.0.0.1:3000").replace(/\/$/, "");
const { verifyEmail } = await import("./lib/identity.mjs");
const EMAIL = verifyEmail("jules");

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
const { waitFor, waitForTextChange, warmUp } = await import("./lib/wait.mjs");
const { answerScreens } = await import("./lib/questionnaire.mjs");

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

// Réchauffage : la première navigation d'une suite paie sinon le démarrage
// à froid (compilation, client Prisma, Auth.js) et c'est elle qui expire.
await warmUp(page, BASE);

// ── Fermé par défaut ───────────────────────────────────────────────────────
await page.goto(`${BASE}/app/dashboard`, { waitUntil: "domcontentloaded" });
check("Espace payant fermé sans compte", page.url().includes("/connexion"), page.url());

// ── Un diagnostic est soumis ───────────────────────────────────────────────
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
await page.getByPlaceholder("Prénom").fill("Jules");
await page.getByPlaceholder("Adresse email").fill(EMAIL);
await page.getByRole("button", { name: "Obtenir mon résultat" }).click();
await page.waitForURL("**/resultat/**", { timeout: 20000 });

// ── Ouverture de l'accès depuis le résultat ────────────────────────────────
const connected = await signInByEmail(page, BASE, EMAIL);
check("Connexion par lien email", connected);
await page.goto(`${BASE}/app/dashboard`, { waitUntil: "networkidle" });
check("Accès ouvert depuis le résultat", page.url().endsWith("/app/dashboard"));

const board = await page.locator("body").innerText();
const has = (needle) => board.toLowerCase().includes(needle.toLowerCase());

// Reprise du profil sans ressaisie (CDC §10).
check("Profil repris sans ressaisie", has("Jules"));
check("Phase actuelle affichée", has("Phase actuelle"));

// Next Best Action et ses cinq composantes (CDC §23).
check("Prochaine action affichée", has("Prochaine action"));
for (const [label, needle] of [
  ["la raison", "pourquoi maintenant"],
  ["le temps nécessaire", "temps nécessaire"],
  ["la date", "à faire avant le"],
  ["le risque du retard", "risque en cas de retard"],
]) {
  check(`Next Best Action — ${label}`, has(needle));
}

// Progression, tâches, étapes clés, documents (CDC §21).
for (const section of ["Progression", "Vos tâches du moment", "Étapes clés", "Vos documents"]) {
  check(`Bloc « ${section} » présent`, has(section));
}

// Gamification limitée (CDC §24) : rien qui ressemble à un jeu.
const interdits = ["points d'expérience", "niveau ", "série ", "classement", "badge"];
check(
  "Aucune gamification interdite",
  !interdits.some((mot) => board.toLowerCase().includes(mot)),
  interdits.filter((m) => board.toLowerCase().includes(m)).join(", ")
);

// La progression ne démarre pas gonflée : rien n'est coché à la place de l'utilisateur.
check("Progression initiale à zéro", /\b0\s*%/.test(board), board.match(/\d+\s*%/)?.[0] ?? "?");

// ── Changement de statut ───────────────────────────────────────────────────
const done = page.getByRole("button", { name: "Complété" }).first();
await done.click();
// La progression est recalculée côté serveur : on attend qu'elle quitte 0 %.
const after = (await waitFor(async () => {
  const text = await page.locator("body").innerText();
  return /\b0\s*%/.test(text) ? null : text;
})) ?? (await page.locator("body").innerText());
check("Statut modifiable et progression recalculée", !/\b0\s*%/.test(after), after.match(/\d+\s*%/)?.[0] ?? "?");

// ── Timeline sur le tableau de bord aussi ──────────────────────────────────
{
  const board = (await page.locator("body").innerText()).toLowerCase();
  check("Timeline présente sur le tableau de bord", board.includes("votre timeline"));
  check("Échéances officielles sur l'axe", board.includes("échéance officielle"));
  check("Tâches à commencer désignées", board.includes("à commencer maintenant"));

  // Un losange d'échéance se sélectionne comme une pastille : son détail
  // affiche la note de l'échéance, pas une tâche. La SECONDE, pas la première :
  // deux échéances tombant le même jour se superposaient exactement, et celle
  // du dessous était incliquable — trouvé en enregistrant la démonstration.
  // L'empilement vertical corrige ; ce point l'empêche de régresser.
  const diamonds = page.locator('button[aria-label^="Échéance :"]');
  const diamond = (await diamonds.count()) > 1 ? diamonds.nth(1) : diamonds.first();
  const label = ((await diamond.getAttribute("aria-label")) ?? "").replace("Échéance : ", "");
  await diamond.click();
  check(
    "Une échéance sélectionnée montre son détail",
    Boolean(
      await waitFor(async () => {
        const text = await page
          .locator('section[aria-label="Timeline du parcours"]')
          .innerText();
        return text.includes(label.split(" — ")[0]) ? text : null;
      })
    ),
    label.split(" — ")[0]
  );
}

// ── Feuille de route ───────────────────────────────────────────────────────
await page.goto(`${BASE}/app/roadmap`, { waitUntil: "networkidle" });
const roadmap = (await page.locator("body").innerText()).toLowerCase();
check("Feuille de route affichée par phases", roadmap.includes("candidatures"));
check(
  "Tâches hors parcours signalées plutôt que masquées",
  roadmap.includes("sans objet pour votre parcours")
);
check("Aucune éligibilité affirmée", !/vous êtes éligible/i.test(roadmap));

// ── Fenêtre de la rentrée visée ────────────────────────────────────────────
// Ce profil vise « l'an prochain » : douze mois pour un calendrier qui en
// suppose quatorze. L'encart doit énoncer l'écart, nommer le cycle suivant,
// et ne rien décider à la place de la personne.
check("Fenêtre de la rentrée signalée", roadmap.includes("le temps qu'il vous reste"));
check("L'écart est chiffré", /alors que ce calendrier en suppose \d+/.test(roadmap));
check("Le retard n'est pas imputé à la personne", roadmap.includes("ce n'est pas un retard de votre fait"));
check("Le cycle suivant est nommé sans être imposé", /viser la rentrée d'août \d{4} vous rendrait/.test(roadmap));

// ── Réponse déjà donnée au questionnaire ───────────────────────────────────
// Ce profil a répondu « Test déjà passé ». Le produit le lui redit sur la
// tâche concernée — et ne coche pas à sa place (CDC §24).
check("Réponse du questionnaire redite sur la tâche", roadmap.includes("au questionnaire, vous avez répondu"));
check("Le clic reste à la personne", roadmap.includes("le produit ne le fera pas à votre place"));

// ── Timeline interactive (CDC §22) ─────────────────────────────────────────
// `roadmap` est déjà en minuscules : innerText rend le texte TEL QU'AFFICHÉ,
// donc « AUJOURD'HUI » à cause du text-transform — comparer en casse pliée.
check("Timeline affichée", roadmap.includes("votre timeline"));
check("Repère du jour planté sur l'axe", roadmap.includes("aujourd'hui"));
check("Avancement compté", /\d+ accomplie\(s\) sur \d+/.test(roadmap));

// Les losanges d'échéance portent aussi aria-pressed : les exclure, sinon le
// point « une pastille par tâche » compterait des échéances.
const dots = page.locator(
  'section[aria-label="Timeline du parcours"] button[aria-pressed]:not([aria-label^="Échéance :"])'
);
check("Une pastille par tâche datée", (await dots.count()) > 5, String(await dots.count()));

// Cliquer une pastille sélectionne SA tâche dans le détail.
const lastDot = dots.last();
const dotTitle = ((await lastDot.getAttribute("aria-label")) ?? "").split(" — ")[0];
await lastDot.click();
check(
  "La sélection au clic affiche la tâche visée",
  Boolean(
    await waitFor(async () => {
      const detail = await page
        .locator('section[aria-label="Timeline du parcours"]')
        .innerText();
      return detail.includes(dotTitle) ? detail : null;
    })
  ),
  dotTitle
);

// La timeline AVANCE quand une tâche est cochée en dessous — c'est le même
// état que la feuille de route, il n'y a pas de compteur propre à dériver.
const countBefore = Number(roadmap.match(/(\d+) accomplie\(s\)/)?.[1] ?? "0");
await page.getByRole("button", { name: "Complété", exact: true }).nth(3).click();
check(
  "La timeline avance quand une tâche est accomplie",
  Boolean(
    await waitFor(async () => {
      const text = await page.locator("body").innerText();
      const m = text.match(/(\d+) accomplie\(s\)/);
      return m && Number(m[1]) === countBefore + 1 ? m[0] : null;
    })
  )
);

check("Aucune erreur console", consoleErrors.length === 0, consoleErrors.join(" | "));

await browser.close();

if (failures.length) {
  console.error(`\n${failures.length} point(s) en échec.`);
  process.exit(1);
}
console.log("\n✓ Espace payant : conforme.");
