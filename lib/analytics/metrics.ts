import type { Assessment } from "@/lib/assessment/compute";
import type { ReportRecord } from "@/lib/store/reports";
import { coverageRate } from "@/lib/partnerships/detect";

/**
 * Métriques du back-office (CDC §36).
 *
 * Deux principes.
 *
 * 1. **Aucun taux inventé sur un dénominateur nul.** Un taux calculé sur zéro
 *    observation vaut `null`, jamais 0 %. « 0 % de conversion » sur zéro
 *    rapport envoyé se lit comme un échec ; l'absence de mesure doit se lire
 *    comme une absence de mesure.
 * 2. **Chaque chiffre porte son dénominateur.** Une conversion « 40 % » sur
 *    cinq rapports n'a pas la même valeur que sur cinq cents, et c'est
 *    précisément à ce stade du produit que la confusion serait coûteuse.
 */

export interface Metric {
  /** `null` quand la mesure n'a pas d'observation : ce n'est pas zéro. */
  value: number | null;
  /** Nombre d'observations sur lequel la valeur est calculée. */
  sample: number;
}

const metric = (value: number | null, sample: number): Metric => ({
  value: sample === 0 ? null : value,
  sample,
});

/** Pourcentage entier, ou `null` si le dénominateur est nul. */
function rate(numerator: number, denominator: number): Metric {
  return metric(denominator === 0 ? null : Math.round((numerator / denominator) * 100), denominator);
}

/** Médiane en heures entre deux instants ISO, sur les paires complètes. */
function medianHours(pairs: Array<[string, string | null]>): Metric {
  const durations = pairs
    .filter((p): p is [string, string] => p[1] !== null)
    .map(([from, to]) => (Date.parse(to) - Date.parse(from)) / 3_600_000)
    .filter((h) => Number.isFinite(h) && h >= 0)
    .sort((a, b) => a - b);

  if (durations.length === 0) return metric(null, 0);
  const middle = Math.floor(durations.length / 2);
  const value =
    durations.length % 2 === 0
      ? (durations[middle - 1] + durations[middle]) / 2
      : durations[middle];
  return metric(Math.round(value * 10) / 10, durations.length);
}

export interface Metrics {
  /** Diagnostics soumis. */
  assessments: number;
  /** Rapports mis en file. */
  reports: number;
  reportsSent: Metric;
  /** Métrique centrale du CDC §36 : conversion rapport → achat. */
  conversionToPaid: Metric;
  /** Heures médianes entre la mise en file et l'envoi. */
  productionHours: Metric;
  /** Corrections humaines par rapport envoyé — proxy du temps humain (CDC §36). */
  correctionsPerReport: Metric;
  /** Part des rapports envoyés ayant demandé au moins un arbitrage consigné. */
  reportsWithCorrections: Metric;
  /** Part des diagnostics dont l'université figure dans la base (CDC §27). */
  partnershipDetection: Metric;
  /** Part des diagnostics qui ont ouvert leur feuille de route. */
  roadmapActivation: Metric;
}

export interface MetricsInput {
  assessments: Assessment[];
  reports: ReportRecord[];
  /** Identifiants d'évaluation ayant au moins une tâche touchée. */
  activatedRoadmaps: string[];
}

export function computeMetrics(input: MetricsInput): Metrics {
  const { assessments, reports, activatedRoadmaps } = input;

  const sent = reports.filter((r) => r.status === "SENT");
  const paid = reports.filter((r) => r.priority === "PAID");

  const corrections = sent.reduce((total, r) => total + r.corrections.length, 0);

  return {
    assessments: assessments.length,
    reports: reports.length,
    reportsSent: rate(sent.length, reports.length),

    // Rapportée aux rapports ENVOYÉS, pas aux rapports en file : un rapport
    // jamais parti n'a pas eu l'occasion de convertir.
    conversionToPaid: rate(paid.length, sent.length),

    productionHours: medianHours(sent.map((r) => [r.createdAt, r.sentAt])),

    correctionsPerReport: metric(
      sent.length === 0 ? null : Math.round((corrections / sent.length) * 10) / 10,
      sent.length
    ),
    reportsWithCorrections: rate(
      sent.filter((r) => r.corrections.length > 0).length,
      sent.length
    ),

    partnershipDetection: metric(
      assessments.length === 0 ? null : coverageRate(assessments.map((a) => a.answers.university)),
      assessments.length
    ),

    roadmapActivation: rate(activatedRoadmaps.length, assessments.length),
  };
}

/** Rendu d'une métrique : jamais « 0 % » là où il n'y a pas d'observation. */
export function formatMetric(value: Metric, unit: "%" | "h" | ""): string {
  if (value.value === null) return "—";
  return `${value.value}${unit === "%" ? " %" : unit === "h" ? " h" : ""}`;
}
