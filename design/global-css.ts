/**
 * Règles CSS globales + les 4 keyframes officielles du site Admitto.
 *
 * Ce module n'est délibérément PAS marqué "use client" : il est consommé par
 * le layout (server component). Une constante exportée depuis un module client
 * lui parviendrait sous forme de référence client et non de chaîne — les
 * keyframes ne seraient alors jamais injectées.
 *
 * fadeIn / fadeInUp sont déclarées mais NON utilisées : quirk du site conservé.
 */
import { colors, fonts } from "./tokens";

export const globalCss = `
html { scroll-behavior: smooth; }
body { transition: opacity 0.2s ease-in; }
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
@keyframes shimmer {
  0%   { background-position: 0%   center; }
  50%  { background-position: 100% center; }
  100% { background-position: 0%   center; }
}
@keyframes pulse-gold {
  0%, 100% { box-shadow: 0 0 0 0   rgba(201, 168, 76, 0.5); }
  50%      { box-shadow: 0 0 0 8px rgba(201, 168, 76, 0);   }
}
@keyframes fadeInUp { 0% { opacity: 0; transform: translateY(30px); } 100% { opacity: 1; transform: translateY(0); } }
@keyframes fadeIn   { 0% { opacity: 0; } 100% { opacity: 1; } }

/*
 * Lien d'évitement (WCAG 2.4.1).
 *
 * Il vit ici et non en style inline parce qu'il dépend de « :focus » : c'est la
 * seule exception à la règle « pas de pseudo-classe » du contrat de design, et
 * elle est structurelle — un lien qui n'apparaît qu'au clavier ne peut pas se
 * décrire autrement.
 *
 * Décalé par « transform » et non par « display: none » ou « left: -9999px » :
 * masqué par l'un il ne serait plus focusable du tout, et emporté au loin par
 * l'autre certains navigateurs font défiler la page jusqu'à lui. Il reste donc
 * en place, simplement hors du cadre visible, et redescend au focus.
 *
 * z-index au-dessus de la navigation (100), sans quoi il apparaîtrait derrière
 * elle sur les pages marketing — visible pour le lecteur d'écran, invisible à
 * l'œil, ce qui est le pire des deux mondes.
 */
.skip-link {
  position: fixed;
  top: 0;
  left: 50%;
  z-index: 200;
  transform: translate(-50%, -140%);
  transition: transform 0.2s ease;
  padding: 14px 28px;
  font-family: ${fonts.sans};
  font-size: 0.82rem;
  letter-spacing: 0.06em;
  text-decoration: none;
  background-color: ${colors.navy900};
  color: ${colors.ivory};
  border: 1px solid ${colors.gold};
  border-top: none;
}
.skip-link:focus { transform: translate(-50%, 0); }

/*
 * La cible du lien reçoit le focus par « tabIndex={-1} » : sans cela, le
 * navigateur déplace le défilement mais laisse le focus sur le lien, si bien
 * que la tabulation suivante repart dans la navigation — exactement ce que le
 * lien d'évitement est censé épargner. L'anneau de focus est retiré sur ce
 * conteneur seulement : il cerclerait toute la page sans rien désigner.
 */
main:focus { outline: none; }

/*
 * Navigation sous 900 px.
 *
 * Ces règles vivaient dans la page d'accueil, si bien que toute autre page
 * portant la nav perdait ses liens sans rien mettre à la place : sur mobile, la
 * navigation disparaissait purement et simplement. Les remonter ici les rend
 * valables partout où la nav est rendue.
 *
 * Le bouton d'ouverture n'existe QUE sous 900 px : au-dessus, les liens sont
 * visibles et un second chemin vers les mêmes ancres n'apporterait rien.
 */
.nav-burger { display: none; }
.nav-panel  { display: none; }
@media (max-width: 900px) {
  .nav-links  { display: none !important; }
  .nav-burger { display: inline-flex !important; }
  .nav-panel[data-open="true"] { display: block !important; }
  /* Marque, bouton d'ouverture et appel à l'action se touchaient à 390 px. */
  .nav-brand   { font-size: 1.1rem !important; letter-spacing: 0.12em !important; }
  .nav-actions { gap: 12px !important; }
  .nav-cta     { padding: 11px 16px !important; font-size: 0.68rem !important; }
}
`;
