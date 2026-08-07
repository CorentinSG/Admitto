/**
 * Copie de la page du rapport (CDC §17).
 *
 * L'attente est dite sans excuse ni relance : le rapport est relu à la main,
 * et annoncer un délai tenable vaut mieux qu'en promettre un court.
 */
export const rapport = {
  pendingTitle: "Votre rapport est en préparation",
  pendingBody: (delay: string) =>
    `Il est rédigé et relu à la main à partir de vos réponses, puis envoyé ${delay}. Vous recevrez un email dès qu'il sera disponible ; cette page l'affichera alors.`,
  /* Phase 1A : le transport journalise sans expédier. Annoncer un email que
     personne n'enverra ferait attendre devant une boîte vide, alors que la
     page où la personne se trouve DÉJÀ est celle qui affichera le rapport. */
  pendingBodyWithoutEmail: (delay: string) =>
    `Il est rédigé et relu à la main à partir de vos réponses, puis publié ${delay}. Aucun email n'est expédié pendant la bêta : conservez ce lien, c'est ici que votre rapport paraîtra.`,
  backToResult: "Revoir votre résultat préliminaire",
  printHint:
    "Utilisez l'impression de votre navigateur pour enregistrer ce rapport en PDF : la mise en page est prévue pour le format A4.",
  navLabel: "Votre rapport",
} as const;
