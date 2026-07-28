import { assessmentStore } from "@/lib/store/assessments";
import { roadmapStore } from "@/lib/store/roadmap";
import { generateRoadmap } from "./generate";
import type { Task } from "./types";
import type { Assessment } from "@/lib/assessment/compute";

/**
 * Chargement de la feuille de route d'un utilisateur : les modèles génèrent la
 * structure, le store n'apporte que les statuts modifiés.
 */
export async function loadRoadmap(
  assessmentId: string,
  reference: Date
): Promise<{ assessment: Assessment; tasks: Task[] } | null> {
  const assessment = await assessmentStore.get(assessmentId);
  if (!assessment) return null;

  const overrides = await roadmapStore.statuses(assessmentId);
  const tasks = generateRoadmap(
    assessment.answers,
    assessment.derived.journeyType,
    reference
  ).map((task) =>
    // Un statut enregistré prime, sauf pour une tâche devenue hors périmètre :
    // le parcours type reste la source de vérité sur ce qui s'applique.
    task.status === "NOT_APPLICABLE" ? task : { ...task, status: overrides[task.id] ?? task.status }
  );

  return { assessment, tasks };
}
