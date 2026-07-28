import type { Axis, Verdict } from "@/lib/engine-b/verdict";
import type { JourneyType } from "@/lib/profile/derive";

/**
 * Bibliothèque de blocs pré-rédigés du rapport (CDC §17).
 *
 * Aucun texte du rapport n'est produit librement : il est assemblé à partir de
 * ces blocs. Les seules variables autorisées sont listées dans
 * `lib/report/fill.ts` — prénom, université, dates, coûts, partenariats, phase
 * et parcours type. Toute autre variable fait échouer l'assemblage.
 */

export const AXIS_LABELS: Record<Axis, string> = {
  ACADEMIC_STRENGTH: "Solidité académique",
  FINANCIAL_FIT: "Adéquation financière",
  PROFESSIONAL_REALISM: "Réalisme professionnel",
  TIMELINE_FEASIBILITY: "Faisabilité du calendrier",
  IMMIGRATION_RISK: "Risque migratoire",
};

/** Commentaire d'axe par niveau (1 à 4). */
export const AXIS_COMMENTS: Record<Axis, Record<1 | 2 | 3 | 4, string>> = {
  ACADEMIC_STRENGTH: {
    1: "Le cursus juridique est encore à un stade initial. C'est la période où les décisions coûtent le moins cher, mais un dossier de candidature n'est pas encore constituable.",
    2: "Le niveau atteint permet d'engager la réflexion. Les dossiers les plus sélectifs supposent en général un cursus plus avancé.",
    3: "Le niveau atteint correspond au profil habituel des candidats formés en France.",
    4: "Le parcours académique est complet et constitue un point d'appui solide du dossier.",
  },
  FINANCIAL_FIT: {
    1: "L'écart entre le budget annoncé et l'ordre de grandeur du projet est important. La recherche de financement devient le préalable de toutes les autres décisions.",
    2: "Le budget couvre une partie du projet. Bourses, partenariats et arbitrage sur la catégorie d'école déterminent la faisabilité réelle.",
    3: "Le budget est cohérent avec la fourchette basse du projet, sous réserve du coût net après bourses.",
    4: "Le budget couvre le projet avec une marge, y compris ses postes secondaires.",
  },
  PROFESSIONAL_REALISM: {
    1: "L'objectif professionnel et le profil actuel sont encore éloignés. Un travail de clarification précède utilement toute candidature.",
    2: "L'objectif est atteignable mais suppose des étapes intermédiaires qui doivent être identifiées dès maintenant.",
    3: "L'objectif est cohérent avec le profil et le marché correspondant.",
    4: "L'objectif est directement aligné sur le profil, le statut professionnel et la préférence géographique.",
  },
  TIMELINE_FEASIBILITY: {
    1: "Le calendrier est très contraint. Viser la rentrée suivante permet de déposer un dossier complet plutôt qu'un dossier précipité.",
    2: "Le calendrier est tenable mais laisse peu de marge : les échéances de test d'anglais et de dépôt se chevauchent.",
    3: "Le calendrier laisse le temps de préparer les dossiers dans de bonnes conditions.",
    4: "Le calendrier est confortable et permet d'optimiser la recherche de financement.",
  },
  IMMIGRATION_RISK: {
    1: "La dimension migratoire est le point le plus sensible du projet et doit être traitée en priorité avec un professionnel compétent.",
    2: "La dimension migratoire suppose des démarches dont l'issue ne dépend pas de vous. Elle doit être anticipée sans être considérée comme acquise.",
    3: "La dimension migratoire est gérable dans le cadre général applicable aux étudiants étrangers.",
    4: "La dimension migratoire ne constitue pas une contrainte particulière pour ce projet.",
  },
};

export const VERDICT_BLOCKS: Record<Verdict, { title: string; body: string }> = {
  HIGHLY_RELEVANT: {
    title: "Projet fortement pertinent",
    body: "Les cinq axes examinés sont cohérents entre eux et aucun facteur bloquant n'a été identifié à partir de vos réponses. L'enjeu porte désormais sur l'exécution : ordre des démarches, respect des échéances et qualité du dossier.",
  },
  VIABLE_WITH_MAJOR_PLANNING: {
    title: "Projet viable avec une planification importante",
    body: "Le projet tient, à condition d'organiser sérieusement les étapes. Un ou plusieurs axes appellent des décisions structurantes avant l'engagement de dépenses significatives.",
  },
  POSSIBLE_BUT_RISKY: {
    title: "Projet possible mais risqué",
    body: "Le projet reste ouvert, mais plusieurs axes présentent des fragilités simultanées. Les actions listées ci-dessous visent à réduire ces risques avant de vous engager davantage.",
  },
  PREMATURE: {
    title: "Projet prématuré à ce stade",
    body: "Les éléments réunis aujourd'hui ne permettent pas d'engager utilement le projet. Ce constat porte sur le moment, pas sur le projet lui-même : les étapes préparatoires ci-dessous le rendront évaluable.",
  },
  NOT_CURRENTLY_RECOMMENDED: {
    title: "Projet actuellement non recommandé",
    body: "En l'état des informations transmises, engager ce projet exposerait à des risques financiers et professionnels disproportionnés. Les alternatives et les conditions d'un réexamen sont détaillées ci-dessous.",
  },
  NEEDS_CLARIFICATION: {
    title: "Projet à clarifier avant évaluation",
    body: "L'objectif professionnel n'est pas encore arrêté. Tant qu'il ne l'est pas, toute évaluation de viabilité reposerait sur une hypothèse arbitraire. La clarification est donc la première étape.",
  },
};

/** Risques et actions correctrices, déclenchés par les axes faibles (score ≤ 2). */
export const RISK_BLOCKS: Record<Axis, { title: string; body: string; actions: string[] }> = {
  ACADEMIC_STRENGTH: {
    title: "Dossier académique encore incomplet",
    body: "Le niveau atteint limite aujourd'hui les écoles réellement accessibles et la crédibilité du dossier.",
    actions: [
      "Achever le cycle en cours avant de déposer les candidatures",
      "Identifier deux enseignements ou expériences qui donneront une cohérence au dossier",
      "Demander dès maintenant les relevés et attestations qui seront exigés",
    ],
  },
  FINANCIAL_FIT: {
    title: "Financement non sécurisé",
    body: "L'écart entre le budget disponible et le coût du projet n'est pas couvert par une piste de financement identifiée.",
    actions: [
      "Établir le coût net cible, bourses et partenariats déduits, avant de choisir les écoles",
      "Recenser les bourses accessibles et leurs dates limites propres",
      "Vérifier si votre université dispose d'un accord réduisant les frais de scolarité",
    ],
  },
  PROFESSIONAL_REALISM: {
    title: "Écart entre l'objectif et le profil actuel",
    body: "L'objectif visé suppose des étapes intermédiaires qui ne sont pas encore engagées.",
    actions: [
      "Identifier trois profils ayant atteint cet objectif depuis une formation comparable",
      "Déterminer l'étape intermédiaire manquante et la placer dans le calendrier",
      "Préparer une seconde option professionnelle crédible",
    ],
  },
  TIMELINE_FEASIBILITY: {
    title: "Calendrier tendu",
    body: "Les échéances de préparation et de dépôt se chevauchent, ce qui expose à un dossier déposé dans l'urgence.",
    actions: [
      "Fixer une date ferme pour le test d'anglais, avec une session de rattrapage possible",
      "Reporter d'un an la rentrée visée si deux échéances majeures tombent le même mois",
      "Déposer les dossiers des écoles les plus sélectives en premier",
    ],
  },
  IMMIGRATION_RISK: {
    title: "Dimension migratoire non maîtrisée",
    body: "L'obtention d'un statut ne dépend pas de vous et conditionne pourtant l'ensemble du projet.",
    actions: [
      "Distinguer ce qui relève de l'université de ce qui relève des autorités migratoires",
      "Anticiper les délais de rendez-vous, qui varient fortement selon les périodes",
      "Faire confirmer votre situation par un professionnel compétent avant tout engagement financier",
    ],
  },
};

/** Prochaines étapes par parcours type (CDC §20). */
export const NEXT_STEPS: Record<JourneyType, string[]> = {
  PRE_LLM_EXPLORER: [
    "Arrêter un objectif professionnel, même provisoire",
    "Établir une première fourchette de budget et la confronter à vos ressources",
    "Repérer les accords existants entre votre université et des law schools américaines",
    "Programmer le test d'anglais",
  ],
  LLM_APPLICANT: [
    "Finaliser une liste d'écoles cohérente avec le coût net visé",
    "Préparer CV, personal statement et recommandations",
    "Rassembler relevés de notes et traductions",
    "Déposer les demandes de bourses en même temps que les candidatures",
  ],
  CURRENT_LLM_STUDENT: [
    "Vérifier auprès de l'autorité compétente les pièces attendues pour l'évaluation",
    "Engager networking et recherche de stage dès le premier semestre",
    "Choisir un prestataire de préparation au barreau et arrêter un planning",
    "Anticiper les conséquences de votre statut sur la période post-diplôme",
  ],
  BAR_CANDIDATE: [
    "Confirmer le calendrier officiel d'inscription à l'examen",
    "Bâtir un planning de révision réaliste sur la durée disponible",
    "Préparer les pièces du dossier d'admission en parallèle des révisions",
    "Identifier les échéances de la procédure de moralité et de ses références",
  ],
  FOREIGN_QUALIFIED_LAWYER: [
    "Faire examiner votre admission actuelle au regard des voies applicables",
    "Arbitrer entre LL.M. et autres options au vu de votre objectif professionnel",
    "Évaluer l'impact du projet sur votre activité actuelle",
    "Déterminer la valeur d'une admission américaine pour votre marché cible",
  ],
};

export const REPORT_STATIC = {
  summaryLead:
    "Ce rapport reprend les informations que vous avez communiquées et les met en regard des étapes généralement applicables à des profils comparables. Il vise à vous permettre de décider en connaissance de cause, pas à se substituer aux autorités compétentes.",
  partnershipsNone:
    "Aucun partenariat vérifié n'est enregistré à ce jour pour {university}. La base est enrichie et vérifiée au fil des diagnostics ; ce point sera repris si un accord est confirmé.",
  partnershipsFound:
    "{partnershipCount} partenariat(s) vérifié(s) concernent {university}. Leurs conditions et leurs dates limites propres sont détaillées ci-dessous.",
  costsLead:
    "Ordre de grandeur pour une année de LL.M., de {totalCostLow} à {totalCostHigh}, à confirmer école par école. Aucun retour sur investissement n'est annoncé.",
  timelineLead:
    "Repères de planification calculés depuis la rentrée que vous visez. Chaque université, autorité et prestataire publie son propre calendrier, qui prime sur ces repères.",
  sourcesLead:
    "Chaque élément réglementaire retenu porte sa source et sa date de vérification. Une règle non vérifiée n'est pas appliquée : la situation est alors soumise à une revue humaine.",
  signature: [
    "Prepared by Corentin Saint-Girons",
    "Founder",
    "French-trained legal professional who completed the U.S. LL.M. and New York Bar journey.",
  ],
  disclaimer:
    "This report is an educational and strategic product based on the information provided, publicly available sources, documented pathways, and the founder's first-hand experience. It is not legal advice, does not create an attorney-client relationship, and does not constitute a determination by any university, bar authority, immigration authority, or employer.",
};

export const OFFER_BLOCKS = {
  DIAGNOSTIC: {
    name: "Diagnostic",
    body: "À ce stade, le rapport que vous avez entre les mains couvre l'essentiel. Revenez vers la plateforme lorsque votre objectif sera arrêté.",
  },
  PLATFORM: {
    name: "Roadmap & Platform",
    body: "Votre projet est engagé : la feuille de route personnalisée, le tableau de bord et le simulateur de coût sont l'outillage adapté à cette phase.",
  },
  GUIDED: {
    name: "Guided",
    body: "Votre calendrier et vos arbitrages appellent un accompagnement humain défini, en plus de la plateforme.",
  },
} as const;
