/**
 * Pages légales (revue §A1).
 *
 * Ces textes engagent juridiquement l'éditeur. Certaines mentions ne peuvent
 * venir que de lui : raison sociale, immatriculation, adresse, hébergeur,
 * médiateur de la consommation. Elles sont donc marquées `PENDING` plutôt que
 * remplies d'une valeur plausible.
 *
 * Le choix est le même que pour les règles du Moteur A et les sections
 * `OFFICIAL_RULE` des modules : **ce qui n'est pas établi n'est pas affirmé**.
 * Une raison sociale inventée dans des mentions légales ne serait pas un
 * brouillon, ce serait une fausse mention — et elle passerait inaperçue
 * précisément parce qu'elle a l'air complète.
 *
 * `missingEntries` remonte ce qui manque ; les pages l'affichent en clair et le
 * garde-fou `check:legal` refuse de considérer un document comme publiable.
 */

/** Valeur qui n'a pas encore été fournie par l'éditeur. */
export const PENDING = "À COMPLÉTER" as const;

export function isPending(value: string): boolean {
  return value.trim() === PENDING || value.trim() === "";
}

/** Une mention factuelle : libellé + valeur. */
export interface LegalEntry {
  label: string;
  value: string;
  /** Pourquoi cette mention est exigée — sert de consigne à qui la complète. */
  why?: string;
}

export type LegalBlock =
  | { kind: "TEXT"; body: string[] }
  | { kind: "LIST"; intro?: string; items: string[] }
  | { kind: "ENTRIES"; entries: LegalEntry[] }
  | {
      kind: "TABLE";
      columns: [string, string, string];
      rows: Array<[string, string, string]>;
    };

export interface LegalSection {
  id: string;
  title: string;
  blocks: LegalBlock[];
}

export interface LegalDocument {
  slug: string;
  title: string;
  intro: string;
  /** Date de dernière révision du texte, ISO `YYYY-MM-DD`. */
  updatedAt: string;
  sections: LegalSection[];
}

/** Mentions encore à fournir, dans l'ordre du document. */
export function missingEntries(document: LegalDocument): LegalEntry[] {
  const missing: LegalEntry[] = [];
  for (const section of document.sections) {
    for (const block of section.blocks) {
      if (block.kind !== "ENTRIES") continue;
      for (const entry of block.entries) {
        if (isPending(entry.value)) missing.push(entry);
      }
    }
  }
  return missing;
}

export function isComplete(document: LegalDocument): boolean {
  return missingEntries(document).length === 0;
}
