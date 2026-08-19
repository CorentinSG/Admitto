import type { Axis } from "@/lib/engine-b/verdict";
import { isModulePublished } from "@/content/modules";

/**
 * Le module joint au J+12, choisi d'après le risque principal de la personne
 * (plan de personnalisation, point 1.4).
 *
 * `resourceFor` renvoyait le module de décision à TOUT LE MONDE, et son propre
 * commentaire l'admettait : « le module recommandé par la feuille de route
 * serait plus fin ». Le produit calculait donc le risque principal de chacun —
 * financement, calendrier, migratoire — pour leur envoyer à tous la même
 * lecture. Un email qui dit « votre point de vigilance prioritaire » et joint
 * une ressource sans rapport enseigne surtout qu'il n'a pas été lu.
 *
 * Table FERMÉE, comme toute correspondance de ce produit : un axe absent du
 * dictionnaire ne compile pas. Le choix n'est jamais un texte engendré, c'est
 * un aiguillage entre modules déjà rédigés et sourcés.
 *
 * Le repli sur le module de décision reste, et il est délibéré : lui seul
 * s'adresse à toutes les situations. Il ne sert que si le module visé n'est pas
 * publié — la garde qui a attrapé `module-0-orientation` s'applique à CHAQUE
 * entrée de la table, pas seulement au repli.
 */

/** Module de repli : le seul qui convienne à n'importe quel profil. */
export const FALLBACK_MODULE_SLUG = "module-0-decision";

/**
 * Axe faible → module qui le travaille.
 *
 * Chaque correspondance suit ce que le module traite RÉELLEMENT, pas son
 * numéro : le risque académique renvoie au choix du LL.M., parce que c'est là
 * que se joue l'adéquation entre un dossier et les programmes visés — pas au
 * module de décision, qui pose la question en amont.
 */
export const MODULE_BY_AXIS: Record<Axis, string> = {
  ACADEMIC_STRENGTH: "module-2-choisir",
  FINANCIAL_FIT: "module-3-candidatures",
  PROFESSIONAL_REALISM: "module-1-career",
  TIMELINE_FEASIBILITY: "module-3-candidatures",
  IMMIGRATION_RISK: "module-4-immigration",
};

/**
 * Slug à joindre pour cet axe, ou `null` si RIEN n'est publiable.
 *
 * `null` plutôt qu'un lien vers une page vide : le CDC §25 interdit déjà de
 * présenter un module non sourcé, et l'éligibilité du J+12 s'appuie sur cette
 * absence pour ne pas partir.
 */
export function moduleForAxis(axis: Axis | null): string | null {
  const wanted = axis ? MODULE_BY_AXIS[axis] : FALLBACK_MODULE_SLUG;
  if (isModulePublished(wanted)) return wanted;
  return isModulePublished(FALLBACK_MODULE_SLUG) ? FALLBACK_MODULE_SLUG : null;
}
