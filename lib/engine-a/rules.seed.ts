import type { Rule } from "./types";

/**
 * Jeu de règles initial du Moteur A (CDC §14.1).
 *
 * ⚠️ STATUT DE VÉRIFICATION — à lire avant toute activation.
 *
 * Chaque règle porte un identifiant, une condition, un fait produit, un bloc de
 * texte, une source officielle, une date de vérification, une version et un
 * statut actif/inactif, comme l'exige le cahier des charges.
 *
 * Les règles portant une affirmation de droit américain sont livrées
 * `active: false` et `verifiedAt: null` : leur contenu doit être confronté à la
 * source officielle par le fondateur avant activation. Le garde-fou
 * `npm run check:rules` refuse toute règle active dépourvue de source ou de date
 * de vérification. Tant qu'elles sont inactives, le moteur retombe sur la
 * catégorie « revue humaine », ce qui est le comportement voulu par le CDC :
 * en cas d'ambiguïté, signaler plutôt qu'improviser.
 *
 * Les règles purement structurelles (informations manquantes, cursus en cours)
 * n'énoncent aucune règle de droit et sont actives.
 *
 * ⚠️ Ce que l'activation change, MESURÉ sur 1 080 profils complets :
 * R-NY-001 seule fait passer la revue humaine de 83 % à 0 % — elle se déclenche
 * pour tout profil au-delà de la licence. R-NY-002, R-NY-003 et R-ALT-001
 * produisent la MÊME voie qu'elle et n'ajoutent qu'un bloc de texte : aucune ne
 * change d'orientation, elles précisent celle qui est retenue.
 *
 * C'est devenu le motif dominant du moteur, et il mérite d'être nommé : une
 * voie est une ORIENTATION, un bloc est une PRÉCISION. Une règle qui a quelque
 * chose à dire sans avoir à réorienter rend la voie déjà retenue et son propre
 * bloc — l'assemblage rend tous les blocs des règles dont le fait vaut la voie.
 * Le contraire — inventer une voie pour faire paraître un paragraphe — dirait
 * à quelqu'un que son chemin est ailleurs alors qu'on voulait seulement le
 * compléter.
 *
 * Conséquence assumée : `DIRECT_PATH_TO_EXAMINE` et `ALTERNATIVE_TO_EXAMINE` ne
 * sont produites par AUCUNE règle. La première le restera tant qu'une source ne
 * décrira pas une voie qui se passe d'un passage aux États-Unis ; la seconde a
 * été écartée à l'activation de R-ALT-001, parce qu'un projet de retour en
 * France ne retire pas la voie du barreau à qui l'emprunte. Les deux catégories
 * restent dans la liste fermée du CDC §14.1 — les vider de leur contenu est un
 * constat, les retirer serait modifier le cahier des charges.
 *
 * Le protocole de vérification, question par question, est dans
 * `docs/VERIFICATION-REGLES.md`.
 */

export const RULES: Rule[] = [
  // ── Règles structurelles : actives, aucune affirmation juridique ──────────
  {
    id: "R-STRUCT-001",
    condition: { field: "hasBlockingGaps", op: "eq", value: true },
    factProduced: "INSUFFICIENT_INFORMATION",
    textBlockId: "TB-INSUFFICIENT-INFO",
    sourceUrl: "interne:questionnaire",
    verifiedAt: "2026-07-28",
    version: 1,
    active: true,
  },
  {
    id: "R-STRUCT-002",
    // Cursus juridique encore en cours : constat factuel sur l'état des études,
    // et non appréciation de l'éligibilité, qui appartient au BOLE.
    condition: {
      all: [
        { field: "education", op: "eq", value: "LICENCE" },
        { field: "hasBlockingGaps", op: "eq", value: false },
      ],
    },
    factProduced: "EDUCATION_LIKELY_INSUFFICIENT",
    textBlockId: "TB-STUDIES-IN-PROGRESS",
    sourceUrl: "interne:profil",
    verifiedAt: "2026-07-28",
    version: 1,
    active: true,
  },

  // ── Règles de droit : INACTIVES tant que la source n'est pas vérifiée ─────
  {
    id: "R-NY-001",
    // Diplôme de droit français complet + LL.M. dans une law school américaine :
    // voie New York couramment empruntée, sous réserve de l'évaluation du BOLE.
    //
    // VÉRIFIÉE le 2026-08-01 contre le texte en vigueur (22 NYCRR part 520).
    //
    // M1 RESTE dans la liste, à l'inverse de ce que suggérait l'analyse du
    // code : le § 520.6(b)(1) demande la preuve de l'accomplissement des
    // conditions de formation pour l'accès à la profession dans le pays
    // d'origine — en France, c'est le M1 qui ouvre le CRFPA, pas la licence.
    // Le retirer aurait exclu précisément le diplôme visé.
    //
    // CRFPA est redondant sans être faux : le M1 en étant le prérequis, ces
    // profils déclenchent déjà la règle par la première valeur de la liste.
    //
    // CE QUE LA CONDITION NE TESTE PAS — et qui est le vrai risque : la DURÉE.
    // Un candidat ne peut régulariser que la déficience de durée OU celle de
    // substance, jamais les deux (§ 520.6). La France étant civiliste, le LL.M.
    // est intégralement consommé par la régularisation substantielle : la durée
    // (83 crédits juridiques, dont 64 présentiels) doit donc être atteinte par
    // le seul diplôme français. Le questionnaire ne recueille pas ce décompte,
    // et les douze écrans du CDC §12.4 ne sont pas extensibles sans décision.
    // Le contrôle vit donc dans la revue avant envoi (`lib/report/review.ts`,
    // point bloquant `durational-requirement`) : aucun rapport ne part sans
    // qu'un humain ait confirmé le décompte. C'est le filet que l'activation
    // de cette règle retire au moteur, replacé là où le CDC §17 le prévoit.
    //
    // La seconde clause (`journeyType neq null`) n'exclut personne : les cinq
    // statuts possibles donnent tous une valeur.
    condition: {
      all: [
        { field: "education", op: "in", value: ["M1", "M2", "CRFPA", "CAPA", "DOCTORAT"] },
        { field: "journeyType", op: "neq", value: null },
      ],
    },
    factProduced: "NY_VIA_LLM_SUBJECT_TO_BOLE",
    textBlockId: "TB-NY-VIA-LLM",
    sourceUrl: "https://www.nycourts.gov/ctapps/520rules10.htm",
    verifiedAt: "2026-08-01",
    version: 1,
    active: true,
  },
  {
    id: "R-NY-002",
    // Admission à un barreau étranger — CONSTAT DE DOSSIER, non voie distincte.
    //
    // Deux vérifications successives ont conduit ici, et la seconde a défait
    // une partie de la première :
    //
    //   2026-08-01 — le § 520.6(b)(2), seul texte visant les avocats déjà
    //   admis, est réservé aux pays « whose jurisprudence is based upon the
    //   principles of English Common Law », et exige EN OUTRE un LL.M.
    //   américain. « Voie directe » était donc inexact pour tout le monde.
    //
    //   2026-08-02 — recherche sur les sources du BOLE. Trois constats :
    //     1. Le BOLE ne publie AUCUNE liste des juridictions relevant de ce
    //        critère, ni méthode publique de classement. Il impose une
    //        évaluation individuelle du dossier (Request for Foreign
    //        Evaluation). Une règle qui trierait par pays inventerait donc son
    //        critère — c'est ce qui l'a maintenue dormante jusqu'ici.
    //     2. Le § 520.6(b)(2) exige un LL.M. ; le § 520.10 exige, lui, un
    //        premier diplôme américain agréé par l'ABA, qu'un LL.M. ne
    //        remplace pas. Aucune des deux ne se passe d'un passage aux
    //        États-Unis : `DIRECT_PATH_TO_EXAMINE` ne décrit rien de réel.
    //     3. « La France est exclue de la Rule 520.6 » était trop large. Le
    //        § 520.6(b)(1)(ii) permet de corriger par un LL.M. une déficience
    //        substantielle — ce que la voie NY_VIA_LLM_SUBJECT_TO_BOLE dit
    //        déjà. Le produit disait donc juste par ailleurs.
    //
    // D'où la forme retenue : la règle ne produit PAS de voie propre. Elle
    // produit la MÊME voie que R-NY-001, et n'ajoute qu'un bloc de texte —
    // l'assemblage rend tous les blocs des règles dont le fait vaut la voie
    // retenue. L'admission étrangère cesse d'être une orientation et redevient
    // ce qu'elle est : un élément du dossier, à documenter.
    // N'inclut PAS `OTHER_COUNTRY_TRAINING` : R-NY-003 dit à ce profil la même
    // chose en plus précis, et les deux blocs se suivaient en se répétant —
    // deux fois « le texte des avocats admis exige lui aussi un LL.M. », dans
    // une section qui atteignait 2 067 caractères. Une règle plus spécifique
    // REMPLACE la générique, elle ne s'y ajoute pas.
    condition: {
      field: "foreignBar",
      op: "in",
      value: ["FRANCE", "OTHER_COUNTRY_LAW_DEGREE"],
    },
    factProduced: "NY_VIA_LLM_SUBJECT_TO_BOLE",
    textBlockId: "TB-FOREIGN-BAR",
    sourceUrl: "https://www.nybarexam.org/foreign/foreignlegaleducation.htm",
    verifiedAt: "2026-08-02",
    version: 2,
    active: true,
  },
  {
    id: "R-NY-003",
    // Admission obtenue par études + formation en cabinet, hors de France.
    //
    // C'est la configuration que le § 520.6(b)(2) vise NOMMÉMENT, et que le
    // BOLE traite à part : les parcours de conversion britanniques (GDL puis
    // LPC ou formation de barrister, suivis d'un training contract) ne
    // satisfont NI la durée NI le fond du § 520.6(b)(1), et relèvent donc
    // exclusivement du (b)(2). Le Board précise même qu'un établissement
    // regroupant ces éléments sous le nom de LL.B. ne change rien à la
    // qualification.
    //
    // La règle ne conclut toujours RIEN sur le pays : le (b)(2) suppose une
    // juridiction de common law, et aucune liste n'est publiée. Elle ajoute un
    // bloc de texte à la même voie, comme R-NY-002, et nomme les trois
    // conditions que ce régime pose en plus de l'admission elle-même.
    condition: { field: "foreignBar", op: "eq", value: "OTHER_COUNTRY_TRAINING" },
    factProduced: "NY_VIA_LLM_SUBJECT_TO_BOLE",
    textBlockId: "TB-FOREIGN-BAR-TRAINING",
    sourceUrl: "https://www.nybarexam.org/foreign/foreignlegaleducation.htm",
    verifiedAt: "2026-08-03",
    version: 1,
    active: true,
  },
  {
    id: "R-ALT-001",
    // Objectif de retour en France : d'autres voies méritent d'être examinées.
    //
    // ACTIVÉE le 2026-08-06, sur décision du fondateur. Elle n'énonce aucun
    // droit américain — sa source est le profil déclaré, et ce qu'elle affirme
    // est un jugement stratégique. Il n'y avait donc rien à confronter à un
    // texte : c'était une décision métier, et elle est prise.
    //
    // ⚠️ Ce que l'activation a exigé de changer, et pourquoi.
    //
    // Activée telle quelle, la règle n'aurait RIEN produit. Elle rendait le
    // fait `ALTERNATIVE_TO_EXAMINE`, la voie la moins prioritaire, tandis que
    // R-NY-001 est active et se déclenche pour tout profil au-delà de la
    // licence : la voie LL.M. l'aurait emporté à chaque fois, et le bloc de
    // texte — que l'assemblage ne rend que pour la voie retenue — aurait été
    // écarté. Activer sans plus aurait été un geste sans effet.
    //
    // Faire primer `ALTERNATIVE_TO_EXAMINE` n'était pas la réponse : cela
    // reviendrait à dire à quelqu'un que la voie du LL.M. n'est pas la sienne,
    // alors que beaucoup de juristes passent le barreau de New York PUIS
    // rentrent — c'est écrit dans le commentaire d'origine de cette règle.
    //
    // La règle rend donc la MÊME voie et ajoute un paragraphe, comme R-NY-002
    // et R-NY-003. L'objectif de retour cesse d'être ignoré sans que la voie
    // soit retirée à qui la suit légitimement.
    condition: {
      all: [
        { field: "geoGoal", op: "eq", value: "RETURN_FRANCE" },
        { field: "careerGoal", op: "eq", value: "RETURN_FRANCE" },
      ],
    },
    factProduced: "NY_VIA_LLM_SUBJECT_TO_BOLE",
    textBlockId: "TB-ALTERNATIVE",
    sourceUrl: "interne:profil",
    verifiedAt: "2026-08-06",
    version: 2,
    active: true,
  },
];

/** Blocs de texte pré-rédigés associés (CDC §17 : aucun texte généré librement). */
export const TEXT_BLOCKS: Record<string, string> = {
  "TB-INSUFFICIENT-INFO":
    "Les informations transmises ne suffisent pas encore à dégager une voie préliminaire. Les éléments manquants vous seront demandés avant la préparation de votre rapport.",
  "TB-STUDIES-IN-PROGRESS":
    "Votre cursus juridique est encore en cours. À ce stade, l'enjeu n'est pas l'accès au barreau mais la préparation : choix du master, niveau d'anglais, budget et repérage des partenariats de votre université.",
  "TB-NY-VIA-LLM":
    "Votre formation correspond au profil des juristes qui empruntent la voie du LL.M. américain avant de demander l'accès à l'examen du barreau de New York. Cette voie suppose une évaluation individuelle par le New York Board of Law Examiners, seule autorité compétente pour se prononcer.",
  // S'AJOUTE à TB-NY-VIA-LLM, il ne le remplace pas : une admission étrangère
  // ne change pas la voie, elle ajoute des pièces au dossier. Le texte dit
  // aussi ce que le BOLE ne publie pas — l'absence de liste est justement ce
  // qui interdit au produit de trancher par pays.
  "TB-FOREIGN-BAR":
    "Votre admission à un barreau étranger est un élément de votre dossier, et non une dispense : le texte réservé aux avocats déjà admis exige lui aussi un LL.M. américain, et l'admission sans examen suppose un premier diplôme obtenu aux États-Unis. Le New York Board of Law Examiners ne publie aucune liste des pays dont la jurisprudence est fondée sur les principes de la common law anglaise : il procède à une évaluation individuelle du dossier, et lui seul se prononce. Tenez donc prêts votre certificat d'admission et la preuve que votre faculté était accréditée pendant vos études.",
  // Complète TB-FOREIGN-BAR pour la seule configuration que le § 520.6(b)(2)
  // vise nommément. Nomme les conditions SANS trancher celle qui ne se tranche
  // pas depuis un questionnaire : le rattachement du pays à la common law.
  "TB-FOREIGN-BAR-TRAINING":
    "Votre admission reposant sur des études suivies d'une formation en cabinet, c'est un texte particulier qui s'applique — celui que le New York Board of Law Examiners consacre aux parcours de conversion. Il n'allège rien : il pose trois conditions EN PLUS de l'admission elle-même. Que la jurisprudence du pays d'admission soit fondée sur les principes de la common law anglaise — le Board n'en publie aucune liste et apprécie chaque dossier, lui seul se prononçant. Que la durée cumulée de vos études et de votre formation atteigne celle d'un cursus américain agréé. Et qu'un LL.M. américain conforme soit accompli. Réunissez dès maintenant l'attestation de votre formation en cabinet avec ses dates exactes : c'est la pièce que ce texte exige en propre, et celle qui dépend le plus d'un tiers.",
  // S'AJOUTE à TB-NY-VIA-LLM. Ne retire pas la voie : beaucoup de juristes
  // passent le barreau de New York puis rentrent, et écrire à quelqu'un que
  // cette voie n'est pas la sienne parce qu'il compte revenir serait faux.
  "TB-ALTERNATIVE":
    "Vous visez un exercice en France, et cela ne ferme pas cette voie : nombre de juristes passent le barreau de New York puis rentrent, l'admission restant un marqueur solide auprès des cabinets internationaux. Cela déplace en revanche l'ordre des priorités — le retour se prépare pendant le séjour et non après, et d'autres options peuvent servir le même objectif à moindre coût. Votre rapport les met en regard de la voie du barreau plutôt que de trancher à votre place.",
  "TB-HUMAN-REVIEW":
    "Votre situation demande une lecture humaine avant toute orientation : elle sera examinée par le fondateur lors de la préparation de votre rapport.",
};
