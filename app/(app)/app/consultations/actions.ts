"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { currentAssessmentId } from "@/lib/auth/current";
import { consultationStore } from "@/lib/store/consultations";
import { decideBooking } from "@/lib/consultations/booking";
import { REFUSAL_MESSAGES, consultations } from "@/content/consultations";

/**
 * Réservation et annulation d'une séance (CDC §31).
 *
 * La décision est prise par `decideBooking`, dans lib/ : l'action ne fait
 * qu'appliquer son verdict. Une action serveur appelée directement se heurte
 * donc aux mêmes règles que l'interface — solde, créneau libre, délai de
 * prévenance.
 */
export async function bookConsultation(type: string, slotId: string) {
  const assessmentId = await currentAssessmentId();
  if (!assessmentId) return { error: consultations.accessError };

  const now = new Date();
  const decision = decideBooking(
    {
      type,
      slotId,
      entitlement: await consultationStore.entitlement(assessmentId),
      bookings: await consultationStore.bookingsOf(assessmentId),
      slots: await consultationStore.slots(),
      allBookings: await consultationStore.allBookings(),
    },
    now
  );

  if (!decision.ok) return { error: REFUSAL_MESSAGES[decision.reason] };

  // C'est l'écriture qui arbitre, pas la vérification : entre `decideBooking`
  // et ici, quelqu'un d'autre a pu prendre le même créneau. Le refus emprunte
  // le message déjà prévu pour ce cas.
  const claimed = await consultationStore.addBooking({
    id: randomUUID(),
    assessmentId,
    slotId: decision.slot.id,
    type: decision.type,
    bookedAt: now.toISOString(),
  });
  if (!claimed) return { error: REFUSAL_MESSAGES.SLOT_TAKEN };

  revalidatePath("/app/consultations");
  return { ok: true };
}

export async function cancelConsultation(bookingId: string) {
  const assessmentId = await currentAssessmentId();
  if (!assessmentId) return { error: consultations.accessError };

  await consultationStore.removeBooking(assessmentId, bookingId);
  revalidatePath("/app/consultations");
  return { ok: true };
}
