"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { consultationStore } from "@/lib/store/consultations";
import { OFFER_CODES, type OfferCode } from "@/lib/payments/offers";
import { parisWallClockToIso } from "@/lib/consultations/time";
import { decideSummary } from "@/lib/consultations/summary";
import { CONSULTATIONS } from "@/lib/consultations/types";
import { SUMMARY_REFUSALS } from "@/content/consultations";
import { assessmentStore } from "@/lib/store/assessments";
import { baseUrl, dispatchEmail } from "@/lib/email/dispatch";
import { currentUser } from "@/lib/auth/current";
import { isBackofficeRole } from "@/auth.config";

/**
 * Ouverture de créneaux et attribution de séances (CDC §31).
 *
 * Le nombre accordé est borné : une saisie hors bornes est refusée plutôt que
 * tronquée silencieusement, car « accorder 999 séances » est exactement la
 * promesse d'illimité que le CDC §30 interdit.
 */
const MAX_GRANT = 20;

/**
 * Ouvre un créneau à partir d'une heure murale de PARIS.
 *
 * `startsAt` arrive sans fuseau, tel que l'a saisi le formulaire. Il était
 * converti côté navigateur, donc dans le fuseau de qui ouvrait le créneau ;
 * il est désormais interprété ici, en heure de Paris — celle du fondateur qui
 * donne la séance, et la seule que le client verra affichée.
 */
export async function openSlot(startsAt: string, minutes: number) {
  const iso = parisWallClockToIso(startsAt);
  // `parisWallClockToIso` refuse aussi les dates qui n'existent pas (31 février,
  // 25:00) : `Date.parse` les aurait normalisées en un instant valide, un autre
  // jour que celui voulu.
  if (iso === null) return { error: "Date de créneau invalide." };
  if (Date.parse(iso) <= Date.now()) return { error: "Un créneau ne s'ouvre pas dans le passé." };
  if (!Number.isFinite(minutes) || minutes < 15 || minutes > 180) {
    return { error: "Durée attendue entre 15 et 180 minutes." };
  }

  await consultationStore.addSlot({
    id: randomUUID(),
    startsAt: iso,
    minutes,
  });

  revalidatePath("/admin/consultations");
  return { ok: true };
}

/**
 * Publie ou corrige le compte rendu d'une séance (CDC §31).
 *
 * Le rôle est revérifié ICI, comme pour les matrices et pour la même raison :
 * ce texte est lu par un client. Le reste du back-office s'en remet au
 * middleware ; ce qui écrit du contenu visible se défend en profondeur.
 *
 * La décision vit dans lib/ (`decideSummary`) : une action appelée directement
 * se heurte aux mêmes refus que le formulaire — séance non commencée, texte
 * vide, vocabulaire interdit.
 */
export async function saveSummary(bookingId: string, text: string) {
  const user = await currentUser();
  if (!user || !isBackofficeRole(user.role)) return { error: "Accès refusé." };

  const booking = (await consultationStore.allBookings()).find((b) => b.id === bookingId);
  if (!booking) return { error: "Réservation introuvable." };

  const slot = (await consultationStore.slots()).find((s) => s.id === booking.slotId) ?? null;
  const decision = decideSummary({ text, slot }, new Date());
  if (!decision.accepted) {
    return {
      error:
        decision.reason === "FORBIDDEN_VOCABULARY"
          ? `${SUMMARY_REFUSALS.FORBIDDEN_VOCABULARY} ${decision.why}`
          : SUMMARY_REFUSALS[decision.reason],
    };
  }

  const written = await consultationStore.setSummary(
    bookingId,
    decision.summary,
    new Date().toISOString()
  );
  if (!written) return { error: "Réservation introuvable." };

  /*
   * L'email n'annonce que la PREMIÈRE publication : une coquille corrigée ne
   * renvoie rien — trois « votre compte rendu est disponible » pour le même
   * texte feraient douter du premier. Et comme pour la confirmation, l'échec
   * d'envoi n'annule pas la publication : le compte rendu est en ligne, c'est
   * le fait qui compte, le back-office voit le statut renvoyé.
   */
  if (written.firstTime) {
    const assessment = await assessmentStore.get(booking.assessmentId);
    const email = assessment?.answers.email;
    if (email) {
      await dispatchEmail(
        "BOOKING_SUMMARY",
        email,
        {
          firstName: assessment?.answers.firstName ?? "",
          consultationName: CONSULTATIONS[booking.type].name,
          consultationsUrl: `${baseUrl()}/app/consultations`,
        },
        false
      );
    }
  }

  revalidatePath("/admin/consultations");
  revalidatePath("/app/consultations");
  return { ok: true, firstTime: written.firstTime };
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
