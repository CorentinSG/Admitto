import { describe, expect, it } from "vitest";
import { NOTICE_DAYS, deadlineList, dueNotices, noticeLead } from "./deadlines";
import type { Task, TaskStatus } from "@/lib/roadmap/types";

const REFERENCE = new Date("2026-07-29T09:00:00Z");

/** Tâche minimale : seuls l'échéance et le statut comptent pour les rappels. */
const task = (id: string, dueDate: string | null, status: TaskStatus = "TODO"): Task => ({
  id,
  phase: "APPLICATIONS",
  title: `Tâche ${id}`,
  explanation: "…",
  importance: "NORMAL",
  estimatedMinutes: 30,
  monthsBeforeIntake: 6,
  journeyTypes: ["LLM_APPLICANT"],
  delayRisk: "…",
  status,
  dueDate,
});

/** Date située à `days` jours de la référence. */
const inDays = (days: number): string =>
  new Date(Date.parse("2026-07-29T00:00:00Z") + days * 86_400_000).toISOString().slice(0, 10);

describe("paliers", () => {
  it("ne prévient pas au-delà du palier le plus lointain", () => {
    expect(dueNotices([task("a", inDays(45))], REFERENCE)).toEqual([]);
  });

  it.each(NOTICE_DAYS)("déclenche le palier à %i jours", (days) => {
    const notices = dueNotices([task("a", inDays(days))], REFERENCE);
    expect(notices).toHaveLength(1);
    expect(notices[0].level).toBe(days);
  });

  it("retient le palier le plus urgent atteint, pas le premier franchi", () => {
    // À trois jours, les paliers 30, 14 et 7 sont tous franchis : c'est 7 qui
    // vaut, et un seul rappel part.
    const notices = dueNotices([task("a", inDays(3))], REFERENCE);
    expect(notices).toHaveLength(1);
    expect(notices[0].level).toBe(7);
  });

  it("signale une échéance dépassée", () => {
    const notices = dueNotices([task("a", inDays(-4))], REFERENCE);
    expect(notices[0].level).toBe("OVERDUE");
    expect(notices[0].daysRemaining).toBe(-4);
  });
});

describe("aucun rattrapage en rafale", () => {
  it("n'envoie qu'un rappel par tâche et par passage", () => {
    // Personne n'a été prévenu depuis longtemps : quatre paliers sont dus.
    const notices = dueNotices([task("a", inDays(1))], REFERENCE);
    expect(notices).toHaveLength(1);
  });

  it("passe au palier suivant une fois le précédent envoyé", () => {
    const tasks = [task("a", inDays(1))];
    const first = dueNotices(tasks, REFERENCE);
    expect(first[0].level).toBe(1);

    const second = dueNotices(tasks, REFERENCE, [first[0].id]);
    // Le palier 1 est le plus urgent avant échéance : rien d'autre ne reste dû.
    expect(second).toEqual([]);
  });

  it("ne redescend jamais vers un palier moins urgent", () => {
    // Après « c'est demain », envoyer « il reste 7 jours » donnerait
    // l'impression que l'échéance s'est éloignée.
    const tasks = [task("a", inDays(1))];
    expect(dueNotices(tasks, REFERENCE, ["a:1"])).toEqual([]);
    expect(dueNotices(tasks, REFERENCE, ["a:7"]).map((n) => n.level)).toEqual([1]);
  });

  it("le dépassement passe même après un rappel avant échéance", () => {
    // OVERDUE est plus urgent que tous les paliers : il reste dû.
    const notices = dueNotices([task("a", inDays(-2))], REFERENCE, ["a:1", "a:7"]);
    expect(notices.map((n) => n.level)).toEqual(["OVERDUE"]);
  });

  it("un rappel déjà envoyé ne repart pas", () => {
    const tasks = [task("a", inDays(20))];
    const first = dueNotices(tasks, REFERENCE);
    expect(dueNotices(tasks, REFERENCE, [first[0].id])).toEqual([]);
  });

  it("l'échéance dépassée reste un rappel unique", () => {
    const tasks = [task("a", inDays(-10))];
    const first = dueNotices(tasks, REFERENCE);
    expect(dueNotices(tasks, REFERENCE, [first[0].id])).toEqual([]);
  });
});

describe("périmètre", () => {
  it("ignore une tâche accomplie", () => {
    expect(dueNotices([task("a", inDays(2), "DONE")], REFERENCE)).toEqual([]);
  });

  it("ignore une tâche hors parcours", () => {
    expect(dueNotices([task("a", inDays(2), "NOT_APPLICABLE")], REFERENCE)).toEqual([]);
  });

  it("prévient encore sur une tâche en attente d'un tiers", () => {
    // L'échéance court même quand l'action est chez quelqu'un d'autre : c'est
    // le moment de relancer, pas de se taire.
    expect(dueNotices([task("a", inDays(2), "WAITING_THIRD_PARTY")], REFERENCE)).toHaveLength(1);
  });

  it("ignore une tâche sans échéance", () => {
    expect(dueNotices([task("a", null)], REFERENCE)).toEqual([]);
  });

  it("classe les échéances les plus proches en premier", () => {
    const notices = dueNotices(
      [task("loin", inDays(25)), task("proche", inDays(2)), task("moyen", inDays(10))],
      REFERENCE
    );
    expect(notices.map((n) => n.taskId)).toEqual(["proche", "moyen", "loin"]);
  });

  it("les identifiants de rappel sont stables et distincts", () => {
    const notices = dueNotices([task("a", inDays(2)), task("b", inDays(2))], REFERENCE);
    expect(new Set(notices.map((n) => n.id)).size).toBe(2);
    expect(dueNotices([task("a", inDays(2))], REFERENCE)[0].id).toBe(notices[0].id);
  });
});

describe("formulation", () => {
  const notice = (days: number) => dueNotices([task("a", inDays(days))], REFERENCE)[0];

  it("dit demain plutôt que « dans 1 jours »", () => {
    expect(noticeLead(notice(1))).toBe("est à faire demain");
  });

  it("dit aujourd'hui le jour même", () => {
    expect(noticeLead(notice(0))).toBe("est à faire aujourd'hui");
  });

  it("dit hier plutôt que « en retard de 1 jours »", () => {
    expect(noticeLead(notice(-1))).toBe("était à faire hier");
  });

  it("chiffre le retard au-delà d'un jour", () => {
    expect(noticeLead(notice(-5))).toBe("est en retard de 5 jours");
  });

  it("chiffre le délai restant", () => {
    expect(noticeLead(notice(7))).toBe("est à faire dans 7 jours");
  });
});

describe("récapitulatif", () => {
  it("regroupe toutes les échéances dues en une seule liste", () => {
    // Quatre emails simultanés se liraient comme du démarchage : un seul
    // message porte les quatre lignes.
    const notices = dueNotices(
      [task("a", inDays(2)), task("b", inDays(5)), task("c", inDays(12))],
      REFERENCE
    );
    const list = deadlineList(notices);
    expect(list.split("\n")).toHaveLength(3);
    expect(list).toContain("Tâche a");
    expect(list).toContain("est à faire dans 2 jours");
  });

  it("ordonne la liste par urgence", () => {
    const notices = dueNotices([task("loin", inDays(20)), task("proche", inDays(1))], REFERENCE);
    expect(deadlineList(notices).split("\n")[0]).toContain("proche");
  });
});
