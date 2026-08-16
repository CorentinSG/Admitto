import { describe, expect, it } from "vitest";
import { computeAssessment } from "@/lib/assessment/compute";
import { intakeYearOf, seedScenario } from "./seed";
import { defaultInputs } from "./defaults";
import type { Answers } from "@/lib/questionnaire/types";

const REF = new Date(Date.UTC(2026, 6, 28));

const BASE: Answers = {
  status: "APPLYING",
  education: "M2",
  university: "assas",
  foreignBar: "NONE",
  careerGoal: "BIG_LAW",
  geoGoal: "KEEP_BOTH",
  budget: "60_100K",
  funding: "BOTH",
  intake: "Y1",
  english: "TEST_TAKEN",
  usStatus: "FR_NO_STATUS",
  firstName: "Camille",
};

const assessmentOf = (answers: Partial<Answers>) =>
  computeAssessment({ ...BASE, ...answers }, REF, "seed-test");

describe("scénario de départ pré-rempli (personnalisation 1.1)", () => {
  it("nomme le scénario d'après LEUR rentrée, calculée depuis la soumission", () => {
    // Soumis en 2026, rentrée « l'an prochain » : 2027. Jamais l'horloge — le
    // libellé ne doit pas changer tout seul au passage du nouvel an.
    expect(seedScenario(assessmentOf({ intake: "Y1" })).label).toBe(
      "Votre point de départ — rentrée 2027"
    );
    expect(seedScenario(assessmentOf({ intake: "Y3" })).label).toBe(
      "Votre point de départ — rentrée 2029"
    );
  });

  it("n'invente pas d'année quand la rentrée n'est pas décidée", () => {
    for (const intake of ["UNDECIDED", "ALREADY_STARTED"] as const) {
      expect(seedScenario(assessmentOf({ intake })).label).toBe("Votre point de départ");
      expect(intakeYearOf(assessmentOf({ intake }))).toBeNull();
    }
  });

  it("fait tomber scolarité + frais annexes sur le MILIEU de leur fourchette", () => {
    const assessment = assessmentOf({});
    const seed = seedScenario(assessment);
    const mid =
      Math.round(
        (assessment.costs.academic.lowUsd + assessment.costs.academic.highUsd) / 2 / 100
      ) * 100;
    expect(seed.tuition + seed.universityFees).toBe(mid);
  });

  it("reflète la recherche de bourses DÉJÀ comptée dans leur fourchette", () => {
    // `estimateCosts` abaisse le plancher académique quand des bourses sont
    // envisagées : le milieu — donc la scolarité pré-remplie — descend avec.
    const avec = seedScenario(assessmentOf({ funding: "BOTH" }));
    const sans = seedScenario(assessmentOf({ funding: "NONE" }));
    expect(avec.tuition).toBeLessThan(sans.tuition);
  });

  it("rend le poste visa sans objet pour une double nationalité américaine", () => {
    expect(seedScenario(assessmentOf({ usStatus: "US_DUAL_NATIONAL" })).visa).toBe(0);
    expect(seedScenario(assessmentOf({ usStatus: "FR_NO_STATUS" })).visa).toBeGreaterThan(0);
  });

  it("reprend l'hypothèse « rester aux États-Unis » de leur fourchette", () => {
    expect(seedScenario(assessmentOf({ geoGoal: "STAY_US" })).noIncomeMonths).toBe(6);
    expect(seedScenario(assessmentOf({ geoGoal: "RETURN_FRANCE" })).noIncomeMonths).toBe(3);
  });

  it("n'invente aucun montant non déclaré", () => {
    // Une bourse envisagée n'est pas une bourse obtenue : la pré-chiffrer
    // serait l'inventer. Son effet passe par la fourchette, jamais par un
    // montant en ressources.
    const seed = seedScenario(assessmentOf({ funding: "BOTH" }));
    expect(seed.scholarships).toBe(0);
    expect(seed.partnerships).toBe(0);
  });

  it("ne touche à rien d'autre que ce qui vient d'eux", () => {
    // Le reste du gabarit est inchangé : le scénario reste un point de départ
    // à ajuster, pas un devis.
    const seed = seedScenario(assessmentOf({}));
    const generic = defaultInputs("x");
    for (const key of ["city", "studyMonths", "barPrep", "exams", "lsac", "translations"] as const) {
      expect(seed[key], key).toEqual(generic[key]);
    }
  });

  it("reste déterministe : même diagnostic, même scénario", () => {
    const assessment = assessmentOf({});
    expect(seedScenario(assessment)).toEqual(seedScenario(assessment));
  });
});
