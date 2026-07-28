import { describe, expect, it } from "vitest";
import { assembleReport } from "./assemble";
import { fill, UnauthorizedVariableError } from "./fill";
import { computeAssessment } from "@/lib/assessment/compute";
import { recommendOffer } from "@/lib/offers/recommend";
import {
  AXIS_COMMENTS,
  NEXT_STEPS,
  REPORT_STATIC,
  RISK_BLOCKS,
  VERDICT_BLOCKS,
} from "@/content/report-blocks";
import type { Answers } from "@/lib/questionnaire/types";

const REF = new Date(Date.UTC(2026, 6, 28));
const report = (a: Answers) => assembleReport(computeAssessment(a, REF, "test-id"));

const PROFIL_TENDU: Answers = {
  status: "APPLYING",
  education: "M1",
  university: "Autre université / non listée",
  careerGoal: "BIG_LAW",
  geoGoal: "STAY_US",
  budget: "UNDER_30K",
  funding: "NONE",
  intake: "Y1",
  english: "NOT_STARTED",
  usStatus: "FR_NO_STATUS",
  firstName: "Camille",
  email: "camille@example.com",
};

describe("substitution de variables (CDC §17)", () => {
  it("refuse toute variable hors de la liste autorisée", () => {
    expect(() => fill("Bonjour {prenomComplet}", {})).toThrow(UnauthorizedVariableError);
  });

  it("échoue plutôt que de livrer un rapport à trou", () => {
    expect(() => fill("Bonjour {firstName}", {})).toThrow(/attendue mais absente/);
  });

  it("substitue les variables autorisées", () => {
    expect(fill("Bonjour {firstName}", { firstName: "Camille" })).toBe("Bonjour Camille");
  });
});

describe("assemblage du rapport", () => {
  it("produit toutes les sections exigées par le CDC §17", () => {
    const r = report(PROFIL_TENDU);
    expect(r.summary).toBeTruthy();
    expect(r.pathLabel).toBeTruthy();
    expect(r.partnerships).toBeTruthy();
    expect(r.axes).toHaveLength(5);
    expect(r.verdictTitle).toBeTruthy();
    expect(r.nextSteps.length).toBeGreaterThan(0);
    expect(r.timeline.length).toBeGreaterThan(0);
    expect(r.costsLead).toMatch(/\$/);
    expect(r.offerName).toBeTruthy();
    expect(r.signature.length).toBe(3);
    expect(r.disclaimer).toBeTruthy();
  });

  it("n'utilise que des blocs pré-rédigés, jamais de texte produit librement", () => {
    const r = report(PROFIL_TENDU);
    const blocsConnus = [
      ...Object.values(AXIS_COMMENTS).flatMap((niveaux) => Object.values(niveaux)),
      ...Object.values(RISK_BLOCKS).map((b) => b.body),
      ...Object.values(VERDICT_BLOCKS).map((b) => b.body),
    ];
    for (const axe of r.axes) expect(blocsConnus).toContain(axe.comment);
    for (const risque of r.risks) expect(blocsConnus).toContain(risque.body);
    expect(blocsConnus).toContain(r.verdictBody);
    expect(r.summary).toBe(REPORT_STATIC.summaryLead);
    expect(Object.values(NEXT_STEPS)).toContainEqual(r.nextSteps);
  });

  it("déduit les risques des seuls axes faibles, sans en inventer", () => {
    const r = report(PROFIL_TENDU);
    const axesFaibles = r.axes.filter((a) => a.score <= 2).map((a) => a.axis);
    expect(r.risks.map((x) => x.axis).sort()).toEqual(axesFaibles.sort());
    for (const risque of r.risks) expect(risque.actions.length).toBeGreaterThan(0);
  });

  it("ne signe jamais « Esq. » ni « Attorney at Law » (CDC §7)", () => {
    const r = report(PROFIL_TENDU);
    const signature = r.signature.join(" ");
    expect(signature).toMatch(/Founder/);
    expect(signature).not.toMatch(/Esq\.|Attorney at Law/);
  });

  it("porte la date de vérification de chaque source citée", () => {
    const r = report(PROFIL_TENDU);
    for (const source of r.sources) expect(source).toHaveProperty("verifiedAt");
  });

  it("n'oriente pas vers la plateforme un projet à clarifier ou non recommandé", () => {
    expect(recommendOffer("NEEDS_CLARIFICATION", "LLM_APPLICANT")).toBe("DIAGNOSTIC");
    expect(recommendOffer("NOT_CURRENTLY_RECOMMENDED", "LLM_APPLICANT")).toBe("DIAGNOSTIC");
    expect(recommendOffer("PREMATURE", "PRE_LLM_EXPLORER")).toBe("DIAGNOSTIC");
    expect(recommendOffer("HIGHLY_RELEVANT", "CURRENT_LLM_STUDENT")).toBe("PLATFORM");
  });

  it("reste déterministe : deux assemblages du même profil sont identiques", () => {
    expect(JSON.stringify(report(PROFIL_TENDU))).toBe(JSON.stringify(report(PROFIL_TENDU)));
  });
});
