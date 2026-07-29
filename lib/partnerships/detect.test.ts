import { describe, expect, it } from "vitest";
import {
  bestCostAdvantage,
  coverageRate,
  detectPartnerships,
  meetsLevel,
  reducesCost,
} from "./detect";
import { PARTNERSHIPS_DATA, FRENCH_UNIVERSITIES_DATA } from "@/content/partnerships.generated";
import { UNIVERSITIES, universityName } from "@/content/universities";
import type { Partnership } from "./types";

const fake = (over: Partial<Partnership> = {}): Partnership => ({
  id: "test",
  frenchUniversityId: "assas",
  frenchUniversity: "Université Paris-Panthéon-Assas",
  usLawSchool: "Test School of Law",
  city: "Boston",
  state: "Massachusetts",
  partnershipType: "reserved_seat",
  tuitionCategory: "fixed_fee",
  tuitionDisplay: null,
  financialAid: null,
  seatsDisplay: null,
  seatsMin: null,
  seatsMax: null,
  requiredLevel: "M2",
  requiredLevelRaw: "M2",
  programLanguage: null,
  duration: null,
  specialties: [],
  admissionConditions: null,
  languageTests: [],
  applicationDeadline: null,
  shortDescription: null,
  officialLink: null,
  reliability: "confirmed",
  missingInformation: [],
  notes: null,
  active: true,
  verifiedAt: "2026-07-29",
  ...over,
});

describe("base de partenariats importée (CDC §27)", () => {
  it("contient les partenariats des universités françaises", () => {
    expect(PARTNERSHIPS_DATA.length).toBeGreaterThan(30);
    expect(FRENCH_UNIVERSITIES_DATA.length).toBeGreaterThan(10);
  });

  it("porte les neuf champs exigés sur chaque fiche", () => {
    for (const p of PARTNERSHIPS_DATA) {
      expect(p.id).toBeTruthy();
      expect(p.frenchUniversity).toBeTruthy();
      expect(p.usLawSchool).toBeTruthy();
      expect(p.partnershipType).toBeTruthy();
      expect(p.tuitionCategory).toBeTruthy();
      expect(p.reliability).toBeTruthy();
      expect(p.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(typeof p.active).toBe("boolean");
    }
  });

  it("n'active que les fiches confirmées", () => {
    for (const p of PARTNERSHIPS_DATA) {
      expect(p.active).toBe(p.reliability === "confirmed");
    }
  });

  it("rattache chaque partenariat à une université de la liste du questionnaire", () => {
    const ids = new Set(UNIVERSITIES.map((u) => u.id));
    for (const p of PARTNERSHIPS_DATA) {
      expect(ids.has(p.frenchUniversityId), `université inconnue : ${p.frenchUniversityId}`).toBe(true);
    }
  });

  it("résout le libellé d'une université depuis son identifiant", () => {
    expect(universityName("assas")).toMatch(/Assas/);
    expect(universityName("identifiant-inexistant")).toBe("votre université");
    expect(universityName(undefined)).toBe("votre université");
  });
});

describe("compatibilité de niveau", () => {
  it("ouvre un partenariat M2 à un M2, un CAPA ou un doctorat", () => {
    const p = fake({ requiredLevel: "M2" });
    for (const niveau of ["M2", "CRFPA", "CAPA", "DOCTORAT"] as const) {
      expect(meetsLevel(p, niveau)).toBe(true);
    }
  });

  it("ferme un partenariat M2 à un étudiant en licence ou en M1", () => {
    const p = fake({ requiredLevel: "M2" });
    expect(meetsLevel(p, "LICENCE")).toBe(false);
    expect(meetsLevel(p, "M1")).toBe(false);
  });

  it("n'exclut jamais sur une donnée absente", () => {
    // Niveau requis inconnu : la fiche reste proposée, charge à l'utilisateur
    // de vérifier. Fermer sur une absence écarterait à tort.
    expect(meetsLevel(fake({ requiredLevel: null }), "LICENCE")).toBe(true);
    expect(meetsLevel(fake({ requiredLevel: "M2" }), undefined)).toBe(true);
    expect(meetsLevel(fake({ requiredLevel: "M2" }), "AUTRE")).toBe(true);
  });
});

describe("détection", () => {
  it("ne retourne rien sans université renseignée", () => {
    const d = detectPartnerships(undefined, "M2");
    expect(d.confirmed).toHaveLength(0);
    expect(d.universityCovered).toBe(false);
  });

  it("détecte les accords d'une université couverte", () => {
    const d = detectPartnerships("assas", "M2");
    expect(d.universityCovered).toBe(true);
    expect(d.confirmed.length).toBeGreaterThan(0);
    for (const p of d.confirmed) expect(p.frenchUniversityId).toBe("assas");
  });

  it("sépare les fiches confirmées des pistes à confirmer", () => {
    const d = detectPartnerships("assas", "M2");
    for (const p of d.confirmed) expect(p.reliability).toBe("confirmed");
    for (const p of d.toConfirm) expect(p.reliability).toBe("to_confirm");
  });

  it("ne montre jamais une fiche incomplète", () => {
    for (const u of FRENCH_UNIVERSITIES_DATA) {
      const d = detectPartnerships(u.id, "M2");
      for (const p of [...d.confirmed, ...d.toConfirm]) {
        expect(p.reliability).not.toBe("incomplete");
      }
    }
  });

  it("écarte du niveau atteint les accords réservés à un niveau supérieur", () => {
    const partnerships = [
      fake({ id: "m2", requiredLevel: "M2" }),
      fake({ id: "m1", requiredLevel: "M1" }),
    ];
    const licence = detectPartnerships("assas", "LICENCE", partnerships);
    expect(licence.confirmed).toHaveLength(0);
    expect(licence.aboveLevel.map((p) => p.id).sort()).toEqual(["m1", "m2"]);

    const m2 = detectPartnerships("assas", "M2", partnerships);
    expect(m2.confirmed).toHaveLength(2);
    expect(m2.aboveLevel).toHaveLength(0);
  });

  it("signale une université non couverte sans prétendre qu'il n'existe rien", () => {
    const d = detectPartnerships("strasbourg", "M2");
    expect(d.universityCovered).toBe(false);
    expect(d.confirmed).toHaveLength(0);
  });
});

describe("avantage financier", () => {
  it("identifie les accords qui abaissent réellement le coût", () => {
    expect(reducesCost(fake({ tuitionCategory: "no_tuition" }))).toBe(true);
    expect(reducesCost(fake({ tuitionCategory: "fixed_fee" }))).toBe(true);
    expect(reducesCost(fake({ tuitionCategory: "reduced_tuition" }))).toBe(true);
    expect(reducesCost(fake({ tuitionCategory: "full_or_unknown" }))).toBe(false);
    expect(reducesCost(fake({ tuitionCategory: "to_confirm" }))).toBe(false);
  });

  it("retient le meilleur avantage disponible", () => {
    const d = detectPartnerships("assas", "M2", [
      fake({ id: "reduit", tuitionCategory: "reduced_tuition" }),
      fake({ id: "gratuit", tuitionCategory: "no_tuition" }),
    ]);
    expect(bestCostAdvantage(d)?.id).toBe("gratuit");
  });

  it("ne retient jamais un avantage issu d'une fiche non confirmée", () => {
    const d = detectPartnerships("assas", "M2", [
      fake({ id: "piste", tuitionCategory: "no_tuition", reliability: "to_confirm", active: false }),
    ]);
    expect(bestCostAdvantage(d)).toBeNull();
  });
});

describe("taux de détection (CDC §27)", () => {
  it("mesure la part des utilisateurs dont l'université est couverte", () => {
    expect(coverageRate(["assas", "strasbourg"])).toBe(50);
    expect(coverageRate(["assas", "paris1"])).toBe(100);
    expect(coverageRate([])).toBe(0);
    expect(coverageRate([undefined, "assas"])).toBe(50);
  });
});
