import { describe, expect, it, vi } from "vitest";
import { applyDeduction, createDeduction, isDeductionValid, DEDUCTION_WINDOW_DAYS } from "./deduction";
import { OFFERS, formatEuros, instalments, paymentsEnabled } from "./offers";

const PAID = new Date(Date.UTC(2026, 6, 28));

describe("déduction du diagnostic (CDC §16.2)", () => {
  it("court sur trente jours à compter du paiement", () => {
    const d = createDeduction(7_900, PAID);
    expect(DEDUCTION_WINDOW_DAYS).toBe(30);
    expect(d.expiresAt.slice(0, 10)).toBe("2026-08-27");
  });

  it("reste valable jusqu'à l'échéance, plus après", () => {
    const d = createDeduction(7_900, PAID);
    expect(isDeductionValid(d, new Date(Date.UTC(2026, 7, 26)))).toBe(true);
    expect(isDeductionValid(d, new Date(Date.UTC(2026, 7, 28)))).toBe(false);
  });

  it("s'impute sur l'offre principale", () => {
    const d = createDeduction(7_900, PAID);
    const prix = applyDeduction("PLATFORM", d, PAID);
    expect(prix.deductionApplied).toBe(true);
    expect(prix.deductedCents).toBe(7_900);
    expect(prix.payableCents).toBe(OFFERS.PLATFORM.priceCents! - 7_900);
  });

  it("ne s'impute jamais sur le diagnostic lui-même", () => {
    const prix = applyDeduction("DIAGNOSTIC", createDeduction(7_900, PAID), PAID);
    expect(prix.deductionApplied).toBe(false);
    expect(prix.reason).toBe("NOT_DEDUCTIBLE");
    expect(prix.payableCents).toBe(OFFERS.DIAGNOSTIC.priceCents);
  });

  it("expose la raison lorsqu'elle n'est pas appliquée", () => {
    const expiree = applyDeduction("PLATFORM", createDeduction(7_900, PAID), new Date(Date.UTC(2026, 8, 1)));
    expect(expiree.reason).toBe("EXPIRED");
    expect(expiree.payableCents).toBe(OFFERS.PLATFORM.priceCents);
    expect(applyDeduction("PLATFORM", null, PAID).reason).toBe("NO_DEDUCTION");
  });

  it("ne rend jamais un prix négatif", () => {
    const enorme = createDeduction(1_000_000, PAID);
    const prix = applyDeduction("PLATFORM", enorme, PAID);
    expect(prix.payableCents).toBe(0);
  });
});

describe("catalogue et paiement fractionné (CDC §30)", () => {
  it("place le diagnostic dans la fourchette 49–99 € autorisée", () => {
    expect(OFFERS.DIAGNOSTIC.priceCents).toBeGreaterThanOrEqual(4_900);
    expect(OFFERS.DIAGNOSTIC.priceCents).toBeLessThanOrEqual(9_900);
  });

  it("répartit les échéances sans perdre de centime", () => {
    const parts = instalments(39_900, 3);
    expect(parts).toHaveLength(3);
    expect(parts.reduce((a, b) => a + b, 0)).toBe(39_900);
  });

  it("laisse Concierge sans prix affiché : offre sur candidature", () => {
    expect(OFFERS.CONCIERGE.priceCents).toBeNull();
  });

  it("formate les montants en euros", () => {
    expect(formatEuros(7_900)).toMatch(/79/);
  });

  it("désactive le paiement tant que Stripe n'est pas configuré", () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "");
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "");
    expect(paymentsEnabled()).toBe(false);
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_x");
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_x");
    expect(paymentsEnabled()).toBe(true);
    vi.unstubAllEnvs();
  });

  it("n'encaisse jamais ce qu'il ne saurait pas enregistrer", () => {
    /*
     * La clé secrète seule suffisait à ouvrir le paiement, et c'était le régime
     * le plus coûteux du produit : Stripe encaissait, le webhook répondait 503
     * faute de secret de signature, le rapport n'était jamais marqué payé —
     * donc jamais prioritaire dans la file — et la déduction de trente jours ne
     * s'ouvrait pas. La personne avait payé, le produit se comportait comme si
     * elle ne l'avait pas fait, et rien ne le lui disait.
     *
     * Le cas n'a rien de théorique : la clé secrète existe dès la création du
     * compte Stripe, le secret de signature seulement une fois le point
     * d'entrée déclaré. N'avoir que la première est l'état normal d'une
     * configuration en cours.
     */
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_x");
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "");
    expect(paymentsEnabled()).toBe(false);

    // Et l'inverse, qui n'encaisse rien mais n'a pas de sens non plus.
    vi.stubEnv("STRIPE_SECRET_KEY", "");
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_x");
    expect(paymentsEnabled()).toBe(false);
    vi.unstubAllEnvs();
  });
});
