import { describe, expect, it, vi } from "vitest";
import { createHmac } from "node:crypto";
import { disabledProvider, getPaymentProvider, verifyStripeSignature } from "./stripe";

const SECRET = "whsec_test";
const NOW = new Date(Date.UTC(2026, 6, 28, 12, 0, 0));

const sign = (payload: string, at: Date = NOW, secret = SECRET) => {
  const t = Math.floor(at.getTime() / 1000);
  const v1 = createHmac("sha256", secret).update(`${t}.${payload}`).digest("hex");
  return `t=${t},v1=${v1}`;
};

describe("signature des webhooks Stripe", () => {
  const payload = JSON.stringify({ type: "checkout.session.completed" });

  it("accepte une signature valide et fraîche", () => {
    expect(verifyStripeSignature(payload, sign(payload), SECRET, NOW)).toBe(true);
  });

  it("refuse une signature absente", () => {
    expect(verifyStripeSignature(payload, null, SECRET, NOW)).toBe(false);
  });

  it("refuse une signature forgée avec un autre secret", () => {
    expect(verifyStripeSignature(payload, sign(payload, NOW, "autre"), SECRET, NOW)).toBe(false);
  });

  it("refuse une signature trop ancienne (rejeu)", () => {
    const vieille = new Date(NOW.getTime() - 10 * 60 * 1000);
    expect(verifyStripeSignature(payload, sign(payload, vieille), SECRET, NOW)).toBe(false);
  });

  it("refuse un corps modifié après signature", () => {
    const signature = sign(payload);
    expect(verifyStripeSignature(payload + " ", signature, SECRET, NOW)).toBe(false);
  });
});

describe("fournisseur de paiement", () => {
  it("est désactivé tant que la clé Stripe est absente", async () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "");
    expect(getPaymentProvider().name).toBe("disabled");
    const result = await disabledProvider.createCheckout({
      offer: "DIAGNOSTIC",
      amountCents: 7_900,
      assessmentId: "x",
      email: "a@b.c",
      successUrl: "https://x/ok",
      cancelUrl: "https://x/ko",
    });
    expect(result).toHaveProperty("error");
    vi.unstubAllEnvs();
  });
});
