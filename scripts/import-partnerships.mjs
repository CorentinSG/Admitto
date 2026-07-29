#!/usr/bin/env node
/**
 * Import de la base de partenariats depuis le dépôt `corentinsg/llm-partnerships`
 * vers `content/partnerships.generated.ts` (CDC §27).
 *
 * Le fichier généré est COMMITÉ : la donnée est un actif du produit, pas une
 * dépendance de build. Relancer l'import après une mise à jour de la source.
 *
 * Usage : node scripts/import-partnerships.mjs <chemin-du-depot-source>
 *
 * Traduction des champs :
 * - `reliabilityStatus` gouverne `active` — seules les fiches « confirmed »
 *   sont opposables à un utilisateur ; « to_confirm » est conservé comme piste
 *   à vérifier, « incomplete » est importé mais inactif ;
 * - `verifiedAt` reçoit la date de l'instantané source, faute d'une date de
 *   vérification par fiche : c'est la seule affirmation honnête possible ;
 * - `requiredLevel`, champ libre dans la source, est normalisé en niveau
 *   minimal comparable au diplôme déclaré au questionnaire.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";

const SOURCE_REPO = "https://github.com/corentinsg/llm-partnerships";
const root = process.argv[2] ?? "/workspace/llm-partnerships";
const dataPath = join(root, "llm-partnerships/data/database.json");

const db = JSON.parse(readFileSync(dataPath, "utf8"));

let commit = "inconnu";
try {
  commit = execSync(`git -C ${root} rev-parse HEAD`, { encoding: "utf8" }).trim();
} catch {
  // dépôt source absent de l'historique : on garde « inconnu »
}
const snapshotDate = new Date().toISOString().slice(0, 10);

/**
 * Niveau minimal requis, normalisé. La source décrit le niveau en texte libre
 * (« M2 », « M1 ou M2 en droit », « Au moins 4 années… »). On ne retient que le
 * plancher, et `null` quand la source ne permet pas de trancher — un niveau
 * inventé exclurait ou inclurait à tort un candidat.
 */
function normalizeLevel(raw) {
  if (!raw || /non communiqu/i.test(raw)) return null;
  const text = raw.toLowerCase();
  if (/\bm1\b/.test(text)) return "M1"; // « M1 ou M2 » ⇒ plancher M1
  if (/4 ann[ée]es/.test(text)) return "M1"; // quatre années validées ≈ M1
  if (/\bm2\b|master 2|fin de master/.test(text)) return "M2";
  if (/master/.test(text)) return "M2";
  return null;
}

const partnerships = db.partnerships
  .filter((p) => p.partnerCountry === "États-Unis")
  .map((p) => ({
    id: p.id,
    frenchUniversityId: p.frenchUniversityId,
    frenchUniversity: p.frenchUniversity,
    usLawSchool: p.partnerUniversity,
    city: clean(p.partnerCity),
    state: clean(p.partnerState),
    partnershipType: p.partnershipType,
    tuitionCategory: p.tuitionCategory,
    tuitionDisplay: clean(p.tuitionDisplay),
    financialAid: clean(p.financialAid),
    seatsDisplay: clean(p.availableSeatsDisplay),
    seatsMin: p.availableSeatsMin ?? null,
    seatsMax: p.availableSeatsMax ?? null,
    requiredLevel: normalizeLevel(p.requiredLevel),
    requiredLevelRaw: clean(p.requiredLevel),
    programLanguage: clean(p.programLanguage),
    duration: clean(p.duration),
    specialties: p.specialties ?? [],
    admissionConditions: clean(p.admissionConditions),
    languageTests: (p.languageTests ?? []).map((t) => ({
      test: t.test,
      minimumScore: t.minimumScore,
      details: clean(t.details),
    })),
    applicationDeadline: clean(p.applicationDeadline),
    shortDescription: clean(p.shortDescription),
    officialLink: p.officialLink || null,
    reliability: p.reliabilityStatus,
    missingInformation: p.missingInformation ?? [],
    notes: clean(p.notes),
    // Seule une fiche confirmée est opposable à un utilisateur.
    active: p.reliabilityStatus === "confirmed",
    verifiedAt: snapshotDate,
  }))
  .sort((a, b) => a.id.localeCompare(b.id));

/** « Non communiqué » n'est pas une information : on le remplace par null. */
function clean(value) {
  if (!value || value === db.unknownValue || /^non communiqu/i.test(value)) return null;
  return value;
}

const universities = db.frenchUniversities
  .map((u) => ({ id: u.id, name: u.name, city: u.city }))
  .sort((a, b) => a.name.localeCompare(b.name, "fr"));

const header = `/**
 * ⚠️ FICHIER GÉNÉRÉ — ne pas modifier à la main.
 * Régénérer avec : node scripts/import-partnerships.mjs <chemin-du-depot-source>
 *
 * Source   : ${SOURCE_REPO}
 * Commit   : ${commit}
 * Importé  : ${snapshotDate}
 *
 * Base de partenariats entre universités françaises et law schools américaines
 * (CDC §27). Seules les fiches « confirmed » sont actives, c'est-à-dire
 * affichables à un utilisateur ; les fiches « to_confirm » et « incomplete »
 * sont conservées comme pistes de vérification et restent inactives.
 *
 * \`verifiedAt\` porte la date de l'instantané source, pas une vérification
 * fiche par fiche : c'est la seule affirmation que la donnée permet.
 */
`;

const output =
  header +
  `import type { Partnership, PartnerUniversity } from "@/lib/partnerships/types";\n\n` +
  `export const IMPORT_SOURCE = ${JSON.stringify(
    { repo: SOURCE_REPO, commit, importedAt: snapshotDate },
    null,
    2
  )} as const;\n\n` +
  `export const FRENCH_UNIVERSITIES_DATA: PartnerUniversity[] = ${JSON.stringify(
    universities,
    null,
    2
  )};\n\n` +
  `export const PARTNERSHIPS_DATA: Partnership[] = ${JSON.stringify(partnerships, null, 2)};\n`;

writeFileSync("content/partnerships.generated.ts", output);

const actives = partnerships.filter((p) => p.active).length;
console.log(
  `✓ ${partnerships.length} partenariats importés (${actives} confirmés, ${
    partnerships.length - actives
  } à vérifier) sur ${universities.length} universités — commit ${commit.slice(0, 8)}.`
);
