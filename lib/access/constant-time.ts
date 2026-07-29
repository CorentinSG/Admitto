/**
 * Comparaison de chaînes à temps constant.
 *
 * Écrite en JavaScript pur plutôt qu'avec `node:crypto` : ce module doit rester
 * utilisable depuis le runtime Edge. Un `===` sortirait au premier caractère
 * différent, ce qui laisse deviner un jeton caractère par caractère à la mesure
 * du temps de réponse. La longueur reste observable — elle ne suffit pas à
 * reconstituer un secret.
 */
export function timingSafeEqualString(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
