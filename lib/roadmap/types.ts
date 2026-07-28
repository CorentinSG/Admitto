import type { Phase } from "@/lib/profile/derive";
import type { JourneyType } from "@/lib/profile/derive";

/**
 * Feuille de route personnalisée (CDC §22) — types fermés.
 * La roadmap est le cœur du produit payant : chaque tâche porte un titre, une
 * explication, une échéance, un temps estimé, une importance, un statut, un
 * module associé et, le cas échéant, un document associé.
 */

/** Les six statuts du CDC §22 — liste fermée. */
export const TASK_STATUSES = [
  "TODO", // Action non commencée
  "IN_PROGRESS", // Action commencée
  "WAITING_THIRD_PARTY", // Accomplie par l'utilisateur, résultat externe attendu
  "DONE", // Action sous contrôle de l'utilisateur terminée
  "BLOCKED", // Prérequis ou problème empêchant la suite
  "NOT_APPLICABLE", // Action exclue pour ce profil
] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

/** Statuts qui ne comptent pas dans la progression (tâche hors périmètre). */
export const EXCLUDED_STATUSES: TaskStatus[] = ["NOT_APPLICABLE"];

/** Statuts sur lesquels l'utilisateur ne peut pas agir maintenant. */
export const NOT_ACTIONABLE: TaskStatus[] = [
  "DONE",
  "NOT_APPLICABLE",
  "WAITING_THIRD_PARTY",
  "BLOCKED",
];

export const IMPORTANCES = ["CRITICAL", "HIGH", "NORMAL"] as const;
export type Importance = (typeof IMPORTANCES)[number];

/**
 * Milestone Challenges (CDC §24). Ils ne portent QUE sur des actions contrôlées
 * par l'utilisateur : jamais un visa obtenu, une bourse obtenue, une admission,
 * un emploi trouvé ou un examen réussi.
 */
export const MILESTONES = [
  "SCHOOL_LIST_COMPLETED",
  "APPLICATIONS_READY",
  "BOLE_FILE_PREPARED",
  "BAR_REGISTRATION_COMPLETED",
  "ADMISSION_PACKAGE_PREPARED",
] as const;
export type Milestone = (typeof MILESTONES)[number];

/** Modèle de tâche, indépendant de l'utilisateur. */
export interface TaskTemplate {
  id: string;
  phase: Phase;
  title: string;
  explanation: string;
  importance: Importance;
  estimatedMinutes: number;
  /** Échéance : nombre de mois avant la rentrée visée. Négatif = après. */
  monthsBeforeIntake: number;
  /** Parcours types concernés (CDC §20). */
  journeyTypes: JourneyType[];
  /** Module pédagogique associé, le cas échéant. */
  moduleSlug?: string;
  /** Challenge auquel la tâche contribue. */
  milestone?: Milestone;
  /** Risque encouru en cas de retard — affiché par le Next Best Action. */
  delayRisk: string;
}

/** Tâche telle qu'elle existe pour un utilisateur donné. */
export interface Task extends TaskTemplate {
  status: TaskStatus;
  /** Échéance calculée (ISO, jour près). `null` si la rentrée n'est pas décidée. */
  dueDate: string | null;
}
