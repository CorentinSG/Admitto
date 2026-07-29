import {
  ALLOWED_EXTENSIONS,
  DOCUMENT_TYPES,
  MAX_DOCUMENTS_PER_TYPE,
  MAX_FILE_BYTES,
  type DocumentType,
  type RefusalReason,
} from "./types";

/**
 * Décision d'acceptation d'un dépôt (CDC §29).
 *
 * La décision est prise avant qu'un seul octet ne soit écrit : un fichier
 * refusé ne doit jamais avoir transité par le stockage, sans quoi la
 * minimisation ne serait qu'une promesse d'affichage.
 */

/**
 * Repères de contenu sensible cherchés dans le nom du fichier.
 *
 * Ce n'est qu'un second filet — le premier est la liste fermée des cinq types.
 * Les motifs sont volontairement précis : « visa » seul n'est pas retenu, car
 * une checklist de démarches visa est légitime ; le CDC ne refuse que le
 * dossier de visa complet.
 */
const SENSITIVE_PATTERNS: Array<{ pattern: RegExp; category: string }> = [
  { pattern: /\bpasse?ports?\b/, category: "Passeport et pièces d'identité" },
  { pattern: /\bcarte d identite\b|\bcni\b|\btitre de sejour\b/, category: "Passeport et pièces d'identité" },
  { pattern: /\bcharacter and fitness\b|\bcharacter fitness\b/, category: "Dossier Character and Fitness" },
  { pattern: /\bcasier judiciaire\b|\bdisciplinaire\b|\bdisciplinary\b/, category: "Documents médicaux ou disciplinaires" },
  { pattern: /\bmedical\b|\bmedicaux\b|\bvaccination\b|\bordonnance\b/, category: "Documents médicaux ou disciplinaires" },
  {
    pattern: /\breleve bancaire\b|\bbank statement\b|\brib\b|\bavis d imposition\b|\btax return\b/,
    category: "Relevés bancaires et pièces financières sensibles",
  },
  {
    pattern: /\bi 20\b|\bds 160\b|\bds160\b|\bi 94\b|\bsevis\b|\bdossier visa\b|\bvisa file\b/,
    category: "Dossiers de visa complets",
  },
];

/** Signes diacritiques combinants, construits par échappement plutôt qu'en littéral : une plage
 *  de caractères invisibles dans le source se corrompt au premier copier-coller. */
const COMBINING_MARKS = new RegExp("[\\u0300-\\u036f]", "g");

/** Minuscules, sans accents, séparateurs unifiés : « Relevé_Bancaire.PDF » et « releve bancaire.pdf » se valent. */
function normalize(fileName: string): string {
  return fileName
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function extensionOf(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  return dot === -1 ? "" : fileName.slice(dot).toLowerCase();
}

/** Catégorie sensible détectée dans le nom du fichier, sinon `null`. */
export function detectSensitiveCategory(fileName: string): string | null {
  const normalized = normalize(fileName);
  for (const { pattern, category } of SENSITIVE_PATTERNS) {
    if (pattern.test(normalized)) return category;
  }
  return null;
}

export interface UploadCandidate {
  type: string;
  fileName: string;
  sizeBytes: number;
  /** Nombre de documents déjà déposés pour ce type. */
  existingOfType: number;
}

export type UploadDecision =
  | { accepted: true; type: DocumentType }
  | { accepted: false; reason: RefusalReason; detail?: string };

export function decideUpload(candidate: UploadCandidate): UploadDecision {
  if (!(DOCUMENT_TYPES as readonly string[]).includes(candidate.type)) {
    return { accepted: false, reason: "UNKNOWN_TYPE" };
  }

  const sensitive = detectSensitiveCategory(candidate.fileName);
  if (sensitive) {
    return { accepted: false, reason: "SENSITIVE_CONTENT", detail: sensitive };
  }

  const extension = extensionOf(candidate.fileName);
  if (!(ALLOWED_EXTENSIONS as readonly string[]).includes(extension)) {
    return { accepted: false, reason: "EXTENSION_NOT_ALLOWED", detail: extension || "sans extension" };
  }

  if (candidate.sizeBytes <= 0) return { accepted: false, reason: "EMPTY" };
  if (candidate.sizeBytes > MAX_FILE_BYTES) return { accepted: false, reason: "TOO_LARGE" };

  if (candidate.existingOfType >= MAX_DOCUMENTS_PER_TYPE) {
    return { accepted: false, reason: "TOO_MANY" };
  }

  return { accepted: true, type: candidate.type as DocumentType };
}
