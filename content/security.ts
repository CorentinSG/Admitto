/** Copie des refus de sécurité (revue §A2). */

export const security = {
  /**
   * Message unique, quelle que soit la limite atteinte.
   *
   * Distinguer « trop de tentatives depuis votre connexion » de « trop de
   * tentatives pour cette adresse » renseignerait sur le trafic des autres.
   */
  tooManyAttempts: (minutes: number) =>
    `Trop de tentatives. Réessayez dans ${minutes} minutes.`,
  resultRestricted:
    "Ce résultat est rattaché à un compte. Connectez-vous avec l'adresse de votre diagnostic pour le consulter.",
};
