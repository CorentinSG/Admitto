import { describe, expect, it } from "vitest";
import { declaredDone } from "./declared";
import { generateRoadmap } from "./generate";
import { deriveProfile } from "@/lib/profile/derive";
import type { Answers } from "@/lib/questionnaire/types";

const NOW = new Date("2026-08-01T12:00:00Z");

const BASE = {
  status: "APPLYING",
  education: "M2",
  university: "paris1",
  foreignBar: "NONE",
  careerGoal: "BIG_LAW",
  geoGoal: "KEEP_BOTH",
  budget: "60_100K",
  funding: "BOTH",
  intake: "Y1",
  usStatus: "FR_NO_STATUS",
  firstName: "C",
  email: "c@example.fr",
} as const;

const forAnswers = (over: Partial<Answers>) => {
  const answers = { ...BASE, ...over } as Answers;
  const tasks = generateRoadmap(answers, deriveProfile(answers, NOW).journeyType, NOW);
  return { tasks, declared: declaredDone(tasks, answers) };
};

describe("réponses explicites redites à l'écran", () => {
  it("signale la tâche dont la personne a déclaré le travail fait", () => {
    const { declared } = forAnswers({ english: "TEST_TAKEN" });
    expect(declared).toEqual([{ taskId: "T-SEL-02", answerLabel: "Test déjà passé" }]);
  });

  it("ne change AUCUN statut : la personne coche, pas le système", () => {
    // La règle du CDC §24 est respectée à la lettre. Cocher à sa place
    // gonflerait la progression et offrirait un Milestone Challenge non mérité.
    const { tasks } = forAnswers({ english: "TEST_TAKEN" });
    expect(tasks.find((t) => t.id === "T-SEL-02")!.status).toBe("TODO");
  });

  it("ne signale rien pour un travail seulement engagé", () => {
    // « Test programmé » ou « préparation commencée » décrivent une tâche en
    // cours : un « à confirmer » posé dessus ferait plus de dégâts que l'oubli
    // qu'il corrige.
    for (const english of ["TEST_PLANNED", "PREP_STARTED", "NOT_STARTED"] as const) {
      expect(forAnswers({ english }).declared, english).toEqual([]);
    }
  });

  it("ne signale rien quand la tâche ne concerne pas le parcours", () => {
    // Un profil « vise le barreau » n'a pas la tâche de test d'anglais : lui
    // parler d'une tâche absente n'aurait aucun sens.
    const { declared } = forAnswers({ status: "TARGETING_BAR", english: "TEST_TAKEN" });
    expect(declared).toEqual([]);
  });
});
