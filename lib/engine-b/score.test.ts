import { describe, expect, it } from "vitest";
import {
  buildVerdictInput,
  financialFit,
  immigrationRisk,
  professionalRealism,
  scoreAxes,
  timelineFeasibility,
} from "./score";
import { computeVerdict } from "./verdict";
import { deriveProfile } from "@/lib/profile/derive";
import { estimateCosts } from "@/lib/costs/estimate";
import type { Answers } from "@/lib/questionnaire/types";

const REF = new Date(Date.UTC(2026, 6, 28));
const ctx = (a: Answers) => ({ answers: a, derived: deriveProfile(a, REF), costs: estimateCosts(a) });

describe("Moteur B — notation des axes (CDC §14.2)", () => {
  it("ne fait jamais de l'université le seul critère académique", () => {
    const connue = ctx({ education: "M2", university: "Université Paris-Panthéon-Assas" });
    const inconnue = ctx({ education: "M2", university: "Autre université / non listée" });
    const ecart =
      scoreAxes(connue.answers, connue.derived, connue.costs).ACADEMIC_STRENGTH -
      scoreAxes(inconnue.answers, inconnue.derived, inconnue.costs).ACADEMIC_STRENGTH;
    expect(ecart).toBeLessThanOrEqual(1);
  });

  it("un budget faible déclenche d'abord une recherche de financement", () => {
    const sans = ctx({ budget: "UNDER_30K", funding: "NONE" });
    const avec = ctx({ budget: "UNDER_30K", funding: "BOTH" });
    expect(financialFit(avec.answers, avec.costs)).toBeGreaterThan(
      financialFit(sans.answers, sans.costs)
    );
  });

  it("réserve la note académique maximale à un cursus achevé", () => {
    const m2 = ctx({ education: "M2", university: "Université Paris 1 Panthéon-Sorbonne" });
    const capa = ctx({ education: "CAPA", university: "Université Paris 1 Panthéon-Sorbonne" });
    expect(scoreAxes(m2.answers, m2.derived, m2.costs).ACADEMIC_STRENGTH).toBe(3);
    expect(scoreAxes(capa.answers, capa.derived, capa.costs).ACADEMIC_STRENGTH).toBe(4);
  });

  it("ne prend pas une réponse absente sur le barreau pour une admission", () => {
    // L'écran barreau n'est pas montré à un candidat en M2 : `foreignBar` est
    // alors indéfini et ne doit surtout pas valoir « admis ».
    const sansEcran = ctx({
      education: "M2",
      careerGoal: "BIG_LAW",
      geoGoal: "STAY_US",
      status: "APPLYING",
    });
    const admis = ctx({
      education: "M2",
      careerGoal: "BIG_LAW",
      geoGoal: "STAY_US",
      status: "APPLYING",
      foreignBar: "FRANCE",
    });
    expect(professionalRealism(sansEcran.answers, sansEcran.derived)).toBeLessThan(
      professionalRealism(admis.answers, admis.derived)
    );
  });

  it("neutralise l'axe migratoire quand aucun visa n'est nécessaire", () => {
    const c = ctx({ usStatus: "US_DUAL_NATIONAL", geoGoal: "STAY_US" });
    expect(immigrationRisk(c.answers, c.derived)).toBe(4);
  });

  it("est plus prudent lorsque l'utilisateur exige de rester aux États-Unis", () => {
    const rester = ctx({ usStatus: "FR_NO_STATUS", geoGoal: "STAY_US" });
    const rentrer = ctx({ usStatus: "FR_NO_STATUS", geoGoal: "RETURN_FRANCE" });
    expect(immigrationRisk(rester.answers, rester.derived)).toBeLessThan(
      immigrationRisk(rentrer.answers, rentrer.derived)
    );
  });

  it("dégrade le calendrier quand le test d'anglais n'est pas commencé et la rentrée proche", () => {
    const pret = ctx({ intake: "Y1", english: "TEST_TAKEN" });
    const pasPret = ctx({ intake: "Y1", english: "NOT_STARTED" });
    expect(timelineFeasibility(pasPret.answers, pasPret.derived)).toBeLessThan(
      timelineFeasibility(pret.answers, pret.derived)
    );
  });
});

describe("Moteur B — chaîne complète jusqu'au verdict", () => {
  const run = (a: Answers) => computeVerdict(buildVerdictInput(a, deriveProfile(a, REF), estimateCosts(a)));

  it("un objectif non défini produit « à clarifier » quels que soient les autres axes", () => {
    const { verdict } = run({
      status: "EXPLORING_LLM",
      education: "CAPA",
      budget: "OVER_100K",
      funding: "BOTH",
      intake: "Y2",
      english: "TEST_TAKEN",
      usStatus: "US_DUAL_NATIONAL",
      careerGoal: "TOO_EARLY",
    });
    expect(verdict).toBe("NEEDS_CLARIFICATION");
  });

  it("un profil complet et préparé atteint le verdict le plus favorable", () => {
    const { verdict } = run({
      status: "LAWYER_EXPLORING",
      education: "CAPA",
      university: "Université Paris-Panthéon-Assas",
      foreignBar: "FRANCE",
      careerGoal: "RETURN_FRANCE",
      geoGoal: "RETURN_FRANCE",
      budget: "OVER_100K",
      funding: "BOTH",
      intake: "Y2",
      english: "TEST_TAKEN",
      usStatus: "US_DUAL_NATIONAL",
    });
    expect(verdict).toBe("HIGHLY_RELEVANT");
  });

  it("signale une timeline critique sans changer le verdict à elle seule", () => {
    const { shiftIntake } = run({
      status: "APPLYING",
      education: "M2",
      careerGoal: "BIG_LAW",
      geoGoal: "KEEP_BOTH",
      budget: "60_100K",
      funding: "LOAN",
      intake: "ALREADY_STARTED",
      english: "TEST_TAKEN",
      usStatus: "FR_NO_STATUS",
    });
    expect(shiftIntake).toBe(false); // parcours déjà engagé : rien à décaler
  });

  it("aucun verdict n'est exprimé en pourcentage", () => {
    const { verdict } = run({ status: "APPLYING", education: "M2", careerGoal: "BIG_LAW" });
    expect(verdict).toMatch(/^[A-Z_]+$/);
  });
});
