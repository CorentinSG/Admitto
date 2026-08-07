import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * L'export d'accès (RGPD art. 15) énumère les tables — il ne les résume pas.
 *
 * `exportPersonalData` inclut les relations d'`Assessment` une à une. Le jour
 * où une relation est ajoutée au modèle sans l'être à l'export, la personne
 * cesse de voir une partie de ce que le service détient sur elle, et rien ne le
 * signale : c'est exactement ce qui est arrivé à la liste d'écoles (`schools`),
 * ajoutée au schéma pour T-SEL-03 et absente de l'export pendant ce temps.
 *
 * Ce test lit LES DEUX sources — le schéma et le code de l'export — plutôt que
 * d'exécuter une requête : il attrape une relation oubliée avant qu'aucune base
 * ne soit branchée, et sans dépendre du client Prisma généré.
 */

const SCHEMA = readFileSync("prisma/schema.prisma", "utf8");
const EXPORT_SRC = readFileSync("lib/legal/personal-data.ts", "utf8");

/** Tous les noms de modèles déclarés : ce qui distingue une relation d'un scalaire. */
const MODEL_NAMES = new Set(
  [...SCHEMA.matchAll(/^model\s+(\w+)\s*\{/gm)].map((match) => match[1])
);

/** Le corps d'un modèle nommé. */
function modelBody(name: string): string {
  const match = SCHEMA.match(new RegExp(`^model\\s+${name}\\s*\\{([\\s\\S]*?)^\\}`, "m"));
  if (!match) throw new Error(`Modèle ${name} introuvable dans le schéma.`);
  return match[1];
}

/** Champs de relation d'un modèle : ceux dont le type de base est un autre modèle. */
function relationFields(name: string): string[] {
  const fields: string[] = [];
  for (const line of modelBody(name).split("\n")) {
    // Ignorer commentaires et lignes vides.
    const clean = line.replace(/\/\/.*$/, "").trim();
    const match = clean.match(/^(\w+)\s+(\w+)(\?|\[\])?/);
    if (!match) continue;
    const [, field, type] = match;
    if (MODEL_NAMES.has(type)) fields.push(field);
  }
  return fields;
}

/**
 * Relations volontairement HORS de l'export, avec la raison.
 *
 * `user` remonte vers le compte parent, déjà exporté comme `account` : l'inclure
 * sur chaque diagnostic recopierait la même personne à l'infini.
 */
const EXCLUDED: Record<string, string> = {
  user: "compte parent, exporté séparément comme `account`",
};

describe("complétude de l'export d'accès (RGPD art. 15)", () => {
  it("chaque relation d'Assessment est exportée, ou explicitement exclue", () => {
    // Le bloc `include: { ... }` de la requête d'export.
    const includeBlock = EXPORT_SRC.match(/include:\s*\{([\s\S]*?)\n {4}\},/)?.[1] ?? "";
    const included = new Set(
      [...includeBlock.matchAll(/^\s*(\w+):/gm)].map((match) => match[1])
    );

    const manquantes = relationFields("Assessment").filter(
      (field) => !included.has(field) && !(field in EXCLUDED)
    );

    expect(
      manquantes,
      `Relations d'Assessment ni exportées ni exclues : ${manquantes.join(", ")}. ` +
        `Ajoutez-les à l'include de exportPersonalData, ou à EXCLUDED avec une raison.`
    ).toEqual([]);
  });

  it("la liste d'écoles, en particulier, fait partie de l'export", () => {
    // Le cas qui a motivé le garde-fou : une régression silencieuse aurait à
    // nouveau l'air d'un export complet.
    expect(relationFields("Assessment")).toContain("schools");
    expect(EXPORT_SRC).toMatch(/schools:\s*true/);
  });

  it("tout ce qui est exclu porte une raison", () => {
    for (const [field, reason] of Object.entries(EXCLUDED)) {
      expect(reason.length, field).toBeGreaterThan(10);
    }
  });
});
