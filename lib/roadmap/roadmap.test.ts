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
      tasks.map((t) =>
        t.milestone === "SCHOOL_LIST_COMPLETED" ? { ...t, status: "DONE" as const } : t
      )
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

describe("prochaine action : arrivée tardive", () => {
  it("ne reproche pas une échéance que le produit a datée avant l'inscription", () => {
    // On part d'une vraie tâche du catalogue et on ne force que sa date : un
    // objet fabriqué de toutes pièces testerait un modèle, pas le produit.
    const tasks: Task[] = [{ ...TASK_TEMPLATES[0], status: "TODO", dueDate: "2026-06-15" }];
    const now = new Date("2026-08-01T12:00:00Z");

    const sans = selectNextBestAction(tasks, now);
    expect(sans?.behind).toBe(false);
    expect(sans?.reason).toContain("proche ou dépassée");

    // Arrivée en août sur une échéance de juin : la personne n'a rien laissé
    // filer, le produit a daté la tâche avant qu'elle n'existe pour lui.
    const avec = selectNextBestAction(tasks, now, "2026-08-01T09:00:00.000Z");
    expect(avec?.behind).toBe(true);
    expect(avec?.reason).toContain("à rattraper");
  });
});

describe("adaptation au profil réel", () => {
  const now = new Date("2026-11-01T12:00:00Z");
  const answers = (over: Partial<Answers>): Answers => ({ ...APPLICANT, ...over }) as Answers;
  const build = (over: Partial<Answers>) => {
    const a = answers(over);
    return generateRoadmap(a, deriveProfile(a, now).journeyType, now);
  };

  it("ne date pas les tâches d'avant la rentrée quand celle-ci est déjà passée", () => {
    // « J'ai déjà commencé » plaçait la rentrée au 15 août de l'année COURANTE :
    // tout ce qui se compte « N mois avant » tombait dans le passé, soit 12
    // tâches sur 12 à rattraper dès le premier jour.
    const tasks = applicableTasks(build({ intake: "ALREADY_STARTED" }));
    expect(tasks.length).toBeGreaterThan(0);
    expect(tasks.every((t) => t.dueDate === null)).toBe(true);
  });

  it("place la rentrée dans le PASSÉ toute l'année pour un parcours commencé", () => {
    /*
     * Le décalage de zéro année plaçait la rentrée au 15 août de l'année
     * courante — donc dans le futur pour qui s'inscrit entre janvier et
     * mi-août, sept mois sur douze. Une inscription en février datait ainsi
     * « finaliser votre liste d'écoles » pour le mois d'avril suivant, à
     * quelqu'un déjà en cours de scolarité.
     */
    for (const jour of ["2027-02-01", "2027-05-01", "2027-08-01", "2027-11-01"]) {
      const ref = new Date(`${jour}T12:00:00Z`);
      const a = answers({ intake: "ALREADY_STARTED" });
      const avantRentree = TASK_TEMPLATES.filter((t) => t.monthsBeforeIntake > 0);
      for (const t of avantRentree) {
        expect(dueDateFor(t, a, ref), `${t.id} au ${jour}`).toBeNull();
      }
    }
  });

  it("garde les échéances d'APRÈS la rentrée pour un parcours commencé", () => {
    // Évaluation, barreau, admission : ce sont précisément celles qui comptent
    // à ce stade, et elles restent datées.
    const tasks = applicableTasks(
      build({ status: "ADMITTED_OR_ENROLLED", intake: "ALREADY_STARTED" })
    );
    expect(tasks.some((t) => t.dueDate !== null)).toBe(true);
  });

  it("écarte le dossier de statut pour un binational américain", () => {
    // Réponse explicite ignorée jusqu'ici : le questionnaire lui épargnait déjà
    // la branche visa, la feuille de route lui proposait quand même la tâche.
    const avec = applicableTasks(build({ usStatus: "FR_NO_STATUS" }));
    const sans = applicableTasks(build({ usStatus: "US_DUAL_NATIONAL" }));
    expect(avec.some((t) => t.phase === "VISA")).toBe(true);
    expect(sans.some((t) => t.phase === "VISA")).toBe(false);
    // Écartée, pas accomplie : le dénominateur s'ajuste, le numérateur non.
    const brut = build({ usStatus: "US_DUAL_NATIONAL" });
    expect(brut.find((t) => t.phase === "VISA")!.status).toBe("NOT_APPLICABLE");
  });
});
