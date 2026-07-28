import { describe, expect, it } from "vitest";
import { deriveProfile, monthsUntilIntake, visaNeed, currentPhase, lawYearsValidated } from "./derive";

const REF = new Date(Date.UTC(2026, 6, 28)); // 28 juillet 2026, date de référence fixe

describe("profil structuré (CDC §13)", () => {
  it("approxime les années d'études validées", () => {
    expect(lawYearsValidated({ education: "LICENCE" })).toBe(3);
    expect(lawYearsValidated({ education: "M2" })).toBe(5);
    expect(lawYearsValidated({ education: "AUTRE" })).toBeNull();
    expect(lawYearsValidated({})).toBeNull();
  });

  it("n'affirme jamais un besoin de visa : likely / unlikely / à confirmer", () => {
    expect(visaNeed({ usStatus: "US_DUAL_NATIONAL" })).toBe("UNLIKELY");
    expect(visaNeed({ usStatus: "FR_NO_STATUS" })).toBe("LIKELY");
    expect(visaNeed({ usStatus: "EXISTING_VISA_STATUS" })).toBe("TO_CONFIRM");
    expect(visaNeed({ usStatus: "OTHER" })).toBe("TO_CONFIRM");
  });

  it("calcule les mois avant la rentrée à partir d'une date de référence injectée", () => {
    // Rentrée d'août 2027 depuis juillet 2026 : 13 mois.
    expect(monthsUntilIntake({ intake: "Y1" }, REF)).toBe(13);
    expect(monthsUntilIntake({ intake: "Y2" }, REF)).toBe(25);
    expect(monthsUntilIntake({ intake: "ALREADY_STARTED" }, REF)).toBe(0);
    expect(monthsUntilIntake({ intake: "UNDECIDED" }, REF)).toBeNull();
    expect(monthsUntilIntake({}, REF)).toBeNull();
  });

  it("place un explorateur sans objectif défini en phase de clarification", () => {
    expect(currentPhase({ status: "EXPLORING_LLM", careerGoal: "TOO_EARLY" })).toBe("CLARIFICATION");
    expect(currentPhase({ status: "EXPLORING_LLM", careerGoal: "BIG_LAW" })).toBe("LLM_SELECTION");
    expect(currentPhase({ status: "ADMITTED_OR_ENROLLED" })).toBe("LLM_START");
  });

  it("signale les informations manquantes au lieu d'improviser (CDC §1)", () => {
    expect(deriveProfile({ status: "APPLYING" }, REF).hasBlockingGaps).toBe(true);
    const complet = deriveProfile(
      { status: "APPLYING", education: "M2", usStatus: "FR_NO_STATUS" },
      REF
    );
    expect(complet.hasBlockingGaps).toBe(false);
    expect(complet.journeyType).toBe("LLM_APPLICANT");
  });
});
