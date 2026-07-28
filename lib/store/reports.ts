import type { Assessment } from "@/lib/assessment/compute";

/**
 * File de rapports et journal des corrections (CDC §18 et §33).
 *
 * ⚠️ Même implémentation de transition que `assessments.ts` : stockage en
 * mémoire accroché à globalThis, à remplacer par Prisma avant la bêta.
 */

export const REPORT_STATUSES = ["QUEUED", "IN_REVIEW", "SENT"] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

export const REPORT_PRIORITIES = ["PAID", "FREE"] as const;
export type ReportPriority = (typeof REPORT_PRIORITIES)[number];

export interface CorrectionEntry {
  at: string;
  author: string;
  note: string;
}

export interface ReportRecord {
  id: string;
  assessmentId: string;
  status: ReportStatus;
  priority: ReportPriority;
  createdAt: string;
  sentAt: string | null;
  corrections: CorrectionEntry[];
}

const globalStore = globalThis as typeof globalThis & {
  __admittoReports?: Map<string, ReportRecord>;
};
const memory = (globalStore.__admittoReports ??= new Map<string, ReportRecord>());

export const reportStore = {
  async create(assessment: Assessment, priority: ReportPriority = "FREE"): Promise<ReportRecord> {
    const record: ReportRecord = {
      id: assessment.id,
      assessmentId: assessment.id,
      status: "QUEUED",
      priority,
      createdAt: assessment.createdAt,
      sentAt: null,
      corrections: [],
    };
    memory.set(record.id, record);
    return record;
  },

  async get(id: string): Promise<ReportRecord | null> {
    return memory.get(id) ?? null;
  },

  /**
   * File ordonnée : les rapports payants passent devant (CDC §18), puis
   * l'ancienneté. Les rapports envoyés sortent de la file active.
   */
  async queue(): Promise<ReportRecord[]> {
    return [...memory.values()]
      .filter((r) => r.status !== "SENT")
      .sort((a, b) => {
        if (a.priority !== b.priority) return a.priority === "PAID" ? -1 : 1;
        return a.createdAt.localeCompare(b.createdAt);
      });
  },

  async all(): Promise<ReportRecord[]> {
    return [...memory.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async setStatus(id: string, status: ReportStatus, at: string): Promise<ReportRecord | null> {
    const record = memory.get(id);
    if (!record) return null;
    record.status = status;
    if (status === "SENT") record.sentAt = at;
    return record;
  },

  /** Journal des corrections humaines : trace exigée par le CDC §18 et §33. */
  async addCorrection(id: string, entry: CorrectionEntry): Promise<ReportRecord | null> {
    const record = memory.get(id);
    if (!record) return null;
    record.corrections.push(entry);
    return record;
  },

  /** Nombre de rapports actifs, qui pilote le délai annoncé (CDC §18). */
  async activeCount(): Promise<number> {
    return [...memory.values()].filter((r) => r.status !== "SENT").length;
  },
};
