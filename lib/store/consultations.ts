import type { Booking, ConsultationSlot, ConsultationType } from "@/lib/consultations/types";
import type { Entitlement } from "@/lib/consultations/booking";
import type { OfferCode } from "@/lib/payments/offers";
import { db, usingDatabase } from "@/lib/db/client";

/**
 * Créneaux, réservations et droits à consultation (CDC §31).
 *
 * Prisma quand `DATABASE_URL` est défini, mémoire du processus sinon.
 *
 * Fermé par défaut : sans créneau ouvert depuis le back-office, personne ne
 * peut réserver, et l'écran le dit. Aucune disponibilité n'est inventée.
 *
 * En base, `Booking.slotId` est unique. `decideBooking` refuse déjà un créneau
 * pris, mais deux réservations simultanées peuvent passer ce contrôle avant
 * que l'une n'écrive : c'est la contrainte d'unicité qui tranche, et la
 * seconde échoue au lieu de créer un double rendez-vous.
 */

const globalStore = globalThis as typeof globalThis & {
  __admittoSlots?: Map<string, ConsultationSlot>;
  __admittoBookings?: Map<string, Booking>;
  __admittoEntitlements?: Map<string, Entitlement>;
};

const slots = (globalStore.__admittoSlots ??= new Map<string, ConsultationSlot>());
const bookings = (globalStore.__admittoBookings ??= new Map<string, Booking>());
const entitlements = (globalStore.__admittoEntitlements ??= new Map<string, Entitlement>());

const slotToDomain = (row: { id: string; startsAt: Date; minutes: number }): ConsultationSlot => ({
  id: row.id,
  startsAt: row.startsAt.toISOString(),
  minutes: row.minutes,
});

const bookingToDomain = (row: {
  id: string;
  assessmentId: string;
  slotId: string;
  type: string;
  bookedAt: Date;
}): Booking => ({
  id: row.id,
  assessmentId: row.assessmentId,
  slotId: row.slotId,
  type: row.type as ConsultationType,
  bookedAt: row.bookedAt.toISOString(),
});

export const consultationStore = {
  async slots(): Promise<ConsultationSlot[]> {
    if (!usingDatabase()) {
      return [...slots.values()].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
    }
    const rows = await db().consultationSlot.findMany({ orderBy: { startsAt: "asc" } });
    return rows.map(slotToDomain);
  },

  async addSlot(slot: ConsultationSlot): Promise<void> {
    if (!usingDatabase()) {
      slots.set(slot.id, slot);
      return;
    }
    await db().consultationSlot.create({
      data: { id: slot.id, startsAt: new Date(slot.startsAt), minutes: slot.minutes },
    });
  },

  async removeSlot(slotId: string): Promise<void> {
    if (!usingDatabase()) {
      slots.delete(slotId);
      return;
    }
    await db().consultationSlot.deleteMany({ where: { id: slotId } });
  },

  async allBookings(): Promise<Booking[]> {
    if (!usingDatabase()) {
      return [...bookings.values()].sort((a, b) => a.bookedAt.localeCompare(b.bookedAt));
    }
    const rows = await db().booking.findMany({ orderBy: { bookedAt: "asc" } });
    return rows.map(bookingToDomain);
  },

  async bookingsOf(assessmentId: string): Promise<Booking[]> {
    if (!usingDatabase()) {
      return (await this.allBookings()).filter((b) => b.assessmentId === assessmentId);
    }
    const rows = await db().booking.findMany({
      where: { assessmentId },
      orderBy: { bookedAt: "asc" },
    });
    return rows.map(bookingToDomain);
  },

  async addBooking(booking: Booking): Promise<void> {
    if (!usingDatabase()) {
      bookings.set(booking.id, booking);
      return;
    }
    await db().booking.create({
      data: {
        id: booking.id,
        assessmentId: booking.assessmentId,
        slotId: booking.slotId,
        type: booking.type,
        bookedAt: new Date(booking.bookedAt),
      },
    });
  },

  async removeBooking(assessmentId: string, bookingId: string): Promise<boolean> {
    if (!usingDatabase()) {
      const existing = bookings.get(bookingId);
      // Bornée à l'évaluation : un identifiant deviné n'annule pas la séance d'autrui.
      if (!existing || existing.assessmentId !== assessmentId) return false;
      bookings.delete(bookingId);
      return true;
    }
    const { count } = await db().booking.deleteMany({ where: { id: bookingId, assessmentId } });
    return count > 0;
  },

  /** Droit par défaut : aucune offre connue, aucune séance accordée. */
  async entitlement(assessmentId: string): Promise<Entitlement> {
    if (!usingDatabase()) return entitlements.get(assessmentId) ?? { offer: null, granted: 0 };
    const row = await db().entitlement.findUnique({ where: { assessmentId } });
    return row ? { offer: (row.offer as OfferCode | null) ?? null, granted: row.granted } : { offer: null, granted: 0 };
  },

  async setEntitlement(assessmentId: string, entitlement: Entitlement): Promise<void> {
    if (!usingDatabase()) {
      entitlements.set(assessmentId, entitlement);
      return;
    }
    await db().entitlement.upsert({
      where: { assessmentId },
      create: { assessmentId, offer: entitlement.offer, granted: entitlement.granted },
      update: { offer: entitlement.offer, granted: entitlement.granted },
    });
  },
};
