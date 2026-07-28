import { describe, expect, it } from "vitest";
import { computeDeadlines } from "./compute";
import type { Answers } from "@/lib/questionnaire/types";

const REF = new Date(Date.UTC(2026, 6, 28)); // 28 juillet 2026
const keys = (a: Answers) => computeDeadlines(a, REF).map((d) => d.key);

describe("échéances du résultat immédiat (CDC §15)", () => {
  it("ne produit rien tant que la rentrée n'est pas décidée", () => {
    expect(computeDeadlines({ intake: "UNDECIDED" }, REF)).toEqual([]);
    expect(computeDeadlines({}, REF)).toEqual([]);
  });

  it("n'affiche aucune échéance de visa à un double national américain (CDC §12.4)", () => {
    expect(keys({ intake: "Y1", usStatus: "US_DUAL_NATIONAL" })).not.toContain("VISA");
    expect(keys({ intake: "Y1", usStatus: "FR_NO_STATUS" })).toContain("VISA");
  });

  it("écarte l'échéance de test d'anglais lorsque le test est déjà passé", () => {
    expect(keys({ intake: "Y1", english: "TEST_TAKEN" })).not.toContain("ENGLISH");
    expect(keys({ intake: "Y1", english: "NOT_STARTED" })).toContain("ENGLISH");
  });

  it("écarte les demandes de bourses si cette option est écartée", () => {
    expect(keys({ intake: "Y1", funding: "LOAN" })).not.toContain("SCHOLARSHIPS");
    expect(keys({ intake: "Y1", funding: "BOTH" })).toContain("SCHOLARSHIPS");
  });

  it("bascule sur les échéances de barreau une fois le LL.M. commencé", () => {
    const k = keys({ intake: "ALREADY_STARTED", status: "ADMITTED_OR_ENROLLED" });
    expect(k).toContain("BOLE");
    expect(k).not.toContain("APPLICATIONS");
  });

  it("n'affiche jamais une échéance déjà passée", () => {
    for (const d of computeDeadlines({ intake: "Y1", english: "NOT_STARTED" }, REF)) {
      expect(d.date >= "2026-07-28").toBe(true);
    }
  });
});
