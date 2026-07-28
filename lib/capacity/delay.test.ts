import { describe, expect, it } from "vitest";
import { announcedDelay, isSaturated } from "./delay";

describe("délai annoncé selon la capacité (CDC §18)", () => {
  it("annonce 48 heures jusqu'à dix rapports actifs", () => {
    expect(announcedDelay(0)).toBe("sous 48 heures");
    expect(announcedDelay(10)).toBe("sous 48 heures");
  });

  it("passe à trois jours ouvrés entre onze et vingt-cinq", () => {
    expect(announcedDelay(11)).toBe("sous 3 jours ouvrés");
    expect(announcedDelay(25)).toBe("sous 3 jours ouvrés");
  });

  it("n'annonce plus de délai ferme au-delà et signale la saturation", () => {
    expect(announcedDelay(26)).toMatch(/allongé/);
    expect(isSaturated(26)).toBe(true);
    expect(isSaturated(25)).toBe(false);
  });
});
