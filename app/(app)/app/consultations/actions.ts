"use server";

import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ACCESS_COOKIE, verifyAccessToken } from "@/lib/access/session";
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
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  const assessmentId = await verifyAccessToken(token, new Date());
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

  await consultationStore.addBooking({
    id: randomUUID(),
    assessmentId,
    slotId: decision.slot.id,
    type: decision.type,
    bookedAt: now.toISOString(),
  });

  revalidatePath("/app/consultations");
  return { ok: true };
}

export async function cancelConsultation(bookingId: string) {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  const assessmentId = await verifyAccessToken(token, new Date());
  if (!assessmentId) return { error: consultations.accessError };

  await consultationStore.removeBooking(assessmentId, bookingId);
  revalidatePath("/app/consultations");
  return { ok: true };
}
