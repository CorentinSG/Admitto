"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { currentAssessmentId } from "@/lib/auth/current";
import { scenarioStore } from "@/lib/store/scenarios";
import { CITIES, type City, type ScenarioInputs } from "@/lib/simulator/types";
import { defaultInputs } from "@/lib/simulator/defaults";

/**
 * Enregistrement et suppression des scénarios (CDC §26).
 * Comme pour la roadmap, l'identifiant d'évaluation vient du cookie signé.
 */

const NUMERIC_FIELDS: Array<keyof ScenarioInputs> = [
  "tuition",
  "universityFees",
  "lsac",
  "translations",
  "studyMonths",
  "housingMonthly",
  "dailyLivingMonthly",
  "transportMonthly",
  "insurance",
  "visa",
  "travel",
  "barPrep",
  "exams",
  "retake",
  "admission",
  "noIncomeMonths",
  "scholarships",
  "partnerships",
];

/** Revalidation côté serveur : jamais de montant absurde ni de ville inventée. */
function parseInputs(raw: Record<string, unknown>): ScenarioInputs {
  const city = CITIES.includes(raw.city as City) ? (raw.city as City) : "OTHER";
  const parsed = defaultInputs(String(raw.label ?? "Scénario").slice(0, 60), city);

  for (const field of NUMERIC_FIELDS) {
    const value = Number(raw[field]);
    // Un montant non numérique, négatif ou déraisonnable retombe sur le défaut.
    if (Number.isFinite(value) && value >= 0 && value <= 10_000_000) {
      (parsed[field] as number) = value;
    }
  }
  return parsed;
}

export async function saveScenario(id: string | null, raw: Record<string, unknown>) {
  const assessmentId = await currentAssessmentId();
  if (!assessmentId) return { error: "Session expirée. Reconnectez-vous pour poursuivre." };

  const result = await scenarioStore.save(assessmentId, {
    id: id ?? randomUUID(),
    inputs: parseInputs(raw),
  });

  if (!result.ok) return { error: "LIMIT_REACHED" };

  revalidatePath("/app/simulateur");
  return { ok: true };
}

export async function removeScenario(scenarioId: string) {
  const assessmentId = await currentAssessmentId();
  if (!assessmentId) return { error: "Session expirée. Reconnectez-vous pour poursuivre." };

  await scenarioStore.remove(assessmentId, scenarioId);
  revalidatePath("/app/simulateur");
  return { ok: true };
}
