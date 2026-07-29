/**
 * Document vault (CDC §29) — types fermés et limites.
 *
 * Le coffre est volontairement minimal : cinq types de documents, aucun autre.
 * C'est la liste elle-même qui est le premier contrôle de minimisation — il n'y
 * a pas d'option « passeport » à choisir, donc pas de passeport à refuser
 * ensuite.
 */

export const DOCUMENT_TYPES = [
  "CV",
  "PERSONAL_STATEMENT",
  "SCHOOL_LIST",
  "WORKING_DOC",
  "CHECKLIST",
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

/**
 * Catégories que le coffre n'accueille jamais (CDC §29).
 *
 * Cette liste n'est pas une liste de types acceptés en attente : elle sert à
 * expliquer le refus à l'utilisateur et à documenter ce que le produit ne
 * conserve pas. La conserver en dur, à côté des types autorisés, évite qu'un
 * ajout futur à `DOCUMENT_TYPES` se fasse sans relire l'interdit.
 */
export const REFUSED_CATEGORIES = [
  "Passeport et pièces d'identité",
  "Dossier Character and Fitness",
  "Documents médicaux ou disciplinaires",
  "Relevés bancaires et pièces financières sensibles",
  "Dossiers de visa complets",
] as const;

/**
 * Extensions acceptées.
 *
 * Aucun format image : un CV, une liste d'écoles ou une checklist se déposent
 * en document, jamais en photo. Écarter les images écarte du même geste les
 * scans de pièces d'identité, qui sont précisément ce que le CDC §29 refuse.
 */
export const ALLOWED_EXTENSIONS = [
  ".pdf",
  ".doc",
  ".docx",
  ".odt",
  ".rtf",
  ".txt",
  ".md",
  ".csv",
] as const;

/** 10 Mo : un mémoire de candidature n'en pèse jamais autant. */
export const MAX_FILE_BYTES = 10 * 1024 * 1024;

/** Un document par type et par utilisateur : le coffre suit un dossier, pas une archive. */
export const MAX_DOCUMENTS_PER_TYPE = 3;

export interface VaultDocument {
  id: string;
  assessmentId: string;
  type: DocumentType;
  fileName: string;
  sizeBytes: number;
  uploadedAt: string;
  /** Absent quand le stockage n'est pas configuré : la fiche existe, pas le fichier. */
  storageKey: string | null;
}

export type RefusalReason =
  | "UNKNOWN_TYPE"
  | "SENSITIVE_CONTENT"
  | "EXTENSION_NOT_ALLOWED"
  | "TOO_LARGE"
  | "EMPTY"
  | "TOO_MANY";
