/**
 * Vocabulaire interdit, côté exécution (CDC §5–7, §14.4).
 *
 * `scripts/check-vocabulary.mjs` protège le texte COMMITTÉ : il balaie le
 * dépôt. Dès que des blocs deviennent éditables depuis le back-office, il
 * existe un texte visible par l'utilisateur que ce script ne voit jamais.
 * Ce module est le même verrou, appliqué au moment de la sauvegarde — un
 * bloc qui promet un résultat est refusé AVANT d'exister.
 *
 * Les motifs sont volontairement identiques à ceux du script ; le test
 * `vocabulary.test.ts` lit le script et vérifie que chaque motif d'ici y
 * figure, pour que les deux listes ne divergent pas en silence.
 */

export interface ForbiddenPattern {
  pattern: RegExp;
  why: string;
}

export const FORBIDDEN_PATTERNS: ForbiddenPattern[] = [
  {
    pattern: /attorney[- ]reviewed/i,
    why: "CDC §6 : ne jamais dire que les rapports sont revus par un avocat.",
  },
  { pattern: /\bEsq\.?\b/, why: "CDC §7 : jamais de signature « Esq. »." },
  { pattern: /attorney at law/i, why: "CDC §7 : jamais de signature « Attorney at Law »." },
  {
    pattern: /admission garantie|résultat garanti|resultat garanti|succès garanti|succes garanti/i,
    why: "CDC §5 : aucun vocabulaire suggérant qu'un résultat est garanti.",
  },
  {
    pattern: /guaranteed (admission|result|job|visa|success)/i,
    why: "CDC §5 : aucun vocabulaire suggérant qu'un résultat est garanti.",
  },
  {
    pattern: /vous êtes éligible|vous etes eligible|you are eligible/i,
    why: "CDC §14.1 : le moteur ne détermine jamais une éligibilité définitive.",
  },
  {
    pattern: /probabilité de réussite|probabilite de reussite|probability of success/i,
    why: "CDC §14.4 : aucun verdict présenté comme une probabilité de réussite.",
  },
  {
    pattern: /consultations? illimitée?s?|unlimited consultations?/i,
    why: "CDC §30 : aucune offre ne promet des consultations illimitées.",
  },
];

/** Première violation trouvée, ou `null`. Le POURQUOI est rendu : c'est lui
 *  qui s'affiche à la personne dont le texte vient d'être refusé. */
export function vocabularyViolation(text: string): ForbiddenPattern | null {
  return FORBIDDEN_PATTERNS.find(({ pattern }) => pattern.test(text)) ?? null;
}
