import { createHmac, timingSafeEqual } from "node:crypto";
import { OFFERS, type OfferCode } from "./offers";

/**
 * Intégration Stripe (CDC §16.2, Phase 1B).
 *
 * Appels directs à l'API REST plutôt qu'au SDK : aucune dépendance
 * supplémentaire, et le contrat reste explicite. Tout est derrière
 * `PaymentProvider` — passer au SDK plus tard ne toucherait que ce fichier.
 */

export interface CheckoutRequest {
  offer: OfferCode;
  amountCents: number;
  assessmentId: string;
  email: string;
  successUrl: string;
  cancelUrl: string;
}

export interface PaymentProvider {
  readonly name: string;
  createCheckout(request: CheckoutRequest): Promise<{ url: string } | { error: string }>;
}

/** Provider inactif : renvoyé tant que Stripe n'est pas configuré (Phase 1A). */
export const disabledProvider: PaymentProvider = {
  name: "disabled",
  async createCheckout() {
    return { error: "Le paiement n'est pas activé." };
  },
};

export function stripeProvider(secretKey: string): PaymentProvider {
  return {
    name: "stripe",
    async createCheckout(request) {
      const body = new URLSearchParams({
        mode: "payment",
        customer_email: request.email,
        success_url: request.successUrl,
        cancel_url: request.cancelUrl,
        "line_items[0][quantity]": "1",
        "line_items[0][price_data][currency]": "eur",
        "line_items[0][price_data][unit_amount]": String(request.amountCents),
        "line_items[0][price_data][product_data][name]": OFFERS[request.offer].name,
        "line_items[0][price_data][product_data][description]": OFFERS[request.offer].scope,
        // L'identifiant d'évaluation revient dans le webhook : c'est lui qui
        // relie le paiement au rapport en file.
        "metadata[assessmentId]": request.assessmentId,
        "metadata[offer]": request.offer,
      });

      const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      });

      if (!response.ok) {
        return { error: `Stripe a répondu ${response.status}` };
      }
      const session = (await response.json()) as { url?: string };
      return session.url ? { url: session.url } : { error: "Session sans URL de paiement." };
    },
  };
}

export function getPaymentProvider(): PaymentProvider {
  const key = process.env.STRIPE_SECRET_KEY;
  return key ? stripeProvider(key) : disabledProvider;
}

/**
 * Vérification de la signature d'un webhook Stripe.
 * Un webhook non signé ou mal signé ne doit jamais modifier l'état d'un
 * rapport : c'est le seul rempart contre une confirmation de paiement forgée.
 */
export function verifyStripeSignature(
  payload: string,
  signatureHeader: string | null,
  secret: string,
  now: Date,
  toleranceSeconds = 300
): boolean {
  if (!signatureHeader) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((part) => part.split("=", 2) as [string, string])
  );
  const timestamp = parts.t;
  const provided = parts.v1;
  if (!timestamp || !provided) return false;

  const age = Math.abs(Math.floor(now.getTime() / 1000) - Number(timestamp));
  if (!Number.isFinite(age) || age > toleranceSeconds) return false;

  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${payload}`)
    .digest("hex");

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(provided, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}
