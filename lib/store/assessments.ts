import type { Assessment } from "@/lib/assessment/compute";
import type { PartnershipDetection } from "@/lib/partnerships/detect";
import type { CostEstimate } from "@/lib/costs/estimate";
import type { Deadline } from "@/lib/deadlines/compute";
import type { PreliminaryPath } from "@/lib/engine-a/types";
import type { DerivedProfile } from "@/lib/profile/derive";
import type { Answers } from "@/lib/questionnaire/types";
import { db, usingDatabase } from "@/lib/db/client";

/**
 * Persistance des évaluations (PLAN.md §4).
 *
 * Deux implémentations derrière une seule interface : Prisma quand
 * `DATABASE_URL` est défini, mémoire du processus sinon. Elles vivent dans le
 * même fichier volontairement — séparées, elles divergeraient sans que rien ne
 * le signale. Le contrat commun est vérifié par `lib/store/stores.test.ts`,
 * qui tourne contre le backend actif : sans base il couvre la mémoire, avec
 * base il couvre Prisma.
 *
 * Le profil est stocké tel qu'il a été répondu. Recalculer `derived`,
 * `partnerships` ou `costs` à la lecture ferait qu'un rapport rouvert six mois
 * plus tard s'appuierait sur des barèmes qui ont changé depuis.
 */
export interface AssessmentStore {
  save(assessment: Assessment): Promise<void>;
  get(id: string): Promise<Assessment | null>;
  all(): Promise<Assessment[]>;
  /**
   * Diagnostics créés depuis une date, du plus ancien au plus récent.
   *
   * Existe pour les passages planifiés. Ils balayaient `all()` : la séquence
   * email et les rappels d'échéance relisaient donc TOUS les diagnostics jamais
   * soumis, à chaque passage, pour toujours. Un diagnostic vieux de six mois ne
   * peut plus rien recevoir — la séquence s'arrête à J+25, et rien de plus
   * tardif que `MAX_LATE_DAYS` n'est expédié — mais il coûtait une lecture de
   * son journal à chaque tour. Le coût du passage grandissait avec l'histoire
   * du produit au lieu de son activité.
   */
  createdSince(date: Date): Promise<Assessment[]>;
  /**
   * Retrait du consentement marketing (CDC §34).
   *
   * Stocké à part de `answers.consentMarketing`, qui reste figé : cette
   * réponse est la preuve de ce qui a été consenti, et l'écraser pour
   * matérialiser un retrait effacerait cette preuve. Le consentement effectif
   * est donc « a répondu oui » ET « n'a pas retiré ».
   *
   * `unsubscribe` est idempotent : cliquer deux fois sur le lien d'un email ne
   * doit pas produire d'erreur, seulement le même résultat.
   */
  unsubscribe(id: string): Promise<boolean>;
  isUnsubscribed(id: string): Promise<boolean>;
}

/**
 * Le Map est accroché à globalThis, et non au module : Next.js peut instancier
 * le même module plusieurs fois (bundles séparés pour l'action serveur et pour
 * la page). Même motif que le singleton Prisma.
 */
const globalStore = globalThis as typeof globalThis & {
  __admittoAssessments?: Map<string, Assessment>;
};
const memory = (globalStore.__admittoAssessments ??= new Map<string, Assessment>());

const globalUnsub = globalThis as typeof globalThis & { __admittoUnsubscribed?: Set<string> };
const unsubscribed = (globalUnsub.__admittoUnsubscribed ??= new Set<string>());

interface AssessmentRow {
  id: string;
  createdAt: Date;
  answers: unknown;
  derived: unknown;
  path: string;
  textBlocks: string[];
  partnerships: unknown;
  costs: unknown;
  deadlines: unknown;
  rulesSnapshot: unknown;
}

/** Ligne Prisma → type du domaine. Les dates redeviennent des chaînes ISO. */
function toDomain(row: AssessmentRow): Assessment {
  return {
    id: row.id,
    createdAt: row.createdAt.toISOString(),
    answers: row.answers as Answers,
    derived: row.derived as DerivedProfile,
    path: row.path as PreliminaryPath,
    textBlocks: row.textBlocks,
    partnerships: row.partnerships as PartnershipDetection,
    costs: row.costs as CostEstimate,
    deadlines: row.deadlines as Deadline[],
    rulesSnapshot: row.rulesSnapshot as Assessment["rulesSnapshot"],
  };
}

/** Type du domaine → colonnes Prisma. */
function toRow(assessment: Assessment) {
  return {
    id: assessment.id,
    createdAt: new Date(assessment.createdAt),
    // Dénormalisé et normalisé en minuscules : c'est cette colonne qui
    // rattache le diagnostic au compte à la première connexion (CDC §10).
    // La casse d'une adresse saisie à la main varie ; la comparaison, non.
    email: assessment.answers.email?.trim().toLowerCase() ?? null,
    answers: assessment.answers as object,
    derived: assessment.derived as object,
    path: assessment.path,
    textBlocks: assessment.textBlocks,
    partnerships: assessment.partnerships as object,
    costs: assessment.costs as object,
    deadlines: assessment.deadlines as object,
    rulesSnapshot: assessment.rulesSnapshot as object,
  };
}

export const assessmentStore: AssessmentStore = {
  async save(assessment) {
    if (!usingDatabase()) {
      memory.set(assessment.id, assessment);
      return;
    }
    const row = toRow(assessment);
    // Idempotent : une correction de profil réécrit la ligne au lieu d'échouer.
    await db().assessment.upsert({ where: { id: assessment.id }, create: row, update: row });
  },

  async get(id) {
    if (!usingDatabase()) return memory.get(id) ?? null;
    const row = await db().assessment.findUnique({ where: { id } });
    return row ? toDomain(row) : null;
  },

  async all() {
    if (!usingDatabase()) return [...memory.values()];
    const rows = await db().assessment.findMany({ orderBy: { createdAt: "asc" } });
    return rows.map(toDomain);
  },

  async createdSince(date) {
    const floor = date.toISOString();
    if (!usingDatabase()) {
      return [...memory.values()]
        .filter((assessment) => assessment.createdAt >= floor)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    }
    const rows = await db().assessment.findMany({
      where: { createdAt: { gte: date } },
      orderBy: { createdAt: "asc" },
    });
    return rows.map(toDomain);
  },

  async unsubscribe(id) {
    if (!usingDatabase()) {
      if (!memory.has(id)) return false;
      unsubscribed.add(id);
      return true;
    }
    // `updateMany` plutôt que `update` : un identifiant inconnu rend 0 au lieu
    // de lever, et le lien d'un email périmé affiche alors une page calme.
    const { count } = await db().assessment.updateMany({
      where: { id },
      data: { unsubscribedAt: new Date() },
    });
    return count > 0;
  },

  async isUnsubscribed(id) {
    if (!usingDatabase()) return unsubscribed.has(id);
    const row = await db().assessment.findUnique({
      where: { id },
      select: { unsubscribedAt: true },
    });
    return row?.unsubscribedAt != null;
  },
};
