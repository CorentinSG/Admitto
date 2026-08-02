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

  describe("admission à un barreau étranger (vérification du 2026-08-02)", () => {
    const avocat = (foreignBar: Answers["foreignBar"]) =>
      runEngineA(
        profileOf({ status: "LAWYER_EXPLORING", education: "CAPA", usStatus: "FR_NO_STATUS", foreignBar })
      );

    it("ne change PAS la voie : elle ajoute un paragraphe, pas une orientation", () => {
      // Le BOLE ne publie aucune liste des juridictions de common law et évalue
      // chaque dossier ; le § 520.6(b)(2) exige de surcroît un LL.M. Une
      // admission étrangère ne peut donc pas produire de voie à elle seule.
      const sans = avocat("NONE");
      const avec = avocat("OTHER_COUNTRY");
      expect(avec.path).toBe(sans.path);
      expect(avec.path).toBe("NY_VIA_LLM_SUBJECT_TO_BOLE");
      expect(avec.textBlocks.length).toBe(sans.textBlocks.length + 1);
      expect(avec.textBlocks.join(" ")).toMatch(/ne publie aucune liste/);
    });

    it("vise la France comme les autres pays", () => {
      // « La France est exclue de la Rule 520.6 » était trop large : le
      // § 520.6(b)(1)(ii) permet de corriger une déficience substantielle par
      // un LL.M. Ce que le produit doit dire à un avocat français est donc ce
      // qu'il dit à tout avocat étranger.
      expect(avocat("FRANCE").firedRules.map((r) => r.id)).toContain("R-NY-002");
    });

    it("ne se déclenche pas quand l'écran n'a pas été affiché", () => {
      // `foreignBar` reste `undefined` lorsque la logique conditionnelle saute
      // l'écran. Un `neq: "NONE"` aurait fait feu pour tout le monde.
      const out = runEngineA(profileOf({ status: "APPLYING", education: "M2", usStatus: "FR_NO_STATUS" }));
      expect(out.firedRules.map((r) => r.id)).not.toContain("R-NY-002");
    });

    it("aucune règle ne produit plus la voie directe", () => {
      // Ni le § 520.6(b)(2) ni le § 520.10 ne décrivent une voie qui se passe
      // d'un passage aux États-Unis. La catégorie reste dans la liste fermée du
      // CDC, vide de contenu — l'y remettre demanderait une source.
      expect(RULES.map((r) => r.factProduced)).not.toContain("DIRECT_PATH_TO_EXAMINE");
    });
  });
});
