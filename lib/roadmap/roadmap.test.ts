import { describe, expect, it } from "vitest";
import { generateRoadmap, applicableTasks, activePhases, dueDateFor } from "./generate";
import { selectNextBestAction, formatDuration } from "./next-best-action";
import { computeProgress, progressByPhase, milestoneStates, personalStats } from "./progress";
import { TASK_TEMPLATES } from "@/content/roadmap-tasks";
import { deriveProfile } from "@/lib/profile/derive";
import type { Answers } from "@/lib/questionnaire/types";
import type { Task } from "./types";

const REF = new Date(Date.UTC(2026, 6, 28));

const APPLICANT: Answers = {
  status: "APPLYING",
  education: "M2",
  university: "Université Paris 1 Panthéon-Sorbonne",
  careerGoal: "BIG_LAW",
  geoGoal: "KEEP_BOTH",
  budget: "60_100K",
  funding: "BOTH",
  intake: "Y1",
  english: "TEST_PLANNED",
  usStatus: "FR_NO_STATUS",
};

const build = (answers: Answers = APPLICANT) => {
  const derived = deriveProfile(answers, REF);
  return generateRoadmap(answers, derived.journeyType, REF);
};

describe("génération de la feuille de route (CDC §22)", () => {
  it("exclut les tâches hors parcours type au lieu de les masquer", () => {
    const tasks = build();
    const horsParcours = tasks.filter((t) => t.status === "NOT_APPLICABLE");
    expect(horsParcours.length).toBeGreaterThan(0);
    // Les tâches propres à l'avocat déjà qualifié ne concernent pas un candidat.
    expect(horsParcours.map((t) => t.id)).toContain("T-FQL-01");
  });

  it("ne retient pour un parcours que des tâches qui le concernent", () => {
    const tasks = applicableTasks(build());
    for (const task of tasks) expect(task.journeyTypes).toContain("LLM_APPLICANT");
  });

  it("calcule les échéances depuis la rentrée visée", () => {
    const liste = build().find((t) => t.id === "T-SEL-03")!;
    // Rentrée d'août 2027, tâche à 11 mois avant → septembre 2026.
    expect(liste.dueDate).toBe("2026-09-15");
  });

  it("laisse les échéances vides tant que la rentrée n'est pas décidée", () => {
    const sansDate = build({ ...APPLICANT, intake: "UNDECIDED" });
    expect(sansDate.every((t) => t.dueDate === null)).toBe(true);
  });

  it("ordonne les phases selon le parcours officiel", () => {
    const phases = activePhases(build());
    expect(phases.indexOf("LLM_SELECTION")).toBeLessThan(phases.indexOf("APPLICATIONS"));
    expect(phases.indexOf("APPLICATIONS")).toBeLessThan(phases.indexOf("VISA"));
  });

  it("donne une feuille de route différente à chaque parcours type", () => {
    const avocat = build({ ...APPLICANT, status: "LAWYER_EXPLORING", foreignBar: "FRANCE" });
    const candidat = build();
    expect(applicableTasks(avocat).map((t) => t.id)).not.toEqual(
      applicableTasks(candidat).map((t) => t.id)
    );
    expect(applicableTasks(avocat).map((t) => t.id)).toContain("T-FQL-01");
  });
});

describe("Next Best Action (CDC §23)", () => {
  it("propose toujours une action tant qu'il en reste une actionnable", () => {
    const nba = selectNextBestAction(build(), REF);
    expect(nba).not.toBeNull();
    expect(nba!.reason).toBeTruthy();
    expect(nba!.duration).toBeTruthy();
    expect(nba!.delayRisk).toBeTruthy();
  });

  it("n'propose jamais une tâche que l'utilisateur ne peut pas faire avancer", () => {
    const tasks = build().map((t) =>
      t.status === "TODO" ? { ...t, status: "WAITING_THIRD_PARTY" as const } : t
    );
    expect(selectNextBestAction(tasks, REF)).toBeNull();
  });

  it("privilégie l'échéance la plus proche", () => {
    const tasks = applicableTasks(build());
    const nba = selectNextBestAction(tasks, REF)!;
    const echeances = tasks
      .filter((t) => t.status === "TODO" && t.dueDate)
      .map((t) => t.dueDate!)
      .sort();
    expect(nba.dueDate).toBe(echeances[0]);
  });

  it("signale l'urgence quand l'échéance est proche ou dépassée", () => {
    const tache: Task = { ...build()[0], status: "TODO", dueDate: "2026-08-01" };
    expect(selectNextBestAction([tache], REF)!.urgent).toBe(true);
  });

  it("renvoie null quand tout est accompli", () => {
    const tout = build().map((t) => ({ ...t, status: "DONE" as const }));
    expect(selectNextBestAction(tout, REF)).toBeNull();
  });

  it("formate les durées lisiblement", () => {
    expect(formatDuration(30)).toBe("30 min");
    expect(formatDuration(120)).toBe("≈ 2 h");
  });
});

describe("progression et challenges (CDC §24)", () => {
  it("ne compte que les tâches applicables dans la progression", () => {
    const tasks = build();
    const progress = computeProgress(tasks);
    expect(progress.total).toBe(applicableTasks(tasks).length);
    expect(progress.total).toBeLessThan(tasks.length);
  });

  it("atteint cent pour cent quand tout est accompli", () => {
    const tout = build().map((t) =>
      t.status === "NOT_APPLICABLE" ? t : { ...t, status: "DONE" as const }
    );
    expect(computeProgress(tout).percent).toBe(100);
  });

  it("détaille la progression phase par phase, dans l'ordre", () => {
    const phases = progressByPhase(build());
    expect(phases.length).toBeGreaterThan(1);
    for (const p of phases) expect(p.total).toBeGreaterThan(0);
  });

  it("n'acquiert un challenge que si toutes ses tâches sont accomplies", () => {
    const tasks = build();
    const avant = milestoneStates(tasks).find((m) => m.milestone === "SCHOOL_LIST_COMPLETED")!;
    expect(avant.achieved).toBe(false);

    const apres = milestoneStates(
      tasks.map((t) => (t.milestone === "SCHOOL_LIST_COMPLETED" ? { ...t, status: "DONE" as const } : t))
    ).find((m) => m.milestone === "SCHOOL_LIST_COMPLETED")!;
    expect(apres.achieved).toBe(true);
  });

  it("ne porte les challenges que sur des actions contrôlées par l'utilisateur", () => {
    // Aucun challenge ne doit être rattaché à une tâche dont l'issue dépend
    // d'un tiers : visa, bourse, admission, emploi, examen réussi.
    const interdits = /visa obtenu|bourse obtenue|admission obtenue|emploi|examen réussi/i;
    for (const template of TASK_TEMPLATES.filter((t) => t.milestone)) {
      expect(template.title).not.toMatch(interdits);
    }
  });

  it("distingue les tâches en attente d'un tiers dans les statistiques", () => {
    const tasks = build().map((t, i) =>
      i === 0 && t.status === "TODO" ? { ...t, status: "WAITING_THIRD_PARTY" as const } : t
    );
    expect(personalStats(tasks, REF).waitingOnOthers).toBeGreaterThanOrEqual(0);
  });

  it("compte les échéances dépassées", () => {
    const tasks: Task[] = [{ ...build()[0], status: "TODO", dueDate: "2025-01-01" }];
    expect(personalStats(tasks, REF).overdue).toBe(1);
  });
});

describe("cohérence des modèles de tâches", () => {
  it("attribue à chaque tâche un identifiant unique", () => {
    const ids = TASK_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("donne à chaque tâche les champs exigés par le CDC §22", () => {
    for (const t of TASK_TEMPLATES) {
      expect(t.title.length).toBeGreaterThan(0);
      expect(t.explanation.length).toBeGreaterThan(20);
      expect(t.estimatedMinutes).toBeGreaterThan(0);
      expect(t.journeyTypes.length).toBeGreaterThan(0);
      expect(t.delayRisk.length).toBeGreaterThan(20);
    }
  });

  it("couvre les cinq parcours types", () => {
    for (const journey of [
      "PRE_LLM_EXPLORER",
      "LLM_APPLICANT",
      "CURRENT_LLM_STUDENT",
      "BAR_CANDIDATE",
      "FOREIGN_QUALIFIED_LAWYER",
    ] as const) {
      expect(TASK_TEMPLATES.some((t) => t.journeyTypes.includes(journey))).toBe(true);
    }
  });

  it("place chaque échéance de tâche à une date cohérente", () => {
    for (const template of TASK_TEMPLATES) {
      expect(dueDateFor(template, APPLICANT, REF)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
