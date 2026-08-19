import type { BookingRefusal } from "@/lib/consultations/booking";
import { MIN_NOTICE_HOURS } from "@/lib/consultations/booking";

/** Copie des consultations (CDC §30 et §31). */

export const REFUSAL_MESSAGES: Record<BookingRefusal, string> = {
  NO_ALLOWANCE:
    "Votre offre ne comprend plus de séance. Aucune offre Admitto ne donne accès à un nombre illimité de consultations : le solde est toujours indiqué avant réservation.",
  UNKNOWN_TYPE: "Ce type de séance n'existe pas.",
  UNKNOWN_SLOT: "Ce créneau n'est plus proposé.",
  SLOT_TAKEN: "Ce créneau vient d'être réservé. Choisissez-en un autre.",
  SLOT_PAST: "Ce créneau est passé.",
  TOO_SOON: `Les réservations se font au moins ${MIN_NOTICE_HOURS} heures à l'avance.`,
};

export const consultations = {
  title: "Consultations",
  intro:
    "Les séances sont des rendez-vous de méthode et de relecture. Leur périmètre est indiqué avant réservation, y compris ce qu'elles ne couvrent pas.",
  allowanceLabel: "Séances restantes",
  allowanceOf: (remaining: number, total: number) => `${remaining} sur ${total}`,
  noAllowanceTitle: "Aucune séance dans votre offre",
  noAllowanceBody:
    "Votre offre actuelle ne comprend pas de consultation. Les séances sont incluses dans l'offre Guided et, au cas par cas, dans l'offre Concierge. Aucune offre ne propose de consultations en nombre illimité.",
  noSlotsTitle: "Aucun créneau ouvert",
  noSlotsBody:
    "Aucune disponibilité n'est ouverte pour le moment. Les créneaux paraissent par vagues ; cette page les affichera dès leur ouverture.",
  covers: "Cette séance couvre",
  excludes: "Cette séance ne couvre pas",
  chooseSlot: "Choisir un créneau",
  book: "Réserver",
  cancel: "Annuler",
  upcoming: "Vos séances à venir",
  noUpcoming: "Aucune séance réservée.",
  duration: (minutes: number) => `${minutes} min`,
  /* Mise en avant de la séance correspondant à l'étape (personnalisation 1.5).
     « Correspond », jamais « conseillée » : la correspondance est un fait tiré
     de la phase, une recommandation serait un conseil que rien ne fonde. */
  matchesPhase: "Correspond à votre étape",
  accessError: "Session expirée. Reconnectez-vous pour poursuivre.",
  noticeNote: `Une séance se réserve au moins ${MIN_NOTICE_HOURS} heures à l'avance et peut être annulée depuis cette page.`,
  /* Compte rendu (CDC §31) : la trace écrite de la séance, rédigée à la main. */
  pastTitle: "Vos séances passées",
  summaryLabel: "Compte rendu",
  summaryPending:
    "Le compte rendu de cette séance est en cours de rédaction. Il paraîtra ici, et vous serez prévenu par email.",
};

export const SUMMARY_REFUSALS = {
  EMPTY:
    "Un compte rendu vide ne se publie pas : une correction remplace le texte, elle ne l'efface pas.",
  TOO_LONG: "Compte rendu trop long : 4 000 caractères au maximum.",
  SESSION_NOT_STARTED:
    "Cette séance n'a pas encore eu lieu : son compte rendu ne peut pas être rédigé avant.",
  /* Le motif précis est ajouté par l'action : il vient du miroir d'exécution
     du vocabulaire, le même que pour les blocs des matrices. */
  FORBIDDEN_VOCABULARY: "Vocabulaire refusé —",
} as const;

export const adminConsultations = {
  title: "Consultations",
  intro:
    "Ouvrez des créneaux et accordez des séances au cas par cas. Sans créneau ouvert, personne ne peut réserver — et l'espace payant l'annonce.",
  slotsTitle: "Créneaux ouverts",
  addSlot: "Ouvrir le créneau",
  removeSlot: "Retirer",
  bookingsTitle: "Séances réservées",
  noBookings: "Aucune réservation.",
  noSlots: "Aucun créneau ouvert.",
  entitlementTitle: "Séances accordées",
  entitlementHelp:
    "Séances accordées en plus de celles de l'offre. Sert aux offres sur candidature, dont le périmètre est contractuel.",
  grant: "Accorder",
  slotTaken: "Réservé",
  slotFree: "Libre",
  summaryTitle: "Compte rendu",
  summaryPlaceholder: "Ce qui a été décidé ensemble, ce qui reste à faire, les points laissés ouverts…",
  summarySave: "Publier le compte rendu",
  summaryUpdate: "Corriger le compte rendu",
  summarySaved: "Compte rendu publié — le client est prévenu par email.",
  summaryUpdated: "Compte rendu corrigé — aucune relance envoyée.",
  summaryFuture: "Séance à venir : le compte rendu se rédige après.",
};
