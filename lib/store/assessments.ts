import type { Assessment } from "@/lib/assessment/compute";

/**
 * Persistance des évaluations.
 *
 * ⚠️ Implémentation de transition : stockage en mémoire du processus. Elle rend
 * le parcours complet fonctionnel en développement et en préproduction
 * mono-instance, mais elle NE convient PAS à la production — un redémarrage ou
 * une seconde instance perd les données.
 *
 * À remplacer par Prisma/PostgreSQL avant la bêta (PLAN.md §4) : la signature de
 * `AssessmentStore` est le contrat à réimplémenter, rien d'autre ne change.
 */
export interface AssessmentStore {
  save(assessment: Assessment): Promise<void>;
  get(id: string): Promise<Assessment | null>;
}

/**
 * Le Map est accroché à globalThis, et non au module : en build de production,
 * Next.js peut instancier le même module plusieurs fois (bundles séparés pour
 * l'action serveur et pour la page), ce qui donnerait deux Map distincts et une
 * évaluation introuvable juste après sa création. Même motif que le singleton
 * Prisma. Ce contournement disparaît avec la vraie base.
 */
const globalStore = globalThis as typeof globalThis & {
  __admittoAssessments?: Map<string, Assessment>;
};
const memory = (globalStore.__admittoAssessments ??= new Map<string, Assessment>());

export const assessmentStore: AssessmentStore = {
  async save(assessment) {
    memory.set(assessment.id, assessment);
  },
  async get(id) {
    return memory.get(id) ?? null;
  },
};
