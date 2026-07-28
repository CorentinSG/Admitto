/**
 * Gestion de la capacité humaine (CDC §18).
 * Le délai annoncé à l'utilisateur dépend du nombre de rapports actifs dans la
 * file. Il n'est jamais promis un délai que la capacité ne permet pas de tenir.
 */

export const DELAY_TIERS = [
  { maxActive: 10, label: "sous 48 heures" },
  { maxActive: 25, label: "sous 3 jours ouvrés" },
] as const;

export const SATURATED_LABEL =
  "délai actuellement allongé, il vous sera confirmé par email";

/** Délai à afficher pour un nombre de rapports actuellement en file. */
export function announcedDelay(activeReports: number): string {
  const tier = DELAY_TIERS.find((t) => activeReports <= t.maxActive);
  return tier ? tier.label : SATURATED_LABEL;
}

/** Au-delà du dernier palier, les commandes doivent être limitées ou le délai relevé. */
export function isSaturated(activeReports: number): boolean {
  return activeReports > DELAY_TIERS[DELAY_TIERS.length - 1].maxActive;
}
