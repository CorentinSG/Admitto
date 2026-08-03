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
 *
 * La durée de lecture n'est pas déclarée ici : elle se calcule depuis le texte
 * (`readingMinutes` dans `lib/modules/types.ts`). Un chiffre écrit à la main
 * se désaccorde du contenu au premier paragraphe ajouté, et c'est une promesse
 * faite au lecteur.
 */

export type { ModuleEntry };

export const MODULES: ModuleEntry[] = [
  {
    slug: "module-0-decision",
    order: 0,
    title: "Faut-il faire ce parcours ?",
    summary:
      "JD ou LL.M., parcours sur trois à cinq ans, coût, retour sur investissement, risques, profils types, raisons de faire ou de ne pas faire le projet.",
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
    published: true,
    sections: [
      {
        kind: "METHOD",
        id: "m1-marches",
        title: "Cartographier les marchés accessibles",
        body: [
          "Un LL.M. n'ouvre pas « le marché américain ». Il ouvre certains segments de certains marchés, et le travail de ce module est de nommer lesquels dans votre cas plutôt que de raisonner sur une moyenne qui ne correspond à personne.",
          "Trois axes suffisent à dessiner la carte. Le premier est géographique : États-Unis, France, ou un troisième pays. Le second est celui de l'employeur : cabinet, entreprise, institution. Le troisième, le plus déterminant et le plus souvent oublié, est celui de la valeur que vous apportez — êtes-vous recruté parce que vous connaissez le droit français, ou malgré le fait que votre formation soit française ?",
          "Ce troisième axe départage tout le reste. Les fonctions où votre formation d'origine est l'atout recherché vous sont largement ouvertes et le resteront. Celles où l'on cherche un juriste américain généraliste vous mettent en concurrence directe avec des diplômés de JD, sur un terrain où votre parcours ne compte pas en votre faveur. Ce ne sont pas deux niveaux de difficulté, ce sont deux marchés.",
          "Écrivez la liste des postes que vous visez, et pour chacun, dans quelle colonne il tombe. Une liste où tout tombe dans la seconde colonne n'est pas impossible, mais elle demande un projet différent — et probablement un autre diplôme.",
        ],
        keyPoints: [
          "La question n'est pas « quel marché » mais « recruté pour ma formation, ou malgré elle ».",
          "Une liste de postes qui relèvent tous du marché généraliste américain signale un projet mal calibré.",
        ],
      },
      {
        kind: "METHOD",
        id: "m1-cabinets",
        title: "Grands cabinets et pratiques de niche",
        body: [
          "Les grands cabinets internationaux recrutent des profils LL.M., mais rarement là où on les attend. Les postes qui vous sont réellement accessibles sont ceux des équipes qui travaillent sur des dossiers transatlantiques : opérations impliquant des groupes français, arbitrage international, contentieux transfrontalier, conformité de sociétés européennes. Votre double lecture y est un outil de travail, pas une curiosité.",
          "À l'inverse, les équipes qui traitent des dossiers purement domestiques recrutent presque exclusivement sur le circuit des JD, avec un calendrier de recrutement propre et des critères où le LL.M. pèse peu. S'obstiner sur ce segment consomme la seule ressource rare de votre année de LL.M. : le temps.",
          "Les pratiques de niche méritent une attention particulière. Un domaine étroit où la double compétence est structurellement demandée — droit de l'énergie, sanctions internationales, propriété intellectuelle sur des portefeuilles européens, droit du sport — offre un rapport bien plus favorable entre l'effort de candidature et la probabilité d'être reçu en entretien. Une niche se choisit tôt : elle oriente les cours du LL.M., les stages visés et les personnes à rencontrer.",
        ],
        keyPoints: [
          "Le segment transatlantique valorise votre profil ; le segment domestique le neutralise.",
          "Une niche choisie tôt oriente les cours, les stages et le réseau — elle ne se décide pas après coup.",
        ],
      },
      {
        kind: "METHOD",
        id: "m1-retour",
        title: "Le retour en France comme stratégie assumée",
        body: [
          "Rentrer en France après le parcours n'est pas un repli. C'est, pour une large part des profils, la stratégie qui tire le meilleur parti de l'investissement — à condition d'être décidée à l'avance plutôt que subie au bout de dix-huit mois de recherche infructueuse.",
          "La différence entre les deux se voit dans le dossier. Un retour préparé se construit pendant l'année : cours choisis pour leur pertinence sur le marché français, stage ou expérience orientée vers les équipes transatlantiques des cabinets parisiens, réseau entretenu des deux côtés. Un retour subi arrive sans rien de tout cela, avec une année qui se raconte mal en entretien.",
          "Posez-vous la question franchement, et tôt : si dans dix-huit mois vous êtes à Paris, votre parcours aura-t-il servi ? Si la réponse est non, ce n'est pas le retour qu'il faut écarter, c'est la façon dont vous préparez l'année.",
        ],
        keyPoints: [
          "Un retour décidé à l'avance se prépare et se raconte ; un retour subi ne se raconte pas.",
          "Le test : « si je suis à Paris dans dix-huit mois, cette année aura-t-elle servi ? »",
        ],
      },
      {
        kind: "METHOD",
        id: "m1-entreprise",
        title: "Entreprise et organisations internationales",
        body: [
          "Les directions juridiques de groupes internationaux constituent un débouché que les candidats sous-estiment, parce qu'il est moins visible que les cabinets et qu'il ne recrute pas selon un calendrier public affiché. Le recrutement s'y fait davantage par le réseau et par cooptation interne, ce qui avantage ceux qui ont travaillé leurs contacts pendant l'année plutôt qu'après.",
          "Le profil recherché y est souvent exactement le vôtre : un juriste capable de faire le lien entre un siège européen et des opérations américaines, à l'aise dans deux cultures juridiques. La contrepartie est que ces postes sont rarement ouverts à un jeune diplômé sans expérience préalable — l'expérience française acquise avant le départ compte ici davantage que le diplôme lui-même.",
          "Les organisations internationales suivent une logique encore différente : processus de recrutement longs, exigences linguistiques précises, et une valorisation forte des parcours multi-juridictionnels. Elles méritent d'être examinées, mais leurs délais sont incompatibles avec une recherche menée dans les trois mois qui suivent le diplôme. Si ce débouché vous intéresse, il se prépare deux ans à l'avance.",
        ],
        keyPoints: [
          "En entreprise, l'expérience française acquise avant le départ pèse souvent plus que le diplôme.",
          "Les organisations internationales se préparent des années à l'avance, pas après le diplôme.",
        ],
      },
    ],
  },
  {
    slug: "module-2-choisir",
    order: 2,
    title: "Choisir le bon LL.M.",
    summary:
      "Ranking, coût, bourses, networking, placement, accès au barreau, partenariats, LSAC et candidatures directes.",
    published: false,
    sections: [
      {
        kind: "METHOD",
        id: "m2-criteres",
        title: "Sept critères, et leur ordre d'importance",
        body: [
          "Sept critères suffisent à départager les programmes : les conditions d'accès à l'examen du barreau que le programme permet de satisfaire, le coût net après aides, la qualité et l'accessibilité du réseau d'anciens, le placement observé des diplômés étrangers, la spécialisation offerte, la localisation, et la réputation générale.",
          "Leur ordre compte plus que la liste. Le premier critère est éliminatoire : si le programme ne vous permet pas de satisfaire les conditions posées par l'autorité que vous visez, les six autres sont sans objet. Ces conditions sont traitées dans la section suivante, qui porte sa source — elles ne se déduisent d'aucun classement et se vérifient programme par programme.",
          "Les critères deux à quatre — coût net, réseau, placement — décident en pratique. Le coût net n'est pas le prix affiché : il se calcule après bourses et après accords inter-universitaires, et l'écart entre deux programmes peut dépasser une année de revenus. La réputation générale, que la plupart des candidats placent en tête, arrive en dernier : elle influe peu sur ce que vous ferez de l'année.",
          "Construisez un tableau à sept colonnes avant de candidater, pas après les réponses. Une école éliminée sur le premier critère est une candidature que vous n'aurez pas à écrire — et le temps ainsi gagné se reporte sur les dossiers qui comptent.",
        ],
        keyPoints: [
          "Le premier critère est éliminatoire : sans lui, les six autres ne servent à rien.",
          "Le coût net après aides et accords, pas le prix affiché.",
          "La réputation générale arrive en dernier, pas en premier.",
        ],
      },
      {
        kind: "METHOD",
        id: "m2-ranking",
        title: "Ce que le classement mesure et ce qu'il ignore",
        body: [
          "Les classements de law schools mesurent des grandeurs réelles — sélectivité à l'entrée, ressources, insertion des diplômés — mais ils les mesurent sur le programme de JD, qui est le cœur de ces écoles. Le LL.M. n'y entre pratiquement pas. Un classement élevé vous renseigne donc sur la maison, pas sur l'année que vous y passerez.",
          "Trois choses qu'un classement ignore et qui vous concernent directement : le nombre d'étudiants étrangers dans la promotion et l'attention qu'on leur porte, l'existence d'un accompagnement à la recherche d'emploi ouvert aux LL.M. — souvent réservé aux JD —, et le devenir réel des diplômés étrangers du programme, qui n'est presque jamais publié.",
          "Ces informations existent, mais elles se demandent. Écrivez au responsable du programme et à deux ou trois anciens : combien d'étudiants dans la promotion, d'où viennent-ils, où sont-ils un an après. Une école qui répond précisément à ces questions vous en dit plus qu'un rang ; une école qui les esquive vous en dit autant.",
        ],
        keyPoints: [
          "Le classement mesure le JD, pas le LL.M. que vous suivrez.",
          "Trois angles morts : taille de la promotion étrangère, accès au service carrière, devenir des diplômés étrangers.",
          "Ces chiffres se demandent — et la qualité de la réponse est elle-même une information.",
        ],
      },
      {
        kind: "METHOD",
        id: "m2-partenariats",
        title: "Tirer parti des accords de votre université",
        body: [
          "Beaucoup d'universités françaises ont conclu des accords avec des law schools américaines. Ces accords portent selon les cas sur des places réservées, une dispense partielle ou totale de frais de scolarité, ou une procédure de candidature allégée. Ils constituent souvent le levier financier le plus lourd du parcours, devant les bourses — et une part des candidats concernés ignore qu'ils existent.",
          "La plateforme les détecte à partir de l'université et du niveau d'études que vous avez déclarés, et les fait apparaître dans le sélecteur d'écoles. Ce qui est détecté reste à confirmer auprès du service des relations internationales de votre université : un accord évolue, se suspend, change de conditions, et c'est ce service qui en détient l'état courant.",
          "Deux points de méthode. Le premier : demandez l'état de l'accord tôt, car les places réservées ont leurs propres dates limites, généralement antérieures à celles des candidatures directes. Le second : un accord n'est pas une raison suffisante de choisir un programme. Il déplace le coût net, ce qui est considérable, mais il ne change rien aux six autres critères — un programme gratuit qui ne mène pas où vous allez reste un mauvais choix.",
        ],
        keyPoints: [
          "Les accords pèsent souvent plus lourd que les bourses sur le coût net.",
          "Ce que détecte la plateforme se confirme auprès des relations internationales.",
          "Un accord déplace le coût, il ne remplace pas les autres critères.",
        ],
      },
      {
        kind: "OFFICIAL_RULE",
        id: "m2-acces-barreau",
        title: "Conditions posées au programme suivi",
        body: [
          "Les six critères précédents relèvent de votre jugement. Celui-ci n'en relève pas : pour un juriste formé hors des États-Unis, le règlement d'admission de l'État de New York pose des conditions sur le LL.M. lui-même. Un programme qui ne les remplit pas délivre un diplôme réel, apprécié, et qui n'ouvre pas l'examen. C'est le seul critère de cette liste dont l'erreur ne se rattrape pas après coup.",
          "Le règlement demande un programme d'au moins vingt-quatre crédits semestriels, réparti sur au moins deux semestres hors été de treize semaines civiles chacun au minimum, et achevé dans les vingt-quatre mois suivant l'inscription. Les crédits doivent être acquis en cours magistral, à raison d'au moins sept cents minutes d'enseignement par crédit ; l'enseignement à distance, par correspondance ou en ligne n'y compte pas.",
          "À l'intérieur de ces vingt-quatre crédits, quatre blocs sont imposés : au moins deux crédits de responsabilité professionnelle, au moins deux crédits de recherche, rédaction et analyse juridiques — un exercice de rédaction inclus dans un cours de fond ne satisfait pas cette condition —, au moins deux crédits d'introduction au système juridique américain, et au moins six crédits dans des matières qui portent principalement sur le programme de l'examen du barreau de New York.",
          "Ce que cela change concrètement : la brochure d'un programme ne suffit pas. Demandez à l'école, par écrit, si son LL.M. satisfait ces conditions pour l'année où vous vous inscrivez, et lesquels de ses cours comptent dans chaque bloc. Une école qui accueille régulièrement des juristes étrangers répondra sans hésiter — c'est en soi un signal. Vérifiez ensuite vous-même sur le texte officiel : il est court, et il évolue.",
        ],
        keyPoints: [
          "Vingt-quatre crédits minimum, sur deux semestres au moins, achevés en vingt-quatre mois.",
          "Quatre blocs imposés, dont deux crédits de responsabilité professionnelle et deux de recherche et rédaction.",
          "Aucun crédit à distance ou en ligne — à vérifier auprès de l'école pour l'année où vous candidatez.",
        ],
        source: {
          label:
            "Court of Appeals de l'État de New York — Part 520, § 520.6(b)(3) (conditions du LL.M.)",
          url: "https://www.nycourts.gov/ctapps/520rules10.htm",
          verifiedAt: "2026-08-03",
        },
      },
      {
        kind: "METHOD",
        id: "m2-lsac",
        title: "LSAC ou candidature directe",
        body: [
          "Deux voies coexistent pour candidater : le service centralisé auquel une partie des écoles est rattachée, et la candidature directe auprès de l'établissement. Certaines écoles n'acceptent qu'une des deux, d'autres les deux — cela se vérifie sur le site de chaque programme, pour l'année où vous candidatez.",
          "Le service centralisé mutualise le travail : un dossier, des relevés de notes traités une fois, des recommandations transmises à plusieurs écoles. Il ajoute en contrepartie des frais et un délai de traitement qui n'est pas de votre ressort — c'est ce délai qui piège les candidats pressés, car il s'ajoute au vôtre sans que vous puissiez l'accélérer.",
          "La candidature directe est plus rapide et moins coûteuse quand vous visez peu d'écoles, au prix d'un dossier à reconstituer pour chacune. La règle pratique : au-delà de trois ou quatre écoles rattachées au service centralisé, il devient rentable ; en deçà, la voie directe l'emporte.",
          "Quelle que soit la voie, comptez le délai de traitement des relevés de notes comme un poste de calendrier à part entière, et faites-le figurer sur votre feuille de route. C'est le point où les dossiers arrivent en retard, et le retard n'y est jamais rattrapable.",
        ],
        keyPoints: [
          "Chaque école dit laquelle des deux voies elle accepte — à vérifier pour l'année en cours.",
          "Le service centralisé devient rentable au-delà de trois ou quatre écoles.",
          "Le traitement des relevés de notes est un délai subi : il se planifie comme tel.",
        ],
      },
    ],
  },
  {
    slug: "module-3-candidatures",
    order: 3,
    title: "Candidatures et financement",
    summary:
      "CV, personal statement, recommandations, relevés de notes, traductions, candidatures et bourses.",
    published: true,
    sections: [
      {
        kind: "METHOD",
        id: "m3-cv",
        title: "Le CV au format américain",
        body: [
          "Le CV américain n'est pas une traduction du CV français : c'est un autre document, qui répond à d'autres attentes. Deux différences comptent plus que toutes les autres. La première : aucune donnée personnelle — ni photographie, ni date de naissance, ni nationalité, ni situation familiale. Leur présence signale un candidat qui n'a pas fait l'effort d'apprendre les codes, avant même qu'on lise le contenu.",
          "La seconde : on y décrit des résultats, pas des fonctions. « Chargé du suivi des contrats fournisseurs » est une description de poste ; « renégocié quarante contrats fournisseurs, réduisant le délai de paiement moyen de trente jours » est une description de travail. La première laisse le lecteur deviner ce que vous avez fait, la seconde le lui dit. Cette différence de registre est ce qui distingue le plus nettement un CV retravaillé d'un CV traduit.",
          "Tenez-vous à une page tant que votre expérience le permet, et classez du plus récent au plus ancien. Nommez vos diplômes français en français, suivis d'une explication courte entre parenthèses : chercher un équivalent américain approximatif crée une confusion que le lecteur ne peut pas lever, et vous fait perdre la spécificité qui est justement votre atout.",
          "Le coffre de documents de la plateforme est prévu pour conserver les versions successives : un CV se réécrit pour chaque famille de postes visée, et retrouver la bonne version au bon moment évite de repartir de zéro à chaque candidature.",
        ],
        keyPoints: [
          "Aucune donnée personnelle : ni photo, ni âge, ni nationalité, ni situation familiale.",
          "On décrit des résultats chiffrés, pas des intitulés de fonction.",
          "Les diplômes français se nomment en français, avec une explication — jamais un faux équivalent.",
        ],
      },
      {
        kind: "METHOD",
        id: "m3-statement",
        title: "Écrire le personal statement",
        body: [
          "Le personal statement répond à une question et une seule : pourquoi vous, pourquoi ce programme, pourquoi maintenant. Tout ce qui ne sert pas cette réponse l'affaiblit. Le défaut le plus commun n'est pas la faute de langue, c'est le texte interchangeable — celui qui pourrait être envoyé à dix écoles en changeant un nom.",
          "Une méthode qui fonctionne : commencez par écrire la dernière page, celle qui dit ce que vous ferez après. Une fois cette page écrite, le reste du texte a un point de fuite, et chaque paragraphe se juge à sa contribution à cette destination. Un texte écrit dans l'ordre inverse — parcours d'abord, projet à la fin — devient presque toujours un récit chronologique sans argument.",
          "Ancrez chaque affirmation dans un fait vérifiable. « Je m'intéresse à l'arbitrage international » ne dit rien ; « j'ai suivi le séminaire d'arbitrage de mon M2 et travaillé six mois sur un dossier CCI dans mon cabinet » dit la même chose et la prouve. Le lecteur en reçoit des centaines : il croit ce qui est étayé et oublie le reste.",
          "Faites relire par quelqu'un dont l'anglais est la langue maternelle, mais ne faites pas réécrire. Un texte lissé par une autre main perd la voix qui le rendait crédible, et cela s'entend.",
        ],
        keyPoints: [
          "Un texte qui pourrait partir à dix écoles ne convainc aucune.",
          "Écrire la fin d'abord donne au texte un point de fuite.",
          "Chaque affirmation s'appuie sur un fait vérifiable, ou disparaît.",
        ],
      },
      {
        kind: "METHOD",
        id: "m3-recommandations",
        title: "Demander des recommandations utiles",
        body: [
          "Une recommandation utile est écrite par quelqu'un qui vous a vu travailler. Le titre de son auteur compte beaucoup moins que la précision de ce qu'il peut dire. Une lettre d'un professeur qui a dirigé votre mémoire vaut mieux qu'une lettre d'un associé prestigieux qui vous a croisé trois fois — la seconde se reconnaît immédiatement à sa généralité.",
          "Demandez tôt, et demandez bien. « Tôt » veut dire au moins deux mois avant l'échéance : un recommandant pressé écrit une lettre générique, et vous n'aurez aucun moyen de le savoir. « Bien » veut dire fournir un dossier — votre CV, le projet, les programmes visés, et deux ou trois faits précis que vous aimeriez voir mentionnés. Ce n'est pas dicter la lettre : c'est donner de la matière à quelqu'un qui vous soutient et dispose de peu de temps.",
          "Prévoyez une recommandation de plus que le nombre demandé. Les désistements tardifs sont fréquents, et une candidature bloquée par une lettre manquante l'est pour tout le cycle. La feuille de route de la plateforme place ces demandes suffisamment en amont pour que ce délai existe réellement.",
        ],
        keyPoints: [
          "La précision du recommandant compte plus que son titre.",
          "Deux mois d'avance, plus un dossier de matière : sinon la lettre sera générique.",
          "Toujours une lettre de plus que le nombre demandé.",
        ],
      },
      {
        kind: "METHOD",
        id: "m3-bourses",
        title: "Calendrier et stratégie de bourses",
        body: [
          "Le financement se joue en même temps que les candidatures, jamais après. C'est l'erreur de calendrier la plus coûteuse du parcours : découvrir en avril qu'une aide se demandait en novembre ne se rattrape pas, et fait perdre un cycle entier à un dossier par ailleurs solide.",
          "Construisez le calendrier à rebours, dans l'ordre inverse de la lecture : partez de la rentrée visée, remontez à la date de réponse des écoles, puis aux dates limites de chaque dossier de financement. Chaque source a son propre calendrier, indépendant de celui des écoles — aides des établissements, dispositifs publics français, fondations privées, prêts bancaires. Il n'existe pas de date unique à retenir, ce qui est précisément pourquoi il faut une liste écrite.",
          "Vérifiez chaque date sur le site de l'organisme concerné, l'année où vous candidatez. Les calendriers évoluent, et une date recopiée d'un forum ou d'un témoignage de l'année précédente est une date que personne ne garantit. C'est la règle que suit la plateforme pour ses propres contenus : rien qui énonce une procédure officielle n'y figure sans sa source et sa date de vérification.",
          "Traitez enfin les accords entre votre université et des law schools américaines comme une source de financement à part entière : ils portent parfois sur les frais de scolarité eux-mêmes, ce qui pèse davantage que la plupart des bourses. La plateforme les détecte à partir de votre université, et le simulateur de coût les intègre à ses scénarios.",
        ],
        keyPoints: [
          "Le financement se prépare avec les candidatures, pas après les réponses.",
          "Calendrier construit à rebours de la rentrée visée, une ligne par organisme.",
          "Chaque date se vérifie à la source, pour l'année où vous candidatez.",
        ],
      },
    ],
  },
  {
    slug: "module-4-immigration",
    order: 4,
    title: "Panorama migratoire",
    summary:
      "F-1, OPT, H-1B, O-1, L-1, sponsoring, limites et erreurs courantes. Information générale uniquement.",
    published: false,
    sections: [
      {
        kind: "OFFICIAL_RULE",
        id: "m4-statuts",
        title: "Panorama des statuts d'études et de travail",
        body: [
          "Trois familles de statuts jalonnent ce parcours, et elles ne se ressemblent pas. Le statut d'étudiant couvre la durée des études : il repose sur un document délivré par l'établissement, l'école devant être habilitée à le délivrer et l'inscription enregistrée dans le système fédéral de suivi des étudiants. L'école produit le document ; elle n'accorde pas le statut, et cette distinction est la première à comprendre.",
          "Vient ensuite l'autorisation de travailler après les études, adossée au statut d'étudiant et liée au domaine de formation. Elle suppose une recommandation du responsable désigné de l'établissement, puis une autorisation de l'administration fédérale : deux étapes, deux délais, et un ordre qu'on ne peut pas inverser. Elle est limitée dans le temps et dans son objet — ce n'est pas un statut de travail, c'est un prolongement encadré du statut d'étudiant.",
          "La troisième famille est celle des statuts de travail proprement dits. Ils ne se demandent pas soi-même : c'est l'employeur qui dépose la demande, et le statut le plus courant pour ce type de poste est contingenté — le nombre de places annuelles est plafonné et l'accès passe par un tirage au sort. Autrement dit, une offre d'emploi ne vaut pas statut, et le calendrier de l'employeur devient le vôtre.",
          "Ces règles évoluent, parfois vite : une règle finale publiée en juillet 2026 a modifié la durée d'admission des étudiants, désormais fixée d'après la durée du programme figurant sur le document d'inscription. C'est exactement pourquoi ce module ne vous donne ni formulaire, ni délai, ni montant : il vous donne la carte des autorités et des dépendances, et vous renvoie au texte officiel pour tout chiffre. Un chiffre recopié ici serait faux un jour, sans que rien ne le signale.",
        ],
        keyPoints: [
          "L'école délivre un document, elle n'accorde pas le statut — l'administration fédérale décide.",
          "L'autorisation de travail post-études suppose deux étapes successives, chacune avec son délai.",
          "Un statut de travail est demandé par l'employeur, et le principal est contingenté par tirage au sort.",
        ],
        source: {
          label:
            "U.S. Citizenship and Immigration Services — Students and Employment (statuts d'études, formation pratique, emploi)",
          url: "https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/students-and-employment",
          verifiedAt: "2026-08-03",
        },
      },
      {
        kind: "METHOD",
        id: "m4-erreurs",
        title: "Erreurs de séquencement les plus fréquentes",
        body: [
          "Les difficultés migratoires de ce parcours viennent rarement d'une règle mal comprise. Elles viennent presque toujours d'un ordre d'opérations : une démarche engagée trop tard, ou engagée avant celle dont elle dépend. Cette section ne dit pas quelles sont les règles — c'est l'objet de la section précédente, qui porte sa source — mais comment éviter que le calendrier ne décide à votre place.",
          "La première erreur est de traiter les démarches administratives comme une formalité de fin de parcours. Elles ont leurs propres délais, indépendants de votre disponibilité et de votre diligence, et ces délais s'additionnent à ceux des écoles plutôt que de s'y superposer. Une démarche engagée le jour de l'admission arrive parfois après la rentrée.",
          "La deuxième est de laisser la recherche d'emploi et les démarches de statut avancer séparément, chacune en attendant l'autre. C'est le blocage le plus coûteux du parcours, parce qu'il ne se voit qu'au moment où il est trop tard pour le défaire.",
          "La méthode tient en deux gestes. Écrivez la liste des démarches dans l'ordre où elles se conditionnent, en notant pour chacune ce qu'elle exige d'obtenu au préalable. Puis, pour chaque délai que vous ne maîtrisez pas, ajoutez une marge explicite plutôt qu'un espoir. La feuille de route de la plateforme porte ces jalons ; à vous d'y inscrire les marges.",
        ],
        keyPoints: [
          "Le problème est presque toujours l'ordre des démarches, pas la règle elle-même.",
          "Les délais administratifs s'ajoutent à ceux des écoles, ils ne s'y superposent pas.",
          "Chaque délai non maîtrisé mérite une marge écrite, pas un espoir.",
        ],
      },
      {
        kind: "METHOD",
        id: "m4-limites",
        title: "Ce que ce module ne peut pas faire pour vous",
        body: [
          "Ce module décrit un cadre et une méthode. Il ne se substitue pas à l'avis d'un professionnel du droit de l'immigration, et il ne peut pas trancher votre cas : les situations individuelles font intervenir des éléments — antécédents, nationalité, séjours antérieurs, situation familiale — qu'aucun contenu général ne peut apprécier.",
          "La règle que suit ce module est celle de toute la plateforme : rien qui énonce une procédure d'autorité n'y figure sans sa source et sa date de vérification. Vous verrez donc, dans la section correspondante, un lien vers le texte officiel plutôt qu'un résumé qui vous dispenserait de le lire. C'est délibéré : ces règles évoluent, et un résumé périmé est plus dangereux qu'une absence de résumé, parce qu'il a l'air d'une réponse.",
          "Appliquez la même exigence à ce que vous lirez ailleurs. Un témoignage sur un forum décrit ce qui s'est passé pour quelqu'un, à une date donnée, dans une situation que vous ne connaissez pas entièrement. C'est utile pour savoir quelles questions poser ; ce n'est jamais une réponse à votre cas.",
        ],
        keyPoints: [
          "Ce module ne remplace pas l'avis d'un professionnel sur votre situation.",
          "Un résumé périmé est plus dangereux qu'une absence de résumé.",
          "Un témoignage sert à formuler des questions, pas à conclure.",
        ],
      },
    ],
  },
  {
    slug: "module-5-bole",
    order: 5,
    title: "Dossier d'évaluation et conditions d'accès à l'examen",
    summary:
      "Évaluation préalable, pièces à réunir, communication avec l'autorité, échéances et responsabilités.",
    published: false,
    sections: [
      {
        kind: "METHOD",
        id: "m5-principe",
        title: "Pourquoi une évaluation préalable",
        body: [
          "Un juriste formé hors des États-Unis ne s'inscrit pas directement à un examen du barreau : sa formation doit d'abord être examinée par l'autorité compétente de l'État visé, qui apprécie si elle satisfait les conditions posées. Cette étape est un dossier à constituer, avec ses pièces, ses délais et son propre calendrier — les conditions elles-mêmes sont énoncées dans les sections suivantes, qui portent leurs sources.",
          "Comprendre le principe change la façon de mener le parcours. L'évaluation ne se prépare pas après le diplôme : une partie des pièces concerne vos études françaises et se demande d'autant plus facilement que vous êtes encore en lien avec votre université. Un candidat qui s'y prend deux ans après avoir quitté sa faculté passe plusieurs mois à retrouver des documents qu'il aurait obtenus en quelques jours à l'époque.",
          "Retenez surtout que la décision n'est pas la vôtre et qu'elle prend du temps. Vous ne pouvez pas la précipiter ; vous pouvez seulement déposer un dossier complet, tôt, et bâtir votre calendrier en supposant que la réponse arrivera tard plutôt que tôt.",
        ],
        keyPoints: [
          "L'évaluation est une étape à part entière, avec son dossier et son calendrier.",
          "Les pièces relatives aux études françaises s'obtiennent plus facilement tôt.",
          "La seule variable que vous maîtrisez est la date de dépôt.",
        ],
      },
      {
        kind: "OFFICIAL_RULE",
        id: "m5-conditions",
        title: "Conditions posées à la formation d'origine",
        body: [
          "L'évaluation porte d'abord sur vos études d'origine, avant tout LL.M. Le règlement les mesure sur deux plans distincts, et c'est leur articulation qui décide de tout. Le premier est la durée : la formation doit être substantiellement équivalente, en volume, à celle d'une law school américaine agréée — au moins quatre-vingt-trois crédits de matières juridiques, dont soixante-quatre acquis en cours magistraux régulièrement programmés.",
          "Le second est le fond : le pays de formation doit relever d'un système dont la jurisprudence est fondée sur les principes de la common law anglaise, et le programme suivi doit être substantiellement équivalent à celui d'une law school agréée. Une formation civiliste — c'est le cas de la formation française — ne remplit pas cette seconde condition.",
          "Vient alors la règle qui commande la suite : une déficience peut être corrigée par un LL.M. conforme, mais une seule. Un candidat dont la formation satisfait la durée mais pas le fond peut régulariser par le LL.M. ; celui dont la formation manque aussi la durée ne le peut pas. Pour un diplôme français, le LL.M. étant consommé par la régularisation du fond, le seuil de crédits doit être atteint par le seul diplôme d'origine.",
          "Un régime distinct existe pour les juristes déjà admis à un barreau étranger, lorsque leur admission repose sur une combinaison d'études et de formation pratique en cabinet. Il suppose lui aussi un LL.M. américain : il n'ouvre aucune voie qui s'en passerait. Dans tous les cas, l'appréciation appartient au seul New York State Board of Law Examiners, dossier par dossier — rien de ce qui précède ne préjuge de ce qu'il décidera du vôtre.",
        ],
        keyPoints: [
          "Deux conditions distinctes : la durée (83 crédits, dont 64 en cours magistraux) et le fond.",
          "Une seule déficience peut être corrigée par un LL.M. conforme, jamais les deux.",
          "L'appréciation est individuelle et appartient au Board, quelles que soient les apparences du dossier.",
        ],
        source: {
          label:
            "Court of Appeals de l'État de New York — Part 520, § 520.6(b)(1) et (b)(2) (formation étrangère)",
          url: "https://www.nycourts.gov/ctapps/520rules10.htm",
          verifiedAt: "2026-08-03",
        },
      },
      {
        kind: "OFFICIAL_RULE",
        id: "m5-pieces",
        title: "Pièces exigées et forme attendue",
        body: [
          "L'ordre des opérations est ici une règle, pas un conseil. Il faut d'abord ouvrir un compte auprès du Board et remplir en ligne le formulaire de demande d'évaluation ; les documents envoyés avant cette ouverture ne sont pas conservés, faute de dossier auquel les rattacher. Un envoi anticipé, fait de bonne foi, se traduit donc par des pièces perdues et un délai à recommencer.",
          "La pièce centrale est le relevé de notes définitif et officiel, transmis directement par chaque établissement fréquenté. Il doit faire apparaître, pour chaque période d'études, les dates de scolarité, les matières suivies et validées, les notes et le nombre de crédits. Un relevé transmis par vous, ou incomplet sur l'un de ces points, ne remplit pas la condition. S'y ajoutent le diplôme lui-même et, pour la voie des avocats déjà admis, le certificat d'admission délivré par l'autorité étrangère compétente.",
          "Tout document qui n'est pas en anglais doit être accompagné d'une traduction certifiée. Et si le relevé ne suffit pas à établir l'équivalence de la formation, le Board demandera des pièces complémentaires à l'établissement — décompte de crédits, volumes horaires, description des enseignements. Anticipez ce second tour : c'est celui qui prend le plus de temps, parce qu'il dépend d'un tiers que vous ne pilotez pas.",
          "Les délais annoncés commandent votre calendrier. Pour la voie qui suppose un LL.M., la décision peut demander jusqu'à six mois à compter de la réception de l'ensemble des pièces — à compter de la dernière, donc, et non de la première. Pour la voie sans LL.M., le Board recommande de déposer au moins six mois avant l'ouverture de la période d'inscription à l'examen visé. Ces six mois se comptent à rebours, et la section suivante montre comment.",
        ],
        keyPoints: [
          "Ouvrir le compte et le formulaire d'abord : les pièces envoyées avant ne sont pas conservées.",
          "Relevés définitifs transmis directement par l'établissement, traduction certifiée si besoin.",
          "Jusqu'à six mois à compter de la RÉCEPTION DE LA DERNIÈRE pièce, pas du premier envoi.",
        ],
        source: {
          label:
            "New York State Board of Law Examiners — Foreign Legal Education (pièces, forme et délais)",
          url: "https://www.nybarexam.org/foreign/foreignlegaleducation.htm",
          verifiedAt: "2026-08-03",
        },
      },
      {
        kind: "METHOD",
        id: "m5-calendrier",
        title: "Reconstituer son calendrier à rebours",
        body: [
          "Un calendrier de parcours se construit toujours dans le sens inverse de son déroulement. Partez de la session d'examen que vous visez, puis remontez : date à laquelle l'évaluation doit être rendue, date de dépôt du dossier, dates d'obtention de chaque pièce, dates de demande de ces pièces. Chaque étape hérite de la contrainte de la suivante, jamais l'inverse.",
          "Cette construction met en évidence la seule information qui compte à ce stade : la date après laquelle il devient impossible de tenir la session visée. Tant que vous n'avez pas écrit cette date, vous ne savez pas si votre projet tient — vous savez seulement qu'il n'est pas encore démenti.",
          "Deux précautions rendent le calendrier utilisable. Distinguez ce que vous maîtrisez de ce que vous subissez : une pièce que vous rédigez et une pièce qu'un tiers vous délivre n'appellent pas la même marge. Et vérifiez chaque date d'échéance officielle à sa source, pour l'année où vous candidatez — une date recopiée d'un témoignage de l'an dernier n'engage personne.",
          "La feuille de route de la plateforme fait ce calcul à rebours à partir de la rentrée que vous déclarez, et projette les échéances sur un axe où l'on voit ce qui est en retard, ce qui approche et ce qui reste à commencer.",
        ],
        keyPoints: [
          "On part de la session visée et on remonte, jamais l'inverse.",
          "La date qui compte est celle après laquelle la session n'est plus tenable.",
          "Une pièce délivrée par un tiers appelle une marge que vous n'êtes pas seul à tenir.",
        ],
      },
      {
        kind: "METHOD",
        id: "m5-tiers",
        title: "Obtenir des pièces qui dépendent de tiers",
        body: [
          "La difficulté d'un dossier d'évaluation n'est pas de le remplir : c'est d'obtenir des documents que d'autres détiennent — scolarité de votre université, traducteurs assermentés, anciens employeurs. Ces délais ne dépendent pas de votre organisation, et c'est précisément pourquoi ils doivent être engagés en premier.",
          "Trois pratiques réduisent le risque. Demandez par écrit, avec un objet précis et la date à laquelle il vous faut la pièce : une demande sans échéance est traitée après celles qui en portent une. Demandez plus tôt que nécessaire, en tenant compte des périodes où les services universitaires sont fermés ou réduits. Et relancez une fois, poliment, à une date que vous avez notée au moment de la demande — pas quand vous y repensez.",
          "Conservez chaque pièce obtenue au format exigé dès sa réception, plutôt qu'au moment du dépôt. Le coffre de documents de la plateforme est prévu pour cela : il suit ce que vous avez, ce que vous attendez, et ce qui reste à demander. Un dossier qui échoue pour une pièce égarée échoue pour la raison la plus évitable de tout le parcours.",
        ],
        keyPoints: [
          "Les pièces détenues par des tiers s'engagent en premier, pas en dernier.",
          "Une demande écrite avec une échéance passe avant une demande sans date.",
          "Chaque pièce se range au format attendu dès sa réception.",
        ],
      },
    ],
  },
  {
    slug: "module-6-bar",
    order: 6,
    title: "Préparation de l'examen du barreau",
    summary: "UBE, MBE, MEE, MPT, épreuves complémentaires, prestataires et planning de révision.",
    published: false,
    sections: [
      {
        kind: "OFFICIAL_RULE",
        id: "m6-epreuves",
        title: "Structure de l'examen et épreuves complémentaires",
        body: [
          "L'examen de New York est l'examen uniforme du barreau, composé de trois épreuves passées ensemble dans la même juridiction. L'épreuve à choix multiples compte pour la moitié de la note : deux cents questions, six heures. Les six questions rédigées de trente minutes comptent pour trois dixièmes. Les deux exercices pratiques de quatre-vingt-dix minutes comptent pour les deux dixièmes restants. Le score requis à New York est de 266.",
          "Cette structure a une conséquence directe sur la préparation, et c'est la raison d'être de cette section : la moitié de la note se joue sur une épreuve à choix multiples, et les quatre dixièmes qui restent sur des exercices de rédaction et de méthode. Un plan de révision qui consacrerait tout son temps à apprendre des règles ignorerait la moitié de ce qui est mesuré.",
          "Trois épreuves complémentaires s'ajoutent, et elles se passent séparément. Un cours en ligne consacré au droit propre à l'État, d'environ dix-sept heures d'enregistrements avec questions intégrées, doit être suivi. L'examen qui lui correspond compte cinquante questions à choix multiples, dure deux heures, se passe en ligne, à livre ouvert, et demande 30 bonnes réponses. S'y ajoute l'examen national de responsabilité professionnelle, dont le score requis à New York est de 85.",
          "Ces trois-là ne suivent pas le calendrier de l'examen principal, et c'est précisément ce qui les fait oublier. Placez-les sur votre calendrier dès maintenant, à leurs propres dates. Enfin, une échéance commande tout le reste : la demande d'admission doit être déposée dans les trois ans suivant le second jour de l'examen uniforme — passé ce délai, un examen réussi ne mène plus à l'admission.",
        ],
        keyPoints: [
          "Trois épreuves pondérées 50 / 30 / 20 : réviser les règles seules ignore la moitié de la note.",
          "Trois épreuves complémentaires, à leurs propres dates : cours d'État, examen d'État, responsabilité professionnelle.",
          "Trois ans depuis le second jour de l'examen pour déposer la demande d'admission.",
        ],
        source: {
          label:
            "New York State Board of Law Examiners — Uniform Bar Examination, NYLC, NYLE et MPRE",
          url: "https://www.nybarexam.org/ube/ube.html",
          verifiedAt: "2026-08-03",
        },
      },
      {
        kind: "METHOD",
        id: "m6-prestataires",
        title: "Choisir un programme de préparation",
        body: [
          "Les programmes commerciaux de préparation à l'examen se ressemblent davantage qu'ils ne le prétendent : même matière, même logique d'entraînement massif. Ce qui les distingue utilement pour un candidat étranger tient à trois choses — la place faite aux fondamentaux que les diplômés américains ont acquis pendant trois ans, la qualité de la correction des épreuves rédigées, et le rythme imposé.",
          "Le premier point est le plus important et le moins mis en avant. Un programme conçu pour des diplômés de JD suppose acquis un socle que votre formation française n'a pas eu à construire. Demandez explicitement ce qui est prévu pour les candidats formés à l'étranger : une réponse vague sur ce point est un signal suffisant.",
          "Sur la correction, cherchez une correction individualisée et argumentée plutôt qu'une note. Progresser sur une épreuve rédigée suppose de comprendre l'écart entre ce que vous avez écrit et ce qui était attendu ; un score seul ne l'apprend pas.",
          "Attention enfin au calendrier : ces programmes s'alignent sur les sessions d'examen, et s'y inscrire tard signifie commencer en retard sur un rythme déjà tendu. La structure de l'examen et ses épreuves sont décrites dans la section qui porte sa source.",
        ],
        keyPoints: [
          "Le critère décisif : ce qui est prévu pour les candidats formés hors des États-Unis.",
          "Une correction argumentée vaut mieux qu'un score.",
          "S'inscrire tard, c'est commencer en retard sur un rythme déjà tendu.",
        ],
      },
      {
        kind: "METHOD",
        id: "m6-planning",
        title: "Construire un planning de révision tenable",
        body: [
          "Un planning de révision échoue presque toujours de la même façon : il est construit pour un candidat qui ne tombe pas malade, ne prend pas de retard et ne travaille pas à côté. Au premier écart, il devient faux, et un planning faux cesse d'être consulté — c'est ainsi qu'on se retrouve sans plan trois semaines avant l'épreuve.",
          "Construisez-le donc avec du jeu délibéré : une demi-journée par semaine sans contenu prévu, qui absorbe les retards, et une semaine entière en réserve avant l'échéance. Ce n'est pas du temps perdu, c'est ce qui rend le reste crédible. Un plan tenu à quatre-vingts pour cent vaut infiniment mieux qu'un plan parfait abandonné au bout d'un mois.",
          "Raisonnez en séances plutôt qu'en heures. Une séance a un objet, un support et un résultat vérifiable — « traiter et corriger deux cas pratiques sur tel thème » plutôt que « réviser trois heures ». La quantité d'heures ne dit rien de ce qui a été acquis, et c'est la mesure qui trompe le plus.",
          "Si vous travaillez en parallèle, dimensionnez sur les semaines chargées, pas sur les semaines calmes. Un plan calibré sur vos meilleures semaines est un plan que vous ne tiendrez pas.",
        ],
        keyPoints: [
          "Du jeu délibéré : une demi-journée par semaine, une semaine en réserve.",
          "On planifie des séances à objet vérifiable, pas des heures.",
          "Dimensionner sur les semaines chargées, jamais sur les calmes.",
        ],
      },
      {
        kind: "METHOD",
        id: "m6-methode",
        title: "Méthode d'entraînement et correction",
        body: [
          "La révision passive — relire, surligner, réécouter — donne un sentiment de progression sans en produire. L'entraînement actif, lui, consiste à produire une réponse dans les conditions de l'épreuve puis à la confronter à ce qui était attendu. C'est inconfortable, et c'est ce qui fait la différence.",
          "Adoptez tôt un rythme simple : produire, corriger, noter l'écart, refaire plus tard sur le même thème. La troisième étape est celle que tout le monde saute. Tenez une liste de vos erreurs récurrentes — non pas « je ne connais pas ce point », mais « je conclus avant d'avoir qualifié », « j'oublie l'exception ». Ces erreurs de méthode coûtent plus de points que les lacunes de connaissance, et elles se corrigent plus vite.",
          "Travaillez en temps limité dès le début, même quand vous vous sentez mal préparé. Une réponse moyenne produite dans le temps imparti vous apprend davantage qu'une excellente réponse écrite en deux fois plus de temps : c'est la première qui ressemble à ce que vous ferez le jour de l'épreuve.",
          "Pour un candidat formé en France, un point mérite une attention particulière : l'attente de rédaction diffère de celle des exercices français. Faire relire vos premières productions par quelqu'un qui connaît l'exercice attendu vous épargne des semaines de travail dans la mauvaise direction.",
        ],
        keyPoints: [
          "Produire puis confronter, jamais relire.",
          "Tenir la liste de ses erreurs de MÉTHODE, pas seulement de ses lacunes.",
          "Travailler en temps limité dès le premier jour.",
        ],
      },
    ],
  },
  {
    slug: "module-7-admission",
    order: 7,
    title: "Admission",
    summary: "Character and Fitness, pièces, références, prestation de serment et formation continue.",
    published: false,
    sections: [
      {
        kind: "OFFICIAL_RULE",
        id: "m7-procedure",
        title: "Étapes de la procédure d'admission",
        body: [
          "Réussir l'examen n'admet pas au barreau : c'est une condition, et l'admission est une procédure distincte, devant une autre autorité. La demande se dépose auprès du département compétent de l'Appellate Division, et non auprès du Board qui a organisé l'examen. Le délai est de trois ans à compter du second jour de l'examen uniforme, que vous l'ayez passé à New York ou ailleurs.",
          "Tout candidat fait l'objet d'une enquête de moralité et d'aptitude. Elle porte sur le parcours déclaré et sur les personnes qui répondent de vous, et son instruction prend du temps — c'est elle, bien plus que l'examen, qui détermine la date réelle de la prestation de serment.",
          "Deux conditions se préparent des années à l'avance et se découvrent souvent trop tard. La première : cinquante heures de travail bénévole qualifiant doivent être accomplies AVANT le dépôt de la demande, après le début des études juridiques, et peuvent l'être dans n'importe quel État américain comme à l'étranger. Elles se justifient par une attestation décrivant la nature et les dates du service, certifiée par l'avocat ou le magistrat qui vous a encadré.",
          "La seconde vise les candidats ayant commencé leurs études de droit après le 1er août 2016 : ils doivent établir qu'ils ont acquis les compétences pratiques et la connaissance des valeurs de la profession nécessaires pour exercer. Le règlement ouvre cinq voies distinctes pour l'établir. Choisissez la vôtre pendant vos études, pas après : plusieurs de ces voies supposent des enseignements ou une expérience qui ne se rattrapent pas une fois le diplôme obtenu.",
        ],
        keyPoints: [
          "La demande se dépose devant l'Appellate Division, pas devant le Board — dans les trois ans.",
          "Cinquante heures de bénévolat qualifiant AVANT le dépôt, attestées par un avocat ou un magistrat.",
          "La condition de compétences pratiques se prépare pendant les études : cinq voies, à choisir tôt.",
        ],
        source: {
          label:
            "New York State Board of Law Examiners — Admission Information ; Part 520, § 520.16 (pro bono) et § 520.18 (compétences pratiques)",
          url: "https://www.nybarexam.org/admission/admission.htm",
          verifiedAt: "2026-08-03",
        },
      },
      {
        kind: "METHOD",
        id: "m7-references",
        title: "Réunir ses références en amont",
        body: [
          "La procédure d'admission — décrite dans la section qui porte sa source — suppose de réunir des attestations émanant de personnes qui vous ont connu professionnellement, parfois sur plusieurs années et plusieurs pays. C'est la partie du dossier qui prend le plus de temps, et la seule dont le rythme ne dépend pas de vous.",
          "Anticipez en tenant à jour, dès le début du parcours, une liste de vos employeurs, encadrants et confrères, avec leurs coordonnées personnelles — pas seulement l'adresse professionnelle du moment. Les gens changent de poste, les cabinets fusionnent, les adresses disparaissent : retrouver dans cinq ans le maître de stage de votre M2 est un travail que vous vous épargnez en notant son contact aujourd'hui.",
          "Prévenez ces personnes avant qu'on les sollicite. Une demande officielle qui arrive sans préavis reste souvent plusieurs semaines en attente, et vous n'en saurez rien. Un message de deux lignes annonçant la démarche suffit à transformer un délai subi en délai maîtrisé.",
          "Rangez ces informations là où vous les retrouverez : le coffre de documents de la plateforme est prévu pour ce suivi, avec les pièces qui l'accompagnent.",
        ],
        keyPoints: [
          "La liste des personnes se tient à jour dès le début, avec des contacts durables.",
          "Prévenir avant la sollicitation officielle transforme un délai subi en délai maîtrisé.",
          "C'est la partie du dossier dont le rythme dépend le moins de vous.",
        ],
      },
    ],
  },
  {
    slug: "module-8-autres-barreaux",
    order: 8,
    title: "Autres barreaux et équivalences",
    summary: "UBE, Californie, autres juridictions, France et Europe.",
    published: false,
    sections: [
      {
        kind: "METHOD",
        id: "m8-comparer",
        title: "Comparer les juridictions sur les bons critères",
        body: [
          "New York n'est pas la seule juridiction ouverte aux juristes formés à l'étranger, et elle n'est pas toujours la plus pertinente. Comparer suppose d'abord de savoir sur quoi comparer : les conditions posées à votre formation d'origine, la charge de préparation, le coût total, et surtout l'utilité réelle du résultat pour le marché que vous visez.",
          "Ce dernier critère est celui qu'on oublie. Un examen réussi dans une juridiction où vous n'exercerez jamais a une valeur de signal, parfois appréciable, mais il ne vous ouvre pas de porte par lui-même. Posez-vous la question dans l'autre sens : quelle est la juridiction dont l'admission changerait quelque chose à ce que je ferai dans trois ans ?",
          "La méthode : une ligne par juridiction envisagée, quatre colonnes pour les critères ci-dessus, et la source officielle en regard de chaque condition. Les conditions elles-mêmes ne se déduisent d'aucune généralité — chaque juridiction a les siennes, elles évoluent, et la section suivante traite ce point avec sa source.",
          "Écartez enfin l'idée qu'une juridiction serait « plus facile ». Ce qui varie n'est pas la difficulté mais la nature des conditions posées : telle juridiction sera plus accessible à un profil et fermée à un autre.",
        ],
        keyPoints: [
          "Le critère décisif est l'utilité du résultat pour le marché visé, pas la difficulté.",
          "Une ligne par juridiction, une source officielle en regard de chaque condition.",
          "« Plus facile » n'existe pas : les conditions diffèrent, pas le niveau.",
        ],
      },
      {
        kind: "OFFICIAL_RULE",
        id: "m8-transfert",
        title: "Portée d'un résultat d'examen entre juridictions",
        body: [
          "L'examen uniforme du barreau se passe une fois et produit un score transférable vers d'autres juridictions qui l'administrent. C'est réel, et c'est ce qui rend le sujet intéressant. Mais « transférable » ne veut pas dire « reconnu » : chaque juridiction fixe elle-même le score qu'elle exige, et fixe aussi l'ancienneté maximale d'un score qu'elle accepte de recevoir.",
          "Deux conséquences en découlent, et ce sont elles qui décident. La première : un score qui suffit dans une juridiction peut ne pas suffire dans une autre, sans que rien n'ait changé au vôtre. La seconde : un score parfaitement suffisant devient inutilisable une fois passée la limite d'ancienneté de la juridiction visée. Un transfert se prépare donc avant de passer l'examen, en regardant les seuils de la juridiction d'arrivée.",
          "L'enquête de moralité et d'aptitude, elle, ne se transfère pas : chaque juridiction conduit la sienne. Un transfert de score épargne l'examen, jamais la procédure d'admission.",
          "Une limite pèse spécifiquement sur les juristes formés à l'étranger, et il faut la connaître avant de bâtir un plan : certaines juridictions n'admettent que les diplômés de law schools américaines agréées, si bien qu'un score obtenu ailleurs ne leur ouvre rien. La Californie, souvent citée comme seconde destination, n'accepte quant à elle aucun score transféré — ni de l'examen uniforme, ni de son épreuve à choix multiples. Y exercer suppose de passer son examen propre, selon ses règles propres.",
        ],
        keyPoints: [
          "Chaque juridiction fixe son score requis ET l'ancienneté maximale d'un score transféré.",
          "L'enquête de moralité se refait à chaque fois : le transfert épargne l'examen, pas l'admission.",
          "La Californie n'accepte aucun score transféré ; d'autres n'admettent que les diplômés américains.",
        ],
        source: {
          label:
            "National Conference of Bar Examiners — Transferring Your UBE Scores (portabilité, seuils et ancienneté)",
          url: "https://www.ncbex.org/exams/ube/ube-score-portability",
          verifiedAt: "2026-08-03",
        },
      },
      {
        kind: "METHOD",
        id: "m8-france",
        title: "Retour en France et exercice en Europe",
        body: [
          "Le retour vers un exercice en France ou en Europe suit des règles propres, qui ne se déduisent ni du parcours américain ni de votre formation initiale. Elles dépendent de votre situation exacte — diplôme d'origine, admission éventuelle à un barreau, expérience acquise — et elles se vérifient auprès de l'autorité compétente, jamais auprès d'un témoignage.",
          "Ce que ce module peut vous dire relève de la méthode : posez la question tôt, avant le départ plutôt qu'au retour. La réponse conditionne des choix qui se prennent en amont — le moment de passer un examen, l'opportunité de s'inscrire à un barreau, la durée de séjour utile. Découvrir au retour qu'une démarche aurait dû être engagée avant coûte parfois une année entière.",
          "Formulez votre question par écrit, avec votre situation précise, et adressez-la à l'autorité compétente. Une réponse officielle sur votre cas vaut mieux qu'une centaine de récits sur des cas voisins — et elle vous laisse une trace opposable, ce qu'un forum ne fournit jamais.",
        ],
        keyPoints: [
          "Ces règles ne se déduisent pas du parcours américain : elles se demandent.",
          "La question se pose avant le départ, car elle conditionne des choix en amont.",
          "Une réponse écrite de l'autorité compétente vaut mieux que cent témoignages.",
        ],
      },
    ],
  },
  {
    slug: "module-9-recherche",
    order: 9,
    title: "Recherche de stage et d'emploi",
    summary: "Networking, alumni, cold emails, CV américain, LinkedIn, entretiens et suivi des candidatures.",
    published: true,
    sections: [
      {
        kind: "METHOD",
        id: "m9-reseau",
        title: "Le réseau comme travail, pas comme hasard",
        body: [
          "Sur le marché américain, une part importante des recrutements ne passe jamais par une annonce. Ce constat est souvent reçu comme une injustice ; c'est plutôt une information exploitable, parce qu'un canal informel se travaille méthodiquement dès lors qu'on cesse d'attendre qu'il produise de la chance.",
          "La méthode tient en une phrase : un nombre restreint de conversations réelles vaut mieux qu'un grand nombre de contacts nominaux. Visez quelques échanges par semaine, préparés, avec des personnes dont le parcours ressemble au vôtre — des juristes formés hors des États-Unis, passés par un LL.M., et aujourd'hui à un poste qui vous intéresse. Ce sont eux qui peuvent vous dire ce qui a fonctionné, et surtout ce qui n'a pas fonctionné.",
          "Le réseau des anciens de votre programme est le point de départ le plus rentable : l'appartenance commune suffit à justifier une prise de contact, ce qui lève l'obstacle principal. Vient ensuite le réseau français aux États-Unis — associations professionnelles, chambres de commerce, cercles d'anciens des universités françaises — dont la logique de solidarité joue en votre faveur.",
          "Commencez pendant l'année, pas après le diplôme. Un contact pris quand vous n'avez rien à demander est un contact disponible quand vous aurez quelque chose à demander. L'ordre inverse fonctionne mal, et se voit.",
        ],
        keyPoints: [
          "Quelques conversations préparées valent mieux qu'un carnet d'adresses.",
          "Les anciens du programme sont le point d'entrée le moins coûteux.",
          "Un contact pris sans rien demander sera disponible plus tard.",
        ],
      },
      {
        kind: "METHOD",
        id: "m9-coldmail",
        title: "Écrire un cold email auquel on répond",
        body: [
          "Un message à un inconnu obtient une réponse quand il est court, précis, et qu'il demande peu. Trois paragraphes suffisent : qui vous êtes en une phrase, pourquoi vous écrivez à cette personne-là en particulier, et une demande unique, facile à satisfaire.",
          "La deuxième phrase est celle qui décide. Elle doit prouver que vous avez fait un travail préalable : un article que la personne a écrit, un dossier sur lequel elle a travaillé, un parcours proche du vôtre. Sans elle, votre message est indiscernable des dizaines d'autres qu'elle reçoit, et il sera traité comme tel.",
          "Demandez une conversation de vingt minutes, pas un emploi. La différence est décisive : la première demande est facile à accepter et coûte peu, la seconde met votre interlocuteur en position de vous refuser quelque chose — ce que la plupart des gens évitent en ne répondant pas. Un poste se propose parfois au bout de la conversation, jamais au bout du premier message.",
          "Relancez une fois, une seule, après une dizaine de jours. L'absence de réponse est presque toujours une question de charge de travail, pas un refus ; mais deux relances transforment une non-réponse en refus explicite.",
        ],
        keyPoints: [
          "Trois paragraphes : qui vous êtes, pourquoi cette personne, une demande unique.",
          "Demander vingt minutes, jamais un emploi.",
          "Une relance après dix jours, et pas davantage.",
        ],
      },
      {
        kind: "METHOD",
        id: "m9-entretiens",
        title: "Entretiens américains : codes et préparation",
        body: [
          "L'entretien américain valorise ce que l'entretien français tempère : parler de ses résultats en son nom propre. Dire « j'ai obtenu » là où vous diriez spontanément « nous avons obtenu » n'est pas de l'arrogance dans ce contexte, c'est la réponse attendue à la question posée. Beaucoup de candidats français sous-performent pour cette seule raison, avec un dossier meilleur que celui du candidat retenu.",
          "Le format le plus fréquent est comportemental : on vous demandera de raconter une situation précise — un désaccord, une erreur, un dossier difficile. Préparez cinq à six récits courts, tirés de votre expérience réelle, chacun construit de la même façon : la situation, ce que vous avez fait, le résultat. Ces récits se recombinent pour répondre à la plupart des questions ; les improviser conduit à des réponses vagues qui n'apportent rien.",
          "Préparez aussi la question de votre parcours étranger. Elle viendra, sous une forme ou une autre, et l'hésitation qu'elle provoque est plus dommageable que la question elle-même. Votre réponse tient en deux temps : ce que votre formation d'origine vous permet de faire que les autres candidats ne peuvent pas, et pourquoi c'est utile à ce poste précis.",
          "Ayez enfin deux questions à poser, sur le travail lui-même — pas sur l'entreprise, dont le site répond déjà. Une question précise sur les dossiers de l'équipe montre mieux votre sérieux que n'importe quelle formule de conclusion.",
        ],
        keyPoints: [
          "« J'ai obtenu », pas « nous avons obtenu » : c'est la réponse attendue.",
          "Cinq à six récits préparés — situation, action, résultat — se recombinent.",
          "La question du parcours étranger viendra : sa réponse se prépare.",
        ],
      },
      {
        kind: "METHOD",
        id: "m9-suivi",
        title: "Tenir un suivi de candidatures",
        body: [
          "Une recherche d'emploi menée sur plusieurs mois produit rapidement plus d'informations qu'une mémoire ne peut en tenir : qui vous avez contacté, quand, ce qui a été dit, ce que vous aviez promis d'envoyer. Sans trace écrite, deux échecs surviennent — la relance oubliée et, plus gênante, la seconde prise de contact avec quelqu'un à qui vous aviez déjà écrit.",
          "Un tableau suffit, à condition d'y consigner la seule colonne qui compte vraiment : la prochaine action et sa date. Le reste — organisation, personne, canal, statut — est du contexte. Une ligne sans prochaine action est une piste abandonnée sans l'avoir décidé, et c'est ainsi que la plupart des pistes meurent.",
          "Relisez ce suivi une fois par semaine, à jour fixe. Ce rendez-vous transforme une recherche subie, faite d'à-coups, en un travail régulier dont vous mesurez l'avancement — et il fournit la matière factuelle des séances de coaching, où le temps est trop court pour reconstituer de mémoire ce qui s'est passé.",
        ],
        keyPoints: [
          "La colonne décisive est « prochaine action et sa date ».",
          "Une ligne sans prochaine action est une piste abandonnée sans décision.",
          "Une relecture hebdomadaire à jour fixe rend l'avancement mesurable.",
        ],
      },
    ],
  },
  {
    slug: "module-10-suite",
    order: 10,
    title: "Rester, rentrer ou aller ailleurs",
    summary: "Rester aux États-Unis, rentrer en France ou travailler dans un autre pays.",
    published: true,
    sections: [
      {
        kind: "METHOD",
        id: "m10-rester",
        title: "Rester : à quelles conditions",
        body: [
          "Rester aux États-Unis après le parcours suppose que trois conditions soient réunies en même temps, et c'est leur simultanéité qui fait la difficulté : un employeur qui vous veut, un statut administratif qui vous y autorise, et un calendrier où les deux coïncident. Chacune prise isolément est atteignable ; c'est leur intersection qui décide.",
          "La conséquence pratique est que la recherche d'emploi et les démarches de statut ne sont pas deux chantiers successifs mais un seul, mené de front. Un employeur trouvé trop tard pour les échéances administratives équivaut, du point de vue du résultat, à un employeur non trouvé. Les règles applicables, leurs délais et leurs conditions relèvent du module consacré au panorama migratoire, qui les énonce avec ses sources — ce module-ci ne traite que de la stratégie.",
          "Posez-vous la question de la durée avant celle de la possibilité. Rester deux ou trois ans pour acquérir une expérience américaine puis rentrer est un projet différent de s'installer durablement : ils n'appellent ni les mêmes employeurs, ni le même effort, ni le même arbitrage financier. Beaucoup de candidats poursuivent le second en n'ayant réfléchi qu'au premier.",
        ],
        keyPoints: [
          "Trois conditions simultanées : employeur, statut, calendrier commun.",
          "Recherche d'emploi et démarches de statut se mènent de front, jamais l'une après l'autre.",
          "« Quelques années » et « durablement » sont deux projets distincts.",
        ],
      },
      {
        kind: "METHOD",
        id: "m10-rentrer",
        title: "Rentrer sans perdre le bénéfice du parcours",
        body: [
          "Le risque du retour n'est pas le retour lui-même : c'est de le raconter comme un échec. Un parcours américain se valorise très bien sur le marché français, à condition d'énoncer ce qu'il vous permet de faire aujourd'hui — et non de le présenter comme une parenthèse qui n'aurait pas abouti.",
          "Ce que le marché français achète est précis : la capacité à travailler sur des dossiers impliquant des parties américaines, la compréhension directe d'un droit que vos interlocuteurs ne connaissent que de seconde main, et un réseau outre-Atlantique réellement utilisable. Formulez ces trois éléments en une phrase chacun, avec des exemples. C'est cette formulation qui manque le plus souvent, pas l'expérience.",
          "Deux erreurs de calendrier coûtent cher. La première : rentrer sans avoir prévenu personne, en découvrant que le marché français recrute lui aussi selon des cycles. La seconde : laisser passer plus d'un an avant de reprendre contact avec votre réseau français, délai au-delà duquel il faut le reconstruire plutôt que le réactiver. Les deux se traitent de la même façon — en entretenant ce réseau pendant l'année américaine, et non à votre retour.",
        ],
        keyPoints: [
          "Le risque est le récit du retour, pas le retour.",
          "Trois arguments à formuler par écrit : dossiers transatlantiques, droit de première main, réseau utilisable.",
          "Le réseau français s'entretient pendant l'année américaine, pas au retour.",
        ],
      },
      {
        kind: "METHOD",
        id: "m10-ailleurs",
        title: "Un troisième marché",
        body: [
          "Un troisième marché — Londres, Bruxelles, Genève, Singapour, Dubaï, Montréal — est une option que la plupart des candidats n'examinent jamais, alors qu'elle correspond souvent mieux à leur profil que les deux autres. La combinaison d'une formation française et d'un diplôme américain y est fréquemment un avantage plus net que dans chacun des deux pays d'origine.",
          "Ces marchés partagent une caractéristique utile : ils recrutent des juristes précisément pour leur capacité à travailler entre plusieurs systèmes, ce qui est exactement la compétence que votre parcours construit. Là où le marché américain domestique neutralise votre formation initiale, ces places la comptent deux fois.",
          "La contrepartie est que chacun a ses propres conditions d'exercice, ses règles d'accès à la profession et ses délais — qui ne se déduisent d'aucun des deux parcours que vous connaissez déjà. Le module consacré aux autres barreaux et équivalences traite cette question avec ses sources. Retenez ici seulement qu'écarter cette hypothèse sans l'avoir examinée revient souvent à écarter la meilleure.",
        ],
        keyPoints: [
          "Un troisième marché valorise souvent mieux la double formation que la France ou les États-Unis.",
          "Ces places recrutent pour la capacité à travailler entre systèmes — c'est votre compétence.",
          "Les conditions d'accès y sont propres à chaque juridiction et se vérifient une par une.",
        ],
      },
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
  /** Annonce du changement de contexte, lue par les lecteurs d'écran seuls. */
  newTab: " (s'ouvre dans un nouvel onglet)",
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
