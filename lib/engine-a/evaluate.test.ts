import { describe, expect, it } from "vitest";
import { evaluateCondition, fireRules } from "./evaluate";
import type { Rule } from "./types";

const rule = (over: Partial<Rule>): Rule => ({
  id: "R-TEST",
  condition: { field: "degree", op: "eq", value: "M2" },
  factProduced: "fact",
  textBlockId: "TB-1",
  sourceUrl: "https://www.nybarexam.org/",
  verifiedAt: "2026-07-01",
  version: 1,
  active: true,
  ...over,
});

describe("evaluateCondition", () => {
  it("évalue eq / neq / in / gte / lte", () => {
    expect(evaluateCondition({ field: "degree", op: "eq", value: "M2" }, { degree: "M2" })).toBe(true);
    expect(evaluateCondition({ field: "degree", op: "neq", value: "M2" }, { degree: "M1" })).toBe(true);
    expect(evaluateCondition({ field: "degree", op: "in", value: ["M1", "M2"] }, { degree: "M1" })).toBe(true);
    expect(evaluateCondition({ field: "months", op: "gte", value: 12 }, { months: 18 })).toBe(true);
    expect(evaluateCondition({ field: "months", op: "lte", value: 12 }, { months: 18 })).toBe(false);
  });

  it("compose all / any récursivement", () => {
    const cond = {
      all: [
        { field: "degree", op: "eq" as const, value: "M2" },
        { any: [{ field: "usStatus", op: "eq" as const, value: "NONE" }] },
      ],
    };
    expect(evaluateCondition(cond, { degree: "M2", usStatus: "NONE" })).toBe(true);
    expect(evaluateCondition(cond, { degree: "M1", usStatus: "NONE" })).toBe(false);
  });
});

describe("fireRules", () => {
  it("ignore les règles inactives", () => {
    expect(fireRules([rule({ active: false })], { degree: "M2" })).toHaveLength(0);
  });

  it("retourne id + version pour la traçabilité (rulesSnapshot)", () => {
    const fired = fireRules([rule({ id: "R-1", version: 3 })], { degree: "M2" });
    expect(fired).toEqual([{ id: "R-1", version: 3, fact: "fact", textBlockId: "TB-1" }]);
  });
});
