import { describe, expect, it } from "vitest";
import {
  boundedText,
  validEmail,
  MAX_COMMENT,
  MAX_EMAIL,
  MAX_FIRST_NAME,
} from "./limits";

describe("bornes des champs libres", () => {
  it("tronque un prénom démesuré au lieu de le refuser", () => {
    // Le formulaire est public et anonyme : un prénom d'un mégaoctet se
    // retrouvait dans le sujet de chaque email et dans le titre du rapport.
    // Le tronquer plutôt que refuser évite de bloquer un prénom réellement long.
    const huge = "a".repeat(100_000);
    expect(boundedText(huge, MAX_FIRST_NAME)).toHaveLength(MAX_FIRST_NAME);
  });

  it("traite une chaîne vide ou blanche comme une absence", () => {
    expect(boundedText("   ", MAX_FIRST_NAME)).toBeUndefined();
    expect(boundedText("", MAX_FIRST_NAME)).toBeUndefined();
    expect(boundedText(undefined, MAX_FIRST_NAME)).toBeUndefined();
    expect(boundedText(42, MAX_FIRST_NAME)).toBeUndefined();
  });

  it("conserve un prénom ordinaire tel quel, espaces retirés", () => {
    expect(boundedText("  Marie-Claire ", MAX_FIRST_NAME)).toBe("Marie-Claire");
  });

  it("plafonne le commentaire à la limite du CDC §12.2", () => {
    expect(boundedText("x".repeat(5_000), MAX_COMMENT)).toHaveLength(MAX_COMMENT);
  });
});

describe("adresse email", () => {
  it("accepte une adresse ordinaire", () => {
    expect(validEmail("  camille@example.com ")).toBe("camille@example.com");
  });

  it("refuse une adresse hors bornes plutôt que de la tronquer", () => {
    // Tronquée, l'adresse ne serait plus la sienne et l'email partirait dans
    // le vide — sans que personne ne le sache.
    const long = `${"a".repeat(MAX_EMAIL)}@example.com`;
    expect(validEmail(long)).toBeUndefined();
  });

  it("contrôle la longueur AVANT la forme", () => {
    // Une chaîne d'un mégaoctet ne doit pas être soumise à l'expression
    // régulière : c'est exactement le travail qu'on ne veut pas faire sur une
    // entrée publique.
    const enormous = `${"a".repeat(1_000_000)}@example.com`;
    const started = Date.now();
    expect(validEmail(enormous)).toBeUndefined();
    expect(Date.now() - started).toBeLessThan(50);
  });

  it("refuse ce qui n'a pas la forme d'une adresse", () => {
    for (const bad of ["camille", "camille@", "@example.com", "camille example.com", ""]) {
      expect(validEmail(bad), bad).toBeUndefined();
    }
  });

  it("refuse une valeur qui n'est pas une chaîne", () => {
    expect(validEmail(null)).toBeUndefined();
    expect(validEmail({ toString: () => "x@y.z" })).toBeUndefined();
  });
});
