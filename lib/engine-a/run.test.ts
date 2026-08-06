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
      const avec = avocat("OTHER_COUNTRY_LAW_DEGREE");
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

    it("distingue les deux bases d'admission, sans distinguer les pays", () => {
      /*
       * Le § 520.6(b)(2) vise NOMMÉMENT l'admission obtenue par des études
       * suivies d'une formation en cabinet — les parcours de conversion, que le
       * BOLE traite à part. Le questionnaire recueille donc la BASE, jamais le
       * pays : aucune liste de juridictions n'étant publiée, une liste posée
       * ici inventerait le critère.
       */
      const diplome = avocat("OTHER_COUNTRY_LAW_DEGREE");
      const cabinet = avocat("OTHER_COUNTRY_TRAINING");

      expect(diplome.firedRules.map((r) => r.id)).not.toContain("R-NY-003");
      expect(cabinet.firedRules.map((r) => r.id)).toContain("R-NY-003");

      // La règle spécifique REMPLACE la générique, elle ne s'y ajoute pas :
      // les deux blocs se suivaient en se répétant, et la section atteignait
      // 2 067 caractères. Autant de paragraphes, un contenu différent.
      expect(cabinet.firedRules.map((r) => r.id)).not.toContain("R-NY-002");
      expect(cabinet.textBlocks.length).toBe(diplome.textBlocks.length);
      expect(cabinet.textBlocks).not.toEqual(diplome.textBlocks);

      // Même voie : la base d'admission précise, elle ne réoriente pas.
      expect(cabinet.path).toBe(diplome.path);
      expect(cabinet.textBlocks.join(" ")).toMatch(/parcours de conversion/);
      // Le bloc spécifique se suffit : il porte lui aussi l'absence de liste.
      expect(cabinet.textBlocks.join(" ")).toMatch(/n'en publie aucune liste/);
    });

    it("un projet de retour en France ajoute un paragraphe, sans retirer la voie", () => {
      /*
       * R-ALT-001, activée le 2026-08-06. Rendue telle qu'elle était écrite,
       * elle n'aurait rien produit : `ALTERNATIVE_TO_EXAMINE` est la voie la
       * moins prioritaire, R-NY-001 l'emportait toujours, et l'assemblage ne
       * rend que les blocs de la voie retenue.
       *
       * La faire primer aurait été pire : cela reviendrait à dire à quelqu'un
       * que la voie du LL.M. n'est pas la sienne, alors que beaucoup de
       * juristes passent le barreau de New York PUIS rentrent.
       */
      const retour = runEngineA(
        profileOf({
          status: "APPLYING",
          education: "M2",
          usStatus: "FR_NO_STATUS",
          careerGoal: "RETURN_FRANCE",
          geoGoal: "RETURN_FRANCE",
        })
      );
      const reste = runEngineA(
        profileOf({
          status: "APPLYING",
          education: "M2",
          usStatus: "FR_NO_STATUS",
          careerGoal: "BIG_LAW",
          geoGoal: "STAY_US",
        })
      );

      expect(retour.firedRules.map((r) => r.id)).toContain("R-ALT-001");
      expect(retour.path).toBe(reste.path);
      expect(retour.textBlocks.length).toBe(reste.textBlocks.length + 1);
      expect(retour.textBlocks.join(" ")).toMatch(/cela ne ferme pas cette voie/);
    });

    it("deux catégories de voie restent volontairement sans règle", () => {
      /*
       * `DIRECT_PATH_TO_EXAMINE` : ni le § 520.6(b)(2) ni le § 520.10 ne
       * décrivent une voie qui se passe d'un passage aux États-Unis.
       * `ALTERNATIVE_TO_EXAMINE` : écartée à l'activation de R-ALT-001, un
       * projet de retour en France ne retirant pas la voie du barreau.
       *
       * Les deux restent dans la liste fermée du CDC §14.1 : les vider est un
       * constat, les retirer serait modifier le cahier des charges. Les y
       * remettre demanderait, pour la première, une source.
       */
      const produites = RULES.map((r) => r.factProduced);
      expect(produites).not.toContain("DIRECT_PATH_TO_EXAMINE");
      expect(produites).not.toContain("ALTERNATIVE_TO_EXAMINE");
    });
  });
});
