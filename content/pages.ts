/**
 * Pages marketing autonomes (lot E).
 *
 * `/offres`, `/faq` et `/a-propos` servent EXACTEMENT les sections de la page
 * d'accueil : la copie reste dans `content/homepage.ts`, source unique. Ce
 * fichier ne porte que ce qu'une page a en propre et qu'une section n'a pas —
 * son titre d'onglet, sa description de résultat de recherche, son chemin.
 *
 * Pourquoi ces trois-là et pas d'autres : ce sont les seules sections qu'on
 * cherche par elles-mêmes. Personne ne cherche « le défi » ; on cherche des
 * tarifs, une réponse à une question, ou qui est derrière le service.
 *
 * Les descriptions énoncent ce que la page contient, sans rien promettre :
 * le vocabulaire interdit du CDC §5–7 s'applique ici comme partout ailleurs,
 * et `check:vocabulary` lit ce fichier.
 */

export interface MarketingPage {
  /** Chemin servi, sans barre finale. Sert aussi de clé de sitemap. */
  path: string;
  /** Titre d'onglet et de résultat de recherche. */
  title: string;
  /** Description de résultat de recherche (150–160 caractères visés). */
  description: string;
  /**
   * Ancre correspondante sur la page d'accueil.
   *
   * La même section vit aux deux endroits : la page autonome se déclare
   * canonique pour son sujet, l'accueil garde son ancre pour la lecture
   * continue. Sans ce lien explicite, deux URL présenteraient le même texte
   * sans que rien ne dise laquelle fait référence.
   */
  homeAnchor: string;
}

export const MARKETING_PAGES = [
  {
    path: "/offres",
    title: "Offres et tarifs — Admitto",
    description:
      "Le détail des formules Admitto : diagnostic préliminaire, accompagnement de candidature et suivi jusqu'au barreau de New York, avec ce que chacune comprend.",
    homeAnchor: "#offres",
  },
  {
    path: "/faq",
    title: "Questions fréquentes — Admitto",
    description:
      "Ce que fait Admitto et ce qu'il ne fait pas, la place de la relecture humaine, la protection des données et le fonctionnement du diagnostic préliminaire.",
    homeAnchor: "#faq",
  },
  {
    path: "/a-propos",
    title: "À propos — Admitto",
    description:
      "Qui édite Admitto, d'où vient la méthode et pourquoi elle s'adresse aux juristes formés en France qui envisagent un LL.M. américain.",
    homeAnchor: "#fondateur",
  },
] as const satisfies readonly MarketingPage[];

/** Pages publiques indexables : l'accueil, les trois ci-dessus, les documents légaux. */
export const INDEXABLE_PATHS = [
  "/",
  ...MARKETING_PAGES.map((page) => page.path),
  "/mentions-legales",
  "/confidentialite",
  "/conditions-generales",
] as const;
