import type { ReportStatus } from "@/lib/store/reports";

/** Libellés du back-office (CDC §33). */
export const STATUS_LABELS: Record<ReportStatus, string> = {
  QUEUED: "En attente",
  IN_REVIEW: "En relecture",
  SENT: "Envoyé",
};
