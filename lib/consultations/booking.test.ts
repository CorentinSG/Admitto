import { describe, expect, it } from "vitest";
import {
  MIN_NOTICE_HOURS,
  bookableSlots,
  decideBooking,
  remainingAllowance,
  totalAllowance,
  type Entitlement,
} from "./booking";
import { CONSULTATIONS, CONSULTATION_TYPES, INCLUDED_CONSULTATIONS, type Booking } from "./types";
import { OFFER_CODES } from "@/lib/payments/offers";

const NOW = new Date("2026-07-29T10:00:00Z");
const hoursFromNow = (h: number) => new Date(NOW.getTime() + h * 3_600_000).toISOString();

const slot = (id: string, hours: number) => ({ id, startsAt: hoursFromNow(hours), minutes: 45 });
const booking = (id: string, slotId: string, assessmentId = "moi"): Booking => ({
  id,
  assessmentId,
  slotId,
  type: "ORIENTATION",
  bookedAt: NOW.toISOString(),
  summary: null,
  summaryAt: null,
});

const request = (over: Partial<Parameters<typeof decideBooking>[0]> = {}) => ({
  type: "ORIENTATION",
  slotId: "s1",
  entitlement: { offer: "GUIDED", granted: 0 } as Entitlement,
  bookings: [],
  slots: [slot("s1", 72)],
  allBookings: [],
  ...over,
});

describe("aucune consultation illimitée (CDC §30)", () => {
  it("chaque offre porte un plafond fini", () => {
    for (const code of OFFER_CODES) {
      const included = INCLUDED_CONSULTATIONS[code];
      expect(Number.isFinite(included), code).toBe(true);
      expect(included, code).toBeGreaterThanOrEqual(0);
    }
  });

  it("une offre sans consultation vaut zéro, jamais un accès ouvert", () => {
    expect(totalAllowance({ offer: "PLATFORM", granted: 0 })).toBe(0);
    expect(totalAllowance({ offer: "DIAGNOSTIC", granted: 0 })).toBe(0);
    expect(totalAllowance({ offer: "FREE", granted: 0 })).toBe(0);
  });

  it("une offre inconnue ne donne aucun droit", () => {
    expect(totalAllowance({ offer: null, granted: 0 })).toBe(0);
  });

  it("Concierge n'ouvre rien par défaut : tout est accordé au cas par cas", () => {
    expect(INCLUDED_CONSULTATIONS.CONCIERGE).toBe(0);
    expect(totalAllowance({ offer: "CONCIERGE", granted: 5 })).toBe(5);
  });

  it("les séances accordées s'ajoutent à celles de l'offre", () => {
    expect(totalAllowance({ offer: "GUIDED", granted: 2 })).toBe(INCLUDED_CONSULTATIONS.GUIDED + 2);
  });

  it("le solde ne descend jamais sous zéro", () => {
    const used = [booking("b1", "s1"), booking("b2", "s2"), booking("b3", "s3"), booking("b4", "s4")];
    expect(remainingAllowance({ offer: "GUIDED", granted: 0 }, used)).toBe(0);
  });
});

describe("périmètre annoncé", () => {
  it("chaque type dit ce qu'il ne couvre pas", () => {
    for (const type of CONSULTATION_TYPES) {
      expect(CONSULTATIONS[type].excludes.length, type).toBeGreaterThan(0);
      expect(CONSULTATIONS[type].covers.length, type).toBeGreaterThan(0);
    }
  });

  it("aucune séance ne promet de conclure sur l'accès à l'examen", () => {
    const all = CONSULTATION_TYPES.flatMap((t) => CONSULTATIONS[t].covers).join(" ").toLowerCase();
    expect(all).not.toMatch(/éligib|garanti/);
  });

  it("la durée est toujours annoncée", () => {
    for (const type of CONSULTATION_TYPES) {
      expect(CONSULTATIONS[type].minutes, type).toBeGreaterThan(0);
    }
  });
});

describe("règles de réservation", () => {
  it("accepte une réservation valide", () => {
    expect(decideBooking(request(), NOW).ok).toBe(true);
  });

  it("refuse sans solde, avant toute autre vérification", () => {
    // Refuser d'abord sur un créneau pris laisserait croire qu'il suffit d'en
    // choisir un autre.
    const decision = decideBooking(
      request({
        entitlement: { offer: "PLATFORM", granted: 0 },
        slotId: "inexistant",
        allBookings: [booking("b1", "s1")],
      }),
      NOW
    );
    expect(decision).toMatchObject({ ok: false, reason: "NO_ALLOWANCE" });
  });

  it("refuse un type de séance inventé", () => {
    expect(decideBooking(request({ type: "RELECTURE_JURIDIQUE" }), NOW)).toMatchObject({
      ok: false,
      reason: "UNKNOWN_TYPE",
    });
  });

  it("refuse un créneau inconnu", () => {
    expect(decideBooking(request({ slotId: "s9" }), NOW)).toMatchObject({
      ok: false,
      reason: "UNKNOWN_SLOT",
    });
  });

  it("refuse un créneau déjà réservé, y compris par quelqu'un d'autre", () => {
    expect(
      decideBooking(request({ allBookings: [booking("b1", "s1", "autre")] }), NOW)
    ).toMatchObject({ ok: false, reason: "SLOT_TAKEN" });
  });

  it("refuse un créneau passé", () => {
    expect(decideBooking(request({ slots: [slot("s1", -2)] }), NOW)).toMatchObject({
      ok: false,
      reason: "SLOT_PAST",
    });
  });

  it("refuse en deçà du délai de prévenance", () => {
    expect(
      decideBooking(request({ slots: [slot("s1", MIN_NOTICE_HOURS - 1)] }), NOW)
    ).toMatchObject({ ok: false, reason: "TOO_SOON" });
    expect(decideBooking(request({ slots: [slot("s1", MIN_NOTICE_HOURS)] }), NOW).ok).toBe(true);
  });

  it("épuise le solde après les séances prévues", () => {
    const used = Array.from({ length: INCLUDED_CONSULTATIONS.GUIDED }, (_, i) =>
      booking(`b${i}`, `s${i + 10}`)
    );
    expect(decideBooking(request({ bookings: used }), NOW)).toMatchObject({
      ok: false,
      reason: "NO_ALLOWANCE",
    });
  });
});

describe("créneaux proposables", () => {
  it("écarte le passé, le trop proche et le déjà pris", () => {
    const open = bookableSlots(
      [slot("passe", -5), slot("proche", 3), slot("pris", 100), slot("libre", 96)],
      [booking("b1", "pris")],
      NOW
    );
    expect(open.map((s) => s.id)).toEqual(["libre"]);
  });

  it("classe les créneaux du plus proche au plus lointain", () => {
    const open = bookableSlots([slot("tard", 200), slot("tot", 72)], [], NOW);
    expect(open.map((s) => s.id)).toEqual(["tot", "tard"]);
  });

  it("ne propose rien quand aucun créneau n'est ouvert", () => {
    expect(bookableSlots([], [], NOW)).toEqual([]);
  });
});
