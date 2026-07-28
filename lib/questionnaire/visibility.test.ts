import { describe, expect, it } from "vitest";
import {
  allowsTooEarlyGoal,
  careerGoalOptions,
  isAlreadyEnrolled,
  needsVisaBranch,
  progress,
  showsForeignBarScreen,
  visibleScreens,
} from "./visibility";
import { CAREER_GOAL } from "./types";

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
