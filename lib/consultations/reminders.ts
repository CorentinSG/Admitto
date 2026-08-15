import type { Booking, ConsultationSlot } from "./types";

/**
 * Rappel avant une séance (CDC §31).
 *
 * La confirmation part à la réservation, souvent des semaines avant. Entre les
 * deux, la séance sort de la tête : c'est le rappel qui la fait tenir. Sans lui,
 * le produit encaisse une séance que la personne oublie.
 *
 * Le déclencheur est le même passage planifié que les rappels d'échéance et la
 * séquence email — un rappel ne doit pas dépendre du fait que la personne se
 * connecte, c'est précisément quand elle ne se connecte pas qu'il sert.
 */

/**
 * Vingt-quatre heures avant le début.
 *
 * Ni deux heures — trop tard pour préparer ses questions ou déplacer sa
 * journée —, ni quarante-huit : c'est exactement le délai minimal de
 * réservation (`MIN_NOTICE_HOURS`), si bien qu'un rappel à cette distance
 * partirait dans la foulée de certaines réservations, en doublon de la
 * confirmation. Vingt-quatre heures tombent toujours APRÈS la réservation.
 */
export const REMINDER_LEAD_HOURS = 24;

/** Identifiant de journal : un rappel par réservation, jamais deux. */
export const reminderNoticeId = (bookingId: string) => `CONSULT:${bookingId}`;

export interface DueReminder {
  booking: Booking;
  slot: ConsultationSlot;
}

/**
 * Séances à rappeler : celles qui commencent dans les prochaines
 * `REMINDER_LEAD_HOURS`, pas encore rappelées, et **pas encore commencées**.
 *
 * La borne basse compte autant que la haute : une séance déjà commencée — ou
 * passée pendant une panne du déclencheur — ne se rappelle pas. Envoyer
 * « votre séance a lieu demain » après coup n'informe personne et abîme la
 * confiance dans tous les autres messages.
 *
 * Une réservation annulée a disparu de `bookings` : elle ne peut pas produire
 * de rappel, sans qu'aucun filtre n'ait à le prévoir.
 */
export function dueReminders(
  bookings: Booking[],
  slots: ConsultationSlot[],
  alreadySent: string[],
  reference: Date
): DueReminder[] {
  const now = reference.getTime();
  const horizon = now + REMINDER_LEAD_HOURS * 3_600_000;
  const sent = new Set(alreadySent);

  return bookings
    .filter((booking) => !sent.has(reminderNoticeId(booking.id)))
    .map((booking) => ({ booking, slot: slots.find((s) => s.id === booking.slotId) }))
    .filter((row): row is DueReminder => row.slot !== undefined)
    .filter((row) => {
      const start = Date.parse(row.slot.startsAt);
      return start > now && start <= horizon;
    })
    .sort((a, b) => a.slot.startsAt.localeCompare(b.slot.startsAt));
}
