import { FRENCH_UNIVERSITIES } from "@/lib/partnerships/data";
import type { ScreenId } from "@/lib/questionnaire/types";

/**
 * Contenu des douze écrans du questionnaire (CDC §12.3).
 * Une question principale par écran, réponses par boutons — aucun champ libre
 * obligatoire, un seul champ libre facultatif au dernier écran.
 */

export interface Option {
  value: string;
  label: string;
  hint?: string;
}

export interface Screen {
  id: ScreenId;
  question: string;
  helper?: string;
  options: Option[];
}

export const intro = {
  badge: "✦ DIAGNOSTIC GRATUIT",
  title: "Quelques questions pour situer votre projet.",
  body: "Douze écrans, une question à la fois, trois à quatre minutes. Aucune création de compte. Vous obtenez votre résultat préliminaire immédiatement.",
  cta: "Commencer",
  legal:
    "Vos réponses servent à préparer votre résultat préliminaire et votre rapport. Elles ne sont ni revendues ni utilisées pour de la prospection sans votre accord distinct.",
};

export const ui = {
  back: "Retour",
  next: "Continuer",
  submit: "Obtenir mon résultat",
  stepLabel: (step: number, total: number) => `Étape ${step} sur ${total}`,
  optionalComment: "Un point que vous souhaitez préciser ? (facultatif)",
  firstName: "Prénom",
  email: "Adresse email",
  deliverable:
    "Vous recevez immédiatement votre résultat préliminaire à l'écran, puis votre rapport éducatif et stratégique personnalisé par email.",
  submitting: "Analyse en cours…",
};

export const SCREENS: Screen[] = [
  {
    id: "status",
    question: "Où en êtes-vous aujourd'hui ?",
    helper: "Choisissez la situation qui décrit le mieux votre position actuelle.",
    options: [
      { value: "EXPLORING_LLM", label: "J'explore l'idée d'un LL.M." },
      { value: "APPLYING", label: "Je prépare mes candidatures" },
      { value: "ADMITTED_OR_ENROLLED", label: "Je suis admis ou déjà inscrit en LL.M." },
      { value: "TARGETING_BAR", label: "Je vise le barreau de New York" },
      { value: "LAWYER_EXPLORING", label: "Je suis avocat et j'étudie mes options" },
    ],
  },
  {
    id: "education",
    question: "Quel est votre niveau de formation juridique atteint ?",
    helper: "Le diplôme le plus avancé que vous avez validé, ou que vous validez cette année.",
    options: [
      { value: "LICENCE", label: "Licence en droit" },
      { value: "M1", label: "Master 1" },
      { value: "M2", label: "Master 2" },
      { value: "CRFPA", label: "CRFPA (école d'avocats en cours)" },
      { value: "CAPA", label: "CAPA obtenu" },
      { value: "DOCTORAT", label: "Doctorat" },
      { value: "AUTRE", label: "Autre parcours" },
    ],
  },
  {
    id: "university",
    question: "Dans quelle université avez-vous étudié ?",
    helper: "Certaines universités françaises ont des accords avec des law schools américaines.",
    options: FRENCH_UNIVERSITIES.map((u) => ({ value: u, label: u })),
  },
  {
    id: "foreignBar",
    question: "Êtes-vous admis à un barreau ?",
    helper: "Une admission existante peut ouvrir d'autres voies d'examen.",
    options: [
      { value: "NONE", label: "Non, pas encore" },
      { value: "FRANCE", label: "Oui, en France" },
      { value: "OTHER_COUNTRY", label: "Oui, dans un autre pays" },
    ],
  },
  {
    id: "careerGoal",
    question: "Quel type de carrière visez-vous ?",
    helper: "Une réponse indicative suffit : elle sera affinée plus tard.",
    options: [
      { value: "BIG_LAW", label: "Grand cabinet international" },
      { value: "SMALLER_FIRM", label: "Cabinet de taille plus réduite" },
      { value: "IMMIGRATION", label: "Droit de l'immigration" },
      { value: "ARBITRATION", label: "Arbitrage international" },
      { value: "IN_HOUSE_COMPLIANCE", label: "Entreprise / conformité" },
      { value: "INTERNATIONAL_ORG", label: "Organisation internationale" },
      { value: "RETURN_FRANCE", label: "Valoriser le parcours en France" },
      { value: "UNDECIDED", label: "Je ne sais pas encore" },
      { value: "TOO_EARLY", label: "Trop tôt pour le dire" },
    ],
  },
  {
    id: "geoGoal",
    question: "Où souhaitez-vous exercer à terme ?",
    options: [
      { value: "STAY_US", label: "Rester aux États-Unis" },
      { value: "RETURN_FRANCE", label: "Rentrer en France" },
      { value: "KEEP_BOTH", label: "Garder les deux options ouvertes" },
    ],
  },
  {
    id: "budget",
    question: "Quel budget total pouvez-vous envisager ?",
    helper: "Tuition et coût de la vie compris, avant bourses éventuelles.",
    options: [
      { value: "UNDER_30K", label: "Moins de 30 000 $" },
      { value: "30_60K", label: "30 000 à 60 000 $" },
      { value: "60_100K", label: "60 000 à 100 000 $" },
      { value: "OVER_100K", label: "Plus de 100 000 $" },
      { value: "UNDEFINED", label: "Je ne l'ai pas encore défini" },
    ],
  },
  {
    id: "funding",
    question: "Comment envisagez-vous de financer le projet ?",
    options: [
      { value: "LOAN", label: "Prêt" },
      { value: "SCHOLARSHIPS", label: "Bourses" },
      { value: "BOTH", label: "Les deux" },
      { value: "NONE", label: "Aucune option identifiée" },
      { value: "NOT_CONSIDERED", label: "Je n'y ai pas encore réfléchi" },
    ],
  },
  {
    id: "intake",
    question: "Quelle rentrée visez-vous ?",
    helper: "Les LL.M. américains démarrent en août.",
    options: [
      { value: "Y1", label: "L'an prochain" },
      { value: "Y2", label: "Dans deux ans" },
      { value: "Y3", label: "Dans trois ans" },
      { value: "LATER", label: "Plus tard" },
      { value: "UNDECIDED", label: "Ce n'est pas encore décidé" },
      { value: "ALREADY_STARTED", label: "Mon LL.M. a déjà commencé" },
    ],
  },
  {
    id: "english",
    question: "Où en êtes-vous avec le test d'anglais ?",
    helper: "TOEFL ou IELTS selon les écoles visées.",
    options: [
      { value: "TEST_TAKEN", label: "Test déjà passé" },
      { value: "TEST_PLANNED", label: "Test programmé" },
      { value: "PREP_STARTED", label: "Préparation commencée" },
      { value: "NOT_STARTED", label: "Pas encore commencé" },
    ],
  },
  {
    id: "usStatus",
    question: "Quel est votre statut au regard des États-Unis ?",
    helper: "Cette réponse détermine si la question du visa se pose pour vous.",
    options: [
      { value: "FR_NO_STATUS", label: "Français, sans statut américain" },
      { value: "EXISTING_VISA_STATUS", label: "J'ai déjà un visa ou un statut" },
      { value: "US_DUAL_NATIONAL", label: "Je suis double national américain" },
      { value: "OTHER", label: "Autre situation" },
    ],
  },
  {
    id: "contact",
    question: "Où envoyer votre rapport ?",
    options: [],
  },
];
