"use server";

import { revalidatePath } from "next/cache";
import { reportStore, REPORT_STATUSES, type ReportStatus } from "@/lib/store/reports";
import { assessmentStore } from "@/lib/store/assessments";
import { assembleReportLive } from "@/lib/matrices/load";
import { canSend, reviewChecklist } from "@/lib/report/review";

/**
 * Actions du back-office (CDC §33).
 * Toute transition de statut et toute correction humaine sont journalisées.
 */

export async function setReportStatus(id: string, status: string) {
  if (!(REPORT_STATUSES as readonly string[]).includes(status)) {
    return { error: "Statut inconnu." };
  }

  const record = await reportStore.get(id);
  if (!record) return { error: "Rapport introuvable." };

  // Le verrou de revue vit ici, pas dans l'interface : une action serveur
  // appelée directement ne doit pas pouvoir sauter la relecture (CDC §17).
  if (status === "SENT") {
    const assessment = await assessmentStore.get(record.assessmentId);
    if (!assessment) return { error: "Évaluation introuvable." };

    const verdict = canSend(
      reviewChecklist(assessment, await assembleReportLive(assessment)),
      record.acknowledged
    );
    if (!verdict.ok) {
      return {
        error: `Revue incomplète : ${verdict.pending.length} point(s) bloquant(s) à traiter avant envoi.`,
      };
    }
  }

  const updated = await reportStore.setStatus(id, status as ReportStatus, new Date().toISOString());
  if (!updated) return { error: "Rapport introuvable." };

  revalidatePath("/admin");
  revalidatePath(`/admin/rapports/${id}`);
  return { ok: true };
}

export async function setReviewPoint(id: string, pointId: string, done: boolean) {
  const updated = done
    ? await reportStore.acknowledge(id, pointId)
    : await reportStore.unacknowledge(id, pointId);
  if (!updated) return { error: "Rapport introuvable." };

  revalidatePath(`/admin/rapports/${id}`);
  return { ok: true };
}

export async function addCorrection(id: string, note: string) {
  const trimmed = note.trim();
  if (!trimmed) return { error: "La note de correction est vide." };

  const updated = await reportStore.addCorrection(id, {
    at: new Date().toISOString(),
    author: "Fondateur",
    note: trimmed.slice(0, 1000),
  });
  if (!updated) return { error: "Rapport introuvable." };

  revalidatePath(`/admin/rapports/${id}`);
  return { ok: true };
}
