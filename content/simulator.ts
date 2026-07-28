import type { ScenarioInputs } from "@/lib/simulator/types";

/** Copie du simulateur de coût (CDC §26). */

export interface FieldGroup {
  title: string;
  note?: string;
  fields: Array<{
    key: keyof ScenarioInputs;
    label: string;
    unit: "usd" | "usdMonthly" | "months";
  }>;
}

export const FIELD_GROUPS: FieldGroup[] = [
  {
    title: "Coût académique",
    fields: [
      { key: "tuition", label: "Frais de scolarité", unit: "usd" },
      { key: "universityFees", label: "Frais universitaires annexes", unit: "usd" },
      { key: "lsac", label: "Frais LSAC et dossiers", unit: "usd" },
      { key: "translations", label: "Traductions et certifications", unit: "usd" },
    ],
  },
  {
    title: "Coût de la vie",
    note: "Les montants mensuels sont multipliés par la durée du séjour.",
    fields: [
      { key: "studyMonths", label: "Durée du séjour d'études", unit: "months" },
      { key: "housingMonthly", label: "Logement", unit: "usdMonthly" },
      { key: "dailyLivingMonthly", label: "Vie quotidienne", unit: "usdMonthly" },
      { key: "transportMonthly", label: "Transport", unit: "usdMonthly" },
      { key: "insurance", label: "Assurance santé", unit: "usd" },
      { key: "visa", label: "Visa et démarches", unit: "usd" },
      { key: "travel", label: "Voyages", unit: "usd" },
    ],
  },
  {
    title: "Coût du barreau",
    fields: [
      { key: "barPrep", label: "Préparation à l'examen", unit: "usd" },
      { key: "exams", label: "Frais d'examen", unit: "usd" },
      { key: "retake", label: "Budget d'un éventuel repassage", unit: "usd" },
    ],
  },
  {
    title: "Après le diplôme",
    fields: [
      { key: "admission", label: "Frais d'admission", unit: "usd" },
      { key: "noIncomeMonths", label: "Période sans revenu", unit: "months" },
    ],
  },
  {
    title: "Ressources déduites",
    note: "Elles n'abaissent pas le coût total, seulement le coût net.",
    fields: [
      { key: "scholarships", label: "Bourses", unit: "usd" },
      { key: "partnerships", label: "Partenariats", unit: "usd" },
    ],
  },
];

export const simulator = {
  title: "Simulateur de coût",
  intro:
    "Chiffrez votre projet poste par poste et comparez jusqu'à trois scénarios. Les valeurs de départ sont des ordres de grandeur destinés à amorcer la réflexion : chaque école, chaque bailleur et chaque prestataire publie ses propres montants, qui priment sur ceux-ci.",
  noRoi:
    "Ce simulateur chiffre une dépense. Il ne prédit aucun revenu, aucune rentabilité et aucun retour sur investissement.",
  cityLabel: "Ville",
  cityNote: "Choisir une ville préremplit logement, vie quotidienne et transport.",
  scenarioName: "Nom du scénario",
  outputs: {
    academic: "Coût académique",
    living: "Coût de la vie",
    bar: "Coût du barreau",
    postGraduation: "Coût post-graduation",
    total: "Coût total",
    net: "Coût net",
  },
  netNote: "Coût total diminué des bourses et des partenariats.",
  save: "Enregistrer ce scénario",
  saved: "Scénario enregistré",
  remove: "Supprimer",
  newScenario: "Nouveau scénario",
  comparisonTitle: "Comparaison",
  comparisonEmpty: "Enregistrez un premier scénario pour lancer la comparaison.",
  limitReached:
    "Trois scénarios au maximum peuvent être comparés. Supprimez-en un pour en enregistrer un autre.",
  cheapest: "Coût net le plus bas",
};
