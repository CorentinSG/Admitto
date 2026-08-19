import type { Axis } from "@/lib/engine-b/verdict";
import { isModulePublished } from "@/content/modules";
import { MODULE_BY_AXIS } from "@/lib/email/resource";

/**
 * Ce qui travaille un axe faible (plan de personnalisation, point 1.3).
 *
 * Le Moteur B note cinq axes et le rapport les montre — UNE FOIS, dans un
 * document. L'espace payant, où la personne revient chaque semaine, ne les
 * montrait jamais : c'est pourtant la photographie la plus personnelle que le
 * produit possède, et elle dormait dans un PDF.
 *
 * Les montrer sans dire quoi en faire ne serait qu'un bulletin de notes. Chaque
 * axe faible pointe donc vers ce qui le travaille — un outil du produit, un
 * module, ou les deux :
 *
 * - **L'outil** est celui qui accomplit réellement le travail. Même raison que
 *   `toolHref` sur les tâches : sans lui, le produit nomme une fragilité qu'il
 *   sait aider à réduire, et laisse la personne la traiter ailleurs.
 * - **Le module** est celui du J+12, repris tel quel (`MODULE_BY_AXIS`). Deux
 *   tables diraient deux choses du même axe, et l'email cesserait un jour de
 *   correspondre à l'écran.
 *
 * Un axe SOLIDE ne pointe vers rien : proposer un remède à ce qui va bien
 * transformerait la photographie en liste de courses.
 */

/** Outil du produit qui travaille cet axe, ou `null` s'il n'y en a pas. */
export const TOOL_BY_AXIS: Record<Axis, { href: string; label: string } | null> = {
  // Le dossier académique se joue dans le choix des programmes visés.
  ACADEMIC_STRENGTH: { href: "/app/ecoles", label: "Revoir votre liste d'écoles" },
  FINANCIAL_FIT: { href: "/app/simulateur", label: "Chiffrer votre coût net" },
  /*
   * Réalisme professionnel et risque migratoire : aucun outil du produit ne les
   * travaille — le premier relève d'un travail personnel, le second d'autorités
   * dont le produit ne fait jamais les démarches. Le module reste, lui.
   */
  PROFESSIONAL_REALISM: null,
  TIMELINE_FEASIBILITY: { href: "/app/roadmap", label: "Ouvrir votre feuille de route" },
  IMMIGRATION_RISK: null,
};

export interface AxisResources {
  tool: { href: string; label: string } | null;
  moduleSlug: string | null;
}

/**
 * Ressources d'un axe. `moduleSlug` est `null` si le module n'est pas
 * publiable : le CDC §25 interdit de présenter un module non sourcé, et un lien
 * vers une page vide vaut moins que pas de lien.
 */
export function resourcesForAxis(axis: Axis): AxisResources {
  const wanted = MODULE_BY_AXIS[axis];
  return {
    tool: TOOL_BY_AXIS[axis],
    moduleSlug: isModulePublished(wanted) ? wanted : null,
  };
}
