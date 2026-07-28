import { OFFERS, type OfferCode } from "./offers";

/**
 * Déduction du diagnostic sur l'offre principale (CDC §16.2).
 *
 * Le montant du diagnostic est déductible pendant trente jours à compter du
 * paiement. La déduction ne s'applique qu'aux offres principales, jamais au
 * diagnostic lui-même, et ne peut pas rendre un prix négatif.
 */

export const DEDUCTION_WINDOW_DAYS = 30;

/** Offres sur lesquelles la déduction s'impute. */
const DEDUCTIBLE_ON: OfferCode[] = ["PLATFORM", "GUIDED", "CONCIERGE"];

export interface Deduction {
  amountCents: number;
  paidAt: string;
  expiresAt: string;
}

export function createDeduction(amountCents: number, paidAt: Date): Deduction {
  const expiresAt = new Date(paidAt);
  expiresAt.setUTCDate(expiresAt.getUTCDate() + DEDUCTION_WINDOW_DAYS);
  return {
    amountCents,
    paidAt: paidAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
}

export function isDeductionValid(deduction: Deduction, at: Date): boolean {
  return at.toISOString() <= deduction.expiresAt;
}

export function isDeductibleOn(offer: OfferCode): boolean {
  return DEDUCTIBLE_ON.includes(offer);
}

export interface PriceBreakdown {
  offer: OfferCode;
  listPriceCents: number;
  deductedCents: number;
  payableCents: number;
  deductionApplied: boolean;
  reason?: "EXPIRED" | "NOT_DEDUCTIBLE" | "NO_DEDUCTION";
}

/**
 * Prix à payer après application éventuelle de la déduction.
 * Toujours explicite sur la raison d'une non-application : c'est cette raison
 * qui doit être affichée à l'utilisateur, jamais un prix sans explication.
 */
export function applyDeduction(
  offerCode: OfferCode,
  deduction: Deduction | null,
  at: Date
): PriceBreakdown {
  const listPriceCents = OFFERS[offerCode].priceCents ?? 0;
  const base: PriceBreakdown = {
    offer: offerCode,
    listPriceCents,
    deductedCents: 0,
    payableCents: listPriceCents,
    deductionApplied: false,
  };

  if (!deduction) return { ...base, reason: "NO_DEDUCTION" };
  if (!isDeductibleOn(offerCode)) return { ...base, reason: "NOT_DEDUCTIBLE" };
  if (!isDeductionValid(deduction, at)) return { ...base, reason: "EXPIRED" };

  const deducted = Math.min(deduction.amountCents, listPriceCents);
  return {
    offer: offerCode,
    listPriceCents,
    deductedCents: deducted,
    payableCents: listPriceCents - deducted,
    deductionApplied: true,
  };
}
