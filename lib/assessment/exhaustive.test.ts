import { describe, expect, it } from "vitest";
import {
  BUDGET,
  CAREER_GOAL,
  EDUCATION,
  ENGLISH,
  FOREIGN_BAR,
  FUNDING,
  GEO_GOAL,
  INTAKE,
  JOURNEY_STATUS,
  US_STATUS,
  type Answers,
} from "@/lib/questionnaire/types";
import { UNIVERSITIES } from "@/content/universities";
import { computeAssessment } from "./compute";
import { assembleReport } from "@/lib/report/assemble";
import { PRELIMINARY_PATHS } from "@/lib/engine-a/types";
import { AXES, VERDICTS } from "@/lib/engine-b/verdict";
import { generateRoadmap, applicableTasks } from "@/lib/roadmap/generate";
import { selectNextBestAction } from "@/lib/roadmap/next-best-action";
import { computeProgress, milestoneStates, personalStats } from "@/lib/roadmap/progress";
import { TASK_STATUSES } from "@/lib/roadmap/types";
import { deriveProfile } from "@/lib/profile/derive";
import { scheduleSequence } from "@/lib/email/schedule";
import { buildTimeline } from "@/lib/roadmap/timeline";
import { analyseList } from "@/lib/schools/balance";
import { candidatesFor } from "@/lib/schools/candidates";

/**
 * Balayage exhaustif de l'espace des profils.
 *
 * Les tests unitaires du dépôt couvrent des cas choisis : ils prouvent qu'une
 * règle fait ce qu'on attend d'elle. Ils ne disent rien de la combinatoire —
 * or c'est là que se cachent les pannes de ce produit. Un questionnaire à
 * douze écrans conditionnels produit des profils que personne n'a en tête, et
 * un seul d'entre eux suffit à faire lever l'assemblage du rapport, à produire
 * une date invalide ou à laisser un `{placeholder}` dans un texte envoyé.
 *
 * Ce fichier parcourt donc le produit cartésien complet des cinq champs qui
 * pilotent les moteurs, en faisant varier les cinq autres de façon
 * déterministe à chaque itération — chaque valeur de chaque champ apparaît
 * ainsi dans des contextes très différents, sans exploser en 6,8 millions de
 * combinaisons.
 *
 * Les invariants vérifiés sont ceux qui, s'ils tombaient, produiraient un
 * document faux plutôt qu'une erreur visible : un texte à trou, un coût
 * négatif, une date impossible, un verdict hors liste.
 */

const REFERENCE = new Date("2026-07-30T12:00:00.000Z");

/** Ce qui n'a rien à faire dans un texte destiné à un lecteur. */
const BROKEN_TEXT = /\{[a-zA-Z]+\}|undefined|NaN|\[object Object\]/;

/** Vocabulaire interdit par le CDC §5–7, quel que soit le profil. */
const FORBIDDEN = /vous êtes éligible|garanti|attorney[- ]reviewed|\bEsq\.|probabilité de réussite/i;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isRealDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

/** Champs secondaires, parcourus en rotation pour varier les contextes. */
const cycles = {
  foreignBar: FOREIGN_BAR,
  geoGoal: GEO_GOAL,
  funding: FUNDING,
  english: ENGLISH,
  university: [...UNIVERSITIES.map((u) => u.id), "inconnue-hors-base", undefined],
} as const;

interface Combo {
  answers: Answers;
  label: string;
}

function* allCombos(): Generator<Combo> {
  let n = 0;
  for (const status of JOURNEY_STATUS) {
    for (const education of EDUCATION) {
      for (const careerGoal of CAREER_GOAL) {
        for (const intake of INTAKE) {
          for (const usStatus of US_STATUS) {
            for (const budget of BUDGET) {
              const answers: Answers = {
                status,
                education,
                careerGoal,
                intake,
                usStatus,
                budget,
                foreignBar: cycles.foreignBar[n % cycles.foreignBar.length],
                geoGoal: cycles.geoGoal[n % cycles.geoGoal.length],
                funding: cycles.funding[n % cycles.funding.length],
                english: cycles.english[n % cycles.english.length],
                university: cycles.university[n % cycles.university.length],
                firstName: "Alex",
                email: "alex@example.com",
                consentMarketing: n % 2 === 0,
              };
              n += 1;
              yield {
                answers,
                label: [status, education, careerGoal, intake, usStatus, budget].join("/"),
              };
            }
          }
        }
      }
    }
  }
}

/**
 * Profils partiels : un écran non affiché laisse son champ `undefined`, et le
 * CDC exige qu'une réponse absente ne vaille jamais une réponse positive.
 * Chaque champ est retiré isolément, puis tous ensemble.
 */
function* partialCombos(): Generator<Combo> {
  const complete: Answers = {
    status: "APPLYING",
    education: "M2",
    university: "assas",
    foreignBar: "NONE",
    careerGoal: "BIG_LAW",
    geoGoal: "KEEP_BOTH",
    budget: "60_100K",
    funding: "BOTH",
    intake: "Y1",
    english: "TEST_TAKEN",
    usStatus: "FR_NO_STATUS",
    firstName: "Alex",
    email: "alex@example.com",
  };

  for (const key of Object.keys(complete) as Array<keyof Answers>) {
    const answers = { ...complete };
    delete answers[key];
    yield { answers, label: `sans ${key}` };
  }

  // Le cas limite absolu : rien n'a été répondu.
  yield { answers: {}, label: "aucune réponse" };
  yield { answers: { firstName: "Alex" }, label: "prénom seul" };
}

/**
 * Rend la liste des écarts constatés, plutôt que d'assertionner sur place.
 *
 * `expect` coûte plusieurs microsecondes par appel : à trente assertions par
 * profil et sept mille cinq cents profils, le balayage passait cinquante
 * secondes dans le harnais de test et non dans le code testé. Ici, les
 * contrôles sont du JavaScript ordinaire et une seule assertion porte le
 * verdict — avec la liste complète de ce qui a échoué, pas seulement le
 * premier cas.
 */
function problemsOf({ answers, label }: Combo): string[] {
  const problems: string[] = [];
  const fail = (message: string) => problems.push(`${label} — ${message}`);

  let assessment;
  try {
    assessment = computeAssessment(answers, REFERENCE, `x-${label}`);
  } catch (error) {
    return [`${label} — computeAssessment a levé : ${String(error)}`];
  }

  // ── Voie préliminaire et traçabilité ────────────────────────────────────
  if (!(PRELIMINARY_PATHS as readonly string[]).includes(assessment.path)) {
    fail(`voie hors liste : ${assessment.path}`);
  }
  for (const block of assessment.textBlocks) {
    if (BROKEN_TEXT.test(block)) fail(`bloc de voie à trou : ${block.slice(0, 60)}`);
    if (FORBIDDEN.test(block)) fail(`vocabulaire interdit dans un bloc : ${block.slice(0, 60)}`);
  }

  // ── Coûts : jamais négatifs, jamais inversés, toujours finis ────────────
  for (const [name, value] of Object.entries(assessment.costs)) {
    if (typeof value !== "object" || value === null || !("lowUsd" in value)) continue;
    const { lowUsd, highUsd } = value as { lowUsd: number; highUsd: number };
    if (!Number.isFinite(lowUsd) || !Number.isFinite(highUsd)) fail(`coût non fini : ${name}`);
    if (lowUsd < 0) fail(`coût négatif : ${name}`);
    if (highUsd < lowUsd) fail(`fourchette inversée : ${name}`);
  }

  // ── Échéances : chaque date existe réellement ───────────────────────────
  for (const deadline of assessment.deadlines) {
    if (!isRealDate(deadline.date)) fail(`échéance impossible ${deadline.key} : ${deadline.date}`);
    if (BROKEN_TEXT.test(deadline.label)) fail(`libellé d'échéance à trou : ${deadline.label}`);
  }

  // ── Rapport : le document qui part au lecteur ───────────────────────────
  let report;
  try {
    report = assembleReport(assessment);
  } catch (error) {
    return [...problems, `${label} — assembleReport a levé : ${String(error)}`];
  }

  if (!(VERDICTS as readonly string[]).includes(report.verdict)) {
    fail(`verdict hors liste : ${report.verdict}`);
  }
  const axes = report.axes.map((a) => a.axis).sort();
  if (axes.join(",") !== [...AXES].sort().join(",")) fail(`axes incomplets : ${axes.join(",")}`);
  for (const axis of report.axes) {
    if (axis.score < 1 || axis.score > 4) fail(`note hors barème ${axis.axis} : ${axis.score}`);
  }

  const prose = [
    report.summary,
    report.pathText.join(" "),
    report.partnerships,
    report.verdictBody,
    report.risks.map((r) => `${r.title} ${r.body} ${r.actions.join(" ")}`).join(" "),
    report.nextSteps.join(" "),
    report.timelineLead,
    report.costsLead,
    report.offerBody,
    report.sourcesLead,
    report.disclaimer,
    report.axes.map((a) => a.comment).join(" "),
  ].join(" ");
  if (BROKEN_TEXT.test(prose)) {
    fail(`rapport à trou : ${prose.match(BROKEN_TEXT)?.[0]}`);
  }
  if (FORBIDDEN.test(prose)) fail(`vocabulaire interdit : ${prose.match(FORBIDDEN)?.[0]}`);

  // ── Feuille de route ────────────────────────────────────────────────────
  const derived = deriveProfile(answers, REFERENCE);
  const tasks = generateRoadmap(answers, derived.journeyType, REFERENCE);
  for (const task of tasks) {
    if (!(TASK_STATUSES as readonly string[]).includes(task.status)) {
      fail(`statut hors liste ${task.id} : ${task.status}`);
    }
    if (task.dueDate !== null && !isRealDate(task.dueDate)) {
      fail(`échéance impossible ${task.id} : ${task.dueDate}`);
    }
  }

  const progress = computeProgress(tasks);
  if (progress.percent < 0 || progress.percent > 100) {
    fail(`progression hors bornes : ${progress.percent}`);
  }
  // Aucun jalon n'est acquis d'office : le présumer gonflerait la progression
  // et offrirait un challenge non mérité.
  for (const milestone of milestoneStates(tasks)) {
    if (milestone.achieved) fail(`jalon acquis sans action : ${milestone.milestone}`);
  }

  personalStats(tasks, REFERENCE);

  // ── Timeline : positions finies et bornées, quel que soit le profil ─────
  const timeline = buildTimeline(tasks, REFERENCE);
  if (timeline) {
    for (const entry of timeline.entries) {
      if (!Number.isFinite(entry.position) || entry.position < 0 || entry.position > 100) {
        fail(`position de timeline hors axe ${entry.id} : ${entry.position}`);
      }
    }
    if (!Number.isFinite(timeline.todayPosition)) fail("repère du jour non fini");
  }

  const nba = selectNextBestAction(tasks, REFERENCE);
  if (nba) {
    const ids = applicableTasks(tasks).map((t) => t.id);
    if (!ids.includes(nba.task.id)) fail(`action recommandée hors périmètre : ${nba.task.id}`);
    if (BROKEN_TEXT.test(nba.task.delayRisk)) fail(`risque de retard à trou : ${nba.task.id}`);
  }

  // ── Séquence email : jamais de promotionnel sans consentement ───────────
  const schedule = scheduleSequence(
    new Date(assessment.createdAt),
    answers.consentMarketing === true
  );
  for (const scheduled of schedule) {
    if (!isRealDate(scheduled.sendAt.slice(0, 10))) {
      fail(`date d'envoi impossible ${scheduled.kind} : ${scheduled.sendAt}`);
    }
    if (!answers.consentMarketing && scheduled.legalBasis !== "CONTRACT") {
      fail(`email non contractuel planifié sans consentement : ${scheduled.kind}`);
    }
  }

  // ── Sélecteur d'écoles ──────────────────────────────────────────────────
  for (const candidate of candidatesFor(assessment.partnerships, [])) {
    if (!candidate.name.trim()) fail("accord proposé sans nom d'école");
  }

  return problems;
}

describe("balayage exhaustif des profils", () => {
  const combos = [...allCombos()];

  it("couvre tout le produit cartésien des champs décisifs", () => {
    // 5 statuts × 7 diplômes × 9 objectifs × 6 rentrées × 4 statuts US × 5 budgets.
    expect(combos).toHaveLength(
      JOURNEY_STATUS.length *
        EDUCATION.length *
        CAREER_GOAL.length *
        INTAKE.length *
        US_STATUS.length *
        BUDGET.length
    );
  });

  it("fait apparaître chaque valeur des champs secondaires", () => {
    // Sans cela, la rotation pourrait laisser une valeur jamais testée — et
    // le balayage donnerait une fausse impression d'exhaustivité.
    for (const [field, values] of Object.entries(cycles)) {
      for (const value of values) {
        expect(
          combos.some((c) => c.answers[field as keyof Answers] === value),
          `${field} = ${String(value)}`
        ).toBe(true);
      }
    }
  });

  it(
    "produit un profil complet et cohérent pour chaque combinaison",
    () => {
      const problems = combos.flatMap(problemsOf);
      // Les vingt premiers suffisent à diagnostiquer : la liste entière
      // noierait la sortie si une règle commune cassait.
      expect(problems.slice(0, 20), `${problems.length} profil(s) en défaut`).toEqual([]);
    },
    // 7 560 profils × rapport complet : quatre secondes sur une machine au
    // repos, davantage pendant que les suites navigateur tournent à côté. Le
    // plafond par défaut (5 s) rendait ce test rouge selon la charge — un
    // test qui peut échouer sans que rien ne soit cassé ne protège plus rien.
    { timeout: 60_000 }
  );

  it("supporte tout profil partiel, y compris vide", () => {
    const problems = [...partialCombos()].flatMap(problemsOf);
    expect(problems, "profils partiels").toEqual([]);
  });

  it("constate une liste d'écoles vide comme telle", () => {
    expect(analyseList([], REFERENCE).observations.map((o) => o.kind)).toEqual(["EMPTY"]);
  });
});
