#!/usr/bin/env node
/**
 * Vérification d'accessibilité (lot C).
 *
 * Deux natures de contrôle, et elles ne se remplacent pas :
 *
 * 1. **axe-core** sur les pages réellement rendues. Il attrape ce qu'aucune
 *    relecture ne voit — un contraste sous le seuil, un champ sans étiquette,
 *    un ordre de titres rompu — et il le mesure au lieu de l'estimer. C'est ce
 *    qui a motivé le ton `goldText` : le doré posé sur ivoire tenait 2,19:1
 *    pour un seuil de 4,5:1, invisible à la relecture, indiscutable à la mesure.
 *
 * 2. **Le parcours au clavier seul.** axe ne l'exerce pas : une page peut être
 *    parfaitement étiquetée et rester impraticable sans souris. Le lien
 *    d'évitement, le focus qui suit la question et la fermeture du menu par
 *    Échap se vérifient en tapant, pas en analysant l'arbre.
 *
 * Les violations retenues sont celles d'impact « serious » ou « critical ».
 * Les niveaux inférieurs remontent en avertissement : les afficher sans les
 * faire échouer dit ce qui reste à faire sans transformer la suite en bruit.
 *
 * Prérequis : serveur lancé AVEC AUTH_SECRET, ADMITTO_MAIL_LOG et
 * ADMITTO_ADMIN_EMAIL (les écrans à fond clair, ceux que le contraste
 * concerne, vivent derrière une session) + Playwright.
 * Usage : node scripts/verify-accessibilite.mjs [url-base]
 */

import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const BASE = (process.argv[2] ?? "http://127.0.0.1:3000").replace(/\/$/, "");
const ADMIN_EMAIL = process.env.ADMITTO_ADMIN_EMAIL;

if (!process.env.AUTH_SECRET) {
  console.error("✗ AUTH_SECRET absent : les zones à fond clair resteraient fermées.");
  process.exit(1);
}
if (!ADMIN_EMAIL) {
  console.error("✗ ADMITTO_ADMIN_EMAIL absent : le back-office ne serait pas contrôlé.");
  process.exit(1);
}

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.error("✗ Playwright absent. npm i -D playwright && npx playwright install chromium");
  process.exit(1);
}

const require = createRequire(import.meta.url);
const AXE_SOURCE = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

const { signInByEmail } = await import("./lib/sign-in.mjs");
const { waitForTextChange, warmUp } = await import("./lib/wait.mjs");
const { answerScreens, startQuestionnaire } = await import("./lib/questionnaire.mjs");
const { verifyEmail } = await import("./lib/identity.mjs");

const failures = [];
const check = (label, ok, detail = "") => {
  console.log(`${ok ? "✓" : "✗"} ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures.push(label);
};

const SERIOUS = new Set(["serious", "critical"]);

/**
 * Analyse la page ouverte et rend les violations.
 *
 * axe est injecté depuis le paquet local plutôt que depuis un CDN : une suite
 * de vérification qui dépend du réseau échoue pour des raisons qui n'ont rien
 * à voir avec le produit.
 */
async function analyse(page) {
  await page.evaluate(AXE_SOURCE);
  return page.evaluate(async () => {
    // `region` signale que du contenu vit hors d'un repère ; le site n'utilise
    // pas encore de repères ARIA partout, et c'est un chantier distinct de
    // celui-ci — il est écarté explicitement plutôt que masqué par un seuil.
    const results = await window.axe.run(
      {
        exclude: [
          // Numéros ornementaux des cartes « Le Défi » : « 01 », « 02 », « 03 »
          // en très pâle, qui s'allument en doré au survol. WCAG 1.4.3 exclut
          // explicitement la décoration pure, et ils n'apportent rien que
          // l'ordre des cartes ne dise déjà — ils portent `aria-hidden`, mais
          // axe mesure quand même ce qu'un œil voit, et ne peut pas savoir.
          // Exclusion NOMMÉE plutôt que seuil relevé : un seuil ferait taire
          // les vraies violations en même temps.
          ["[data-num]"],
        ],
      },
      {
        resultTypes: ["violations"],
        rules: { region: { enabled: false } },
      }
    );
    return results.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      count: violation.nodes.length,
      sample: violation.nodes[0]?.target?.join(" ") ?? "",
    }));
  });
}

/**
 * Fait défiler la page jusqu'en bas, puis revient en haut.
 *
 * Sans cela, axe ne mesure presque rien : les sections du site n'apparaissent
 * qu'une fois entrées dans le champ (`useInView`), et restent d'ici là à
 * `opacity: 0` — un élément transparent n'a pas de contraste à contrôler. La
 * première exécution rendait donc « accueil : 0 violation » alors que seul le
 * héros avait été examiné. On déclenche les révélations par le vrai chemin,
 * l'observateur d'intersection, plutôt qu'en forçant les styles.
 */
async function revealAll(page) {
  await page.evaluate(async () => {
    const pas = Math.round(window.innerHeight * 0.8);
    for (let y = 0; y < document.body.scrollHeight; y += pas) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);

    // Attendre la FIN des fondus, pas seulement leur déclenchement.
    //
    // La révélation dure 0,8 s, avec des retards échelonnés jusqu'à 0,3 s. Mesurer
    // avant qu'elle s'achève lit une couleur composée à l'opacité courante :
    // le doré #826A27 remontait en #937E45, et l'ardoise en #758194 — deux
    // « violations » qui n'existaient que pendant l'animation. La suite
    // accusait ainsi le produit d'un défaut que personne ne voit.
    await new Promise((r) => setTimeout(r, 1400));
  });

  // Filet de sécurité : si un fondu traîne encore, on le laisse finir plutôt
  // que de mesurer un état transitoire.
  await page
    .waitForFunction(
      () =>
        [...document.querySelectorAll("section, div, span, p")].every((el) => {
          const o = Number(getComputedStyle(el).opacity);
          return Number.isNaN(o) || o === 0 || o === 1;
        }),
      undefined,
      { timeout: 5000 }
    )
    .catch(() => {});
}

async function auditer(page, label, url) {
  await page.goto(`${BASE}${url}`, { waitUntil: "networkidle" });
  await revealAll(page);
  const violations = await analyse(page);
  const graves = violations.filter((v) => SERIOUS.has(v.impact));
  const mineures = violations.filter((v) => !SERIOUS.has(v.impact));

  check(
    `axe — ${label}`,
    graves.length === 0,
    graves.map((v) => `${v.id} (${v.impact}, ×${v.count}) ${v.sample}`).join(" | ")
  );
  for (const v of mineures) {
    console.log(`  · ${label} — ${v.id} (${v.impact}, ×${v.count}) : à traiter, non bloquant`);
  }
}

const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
});

const warmPage = await browser.newPage();
await warmUp(warmPage, BASE);
await warmPage.close();

// ── Pages publiques ────────────────────────────────────────────────────────
const anonymous = await browser.newContext();
const page = await anonymous.newPage();

for (const [label, url] of [
  ["accueil", "/"],
  ["diagnostic", "/diagnostic"],
  ["offres", "/offres"],
  ["faq", "/faq"],
  ["à propos", "/a-propos"],
  ["connexion", "/connexion"],
  ["mentions légales", "/mentions-legales"],
  ["confidentialité", "/confidentialite"],
  ["conditions générales", "/conditions-generales"],
]) {
  await auditer(page, label, url);
}

// ── Lien d'évitement ───────────────────────────────────────────────────────
{
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });

  // Première tabulation depuis le tout début du document : le lien d'évitement
  // doit être le premier élément atteint, sinon il n'évite rien.
  await page.keyboard.press("Tab");
  const premier = await page.evaluate(() => ({
    classe: document.activeElement?.className ?? "",
    texte: document.activeElement?.textContent?.trim() ?? "",
  }));
  check(
    "Le lien d'évitement est le premier élément focusable",
    premier.classe.includes("skip-link"),
    `${premier.classe || "(aucune classe)"} « ${premier.texte} »`
  );

  // Visible une fois focalisé : un lien annoncé mais jamais montré laisse un
  // utilisateur voyant au clavier sans repère. Le retour à l'écran se fait par
  // une transition de 0,2 s — mesurer aussitôt lisait la position de DÉPART,
  // hors cadre, et faisait échouer un lien qui fonctionnait.
  const visible = await page
    .locator(".skip-link")
    .evaluate((lien) =>
      new Promise((resolve) => {
        const limite = Date.now() + 2000;
        const regarde = () => {
          const haut = lien.getBoundingClientRect().top;
          if (haut >= 0) return resolve(true);
          if (Date.now() > limite) return resolve(haut);
          requestAnimationFrame(regarde);
        };
        regarde();
      })
    );
  check("Il devient visible au focus", visible === true, String(visible));

  await page.keyboard.press("Enter");
  const cible = await page.evaluate(() => document.activeElement?.tagName ?? "");
  check("L'activer porte le focus sur le contenu principal", cible === "MAIN", cible);
}

// ── Questionnaire au clavier seul, sans jamais cliquer ──────────────────────
{
  await page.goto(`${BASE}/diagnostic`, { waitUntil: "networkidle" });
  const avant = await page.locator("body").innerText();

  // Atteindre « Commencer » à la tabulation, puis l'activer à l'Entrée.
  let atteint = false;
  for (let i = 0; i < 25 && !atteint; i++) {
    await page.keyboard.press("Tab");
    atteint = await page.evaluate(() =>
      (document.activeElement?.textContent ?? "").trim().startsWith("Commencer")
    );
  }
  check("« Commencer » atteignable au clavier", atteint);

  await page.keyboard.press("Enter");
  await waitForTextChange(page, avant);

  // Le focus doit être sur la question, pas retombé sur le body : c'est ce qui
  // annonce l'écran à un lecteur d'écran et place la tabulation devant les
  // réponses.
  const surTitre = await page.evaluate(() => document.activeElement?.tagName ?? "");
  check("Le focus se porte sur la question", surTitre === "H2", surTitre);

  const question = await page.evaluate(() => document.activeElement?.textContent?.trim() ?? "");

  // Répondre au clavier, puis vérifier que le focus suit la question SUIVANTE.
  let repondu = false;
  for (let i = 0; i < 10 && !repondu; i++) {
    await page.keyboard.press("Tab");
    repondu = await page.evaluate(() => document.activeElement?.tagName === "BUTTON");
  }
  check("Les réponses sont atteignables depuis la question", repondu);
  await page.keyboard.press("Enter");

  // Le focus se déplace après le rendu de React, pas à la frappe : on attend
  // qu'il se pose, sans quoi on lit le bouton qu'on vient d'activer.
  const suivante = await page.waitForFunction(
    (precedente) => {
      const actif = document.activeElement;
      if (actif?.tagName !== "H2") return false;
      const texte = actif.textContent?.trim() ?? "";
      return texte && texte !== precedente ? { balise: "H2", texte } : false;
    },
    question,
    { timeout: 5000 }
  ).then(
    (handle) => handle.jsonValue(),
    async () => ({
      balise: await page.evaluate(() => document.activeElement?.tagName ?? ""),
      texte: await page.evaluate(() => document.activeElement?.textContent?.trim() ?? ""),
    })
  );
  check(
    "Le focus suit le changement d'écran",
    suivante.balise === "H2" && suivante.texte !== question,
    `${suivante.balise} « ${suivante.texte} »`
  );
}

// ── Menu mobile : Échap referme et rend le focus ───────────────────────────
{
  const mobile = await browser.newContext({ viewport: { width: 390, height: 780 } });
  const petit = await mobile.newPage();
  await petit.goto(`${BASE}/`, { waitUntil: "networkidle" });

  const burger = petit.locator(".nav-burger");
  await burger.click();
  check("Le menu s'ouvre", (await burger.getAttribute("aria-expanded")) === "true");

  await petit.keyboard.press("Escape");
  check("Échap referme le menu", (await burger.getAttribute("aria-expanded")) === "false");

  const rendu = await petit.evaluate(
    () => document.activeElement?.className?.includes?.("nav-burger") ?? false
  );
  check("Le focus revient au bouton d'ouverture", rendu === true, String(rendu));

  await mobile.close();
}

// ── Zones à fond clair : c'est là que le contraste se joue ─────────────────
{
  // Un diagnostic est nécessaire pour que l'espace payant ait quelque chose à
  // montrer : une page vide ne prouverait rien sur ses couleurs.
  const EMAIL = verifyEmail("acces");
  await page.goto(`${BASE}/diagnostic`, { waitUntil: "networkidle" });
  // Second passage dans le même contexte : le brouillon du premier est encore
  // là, et l'entrée s'appelle alors « Repartir de zéro ». Cet écran de reprise
  // est un état visuel à part — deux boutons dont un secondaire — et il
  // n'apparaît qu'après un parcours interrompu : l'audit d'ouverture ne le
  // voit jamais.
  await revealAll(page);
  const reprise = (await analyse(page)).filter((v) => SERIOUS.has(v.impact));
  check(
    "axe — diagnostic avec brouillon",
    reprise.length === 0,
    reprise.map((v) => `${v.id} (${v.impact}, ×${v.count}) ${v.sample}`).join(" | ")
  );
  await startQuestionnaire(page);
  await answerScreens(page, [
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
  await page.getByPlaceholder("Prénom").fill("Camille");
  await page.getByPlaceholder("Adresse email").fill(EMAIL);
  await page.getByRole("button", { name: "Obtenir mon résultat" }).click();

  // Un échec ici n'est pas un plantage de suite : il dit que la soumission a
  // été refusée, et le message affiché est la seule chose qui l'explique.
  // Le laisser jeter cachait la raison derrière un « Timeout exceeded ».
  let soumis = true;
  try {
    await page.waitForURL("**/resultat/**", { timeout: 20000 });
  } catch {
    soumis = false;
  }
  check("Diagnostic soumis", soumis, soumis ? "" : (await page.locator("body").innerText()).slice(0, 300));
  if (soumis) await auditer(page, "résultat", new URL(page.url()).pathname);

  const membre = await browser.newContext();
  const espace = await membre.newPage();
  if (await signInByEmail(espace, BASE, EMAIL)) {
    for (const [label, url] of [
      ["tableau de bord", "/app/dashboard"],
      ["feuille de route", "/app/roadmap"],
      ["écoles", "/app/ecoles"],
      ["simulateur", "/app/simulateur"],
      ["documents", "/app/documents"],
      ["vos données", "/app/donnees"],
    ]) {
      await auditer(espace, label, url);
    }
  } else {
    check("Connexion à l'espace payant", false);
  }
  await membre.close();

  const admin = await browser.newContext();
  const back = await admin.newPage();
  if (await signInByEmail(back, BASE, ADMIN_EMAIL)) {
    for (const [label, url] of [
      ["back-office — file", "/admin"],
      ["back-office — métriques", "/admin/metriques"],
      ["back-office — matrices", "/admin/matrices"],
    ]) {
      await auditer(back, label, url);
    }
  } else {
    check("Connexion au back-office", false);
  }
  await admin.close();
}

await browser.close();

if (failures.length) {
  console.error(`\n${failures.length} point(s) en échec.`);
  process.exit(1);
}
console.log("\n✓ Accessibilité : aucune violation sérieuse, parcours clavier praticable.");
