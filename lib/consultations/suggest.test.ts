import { describe, expect, it } from "vitest";
import { CONSULTATION_BY_PHASE, suggestedConsultation } from "./suggest";
import { CONSULTATION_TYPES } from "./types";
import { PHASES } from "@/lib/profile/derive";

describe("séance mise en avant selon la phase (personnalisation 1.5)", () => {
  it("couvre exactement les treize phases", () => {
    // Une phase ajoutée au produit sans décision ne compile pas ; ce test
    // vérifie l'inverse — aucune entrée orpheline dans la table.
    expect(Object.keys(CONSULTATION_BY_PHASE).sort()).toEqual([...PHASES].sort());
  });

  it("ne met en avant que des types qui existent", () => {
    for (const [phase, type] of Object.entries(CONSULTATION_BY_PHASE)) {
      if (type !== null) {
        expect(CONSULTATION_TYPES, phase).toContain(type);
      }
    }
  });

  it("suit l'étape : sélection → écoles, candidatures → relecture, examen → planification", () => {
    expect(suggestedConsultation("LLM_SELECTION")).toBe("SCHOOL_LIST_REVIEW");
    expect(suggestedConsultation("APPLICATIONS")).toBe("APPLICATION_REVIEW");
    expect(suggestedConsultation("BAR_PREPARATION")).toBe("BAR_PLANNING");
    expect(suggestedConsultation("CLARIFICATION")).toBe("ORIENTATION");
  });

  it("ne met rien en avant quand aucune séance ne correspond mieux", () => {
    /*
     * `null` est une réponse légitime, pas un trou. Financement et visa :
     * aucune séance ne les traite, et chaque périmètre EXCLUT les démarches
     * auprès d'une autorité — mettre un type en avant laisserait croire que la
     * séance porte sur ce que la personne a en tête à ce moment-là.
     */
    expect(suggestedConsultation("FUNDING")).toBeNull();
    expect(suggestedConsultation("VISA")).toBeNull();
    expect(suggestedConsultation("BOLE")).toBeNull();
  });

  it("ne met rien en avant sans phase connue", () => {
    expect(suggestedConsultation(null)).toBeNull();
  });

  it("met en avant sans jamais retirer : c'est un ordre, pas un filtre", () => {
    // Le test de la page vérifie que les quatre types restent listés ; ici, on
    // verrouille le fait que la table ne saurait pas exclure — elle ne rend
    // qu'un type, jamais une liste de types autorisés.
    const misEnAvant = new Set(Object.values(CONSULTATION_BY_PHASE).filter(Boolean));
    expect(misEnAvant.size).toBeLessThanOrEqual(CONSULTATION_TYPES.length);
    expect(misEnAvant.size).toBeGreaterThan(1);
  });
});
