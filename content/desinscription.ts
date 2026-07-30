/**
 * Copie de la page de désinscription (CDC §34).
 *
 * Deux choses à dire, et pas une de plus : ce qui va s'arrêter, et ce qui
 * continue. Une page de désinscription qui tente de retenir transforme un
 * retrait de consentement en négociation.
 */
export const desinscription = {
  title: "Ne plus recevoir nos contenus",
  intro:
    "Vous pouvez retirer votre consentement aux emails d'information. Le retrait prend effet immédiatement, sans justification à donner.",
  already: "C'est déjà fait : vous ne recevez plus nos emails d'information.",
  keeps:
    "Les messages nécessaires au service continuent : votre lien de connexion, l'envoi de votre rapport et les rappels des échéances inscrites à votre feuille de route. Les couper reviendrait à vous priver de ce que vous avez demandé.",
  action: "Confirmer ma désinscription",
  pending: "Enregistrement…",
  done: "C'est fait. Vous ne recevrez plus nos emails d'information.",
  error: "L'enregistrement n'a pas abouti. Réessayez, ou écrivez à contact@admitto.app.",
  home: "Retour à l'accueil",
} as const;
