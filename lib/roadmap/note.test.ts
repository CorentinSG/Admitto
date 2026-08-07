import { describe, expect, it } from "vitest";
import { decideNote, MAX_NOTE_LENGTH } from "./note";

describe("note de suivi d'une tâche (CDC §22)", () => {
  it("accepte une note ordinaire, débarrassée de ses espaces de bord", () => {
    expect(decideNote("  Relance envoyée le 3 novembre  ")).toEqual({
      accepted: true,
      note: "Relance envoyée le 3 novembre",
    });
  });

  it("traite une note vide ou blanche comme un effacement", () => {
    // Une note vide EFFACE : c'est le geste attendu quand un point est clos.
    // `null` et non chaîne vide — deux façons de dire « rien » qui
    // divergeraient au stockage.
    expect(decideNote("")).toEqual({ accepted: true, note: null });
    expect(decideNote("   \n  ")).toEqual({ accepted: true, note: null });
  });

  it("accepte pile la longueur maximale", () => {
    const pile = "x".repeat(MAX_NOTE_LENGTH);
    expect(decideNote(pile)).toEqual({ accepted: true, note: pile });
  });

  it("refuse au-delà, plutôt que de tronquer en silence", () => {
    // Tronquer changerait le sens de la phrase de quelqu'un sans le lui dire.
    expect(decideNote("x".repeat(MAX_NOTE_LENGTH + 1))).toEqual({
      accepted: false,
      reason: "TOO_LONG",
    });
  });
});
