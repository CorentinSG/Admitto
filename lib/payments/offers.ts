/**
 * Catalogue des offres (CDC §30) et état d'activation du paiement.
 *
 * Phase 1A : le paiement n'est pas activé, le diagnostic est offert aux
 * participants de la bêta. Phase 1B : le diagnostic passe à 79 €. Le basculement
 * tient à la présence de la clé Stripe, pas à une modification de code.
 */

export const OFFER_CODES = ["FREE", "DIAGNOSTIC", "PLATFORM", "GUIDED", "CONCIERGE"] as const;
export type OfferCode = (typeof OFFER_CODES)[number];

export interface Offer {
  code: OfferCode;
  name: string;
  /** Prix en centimes d'euro. `null` pour les offres sur candidature. */
  priceCents: number | null;
  /** Nombre maximal d'échéances affichables (CDC §30 : paiement en 3 ou 4 fois). */
  maxInstalments: number;
  scope: string;
}

export const OFFERS: Record<OfferCode, Offer> = {
  FREE: {
    code: "FREE",
    name: "Découverte",
    priceCents: 0,
    maxInstalments: 1,
    scope: "Questionnaire, résultat préliminaire immédiat et FAQ.",
  },
  DIAGNOSTIC: {
    code: "DIAGNOSTIC",
    name: "Diagnostic",
    // Prix de test conseillé par le CDC §16.2, dans la fourchette 49–99 €.
    priceCents: 7_900,
    maxInstalments: 1,
    scope: "Rapport éducatif et stratégique personnalisé de trois à quatre pages.",
  },
  PLATFORM: {
    code: "PLATFORM",
    name: "Roadmap & Platform",
    priceCents: 39_900,
    maxInstalments: 4,
    scope:
      "Tableau de bord, feuille de route, modules, simulateur, modèles et trackers ; outils dynamiques et mises à jour pendant vingt-quatre mois.",
  },
  GUIDED: {
    code: "GUIDED",
    name: "Guided",
    priceCents: 150_000,
    maxInstalments: 4,
    scope:
      "La plateforme, trois à cinq consultations et des relectures définies, sur six ou douze mois.",
  },
  CONCIERGE: {
    code: "CONCIERGE",
    name: "Concierge",
    priceCents: null, // sur candidature, périmètre contractuel précis
    maxInstalments: 4,
    scope: "Offre sur candidature, nombre de places limité, périmètre contractuel précis.",
  },
};

/**
 * Le paiement n'est actif que si Stripe est configuré — les DEUX moitiés.
 *
 * La clé secrète seule suffisait, et c'était le régime le plus coûteux du
 * produit : Stripe encaissait, le webhook répondait 503 faute de secret de
 * signature, le rapport n'était jamais marqué payé — donc jamais prioritaire
 * dans la file (CDC §18) — et la déduction de trente jours ne s'ouvrait pas.
 * La personne avait payé ; le produit se comportait comme si elle ne l'avait
 * pas fait, et rien ne le lui disait.
 *
 * Ce n'est pas un régime théorique : les deux valeurs viennent d'endroits
 * différents du tableau de bord Stripe. La clé secrète est là dès la création
 * du compte, le secret de signature n'existe qu'une fois le point d'entrée
 * déclaré — avoir la première sans la seconde est l'état NORMAL d'une
 * configuration en cours.
 *
 * La règle du produit — « ce qui n'est pas configuré est fermé, pas ouvert » —
 * s'applique donc à la PAIRE, pas à chaque moitié : encaisser sans pouvoir
 * enregistrer est pire que ne pas encaisser.
 */
export function paymentsEnabled(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY) && Boolean(process.env.STRIPE_WEBHOOK_SECRET);
}

export function formatEuros(cents: number): string {
  return `${(cents / 100).toLocaleString("fr-FR", { minimumFractionDigits: 0 })} €`;
}

/** Échéances affichées, arrondies au centime près sur la dernière (CDC §30). */
export function instalments(cents: number, count: number): number[] {
  if (count <= 1) return [cents];
  const base = Math.floor(cents / count);
  const parts = Array.from({ length: count }, () => base);
  parts[count - 1] += cents - base * count;
  return parts;
}
