import { describe, expect, it } from "vitest";
import { parisWallClockToIso, parisParts, slotLabel } from "./time";

describe("heure des consultations, ancrée sur Paris (CDC §31)", () => {
  it("interprète l'heure saisie comme Paris, l'été (UTC+2)", () => {
    // Le fondateur saisit « 14:00 » en juillet : Paris est à UTC+2, donc 12:00 Z.
    expect(parisWallClockToIso("2026-07-15T14:00")).toBe("2026-07-15T12:00:00.000Z");
  });

  it("interprète l'heure saisie comme Paris, l'hiver (UTC+1)", () => {
    // En janvier, Paris est à UTC+1 : « 14:00 » devient 13:00 Z.
    expect(parisWallClockToIso("2026-01-15T14:00")).toBe("2026-01-15T13:00:00.000Z");
  });

  it("fait l'aller-retour sans dériver, été comme hiver", () => {
    for (const wall of ["2026-07-15T14:00", "2026-01-15T09:30", "2026-03-30T08:15"]) {
      const iso = parisWallClockToIso(wall)!;
      // L'heure affichée en Paris est exactement celle qui a été saisie.
      expect(parisParts(iso).time).toBe(wall.slice(11, 16));
    }
  });

  it("affiche l'heure de Paris, jamais UTC", () => {
    // Un instant à 12:00 Z en été se lit « 14:00 » à Paris — l'ancien libellé
    // affichait « 12:00 UTC », l'heure de personne.
    const label = slotLabel("2026-07-15T12:00:00.000Z", 60);
    expect(label).toContain("14:00");
    expect(label).toContain("heure de Paris");
    expect(label).toContain("60 min");
    expect(label).not.toContain("UTC");
  });

  it("refuse une saisie malformée plutôt que d'inventer un instant", () => {
    /*
     * `Date.UTC` normalise au lieu de refuser : le mois 13 devient janvier
     * suivant, le jour 31 de février déborde sur mars, « 99:99 » se reporte de
     * plusieurs jours. Sans contrôle, le back-office ouvrirait un créneau
     * valide un AUTRE jour que celui voulu — et personne ne s'en apercevrait
     * avant que le client ne se présente au mauvais moment.
     */
    expect(parisWallClockToIso("pas une date")).toBeNull();
    expect(parisWallClockToIso("2026-13-40T99:99")).toBeNull();
    expect(parisWallClockToIso("2027-02-31T10:00")).toBeNull();
    expect(parisWallClockToIso("2026-07-15T25:00")).toBeNull();
  });
});
