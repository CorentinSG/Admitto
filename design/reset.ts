/**
 * Reset minimal — équivalent du preflight utilisé par le site Admitto
 * (Tailwind v4 n'y sert qu'à ça : le markup n'a pas de classes utilitaires).
 *
 * Indispensable : sans `box-sizing: border-box`, le `min-height: 100vh` du hero
 * s'ajoute à ses 240 px de padding et la section dépasse d'un tiers d'écran.
 */
export const resetCss = `
*, ::before, ::after { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body { margin: 0; -webkit-font-smoothing: antialiased; }
h1, h2, h3, h4, p, figure, blockquote, dl, dd { margin: 0; }
ul, ol { margin: 0; padding: 0; list-style: none; }
button { font-family: inherit; font-size: 100%; line-height: inherit; color: inherit; }
img, svg { display: block; max-width: 100%; }
`;
