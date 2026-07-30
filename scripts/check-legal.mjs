#!/usr/bin/env node
/**
 * Garde-fou des pages légales (revue §A1).
 *
 * Une politique de confidentialité se périme sans bruit : on ajoute une table,
 * on stocke une donnée de plus, et le texte publié continue d'affirmer une
 * liste qui n'est plus la bonne. Personne ne le remarque, parce que rien ne
 * casse.
 *
 * Ce script fait deux choses qu'aucun test unitaire ne peut faire :
 *
 * 1. Il compare les modèles de `prisma/schema.prisma` à ce que la politique
 *    déclare. Tout modèle nouveau doit être soit couvert par une ligne du
 *    tableau des traitements, soit inscrit ici comme hors périmètre avec le
 *    motif. Ajouter une table sans toucher au texte échoue.
 *
 * 2. Il vérifie que chaque document légal a bien une page servie à l'adresse
 *    vers laquelle le pied de page renvoie — un lien vers un 404 est pire
 *    qu'une absence de lien.
 *
 * Usage : node scripts/check-legal.mjs
 */
import { existsSync, readFileSync } from "node:fs";

const SCHEMA = "prisma/schema.prisma";
const POLICY = "content/legal.ts";
const HELD = "content/donnees.ts";

/**
 * Modèles couverts par la politique : modèle → fragment attendu dans le
 * tableau des traitements. Le fragment est cherché tel quel dans `legal.ts` ;
 * réécrire la ligne sans conserver ce repère fait échouer le script, ce qui
 * est l'effet voulu — c'est le moment de vérifier que la nouvelle rédaction
 * dit toujours la même chose.
 */
const COVERED = {
  User: "Prénom et adresse email",
  Assessment: "Réponses au questionnaire",
  Report: "blocs de rapport",
  Correction: "permettre sa relecture avant envoi",
  TaskStatus: "statut de vos tâches",
  Scenario: "scénarios de simulation",
  MilestoneAward: "jalons atteints",
  SchoolChoice: "Votre liste d'écoles",
  Document: "Documents déposés dans le coffre",
  SentNotice: "Rappels d'échéance déjà envoyés",
  Booking: "Séances réservées",
  ConsultationSlot: "Séances réservées",
  Entitlement: "solde de séances",
  Session: "Jetons de connexion et sessions",
  Account: "Jetons de connexion et sessions",
  VerificationToken: "Jetons de connexion et sessions",
  RateLimitHit: "formulaires publics",
};

/** Modèles délibérément hors du tableau, avec le motif. */
const OUT_OF_SCOPE = {};

const failures = [];
const fail = (message) => failures.push(message);

// ── 1. Schéma ↔ politique ──────────────────────────────────────────────────

const schema = readFileSync(SCHEMA, "utf8");
const policy = readFileSync(POLICY, "utf8");

const models = [...schema.matchAll(/^model\s+(\w+)\s*\{/gm)].map((m) => m[1]);
if (models.length === 0) fail(`${SCHEMA} : aucun modèle trouvé — le script ne vérifie plus rien.`);

for (const model of models) {
  const fragment = COVERED[model];
  if (!fragment) {
    if (model in OUT_OF_SCOPE) continue;
    fail(
      `Modèle « ${model} » absent de la politique de confidentialité.\n` +
        `  Ajouter une ligne au tableau des traitements de ${POLICY}, puis le repère ` +
        `correspondant dans COVERED de ce script — ou l'inscrire dans OUT_OF_SCOPE avec le motif.`
    );
    continue;
  }
  if (!policy.includes(fragment)) {
    fail(
      `Modèle « ${model} » : le repère « ${fragment} » n'apparaît plus dans ${POLICY}.\n` +
        `  Le traitement a-t-il été retiré du tableau, ou seulement reformulé ?`
    );
  }
}

// Un repère laissé dans COVERED pour un modèle supprimé fait croire à une
// couverture qui ne correspond plus à rien.
for (const model of Object.keys(COVERED)) {
  if (!models.includes(model)) {
    fail(`COVERED cite « ${model} », absent de ${SCHEMA} — repère à retirer.`);
  }
}

// ── 2. Chaque document a sa page ───────────────────────────────────────────

const slugs = [...policy.matchAll(/^\s*slug:\s*"([a-z-]+)"/gm)].map((m) => m[1]);
if (slugs.length === 0) fail(`${POLICY} : aucun document trouvé.`);

for (const slug of slugs) {
  const page = `app/(marketing)/${slug}/page.tsx`;
  if (!existsSync(page)) {
    fail(`Document « ${slug} » sans page : ${page} est attendu.`);
  }
}

// ── 3. La liste affichée à l'utilisateur n'est pas vide ────────────────────

const held = readFileSync(HELD, "utf8");
const heldCount = (held.match(/^\s{2}"/gm) ?? []).length;
if (heldCount < models.length / 2) {
  fail(
    `${HELD} : la liste « ce qui est enregistré » compte ${heldCount} entrées pour ` +
      `${models.length} modèles — elle a probablement cessé de suivre le schéma.`
  );
}

// ── Verdict ────────────────────────────────────────────────────────────────

if (failures.length) {
  for (const failure of failures) console.error(`✗ ${failure}`);
  console.error(`\n${failures.length} point(s) en échec.`);
  process.exit(1);
}
console.log(
  `✓ Pages légales : ${models.length} modèles couverts, ${slugs.length} documents servis.`
);
