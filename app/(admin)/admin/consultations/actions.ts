"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { consultationStore } from "@/lib/store/consultations";
import { OFFER_CODES, type OfferCode } from "@/lib/payments/offers";

/**
 * Ouverture de créneaux et attribution de séances (CDC §31).
 *
 * Le nombre accordé est borné : une saisie hors bornes est refusée plutôt que
 * tronquée silencieusement, car « accorder 999 séances » est exactement la
 * promesse d'illimité que le CDC §30 interdit.
 */
const MAX_GRANT = 20;

export async function openSlot(startsAt: string, minutes: number) {
  const start = Date.parse(startsAt);
  if (!Number.isFinite(start)) return { error: "Date de créneau invalide." };
  if (start <= Date.now()) return { error: "Un créneau ne s'ouvre pas dans le passé." };
  if (!Number.isFinite(minutes) || minutes < 15 || minutes > 180) {
    return { error: "Durée attendue entre 15 et 180 minutes." };
  }

  await consultationStore.addSlot({
    id: randomUUID(),
    startsAt: new Date(start).toISOString(),
    minutes,
  });

  revalidatePath("/admin/consultations");
  return { ok: true };
}

export async function closeSlot(slotId: string) {
  const booked = (await consultationStore.allBookings()).some((b) => b.slotId === slotId);
  if (booked) return { error: "Ce créneau est réservé : annulez la séance d'abord." };

  await consultationStore.removeSlot(slotId);
  revalidatePath("/admin/consultations");
  return { ok: true };
}

export async function grantConsultations(assessmentId: string, offer: string, granted: number) {
  const code = (OFFER_CODES as readonly string[]).includes(offer) ? (offer as OfferCode) : null;
  if (offer && !code) return { error: "Offre inconnue." };

  if (!Number.isInteger(granted) || granted < 0 || granted > MAX_GRANT) {
    return { error: `Nombre de séances attendu entre 0 et ${MAX_GRANT}.` };
  }

  await consultationStore.setEntitlement(assessmentId, { offer: code, granted });
  revalidatePath("/admin/consultations");
  return { ok: true };
}
