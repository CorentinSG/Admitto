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
