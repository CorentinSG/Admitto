import { NextResponse } from "next/server";
import { verifyStripeSignature } from "@/lib/payments/stripe";
import { createDeduction } from "@/lib/payments/deduction";
import { OFFERS } from "@/lib/payments/offers";
import { reportStore } from "@/lib/store/reports";
import { log } from "@/lib/observability/log";

/**
 * Webhook Stripe (CDC §16.2).
 *
 * Un paiement confirmé fait deux choses : il marque le rapport comme payant —
 * ce qui le fait passer devant dans la file (CDC §18) — et il ouvre la fenêtre
 * de déduction de trente jours.
 *
 * Aucune de ces opérations n'est effectuée sans signature valide : une
 * confirmation de paiement forgée doit rester sans effet.
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    // Sans secret configuré, le webhook est inerte plutôt que permissif.
    log("warn", "stripe.rejected", { reason: "unconfigured" });
    return NextResponse.json({ error: "Webhook non configuré." }, { status: 503 });
  }

  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!verifyStripeSignature(payload, signature, secret, new Date())) {
    // Le niveau `error` est délibéré : une signature invalide est soit une
    // tentative de forger un paiement, soit une clé désynchronisée — dans les
    // deux cas, quelque chose qu'on veut voir. Ni le corps ni la signature ne
    // sont journalisés : le corps porte l'identifiant de l'évaluation.
    log("error", "stripe.rejected", { reason: "bad_signature", signed: Boolean(signature) });
    return NextResponse.json({ error: "Signature invalide." }, { status: 400 });
  }

  let event: { type?: string; data?: { object?: Record<string, unknown> } };
  try {
    event = JSON.parse(payload);
  } catch {
    log("error", "stripe.rejected", { reason: "unparseable" });
    return NextResponse.json({ error: "Corps illisible." }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    // Les autres événements sont acquittés sans traitement.
    log("info", "stripe.accepted", { handled: false, type: String(event.type ?? "") });
    return NextResponse.json({ received: true });
  }

  const session = event.data?.object ?? {};
  const metadata = (session.metadata ?? {}) as Record<string, string>;
  const assessmentId = metadata.assessmentId;

  if (!assessmentId) {
    // Un paiement confirmé qu'on ne sait pas rattacher : quelqu'un a payé et
    // n'obtiendra rien. C'est l'échec le plus coûteux de cette route.
    log("error", "stripe.rejected", { reason: "missing_assessment" });
    return NextResponse.json({ error: "Identifiant d'évaluation absent." }, { status: 400 });
  }

  const report = await reportStore.get(assessmentId);
  if (!report) {
    // Même gravité : le paiement a eu lieu, le rapport correspondant n'existe
    // pas. L'identifiant n'est pas journalisé — c'est une capacité d'accès.
    log("error", "stripe.rejected", { reason: "unknown_report" });
    return NextResponse.json({ error: "Rapport introuvable." }, { status: 404 });
  }

  const paidAt = new Date();
  await reportStore.markPaid(
    assessmentId,
    createDeduction(OFFERS.DIAGNOSTIC.priceCents ?? 0, paidAt)
  );

  log("info", "stripe.accepted", { handled: true });
  return NextResponse.json({ received: true });
}
