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
 * pour tout profil au-delà de la licence. R-NY-002 produit la MÊME voie qu'elle
 * et n'ajoute qu'un bloc de texte : elle ne change donc aucune orientation, ce
 * qui est précisément ce que la vérification du 2026-08-02 a établi. R-ALT-001
 * devient inopérante dès que R-NY-001 est active, `ALTERNATIVE_TO_EXAMINE`
 * étant la voie la moins prioritaire.
 *
 * `DIRECT_PATH_TO_EXAMINE` n'est produite par AUCUNE règle, et le restera tant
 * qu'une source ne décrira pas une voie qui se passe d'un passage aux
 * États-Unis. La catégorie reste dans la liste fermée du CDC §14.1 — la vider
 * de son contenu est un constat, la retirer serait modifier le cahier des
 * charges.
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
    condition: { field: "foreignBar", op: "in", value: ["FRANCE", "OTHER_COUNTRY"] },
    factProduced: "NY_VIA_LLM_SUBJECT_TO_BOLE",
    textBlockId: "TB-FOREIGN-BAR",
    sourceUrl: "https://www.nybarexam.org/foreign/foreignlegaleducation.htm",
    verifiedAt: "2026-08-02",
    version: 2,
    active: true,
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
  // S'AJOUTE à TB-NY-VIA-LLM, il ne le remplace pas : une admission étrangère
  // ne change pas la voie, elle ajoute des pièces au dossier. Le texte dit
  // aussi ce que le BOLE ne publie pas — l'absence de liste est justement ce
  // qui interdit au produit de trancher par pays.
  "TB-FOREIGN-BAR":
    "Votre admission à un barreau étranger est un élément de votre dossier, et non une dispense : le texte réservé aux avocats déjà admis exige lui aussi un LL.M. américain, et l'admission sans examen suppose un premier diplôme obtenu aux États-Unis. Le New York Board of Law Examiners ne publie aucune liste des pays dont la jurisprudence est fondée sur les principes de la common law anglaise : il procède à une évaluation individuelle du dossier, et lui seul se prononce. Le pays d'admission et la façon dont vous l'avez obtenue — diplôme de droit, ou combinaison d'études et de formation en cabinet — sont donc à documenter.",
  "TB-ALTERNATIVE":
    "Votre objectif géographique et professionnel oriente vers d'autres options que l'admission à un barreau américain. Ces alternatives sont examinées dans votre rapport.",
  "TB-HUMAN-REVIEW":
    "Votre situation demande une lecture humaine avant toute orientation : elle sera examinée par le fondateur lors de la préparation de votre rapport.",
};
