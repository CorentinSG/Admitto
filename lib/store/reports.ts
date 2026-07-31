import type { Assessment } from "@/lib/assessment/compute";
import type { Deduction } from "@/lib/payments/deduction";
import { db, usingDatabase } from "@/lib/db/client";
import type { ReportStatus } from "./report-status";

/**
 * File de rapports et journal des corrections (CDC §18 et §33).
 *
 * Prisma quand `DATABASE_URL` est défini, mémoire du processus sinon — voir
 * `assessments.ts` pour le raisonnement.
 *
 * L'ordre de la file est calculé en base : les rapports payants d'abord
 * (CDC §18), puis l'ancienneté. Le trier en mémoire obligerait à charger toute
 * la file pour en afficher les vingt premiers.
 */

// Réexportés depuis un module sans dépendance : un composant client a besoin
// de la liste, et l'importer d'ici lui livrerait le client Prisma avec.
export { REPORT_STATUSES, type ReportStatus } from "./report-status";

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

interface ReportRow {
  id: string;
  assessmentId: string;
  status: string;
  priority: string;
  createdAt: Date;
  sentAt: Date | null;
  deduction: unknown;
  acknowledged: string[];
  corrections?: Array<{ at: Date; author: string; note: string }>;
}

function toDomain(row: ReportRow): ReportRecord {
  return {
    id: row.id,
    assessmentId: row.assessmentId,
    status: row.status as ReportStatus,
    priority: row.priority as ReportPriority,
    createdAt: row.createdAt.toISOString(),
    sentAt: row.sentAt ? row.sentAt.toISOString() : null,
    corrections: (row.corrections ?? []).map((c) => ({
      at: c.at.toISOString(),
      author: c.author,
      note: c.note,
    })),
    deduction: (row.deduction ?? null) as Deduction | null,
    acknowledged: row.acknowledged,
  };
}

const withCorrections = { corrections: { orderBy: { at: "asc" } } } as const;

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

    if (!usingDatabase()) {
      memory.set(record.id, record);
      return record;
    }

    const row = await db().report.upsert({
      where: { id: record.id },
      create: {
        id: record.id,
        assessmentId: record.assessmentId,
        status: record.status,
        priority: record.priority,
        createdAt: new Date(record.createdAt),
        acknowledged: [],
      },
      update: {},
      include: withCorrections,
    });
    return toDomain(row);
  },

  async get(id: string): Promise<ReportRecord | null> {
    if (!usingDatabase()) return memory.get(id) ?? null;
    const row = await db().report.findUnique({ where: { id }, include: withCorrections });
    return row ? toDomain(row) : null;
  },

  /**
   * File ordonnée : les rapports payants passent devant (CDC §18), puis
   * l'ancienneté. Les rapports envoyés sortent de la file active.
   */
  async queue(): Promise<ReportRecord[]> {
    if (!usingDatabase()) {
      return [...memory.values()]
        .filter((r) => r.status !== "SENT")
        .sort((a, b) => {
          if (a.priority !== b.priority) return a.priority === "PAID" ? -1 : 1;
          return a.createdAt.localeCompare(b.createdAt);
        });
    }
    const rows = await db().report.findMany({
      where: { status: { not: "SENT" } },
      // « PAID » suit « FREE » en ordre alphabétique : c'est donc un tri
      // DESCENDANT qui met les payants devant, comme l'exige le CDC §18.
      // Ajouter une valeur à REPORT_PRIORITIES demanderait de revérifier ici.
      orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
      include: withCorrections,
    });
    return rows.map(toDomain);
  },

  async all(): Promise<ReportRecord[]> {
    if (!usingDatabase()) {
      return [...memory.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    const rows = await db().report.findMany({
      orderBy: { createdAt: "desc" },
      include: withCorrections,
    });
    return rows.map(toDomain);
  },

  async setStatus(id: string, status: ReportStatus, at: string): Promise<ReportRecord | null> {
    if (!usingDatabase()) {
      const record = memory.get(id);
      if (!record) return null;
      record.status = status;
      if (status === "SENT") record.sentAt = at;
      return record;
    }
    const row = await db().report.update({
      where: { id },
      data: { status, ...(status === "SENT" ? { sentAt: new Date(at) } : {}) },
      include: withCorrections,
    });
    return toDomain(row);
  },

  /** Acquittement d'un point de revue. Idempotent : un double clic ne duplique rien. */
  async acknowledge(id: string, pointId: string): Promise<ReportRecord | null> {
    if (!usingDatabase()) {
      const record = memory.get(id);
      if (!record) return null;
      if (!record.acknowledged.includes(pointId)) record.acknowledged.push(pointId);
      return record;
    }
    const current = await db().report.findUnique({ where: { id } });
    if (!current) return null;
    if (current.acknowledged.includes(pointId)) return toDomain(current);
    const row = await db().report.update({
      where: { id },
      data: { acknowledged: { push: pointId } },
      include: withCorrections,
    });
    return toDomain(row);
  },

  async unacknowledge(id: string, pointId: string): Promise<ReportRecord | null> {
    if (!usingDatabase()) {
      const record = memory.get(id);
      if (!record) return null;
      record.acknowledged = record.acknowledged.filter((p) => p !== pointId);
      return record;
    }
    const current = await db().report.findUnique({ where: { id } });
    if (!current) return null;
    const row = await db().report.update({
      where: { id },
      data: { acknowledged: current.acknowledged.filter((p) => p !== pointId) },
      include: withCorrections,
    });
    return toDomain(row);
  },

  /** Journal des corrections humaines : trace exigée par le CDC §18 et §33. */
  async addCorrection(id: string, entry: CorrectionEntry): Promise<ReportRecord | null> {
    if (!usingDatabase()) {
      const record = memory.get(id);
      if (!record) return null;
      record.corrections.push(entry);
      return record;
    }
    const exists = await db().report.findUnique({ where: { id } });
    if (!exists) return null;
    // L'identifiant vient du `@default(uuid())` du schéma : générer ici
    // demanderait `node:crypto`, or ce module est atteint depuis un composant
    // client via l'action serveur, et le bundle client ne résout pas `node:`.
    await db().correction.create({
      data: {
        reportId: id,
        at: new Date(entry.at),
        author: entry.author,
        note: entry.note,
      },
    });
    const row = await db().report.findUnique({ where: { id }, include: withCorrections });
    return row ? toDomain(row) : null;
  },

  /**
   * Paiement confirmé : le rapport passe en priorité payante (CDC §18) et la
   * fenêtre de déduction de trente jours s'ouvre (CDC §16.2).
   * Idempotent : un webhook rejoué ne réouvre pas la fenêtre.
   */
  async markPaid(id: string, deduction: Deduction): Promise<ReportRecord | null> {
    if (!usingDatabase()) {
      const record = memory.get(id);
      if (!record) return null;
      if (record.priority === "PAID") return record;
      record.priority = "PAID";
      record.deduction = deduction;
      return record;
    }
    const current = await db().report.findUnique({ where: { id }, include: withCorrections });
    if (!current) return null;
    if (current.priority === "PAID") return toDomain(current);
    const row = await db().report.update({
      where: { id },
      data: { priority: "PAID", deduction: deduction as object },
      include: withCorrections,
    });
    return toDomain(row);
  },

  /** Nombre de rapports actifs, qui pilote le délai annoncé (CDC §18). */
  async activeCount(): Promise<number> {
    if (!usingDatabase()) {
      return [...memory.values()].filter((r) => r.status !== "SENT").length;
    }
    return db().report.count({ where: { status: { not: "SENT" } } });
  },
};
