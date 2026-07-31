import { describe, expect, it } from "vitest";
import {
  allowsTooEarlyGoal,
  careerGoalOptions,
  isAlreadyEnrolled,
  needsVisaBranch,
  progress,
  showsForeignBarScreen,
  visibleScreens,
  CONDITIONAL_SCREENS,
  isConditionalScreen,
} from "./visibility";
import { CAREER_GOAL, SCREEN_IDS, type Answers, type ScreenId } from "./types";

describe("logique conditionnelle du questionnaire (CDC §12.4)", () => {
  it("n'affiche l'écran barreau étranger que lorsqu'il est pertinent", () => {
    expect(showsForeignBarScreen({ status: "LAWYER_EXPLORING" })).toBe(true);
    expect(showsForeignBarScreen({ status: "TARGETING_BAR" })).toBe(true);
    expect(showsForeignBarScreen({ education: "CAPA" })).toBe(true);
    expect(showsForeignBarScreen({ status: "EXPLORING_LLM", education: "M1" })).toBe(false);
  });

  it("propose « trop tôt pour le dire » aux profils en licence", () => {
    expect(allowsTooEarlyGoal({ education: "LICENCE" })).toBe(true);
    expect(careerGoalOptions({ education: "LICENCE" }, CAREER_GOAL)).toContain("TOO_EARLY");
    expect(careerGoalOptions({ education: "M2", status: "APPLYING" }, CAREER_GOAL)).not.toContain(
      "TOO_EARLY"
    );
  });

  it("identifie une personne déjà admise ou inscrite", () => {
    expect(isAlreadyEnrolled({ status: "ADMITTED_OR_ENROLLED" })).toBe(true);
    expect(isAlreadyEnrolled({ status: "APPLYING" })).toBe(false);
  });

  it("supprime les branches visa pour un double national américain", () => {
    expect(needsVisaBranch({ usStatus: "US_DUAL_NATIONAL" })).toBe(false);
    expect(needsVisaBranch({ usStatus: "FR_NO_STATUS" })).toBe(true);
  });

  it("ne dépasse jamais douze écrans visibles (CDC §12.2)", () => {
    const maximal = visibleScreens({ status: "LAWYER_EXPLORING", education: "CAPA" });
    expect(maximal.length).toBeLessThanOrEqual(12);
    expect(maximal).toContain("foreignBar");

    const minimal = visibleScreens({ status: "EXPLORING_LLM", education: "M1" });
    expect(minimal.length).toBe(11);
    expect(minimal).not.toContain("foreignBar");
  });

  it("calcule une progression cohérente avec les écrans réellement visibles", () => {
    expect(progress({ status: "EXPLORING_LLM", education: "M1" }, "contact")).toEqual({
      step: 11,
      total: 11,
    });
    expect(progress({ status: "LAWYER_EXPLORING" }, "contact")).toEqual({ step: 12, total: 12 });
  });
});

describe("écrans conditionnels", () => {
  /**
   * `CONDITIONAL_SCREENS` sert à l'entonnoir (CDC §36) pour savoir à quel
   * écran comparer celui qu'il mesure. Si la liste et `visibleScreens`
   * divergent, l'entonnoir compare un écran à un écran que tout le monde ne
   * voit pas, et rapporte des abandons qui n'ont pas eu lieu — un défaut
   * silencieux, puisque le chiffre s'affiche sans rien signaler.
   */
  const PROFILS: Answers[] = [
    {},
    { status: "EXPLORING_LLM", education: "M2" },
    { status: "LAWYER_EXPLORING", education: "M2" },
    { status: "TARGETING_BAR", education: "LICENCE" },
    { status: "ADMITTED_OR_ENROLLED", education: "CRFPA" },
    { status: "EXPLORING_LLM", education: "CAPA" },
    { status: "EXPLORING_LLM", education: "DOCTORAT" },
    { status: "EXPLORING_LLM", education: "LICENCE" },
  ];

  it("est exactement l'ensemble des écrans que la visibilité peut omettre", () => {
    const omis = new Set<ScreenId>();
    for (const answers of PROFILS) {
      const visibles = new Set(visibleScreens(answers));
      for (const id of SCREEN_IDS) if (!visibles.has(id)) omis.add(id);
    }
    expect([...omis].sort()).toEqual([...CONDITIONAL_SCREENS].sort());
  });

  it("marque comme conditionnel ce que la liste déclare, et rien d'autre", () => {
    for (const id of SCREEN_IDS) {
      expect(isConditionalScreen(id), id).toBe(
        (CONDITIONAL_SCREENS as readonly ScreenId[]).includes(id)
      );
    }
  });
});
