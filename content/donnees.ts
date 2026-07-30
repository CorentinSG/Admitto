/**
 * Copie de la page « Vos données » (revue §A1.2).
 *
 * Le ton diffère du reste de l'espace : nulle part ailleurs on ne propose à
 * quelqu'un d'effacer son propre travail. La page ne cherche donc pas à
 * retenir. Elle dit ce qui est détenu, ce que chaque action produit, et pour
 * la suppression, ce qui ne reviendra pas.
 */
export const donnees = {
  title: "Vos données",
  intro:
    "Ce que le service détient à votre sujet, et ce que vous pouvez en faire sans passer par une demande écrite.",

  held: {
    title: "Ce qui est enregistré",
    intro: "Cette liste correspond aux tables de la base, pas à un résumé.",
  },

  export: {
    title: "Obtenir une copie",
    body: "L'export contient votre compte et l'intégralité de vos diagnostics — réponses, résultat, rapport et corrections, avancement, scénarios, métadonnées de documents, rappels envoyés, jalons et réservations — au format JSON.",
    action: "Télécharger mes données",
    unavailable: "L'export est indisponible tant que la base n'est pas configurée.",
  },

  erase: {
    title: "Supprimer votre compte",
    body: "La suppression efface le compte, tous les diagnostics qui y sont rattachés et tout ce qui en dépend. Elle est immédiate et définitive : ni le rapport, ni la feuille de route, ni l'avancement ne peuvent être rétablis.",
    hint: "Téléchargez votre copie avant de supprimer : après, il n'y aura plus rien à exporter.",
    confirmLabel: "Pour confirmer, saisissez SUPPRIMER",
    confirmWord: "SUPPRIMER",
    action: "Supprimer définitivement",
    pending: "Suppression en cours…",
    mismatch: "Le mot de confirmation ne correspond pas. Rien n'a été supprimé.",
    unavailable: "La suppression est indisponible tant que la base n'est pas configurée.",
    accessError: "Session expirée. Reconnectez-vous avant de recommencer.",
  },

  other: {
    title: "Les autres droits",
    body: "La rectification passe par une nouvelle soumission du questionnaire. L'opposition, la limitation et le retrait du consentement aux emails d'information s'exercent par écrit à contact@admitto.app. La politique de confidentialité détaille chaque base légale et chaque durée de conservation.",
    link: "Lire la politique de confidentialité",
    href: "/confidentialite",
  },
} as const;

/**
 * Ce qui est détenu, dit en clair.
 *
 * Volontairement écrit à la main plutôt que dérivé du schéma : un libellé
 * généré à partir des noms de tables (« TaskStatus », « SentNotice ») ne
 * renseignerait personne. La contrepartie est que cette liste doit suivre le
 * schéma, ce que `check:legal` vérifie en comptant les modèles couverts.
 */
export const HELD_DATA = [
  "Votre prénom et votre adresse email.",
  "Vos réponses au questionnaire et le profil qui en est déduit.",
  "Votre voie préliminaire, les blocs de votre rapport, les partenariats retenus, les coûts estimés et les échéances.",
  "Votre rapport et les corrections qui y ont été apportées avant envoi.",
  "L'état de vos tâches, vos scénarios de simulation et les jalons atteints.",
  "Votre liste d'écoles : programmes visés, classement, avancement, dates limites et notes.",
  "Les métadonnées des documents déposés : type, nom, taille et date. Le contenu des fichiers reste dans le coffre.",
  "Les rappels d'échéance déjà envoyés, pour ne pas vous les renvoyer.",
  "Vos séances réservées et le solde de séances de votre offre.",
  "Vos sessions de connexion en cours.",
] as const;
