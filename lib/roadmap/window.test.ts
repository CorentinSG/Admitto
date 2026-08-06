import { describe, expect, it } from "vitest";
import { closedCycle, intakeWindow } from "./window";
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

describe("cycle entièrement derrière", () => {
  const tasksAt = (jour: string, over: Partial<Answers> = {}) => {
    const answers = { ...BASE, intake: "Y1", ...over } as Answers;
    const now = new Date(`${jour}T12:00:00Z`);
    return { tasks: generateRoadmap(answers, deriveProfile(answers, now).journeyType, now), now };
  };

  it("signale le cas mesuré : le LL.M. commencé l'an dernier", () => {
    /*
     * Cent douze profils sur trois mille trois cent soixante, et pas un profil
     * rare : c'est celui qui vient de finir son LL.M. et découvre le barreau.
     * Toutes ses échéances — dépôt du dossier, inscription à l'examen — sont
     * derrière lui, et le produit lui proposait de les « rattraper ».
     */
    const { tasks, now } = tasksAt("2026-08-06", {
      status: "ADMITTED_OR_ENROLLED",
      intake: "ALREADY_STARTED",
    });
    expect(closedCycle(tasks, now)).toEqual({ datedCount: expect.any(Number) });
    expect(closedCycle(tasks, now)!.datedCount).toBeGreaterThan(0);
  });

  it("se tait dès qu'une seule échéance reste devant", () => {
    // Il y a alors encore un calendrier à tenir, et c'est `intakeWindow` qui
    // dit ce qu'il faut en dire. Deux encarts sur le même sujet se
    // contrediraient.
    const { tasks, now } = tasksAt("2026-08-06");
    expect(closedCycle(tasks, now)).toBeNull();
  });

  it("se tait quand rien n'est daté", () => {
    // Sans échéance, il n'y a pas de cycle à déclarer clos — l'écran dit déjà
    // autre chose à ces personnes.
    const { tasks, now } = tasksAt("2026-08-06", { intake: "UNDECIDED" });
    expect(closedCycle(tasks, now)).toBeNull();
  });
});
