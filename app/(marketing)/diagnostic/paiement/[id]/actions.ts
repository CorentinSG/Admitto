"use server";

import { getPaymentProvider } from "@/lib/payments/stripe";
import { OFFERS, paymentsEnabled } from "@/lib/payments/offers";
import { assessmentStore } from "@/lib/store/assessments";

/**
 * Ouverture du tunnel de paiement du diagnostic (CDC §16.2).
 * Le montant n'est jamais transmis depuis le client : il est relu du catalogue.
 */
export async function startCheckout(assessmentId: string, origin: string) {
  if (!paymentsEnabled()) {
    return { error: "Le paiement n'est pas activé." };
  }

  const assessment = await assessmentStore.get(assessmentId);
  if (!assessment?.answers.email) {
    return { error: "Évaluation introuvable." };
  }

  const provider = getPaymentProvider();
  const result = await provider.createCheckout({
    offer: "DIAGNOSTIC",
    amountCents: OFFERS.DIAGNOSTIC.priceCents ?? 0,
    assessmentId,
    email: assessment.answers.email,
    successUrl: `${origin}/resultat/${assessmentId}?paiement=ok`,
    cancelUrl: `${origin}/diagnostic/paiement/${assessmentId}`,
  });

  return "url" in result ? { url: result.url } : { error: result.error };
}
