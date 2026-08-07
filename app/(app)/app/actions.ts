"use server";

import { revalidatePath } from "next/cache";
import { currentAssessmentId } from "@/lib/auth/current";
import { roadmapStore } from "@/lib/store/roadmap";
import { milestoneStore } from "@/lib/store/milestones";
import { loadRoadmap } from "@/lib/roadmap/load";
import { milestoneStates } from "@/lib/roadmap/progress";
import { TASK_STATUSES, type TaskStatus } from "@/lib/roadmap/types";
import { decideNote } from "@/lib/roadmap/note";
import { TASK_TEMPLATES } from "@/content/roadmap-tasks";
import { dashboard } from "@/content/dashboard";

/**
 * Changement de statut d'une tâche (CDC §22).
 *
 * L'identifiant d'évaluation vient de la session, jamais du client : un
 * utilisateur ne peut pas modifier la feuille de route d'un autre.
 */
export async function setTaskStatus(taskId: string, status: string) {
  const assessmentId = await currentAssessmentId();
  if (!assessmentId) return { error: "Session expirée. Reconnectez-vous pour poursuivre." };

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

  // Un changement de statut peut achever un Milestone Challenge. La date est
  // enregistrée ici, au moment où l'acquisition se produit : la calculer plus
  // tard donnerait la date de consultation, pas celle de l'accomplissement.
  const loaded = await loadRoadmap(assessmentId, new Date());
  if (loaded) {
    const now = new Date().toISOString();
    for (const state of milestoneStates(loaded.tasks)) {
      if (state.achieved) await milestoneStore.recordFirst(assessmentId, state.milestone, now);
    }
  }

  revalidatePath("/app/dashboard");
  revalidatePath("/app/roadmap");
  return { ok: true };
}

/**
 * Écrit ou efface la note de suivi d'une tâche (CDC §22).
 *
 * Même garde que le statut : l'évaluation vient de la session, jamais du
 * client. La note vide efface — c'est le geste attendu quand un point est clos.
 *
 * Le statut courant est relu ici pour le passer au store : écrire une note sur
 * une tâche jamais touchée doit créer sa ligne SANS déplacer le statut que la
 * personne voit. On le lit depuis la feuille de route chargée, source de vérité
 * qui tient compte du parcours type et des écarts déjà enregistrés.
 */
export async function setTaskNote(taskId: string, rawNote: string) {
  const assessmentId = await currentAssessmentId();
  if (!assessmentId) return { error: "Session expirée. Reconnectez-vous pour poursuivre." };

  if (!TASK_TEMPLATES.some((t) => t.id === taskId)) {
    return { error: "Tâche inconnue." };
  }

  const decision = decideNote(rawNote);
  if (!decision.accepted) return { error: dashboard.taskNote.tooLong };

  const loaded = await loadRoadmap(assessmentId, new Date());
  const current = loaded?.tasks.find((t) => t.id === taskId);
  // Une tâche hors périmètre n'accepte pas de note : elle n'est pas la sienne à
  // suivre, et lui en attacher une la ferait resurgir dans une liste où elle
  // n'a rien à faire.
  if (!current || current.status === "NOT_APPLICABLE") {
    return { error: "Tâche inconnue." };
  }

  await roadmapStore.setNote(assessmentId, taskId, decision.note, current.status);

  revalidatePath("/app/dashboard");
  revalidatePath("/app/roadmap");
  return { ok: true };
}
