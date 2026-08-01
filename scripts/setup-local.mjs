#!/usr/bin/env node
/**
 * Préparation d'un poste de développement.
 *
 * Écrit `.env.local` à partir de `.env.example` en remplissant les valeurs
 * qu'une machine peut décider seule : les deux secrets aléatoires, l'URL
 * locale, et les deux répertoires de travail. Les valeurs qui engagent un
 * service tiers (Resend, Stripe) restent vides — sans elles le produit tourne
 * en régime Phase 1A, ce qui est le régime voulu en développement.
 *
 * Le script est IDEMPOTENT et n'écrase JAMAIS une valeur déjà renseignée :
 * relancé sur un poste configuré, il n'ajoute que les clés manquantes. Un
 * secret régénéré à chaque exécution invaliderait les sessions ouvertes, et un
 * DATABASE_URL réécrit ferait pointer le poste vers une autre base sans le dire.
 *
 * Usage :
 *   node scripts/setup-local.mjs [--admin=adresse@exemple.fr] [--with-db]
 *
 *   --admin=…   adresse élevée au rôle ADMIN à sa première connexion.
 *   --with-db   renseigne DATABASE_URL vers la base du docker-compose fourni.
 */
import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const EXAMPLE = join(ROOT, ".env.example");
const TARGET = join(ROOT, ".env.local");

/** Répertoire des fichiers de travail locaux (coffre, boîte aux lettres). */
const WORK_DIR = ".admitto-local";

/** Même chaîne que la base du docker-compose : les deux doivent bouger ensemble. */
const DOCKER_DATABASE_URL = "postgresql://admitto:admitto@localhost:5432/admitto";

const NODE_MINIMUM = 20;

const args = process.argv.slice(2);
const flag = (name) =>
  args
    .find((a) => a.startsWith(`--${name}=`))
    ?.split("=")
    .slice(1)
    .join("=");
const has = (name) => args.includes(`--${name}`);

/* ── Version de Node ───────────────────────────────────────────────────────
 * Next.js 15 exige Node 20. Le dire ici évite un échec de build obscur trois
 * commandes plus loin. */
const major = Number(process.versions.node.split(".")[0]);
if (major < NODE_MINIMUM) {
  console.error(
    `✗ Node ${process.versions.node} détecté — Node ${NODE_MINIMUM}+ est requis (CI : Node 22).`
  );
  process.exit(1);
}

if (!existsSync(EXAMPLE)) {
  console.error("✗ .env.example introuvable — lancer ce script depuis la racine du dépôt.");
  process.exit(1);
}

/** Valeurs que ce script sait décider seul. */
const secret = () => randomBytes(32).toString("hex");
const DECIDED = {
  AUTH_SECRET: secret(),
  ADMITTO_CRON_SECRET: secret(),
  ADMITTO_BASE_URL: "http://localhost:3000",
  ADMITTO_MAIL_LOG: `${WORK_DIR}/mail.log`,
  ADMITTO_VAULT_DIR: `${WORK_DIR}/vault`,
};
if (flag("admin")) DECIDED.ADMITTO_ADMIN_EMAILS = flag("admin");
if (has("with-db")) DECIDED.DATABASE_URL = DOCKER_DATABASE_URL;

/**
 * Lit les clés déjà renseignées d'un fichier d'environnement.
 * Une clé présente mais vide compte comme NON renseignée : `.env.example` les
 * porte toutes vides, et c'est précisément ce qu'on vient remplir.
 */
function filled(text) {
  const values = new Map();
  for (const line of text.split("\n")) {
    const match = /^\s*([A-Z0-9_]+)\s*=(.*)$/.exec(line);
    if (match && match[2].trim() !== "") values.set(match[1], match[2].trim());
  }
  return values;
}

const existing = existsSync(TARGET) ? readFileSync(TARGET, "utf8") : null;
const source = existing ?? readFileSync(EXAMPLE, "utf8");
const already = filled(source);

const written = [];
const kept = [];

/** Remplace `CLE=` par `CLE=valeur`, sans toucher aux lignes déjà renseignées. */
let output = source
  .split("\n")
  .map((line) => {
    const match = /^([A-Z0-9_]+)=(.*)$/.exec(line);
    if (!match) return line;
    const [, key, value] = match;
    if (value.trim() !== "") {
      if (key in DECIDED) kept.push(key);
      return line;
    }
    if (!(key in DECIDED)) return line;
    written.push(key);
    return `${key}=${DECIDED[key]}`;
  })
  .join("\n");

/* Un `.env.local` déjà présent peut être plus ancien que `.env.example` : les
 * clés qu'il ignore sont ajoutées en fin de fichier plutôt que perdues. */
const missing = Object.keys(DECIDED).filter((k) => !already.has(k) && !written.includes(k));
if (missing.length > 0) {
  output += `\n# Ajouté par npm run setup:local\n${missing.map((k) => `${k}=${DECIDED[k]}`).join("\n")}\n`;
  written.push(...missing);
}

writeFileSync(TARGET, output, { mode: 0o600 });

/* Les deux répertoires de travail : sans eux, le coffre refuse les dépôts et le
 * transport « console » n'a nulle part où écrire. */
mkdirSync(join(ROOT, WORK_DIR, "vault"), { recursive: true });

console.log(`${existing ? "✓ .env.local mis à jour" : "✓ .env.local créé"} (permissions 600)`);
if (written.length > 0) console.log(`  renseigné : ${written.join(", ")}`);
if (kept.length > 0) console.log(`  conservé (valeur existante) : ${kept.join(", ")}`);
console.log(`✓ ${WORK_DIR}/vault créé (coffre local) — répertoire ignoré par git`);

if (!already.has("DATABASE_URL") && !has("with-db")) {
  console.log(
    "\nℹ DATABASE_URL reste vide : les données vivent dans la mémoire du processus\n" +
      "  et disparaissent à chaque redémarrage. Pour une vraie base :\n" +
      "    docker compose up -d db && node scripts/setup-local.mjs --with-db && npm run db:deploy"
  );
}
if (!already.has("ADMITTO_ADMIN_EMAILS") && !flag("admin")) {
  console.log(
    "\nℹ Aucun administrateur amorcé : /admin répondra 404. Pour en amorcer un :\n" +
      "    node scripts/setup-local.mjs --admin=votre.adresse@exemple.fr"
  );
}
console.log("\nProchaine étape : npm run dev  →  http://localhost:3000");
