"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ACCESS_COOKIE, verifyAccessToken } from "@/lib/access/session";
import { roadmapStore } from "@/lib/store/roadmap";
import { TASK_STATUSES, type TaskStatus } from "@/lib/roadmap/types";
import { TASK_TEMPLATES } from "@/content/roadmap-tasks";

/**
 * Changement de statut d'une tâche (CDC §22).
 *
 * L'identifiant d'évaluation vient du cookie signé, jamais du client : un
 * utilisateur ne peut pas modifier la feuille de route d'un autre.
 */
export async function setTaskStatus(taskId: string, status: string) {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  const assessmentId = await verifyAccessToken(token, new Date());
  if (!assessmentId) return { error: "Accès expiré. Reconnectez-vous depuis votre résultat." };

  if (!(TASK_STATUSES as readonly string[]).includes(status)) {
    return { error: "Statut inconnu." };
  }
  // « Non applicable » est déterminé par le parcours type, pas choisi.
  if (status === "NOT_APPLICABLE") {
    return { error: "Ce statut découle de votre parcours type." };
  }
  if (!TASK_TEMPLATES.some((t) => t.id === taskId)) {
    return { error: "Tâche inconnue." };
  }

  await roadmapStore.setStatus(assessmentId, taskId, status as TaskStatus);
  revalidatePath("/app/dashboard");
  revalidatePath("/app/roadmap");
  return { ok: true };
}
