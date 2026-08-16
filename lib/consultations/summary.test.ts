import { describe, expect, it } from "vitest";
import { decideSummary, MAX_SUMMARY_LENGTH } from "./summary";
import type { ConsultationSlot } from "./types";

const NOW = new Date("2026-08-10T12:00:00.000Z");
const pastSlot: ConsultationSlot = { id: "s-1", startsAt: "2026-08-09T14:00:00.000Z", minutes: 45 };
const futureSlot: ConsultationSlot = { id: "s-2", startsAt: "2026-08-12T14:00:00.000Z", minutes: 45 };

describe("compte rendu de séance (CDC §31)", () => {
  it("accepte un compte rendu ordinaire d'une séance passée", () => {
    const decision = decideSummary({ text: "  Décidé : viser trois écoles.  ", slot: pastSlot }, NOW);
    expect(decision).toEqual({ accepted: true, summary: "Décidé : viser trois écoles." });
  });

  it("refuse le vide : une correction remplace, elle n'efface pas", () => {
    // À la différence de la note de suivi, un compte rendu publié est un
    // livrable : le blanchir le rétracterait en silence.
    expect(decideSummary({ text: "   ", slot: pastSlot }, NOW)).toMatchObject({
      accepted: false,
      reason: "EMPTY",
    });
  });

  it("refuse au-delà de la borne, plutôt que de tronquer", () => {
    expect(
      decideSummary({ text: "x".repeat(MAX_SUMMARY_LENGTH + 1), slot: pastSlot }, NOW)
    ).toMatchObject({ accepted: false, reason: "TOO_LONG" });
  });

  it("refuse une séance qui n'a pas encore eu lieu", () => {
    // Un compte rendu d'une séance à venir serait une invention.
    expect(decideSummary({ text: "Décidé…", slot: futureSlot }, NOW)).toMatchObject({
      accepted: false,
      reason: "SESSION_NOT_STARTED",
    });
  });

  it("refuse un créneau retiré : rien n'a eu lieu qui se raconte", () => {
    expect(decideSummary({ text: "Décidé…", slot: null }, NOW)).toMatchObject({
      accepted: false,
      reason: "SESSION_NOT_STARTED",
    });
  });

  it("refuse le vocabulaire interdit, avec le motif", () => {
    /*
     * Le texte est écrit au back-office et lu par un client :
     * `check:vocabulary` ne le voit jamais, c'est le miroir d'exécution qui
     * décide — le même que pour les blocs des matrices (CDC §5–7, §14.4).
     */
    const decision = decideSummary(
      { text: "Bonne nouvelle, vous êtes éligible au barreau.", slot: pastSlot },
      NOW
    );
    expect(decision).toMatchObject({ accepted: false, reason: "FORBIDDEN_VOCABULARY" });
    if (!decision.accepted && decision.reason === "FORBIDDEN_VOCABULARY") {
      expect(decision.why.length).toBeGreaterThan(10);
    }
  });
});
