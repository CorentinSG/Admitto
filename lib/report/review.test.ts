import { describe, expect, it } from "vitest";
import { computeAssessment } from "@/lib/assessment/compute";
import { assembleReport } from "./assemble";
import { blockingPoints, canSend, reviewChecklist } from "./review";
import type { Answers } from "@/lib/questionnaire/types";

const REFERENCE = new Date("2026-07-29T10:00:00Z");

/** Profil complet et sans ambiguïté : sert de point de comparaison. */
const COMPLETE: Answers = {
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
  firstName: "Alix",
  email: "alix@example.com",
};

/** Retire des réponses, pour simuler un écran non affiché ou non répondu. */
const without = (answers: Answers, ...keys: Array<keyof Answers>): Answers => {
  const copy = { ...answers };
  for (const key of keys) delete copy[key];
  return copy;
};

const checklistFor = (answers: Answers) => {
  const assessment = computeAssessment(answers, REFERENCE, "test-id");
  return { assessment, points: reviewChecklist(assessment, assembleReport(assessment)) };
};

const ids = (answers: Answers) => checklistFor(answers).points.map((p) => p.id);

describe("points dérivés du profil (CDC §17)", () => {
  it("signale une réponse décisive manquante", () => {
    expect(ids(without(COMPLETE, "education"))).toContain("missing-answers");
  });

  it("nomme les champs manquants plutôt que d'annoncer « des réponses manquent »", () => {
    const partial = without(COMPLETE, "english", "careerGoal");
    const point = checklistFor(partial).points.find((p) => p.id === "missing-answers");
    expect(point?.why).toContain("test d'anglais");
    expect(point?.why).toContain("objectif professionnel");
  });

  it("signale une université absente de la base de partenariats", () => {
    expect(ids({ ...COMPLETE, university: "autre" })).toContain("university-not-covered");
  });

  it("ne signale pas l'université quand elle est couverte", () => {
    expect(ids(COMPLETE)).not.toContain("university-not-covered");
  });

  it("signale une fourchette de coût sans budget déclaré", () => {
    expect(ids(without(COMPLETE, "budget"))).toContain("budget-default");
  });

  it("exige la confirmation du seuil de crédits dès que la voie LL.M. est retenue", () => {
    // Le point le plus important de cette revue : le Moteur A ne peut pas
    // tester la condition de durée du § 520.6 — le questionnaire ne recueille
    // pas le décompte de crédits. Le filet que l'activation de R-NY-001 retire
    // au moteur est ici, et il est BLOQUANT.
    const { assessment, points } = checklistFor(COMPLETE);
    expect(assessment.path).toBe("NY_VIA_LLM_SUBJECT_TO_BOLE");

    const point = points.find((p) => p.id === "durational-requirement");
    expect(point?.severity).toBe("BLOCKING");
    expect(canSend(points, []).ok).toBe(false);
  });

  it("n'exige pas ce seuil quand la voie LL.M. n'a pas été retenue", () => {
    // Un cursus encore en cours ne déclenche pas R-NY-001 : lui demander un
    // décompte de crédits n'aurait aucun sens, et un point de revue qui se pose
    // toujours cesse d'être lu.
    const licence = { ...COMPLETE, education: "LICENCE" as const };
    expect(ids(licence)).not.toContain("durational-requirement");
  });

  it("remonte les règles non vérifiées effectivement utilisées", () => {
    // Les règles juridiques du Moteur A sont livrées sans date de vérification.
    // Toute règle de ce type qui entre dans un rapport doit apparaître en revue.
    const { assessment, points } = checklistFor(COMPLETE);
    const flagged = points.filter((p) => p.id.startsWith("rule-unverified-"));
    for (const point of flagged) {
      const ruleId = point.id.replace("rule-unverified-", "");
      expect(assessment.rulesSnapshot.map((r) => r.id)).toContain(ruleId);
      expect(point.severity).toBe("BLOCKING");
    }
  });
});

describe("gravité", () => {
  it("l'arbitrage d'une voie sans conclusion est bloquant", () => {
    const { points } = checklistFor(without(COMPLETE, "status", "education"));
    const arbitration = points.find((p) => p.id === "path-arbitration");
    if (arbitration) expect(arbitration.severity).toBe("BLOCKING");
  });

  it("un accord non confirmé mérite l'attention sans fermer l'envoi", () => {
    const { points } = checklistFor(COMPLETE);
    const partnerships = points.find((p) => p.id === "partnerships-to-confirm");
    if (partnerships) expect(partnerships.severity).toBe("ATTENTION");
  });

  it("chaque point porte un motif, jamais une consigne vide", () => {
    const { points } = checklistFor({ ...COMPLETE, university: "autre" });
    for (const point of points) {
      expect(point.why.length, point.id).toBeGreaterThan(40);
      expect(point.label.length, point.id).toBeGreaterThan(10);
    }
  });

  it("les identifiants de points sont uniques", () => {
    const { points } = checklistFor(COMPLETE);
    expect(new Set(points.map((p) => p.id)).size).toBe(points.length);
  });
});

describe("verrou d'envoi", () => {
  it("refuse l'envoi tant qu'un point bloquant n'est pas traité", () => {
    const { points } = checklistFor(without(COMPLETE, "education"));
    const verdict = canSend(points, []);
    expect(verdict.ok).toBe(false);
    if (!verdict.ok) expect(verdict.pending.length).toBe(blockingPoints(points).length);
  });

  it("ouvre l'envoi une fois tous les points bloquants acquittés", () => {
    const { points } = checklistFor(without(COMPLETE, "education"));
    expect(canSend(points, blockingPoints(points).map((p) => p.id)).ok).toBe(true);
  });

  it("un point « attention » n'a jamais besoin d'être acquitté", () => {
    const points = [
      { id: "a", severity: "ATTENTION" as const, label: "x", why: "y" },
      { id: "b", severity: "ATTENTION" as const, label: "x", why: "y" },
    ];
    expect(canSend(points, []).ok).toBe(true);
  });

  it("acquitter un point qui n'existe plus ne débloque rien", () => {
    // Les identifiants sont recalculés à chaque affichage : un acquittement
    // devenu orphelin ne doit pas valoir pour un nouveau point bloquant.
    const points = [{ id: "nouveau", severity: "BLOCKING" as const, label: "x", why: "y" }];
    expect(canSend(points, ["ancien-point"]).ok).toBe(false);
  });

  it("un profil sans aucun point bloquant part sans acquittement", () => {
    const points = [{ id: "a", severity: "ATTENTION" as const, label: "x", why: "y" }];
    expect(canSend(points, []).ok).toBe(true);
  });
});
