import { describe, expect, it } from "vitest";
import type { Task } from "./types";
import { URGENT_WINDOW_DAYS, buildTimeline } from "./timeline";

const REFERENCE = new Date("2026-07-30T12:00:00.000Z");

const task = (over: Partial<Task>): Task => ({
  id: over.id ?? "T-1",
  phase: "APPLICATIONS",
  title: over.title ?? "Tâche",
  explanation: "",
  importance: "NORMAL",
  estimatedMinutes: 60,
  monthsBeforeIntake: 6,
  journeyTypes: ["LLM_APPLICANT"],
  delayRisk: "Un retard comprime la suite.",
  status: over.status ?? "TODO",
  dueDate: over.dueDate === undefined ? "2026-12-01" : over.dueDate,
  ...over,
});

describe("timeline du parcours", () => {
  it("rend null sans aucune tâche datée : pas d'axe inventé", () => {
    expect(buildTimeline([task({ dueDate: null })], REFERENCE)).toBeNull();
    expect(buildTimeline([], REFERENCE)).toBeNull();
  });

  it("ordonne par échéance et positionne entre 0 et 100", () => {
    const model = buildTimeline(
      [
        task({ id: "b", dueDate: "2026-12-01" }),
        task({ id: "a", dueDate: "2026-09-01" }),
        task({ id: "c", dueDate: "2027-03-01" }),
      ],
      REFERENCE
    )!;
    expect(model.entries.map((e) => e.id)).toEqual(["a", "b", "c"]);
    for (const entry of model.entries) {
      expect(entry.position).toBeGreaterThanOrEqual(0);
      expect(entry.position).toBeLessThanOrEqual(100);
    }
    // L'axe part d'aujourd'hui (aucune échéance passée) : la position du jour
    // est l'origine, la dernière échéance est le bout.
    expect(model.todayPosition).toBe(0);
    expect(model.entries[2].position).toBe(100);
  });

  it("classe chaque tâche dans un état exclusif", () => {
    const soon = new Date(REFERENCE.getTime() + (URGENT_WINDOW_DAYS - 5) * 86_400_000)
      .toISOString()
      .slice(0, 10);
    const model = buildTimeline(
      [
        task({ id: "done", status: "DONE", dueDate: "2026-09-01" }),
        task({ id: "late", dueDate: "2026-07-01" }),
        task({ id: "urgent", dueDate: soon }),
        task({ id: "started", status: "IN_PROGRESS", dueDate: "2026-12-01" }),
        task({ id: "far", dueDate: "2027-03-01" }),
      ],
      REFERENCE
    )!;
    const states = Object.fromEntries(model.entries.map((e) => [e.id, e.state]));
    expect(states).toEqual({
      done: "DONE",
      late: "OVERDUE",
      urgent: "URGENT",
      started: "IN_PROGRESS",
      far: "UPCOMING",
    });
  });

  it("une échéance passée reste visible derrière soi, jamais hors de l'axe", () => {
    const model = buildTimeline([task({ id: "late", dueDate: "2026-06-01" })], REFERENCE)!;
    const late = model.entries[0];
    expect(late.position).toBeGreaterThanOrEqual(0);
    expect(model.todayPosition).toBeGreaterThan(late.position);
    expect(late.daysLeft).toBeLessThan(0);
  });

  it("« en attente d'un tiers » compte comme accompli, comme la progression", () => {
    const model = buildTimeline(
      [
        task({ id: "w", status: "WAITING_THIRD_PARTY", dueDate: "2026-06-15" }),
        task({ id: "t", dueDate: "2026-12-01" }),
      ],
      REFERENCE
    )!;
    // La part de l'utilisateur est faite : ni « en retard », ni « urgente ».
    expect(model.entries.find((e) => e.id === "w")!.state).toBe("DONE");
    expect(model.doneCount).toBe(1);
    expect(model.totalCount).toBe(2);
  });

  it("dit combien de tâches restent sans échéance au lieu de les cacher", () => {
    const model = buildTimeline(
      [task({ id: "dated" }), task({ id: "undated", dueDate: null })],
      REFERENCE
    )!;
    expect(model.undatedCount).toBe(1);
  });

  it("écarte les tâches hors périmètre", () => {
    const model = buildTimeline(
      [task({ id: "na", status: "NOT_APPLICABLE" }), task({ id: "in" })],
      REFERENCE
    )!;
    expect(model.entries.map((e) => e.id)).toEqual(["in"]);
  });

  it("survit à une échéance unique tombant aujourd'hui", () => {
    // Étendue nulle sans le plancher : chaque position serait une division
    // par zéro et l'axe un NaN silencieux.
    const model = buildTimeline([task({ dueDate: "2026-07-30" })], REFERENCE)!;
    expect(Number.isFinite(model.entries[0].position)).toBe(true);
    expect(Number.isFinite(model.todayPosition)).toBe(true);
  });

  it("gradue par mois et éclaircit au-delà de douze", () => {
    const long = buildTimeline(
      [task({ id: "a", dueDate: "2026-08-15" }), task({ id: "b", dueDate: "2028-06-01" })],
      REFERENCE
    )!;
    expect(long.ticks.length).toBeLessThanOrEqual(12);
    for (const tick of long.ticks) {
      expect(tick.date.endsWith("-01")).toBe(true);
    }
  });
});
