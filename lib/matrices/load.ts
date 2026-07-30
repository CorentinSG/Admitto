import { blockRevisionStore, ruleRevisionStore } from "@/lib/store/matrices";
import type { Assessment } from "@/lib/assessment/compute";
import { assembleReport, type Report, type ReportBlockOverrides } from "@/lib/report/assemble";
import type { Rule } from "@/lib/engine-a/types";
import {
  resolveBlocksAsOf,
  riskBlocksFrom,
  verdictBlocksFrom,
  voieBlocksFrom,
} from "./blocks";
import { effectiveRules } from "./rules";

/**
 * Chargement des matrices vivantes (CDC §33).
 *
 * Deux moments, deux dates — et la distinction est tout le mécanisme de gel :
 *
 * — **Au calcul d'un diagnostic** (`liveMatrices`) : règles et blocs de voie
 *   résolus À MAINTENANT. Le résultat est ensuite figé dans l'évaluation
 *   (`textBlocks`, `rulesSnapshot`) comme il l'a toujours été.
 *
 * — **Au rendu d'un rapport** (`assembleReportLive`) : blocs résolus À LA DATE
 *   DE L'ÉVALUATION. Les révisions étant append-only et datées, un rapport
 *   rouvert cite les blocs tels qu'ils étaient à sa génération — et une
 *   révision publiée entre-temps ne réécrit pas l'histoire.
 *
 * Sans base, les deux rendent le contenu du code : le produit reste jouable
 * en régime mémoire, et l'édition n'y est de toute façon pas atteignable
 * (le back-office exige la base).
 */

export interface LiveMatrices {
  rules: Rule[];
  voieBlocks: Record<string, string>;
}

export async function liveMatrices(reference: Date = new Date()): Promise<LiveMatrices> {
  const [ruleRevisions, blockRevisions] = await Promise.all([
    ruleRevisionStore.latest(),
    blockRevisionStore.all(),
  ]);
  const resolved = resolveBlocksAsOf(blockRevisions, reference);
  return {
    rules: effectiveRules(ruleRevisions),
    voieBlocks: voieBlocksFrom(resolved),
  };
}

export async function reportOverridesAsOf(date: Date): Promise<ReportBlockOverrides> {
  const resolved = resolveBlocksAsOf(await blockRevisionStore.all(), date);
  return { verdicts: verdictBlocksFrom(resolved), risks: riskBlocksFrom(resolved) };
}

/** Assemble le rapport avec les blocs en vigueur à la date de l'évaluation. */
export async function assembleReportLive(assessment: Assessment): Promise<Report> {
  return assembleReport(assessment, await reportOverridesAsOf(new Date(assessment.createdAt)));
}
