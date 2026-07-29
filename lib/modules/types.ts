/**
 * Modèle de contenu des modules (CDC §25).
 *
 * Une section est de l'un des deux genres seulement, et le type l'impose :
 *
 * - `METHOD` — méthode, cadre de décision, question à se poser. Rien à sourcer
 *   parce que rien n'y est affirmé du droit ou d'une procédure officielle.
 * - `OFFICIAL_RULE` — énoncé d'une règle, d'un délai ou d'une procédure d'une
 *   autorité. La source est un champ **obligatoire** du type : il n'existe pas
 *   de façon d'écrire une telle section sans indiquer d'où elle vient et quand
 *   elle a été vérifiée. Même discipline que les règles du Moteur A, appliquée
 *   ici à la pédagogie — un module se lit comme une instruction, il ne peut pas
 *   être moins sourcé qu'une règle de moteur.
 */

export interface ModuleSource {
  label: string;
  url: string;
  /** ISO `YYYY-MM-DD`. Une source jamais vérifiée n'ouvre pas la publication. */
  verifiedAt: string;
}

export type ModuleSection =
  | {
      kind: "METHOD";
      id: string;
      title: string;
      body: string[];
      keyPoints?: string[];
    }
  | {
      kind: "OFFICIAL_RULE";
      id: string;
      title: string;
      body: string[];
      keyPoints?: string[];
      source: ModuleSource;
    };

export interface ModuleEntry {
  slug: string;
  order: number;
  title: string;
  summary: string;
  /** Durée de lecture annoncée, en minutes. */
  readingMinutes: number;
  published: boolean;
  sections: ModuleSection[];
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Un module ne peut être publié que si chacune de ses sections officielles
 * porte une source datée, et s'il a du contenu.
 *
 * Le champ `published` reste une décision éditoriale ; cette fonction est le
 * garde-fou qui empêche que cette décision passe outre le sourçage. Elle est
 * appelée au rendu, pas seulement en test : un module mal formé disparaît de
 * la bibliothèque plutôt que d'être servi non sourcé.
 */
export function publicationBlockers(entry: ModuleEntry): string[] {
  const blockers: string[] = [];

  if (entry.sections.length === 0) {
    blockers.push("aucune section");
  }

  for (const section of entry.sections) {
    if (section.body.length === 0) {
      blockers.push(`section « ${section.id} » sans contenu`);
    }
    if (section.kind !== "OFFICIAL_RULE") continue;

    const { source } = section;
    if (!source.url.startsWith("https://")) {
      blockers.push(`section « ${section.id} » : source sans URL officielle`);
    }
    if (!ISO_DATE.test(source.verifiedAt)) {
      blockers.push(`section « ${section.id} » : date de vérification absente ou mal formée`);
    }
  }

  return blockers;
}

export function isPublishable(entry: ModuleEntry): boolean {
  return entry.published && publicationBlockers(entry).length === 0;
}
