import { describe, expect, it } from "vitest";
import { deductionView, EXPIRING_WITHIN_DAYS } from "./deduction-state";
import { createDeduction } from "./deduction";
import { checkout } from "@/content/checkout";

/**
 * État de la déduction tel qu'il est MONTRÉ (CDC §16.2).
 *
 * Deux niveaux se testent ici : l'état déduit de la date, et la phrase qui en
 * découle. La seconde compte autant que le premier — un état « expiré » rendu
 * par une phrase qui annonce encore un montant déductible serait une promesse
 * que le paiement ne tiendrait pas.
 */

describe("état de la déduction", () => {
  const PAID = new Date("2026-07-01T10:00:00.000Z");
  const deduction = createDeduction(7_900, PAID);

  it("annonce les jours restants tant qu'elle court", () => {
    const view = deductionView(deduction, "PLATFORM", new Date("2026-07-10T10:00:00.000Z"));
    expect(view.state).toBe("ACTIVE");
    expect(view.daysLeft).toBe(21);
    expect(view.amountLabel).toBe("79 €");
    // Le prix ET la déduction : un montant sans son motif se lit comme une
    // erreur ou une promesse non tenue.
    expect(view.offerPriceLabel).toBe("399 €");
    expect(view.payableLabel).toBe("320 €");
  });

  it("signale l'approche de l'expiration", () => {
    const almost = new Date(
      deduction.expiresAt.slice(0, 10) + "T10:00:00.000Z"
    );
    almost.setUTCDate(almost.getUTCDate() - (EXPIRING_WITHIN_DAYS - 1));
    expect(deductionView(deduction, "PLATFORM", almost).state).toBe("EXPIRING");
  });

  it("dit qu'elle a expiré, et rend le tarif plein", () => {
    const view = deductionView(deduction, "PLATFORM", new Date("2026-09-01T10:00:00.000Z"));
    expect(view.state).toBe("EXPIRED");
    expect(view.daysLeft).toBeLessThan(0);
    // Le prix affiché redevient le tarif plein : afficher un prix déduit
    // après expiration serait une promesse que le paiement ne tiendrait pas.
    expect(view.payableLabel).toBe(view.offerPriceLabel);
  });

  it("n'invente aucun état sans paiement", () => {
    const view = deductionView(null, "PLATFORM", new Date("2026-07-10T10:00:00.000Z"));
    expect(view.state).toBe("NONE");
    expect(view.amountLabel).toBe("");
    expect(view.payableLabel).toBe(view.offerPriceLabel);
  });
});

describe("phrases affichées", () => {
  const AMOUNT = "79 €";

  it("annonce le montant ET son échéance tant qu'elle court", () => {
    for (const phrase of [
      checkout.deductionState.active(AMOUNT, "Guided", 21, "27 août 2026"),
      checkout.deductionState.expiring(AMOUNT, "Guided", 3, "3 août 2026"),
    ]) {
      expect(phrase).toContain(AMOUNT);
      expect(phrase).toContain("Guided");
      // Un montant sans sa date se lit comme un acquis sans fin.
      expect(phrase).toMatch(/\d{1,2} (janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre) \d{4}/);
    }
  });

  it("distingue l'urgence de la simple validité", () => {
    const active = checkout.deductionState.active(AMOUNT, "Guided", 21, "27 août 2026");
    const expiring = checkout.deductionState.expiring(AMOUNT, "Guided", 3, "3 août 2026");
    expect(active).not.toBe(expiring);
    // « plus que » porte l'urgence : sans elle, les deux phrases se valent et
    // la fenêtre qui se referme passe inaperçue.
    expect(expiring).toContain("plus que");
  });

  it("n'annonce plus rien de déductible une fois expirée", () => {
    const phrase = checkout.deductionState.expired(AMOUNT, "21 juillet 2026");
    expect(phrase).toContain("expiré");
    // Le montant est cité comme ce qui A ÉTÉ perdu, jamais comme une déduction
    // encore ouverte : « restent déductibles » ne doit pas y figurer.
    expect(phrase).not.toContain("restent déductibles");
    // Et la ligne de prix qui l'accompagne est le tarif plein, sans « à payer
    // aujourd'hui » qui laisserait croire à une remise toujours appliquée.
    const price = checkout.deductionState.fullPrice("1 500 €");
    expect(price).toContain("1 500 €");
    expect(price).not.toContain("à payer aujourd'hui");
  });

  it("affiche le prix plein à côté du prix déduit tant qu'elle court", () => {
    // Le prix déduit seul ne se comprend pas : c'est l'écart entre les deux
    // qui montre ce que la déduction vaut.
    const price = checkout.deductionState.price("1 500 €", "1 421 €");
    expect(price).toContain("1 500 €");
    expect(price).toContain("1 421 €");
  });
});
