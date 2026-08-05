import type { TaskTemplate } from "@/lib/roadmap/types";

/**
 * Modèles de tâches de la feuille de route (CDC §22).
 *
 * Chaque tâche est rattachée à une phase et à un ou plusieurs parcours types.
 * Les libellés sont de la copie visible : mêmes contraintes que le reste
 * (aucune promesse de résultat, aucune affirmation d'éligibilité).
 *
 * Les tâches portant un `milestone` doivent décrire une action **contrôlée par
 * l'utilisateur** — préparer un dossier, finaliser une liste — jamais un
 * résultat obtenu auprès d'un tiers (CDC §24).
 */
export const TASK_TEMPLATES: TaskTemplate[] = [
  // ── Clarification & stratégie professionnelle ────────────────────────────
  {
    id: "T-CLAR-01",
    phase: "CLARIFICATION",
    title: "Arrêter un objectif professionnel, même provisoire",
    explanation:
      "Tant que l'objectif n'est pas posé, chaque arbitrage suivant — écoles, budget, calendrier — repose sur une hypothèse arbitraire. Un objectif provisoire vaut mieux qu'aucun.",
    importance: "CRITICAL",
    estimatedMinutes: 90,
    monthsBeforeIntake: 14,
    journeyTypes: ["PRE_LLM_EXPLORER", "FOREIGN_QUALIFIED_LAWYER"],
    moduleSlug: "module-0-decision",
    delayRisk:
      "Sans objectif, la liste d'écoles se construit au hasard du classement plutôt que de votre projet.",
  },
  {
    id: "T-CLAR-02",
    phase: "CLARIFICATION",
    title: "Établir une première fourchette de budget",
    explanation:
      "Confronter le coût du projet à vos ressources réelles, avant de vous attacher à une école. C'est le poste qui fait renoncer le plus tard, donc le plus douloureusement.",
    importance: "CRITICAL",
    estimatedMinutes: 120,
    monthsBeforeIntake: 14,
    journeyTypes: ["PRE_LLM_EXPLORER", "LLM_APPLICANT", "FOREIGN_QUALIFIED_LAWYER"],
    toolHref: "/app/simulateur",
    toolLabel: "Ouvrir le simulateur de coût",
    delayRisk: "Un budget découvert tardivement invalide une liste d'écoles déjà constituée.",
  },
  {
    id: "T-CAREER-01",
    phase: "CAREER_STRATEGY",
    title: "Identifier trois profils ayant atteint votre objectif",
    explanation:
      "Repérer des parcours documentés partis d'une formation comparable à la vôtre, et noter l'étape intermédiaire qui vous manque aujourd'hui.",
    importance: "HIGH",
    estimatedMinutes: 60,
    monthsBeforeIntake: 13,
    journeyTypes: ["PRE_LLM_EXPLORER", "LLM_APPLICANT", "FOREIGN_QUALIFIED_LAWYER"],
    moduleSlug: "module-1-career",
    delayRisk: "Un objectif non confronté à des parcours réels reste une intention.",
  },

  // ── Sélection du LL.M. ───────────────────────────────────────────────────
  {
    id: "T-SEL-01",
    phase: "LLM_SELECTION",
    title: "Repérer les accords de votre université",
    explanation:
      "Certaines universités françaises ont des accords avec des law schools américaines : frais réduits, places réservées ou dispense de frais de dossier. Vérifier les conditions et les dates limites propres à chaque accord.",
    importance: "HIGH",
    estimatedMinutes: 90,
    monthsBeforeIntake: 12,
    journeyTypes: ["PRE_LLM_EXPLORER", "LLM_APPLICANT"],
    moduleSlug: "module-2-choisir",
    toolHref: "/app/ecoles",
    toolLabel: "Voir les accords de votre université",
    delayRisk: "Les accords ont leurs propres dates limites, souvent antérieures aux candidatures.",
  },
  {
    id: "T-SEL-02",
    phase: "LLM_SELECTION",
    title: "Programmer le test d'anglais",
    explanation:
      "Fixer une date ferme, en prévoyant qu'une seconde session reste possible avant les dépôts.",
    importance: "CRITICAL",
    estimatedMinutes: 30,
    monthsBeforeIntake: 12,
    journeyTypes: ["PRE_LLM_EXPLORER", "LLM_APPLICANT"],
    delayRisk: "Un score obtenu trop tard ferme les écoles dont la date limite est la plus précoce.",
  },
  {
    id: "T-SEL-03",
    phase: "LLM_SELECTION",
    title: "Finaliser votre liste d'écoles",
    explanation:
      "Croiser coût net après bourses, placement, éligibilité au barreau visé et accords existants. Viser un équilibre entre écoles ambitieuses et écoles sûres.",
    importance: "CRITICAL",
    estimatedMinutes: 240,
    monthsBeforeIntake: 11,
    journeyTypes: ["PRE_LLM_EXPLORER", "LLM_APPLICANT"],
    moduleSlug: "module-2-choisir",
    milestone: "SCHOOL_LIST_COMPLETED",
    toolHref: "/app/ecoles",
    toolLabel: "Ouvrir votre liste d'écoles",
    delayRisk: "Une liste arrêtée tard comprime la rédaction des dossiers.",
  },

  // ── Candidatures ─────────────────────────────────────────────────────────
  {
    id: "T-APP-01",
    phase: "APPLICATIONS",
    title: "Préparer CV et personal statement",
    explanation:
      "Le CV suit les conventions américaines, qui diffèrent des françaises. Le personal statement explique votre projet, pas votre parcours.",
    importance: "CRITICAL",
    estimatedMinutes: 480,
    monthsBeforeIntake: 10,
    journeyTypes: ["LLM_APPLICANT", "PRE_LLM_EXPLORER"],
    moduleSlug: "module-3-candidatures",
    delayRisk: "Un personal statement rédigé dans l'urgence se voit immédiatement.",
  },
  {
    id: "T-APP-02",
    phase: "APPLICATIONS",
    title: "Solliciter vos recommandations",
    explanation:
      "Prévenir vos référents plusieurs semaines à l'avance et leur fournir votre CV ainsi que le contexte du projet.",
    importance: "HIGH",
    estimatedMinutes: 60,
    monthsBeforeIntake: 10,
    journeyTypes: ["LLM_APPLICANT", "PRE_LLM_EXPLORER"],
    delayRisk:
      "Une recommandation dépend d'un tiers : la demander tard, c'est perdre le contrôle du calendrier.",
  },
  {
    id: "T-APP-03",
    phase: "APPLICATIONS",
    title: "Rassembler relevés de notes et traductions",
    explanation:
      "Les délais d'obtention auprès de votre université et de traduction assermentée sont souvent sous-estimés.",
    importance: "HIGH",
    estimatedMinutes: 180,
    monthsBeforeIntake: 10,
    journeyTypes: ["LLM_APPLICANT", "PRE_LLM_EXPLORER"],
    toolHref: "/app/documents",
    toolLabel: "Ouvrir votre coffre de documents",
    delayRisk: "Une pièce manquante bloque un dossier par ailleurs complet.",
  },
  {
    id: "T-APP-04",
    phase: "APPLICATIONS",
    title: "Vérifier que chaque dossier est complet",
    explanation:
      "Reprendre école par école la liste des pièces attendues et confirmer que rien ne manque avant dépôt.",
    importance: "CRITICAL",
    estimatedMinutes: 120,
    monthsBeforeIntake: 9,
    journeyTypes: ["LLM_APPLICANT"],
    milestone: "APPLICATIONS_READY",
    toolHref: "/app/documents",
    toolLabel: "Ouvrir votre coffre de documents",
    delayRisk: "Un dossier incomplet est écarté sans examen au fond.",
  },

  // ── Financement ──────────────────────────────────────────────────────────
  {
    id: "T-FUND-01",
    phase: "FUNDING",
    title: "Recenser les bourses accessibles et leurs dates limites",
    explanation:
      "Les bourses sont parfois instruites avant la candidature, parfois avec elle. Chaque dispositif a son propre calendrier.",
    importance: "CRITICAL",
    estimatedMinutes: 180,
    monthsBeforeIntake: 10,
    journeyTypes: ["PRE_LLM_EXPLORER", "LLM_APPLICANT"],
    moduleSlug: "module-3-candidatures",
    delayRisk: "Une bourse identifiée après sa date limite ne se rattrape pas.",
  },
  {
    id: "T-FUND-02",
    phase: "FUNDING",
    title: "Établir votre coût net cible",
    explanation:
      "Fixer le montant au-delà duquel vous renoncez, bourses et accords déduits. Cette limite se pose avant les réponses, pas après.",
    importance: "HIGH",
    estimatedMinutes: 90,
    monthsBeforeIntake: 9,
    journeyTypes: ["PRE_LLM_EXPLORER", "LLM_APPLICANT"],
    toolHref: "/app/simulateur",
    toolLabel: "Ouvrir le simulateur de coût",
    delayRisk: "Sans limite fixée à froid, une admission prestigieuse fait accepter n'importe quel coût.",
  },
  {
    id: "T-FUND-03",
    phase: "FUNDING",
    title: "Boucler le financement une fois l'admission obtenue",
    explanation:
      "Le financement ne s'arrête pas à l'admission : il faut arrêter l'échéancier de l'école, débloquer le prêt ou la bourse, et réunir les justificatifs de ressources. Ces derniers conditionnent le document que l'école délivre pour votre dossier de statut étudiant — c'est le maillon dont on découvre le plus tard qu'il précède tout le reste.",
    importance: "CRITICAL",
    estimatedMinutes: 240,
    /*
     * Un mois avant le dossier de statut étudiant (T-VISA-01, à quatre mois),
     * parce que celui-ci suppose la preuve de ressources suffisantes pour toute
     * la durée du programme. Les deux tâches s'enchaînent : les dater
     * ensemble laisserait croire qu'elles peuvent se mener en parallèle.
     */
    monthsBeforeIntake: 5,
    journeyTypes: ["LLM_APPLICANT", "CURRENT_LLM_STUDENT"],
    moduleSlug: "module-3-candidatures",
    toolHref: "/app/simulateur",
    toolLabel: "Ouvrir le simulateur de coût",
    delayRisk:
      "Sans justificatifs de ressources, l'école ne délivre pas le document sur lequel repose toute la suite du calendrier.",
  },

  // ── Visa ─────────────────────────────────────────────────────────────────
  {
    id: "T-VISA-01",
    phase: "VISA",
    title: "Préparer votre dossier de statut étudiant",
    explanation:
      "Les démarches ne peuvent démarrer qu'après réception des documents de l'université. Les conditions et les délais relèvent des autorités migratoires américaines, seules compétentes.",
    importance: "CRITICAL",
    estimatedMinutes: 300,
    monthsBeforeIntake: 4,
    /*
     * `CURRENT_LLM_STUDENT` couvre « admis ou inscrit ». La tâche manquait
     * exactement à qui elle est le plus urgente : la personne admise, qui a
     * ses documents d'université en main et rien pour lui dire d'entamer les
     * démarches. Celle déjà sur place l'a faite et la coche ; celle qui n'a
     * besoin d'aucun visa la voit passer en « sans objet » (`needsVisaBranch`).
     */
    journeyTypes: ["LLM_APPLICANT", "CURRENT_LLM_STUDENT"],
    moduleSlug: "module-4-immigration",
    delayRisk:
      "Les délais de rendez-vous varient fortement selon les périodes et ne dépendent pas de vous.",
  },

  // ── LL.M. et dossier d'évaluation ────────────────────────────────────────
  {
    id: "T-BOLE-01",
    phase: "BOLE",
    title: "Réunir les pièces du dossier d'évaluation",
    explanation:
      "Rassembler les documents demandés par l'autorité compétente et vérifier leur forme. Chaque pièce doit venir directement de l'établissement qui l'a émise, et les traductions être faites par un traducteur certifié — deux exigences qui prennent des semaines. L'évaluation elle-même relève exclusivement du New York Board of Law Examiners.",
    importance: "CRITICAL",
    estimatedMinutes: 300,
    /*
     * AVANT la rentrée, et non deux mois après comme jusqu'ici.
     *
     * Les pièces sont françaises — relevés de la faculté, attestation
     * d'accréditation, traductions — et s'obtiennent bien plus facilement
     * depuis la France. Surtout, la date de dépôt lue dans les instructions du
     * Board tombe au 1er octobre pour un examen de juillet : la tâche était
     * datée du jour même de l'échéance qu'elle sert à préparer.
     */
    monthsBeforeIntake: 2,
    journeyTypes: ["CURRENT_LLM_STUDENT", "BAR_CANDIDATE"],
    moduleSlug: "module-5-bole",
    milestone: "BOLE_FILE_PREPARED",
    toolHref: "/app/documents",
    toolLabel: "Ouvrir votre coffre de documents",
    delayRisk: "Un dossier déposé tard décale l'examen d'une session entière.",
  },
  {
    id: "T-BOLE-02",
    phase: "BOLE",
    title: "Déposer la demande d'évaluation préalable",
    explanation:
      "Ouvrir le compte auprès du Board, remplir le formulaire en ligne, puis seulement ensuite faire envoyer les pièces : les documents reçus avant l'ouverture du compte ne sont pas conservés. Le Board n'ouvre pas le dossier tant qu'il manque une pièce, et la décision peut demander six mois à partir de la dernière reçue.",
    importance: "CRITICAL",
    estimatedMinutes: 120,
    // Deux mois après la rentrée d'août : c'est l'ordre de grandeur de la date
    // que le Board fixe pour un examen de juillet suivant. La date exacte
    // dépend de la session visée et se vérifie à la source.
    monthsBeforeIntake: -2,
    journeyTypes: ["CURRENT_LLM_STUDENT", "BAR_CANDIDATE"],
    moduleSlug: "module-5-bole",
    delayRisk:
      "Une date de dépôt manquée reporte l'examen d'une session entière — six mois, parfois un an.",
  },
  {
    id: "T-NET-01",
    phase: "NETWORKING_INTERNSHIPS",
    title: "Engager networking et recherche de stage",
    explanation:
      "Le premier semestre est la fenêtre utile : au second, les processus des employeurs sont déjà engagés.",
    importance: "HIGH",
    estimatedMinutes: 240,
    monthsBeforeIntake: -1,
    journeyTypes: ["CURRENT_LLM_STUDENT"],
    moduleSlug: "module-9-recherche",
    delayRisk: "Une recherche engagée au second semestre arrive après les campagnes de recrutement.",
  },

  // ── Préparation et examen ────────────────────────────────────────────────
  {
    id: "T-BAR-01",
    phase: "BAR_PREPARATION",
    title: "Choisir un prestataire et arrêter un planning de révision",
    explanation:
      "Le choix du prestataire compte moins que la régularité du planning. Construire un calendrier réaliste sur la durée réellement disponible.",
    importance: "CRITICAL",
    estimatedMinutes: 180,
    monthsBeforeIntake: -6,
    journeyTypes: ["CURRENT_LLM_STUDENT", "BAR_CANDIDATE"],
    moduleSlug: "module-6-bar",
    delayRisk: "Un planning bâti trop tard conduit à survoler les matières les plus lourdes.",
  },
  {
    id: "T-BAR-02",
    phase: "BAR_PREPARATION",
    title: "Finaliser votre inscription à l'examen",
    explanation:
      "Les fenêtres d'inscription sont courtes et fixées par l'autorité. Vérifier les pièces attendues avant l'ouverture.",
    importance: "CRITICAL",
    estimatedMinutes: 120,
    monthsBeforeIntake: -8,
    journeyTypes: ["BAR_CANDIDATE", "CURRENT_LLM_STUDENT"],
    milestone: "BAR_REGISTRATION_COMPLETED",
    delayRisk: "Une fenêtre d'inscription manquée reporte l'examen à la session suivante.",
  },
  {
    id: "T-BAR-03",
    phase: "BAR_PREPARATION",
    title: "Passer l'examen de responsabilité professionnelle",
    explanation:
      "C'est une épreuve distincte de l'examen principal, avec son propre calendrier et son propre organisateur. Elle peut être passée avant comme après, et un échec se repasse sans limite de tentatives — raison de plus pour s'en débarrasser tôt plutôt que de l'ajouter au mois le plus chargé.",
    importance: "CRITICAL",
    estimatedMinutes: 900,
    monthsBeforeIntake: -5,
    journeyTypes: ["CURRENT_LLM_STUDENT", "BAR_CANDIDATE"],
    moduleSlug: "module-6-bar",
    delayRisk:
      "Repoussée après l'examen principal, elle retarde d'autant la demande d'admission.",
  },
  {
    id: "T-BAR-04",
    phase: "BAR_PREPARATION",
    title: "Suivre le cours de droit new-yorkais et passer son examen",
    explanation:
      "Un cours en ligne puis l'examen qui lui correspond, tous deux exigés pour l'admission. Ils peuvent être accomplis jusqu'à un an AVANT votre première session d'examen principal, et le score obtenu vaut trois ans : c'est la seule échéance de cette phase qu'on peut avancer à sa convenance.",
    importance: "CRITICAL",
    estimatedMinutes: 1200,
    monthsBeforeIntake: -4,
    journeyTypes: ["CURRENT_LLM_STUDENT", "BAR_CANDIDATE"],
    moduleSlug: "module-6-bar",
    delayRisk:
      "Laissés pour après l'examen principal, ils s'ajoutent à la période où le dossier d'admission se prépare déjà.",
  },

  // ── Admission ────────────────────────────────────────────────────────────
  {
    id: "T-ADM-01",
    phase: "ADMISSION",
    title: "Préparer votre dossier d'admission",
    explanation:
      "Réunir les pièces de la procédure de moralité et prévenir vos références en amont. La décision appartient à l'autorité d'admission.",
    importance: "HIGH",
    estimatedMinutes: 360,
    monthsBeforeIntake: -14,
    journeyTypes: ["BAR_CANDIDATE"],
    moduleSlug: "module-7-admission",
    milestone: "ADMISSION_PACKAGE_PREPARED",
    delayRisk: "La procédure de moralité est longue : la démarrer tard retarde la prestation de serment.",
  },
  {
    id: "T-ADM-02",
    phase: "ADMISSION",
    title: "Engager vos cinquante heures de bénévolat qualifiant",
    explanation:
      "Cinquante heures de travail juridique bénévole encadré sont exigées avant le dépôt de la demande d'admission. Elles peuvent être accomplies dans n'importe quel pays, y compris la France, dès lors que vos études de droit ont commencé — et sous la supervision d'un enseignant, d'un avocat ou d'un magistrat, qui certifiera chaque expérience.",
    importance: "CRITICAL",
    estimatedMinutes: 3000,
    /*
     * Six mois AVANT la rentrée : c'est tout l'intérêt de la tâche.
     *
     * Elle est régulièrement découverte au moment du dépôt du dossier
     * d'admission, quand il ne reste plus de temps pour cinquante heures. Rien
     * n'oblige à attendre les États-Unis : ces heures se font depuis la France,
     * et la seule condition de date est qu'elles suivent le début des études.
     */
    monthsBeforeIntake: 6,
    journeyTypes: ["LLM_APPLICANT", "CURRENT_LLM_STUDENT", "BAR_CANDIDATE"],
    moduleSlug: "module-7-admission",
    delayRisk:
      "Cinquante heures ne se rattrapent pas dans le mois qui précède le dépôt : c'est le motif de report le plus évitable du parcours.",
  },
  {
    id: "T-ADM-03",
    phase: "ADMISSION",
    title: "Choisir votre voie pour la condition de compétences",
    explanation:
      "L'admission exige d'établir vos compétences et votre connaissance des valeurs de la profession, et cinq voies distinctes le permettent. Deux méritent l'attention d'un juriste formé en France : la pratique déjà exercée comme avocat, et le stage de six mois — qui peut être accompli AVANT de commencer le LL.M., donc depuis la France. Choisir la sienne tôt évite de découvrir après le diplôme qu'aucune ne s'offre plus.",
    importance: "HIGH",
    estimatedMinutes: 90,
    monthsBeforeIntake: 3,
    journeyTypes: [
      "LLM_APPLICANT",
      "CURRENT_LLM_STUDENT",
      "BAR_CANDIDATE",
      "FOREIGN_QUALIFIED_LAWYER",
    ],
    moduleSlug: "module-7-admission",
    delayRisk:
      "Plusieurs de ces voies supposent des enseignements ou une expérience qui ne se rattrapent plus une fois le diplôme obtenu.",
  },

  // ── Avocat déjà qualifié ─────────────────────────────────────────────────
  {
    id: "T-FQL-01",
    phase: "CAREER_STRATEGY",
    title: "Faire examiner votre admission actuelle",
    explanation:
      "Une admission à un barreau étranger peut ouvrir d'autres voies. Cette appréciation relève de l'autorité compétente et suppose l'examen de votre dossier complet.",
    importance: "CRITICAL",
    estimatedMinutes: 120,
    monthsBeforeIntake: 12,
    journeyTypes: ["FOREIGN_QUALIFIED_LAWYER"],
    moduleSlug: "module-8-autres-barreaux",
    delayRisk: "Engager un LL.M. sans avoir examiné les voies alternatives peut coûter une année.",
  },
  {
    id: "T-FQL-02",
    phase: "CAREER_STRATEGY",
    title: "Évaluer l'impact du projet sur votre activité actuelle",
    explanation:
      "Interruption, revenus, clientèle : arbitrer ces conséquences avant de vous engager, pas après.",
    importance: "HIGH",
    estimatedMinutes: 120,
    monthsBeforeIntake: 12,
    journeyTypes: ["FOREIGN_QUALIFIED_LAWYER"],
    delayRisk: "Une interruption d'activité non préparée pèse plus lourd que le coût de la scolarité.",
  },
];
