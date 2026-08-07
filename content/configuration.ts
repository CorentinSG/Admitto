/**
 * Copie de l'écran de configuration du back-office.
 *
 * Il répond à la seule question qui compte le jour de la mise en service :
 * qu'est-ce qui est ouvert, et que manque-t-il pour le reste ? Le ton est
 * celui du reste du produit — une capacité fermée est une fonction
 * indisponible, jamais une avarie.
 */
export const configuration = {
  title: "Configuration",
  backToQueue: "← File de rapports",
  intro:
    "Chaque capacité est fermée par défaut et s'ouvre en renseignant ses variables d'environnement. Cette page dit lesquelles sont ouvertes et ce qui manque aux autres. Elle ne lit jamais la valeur d'une variable, seulement sa présence : un écran qui affiche une clé la met dans la prochaine capture d'écran.",
  summary: (open: number, total: number) => `${open} capacité(s) ouverte(s) sur ${total}.`,
  stateOpen: "Ouverte",
  stateClosed: "Fermée",
  openMeans: "Ouverte : la fonction est disponible pour les utilisateurs.",
  /* « Il manque » plutôt que « erreur » : une capacité fermée n'est pas en
     panne, elle attend une décision qui n'a pas encore été prise. */
  missingPrefix: "Il manque :",
  requiresPrefix: "Repose sur :",
  legalTitle: "Mentions légales",
  legalComplete:
    "Toutes les mentions sont renseignées. Les pages légales n'affichent plus aucune valeur manquante.",
  legalMissing: (n: number) =>
    `${n} mention(s) restent à fournir. Elles s'affichent comme manquantes sur les pages légales plutôt que d'être inventées : une valeur plausible passerait inaperçue précisément parce qu'elle aurait l'air complète.`,
} as const;
