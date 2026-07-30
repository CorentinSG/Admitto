/**
 * Bornes des champs libres du questionnaire (CDC §12.2 et §29).
 *
 * Le questionnaire n'expose que trois champs de texte : prénom, adresse email
 * et commentaire. Le commentaire était plafonné ; les deux autres ne l'étaient
 * par rien.
 *
 * Ce n'est pas qu'une question de place en base. Le prénom est repris dans le
 * sujet et le corps de chaque email, dans le titre du rapport et dans le
 * tableau de bord : un prénom de cent mille caractères, envoyé depuis un
 * formulaire public et anonyme, produit un email illisible et un document
 * inutilisable. L'adresse sert en outre de clé au compteur de tentatives et de
 * colonne unique du compte — une valeur démesurée y pèse à chaque requête.
 *
 * Les valeurs sont TRONQUÉES et non refusées : quelqu'un dont le prénom est
 * long ne doit pas être bloqué par une limite qu'il ne peut pas deviner. Seule
 * l'adresse est refusée si elle dépasse, parce qu'une adresse tronquée ne
 * serait plus la sienne et l'email partirait dans le vide.
 */

/** Prénoms les plus longs connus : très en deçà. Tronqué au-delà. */
export const MAX_FIRST_NAME = 80;

/**
 * Limite d'une adresse email selon la RFC 5321 : 64 caractères de partie
 * locale, 255 de domaine. Au-delà, aucun serveur n'accepterait la remise.
 */
export const MAX_EMAIL = 254;

/** Champ libre unique du questionnaire, déjà plafonné (CDC §12.2). */
export const MAX_COMMENT = 800;

/** Tronque proprement : espaces retirés, chaîne vide traitée comme absente. */
export function boundedText(value: unknown, max: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, max);
}

/**
 * Adresse email : refusée si hors bornes plutôt que tronquée.
 *
 * Le contrôle de longueur précède celui de la forme : une chaîne d'un
 * mégaoctet passerait l'expression régulière avant d'être jugée trop longue,
 * et c'est justement le travail qu'on ne veut pas faire sur une entrée
 * publique.
 */
const EMAIL_SHAPE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function validEmail(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > MAX_EMAIL) return undefined;
  return EMAIL_SHAPE.test(trimmed) ? trimmed : undefined;
}
