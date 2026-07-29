/**
 * Adresses de test uniques par exécution (revue §B2).
 *
 * Réutiliser la même adresse d'une exécution à l'autre heurte un plafond que le
 * produit a raison d'imposer : trois diagnostics par heure et par adresse. La
 * quatrième exécution était donc refusée — comportement correct du produit,
 * artefact de la vérification. Chaque processus prend son propre suffixe.
 *
 * Le suffixe est fixé par processus, et non par appel : une suite doit retrouver
 * *son* diagnostic quand elle se connecte.
 */
const TAG = process.env.ADMITTO_VERIFY_TAG ?? String(Date.now());

/** `alix` → `alix+1785350000000@example.com` */
export function verifyEmail(prefix) {
  return `${prefix}+${TAG}@example.com`;
}
