"use server";

import { revalidatePath } from "next/cache";
import { reportStore, REPORT_STATUSES, type ReportStatus } from "@/lib/store/reports";

/**
 * Actions du back-office (CDC §33).
 * Toute transition de statut et toute correction humaine sont journalisées.
 */

export async function setReportStatus(id: string, status: string) {
  if (!(REPORT_STATUSES as readonly string[]).includes(status)) {
    return { error: "Statut inconnu." };
  }
  const updated = await reportStore.setStatus(id, status as ReportStatus, new Date().toISOString());
  if (!updated) return { error: "Rapport introuvable." };

  revalidatePath("/admin");
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
