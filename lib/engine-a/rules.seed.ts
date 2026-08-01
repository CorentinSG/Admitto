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
 * pour tout profil au-delà de la licence. R-NY-002 l'emporte sur elle quand les
 * deux se déclenchent. R-ALT-001 devient inopérante dès que R-NY-001 est active,
 * `ALTERNATIVE_TO_EXAMINE` étant la voie la moins prioritaire.
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
    // Admission à un barreau étranger : peut ouvrir un examen de voie directe.
    //
    // VÉRIFIÉE le 2026-08-01, et TOUJOURS INACTIVE — la vérification a conclu
    // contre elle, ce qui est un résultat et non un report :
    //
    //   1. FRANCE est SORTIE de la condition. Le § 520.6(b)(2), seul texte
    //      visant les avocats déjà admis, est réservé aux pays « whose
    //      jurisprudence is based upon principles of English Common Law ». La
    //      France en est exclue, et le § 520.10(a)(1)(ii) pose la même limite
    //      pour l'admission sans examen.
    //   2. « Voie directe » est INEXACT même pour les profils légitimes : le
    //      § 520.6(b)(2) exige en outre un LL.M. Le bloc de texte a été corrigé
    //      en conséquence (voir TB-DIRECT-PATH).
    //
    // CE QUI RESTE À TRANCHER AVANT TOUTE ACTIVATION : `OTHER_COUNTRY` ne dit
    // pas de quel pays il s'agit. Un avocat allemand ou espagnol relève d'un
    // système civiliste au même titre qu'un avocat français, et la condition de
    // common law n'est donc pas davantage établie pour lui. Sortir la France
    // était nécessaire, ce n'est pas suffisant : il faut soit recueillir le pays
    // d'admission, soit faire de cette règle un renvoi en revue humaine.
    condition: { field: "foreignBar", op: "eq", value: "OTHER_COUNTRY" },
    factProduced: "DIRECT_PATH_TO_EXAMINE",
    textBlockId: "TB-DIRECT-PATH",
    sourceUrl: "https://www.nybarexam.org/Rules/Rules.htm",
    verifiedAt: null,
    version: 1,
    active: false,
  },
  {
    id: "R-ALT-001",
    // Objectif de retour en France : d'autres voies que le barreau de New York
    // méritent d'être examinées.
    //
    // N'énonce AUCUN droit américain — sa source est le profil déclaré. Ce
    // qu'elle affirme est un jugement stratégique : qu'un projet de retour
    // oriente ailleurs qu'un barreau américain. Beaucoup de juristes passent le
    // barreau de New York puis rentrent. Décision métier, pas vérification de
    // source. Sans effet une fois R-NY-001 active (voir l'en-tête).
    condition: {
      all: [
        { field: "geoGoal", op: "eq", value: "RETURN_FRANCE" },
        { field: "careerGoal", op: "eq", value: "RETURN_FRANCE" },
      ],
    },
    factProduced: "ALTERNATIVE_TO_EXAMINE",
    textBlockId: "TB-ALTERNATIVE",
    sourceUrl: "interne:profil",
    verifiedAt: null,
    version: 1,
    active: false,
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
  // Ne promet plus d'« examen de voie directe » : le texte applicable aux
  // avocats déjà admis exige en outre un LL.M., et il est réservé aux systèmes
  // de common law. Une admission étrangère n'ouvre donc rien à elle seule.
  "TB-DIRECT-PATH":
    "Votre admission à un barreau étranger est un élément de votre dossier, mais elle ne dispense par elle-même d'aucune des conditions posées à l'accès à l'examen. Son effet dépend du système juridique du pays d'admission et s'apprécie avec le reste de votre parcours. Cette appréciation relève exclusivement du New York Board of Law Examiners.",
  "TB-ALTERNATIVE":
    "Votre objectif géographique et professionnel oriente vers d'autres options que l'admission à un barreau américain. Ces alternatives sont examinées dans votre rapport.",
  "TB-HUMAN-REVIEW":
    "Votre situation demande une lecture humaine avant toute orientation : elle sera examinée par le fondateur lors de la préparation de votre rapport.",
};
