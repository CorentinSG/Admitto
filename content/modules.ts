import type { ModuleEntry } from "@/lib/modules/types";
import { isPublishable, publicationBlockers } from "@/lib/modules/types";

/**
 * Modules pédagogiques (CDC §25).
 *
 * Ordre de production imposé par le CDC §25.1 : Module 0 (décision),
 * Module 2 (choix du LL.M.), Module 5 (BOLE), Module 6 (bar preparation).
 * Les autres viennent ensuite, selon la demande observée.
 *
 * `published` gouverne l'affichage : un module non publié est annoncé comme en
 * production, jamais lié. Un lien vers une page inexistante casse la navigation
 * et pollue la console — Next.js préfetche les liens visibles.
 *
 * Les modules non encore rédigés portent déjà leur plan de sections. Le plan
 * n'est pas de la décoration : il fixe, avant l'écriture, quelles sections
 * énonceront une règle officielle et devront donc être sourcées.
 */

export type { ModuleEntry };

export const MODULES: ModuleEntry[] = [
  {
    slug: "module-0-decision",
    order: 0,
    title: "Faut-il faire ce parcours ?",
    summary:
      "JD ou LL.M., parcours sur trois à cinq ans, coût, retour sur investissement, risques, profils types, raisons de faire ou de ne pas faire le projet.",
    readingMinutes: 18,
    published: true,
    sections: [
      {
        kind: "METHOD",
        id: "m0-cadre",
        title: "Ce que ce module cherche à faire",
        body: [
          "Ce module ne cherche pas à vous convaincre. Il cherche à ce que vous puissiez dire, à la fin, une phrase précise : « je fais ce parcours pour telle raison, en acceptant tel coût et tel risque » — ou « je ne le fais pas, et voici pourquoi ».",
          "La plupart des projets qui échouent n'échouent pas sur un dossier de candidature. Ils échouent parce que la décision de départ n'a jamais été formulée, et qu'on découvre au bout de deux ans qu'on poursuivait l'idée d'un parcours plutôt que le parcours lui-même.",
          "Prenez ce module avec un document ouvert à côté. Chaque section se termine par une question à laquelle vous devez pouvoir répondre par écrit. Une réponse que vous n'arrivez pas à écrire est une réponse que vous n'avez pas.",
        ],
        keyPoints: [
          "L'objectif est une décision formulée, pas une décision positive.",
          "Une question sans réponse écrite reste une question ouverte.",
        ],
      },
      {
        kind: "METHOD",
        id: "m0-jd-llm",
        title: "JD ou LL.M. : deux projets qui n'ont presque rien en commun",
        body: [
          "Le LL.M. est un diplôme d'un an, conçu pour des juristes déjà formés ailleurs. Le JD est le diplôme de droit américain de plein exercice : trois ans, un concours d'entrée, un coût sans commune mesure, et une insertion dans le marché américain qui suit des règles différentes.",
          "Beaucoup de candidats français comparent les deux sur le seul critère du coût et concluent naturellement en faveur du LL.M. C'est un mauvais angle. La vraie question est celle du marché que vous visez : le LL.M. vous rattache durablement à votre formation d'origine, y compris aux yeux des recruteurs américains. C'est un atout dans les fonctions où le droit français est la valeur — arbitrage international, groupes français, cabinets à pratique transatlantique — et un handicap dans celles où l'on recrute un juriste américain généraliste.",
          "Le JD ne se justifie que si votre projet est de faire carrière aux États-Unis sur le marché américain, sans que votre formation initiale y joue de rôle particulier. C'est un projet légitime, mais c'est un autre projet : il ne s'agit pas d'une version plus ambitieuse du même chemin.",
        ],
        keyPoints: [
          "Le critère de choix n'est pas le coût, c'est le marché visé.",
          "Le LL.M. valorise votre formation française ; le JD la neutralise.",
        ],
      },
      {
        kind: "METHOD",
        id: "m0-duree",
        title: "Ce que « trois à cinq ans » veut dire concrètement",
        body: [
          "Le chiffre surprend parce qu'on pense au LL.M., qui dure un an. Mais le LL.M. n'est qu'un segment. Comptez en amont six à dix-huit mois de préparation — tests d'anglais, dossiers, traductions, recommandations, décisions de financement — et en aval la période d'examen, l'attente des résultats, puis les démarches d'admission qui suivent.",
          "Ajoutez que ces séquences s'enchaînent mal : les candidatures se déposent à l'automne pour une rentrée l'été suivant ; l'examen ne se présente qu'à des sessions fixes ; les démarches administratives ont leurs propres délais, indépendants de votre disponibilité. Rater une fenêtre ne coûte pas trois semaines, elle coûte un cycle entier.",
          "C'est la raison d'être de la feuille de route de la plateforme : elle calcule les dates à rebours de la rentrée que vous visez, ce qui rend visible la seule chose qui compte à ce stade — la date après laquelle il est trop tard pour cette année-là.",
        ],
        keyPoints: [
          "Le LL.M. est un segment d'un an dans un parcours de trois à cinq ans.",
          "Les fenêtres sont annuelles : un retard se paie en cycles, pas en semaines.",
        ],
      },
      {
        kind: "METHOD",
        id: "m0-cout",
        title: "Le coût réel, et celui qu'on oublie",
        body: [
          "Le coût affiché d'un LL.M. est celui des frais de scolarité. Il est déjà élevé. Mais il ne représente souvent qu'une moitié du total : logement dans une ville chère, assurance santé obligatoire, frais de dossiers et de traductions, préparation à l'examen, déplacements, frais d'inscription et d'admission.",
          "S'y ajoute le poste que presque personne ne compte : les mois sans revenu. Si vous exercez aujourd'hui, partir un an ne coûte pas seulement ce que vous dépensez, mais aussi ce que vous cessez de gagner. Ce manque à gagner dépasse fréquemment les frais de scolarité eux-mêmes.",
          "Deux leviers réduisent réellement la facture. Les bourses, qui se demandent tôt et selon des calendriers propres à chaque école. Et les accords entre votre université française et des law schools américaines, qui peuvent alléger ou supprimer les frais de scolarité — la plateforme les détecte à partir de votre université et de votre niveau d'études, et le simulateur de coût en tient compte dans ses scénarios.",
          "Faites l'exercice avant de décider, pas après. Un chiffre total que vous n'avez pas écrit est un chiffre que vous découvrirez trop tard.",
        ],
        keyPoints: [
          "Les frais de scolarité sont souvent la moitié du coût total.",
          "Les mois sans revenu sont un poste à part entière.",
          "Bourses et accords inter-universitaires sont les deux leviers réels.",
        ],
      },
      {
        kind: "METHOD",
        id: "m0-apports",
        title: "Ce que le diplôme change — et ce qu'il ne change pas",
        body: [
          "Ce qu'il change : une compréhension de première main du droit américain et de la façon dont il se pratique ; un réseau constitué sur place, qui est souvent le vrai actif du LL.M. ; une crédibilité immédiate dans les dossiers transatlantiques ; et, dans certains États, la possibilité de se présenter à l'examen du barreau, ce qui ouvre un tout autre registre professionnel.",
          "Ce qu'il ne change pas : votre positionnement sur le marché du travail ne se transforme pas parce que vous avez un diplôme de plus. Le LL.M. amplifie une trajectoire, il n'en crée pas. Un profil sans direction avant le LL.M. reste un profil sans direction après, avec une année et un budget en moins.",
          "C'est pourquoi le module suivant porte sur la stratégie de carrière, et non sur le choix de l'école. L'ordre n'est pas arbitraire : le choix de l'école découle de la carrière visée, jamais l'inverse.",
        ],
        keyPoints: [
          "Le LL.M. amplifie une trajectoire existante ; il n'en fabrique pas.",
          "La carrière visée détermine l'école, et non l'inverse.",
        ],
      },
      {
        kind: "METHOD",
        id: "m0-profils",
        title: "Cinq situations de départ, cinq questions différentes",
        body: [
          "L'étudiant en cours de formation a du temps devant lui et peu de coût d'opportunité. Sa vraie question est celle du financement et du moment : partir tout de suite ou après quelques années de pratique, sachant qu'une expérience professionnelle change la valeur du LL.M. sur le marché.",
          "Le jeune avocat, deux à cinq ans de pratique, est dans la fenêtre la plus favorable : assez d'expérience pour valoriser le diplôme, pas encore d'attaches qui rendent le départ coûteux. Sa question est celle du renoncement temporaire à une progression en cours.",
          "L'avocat confirmé fait face au coût d'opportunité le plus élevé. Pour lui, le calcul ne tient que si le diplôme sert un repositionnement précis — ouvrir une pratique, accompagner une clientèle, changer de marché. « Enrichir mon profil » n'est pas une raison suffisante à ce niveau de coût.",
          "Le juriste d'entreprise doit d'abord poser la question à son employeur : financement, congé de formation, poste au retour. Un projet soutenu par l'entreprise et un projet mené contre elle ne sont pas la même décision.",
          "Le juriste en reconversion, enfin, doit se méfier du LL.M. comme solution à une insatisfaction. Le diplôme est un accélérateur de direction ; il ne remplace pas le travail de définir cette direction.",
        ],
        keyPoints: [
          "Le coût d'opportunité augmente avec l'ancienneté ; l'exigence de justification aussi.",
          "En entreprise, la première conversation à avoir est interne.",
        ],
      },
      {
        kind: "METHOD",
        id: "m0-raisons",
        title: "Les bonnes raisons, et celles qui ne tiennent pas",
        body: [
          "Tiennent : viser une pratique où le droit américain est la matière quotidienne ; préparer un examen du barreau américain avec un objectif professionnel identifié derrière ; construire un réseau sur un marché où l'on veut travailler ; accompagner une clientèle qui se déplace vers les États-Unis ; ou combler un manque technique précis que la formation française ne couvre pas.",
          "Ne tiennent pas : « ça ouvre des portes », qui ne désigne aucune porte en particulier ; « c'est bien sur un CV », qui est vrai mais ne justifie jamais la dépense ; « je ne sais pas quoi faire », qui est une raison de ne pas partir ; et « tout le monde le fait dans ma promotion », qui est le meilleur indicateur qu'on suit un mouvement plutôt qu'une décision.",
          "Une raison qui tient a une propriété reconnaissable : elle survit à la question « et si le diplôme ne changeait rien à mon employabilité, le ferais-je quand même ? ». Si la réponse est non, la raison est bonne mais fragile, et elle doit être adossée à un plan de carrière explicite.",
        ],
        keyPoints: [
          "Une bonne raison désigne une pratique, un marché ou un manque précis.",
          "« Ça ouvre des portes » n'est pas une raison : c'est une absence de raison.",
        ],
      },
      {
        kind: "METHOD",
        id: "m0-risques",
        title: "Les risques qu'il faut avoir regardés en face",
        body: [
          "Le risque financier est le plus évident : un parcours interrompu en cours de route laisse la dépense sans le diplôme. Il se réduit en séquençant les engagements — ne payer qu'au moment où l'étape précédente est acquise.",
          "Le risque de calendrier est le plus fréquent : une pièce demandée à un tiers qui met deux mois à arriver, une session d'examen manquée, une fenêtre de candidature fermée. Il ne se réduit pas par l'effort, seulement par l'anticipation, ce que la feuille de route sert précisément à organiser.",
          "Le risque de parcours, enfin : les conditions d'accès à l'examen du barreau relèvent d'autorités américaines qui apprécient chaque dossier individuellement, sur la base de votre formation. Cette appréciation ne peut être ni promise ni anticipée avec certitude par un tiers, y compris par Admitto. C'est la raison pour laquelle l'analyse ne conclut jamais à une décision définitive : elle situe votre profil et signale ce qui reste à faire vérifier auprès de l'autorité compétente.",
          "Un projet qui n'a pas regardé ces trois risques n'est pas un projet plus optimiste : c'est le même projet, avec les mêmes risques, et une personne de moins pour les voir venir.",
        ],
        keyPoints: [
          "Séquencer les paiements réduit le risque financier.",
          "Le risque de calendrier ne se rattrape pas par l'effort.",
          "Les conditions d'accès à l'examen relèvent d'une autorité, jamais d'une promesse.",
        ],
      },
      {
        kind: "METHOD",
        id: "m0-decision",
        title: "Ce qu'il faut avoir écrit avant de passer à la suite",
        body: [
          "Quatre phrases, écrites, avant d'ouvrir le module suivant.",
          "Un : le marché et la pratique que je vise, en une phrase qui nomme une chose précise. Deux : le montant total que ce parcours me coûtera, mois sans revenu compris, et d'où vient cet argent. Trois : la rentrée que je vise, et la date après laquelle il sera trop tard pour cette année-là. Quatre : ce qui me ferait renoncer — le seuil, financier ou personnel, à partir duquel j'arrête.",
          "La quatrième est celle qu'on saute, et c'est la plus utile. Décider à l'avance de ce qui vous ferait arrêter est ce qui vous permettra, le jour venu, de distinguer un obstacle normal d'un signal de sortie.",
          "Si ces quatre phrases sont écrites, le module suivant a du sens. Sinon, relisez ce module : ce n'est pas de l'information qui vous manque, c'est une décision.",
        ],
        keyPoints: [
          "Marché visé, coût total, date limite, seuil de renoncement.",
          "Le seuil de renoncement se fixe à froid, jamais dans la difficulté.",
        ],
      },
    ],
  },
  {
    slug: "module-1-career",
    order: 1,
    title: "Stratégie de carrière",
    summary:
      "Grands cabinets, niches, retour en France, entreprise, arbitrage, immigration, organisations internationales.",
    readingMinutes: 20,
    published: false,
    sections: [
      { kind: "METHOD", id: "m1-marches", title: "Cartographier les marchés accessibles", body: [] },
      { kind: "METHOD", id: "m1-cabinets", title: "Grands cabinets et pratiques de niche", body: [] },
      { kind: "METHOD", id: "m1-retour", title: "Le retour en France comme stratégie assumée", body: [] },
      { kind: "METHOD", id: "m1-entreprise", title: "Entreprise et organisations internationales", body: [] },
    ],
  },
  {
    slug: "module-2-choisir",
    order: 2,
    title: "Choisir le bon LL.M.",
    summary:
      "Ranking, coût, bourses, networking, placement, accès au barreau, partenariats, LSAC et candidatures directes.",
    readingMinutes: 22,
    published: false,
    sections: [
      { kind: "METHOD", id: "m2-criteres", title: "Sept critères, et leur ordre d'importance", body: [] },
      { kind: "METHOD", id: "m2-ranking", title: "Ce que le classement mesure et ce qu'il ignore", body: [] },
      { kind: "METHOD", id: "m2-partenariats", title: "Tirer parti des accords de votre université", body: [] },
      {
        kind: "OFFICIAL_RULE",
        id: "m2-acces-barreau",
        title: "Conditions posées au programme suivi",
        body: [],
        source: { label: "À vérifier auprès de l'autorité compétente", url: "", verifiedAt: "" },
      },
      { kind: "METHOD", id: "m2-lsac", title: "LSAC ou candidature directe", body: [] },
    ],
  },
  {
    slug: "module-3-candidatures",
    order: 3,
    title: "Candidatures et financement",
    summary:
      "CV, personal statement, recommandations, relevés de notes, traductions, candidatures et bourses.",
    readingMinutes: 20,
    published: false,
    sections: [
      { kind: "METHOD", id: "m3-cv", title: "Le CV au format américain", body: [] },
      { kind: "METHOD", id: "m3-statement", title: "Écrire le personal statement", body: [] },
      { kind: "METHOD", id: "m3-recommandations", title: "Demander des recommandations utiles", body: [] },
      { kind: "METHOD", id: "m3-bourses", title: "Calendrier et stratégie de bourses", body: [] },
    ],
  },
  {
    slug: "module-4-immigration",
    order: 4,
    title: "Panorama migratoire",
    summary:
      "F-1, OPT, H-1B, O-1, L-1, sponsoring, limites et erreurs courantes. Information générale uniquement.",
    readingMinutes: 16,
    published: false,
    sections: [
      {
        kind: "OFFICIAL_RULE",
        id: "m4-statuts",
        title: "Panorama des statuts d'études et de travail",
        body: [],
        source: { label: "À vérifier auprès de l'autorité compétente", url: "", verifiedAt: "" },
      },
      { kind: "METHOD", id: "m4-erreurs", title: "Erreurs de séquencement les plus fréquentes", body: [] },
      { kind: "METHOD", id: "m4-limites", title: "Ce que ce module ne peut pas faire pour vous", body: [] },
    ],
  },
  {
    slug: "module-5-bole",
    order: 5,
    title: "Dossier d'évaluation et conditions d'accès à l'examen",
    summary:
      "Évaluation préalable, pièces à réunir, communication avec l'autorité, échéances et responsabilités.",
    readingMinutes: 24,
    published: false,
    sections: [
      { kind: "METHOD", id: "m5-principe", title: "Pourquoi une évaluation préalable", body: [] },
      {
        kind: "OFFICIAL_RULE",
        id: "m5-conditions",
        title: "Conditions posées à la formation d'origine",
        body: [],
        source: { label: "À vérifier auprès de l'autorité compétente", url: "", verifiedAt: "" },
      },
      {
        kind: "OFFICIAL_RULE",
        id: "m5-pieces",
        title: "Pièces exigées et forme attendue",
        body: [],
        source: { label: "À vérifier auprès de l'autorité compétente", url: "", verifiedAt: "" },
      },
      { kind: "METHOD", id: "m5-calendrier", title: "Reconstituer son calendrier à rebours", body: [] },
      { kind: "METHOD", id: "m5-tiers", title: "Obtenir des pièces qui dépendent de tiers", body: [] },
    ],
  },
  {
    slug: "module-6-bar",
    order: 6,
    title: "Préparation de l'examen du barreau",
    summary: "UBE, MBE, MEE, MPT, épreuves complémentaires, prestataires et planning de révision.",
    readingMinutes: 26,
    published: false,
    sections: [
      {
        kind: "OFFICIAL_RULE",
        id: "m6-epreuves",
        title: "Structure de l'examen et épreuves complémentaires",
        body: [],
        source: { label: "À vérifier auprès de l'autorité compétente", url: "", verifiedAt: "" },
      },
      { kind: "METHOD", id: "m6-prestataires", title: "Choisir un programme de préparation", body: [] },
      { kind: "METHOD", id: "m6-planning", title: "Construire un planning de révision tenable", body: [] },
      { kind: "METHOD", id: "m6-methode", title: "Méthode d'entraînement et correction", body: [] },
    ],
  },
  {
    slug: "module-7-admission",
    order: 7,
    title: "Admission",
    summary: "Character and Fitness, pièces, références, prestation de serment et formation continue.",
    readingMinutes: 14,
    published: false,
    sections: [
      {
        kind: "OFFICIAL_RULE",
        id: "m7-procedure",
        title: "Étapes de la procédure d'admission",
        body: [],
        source: { label: "À vérifier auprès de l'autorité compétente", url: "", verifiedAt: "" },
      },
      { kind: "METHOD", id: "m7-references", title: "Réunir ses références en amont", body: [] },
    ],
  },
  {
    slug: "module-8-autres-barreaux",
    order: 8,
    title: "Autres barreaux et équivalences",
    summary: "UBE, Californie, autres juridictions, France et Europe.",
    readingMinutes: 15,
    published: false,
    sections: [
      { kind: "METHOD", id: "m8-comparer", title: "Comparer les juridictions sur les bons critères", body: [] },
      {
        kind: "OFFICIAL_RULE",
        id: "m8-transfert",
        title: "Portée d'un résultat d'examen entre juridictions",
        body: [],
        source: { label: "À vérifier auprès de l'autorité compétente", url: "", verifiedAt: "" },
      },
      { kind: "METHOD", id: "m8-france", title: "Retour en France et exercice en Europe", body: [] },
    ],
  },
  {
    slug: "module-9-recherche",
    order: 9,
    title: "Recherche de stage et d'emploi",
    summary: "Networking, alumni, cold emails, CV américain, LinkedIn, entretiens et suivi des candidatures.",
    readingMinutes: 19,
    published: false,
    sections: [
      { kind: "METHOD", id: "m9-reseau", title: "Le réseau comme travail, pas comme hasard", body: [] },
      { kind: "METHOD", id: "m9-coldmail", title: "Écrire un cold email auquel on répond", body: [] },
      { kind: "METHOD", id: "m9-entretiens", title: "Entretiens américains : codes et préparation", body: [] },
      { kind: "METHOD", id: "m9-suivi", title: "Tenir un suivi de candidatures", body: [] },
    ],
  },
  {
    slug: "module-10-suite",
    order: 10,
    title: "Rester, rentrer ou aller ailleurs",
    summary: "Rester aux États-Unis, rentrer en France ou travailler dans un autre pays.",
    readingMinutes: 13,
    published: false,
    sections: [
      { kind: "METHOD", id: "m10-rester", title: "Rester : à quelles conditions", body: [] },
      { kind: "METHOD", id: "m10-rentrer", title: "Rentrer sans perdre le bénéfice du parcours", body: [] },
      { kind: "METHOD", id: "m10-ailleurs", title: "Un troisième marché", body: [] },
    ],
  },
];

export function findModule(slug: string | undefined): ModuleEntry | null {
  if (!slug) return null;
  return MODULES.find((m) => m.slug === slug) ?? null;
}

/**
 * Un module n'est lisible que s'il est publié ET correctement sourcé.
 * Les deux conditions sont vérifiées au même endroit pour qu'aucune page ne
 * puisse servir un contenu que le garde-fou refuserait.
 */
export function isModulePublished(slug: string | undefined): boolean {
  const entry = findModule(slug);
  return entry ? isPublishable(entry) : false;
}

export function moduleBlockers(slug: string): string[] {
  const entry = findModule(slug);
  return entry ? publicationBlockers(entry) : ["module inconnu"];
}

export const modulesCopy = {
  title: "Modules",
  intro:
    "Les modules sont des ressources rattachées à votre feuille de route : chaque tâche renvoie au module qui l'explique. Ils se lisent au moment où la tâche se pose, pas d'un bloc.",
  productionNote:
    "Les modules paraissent dans l'ordre où ils servent : décision, choix du programme, dossier d'évaluation, préparation de l'examen. Les autres suivent selon les besoins constatés.",
  inProduction: "En cours de production",
  readingTime: (minutes: number) => `${minutes} min de lecture`,
  sectionsCount: (n: number) => `${n} section${n > 1 ? "s" : ""}`,
  outlineTitle: "Plan prévu",
  sourceLabel: "Source",
  verifiedLabel: "Vérifiée le",
  keyPointsTitle: "À retenir",
  back: "Tous les modules",
  disclaimer:
    "Ce module est une ressource de méthode. Il ne constitue pas un conseil juridique et ne remplace pas la vérification de votre situation auprès des autorités compétentes.",
};

/** Ordre de production imposé par le CDC §25.1. */
export const PRODUCTION_ORDER = [
  "module-0-decision",
  "module-2-choisir",
  "module-5-bole",
  "module-6-bar",
] as const;
