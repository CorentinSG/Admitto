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
  summary: string | null;
  summaryAt: Date | null;
}): Booking => ({
  id: row.id,
  assessmentId: row.assessmentId,
  slotId: row.slotId,
  type: row.type as ConsultationType,
  bookedAt: row.bookedAt.toISOString(),
  summary: row.summary,
  summaryAt: row.summaryAt?.toISOString() ?? null,
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

  /**
   * Réserve le créneau. Rend `false` s'il vient d'être pris.
   *
   * `decideBooking` a bien vérifié que le créneau était libre — mais entre
   * cette lecture et cette écriture, quelqu'un d'autre a pu réserver. C'est
   * l'écriture qui doit trancher, et elle seule : deux requêtes simultanées
   * passent toutes deux la vérification.
   *
   * En base, la contrainte d'unicité sur `slotId` arbitre ; la violation est
   * traduite en refus au lieu de remonter en erreur serveur — le message
   * « ce créneau vient d'être réservé » existait déjà, il n'était jamais
   * atteignable. En mémoire, la vérification est explicite : sans elle, les
   * deux implémentations divergeaient précisément sur ce cas, l'une acceptant
   * un double achat de créneau que l'autre refusait.
   */
  async addBooking(booking: Booking): Promise<boolean> {
    if (!usingDatabase()) {
      if ([...bookings.values()].some((b) => b.slotId === booking.slotId)) return false;
      bookings.set(booking.id, booking);
      return true;
    }
    try {
      await db().booking.create({
        data: {
          id: booking.id,
          assessmentId: booking.assessmentId,
          slotId: booking.slotId,
          type: booking.type,
          bookedAt: new Date(booking.bookedAt),
        },
      });
      return true;
    } catch (error) {
      // P2002 : violation d'unicité, donc créneau déjà réservé. Toute autre
      // erreur est une vraie panne et doit continuer de remonter.
      if ((error as { code?: string }).code === "P2002") return false;
      throw error;
    }
  },

  /**
   * Écrit (ou réécrit) le compte rendu d'une séance.
   *
   * Rend la réservation mise à jour et `firstTime` — vrai à la PREMIÈRE
   * publication seulement : c'est ce qui décide de l'email d'annonce, une
   * correction ultérieure ne renvoie rien. Rend `null` si la réservation
   * n'existe pas (annulée entre l'affichage et la sauvegarde).
   *
   * Pas de borne par évaluation, à la différence de `removeBooking` : ce geste
   * est celui du back-office, dont l'action revérifie le rôle.
   */
  async setSummary(
    bookingId: string,
    summary: string,
    at: string
  ): Promise<{ booking: Booking; firstTime: boolean } | null> {
    if (!usingDatabase()) {
      const existing = bookings.get(bookingId);
      if (!existing) return null;
      const firstTime = existing.summaryAt === null;
      const updated: Booking = {
        ...existing,
        summary,
        // La date de première publication ne bouge plus : elle est la preuve
        // du moment où le client a été prévenu.
        summaryAt: existing.summaryAt ?? at,
      };
      bookings.set(bookingId, updated);
      return { booking: updated, firstTime };
    }
    const row = await db().booking.findUnique({ where: { id: bookingId } });
    if (!row) return null;
    const firstTime = row.summaryAt === null;
    const updated = await db().booking.update({
      where: { id: bookingId },
      data: { summary, summaryAt: row.summaryAt ?? new Date(at) },
    });
    return { booking: bookingToDomain(updated), firstTime };
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
