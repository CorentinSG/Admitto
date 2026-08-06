import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { colors, fonts, alpha } from "@/design/tokens";
import { currentAssessmentId } from "@/lib/auth/current";
import { loadRoadmap } from "@/lib/roadmap/load";
import { progressByPhase } from "@/lib/roadmap/progress";
import { applicableTasks } from "@/lib/roadmap/generate";
import { dashboard, PHASE_LABELS, STATUS_LABELS } from "@/content/dashboard";
import { TaskStatusControl } from "../_components/TaskStatusControl";
import { buildTimelineView } from "@/lib/roadmap/timeline-view";
import { Timeline } from "./Timeline";
import { closedCycle, intakeWindow } from "@/lib/roadmap/window";
import { declaredDone } from "@/lib/roadmap/declared";

export const metadata: Metadata = {
  title: "Feuille de route — Admitto",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const dateFr = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

/**
 * Feuille de route personnalisée (CDC §22).
 * Les tâches sans objet pour le parcours type ne sont pas masquées : elles sont
 * reléguées en fin de page, ce qui rend le raisonnement lisible.
 */
export default async function RoadmapPage() {
  const assessmentId = await currentAssessmentId();
  // Session valide mais aucun diagnostic rattaché : le parcours reprend
  // au diagnostic, dont la soumission rattachera le profil au compte.
  if (!assessmentId) redirect("/diagnostic");

  const loaded = await loadRoadmap(assessmentId, new Date());
  if (!loaded) redirect("/diagnostic");

  const { tasks } = loaded;
  const now = new Date();

  // Timeline (CDC §22) : mêmes tâches et mêmes échéances officielles,
  // projetées sur l'axe du temps. La projection est PARTAGÉE avec le tableau
  // de bord : deux projections divergeraient sans que rien ne le signale.
  // Ce que la personne a déclaré fait au questionnaire : on le lui redit, on
  // ne coche pas à sa place.
  const declared = new Map(
    declaredDone(tasks, loaded.assessment.answers).map((d) => [d.taskId, d.answerLabel])
  );

  const timelineView = buildTimelineView(
    tasks,
    loaded.assessment.deadlines,
    now,
    // Jour d'arrivée : une tâche déjà passée ce jour-là est « à rattraper »,
    // pas « en retard ». Sans lui, la feuille de route accuse d'un retard
    // qu'elle a elle-même daté dans le passé.
    loaded.assessment.createdAt
  );

  const phases = progressByPhase(tasks);
  const applicable = applicableTasks(tasks);
  const notApplicable = tasks.filter((t) => t.status === "NOT_APPLICABLE");

  return (
    <div>
      <h1
        style={{
          fontFamily: fonts.serif,
          fontWeight: 300,
          fontSize: "2.1rem",
          margin: 0,
          color: colors.navy900,
        }}
      >
        {dashboard.roadmapTitle}
      </h1>
      <p
        style={{
          fontFamily: fonts.sans,
          fontSize: "0.92rem",
          lineHeight: 1.75,
          maxWidth: 660,
          margin: "14px 0 0",
          color: colors.slate,
        }}
      >
        {dashboard.roadmapIntro}
      </p>

      {(() => {
        /*
         * Deux encarts pour un même emplacement, et l'ordre compte : quand
         * TOUTES les échéances sont derrière, il n'y a plus de fenêtre à
         * mesurer, seulement un cycle à refermer. Parler du temps restant
         * serait alors absurde.
         *
         * Comme la fenêtre, celui-ci ne paraît que lorsqu'il apprend quelque
         * chose — un encart qui se montre toujours cesse d'être lu.
         */
        const closed = closedCycle(tasks, now);
        if (closed) {
          return (
            <section
              style={{
                marginTop: 32,
                padding: "24px 26px",
                border: `1px solid ${alpha.goldBorderHover}`,
                backgroundColor: alpha.goldBadgeBg,
              }}
            >
              <h2
                style={{
                  fontFamily: fonts.serif,
                  fontWeight: 400,
                  fontSize: "1.2rem",
                  margin: 0,
                  color: colors.navy900,
                }}
              >
                {dashboard.timeline.closedCycleTitle}
              </h2>
              <p
                style={{
                  fontFamily: fonts.sans,
                  fontSize: "0.9rem",
                  lineHeight: 1.8,
                  margin: "12px 0 0",
                  maxWidth: 680,
                  color: colors.slate,
                }}
              >
                {dashboard.timeline.closedCycleBody(closed.datedCount)}
              </p>
            </section>
          );
        }
        const window = intakeWindow(tasks, loaded.assessment.answers, now);
        if (!window || !window.tight) return null;
        return (
          <section
            style={{
              marginTop: 32,
              padding: "24px 26px",
              border: `1px solid ${alpha.goldBorderHover}`,
              backgroundColor: alpha.goldBadgeBg,
            }}
          >
            <h2
              style={{
                fontFamily: fonts.serif,
                fontWeight: 400,
                fontSize: "1.2rem",
                margin: 0,
                color: colors.navy900,
              }}
            >
              {dashboard.timeline.windowTitle}
            </h2>
            <p
              style={{
                fontFamily: fonts.sans,
                fontSize: "0.9rem",
                lineHeight: 1.8,
                margin: "12px 0 0",
                maxWidth: 680,
                color: colors.slate,
              }}
            >
              {dashboard.timeline.windowTight(
                window.monthsLeft,
                window.monthsNeeded,
                window.behindCount,
                window.datedCount,
                window.targetYear,
                window.nextYear
              )}
            </p>
          </section>
        );
      })()}

      {timelineView ? (
        <Timeline view={timelineView} />
      ) : (
        /* Sans rentrée décidée, pas d'axe — mais on dit pourquoi plutôt que de
           laisser un blanc. Les tâches suivent, dans leur ordre. */
        <section
          style={{
            marginTop: 32,
            padding: "24px 26px",
            border: `1px solid ${alpha.cardGridGap}`,
          }}
        >
          <h2
            style={{
              fontFamily: fonts.serif,
              fontWeight: 400,
              fontSize: "1.2rem",
              margin: 0,
              color: colors.navy900,
            }}
          >
            {dashboard.timeline.noAxisTitle}
          </h2>
          <p
            style={{
              fontFamily: fonts.sans,
              fontSize: "0.9rem",
              lineHeight: 1.8,
              margin: "12px 0 0",
              maxWidth: 640,
              color: colors.slate,
            }}
          >
            {loaded.assessment.answers.intake === "ALREADY_STARTED"
              ? dashboard.timeline.noAxisStarted
              : dashboard.timeline.noAxisUndecided}
          </p>
        </section>
      )}

      {phases.map((phase) => (
        <section key={phase.phase} style={{ marginTop: 48 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span
              aria-hidden
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: phase.complete ? colors.gold : alpha.cardNumIdle,
                flexShrink: 0,
              }}
            />
            <h2
              style={{
                fontFamily: fonts.serif,
                fontWeight: 400,
                fontSize: "1.35rem",
                margin: 0,
                color: colors.navy900,
              }}
            >
              {PHASE_LABELS[phase.phase]}
            </h2>
            <span
              style={{
                marginLeft: "auto",
                fontFamily: fonts.sans,
                fontSize: "0.78rem",
                color: colors.slate,
              }}
            >
              {phase.done} / {phase.total}
            </span>
          </div>

          {applicable
            .filter((t) => t.phase === phase.phase)
            .map((task) => (
              <div
                key={task.id}
                style={{
                  padding: "20px 0",
                  borderTop: `1px solid ${alpha.cardGridGap}`,
                  marginTop: 16,
                  opacity: task.status === "DONE" ? 0.6 : 1,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "baseline",
                    gap: 12,
                  }}
                >
                  <h3
                    style={{
                      fontFamily: fonts.sans,
                      fontWeight: 500,
                      fontSize: "0.98rem",
                      margin: 0,
                      color: colors.navy900,
                    }}
                  >
                    {task.title}
                  </h3>
                  {task.importance === "CRITICAL" && (
                    <span
                      style={{
                        fontFamily: fonts.sans,
                        fontSize: "0.64rem",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: colors.goldText,
                        border: `1px solid ${alpha.goldBorderHover}`,
                        padding: "3px 8px",
                      }}
                    >
                      Critique
                    </span>
                  )}
                  <span
                    style={{
                      marginLeft: "auto",
                      fontFamily: fonts.sans,
                      fontSize: "0.78rem",
                      color: colors.slate,
                    }}
                  >
                    {task.dueDate ? dateFr(task.dueDate) : "sans date"} ·{" "}
                    {STATUS_LABELS[task.status]}
                  </span>
                </div>

                <p
                  style={{
                    fontFamily: fonts.sans,
                    fontSize: "0.88rem",
                    lineHeight: 1.7,
                    maxWidth: 700,
                    margin: "10px 0 16px",
                    color: colors.slate,
                  }}
                >
                  {task.explanation}
                </p>

                {task.toolHref && task.toolLabel ? (
                  // La tâche mène à l'outil qui l'accomplit. Sans ce lien, la
                  // feuille de route demande un travail que le produit sait
                  // faire, et laisse l'utilisateur le chercher — ou le faire
                  // ailleurs, donc hors des échéances et hors de la relecture.
                  <Link
                    href={task.toolHref}
                    style={{
                      display: "inline-block",
                      fontFamily: fonts.sans,
                      fontSize: "0.82rem",
                      color: colors.goldText,
                      textDecoration: "none",
                      margin: "0 0 16px",
                    }}
                  >
                    {task.toolLabel} →
                  </Link>
                ) : null}

                {declared.has(task.id) && (
                  <p
                    style={{
                      fontFamily: fonts.sans,
                      fontSize: "0.82rem",
                      lineHeight: 1.7,
                      margin: "0 0 12px",
                      padding: "10px 14px",
                      maxWidth: 640,
                      backgroundColor: alpha.goldBadgeBg,
                      color: colors.slate,
                    }}
                  >
                    {dashboard.timeline.declaredHint(declared.get(task.id)!)}
                  </p>
                )}
                <TaskStatusControl taskId={task.id} status={task.status} />
              </div>
            ))}
        </section>
      ))}

      {notApplicable.length > 0 && (
        <section
          style={{ marginTop: 64, paddingTop: 28, borderTop: `1px solid ${alpha.cardGridGap}` }}
        >
          <h2
            style={{
              fontFamily: fonts.sans,
              fontSize: "0.7rem",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: colors.slate,
              margin: 0,
            }}
          >
            {dashboard.notApplicableNote}
          </h2>
          <ul style={{ margin: "14px 0 0" }}>
            {notApplicable.map((task) => (
              <li
                key={task.id}
                style={{
                  fontFamily: fonts.sans,
                  fontSize: "0.84rem",
                  lineHeight: 1.7,
                  color: colors.slate,
                  marginBottom: 6,
                }}
              >
                {task.title}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
