"use client";

/**
 * Système d'animation Admitto — contrat strict, reproduit à l'identique du
 * document « Prompt de reconstruction — système d'animation du site Admitto ».
 *
 * Règles non négociables :
 * - Une seule primitive de révélation : useInView (ref callback, one-shot,
 *   threshold seul, deps []).
 * - Aucune librairie d'animation. Easing `ease` uniquement.
 * - Entrées limitées à opacity + translateY/translateX.
 * - Aucune animation de sortie : une fois révélé, jamais re-caché.
 * - Hovers en onMouseEnter/onMouseLeave mutant e.currentTarget.style,
 *   jamais en :hover CSS.
 */

import { useCallback, useState } from "react";

export function useInView(threshold = 0.12): [(node: Element | null) => void, boolean] {
  const [inView, setInView] = useState(false);
  const ref = useCallback((node: Element | null) => {
    if (!node) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect(); // one-shot : jamais de re-trigger
        }
      },
      { threshold }
    );
    io.observe(node);
    return () => io.disconnect(); // cleanup ref callback (React 19)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return [ref, inView];
}

/** Thresholds officiels par section (ne pas modifier sans mettre à jour la checklist). */
export const thresholds = {
  hero: 0.05,
  problems: 0.08,
  solution: 0.08,
  steps: 0.05,
  cta: 0.08,
} as const;

/**
 * Règles CSS globales + les 4 keyframes officielles.
 * fadeIn / fadeInUp sont déclarées mais NON utilisées (quirk du site à conserver).
 * À injecter une seule fois dans le layout via <style>{globalCss}</style>.
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

/** Helper de révélation standard : opacity 0/1 + translateY. */
export function reveal(flag: boolean, distancePx = 30) {
  return {
    opacity: +!!flag,
    transform: flag ? "translateY(0)" : `translateY(${distancePx}px)`,
  };
}

/** Variante horizontale (colonne droite Solution : +40px ; lignes Parcours : -24px). */
export function revealX(flag: boolean, distancePx: number) {
  return {
    opacity: +!!flag,
    transform: flag ? "translateX(0)" : `translateX(${distancePx}px)`,
  };
}
