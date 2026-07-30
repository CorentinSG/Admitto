import type { Phase } from "@/lib/profile/derive";
import type { Milestone, TaskStatus } from "@/lib/roadmap/types";

/** Copie de l'espace payant (CDC §21 à §24). */

export const PHASE_LABELS: Record<Phase, string> = {
  CLARIFICATION: "Clarification",
  CAREER_STRATEGY: "Stratégie professionnelle",
  LLM_SELECTION: "Sélection du LL.M.",
  APPLICATIONS: "Candidatures",
  FUNDING: "Financement",
  VISA: "Visa",
  LLM_START: "Début du LL.M.",
  BOLE: "Dossier d'évaluation",
  NETWORKING_INTERNSHIPS: "Networking et stages",
  BAR_PREPARATION: "Préparation du barreau",
  EXAM: "Examen",
  ADMISSION: "Admission",
  POST_ADMISSION_STRATEGY: "Stratégie post-admission",
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "À faire",
  IN_PROGRESS: "En cours",
  WAITING_THIRD_PARTY: "En attente d'un tiers",
  DONE: "Complété",
  BLOCKED: "Bloqué",
  NOT_APPLICABLE: "Non applicable",
};

export const MILESTONE_LABELS: Record<Milestone, string> = {
  SCHOOL_LIST_COMPLETED: "Liste d'écoles finalisée",
  APPLICATIONS_READY: "Dossier de candidature prêt",
  BOLE_FILE_PREPARED: "Pièces du dossier d'évaluation préparées",
  BAR_REGISTRATION_COMPLETED: "Inscription à l'examen finalisée",
  ADMISSION_PACKAGE_PREPARED: "Dossier d'admission préparé",
};

export const dashboard = {
  nav: [
    { label: "Tableau de bord", href: "/app/dashboard" },
    { label: "Feuille de route", href: "/app/roadmap" },
    { label: "Écoles", href: "/app/ecoles" },
    { label: "Modules", href: "/app/modules" },
    { label: "Simulateur", href: "/app/simulateur" },
    { label: "Documents", href: "/app/documents" },
    { label: "Consultations", href: "/app/consultations" },
    { label: "Vos données", href: "/app/donnees" },
  ],
  greeting: (firstName?: string) => (firstName ? `Bonjour ${firstName}.` : "Bonjour."),
  sections: {
    phase: "Phase actuelle",
    nextBestAction: "Prochaine action",
    deadlines: "Prochaines échéances",
    progress: "Progression",
    tasks: "Vos tâches du moment",
    milestones: "Étapes clés",
    module: "Module recommandé",
    documents: "Vos documents",
  },
  nbaEmpty:
    "Aucune action ne vous attend actuellement. Les tâches en attente d'un tiers avancent sans vous ; celles qui sont bloquées demandent d'abord de lever leur prérequis.",
  nbaReason: "Pourquoi maintenant",
  nbaDuration: "Temps nécessaire",
  nbaDue: "À faire avant le",
  nbaNoDue: "Pas de date tant que votre rentrée n'est pas décidée",
  nbaRisk: "Risque en cas de retard",
  nbaResource: "Ouvrir la ressource",
  nbaUrgent: "Échéance proche",
  markDone: "Marquer comme complété",
  statsLabels: {
    tasksDone: "Tâches accomplies",
    tasksRemaining: "Tâches restantes",
    waitingOnOthers: "En attente d'un tiers",
    overdue: "Échéances dépassées",
  },
  milestoneAchievedOn: "Acquis le",
  milestonesNote:
    "Ces étapes ne portent que sur des actions qui dépendent de vous. Une admission, une bourse ou un résultat d'examen n'en font jamais partie.",
  documentsIntro:
    "Le coffre n'accueille que CV, personal statements, listes d'écoles, documents de travail et checklists — jamais de pièce sensible.",
  modulePlaceholder: "Ce module est en cours de production.",
  roadmapTitle: "Votre feuille de route",
  roadmapIntro:
    "Les tâches sont générées à partir de votre profil et de la rentrée que vous visez. Vous seul décidez de ce qui est accompli : rien n'est coché à votre place.",
  notApplicableNote: "Tâches sans objet pour votre parcours",
  betaAccess: "Accéder à ma feuille de route",
};
