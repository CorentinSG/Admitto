import { describe, expect, it } from "vitest";
import { milestoneStore } from "./milestones";

/**
 * Le store ne retient qu'une date de première acquisition (CDC §24).
 * L'état « acquis » reste calculé depuis les tâches : le stocker permettrait
 * qu'un challenge reste affiché comme acquis après que le travail a été défait.
 */
describe("date de première acquisition", () => {
  it("enregistre la première fois seulement", async () => {
    const id = "assess-premiere";
    expect(await milestoneStore.recordFirst(id, "SCHOOL_LIST_COMPLETED", "2026-07-01T10:00:00Z")).toBe(true);
    expect(await milestoneStore.recordFirst(id, "SCHOOL_LIST_COMPLETED", "2026-09-01T10:00:00Z")).toBe(false);

    const dates = await milestoneStore.dates(id);
    expect(dates.SCHOOL_LIST_COMPLETED).toBe("2026-07-01T10:00:00Z");
  });

  it("sépare les challenges et les utilisateurs", async () => {
    await milestoneStore.recordFirst("a", "APPLICATIONS_READY", "2026-07-01T10:00:00Z");
    await milestoneStore.recordFirst("b", "BOLE_FILE_PREPARED", "2026-07-02T10:00:00Z");

    expect(await milestoneStore.dates("a")).toEqual({ APPLICATIONS_READY: "2026-07-01T10:00:00Z" });
    expect(await milestoneStore.dates("b")).toEqual({ BOLE_FILE_PREPARED: "2026-07-02T10:00:00Z" });
  });

  it("ne renvoie rien pour un utilisateur sans acquisition", async () => {
    expect(await milestoneStore.dates("inconnu")).toEqual({});
  });
});
