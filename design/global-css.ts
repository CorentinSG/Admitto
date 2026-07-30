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
