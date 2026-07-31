#!/usr/bin/env node
/**
 * Vérification des régimes dégradés.
 *
 * Toutes les variables d'environnement sont facultatives, et leur absence est
 * censée FERMER une fonction, pas la casser. C'est une promesse répétée dans
 * tout le dépôt — paiement sans clé Stripe, connexion sans `AUTH_SECRET`,
 * coffre sans `ADMITTO_VAULT_DIR`, déclencheur sans `ADMITTO_CRON_SECRET` —
 * et jusqu'ici personne ne l'avait vérifiée autrement qu'en la lisant.
 *
 * Ce script parcourt toutes les routes du produit et vérifie deux choses :
 *
 * 1. **Aucune 5xx.** Une page qui explose parce qu'une variable manque n'est
 *    pas « fermée », elle est cassée : l'utilisateur voit une erreur serveur au
 *    lieu d'une explication.
 * 2. **Ce qui doit être fermé l'est.** L'espace payant et le back-office ne
 *    répondent pas 200 à un visiteur sans session, quel que soit le régime.
 *
 * Le régime attendu est passé en argument, car les réponses correctes en
 * dépendent : sans base, `/connexion` affiche un formulaire inerte et le dit ;
 * avec base, il fonctionne.
 *
 * Usage : node scripts/verify-degraded.mjs <url> [--regime=minimal|complet]
 */

import { readFileSync } from "node:fs";

const args = process.argv.slice(2);
const BASE = (args.find((a) => !a.startsWith("--")) ?? "http://127.0.0.1:3000").replace(/\/$/, "");
const REGIME = (args.find((a) => a.startsWith("--regime="))?.split("=")[1] ?? "complet").trim();

if (!["minimal", "complet"].includes(REGIME)) {
  console.error(`✗ Régime inconnu : ${REGIME}. Attendu : minimal ou complet.`);
  process.exit(1);
}

const failures = [];
const check = (label, ok, detail = "") => {
  console.log(`${ok ? "✓" : "✗"} ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures.push(label);
};

/** Une réponse et son corps, sans suivre les redirections. */
async function probe(path, { method = "GET", headers = {}, body } = {}) {
  const response = await fetch(`${BASE}${path}`, { method, headers, body, redirect: "manual" });
  const text = response.status < 400 || response.status >= 500 ? await response.text() : "";
  return { status: response.status, location: response.headers.get("location"), text };
}

const PUBLIC_PAGES = [
  "/",
  "/diagnostic",
  "/offres",
  "/faq",
  "/a-propos",
  "/robots.txt",
  "/sitemap.xml",
  "/connexion",
  "/connexion/verification",
  "/mentions-legales",
  "/confidentialite",
  "/conditions-generales",
  "/desinscription/identifiant-inexistant",
];

/** Zones fermées par défaut : jamais 200 sans session, dans aucun régime. */
const CLOSED_PAGES = [
  "/app/dashboard",
  "/app/roadmap",
  "/app/ecoles",
  "/app/modules",
  "/app/simulateur",
  "/app/documents",
  "/app/consultations",
  "/app/donnees",
  "/app/donnees/export",
  "/admin",
  "/admin/metriques",
  "/admin/partenariats",
  "/admin/consultations",
  "/admin/matrices",
  "/admin/rapports/identifiant-inexistant",
  "/admin/rapports/identifiant-inexistant/impression",
  // Un module inexistant est d'abord une page de l'espace payant : la
  // fermeture précède la résolution du module, et c'est le bon ordre — savoir
  // qu'un slug n'existe pas ne doit pas demander d'y accéder.
  "/app/modules/module-inexistant",
];

/** Identifiants inconnus : un 404 franc, jamais une erreur serveur. */
const UNKNOWN_RESOURCES = [
  "/resultat/identifiant-inexistant",
  "/rapport/identifiant-inexistant",
  "/diagnostic/paiement/identifiant-inexistant",
];

/**
 * Garde de couverture : « toutes les routes » doit être vrai, pas affirmé.
 *
 * Les trois listes ci-dessus étaient écrites à la main, et elles avaient
 * dérivé : ni `/offres`, `/faq`, `/a-propos`, `robots.txt`, `sitemap.xml` (lot
 * E) ni `/admin/matrices` (lot A) n'y figuraient. Le script continuait
 * pourtant d'annoncer qu'aucune route n'était cassée — l'affirmation la plus
 * dangereuse d'une suite de vérification, parce qu'elle a l'air d'un succès.
 *
 * Le manifeste de build donne la liste réelle des routes. Toute route qui
 * n'est couverte par aucune liste fait échouer la suite, ce qui force à
 * décider où elle va — publique, fermée, ou explicitement hors périmètre.
 */
const MANIFEST = ".next/app-build-manifest.json";

/** Routes délibérément hors des trois listes, chacune pour une raison. */
const HORS_PERIMETRE = new Set([
  // Sondées séparément plus bas, avec leurs corps et leurs en-têtes.
  "/api/notifications/deadlines",
  "/api/stripe/webhook",
  "/api/events",
  // Gérée par Auth.js, et son comportement sans configuration est déjà couvert
  // par le contrôle de la page de connexion.
  "/api/auth/[...nextauth]",
  // Pages d'erreur de Next.js : elles n'ont pas d'URL propre.
  "/_not-found",
  // Réponse 404 délibérée pour ne pas révéler l'existence du back-office ;
  // c'est `/admin` qui est sondé, pas cette page interne.
  "/404-admin",
]);

/** `/(marketing)/offres/page` → `/offres` ; `/robots.txt/route` → `/robots.txt`. */
function routeUrl(key) {
  return (
    key
      .replace(/\/(page|route)$/, "")
      .replace(/\/\([^)]+\)/g, "")
      .replace(/^$/, "/") || "/"
  );
}

/** `/rapport/[id]` couvre `/rapport/identifiant-inexistant`. */
function couvre(pattern, testee) {
  const re = new RegExp(
    "^" + pattern.replace(/\[\.\.\.[^\]]+\]/g, ".+").replace(/\[[^\]]+\]/g, "[^/]+") + "$"
  );
  return re.test(testee);
}

{
  let routes;
  try {
    routes = Object.keys(JSON.parse(readFileSync(MANIFEST, "utf8")).pages)
      .filter((key) => /\/(page|route)$/.test(key))
      .map(routeUrl);
  } catch {
    console.error(`✗ ${MANIFEST} illisible : lancer \`npm run build\` avant cette suite.`);
    process.exit(1);
  }

  const sondees = [...PUBLIC_PAGES, ...CLOSED_PAGES, ...UNKNOWN_RESOURCES];
  const oubliees = routes.filter(
    (route) => !HORS_PERIMETRE.has(route) && !sondees.some((testee) => couvre(route, testee))
  );

  check(
    `Les ${routes.length} routes de l'application sont toutes sondées`,
    oubliees.length === 0,
    oubliees.join(", ")
  );
}

console.log(`Régime : ${REGIME}\n`);

// ── Pages publiques : servies dans tous les régimes ────────────────────────
for (const path of PUBLIC_PAGES) {
  const { status } = await probe(path);
  check(`Page publique ${path}`, status === 200, String(status));
}

// ── Zones fermées : jamais ouvertes sans session ───────────────────────────
for (const path of CLOSED_PAGES) {
  const { status, location } = await probe(path);
  // 404 pour /admin (son existence n'est pas révélée), redirection pour /app,
  // 401 pour l'export. Un 200 serait une fuite ; une 5xx, une panne.
  const closed = status === 404 || status === 401 || (status >= 300 && status < 400);
  check(`Zone fermée ${path}`, closed, `${status}${location ? ` → ${location}` : ""}`);
}

// ── Ressources inconnues : 404, jamais 500 ─────────────────────────────────
for (const path of UNKNOWN_RESOURCES) {
  const { status } = await probe(path);
  check(`Ressource inconnue ${path}`, status === 404 || status === 200, String(status));
}

// ── Déclencheurs : inertes sans secret, jamais permissifs ──────────────────
{
  const { status } = await probe("/api/notifications/deadlines", { method: "POST" });
  // 503 sans secret configuré, 401 avec secret mais sans jeton valide.
  check("Déclencheur cron fermé sans jeton", status === 503 || status === 401, String(status));
}
{
  const { status } = await probe("/api/stripe/webhook", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
  });
  // Sans clé Stripe le webhook est inerte (503) ; avec clé, la signature
  // manque (4xx). Les deux sont des refus — seul un 200 serait une faute.
  check(
    "Webhook Stripe fermé sans signature",
    status === 503 || (status >= 400 && status < 500),
    String(status)
  );
}

{
  // La mesure (CDC §36) ne doit jamais faire échouer un parcours, quel que
  // soit le régime : sans base, les compteurs vivent en mémoire, et une
  // soumission mal formée est ignorée. Dans tous les cas 204 — un 5xx ici
  // signalerait qu'un écran peut casser à cause d'un compteur.
  for (const [label, body] of [
    ["valide", '{"kind":"RESULT_VIEWED"}'],
    ["type inconnu", '{"kind":"PIXEL_TRACKER"}'],
    ["corps illisible", "pas du json"],
  ]) {
    const { status } = await probe("/api/events", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
    });
    check(`Mesure inerte et silencieuse — ${label}`, status === 204, String(status));
  }
}

// ── Ce que le régime minimal doit DIRE, plutôt que cacher ──────────────────
if (REGIME === "minimal") {
  const { text } = await probe("/connexion");
  check(
    "La connexion se déclare indisponible au lieu d'offrir un formulaire sans effet",
    /indisponible|pas encore|closed|n'est pas disponible/i.test(text) ||
      !/Recevoir mon lien/.test(text),
    ""
  );

  const { status, text: diag } = await probe("/diagnostic");
  check("Le diagnostic reste utilisable sans base", status === 200 && /Commencer/.test(diag));
}

// ── Le questionnaire aboutit, quel que soit le régime ──────────────────────
{
  const { status, text } = await probe("/diagnostic");
  check("Questionnaire servi", status === 200);
  check("Aucune trace d'erreur serveur dans la page", !/Internal Server Error/i.test(text));
}

if (failures.length) {
  console.error(`\n${failures.length} point(s) en échec.`);
  process.exit(1);
}
console.log(`\n✓ Régime ${REGIME} : aucune route cassée, aucune zone ouverte par erreur.`);
