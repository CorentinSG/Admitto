import { describe, expect, it } from "vitest";
import { dueReminders, reminderNoticeId, REMINDER_LEAD_HOURS } from "./reminders";
import { MIN_NOTICE_HOURS } from "./booking";
import type { Booking, ConsultationSlot } from "./types";

const NOW = new Date("2026-08-10T12:00:00.000Z");
const inHours = (h: number) => new Date(NOW.getTime() + h * 3_600_000).toISOString();

const slot = (id: string, hours: number): ConsultationSlot => ({
  id,
  startsAt: inHours(hours),
  minutes: 45,
});

const booking = (id: string, slotId: string): Booking => ({
  id,
  assessmentId: "a-1",
  slotId,
  type: "ORIENTATION",
  bookedAt: NOW.toISOString(),
});

describe("rappel avant une séance (CDC §31)", () => {
  it("rappelle une séance qui commence dans la fenêtre", () => {
    const slots = [slot("s-1", 10)];
    const due = dueReminders([booking("b-1", "s-1")], slots, [], NOW);
    expect(due.map((r) => r.booking.id)).toEqual(["b-1"]);
  });

  it("ne rappelle pas une séance encore lointaine", () => {
    const slots = [slot("s-1", REMINDER_LEAD_HOURS + 1)];
    expect(dueReminders([booking("b-1", "s-1")], slots, [], NOW)).toEqual([]);
  });

  it("ne rappelle jamais une séance déjà commencée ou passée", () => {
    /*
     * La borne basse compte autant que la haute. Une séance passée pendant une
     * panne du déclencheur ne se rappelle pas : « votre séance a lieu demain »
     * après coup n'informe personne et abîme la confiance dans tous les autres
     * messages.
     */
    const slots = [slot("s-passe", -1), slot("s-pile", 0)];
    expect(
      dueReminders([booking("b-1", "s-passe"), booking("b-2", "s-pile")], slots, [], NOW)
    ).toEqual([]);
  });

  it("n'envoie qu'un seul rappel par réservation", () => {
    // C'est le journal qui porte l'idempotence entre deux passages, jamais un
    // état en mémoire.
    const slots = [slot("s-1", 10)];
    const b = booking("b-1", "s-1");
    expect(dueReminders([b], slots, [reminderNoticeId("b-1")], NOW)).toEqual([]);
  });

  it("ignore une réservation dont le créneau a disparu", () => {
    // Créneau retiré au back-office : plus d'heure à annoncer, donc pas de
    // rappel plutôt qu'un rappel sans date.
    expect(dueReminders([booking("b-1", "s-absent")], [], [], NOW)).toEqual([]);
  });

  it("rend les rappels du plus proche au plus lointain", () => {
    const slots = [slot("s-tard", 20), slot("s-tot", 3)];
    const due = dueReminders(
      [booking("b-tard", "s-tard"), booking("b-tot", "s-tot")],
      slots,
      [],
      NOW
    );
    expect(due.map((r) => r.booking.id)).toEqual(["b-tot", "b-tard"]);
  });

  it("tombe toujours APRÈS la réservation, jamais dans sa foulée", () => {
    /*
     * Une réservation exige `MIN_NOTICE_HOURS` de préavis. Un rappel posé à
     * cette même distance partirait dans la foulée de certaines réservations,
     * en doublon de la confirmation — d'où un délai strictement plus court.
     */
    expect(REMINDER_LEAD_HOURS).toBeLessThan(MIN_NOTICE_HOURS);
  });
});
