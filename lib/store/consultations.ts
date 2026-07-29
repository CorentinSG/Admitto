import type { Booking, ConsultationSlot } from "@/lib/consultations/types";
import type { Entitlement } from "@/lib/consultations/booking";

/**
 * Créneaux, réservations et droits à consultation (CDC §31).
 *
 * ⚠️ Même implémentation de transition que les autres stores : mémoire du
 * processus accrochée à globalThis, à remplacer par Prisma avant la bêta.
 *
 * Fermé par défaut : sans créneau ouvert depuis le back-office, personne ne
 * peut réserver, et l'écran le dit. Aucune disponibilité n'est inventée.
 */

const globalStore = globalThis as typeof globalThis & {
  __admittoSlots?: Map<string, ConsultationSlot>;
  __admittoBookings?: Map<string, Booking>;
  __admittoEntitlements?: Map<string, Entitlement>;
};

const slots = (globalStore.__admittoSlots ??= new Map<string, ConsultationSlot>());
const bookings = (globalStore.__admittoBookings ??= new Map<string, Booking>());
const entitlements = (globalStore.__admittoEntitlements ??= new Map<string, Entitlement>());

export const consultationStore = {
  async slots(): Promise<ConsultationSlot[]> {
    return [...slots.values()].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  },

  async addSlot(slot: ConsultationSlot): Promise<void> {
    slots.set(slot.id, slot);
  },

  async removeSlot(slotId: string): Promise<void> {
    slots.delete(slotId);
  },

  async allBookings(): Promise<Booking[]> {
    return [...bookings.values()].sort((a, b) => a.bookedAt.localeCompare(b.bookedAt));
  },

  async bookingsOf(assessmentId: string): Promise<Booking[]> {
    return (await this.allBookings()).filter((b) => b.assessmentId === assessmentId);
  },

  async addBooking(booking: Booking): Promise<void> {
    bookings.set(booking.id, booking);
  },

  async removeBooking(assessmentId: string, bookingId: string): Promise<boolean> {
    const existing = bookings.get(bookingId);
    // Bornée à l'évaluation : un identifiant deviné n'annule pas la séance d'autrui.
    if (!existing || existing.assessmentId !== assessmentId) return false;
    bookings.delete(bookingId);
    return true;
  },

  /** Droit par défaut : aucune offre connue, aucune séance accordée. */
  async entitlement(assessmentId: string): Promise<Entitlement> {
    return entitlements.get(assessmentId) ?? { offer: null, granted: 0 };
  },

  async setEntitlement(assessmentId: string, entitlement: Entitlement): Promise<void> {
    entitlements.set(assessmentId, entitlement);
  },
};
