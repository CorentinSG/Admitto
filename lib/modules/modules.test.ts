import { describe, expect, it } from "vitest";
import { MODULES, PRODUCTION_ORDER, findModule, isModulePublished } from "@/content/modules";
import { isPublishable, publicationBlockers, readingMinutes } from "./types";
import { TASK_TEMPLATES } from "@/content/roadmap-tasks";

/**
 * Garde-fou des modules (CDC §25).
 *
 * Écrit en test plutôt qu'en script `check:*` : la contrainte porte sur des
 * sections imbriquées, et l'extraction textuelle qui convient à
 * `rules.seed.ts` deviendrait ici une source d'erreurs à elle seule. Le type
 * `ModuleSection` interdit déjà, à la compilation, d'énoncer une règle
 * officielle sans objet source ; ce fichier vérifie ce que le type ne peut pas
 * voir — une source vide, une date absente, un module publié à blanc.
 */

describe("catalogue", () => {
  it("n'a ni slug ni ordre en double", () => {
    expect(new Set(MODULES.map((m) => m.slug)).size).toBe(MODULES.length);
    expect(new Set(MODULES.map((m) => m.order)).size).toBe(MODULES.length);
  });

  it("couvre les onze modules du CDC §25", () => {
    expect(MODULES).toHaveLength(11);
    expect([...MODULES].map((m) => m.order).sort((a, b) => a - b)).toEqual([
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    ]);
  });

  it("respecte l'ordre de production imposé", () => {
    expect([...PRODUCTION_ORDER]).toEqual([
      "module-0-decision",
      "module-2-choisir",
      "module-5-bole",
      "module-6-bar",
    ]);
    for (const slug of PRODUCTION_ORDER) {
      expect(findModule(slug), slug).not.toBeNull();
    }
  });

  it("annonce une durée de lecture plausible", () => {
    for (const entry of MODULES) {
      // La durée est dérivée du texte, elle ne peut donc plus être fausse ;
      // ce qui reste à vérifier est qu'elle demeure plausible.
      expect(readingMinutes(entry), entry.slug).toBeGreaterThan(0);
      expect(readingMinutes(entry), entry.slug).toBeLessThanOrEqual(60);
    }
  });
});

describe("sourçage (même discipline que le Moteur A)", () => {
  it("aucun module publié ne présente de motif de blocage", () => {
    for (const entry of MODULES.filter((m) => m.published)) {
      expect(publicationBlockers(entry), entry.slug).toEqual([]);
    }
  });

  it("un module publié dont une section officielle perd sa source cesse d'être publiable", () => {
    const tampered = {
      ...MODULES[0],
      sections: [
        {
          kind: "OFFICIAL_RULE" as const,
          id: "faux",
          title: "Règle officielle",
          body: ["Un délai est de trente jours."],
          source: { label: "Autorité", url: "", verifiedAt: "" },
        },
      ],
    };
    expect(isPublishable(tampered)).toBe(false);
    expect(publicationBlockers(tampered)).toHaveLength(2);
  });

  it("refuse une source qui n'est pas une URL officielle en https", () => {
    const tampered = {
      ...MODULES[0],
      sections: [
        {
          kind: "OFFICIAL_RULE" as const,
          id: "faux",
          title: "Règle officielle",
          body: ["Texte."],
          source: { label: "Autorité", url: "http://exemple.test", verifiedAt: "2026-07-29" },
        },
      ],
    };
    expect(isPublishable(tampered)).toBe(false);
  });

  it("refuse un module publié sans contenu", () => {
    expect(isPublishable({ ...MODULES[0], sections: [] })).toBe(false);
    expect(
      isPublishable({
        ...MODULES[0],
        sections: [{ kind: "METHOD", id: "vide", title: "Section vide", body: [] }],
      })
    ).toBe(false);
  });
});

describe("publication effective", () => {
  /**
   * Liste attendue, tenue à jour à chaque module rédigé.
   *
   * Une liste figée plutôt qu'un simple `filter` : elle transforme la
   * publication d'un module en geste explicite. Sans elle, un `published: true`
   * posé par mégarde sur un plan à moitié écrit passerait au vert dès que les
   * sections cesseraient d'être vides, sans que personne l'ait décidé.
   */
  const LISIBLES = [
    "module-0-decision",
    "module-1-career",
    "module-3-candidatures",
    "module-9-recherche",
    "module-10-suite",
  ];

  it("seuls les modules rédigés sont lisibles", () => {
    const readable = MODULES.filter((m) => isModulePublished(m.slug)).map((m) => m.slug);
    expect(readable).toEqual(LISIBLES);
  });

  it("les modules en production ne sont jamais annoncés comme lisibles", () => {
    // Leur plan comporte des sections vides et, le cas échéant, des sources à
    // renseigner : `published` seul ne suffirait pas à les ouvrir.
    for (const entry of MODULES.filter((m) => !LISIBLES.includes(m.slug))) {
      expect(isModulePublished(entry.slug), entry.slug).toBe(false);
      expect(publicationBlockers(entry).length, entry.slug).toBeGreaterThan(0);
    }
  });

  it("chaque module lisible a du contenu dans toutes ses sections", () => {
    // Le garde-fou le vérifie déjà, mais il est appelé au rendu : ce test
    // échoue au commit, pas devant un lecteur.
    for (const entry of MODULES.filter((m) => LISIBLES.includes(m.slug))) {
      for (const section of entry.sections) {
        expect(section.body.length, `${entry.slug} / ${section.id}`).toBeGreaterThan(0);
      }
    }
  });

  it("un slug inconnu n'est jamais publié", () => {
    expect(isModulePublished("module-inexistant")).toBe(false);
    expect(isModulePublished(undefined)).toBe(false);
  });
});

describe("rattachement à la feuille de route (CDC §25)", () => {
  it("chaque tâche qui cite un module cite un module qui existe", () => {
    for (const template of TASK_TEMPLATES) {
      if (!template.moduleSlug) continue;
      expect(findModule(template.moduleSlug), template.id).not.toBeNull();
    }
  });
});
