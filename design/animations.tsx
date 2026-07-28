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
 * Les règles CSS globales et les keyframes vivent dans `design/global-css.ts`
 * (module serveur) : une constante exportée d'ici, module client, arriverait au
 * layout sous forme de référence client et les keyframes ne seraient jamais
 * injectées.
 */

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
