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
  accessError: "Accès expiré. Reconnectez-vous depuis votre résultat.",
  noticeNote: `Une séance se réserve au moins ${MIN_NOTICE_HOURS} heures à l'avance et peut être annulée depuis cette page.`,
};

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
};
