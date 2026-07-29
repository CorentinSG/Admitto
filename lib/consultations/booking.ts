import {
  CONSULTATION_TYPES,
  INCLUDED_CONSULTATIONS,
  type Booking,
  type ConsultationSlot,
  type ConsultationType,
} from "./types";
import type { OfferCode } from "@/lib/payments/offers";

/**
 * Droit à consultation et règles de réservation (CDC §30 et §31).
 *
 * Le solde est toujours un nombre fini et toujours affiché. Le CDC interdit
 * d'annoncer un nombre illimité de séances ; ne pas montrer le solde
 * reviendrait à laisser croire qu'il n'y a pas de plafond, ce qui est la même
 * promesse en creux.
 */

/** Délai minimal entre la réservation et le créneau, en heures. */
export const MIN_NOTICE_HOURS = 48;

export interface Entitlement {
  /** Offre souscrite, si elle est connue. */
  offer: OfferCode | null;
  /** Séances accordées au cas par cas depuis le back-office (CDC §31, Concierge). */
  granted: number;
}

/** Séances au total : celles de l'offre plus celles accordées individuellement. */
export function totalAllowance(entitlement: Entitlement): number {
  const fromOffer = entitlement.offer ? INCLUDED_CONSULTATIONS[entitlement.offer] : 0;
  return fromOffer + entitlement.granted;
}

export function remainingAllowance(entitlement: Entitlement, bookings: Booking[]): number {
  return Math.max(0, totalAllowance(entitlement) - bookings.length);
}

export type BookingRefusal =
  | "NO_ALLOWANCE"
  | "UNKNOWN_TYPE"
  | "UNKNOWN_SLOT"
  | "SLOT_TAKEN"
  | "SLOT_PAST"
  | "TOO_SOON";

export type BookingDecision =
  | { ok: true; slot: ConsultationSlot; type: ConsultationType }
  | { ok: false; reason: BookingRefusal };

export interface BookingRequest {
  type: string;
  slotId: string;
  entitlement: Entitlement;
  /** Réservations déjà posées par cette personne. */
  bookings: Booking[];
  /** Créneaux ouverts par le fondateur. */
  slots: ConsultationSlot[];
  /** Réservations de tous les utilisateurs, pour détecter un créneau déjà pris. */
  allBookings: Booking[];
}

export function decideBooking(request: BookingRequest, reference: Date): BookingDecision {
  const { type, slotId, entitlement, bookings, slots, allBookings } = request;

  // Le solde est vérifié avant tout : refuser d'abord sur un créneau pris
  // laisserait croire qu'il suffit d'en choisir un autre.
  if (remainingAllowance(entitlement, bookings) <= 0) {
    return { ok: false, reason: "NO_ALLOWANCE" };
  }

  if (!(CONSULTATION_TYPES as readonly string[]).includes(type)) {
    return { ok: false, reason: "UNKNOWN_TYPE" };
  }

  const slot = slots.find((s) => s.id === slotId);
  if (!slot) return { ok: false, reason: "UNKNOWN_SLOT" };

  if (allBookings.some((b) => b.slotId === slotId)) {
    return { ok: false, reason: "SLOT_TAKEN" };
  }

  const start = Date.parse(slot.startsAt);
  if (start <= reference.getTime()) return { ok: false, reason: "SLOT_PAST" };

  if (start - reference.getTime() < MIN_NOTICE_HOURS * 3_600_000) {
    return { ok: false, reason: "TOO_SOON" };
  }

  return { ok: true, slot, type: type as ConsultationType };
}

/** Créneaux proposables : à venir, libres, et au-delà du délai de prévenance. */
export function bookableSlots(
  slots: ConsultationSlot[],
  allBookings: Booking[],
  reference: Date
): ConsultationSlot[] {
  const floor = reference.getTime() + MIN_NOTICE_HOURS * 3_600_000;
  return slots
    .filter((slot) => Date.parse(slot.startsAt) >= floor)
    .filter((slot) => !allBookings.some((b) => b.slotId === slot.id))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}
