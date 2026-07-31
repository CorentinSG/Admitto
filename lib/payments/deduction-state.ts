import type { Deduction } from "./deduction";
import { isDeductionValid } from "./deduction";
import { OFFERS, formatEuros, type OfferCode } from "./offers";
import { applyDeduction } from "./deduction";

/**
 * État de la déduction, tel qu'il doit être MONTRÉ (CDC §16.2).
 *
 * Le calcul existait — `applyDeduction` rend déjà `reason: "EXPIRED"` — mais
 * aucun écran ne l'affichait : quelqu'un ayant payé son diagnostic ne savait ni
 * combien de temps il lui restait, ni que le délai était passé. Un prix affiché
 * sans sa raison est la faute que ce module supprime : on annonce toujours le
 * montant ET pourquoi il est celui-là.
 *
 * `reference` est un paramètre, jamais `Date.now()` implicite.
 */

export const DEDUCTION_STATES = ["ACTIVE", "EXPIRING", "EXPIRED", "NONE"] as const;
export type DeductionState = (typeof DEDUCTION_STATES)[number];

/** En deçà, la déduction « expire bientôt » : une semaine pour décider. */
export const EXPIRING_WITHIN_DAYS = 7;

export interface DeductionView {
  state: DeductionState;
  /** Montant déductible, formaté. Vide si aucune déduction n'existe. */
  amountLabel: string;
  /** Jours restants ; négatif si dépassé, 0 si aucune déduction. */
  daysLeft: number;
  /** Date d'expiration, ISO `AAAA-MM-JJ`. Vide si aucune déduction. */
  expiresOn: string;
  /** Prix à payer sur l'offre principale recommandée, formaté. */
  offerPriceLabel: string;
  /** Ce même prix, déduction faite si elle s'applique encore. */
  payableLabel: string;
}

const DAY = 86_400_000;

export function deductionView(
  deduction: Deduction | null,
  offer: OfferCode,
  reference: Date = new Date()
): DeductionView {
  const price = applyDeduction(offer, deduction, reference);
  const base: DeductionView = {
    state: "NONE",
    amountLabel: "",
    daysLeft: 0,
    expiresOn: "",
    offerPriceLabel: formatEuros(OFFERS[offer].priceCents ?? 0),
    payableLabel: formatEuros(price.payableCents),
  };

  if (!deduction) return base;

  const expiresOn = deduction.expiresAt.slice(0, 10);
  const daysLeft = Math.ceil(
    (new Date(`${expiresOn}T00:00:00.000Z`).getTime() -
      new Date(`${reference.toISOString().slice(0, 10)}T00:00:00.000Z`).getTime()) /
      DAY
  );

  const shared = { ...base, amountLabel: formatEuros(deduction.amountCents), daysLeft, expiresOn };

  if (!isDeductionValid(deduction, reference)) return { ...shared, state: "EXPIRED" };
  return { ...shared, state: daysLeft <= EXPIRING_WITHIN_DAYS ? "EXPIRING" : "ACTIVE" };
}
