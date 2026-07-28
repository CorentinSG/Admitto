import { describe, expect, it } from "vitest";
import { computeScenario, monthlyLiving, compareNet, formatUsd } from "./compute";
import { applyCityPreset, CITY_PRESETS, defaultInputs } from "./defaults";
import { CITIES, MAX_SCENARIOS, type ScenarioInputs } from "./types";

const base = (over: Partial<ScenarioInputs> = {}): ScenarioInputs => ({
  ...defaultInputs("Test"),
  ...over,
});

describe("simulateur de coût (CDC §26)", () => {
  it("produit les six sorties imposées", () => {
    const out = computeScenario(base());
    for (const key of ["academic", "living", "bar", "postGraduation", "total", "net"] as const) {
      expect(out[key]).toBeGreaterThanOrEqual(0);
    }
  });

  it("fait du total la somme exacte des quatre postes", () => {
    const out = computeScenario(base());
    expect(out.total).toBe(out.academic + out.living + out.bar + out.postGraduation);
  });

  it("déduit bourses et partenariats du coût net", () => {
    const sans = computeScenario(base());
    const avec = computeScenario(base({ scholarships: 20_000, partnerships: 5_000 }));
    expect(avec.net).toBe(sans.total - 25_000);
    // Le total, lui, ne bouge pas : c'est bien le coût net qui absorbe l'aide.
    expect(avec.total).toBe(sans.total);
  });

  it("ne rend jamais un coût net négatif", () => {
    const out = computeScenario(base({ scholarships: 10_000_000 }));
    expect(out.net).toBe(0);
  });

  it("valorise la période sans revenu au coût de vie mensuel réel", () => {
    const inputs = base({ noIncomeMonths: 0 });
    const sans = computeScenario(inputs);
    const avec = computeScenario({ ...inputs, noIncomeMonths: 6 });
    expect(avec.postGraduation - sans.postGraduation).toBe(monthlyLiving(inputs) * 6);
  });

  it("multiplie les postes mensuels par la durée du séjour", () => {
    const court = computeScenario(base({ studyMonths: 10 }));
    const long = computeScenario(base({ studyMonths: 20 }));
    expect(long.living - court.living).toBe(monthlyLiving(base()) * 10);
  });

  it("intègre le budget de repassage au coût du barreau", () => {
    const sans = computeScenario(base({ retake: 0 }));
    const avec = computeScenario(base({ retake: 4_000 }));
    expect(avec.bar - sans.bar).toBe(4_000);
  });

  it("ignore les montants négatifs saisis par erreur", () => {
    const out = computeScenario(base({ tuition: -50_000, studyMonths: -3 }));
    expect(out.academic).toBe(computeScenario(base({ tuition: 0 })).academic);
    expect(out.living).toBeGreaterThanOrEqual(0);
  });

  it("couvre les dix-sept postes du cahier des charges", () => {
    // Chaque poste doit influencer au moins une sortie : un champ sans effet
    // serait un champ décoratif.
    const reference = computeScenario(base());
    const postes: Array<[keyof ScenarioInputs, number]> = [
      ["tuition", 1_000],
      ["universityFees", 1_000],
      ["lsac", 1_000],
      ["translations", 1_000],
      ["housingMonthly", 100],
      ["dailyLivingMonthly", 100],
      ["transportMonthly", 100],
      ["insurance", 1_000],
      ["visa", 1_000],
      ["travel", 1_000],
      ["barPrep", 1_000],
      ["exams", 1_000],
      ["retake", 1_000],
      ["admission", 1_000],
      ["noIncomeMonths", 1],
      ["studyMonths", 1],
    ];
    for (const [champ, delta] of postes) {
      const modifie = computeScenario(base({ [champ]: (base()[champ] as number) + delta }));
      expect(modifie.total, `le poste « ${champ} » n'a aucun effet`).toBeGreaterThan(reference.total);
    }
    // Les deux ressources agissent en sens inverse, sur le net.
    for (const ressource of ["scholarships", "partnerships"] as const) {
      const modifie = computeScenario(base({ [ressource]: 5_000 }));
      expect(modifie.net).toBeLessThan(reference.net);
    }
  });
});

describe("villes et valeurs de départ", () => {
  it("propose un préréglage pour chaque ville", () => {
    for (const city of CITIES) {
      expect(CITY_PRESETS[city].label.length).toBeGreaterThan(0);
      expect(CITY_PRESETS[city].housingMonthly).toBeGreaterThan(0);
    }
  });

  it("applique un préréglage sans écraser les autres saisies", () => {
    const inputs = base({ tuition: 42_000, scholarships: 9_000 });
    const applied = applyCityPreset(inputs, "CHICAGO");
    expect(applied.housingMonthly).toBe(CITY_PRESETS.CHICAGO.housingMonthly);
    expect(applied.tuition).toBe(42_000);
    expect(applied.scholarships).toBe(9_000);
  });

  it("fait varier le coût de la vie selon la ville", () => {
    const ny = computeScenario(applyCityPreset(base(), "NEW_YORK"));
    const autre = computeScenario(applyCityPreset(base(), "OTHER"));
    expect(ny.living).toBeGreaterThan(autre.living);
  });
});

describe("comparaison de scénarios", () => {
  it("compare sur le coût net", () => {
    const cher = computeScenario(base({ tuition: 80_000 }));
    const abordable = computeScenario(base({ tuition: 30_000 }));
    expect(compareNet(cher, abordable)).toBe(50_000);
  });

  it("limite la comparaison à trois scénarios", () => {
    expect(MAX_SCENARIOS).toBe(3);
  });

  it("formate les montants en dollars", () => {
    expect(formatUsd(60_000)).toMatch(/\$/);
  });
});
