#!/usr/bin/env node
/**
 * Garde-fou des skills de projet (`.claude/skills/<nom>/SKILL.md`).
 *
 * Un skill mal formé est un skill qui ne se déclenche jamais : il ne provoque
 * aucune erreur, il est simplement ignoré. Ce contrôle vérifie donc ce que le
 * runtime attend vraiment.
 *
 * Usage : node scripts/check-skills.mjs
 */
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = ".claude/skills";

if (!existsSync(ROOT)) {
  console.log("✓ check:skills — aucun skill de projet.");
  process.exit(0);
}

let errors = 0;
const names = new Set();
const skills = readdirSync(ROOT).filter((entry) => statSync(join(ROOT, entry)).isDirectory());

for (const dir of skills) {
  const path = join(ROOT, dir, "SKILL.md");

  if (!existsSync(path)) {
    console.error(`✗ ${dir} — SKILL.md manquant.`);
    errors++;
    continue;
  }

  const content = readFileSync(path, "utf8");
  const match = content.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) {
    console.error(`✗ ${dir} — frontmatter YAML absent ou mal délimité.`);
    errors++;
    continue;
  }

  const frontmatter = match[1];
  const name = frontmatter.match(/^name:\s*(.+)$/m)?.[1]?.trim();
  const description = frontmatter.match(/^description:\s*([\s\S]+?)(?=\n\w+:|$)/m)?.[1]?.trim();

  if (!name) {
    console.error(`✗ ${dir} — champ « name » manquant.`);
    errors++;
  } else if (name !== dir) {
    // Le nom doit correspondre au dossier, sinon l'invocation par /nom échoue.
    console.error(`✗ ${dir} — « name: ${name} » ne correspond pas au dossier.`);
    errors++;
  } else if (!/^[a-z0-9-]+$/.test(name)) {
    console.error(`✗ ${dir} — « name » doit être en minuscules avec des tirets.`);
    errors++;
  } else if (names.has(name)) {
    console.error(`✗ ${dir} — nom en double.`);
    errors++;
  } else {
    names.add(name);
  }

  if (!description) {
    console.error(`✗ ${dir} — champ « description » manquant.`);
    errors++;
  } else if (description.length < 60) {
    // Une description trop courte ne permet pas au modèle de savoir quand
    // déclencher le skill : elle doit décrire les cas d'usage.
    console.error(`✗ ${dir} — description trop courte (${description.length} car.) pour déclencher.`);
    errors++;
  }

  const body = content.slice(match[0].length).trim();
  if (body.length < 200) {
    console.error(`✗ ${dir} — corps trop court pour être utile.`);
    errors++;
  }
}

if (errors > 0) {
  console.error(`\n${errors} problème(s) sur les skills de projet.`);
  process.exit(1);
}
console.log(`✓ check:skills — ${skills.length} skill(s) valide(s) : ${[...names].join(", ")}.`);
