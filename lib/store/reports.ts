import type { Assessment } from "@/lib/assessment/compute";
import type { Deduction } from "@/lib/payments/deduction";

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
  /** Fenêtre de déduction ouverte par le paiement du diagnostic (CDC §16.2). */
  deduction: Deduction | null;
  /**
   * Points de revue traités (CDC §17). Ce sont des identifiants dérivés du
   * profil : ils sont recalculés à chaque affichage, jamais stockés en dur.
   * Un acquittement qui ne correspond plus à aucun point disparaît donc de
   * lui-même — un profil corrigé rouvre sa revue.
   */
  acknowledged: string[];
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
      deduction: null,
      acknowledged: [],
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

  /** Acquittement d'un point de revue. Idempotent : un double clic ne duplique rien. */
  async acknowledge(id: string, pointId: string): Promise<ReportRecord | null> {
    const record = memory.get(id);
    if (!record) return null;
    if (!record.acknowledged.includes(pointId)) record.acknowledged.push(pointId);
    return record;
  },

  async unacknowledge(id: string, pointId: string): Promise<ReportRecord | null> {
    const record = memory.get(id);
    if (!record) return null;
    record.acknowledged = record.acknowledged.filter((p) => p !== pointId);
    return record;
  },

  /** Journal des corrections humaines : trace exigée par le CDC §18 et §33. */
  async addCorrection(id: string, entry: CorrectionEntry): Promise<ReportRecord | null> {
    const record = memory.get(id);
    if (!record) return null;
    record.corrections.push(entry);
    return record;
  },

  /**
   * Paiement confirmé : le rapport passe en priorité payante (CDC §18) et la
   * fenêtre de déduction de trente jours s'ouvre (CDC §16.2).
   * Idempotent : un webhook rejoué ne réouvre pas la fenêtre.
   */
  async markPaid(id: string, deduction: Deduction): Promise<ReportRecord | null> {
    const record = memory.get(id);
    if (!record) return null;
    if (record.priority === "PAID") return record;
    record.priority = "PAID";
    record.deduction = deduction;
    return record;
  },

  /** Nombre de rapports actifs, qui pilote le délai annoncé (CDC §18). */
  async activeCount(): Promise<number> {
    return [...memory.values()].filter((r) => r.status !== "SENT").length;
  },
};
