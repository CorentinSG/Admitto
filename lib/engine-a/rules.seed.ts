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
    condition: {
      all: [
        { field: "education", op: "in", value: ["M1", "M2", "CRFPA", "CAPA", "DOCTORAT"] },
        { field: "journeyType", op: "neq", value: null },
      ],
    },
    factProduced: "NY_VIA_LLM_SUBJECT_TO_BOLE",
    textBlockId: "TB-NY-VIA-LLM",
    sourceUrl: "https://www.nybarexam.org/Rules/Rules.htm",
    verifiedAt: null,
    version: 1,
    active: false,
  },
  {
    id: "R-NY-002",
    // Admission à un barreau étranger : peut ouvrir un examen de voie directe.
    condition: { field: "foreignBar", op: "in", value: ["FRANCE", "OTHER_COUNTRY"] },
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
  "TB-DIRECT-PATH":
    "Une admission à un barreau étranger peut, selon les cas, ouvrir un examen de voie directe. Cette appréciation relève exclusivement du New York Board of Law Examiners et suppose l'examen de votre dossier complet.",
  "TB-ALTERNATIVE":
    "Votre objectif géographique et professionnel oriente vers d'autres options que l'admission à un barreau américain. Ces alternatives sont examinées dans votre rapport.",
  "TB-HUMAN-REVIEW":
    "Votre situation demande une lecture humaine avant toute orientation : elle sera examinée par le fondateur lors de la préparation de votre rapport.",
};
