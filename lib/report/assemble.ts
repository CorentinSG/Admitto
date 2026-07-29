import type { Assessment } from "@/lib/assessment/compute";
import { buildVerdictInput } from "@/lib/engine-b/score";
import { computeVerdict, AXES, type Axis, type AxisScore, type Verdict } from "@/lib/engine-b/verdict";
import { recommendOffer, type RecommendedOffer } from "@/lib/offers/recommend";
import { bestCostAdvantage } from "@/lib/partnerships/detect";
import { universityName } from "@/content/universities";
import { formatUsd } from "@/lib/costs/estimate";
import { fill, type ReportVariables } from "./fill";
import {
  AXIS_COMMENTS,
  AXIS_LABELS,
  NEXT_STEPS,
  OFFER_BLOCKS,
  REPORT_STATIC,
  RISK_BLOCKS,
  VERDICT_BLOCKS,
} from "@/content/report-blocks";
import { PATH_LABELS } from "@/content/result";
import { RULES } from "@/lib/engine-a/rules.seed";
import type { Deadline } from "@/lib/deadlines/compute";
import type { PreliminaryPath } from "@/lib/engine-a/types";

/**
 * Assemblage du rapport personnalisé (CDC §17).
 *
 * Le rapport est intégralement composé de blocs pré-rédigés. Le seul traitement
 * dynamique est la substitution des variables autorisées par `fill`, et la
 * sélection des blocs par les sorties des deux moteurs. Aucun texte n'est
 * produit librement.
 *
 * Chaque rapport doit être revu humainement avant envoi : l'assemblage produit
 * un projet de rapport, pas un rapport envoyable.
 */

export interface ReportAxis {
  axis: Axis;
  label: string;
  score: AxisScore;
  comment: string;
}

export interface ReportRisk {
  axis: Axis;
  title: string;
  body: string;
  actions: string[];
}

export interface ReportSource {
  label: string;
  url: string;
  verifiedAt: string | null;
}

export interface Report {
  assessmentId: string;
  generatedAt: string;
  firstName: string;
  summary: string;
  path: PreliminaryPath;
  pathLabel: string;
  pathText: string[];
  partnerships: string;
  axes: ReportAxis[];
  verdict: Verdict;
  verdictTitle: string;
  verdictBody: string;
  shiftIntake: boolean;
  risks: ReportRisk[];
  nextSteps: string[];
  timelineLead: string;
  timeline: Deadline[];
  costsLead: string;
  recommendedOffer: RecommendedOffer;
  offerName: string;
  offerBody: string;
  sources: ReportSource[];
  sourcesLead: string;
  signature: string[];
  disclaimer: string;
}

const PHASE_LABELS: Record<string, string> = {
  CLARIFICATION: "clarification",
  CAREER_STRATEGY: "stratégie professionnelle",
  LLM_SELECTION: "sélection du LL.M.",
  APPLICATIONS: "candidatures",
  FUNDING: "financement",
  VISA: "visa",
  LLM_START: "début du LL.M.",
  BOLE: "dossier d'évaluation",
  NETWORKING_INTERNSHIPS: "networking et stages",
  BAR_PREPARATION: "préparation du barreau",
  EXAM: "examen",
  ADMISSION: "admission",
  POST_ADMISSION_STRATEGY: "stratégie post-admission",
};

const JOURNEY_LABELS: Record<string, string> = {
  PRE_LLM_EXPLORER: "Pre-LL.M. Explorer",
  LLM_APPLICANT: "LL.M. Applicant",
  CURRENT_LLM_STUDENT: "Current LL.M. Student",
  BAR_CANDIDATE: "Bar Candidate",
  FOREIGN_QUALIFIED_LAWYER: "Foreign-Qualified Lawyer",
};

export function assembleReport(assessment: Assessment): Report {
  const { answers, derived, costs, deadlines, partnerships } = assessment;

  // Le partenariat confirmé le plus avantageux pèse sur l'adéquation financière.
  const costAdvantage = bestCostAdvantage(partnerships);
  const verdictInput = buildVerdictInput(answers, derived, costs, costAdvantage !== null);
  const { verdict, shiftIntake } = computeVerdict(verdictInput);
  const scores = verdictInput.scores;

  const variables: ReportVariables = {
    firstName: answers.firstName ?? "",
    university: universityName(answers.university),
    intakeDate: deadlines[0]?.date ?? "",
    totalCostLow: formatUsd(costs.total.lowUsd),
    totalCostHigh: formatUsd(costs.total.highUsd),
    partnershipCount: String(partnerships.confirmed.length),
    phase: derived.currentPhase ? PHASE_LABELS[derived.currentPhase] : "clarification",
    journeyType: derived.journeyType ? JOURNEY_LABELS[derived.journeyType] : "",
  };

  const axes: ReportAxis[] = AXES.map((axis) => ({
    axis,
    label: AXIS_LABELS[axis],
    score: scores[axis],
    comment: AXIS_COMMENTS[axis][scores[axis]],
  }));

  // Les risques découlent mécaniquement des axes faibles : aucun risque n'est
  // « inventé » pour étoffer le rapport.
  const risks: ReportRisk[] = AXES.filter((axis) => scores[axis] <= 2).map((axis) => ({
    axis,
    ...RISK_BLOCKS[axis],
  }));

  const offer = recommendOffer(verdict, derived.journeyType);

  return {
    assessmentId: assessment.id,
    generatedAt: assessment.createdAt,
    firstName: answers.firstName ?? "",
    summary: REPORT_STATIC.summaryLead,
    path: assessment.path,
    pathLabel: PATH_LABELS[assessment.path],
    pathText: assessment.textBlocks,
    partnerships: fill(
      partnerships.confirmed.length > 0
        ? REPORT_STATIC.partnershipsFound
        : REPORT_STATIC.partnershipsNone,
      variables
    ),
    axes,
    verdict,
    verdictTitle: VERDICT_BLOCKS[verdict].title,
    verdictBody: VERDICT_BLOCKS[verdict].body,
    shiftIntake,
    risks,
    nextSteps: derived.journeyType ? NEXT_STEPS[derived.journeyType] : [],
    timelineLead: REPORT_STATIC.timelineLead,
    timeline: deadlines,
    costsLead: fill(REPORT_STATIC.costsLead, variables),
    recommendedOffer: offer,
    offerName: OFFER_BLOCKS[offer].name,
    offerBody: OFFER_BLOCKS[offer].body,
    sources: sourcesUsed(assessment),
    sourcesLead: REPORT_STATIC.sourcesLead,
    signature: REPORT_STATIC.signature,
    disclaimer: REPORT_STATIC.disclaimer,
  };
}

/** Sources des règles effectivement déclenchées, avec leur date de vérification. */
function sourcesUsed(assessment: Assessment): ReportSource[] {
  return assessment.rulesSnapshot
    .map(({ id }) => RULES.find((r) => r.id === id))
    .filter((r): r is (typeof RULES)[number] => Boolean(r))
    .filter((r) => !r.sourceUrl.startsWith("interne:"))
    .map((r) => ({ label: r.id, url: r.sourceUrl, verifiedAt: r.verifiedAt }));
}
