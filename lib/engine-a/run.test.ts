import { describe, expect, it } from "vitest";
import { runEngineA, unverifiedActiveRules } from "./run";
import { RULES } from "./rules.seed";
import { deriveProfile } from "@/lib/profile/derive";
import { flattenForRules } from "@/lib/profile/derive";
import type { Answers } from "@/lib/questionnaire/types";
import type { Rule } from "./types";

const REF = new Date(Date.UTC(2026, 6, 28));

const profileOf = (answers: Answers) =>
  flattenForRules(answers, deriveProfile(answers, REF));

describe("Moteur A", () => {
  it("retourne « informations insuffisantes » quand un champ clé manque", () => {
    const out = runEngineA(profileOf({ status: "APPLYING" }));
    expect(out.path).toBe("INSUFFICIENT_INFORMATION");
    expect(out.textBlocks[0]).toMatch(/ne suffisent pas/);
  });

  it("retombe sur la revue humaine quand aucune règle ne se déclenche", () => {
    const out = runEngineA(
      profileOf({ status: "APPLYING", education: "M2", usStatus: "FR_NO_STATUS" })
    );
    // Les règles de droit sont inactives tant qu'elles ne sont pas vérifiées :
    // le moteur ne doit surtout pas conclure à leur place.
    expect(out.path).toBe("HUMAN_REVIEW_REQUIRED");
  });

  it("signale un cursus encore en cours sans se prononcer sur l'éligibilité", () => {
    const out = runEngineA(
      profileOf({ status: "EXPLORING_LLM", education: "LICENCE", usStatus: "FR_NO_STATUS" })
    );
    expect(out.path).toBe("EDUCATION_LIKELY_INSUFFICIENT");
  });

  it("trace l'identifiant et la version de chaque règle déclenchée", () => {
    const out = runEngineA(profileOf({ status: "APPLYING" }));
    expect(out.firedRules).toEqual([{ id: "R-STRUCT-001", version: 1 }]);
  });

  it("applique la priorité : information manquante avant tout le reste", () => {
    const activated: Rule[] = RULES.map((r) => ({ ...r, active: true }));
    const out = runEngineA(profileOf({ status: "APPLYING", education: "LICENCE" }), activated);
    expect(out.path).toBe("INSUFFICIENT_INFORMATION");
  });

  it("aucune règle active ne peut être dépourvue de source ou de date de vérification", () => {
    expect(unverifiedActiveRules(RULES)).toEqual([]);
  });
});
