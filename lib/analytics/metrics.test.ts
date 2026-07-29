import { describe, expect, it } from "vitest";
import { computeMetrics, formatMetric } from "./metrics";
import type { ReportRecord } from "@/lib/store/reports";
import type { Assessment } from "@/lib/assessment/compute";

const assessment = (id: string, university?: string): Assessment =>
  ({
    id,
    createdAt: "2026-07-01T10:00:00Z",
    answers: { university },
    derived: {},
    path: "HUMAN_REVIEW_REQUIRED",
    textBlocks: [],
    partnerships: { confirmed: [], toConfirm: [], aboveLevel: [], universityCovered: false, universityId: null },
    costs: {},
    deadlines: [],
    rulesSnapshot: [],
  }) as unknown as Assessment;

const report = (over: Partial<ReportRecord> = {}): ReportRecord => ({
  id: "r",
  assessmentId: "a",
  status: "QUEUED",
  priority: "FREE",
  createdAt: "2026-07-01T10:00:00Z",
  sentAt: null,
  corrections: [],
  deduction: null,
  acknowledged: [],
  ...over,
});

const empty = { assessments: [], reports: [], activatedRoadmaps: [] };

describe("aucun taux inventé sur un dénominateur nul", () => {
  it("rend null plutôt que zéro quand rien n'a été observé", () => {
    const m = computeMetrics(empty);
    for (const key of [
      "reportsSent",
      "conversionToPaid",
      "productionHours",
      "correctionsPerReport",
      "reportsWithCorrections",
      "partnershipDetection",
      "roadmapActivation",
    ] as const) {
      expect(m[key].value, key).toBeNull();
      expect(m[key].sample, key).toBe(0);
    }
  });

  it("affiche un tiret, jamais « 0 % », en l'absence de mesure", () => {
    expect(formatMetric({ value: null, sample: 0 }, "%")).toBe("—");
    expect(formatMetric({ value: 0, sample: 12 }, "%")).toBe("0 %");
  });

  it("distingue un zéro mesuré d'une absence de mesure", () => {
    const m = computeMetrics({
      assessments: [assessment("a1")],
      reports: [report({ status: "SENT", sentAt: "2026-07-02T10:00:00Z" })],
      activatedRoadmaps: [],
    });
    // Aucun rapport payant sur un rapport envoyé : c'est un vrai 0 %.
    expect(m.conversionToPaid.value).toBe(0);
    expect(m.conversionToPaid.sample).toBe(1);
  });
});

describe("chaque chiffre porte son dénominateur", () => {
  it("rapporte la conversion aux rapports envoyés, pas à la file", () => {
    // Un rapport jamais parti n'a pas eu l'occasion de convertir : le compter
    // au dénominateur écraserait artificiellement le taux.
    const m = computeMetrics({
      assessments: [assessment("a1"), assessment("a2")],
      reports: [
        report({ id: "r1", status: "SENT", sentAt: "2026-07-02T10:00:00Z", priority: "PAID" }),
        report({ id: "r2", status: "QUEUED" }),
      ],
      activatedRoadmaps: [],
    });
    expect(m.conversionToPaid.value).toBe(100);
    expect(m.conversionToPaid.sample).toBe(1);
  });

  it("compte les rapports envoyés sur la totalité de la file", () => {
    const m = computeMetrics({
      assessments: [],
      reports: [
        report({ id: "r1", status: "SENT", sentAt: "2026-07-02T10:00:00Z" }),
        report({ id: "r2" }),
        report({ id: "r3" }),
        report({ id: "r4" }),
      ],
      activatedRoadmaps: [],
    });
    expect(m.reportsSent.value).toBe(25);
    expect(m.reportsSent.sample).toBe(4);
  });
});

describe("temps de production", () => {
  it("prend la médiane, pas la moyenne", () => {
    // Un rapport oublié une semaine ne doit pas déplacer la mesure centrale.
    const m = computeMetrics({
      assessments: [],
      reports: [
        report({ id: "r1", status: "SENT", sentAt: "2026-07-01T12:00:00Z" }),
        report({ id: "r2", status: "SENT", sentAt: "2026-07-01T14:00:00Z" }),
        report({ id: "r3", status: "SENT", sentAt: "2026-07-08T10:00:00Z" }),
      ],
      activatedRoadmaps: [],
    });
    expect(m.productionHours.value).toBe(4);
  });

  it("ignore les rapports non envoyés", () => {
    const m = computeMetrics({
      assessments: [],
      reports: [report({ id: "r1" }), report({ id: "r2", status: "SENT", sentAt: "2026-07-01T13:00:00Z" })],
      activatedRoadmaps: [],
    });
    expect(m.productionHours.sample).toBe(1);
    expect(m.productionHours.value).toBe(3);
  });
});

describe("temps humain (CDC §36)", () => {
  it("moyenne les corrections sur les rapports envoyés", () => {
    const correction = { at: "2026-07-02T10:00:00Z", author: "Fondateur", note: "…" };
    const m = computeMetrics({
      assessments: [],
      reports: [
        report({ id: "r1", status: "SENT", sentAt: "2026-07-02T10:00:00Z", corrections: [correction, correction] }),
        report({ id: "r2", status: "SENT", sentAt: "2026-07-02T10:00:00Z", corrections: [] }),
      ],
      activatedRoadmaps: [],
    });
    expect(m.correctionsPerReport.value).toBe(1);
    expect(m.reportsWithCorrections.value).toBe(50);
  });
});

describe("activation", () => {
  it("rapporte l'ouverture de la feuille de route aux diagnostics", () => {
    const m = computeMetrics({
      assessments: [assessment("a1"), assessment("a2"), assessment("a3"), assessment("a4")],
      reports: [],
      activatedRoadmaps: ["a1"],
    });
    expect(m.roadmapActivation.value).toBe(25);
    expect(m.roadmapActivation.sample).toBe(4);
  });
});
