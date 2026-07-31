/**
 * Ancres de sections, vues depuis n'importe quelle page (lot E).
 *
 * La nav et le pied de page portent des ancres — `#problematique`,
 * `#solution` — qui désignent des sections de la page d'ACCUEIL. Servies
 * telles quelles depuis une autre page, elles ne mènent nulle part : le
 * défaut existait déjà sur les pages légales, où « Le défi » ne faisait rien,
 * et les pages autonomes de ce lot l'auraient étendu à trois pages de plus.
 *
 * Le préfixe n'est ajouté QUE hors de l'accueil. Sur l'accueil, `/#solution`
 * provoquerait un chargement complet du document là où `#solution` fait
 * défiler — la nav du site deviendrait plus lente à l'endroit où elle sert le
 * plus.
 */
export function sectionHref(pathname: string, href: string): string {
  if (!href.startsWith("#")) return href;
  return pathname === "/" ? href : `/${href}`;
}
