import type { DocumentType, RefusalReason } from "@/lib/vault/types";
import { MAX_DOCUMENTS_PER_TYPE, MAX_FILE_BYTES, REFUSED_CATEGORIES } from "@/lib/vault/types";

/** Copie du coffre de documents (CDC §29). */

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  CV: "CV",
  PERSONAL_STATEMENT: "Personal statement",
  SCHOOL_LIST: "Liste d'écoles",
  WORKING_DOC: "Document de travail",
  CHECKLIST: "Checklist",
};

export const DOCUMENT_TYPE_HINTS: Record<DocumentType, string> = {
  CV: "Votre CV au format américain, celui que vous joignez à vos candidatures.",
  PERSONAL_STATEMENT: "Le texte de candidature, dans sa version en cours ou définitive.",
  SCHOOL_LIST: "La liste des programmes visés, avec vos critères de sélection.",
  WORKING_DOC: "Notes, comparatifs, brouillons — ce qui vous sert à décider.",
  CHECKLIST: "Vos listes de pièces et de démarches à suivre.",
};

export const REFUSAL_MESSAGES: Record<RefusalReason, string> = {
  UNKNOWN_TYPE: "Ce type de document n'existe pas dans le coffre.",
  SENSITIVE_CONTENT:
    "Ce document semble relever d'une catégorie que le coffre n'accueille pas. Rien n'a été transmis ni conservé.",
  EXTENSION_NOT_ALLOWED:
    "Ce format n'est pas accepté. Le coffre reçoit des documents (PDF, Word, OpenDocument, texte, CSV), pas des images.",
  TOO_LARGE: `Ce fichier dépasse ${Math.round(MAX_FILE_BYTES / (1024 * 1024))} Mo.`,
  EMPTY: "Ce fichier est vide.",
  TOO_MANY: `Vous avez déjà ${MAX_DOCUMENTS_PER_TYPE} documents de ce type. Supprimez-en un avant d'en ajouter un autre.`,
};

export const vault = {
  title: "Vos documents",
  intro:
    "Le coffre ne range que les pièces dont vous avez besoin pour avancer : CV, personal statement, liste d'écoles, documents de travail et checklists. Rien d'autre n'y entre.",
  minimisationTitle: "Ce que le coffre n'accueille jamais",
  minimisationIntro:
    "Ces pièces restent chez vous. Elles ne sont ni demandées, ni transmises, ni conservées, y compris lorsqu'une démarche les exige par ailleurs.",
  refusedCategories: REFUSED_CATEGORIES,
  disabledTitle: "Dépôt de fichiers indisponible",
  disabledBody:
    "Le stockage n'est pas activé sur cette instance. Vous pouvez déclarer ci-dessous les documents que vous avez préparés : Admitto en suit l'avancement sans qu'aucun fichier ne quitte votre ordinateur.",
  declaredNote: "Document déclaré — aucun fichier conservé.",
  addLabel: "Ajouter",
  declareLabel: "Déclarer ce document",
  chooseFile: "Choisir un fichier",
  removeLabel: "Retirer",
  emptyState: "Aucun document pour le moment.",
  typeColumn: "Type",
  countSuffix: (n: number) => `${n} / ${MAX_DOCUMENTS_PER_TYPE}`,
  sensitivePrefix: "Catégorie concernée",
  accessError: "Session expirée. Reconnectez-vous pour poursuivre.",
  dashboardEmpty:
    "Vous n'avez encore rangé aucun document. Le coffre n'accueille que CV, personal statements, listes d'écoles, documents de travail et checklists.",
  dashboardLink: "Ouvrir le coffre",
};
