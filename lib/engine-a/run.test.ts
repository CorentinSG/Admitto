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

  it("emprunte la voie LL.M. pour un diplôme français complet", () => {
    const out = runEngineA(
      profileOf({ status: "APPLYING", education: "M2", usStatus: "FR_NO_STATUS" })
    );
    // R-NY-001 a été vérifiée contre le texte en vigueur le 2026-08-01 : ce
    // profil ne relève plus de la revue humaine par défaut. Le filet n'a pas
    // disparu, il a changé de place — la condition de durée du § 520.6 est
    // devenue un point BLOQUANT de la revue avant envoi, que le moteur ne peut
    // pas tester faute de recueillir le décompte de crédits.
    expect(out.path).toBe("NY_VIA_LLM_SUBJECT_TO_BOLE");
  });

  it("retombe sur la revue humaine quand aucune règle de voie ne se déclenche", () => {
    // Le repli existe toujours, et c'est ce qu'il faut protéger : un profil
    // qu'aucune règle active ne couvre ne reçoit JAMAIS de voie par défaut.
    const out = runEngineA(
      profileOf({ status: "APPLYING", education: "M2", usStatus: "FR_NO_STATUS" }),
      RULES.map((rule) => ({ ...rule, active: rule.id.startsWith("R-STRUCT-") && rule.active }))
    );
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
