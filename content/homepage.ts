/**
 * Copie de la page d'accueil — source unique éditable (CDC §11).
 * Contrainte : aucun vocabulaire de garantie de résultat, aucune promesse
 * d'emploi/visa/admission, aucune présentation du service comme juridique
 * (vérifié par `npm run check:vocabulary`).
 */

export const nav = {
  brand: "ADMITTO",
  links: [
    { label: "Le défi", href: "#problematique" },
    { label: "La solution", href: "#solution" },
    { label: "Le parcours", href: "#parcours" },
    { label: "Offres", href: "#offres" },
  ],
  cta: "Commencer",
};

export const hero = {
  badge: "✦ POUR JURISTES FRANCOPHONES",
  titleBefore: "Construisez votre parcours juridique ",
  titleAccent: "aux États-Unis",
  titleAfter: " avec méthode.",
  subtitle:
    "LL.M. américain, barreau de New York, carrière internationale : une feuille de route personnalisée qui vous dit où vous en êtes, ce que coûte le projet, dans quel ordre avancer et quelle action accomplir maintenant.",
  founderName: "Corentin Saint-Girons",
  founderRole: "Fondateur",
  founderLine:
    "Juriste formé en France, il a lui-même accompli le parcours LL.M. et New York Bar.",
  ctaPrimary: "Commencer le diagnostic gratuit",
  ctaSecondary: "Voir le parcours couvert",
  scrollLabel: "DÉFILER",
};

export const problem = {
  label: "LE DÉFI",
  title: "L'information existe. Elle est simplement éparpillée, contradictoire et rarement adaptée à votre situation.",
  intro:
    "Personne ne vous donne une vue d'ensemble. Vous reconstituez votre projet source par source, sans savoir laquelle fait autorité ni laquelle s'applique à votre profil.",
  cards: [
    {
      num: "01",
      title: "Des sources officielles dispersées",
      desc: "Universités, LSAC, New York Board of Law Examiners, sites des bar exams : chacun publie sa règle, aucun ne raconte votre parcours de bout en bout.",
    },
    {
      num: "02",
      title: "Des avis contradictoires",
      desc: "Forums, anciens étudiants, consultants, prestataires de bar preparation : des expériences réelles, mais issues de profils différents du vôtre.",
    },
    {
      num: "03",
      title: "Un budget impossible à cadrer",
      desc: "Tuition, coût de la vie, LSAC, traductions, visa, bar preparation, période sans revenu : le coût réel n'apparaît qu'une fois les décisions prises.",
    },
    {
      num: "04",
      title: "Un calendrier qui se referme",
      desc: "Candidatures, TOEFL, bourses, dossier d'évaluation, inscription à l'examen : chaque échéance manquée décale le projet d'une année entière.",
    },
  ],
};

export const solution = {
  label: "LA SOLUTION",
  title: "Un système de décision, de planification et d'exécution. Pas une bibliothèque de vidéos.",
  body: "Un questionnaire de quatre minutes construit votre profil. À partir de là, tout est personnalisé : la voie préliminaire identifiée, les échéances calculées, les scénarios de coût, la feuille de route et la prochaine action à accomplir.",
  cta: "Commencer le diagnostic",
  items: [
    "Évaluer la pertinence de votre projet",
    "Identifier une voie préliminaire",
    "Construire un budget réaliste",
    "Sélectionner les LL.M. adaptés à votre profil",
    "Suivre une timeline datée",
    "Comprendre chaque démarche et son autorité",
    "Préparer le bar exam avec un planning",
    "Structurer votre stratégie professionnelle",
  ],
};

export const diagnostic = {
  label: "LE DIAGNOSTIC",
  title: "Deux temps, une seule analyse.",
  steps: [
    {
      tag: "IMMÉDIAT · GRATUIT",
      title: "Votre résultat préliminaire",
      desc: "À la fin du questionnaire : la voie préliminaire identifiée, les partenariats détectés entre votre université et des law schools américaines, les principales échéances, les éléments migratoires généraux, une première fourchette de coût et les limites explicites de l'analyse.",
    },
    {
      tag: "SOUS 48 HEURES",
      title: "Votre rapport personnalisé",
      desc: "Un document éducatif et stratégique de trois à quatre pages : synthèse, cinq axes de viabilité, risques principaux et actions pour les réduire, timeline, scénarios de coût, parcours type, sources et dates de vérification. Chaque rapport est relu par le fondateur avant envoi.",
    },
  ],
  note: "Seules les autorités compétentes — universités, New York Board of Law Examiners, autorités migratoires — prennent les décisions officielles. Le diagnostic vous aide à les préparer, il ne s'y substitue pas.",
};

export const journey = {
  label: "LE PARCOURS COUVERT",
  title: "De la première question jusqu'à la prestation de serment.",
  steps: [
    {
      phase: "PHASE 1",
      title: "Clarification et stratégie professionnelle",
      desc: "Déterminer si le projet est pertinent pour vous, définir un objectif professionnel et arbitrer entre les voies possibles.",
    },
    {
      phase: "PHASE 2",
      title: "Sélection du LL.M. et candidatures",
      desc: "Construire une liste d'écoles cohérente, préparer CV, personal statement, recommandations et transcripts, déposer les candidatures.",
    },
    {
      phase: "PHASE 3",
      title: "Financement et visa",
      desc: "Bourses, prêts, partenariats universitaires, arbitrage du coût net, puis constitution du dossier de visa étudiant.",
    },
    {
      phase: "PHASE 4",
      title: "LL.M. et dossier d'évaluation",
      desc: "Débuter le LL.M., préparer l'évaluation auprès du New York Board of Law Examiners, engager networking et recherche de stage.",
    },
    {
      phase: "PHASE 5",
      title: "Bar exam, admission et suite",
      desc: "Préparation UBE, MPRE et NYLE, passage de l'examen, dossier d'admission, prestation de serment, puis choix de carrière.",
    },
  ],
};

export const dashboard = {
  label: "LA PLATEFORME",
  title: "Un tableau de bord qui répond à une seule question : que dois-je faire aujourd'hui ?",
  body: "Après connexion, vous n'arrivez pas sur un catalogue de contenus. Vous arrivez sur votre situation : la phase où vous en êtes, l'action prioritaire du moment, vos échéances et votre progression.",
  panels: [
    { label: "PHASE ACTUELLE", value: "Sélection du LL.M.", hint: "Étape 4 sur 13" },
    { label: "PROCHAINE ACTION", value: "Finaliser votre liste d'écoles", hint: "≈ 2 h · avant le 15 octobre" },
    { label: "PROGRESSION", value: "38 %", hint: "11 tâches accomplies sur 29" },
    { label: "PROCHAINE ÉCHÉANCE", value: "Inscription TOEFL", hint: "Dans 12 jours" },
  ],
};

export const modules = {
  label: "MODULES ET OUTILS",
  title: "Des ressources rattachées à vos tâches, pas une bibliothèque à parcourir.",
  body: "Chaque module apparaît au moment où votre feuille de route en a besoin. Les outils suivent la même logique : ils servent une décision précise.",
  items: [
    { title: "Faut-il faire ce parcours ?", desc: "JD ou LL.M., coût réel, retour sur investissement, profils types, raisons de renoncer." },
    { title: "Choisir le bon LL.M.", desc: "Ranking, coût, bourses, networking, placement, éligibilité au bar, partenariats et LSAC." },
    { title: "Éligibilité NY et dossier d'évaluation", desc: "Advance evaluation, pièces à réunir, communication avec l'autorité, échéances et responsabilités." },
    { title: "Préparation du bar exam", desc: "UBE, MBE, MEE, MPT, NYLE, MPRE, choix du prestataire et planning de révision." },
    { title: "Simulateur de coût", desc: "Dix-sept postes de dépense, coût net après bourses et partenariats, jusqu'à trois scénarios comparés." },
    { title: "Trackers et modèles", desc: "Suivi des candidatures, listes d'écoles, checklists de documents et modèles de travail." },
  ],
};

export const offers = {
  label: "LES OFFRES",
  title: "Des périmètres clairs, des prix affichés.",
  betaNotice:
    "Phase bêta en cours : le diagnostic complet est actuellement offert aux premiers participants, en échange de leur retour d'expérience.",
  plans: [
    {
      name: "Découverte",
      price: "0 €",
      period: "",
      desc: "Questionnaire, résultat préliminaire immédiat et FAQ.",
      features: ["Questionnaire de 4 minutes", "Voie préliminaire identifiée", "Première fourchette de coût", "Partenariats détectés"],
      cta: "Commencer",
      highlight: false,
    },
    {
      name: "Diagnostic",
      price: "79 €",
      period: "paiement unique",
      desc: "Rapport éducatif et stratégique personnalisé, déduit de l'offre Plateforme pendant trente jours.",
      features: ["Rapport de 3 à 4 pages", "Cinq axes de viabilité", "Risques et actions correctrices", "Timeline et scénarios de coût", "Relu par le fondateur"],
      cta: "Obtenir mon rapport",
      highlight: true,
    },
    {
      name: "Plateforme",
      price: "à partir de 399 €",
      period: "accès 24 mois aux outils",
      desc: "Feuille de route personnalisée, tableau de bord, modules et simulateur.",
      features: ["Roadmap par phases", "Prochaine action prioritaire", "Modules pédagogiques", "Simulateur de coût", "Modèles et trackers"],
      cta: "Voir le détail",
      highlight: false,
    },
    {
      name: "Accompagnement",
      price: "1 500 – 2 500 €",
      period: "6 ou 12 mois",
      desc: "La plateforme, complétée par un accompagnement humain au périmètre défini.",
      features: ["Trois à cinq consultations", "Relectures définies à l'avance", "Priorité de réponse", "Suivi sur 6 ou 12 mois"],
      cta: "Demander les modalités",
      highlight: false,
    },
  ],
  paymentNote:
    "Paiement en trois ou quatre fois disponible sur les offres Plateforme et Accompagnement. Les contenus achetés restent accessibles durablement ; les outils dynamiques et les mises à jour sont inclus vingt-quatre mois, renouvelables à tarif réduit.",
  conciergeNote:
    "Une formule Concierge existe sur candidature, avec un nombre de places limité et un périmètre contractuel précis.",
};

export const founder = {
  label: "LE PARCOURS DU FONDATEUR",
  title: "J'ai fait ce parcours sans carte. Ce produit est la carte que j'aurais voulue.",
  paragraphs: [
    "Formé au droit en France, j'ai suivi un LL.M. aux États-Unis puis passé le barreau de New York. Entre la première question que je me suis posée et la prestation de serment, j'ai perdu du temps et de l'argent sur des décisions que personne ne m'avait aidé à cadrer.",
    "Les erreurs les plus coûteuses n'ont pas été juridiques : elles ont été des erreurs de calendrier, de budget et de séquence. Un dossier déposé trop tard, une bourse identifiée après la deadline, un coût de vie sous-estimé, une démarche engagée dans le mauvais ordre.",
    "Cette plateforme reprend ce que j'ai appris et le structure : une méthode, un ordre, des échéances et des sources vérifiées. Elle ne promet pas un résultat. Elle vous donne les moyens de décider en connaissance de cause et d'exécuter sans improviser.",
  ],
  signature: "Corentin Saint-Girons",
  signatureRole:
    "Fondateur — juriste formé en France, ayant accompli le parcours LL.M. et New York Bar.",
};

export const faq = {
  label: "QUESTIONS FRÉQUENTES",
  title: "Ce que ce produit fait, et ce qu'il ne fait pas.",
  items: [
    {
      q: "Est-ce qu'un emploi aux États-Unis est assuré à la fin du parcours ?",
      a: "Non, et aucune promesse de ce type ne vous sera faite. Le recrutement dépend du marché, des employeurs et de votre profil. La plateforme vous aide à préparer votre recherche, à comprendre les segments accessibles et à éviter les erreurs de calendrier — rien de plus, rien de moins.",
    },
    {
      q: "La plateforme détermine-t-elle si je peux passer le barreau de New York ?",
      a: "Non. Seul le New York Board of Law Examiners procède à l'évaluation officielle d'un candidat formé à l'étranger. Le diagnostic identifie une voie préliminaire, explique les règles générales publiées par l'autorité et vous indique les points à faire confirmer par elle.",
    },
    {
      q: "Je suis encore en licence. Est-ce trop tôt ?",
      a: "Non. C'est même la période où les décisions coûtent le moins cher : choix de master, préparation de l'anglais, construction du budget, repérage des partenariats de votre université. Le questionnaire prévoit explicitement la réponse « trop tôt pour le dire » sur l'objectif professionnel.",
    },
    {
      q: "Je suis déjà admis en LL.M. La plateforme reste-t-elle utile ?",
      a: "Oui. Le parcours se poursuit bien après l'admission : dossier d'évaluation, networking et stages, choix du prestataire de bar preparation, planning de révision, inscription à l'examen, puis dossier d'admission. Votre feuille de route démarre à la phase où vous vous trouvez réellement.",
    },
    {
      q: "S'agit-il d'un service juridique ?",
      a: "Non. Le rapport et la plateforme sont des produits éducatifs et stratégiques. Ils ne constituent ni une consultation, ni un avis juridique, ni une détermination officielle, et n'établissent aucune relation avocat-client. Tout service juridique distinct ferait l'objet d'un engagement séparé.",
    },
    {
      q: "Combien de temps ai-je accès au produit ?",
      a: "Les contenus pédagogiques achetés restent accessibles durablement. Les outils dynamiques — feuille de route, simulateur, trackers — ainsi que les mises à jour réglementaires sont inclus pendant vingt-quatre mois, renouvelables ensuite à tarif réduit. La distinction est indiquée avant tout achat.",
    },
    {
      q: "Comment les règles sont-elles tenues à jour ?",
      a: "Chaque règle utilisée par le diagnostic porte une source officielle, une date de vérification et un numéro de version. Lorsqu'une autorité modifie sa règle, la mise à jour est appliquée en base et les parcours concernés sont recalculés — sans réécriture de code.",
    },
  ],
};

export const finalCta = {
  badge: "✦ COMMENCEZ VOTRE PARCOURS",
  title: "Quatre minutes pour savoir où vous en êtes.",
  body: "Le questionnaire est gratuit et sans création de compte. Vous obtenez votre résultat préliminaire immédiatement, puis votre rapport personnalisé sous 48 heures.",
  cta: "Commencer le diagnostic gratuit",
  disclaimer:
    "Ce diagnostic est un produit éducatif et stratégique fondé sur les informations que vous communiquez, des sources publiques, des parcours documentés et l'expérience personnelle du fondateur. Il ne constitue pas un conseil juridique, ne crée aucune relation avocat-client et ne vaut décision d'aucune université, autorité de barreau, autorité migratoire ou employeur.",
};

export const footer = {
  brand: "ADMITTO",
  tagline: "Parcours LL.M. et barreau américain pour juristes formés en France.",
  columns: [
    {
      title: "PRODUIT",
      links: [
        { label: "Le défi", href: "#problematique" },
        { label: "La solution", href: "#solution" },
        { label: "Le parcours", href: "#parcours" },
        { label: "Offres", href: "#offres" },
      ],
    },
    {
      title: "RESSOURCES",
      links: [
        { label: "Questions fréquentes", href: "#faq" },
        { label: "Le fondateur", href: "#fondateur" },
        { label: "Diagnostic gratuit", href: "#commencer" },
      ],
    },
    {
      title: "LÉGAL",
      links: [
        { label: "Mentions légales", href: "/mentions-legales" },
        { label: "Confidentialité", href: "/confidentialite" },
        { label: "Conditions générales", href: "/conditions-generales" },
      ],
    },
  ],
  legal:
    "Produit éducatif et stratégique. Ni conseil juridique, ni relation avocat-client, ni détermination officielle d'une autorité.",
  copyright: "© 2026 Admitto. Tous droits réservés.",
};
