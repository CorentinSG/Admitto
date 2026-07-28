import { describe, expect, it } from "vitest";
import { computeVerdict, type AxisScores } from "./verdict";

const scores = (
  a: 1 | 2 | 3 | 4,
  f: 1 | 2 | 3 | 4,
  p: 1 | 2 | 3 | 4,
  t: 1 | 2 | 3 | 4,
  i: 1 | 2 | 3 | 4
): AxisScores => ({
  ACADEMIC_STRENGTH: a,
  FINANCIAL_FIT: f,
  PROFESSIONAL_REALISM: p,
  TIMELINE_FEASIBILITY: t,
  IMMIGRATION_RISK: i,
});

describe("computeVerdict — plafonnements du CDC §14.3", () => {
  it("un axe à 1/4 empêche « fortement pertinent »", () => {
    const { verdict } = computeVerdict({
      scores: scores(4, 4, 4, 4, 1),
      timelineCritical: false,
      goalTooVague: false,
    });
    expect(verdict).not.toBe("HIGHLY_RELEVANT");
  });

  it("deux axes faibles imposent au minimum une planification importante", () => {
    const { verdict } = computeVerdict({
      scores: scores(4, 2, 4, 2, 4),
      timelineCritical: false,
      goalTooVague: false,
    });
    expect(["VIABLE_WITH_MAJOR_PLANNING", "POSSIBLE_BUT_RISKY"]).toContain(verdict);
  });

  it("un objectif trop flou produit « à clarifier », quels que soient les scores", () => {
    const { verdict } = computeVerdict({
      scores: scores(4, 4, 4, 4, 4),
      timelineCritical: false,
      goalTooVague: true,
    });
    expect(verdict).toBe("NEEDS_CLARIFICATION");
  });

  it("une timeline critique déplace la rentrée (shiftIntake)", () => {
    const { shiftIntake } = computeVerdict({
      scores: scores(3, 3, 3, 3, 3),
      timelineCritical: true,
      goalTooVague: false,
    });
    expect(shiftIntake).toBe(true);
  });

  it("profil solide sans facteur bloquant → fortement pertinent", () => {
    const { verdict } = computeVerdict({
      scores: scores(4, 4, 4, 3, 3),
      timelineCritical: false,
      goalTooVague: false,
    });
    expect(verdict).toBe("HIGHLY_RELEVANT");
  });
});
