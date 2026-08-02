import { describe, expect, it } from "vitest";
import { intakeWindow } from "./window";
import { generateRoadmap } from "./generate";
import { deriveProfile } from "@/lib/profile/derive";
import type { Answers } from "@/lib/questionnaire/types";

const BASE = {
  status: "APPLYING",
  education: "M2",
  university: "paris1",
  foreignBar: "NONE",
  careerGoal: "BIG_LAW",
  geoGoal: "KEEP_BOTH",
  budget: "60_100K",
  funding: "BOTH",
  english: "NOT_STARTED",
  usStatus: "FR_NO_STATUS",
  firstName: "C",
  email: "c@example.fr",
} as const;

const windowAt = (jour: string, over: Partial<Answers> = {}) => {
  const answers = { ...BASE, intake: "Y1", ...over } as Answers;
  const now = new Date(`${jour}T12:00:00Z`);
  const tasks = generateRoadmap(answers, deriveProfile(answers, now).journeyType, now);
  return intakeWindow(tasks, answers, now);
};

describe("fenêtre de la rentrée visée", () => {
  it("ne signale rien quand le temps restant couvre le calendrier", () => {
    // Inscription en janvier pour la rentrée de l'année suivante : dix-neuf
    // mois devant soi, le calendrier en suppose quatorze.
    const w = windowAt("2026-01-15")!;
    expect(w.tight).toBe(false);
    expect(w.behindCount).toBe(0);
  });

  it("mesure l'écart quand la personne arrive en cours de cycle", () => {
    // Inscription en novembre : neuf mois devant soi pour un calendrier qui en
    // suppose quatorze. C'est le cas qui produisait douze tâches « en retard »
    // dès le premier jour, sans que la personne y soit pour rien.
    const w = windowAt("2026-11-01")!;
    expect(w.tight).toBe(true);
    expect(w.monthsLeft).toBeLessThan(w.monthsNeeded);
    expect(w.behindCount).toBeGreaterThan(0);
    // Le cycle suivant est nommé, pas imposé.
    expect(w.nextYear).toBe(w.targetYear + 1);
  });

  it("mesure le calendrier du PROFIL, pas celui du catalogue", () => {
    // Un parcours dont les tâches sont toutes tardives n'a pas besoin de
    // quatorze mois : lire le maximum sur le catalogue le déclarerait serré
    // à tort.
    const admis = windowAt("2026-11-01", { status: "ADMITTED_OR_ENROLLED" })!;
    const candidat = windowAt("2026-11-01")!;
    expect(admis.monthsNeeded).toBeLessThan(candidat.monthsNeeded);
    expect(admis.tight).toBe(false);
  });

  it("ne se prononce pas quand la question ne se pose pas", () => {
    // Rentrée non décidée, ou parcours déjà commencé : il n'y a pas de fenêtre
    // à mesurer, et l'écran dit déjà autre chose à ces personnes.
    expect(windowAt("2026-11-01", { intake: "UNDECIDED" })).toBeNull();
    expect(windowAt("2026-11-01", { intake: "ALREADY_STARTED" })).toBeNull();
  });
});
