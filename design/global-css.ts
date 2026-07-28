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
`;
