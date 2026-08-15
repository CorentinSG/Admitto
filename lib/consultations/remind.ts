import { assessmentStore } from "@/lib/store/assessments";
import { consultationStore } from "@/lib/store/consultations";
import { noticeStore } from "@/lib/store/notifications";
import { baseUrl, dispatchEmail } from "@/lib/email/dispatch";
import { log } from "@/lib/observability/log";
import { CONSULTATIONS } from "./types";
import { dueReminders, reminderNoticeId } from "./reminders";
import { slotLabel } from "./time";

/**
 * Passage d'envoi des rappels de séance (CDC §31).
 *
 * Même déclencheur que les rappels d'échéance et la séquence email, et mêmes
 * règles :
 *
 * - **Le journal n'est écrit qu'après un envoi réussi.** Un échec de transport
 *   laisse le rappel dû, et le passage suivant le reprend — tant que la séance
 *   n'a pas commencé.
 * - **Un seul rappel par réservation**, porté par le journal et non par un état
 *   en mémoire : c'est lui qui tient l'idempotence entre deux passages.
 *
 * Le balayage part des RÉSERVATIONS, pas des diagnostics : elles sont peu
 * nombreuses et déjà bornées à l'avenir proche, là où parcourir tous les
 * diagnostics referait grandir le coût du passage avec l'histoire du produit.
 */

export interface ReminderSummary {
  /** Séances entrant dans la fenêtre de rappel. */
  due: number;
  sent: number;
  /** Écartées : aucune adresse connue pour ce diagnostic. */
  skipped: number;
  failed: number;
}

export async function runBookingReminders(reference: Date): Promise<ReminderSummary> {
  const summary: ReminderSummary = { due: 0, sent: 0, skipped: 0, failed: 0 };

  const bookings = await consultationStore.allBookings();
  if (bookings.length === 0) return summary;

  const slots = await consultationStore.slots();
  const url = baseUrl();

  /*
   * Le journal est lu PAR DIAGNOSTIC, pas globalement : `noticeStore.sent`
   * prend un identifiant d'évaluation. On regroupe donc les réservations par
   * diagnostic pour ne lire ce journal qu'une fois par personne, même si elle a
   * plusieurs séances à venir.
   */
  const byAssessment = new Map<string, typeof bookings>();
  for (const booking of bookings) {
    byAssessment.set(booking.assessmentId, [
      ...(byAssessment.get(booking.assessmentId) ?? []),
      booking,
    ]);
  }

  for (const [assessmentId, theirs] of byAssessment) {
    const sentAlready = await noticeStore.sent(assessmentId);
    const due = dueReminders(theirs, slots, sentAlready, reference);
    if (due.length === 0) continue;

    summary.due += due.length;

    const assessment = await assessmentStore.get(assessmentId);
    const email = assessment?.answers.email;
    if (!email) {
      // Un diagnostic sans adresse ne peut rien recevoir. Écarté, jamais
      // compté en échec : ce n'est pas une panne.
      summary.skipped += due.length;
      continue;
    }

    for (const { booking, slot } of due) {
      const result = await dispatchEmail(
        "BOOKING_REMINDER",
        email,
        {
          firstName: assessment?.answers.firstName ?? "",
          consultationName: CONSULTATIONS[booking.type].name,
          slotLabel: slotLabel(slot.startsAt, slot.minutes),
          consultationsUrl: `${url}/app/consultations`,
        },
        // Base contractuelle. Passé à `false` pour que, si elle était un jour
        // requalifiée par erreur, l'email cesse de partir au lieu de partir à tort.
        false
      );

      if (result.ok) {
        await noticeStore.markSent(assessmentId, reminderNoticeId(booking.id));
        summary.sent += 1;
      } else {
        summary.failed += 1;
      }
    }
  }

  // Comme les autres passages : les compteurs seuls, jamais une adresse. Un
  // déclencheur qui cesse d'envoyer pendant que `due` monte est autrement
  // indétectable.
  log(summary.failed > 0 ? "warn" : "info", "consultations.reminders.done", { ...summary });
  return summary;
}
