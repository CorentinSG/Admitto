/**
 * Base de partenariats (CDC §27). Chaque entrée porte université française,
 * law school américaine, type d'avantage, conditions, procédure, deadline,
 * source, date de vérification et statut.
 *
 * ⚠️ Amorce vide volontairement : aucun partenariat ne doit être affiché à un
 * utilisateur avant d'avoir été vérifié à sa source. La plateforme mesure le
 * taux de détection (part des utilisateurs dont l'université est couverte), ce
 * qui suppose de distinguer « non couvert » de « inventé ».
 */

export interface Partnership {
  id: string;
  frenchUniversity: string;
  usLawSchool: string;
  benefitType: "TUITION_DISCOUNT" | "RESERVED_SEATS" | "EXCHANGE" | "APPLICATION_FEE_WAIVER" | "OTHER";
  conditions: string;
  procedure: string;
  deadline: string | null;
  sourceUrl: string;
  verifiedAt: string | null;
  active: boolean;
}

export const PARTNERSHIPS: Partnership[] = [];

/** Universités françaises proposées à l'écran 3 du questionnaire. */
export const FRENCH_UNIVERSITIES = [
  "Université Paris 1 Panthéon-Sorbonne",
  "Université Paris-Panthéon-Assas",
  "Université Paris Nanterre",
  "Université Paris-Saclay",
  "Université Paris Cité",
  "Sciences Po Paris",
  "Université Aix-Marseille",
  "Université de Bordeaux",
  "Université Jean Moulin Lyon 3",
  "Université de Lille",
  "Université de Montpellier",
  "Université de Strasbourg",
  "Université de Rennes",
  "Université Toulouse Capitole",
  "Université de Nantes",
  "Autre université / non listée",
] as const;
