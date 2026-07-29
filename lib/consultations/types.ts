import type { OfferCode } from "@/lib/payments/offers";

/**
 * Consultations (CDC §30 et §31).
 *
 * La règle centrale du cahier des charges est négative : **aucune offre ne
 * promet un nombre illimité de séances**. Elle est encodée dans le type et non
 * dans une convention — `included` est un `number`, il n'existe pas de valeur
 * « illimité » à écrire. Un plafond oublié vaut donc zéro séance, jamais une
 * infinité.
 *
 * Chaque type de consultation dit aussi ce qu'il ne couvre PAS. Un périmètre
 * qui n'énonce que ses inclusions se lit comme ouvert : c'est ainsi qu'une
 * séance de méthode devient, dans l'esprit de la personne, une relecture
 * juridique.
 */

export const CONSULTATION_TYPES = [
  "ORIENTATION",
  "SCHOOL_LIST_REVIEW",
  "APPLICATION_REVIEW",
  "BAR_PLANNING",
] as const;

export type ConsultationType = (typeof CONSULTATION_TYPES)[number];

export interface ConsultationDefinition {
  type: ConsultationType;
  name: string;
  minutes: number;
  /** Ce que la séance couvre. */
  covers: string[];
  /** Ce qu'elle ne couvre pas — champ obligatoire, pas une note facultative. */
  excludes: string[];
}

export const CONSULTATIONS: Record<ConsultationType, ConsultationDefinition> = {
  ORIENTATION: {
    type: "ORIENTATION",
    name: "Cadrage du projet",
    minutes: 45,
    covers: [
      "Clarifier le marché et la pratique visés",
      "Arbitrer entre les scénarios de calendrier",
      "Hiérarchiser les prochaines étapes de votre feuille de route",
    ],
    excludes: [
      "Aucune appréciation de votre dossier au regard des conditions d'accès à un examen",
      "Aucune démarche effectuée à votre place auprès d'une autorité",
    ],
  },
  SCHOOL_LIST_REVIEW: {
    type: "SCHOOL_LIST_REVIEW",
    name: "Revue de la liste d'écoles",
    minutes: 45,
    covers: [
      "Confronter votre liste à vos critères déclarés",
      "Repérer les programmes redondants et les angles morts",
      "Situer le coût de chaque option dans votre simulateur",
    ],
    excludes: [
      "Aucun pronostic sur l'issue d'une candidature",
      "Aucune recommandation d'école présentée comme acquise",
    ],
  },
  APPLICATION_REVIEW: {
    type: "APPLICATION_REVIEW",
    name: "Relecture de candidature",
    minutes: 60,
    covers: [
      "Relecture du CV au format américain",
      "Relecture du personal statement : structure, précision, cohérence",
      "Cohérence d'ensemble du dossier",
    ],
    excludes: [
      "Aucune rédaction à votre place",
      "Aucune traduction officielle",
      "Aucune relecture juridique de pièces destinées à une autorité",
    ],
  },
  BAR_PLANNING: {
    type: "BAR_PLANNING",
    name: "Planification de l'examen",
    minutes: 60,
    covers: [
      "Construire un calendrier de révision tenable",
      "Choisir un programme de préparation selon votre situation",
      "Organiser les démarches administratives autour des sessions",
    ],
    excludes: [
      "Aucune conclusion sur votre accès à l'examen : elle relève de l'autorité compétente",
      "Aucune inscription effectuée à votre place",
    ],
  },
};

/**
 * Consultations incluses par offre.
 *
 * Le CDC §30 fixe « trois à cinq consultations » pour Guided : la borne basse
 * est retenue, le reste relevant du contrat individuel. Concierge est une offre
 * sur candidature au périmètre contractuel précis : rien n'est promis ici, tout
 * est accordé au cas par cas depuis le back-office.
 */
export const INCLUDED_CONSULTATIONS: Record<OfferCode, number> = {
  FREE: 0,
  DIAGNOSTIC: 0,
  PLATFORM: 0,
  GUIDED: 3,
  CONCIERGE: 0,
};

export interface ConsultationSlot {
  id: string;
  /** Début du créneau, ISO complet. */
  startsAt: string;
  minutes: number;
}

export interface Booking {
  id: string;
  assessmentId: string;
  slotId: string;
  type: ConsultationType;
  bookedAt: string;
}
