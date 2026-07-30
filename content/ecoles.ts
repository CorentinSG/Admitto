import type { Ambition, SchoolStatus, AddRefusal } from "@/lib/schools/types";
import type { ObservationKind } from "@/lib/schools/balance";

/**
 * Copie du sélecteur d'écoles (tâche T-SEL-03).
 *
 * Le vocabulaire est tenu par une contrainte : rien ici ne doit se lire comme
 * une appréciation du produit sur une école. « Vous n'avez classé aucune école
 * comme sûre » est un constat sur ce qui a été déclaré ; « cette école est un
 * choix sûr » serait un pronostic, que ni les données ni le CDC §14.4 ne
 * permettent.
 */

export const ecoles = {
  title: "Votre liste d'écoles",
  intro:
    "Rassembler ici les programmes visés, leur date limite et où vous en êtes. C'est la liste que la tâche « Finaliser votre liste d'écoles » demande, et celle qu'une séance de relecture prend pour point de départ.",

  balance: {
    title: "Équilibre de la liste",
    counts: (active: number, total: number) =>
      `${active} école(s) en lice sur ${total} enregistrée(s).`,
    nextDeadline: (name: string, date: string) => `Prochaine date limite : ${name}, le ${date}.`,
    noDeadline: "Aucune date limite n'est encore notée.",
    // Le produit ne classe pas : il rappelle qui classe.
    disclaimer:
      "Le classement en ambitieuse, cible ou sûre est le vôtre. Admitto ne l'attribue pas et n'apprécie ni vos chances d'admission ni la valeur d'un programme.",
  },

  add: {
    title: "Ajouter une école",
    name: "Nom de l'école",
    ambition: "Comment vous la classez",
    status: "Où vous en êtes",
    deadline: "Date limite de candidature",
    notes: "Notes",
    notesHint: "Ce que vous voulez retrouver : critères, contacts, points à vérifier.",
    submit: "Ajouter à ma liste",
  },

  candidates: {
    title: "Depuis vos accords",
    intro:
      "Les law schools liées à votre université d'origine. Un accord dit ce qu'il dit sur les frais et les places — il ne dit rien de votre admission, qui relève de l'école.",
    empty: "Aucun accord ne reste à ajouter à votre liste.",
    toConfirm: "Piste à confirmer auprès de votre université",
    add: "Ajouter",
    deadlineLabel: "Date limite indiquée par l'accord",
    tuitionLabel: "Frais selon l'accord",
    officialLink: "Page officielle",
  },

  list: {
    title: "Votre sélection",
    empty:
      "Votre liste est vide. Commencez par les accords de votre université, ou ajoutez une école à la main.",
    deadline: "Date limite",
    noDeadline: "Non renseignée",
    remove: "Retirer",
    removed: "École retirée de votre liste.",
    fromPartnership: "Issue d'un accord",
  },

  errors: {
    access: "Session expirée. Reconnectez-vous avant de reprendre votre liste.",
    notFound: "Cette école ne figure pas dans votre liste.",
  },
} as const;

export const AMBITION_LABELS: Record<Ambition, string> = {
  REACH: "Ambitieuse",
  TARGET: "Cible",
  SAFETY: "Sûre",
};

export const AMBITION_HINTS: Record<Ambition, string> = {
  REACH: "Vous la visez sans considérer son admission comme acquise.",
  TARGET: "Elle correspond à ce que vous estimez être votre profil.",
  SAFETY: "Vous la gardez comme option de repli assumée.",
};

export const STATUS_LABELS: Record<SchoolStatus, string> = {
  CONSIDERING: "À l'étude",
  SHORTLISTED: "Retenue",
  SUBMITTED: "Dossier envoyé",
  DISCARDED: "Écartée",
};

export const REFUSAL_MESSAGES: Record<AddRefusal, string> = {
  EMPTY_NAME: "Indiquez le nom de l'école.",
  NAME_TOO_LONG: "Ce nom est trop long pour être affiché correctement.",
  NOTES_TOO_LONG: "Vos notes dépassent la longueur acceptée.",
  UNKNOWN_AMBITION: "Ce classement n'existe pas.",
  UNKNOWN_STATUS: "Cet état d'avancement n'existe pas.",
  INVALID_DEADLINE: "Cette date n'existe pas. Format attendu : AAAA-MM-JJ.",
  DUPLICATE: "Cette école figure déjà dans votre liste.",
  LIMIT_REACHED:
    "Votre liste a atteint sa taille maximale. Retirez une école avant d'en ajouter une autre.",
};

/**
 * Chaque observation dit ce qui est constaté, puis ce que cela implique.
 * Aucune ne dit quoi choisir : la décision reste à l'utilisateur, et un
 * conseil de sélection serait une appréciation que le produit ne peut pas
 * porter.
 */
export const OBSERVATION_MESSAGES: Record<ObservationKind, (detail?: string) => string> = {
  EMPTY: () => "Aucune école n'est encore enregistrée.",
  TOO_FEW: (n) =>
    `${n} école(s) en lice. Une liste courte laisse peu de marge si une candidature n'aboutit pas.`,
  NO_SAFETY: () =>
    "Vous n'avez classé aucune école comme sûre. La tâche T-SEL-03 demande un équilibre entre écoles ambitieuses et écoles de repli.",
  ONLY_REACH: () =>
    "Toutes vos écoles en lice sont classées ambitieuses. Vous seul pouvez juger si c'est délibéré.",
  NOTHING_SHORTLISTED: () =>
    "Aucune école n'est encore retenue ni envoyée : la liste est toujours à l'étude.",
  MISSING_DEADLINES: (n) =>
    `${n} école(s) sans date limite. Sans elle, le rappel d'échéance n'a rien à surveiller.`,
  DEADLINE_SOON: (n) => `Votre prochaine date limite tombe dans ${n} jour(s).`,
};
