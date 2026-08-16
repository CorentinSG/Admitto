"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { currentAssessmentId } from "@/lib/auth/current";
import { consultationStore } from "@/lib/store/consultations";
import { decideBooking } from "@/lib/consultations/booking";
import { REFUSAL_MESSAGES, consultations } from "@/content/consultations";
import { assessmentStore } from "@/lib/store/assessments";
import { baseUrl, dispatchEmail } from "@/lib/email/dispatch";
import { CONSULTATIONS } from "@/lib/consultations/types";
import { slotLabel } from "@/lib/consultations/time";

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
    summary: null,
    summaryAt: null,
  });
  if (!claimed) return { error: REFUSAL_MESSAGES.SLOT_TAKEN };

  /*
   * Confirmation par email (CDC §31).
   *
   * Réserver ne produisait AUCUN email : la personne posait un rendez-vous et
   * n'avait rien à mettre dans son agenda, rien à retrouver dans sa boîte. Pour
   * le seul rendez-vous humain du produit, c'est la confirmation qui fait
   * exister le service.
   *
   * L'envoi vient APRÈS l'écriture, et son échec n'annule pas la réservation :
   * le créneau est pris, c'est le fait qui compte. Un transport indisponible ne
   * doit pas rendre au hasard une séance que la personne croit réservée.
   */
  const assessment = await assessmentStore.get(assessmentId);
  const email = assessment?.answers.email;
  if (email) {
    const definition = CONSULTATIONS[decision.type];
    await dispatchEmail(
      "BOOKING_CONFIRMATION",
      email,
      {
        firstName: assessment?.answers.firstName ?? "",
        consultationName: definition.name,
        slotLabel: slotLabel(decision.slot.startsAt, decision.slot.minutes),
        // Une liste par ligne, préfixée : le corps est du texte brut, sans
        // puces natives.
        consultationCovers: definition.covers.map((line) => `— ${line}`).join("\n"),
        consultationExcludes: definition.excludes.map((line) => `— ${line}`).join("\n"),
        consultationsUrl: `${baseUrl()}/app/consultations`,
      },
      // Base contractuelle : la confirmation part quel que soit le choix fait
      // sur les contenus promotionnels.
      false
    );
  }

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
