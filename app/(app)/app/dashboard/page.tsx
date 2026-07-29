import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { colors, fonts, alpha, gradients } from "@/design/tokens";
import { ACCESS_COOKIE, verifyAccessToken } from "@/lib/access/session";
import { loadRoadmap } from "@/lib/roadmap/load";
import { selectNextBestAction } from "@/lib/roadmap/next-best-action";
import { computeProgress, milestoneStates, personalStats } from "@/lib/roadmap/progress";
import { applicableTasks } from "@/lib/roadmap/generate";
import { NOT_ACTIONABLE } from "@/lib/roadmap/types";
import { dashboard, MILESTONE_LABELS, PHASE_LABELS, STATUS_LABELS } from "@/content/dashboard";
import { findModule, isModulePublished } from "@/content/modules";
import { DOCUMENT_TYPE_LABELS, vault } from "@/content/vault";
import { documentStore } from "@/lib/store/documents";
import { TaskStatusControl } from "../_components/TaskStatusControl";

export const metadata: Metadata = {
  title: "Tableau de bord — Admitto",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const dateFr = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

/**
 * Tableau de bord (CDC §21).
 *
 * La première page après connexion n'est pas une bibliothèque de contenus.
 * L'ordre d'affichage est celui de la priorité : phase actuelle, prochaine
 * action, échéances, progression, tâches, documents, module recommandé.
 */
export default async function DashboardPage() {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  const assessmentId = await verifyAccessToken(token, new Date());
  if (!assessmentId) redirect("/diagnostic");

  const now = new Date();
  const loaded = await loadRoadmap(assessmentId, now);
  if (!loaded) redirect("/diagnostic");

  const { assessment, tasks } = loaded;
  const documents = await documentStore.list(assessmentId);
  const nba = selectNextBestAction(tasks, now);
  const progress = computeProgress(tasks);
  const stats = personalStats(tasks, now);
  const milestones = milestoneStates(tasks).filter((m) => !m.notApplicable);

  const currentPhase = assessment.derived.currentPhase;
  const upcoming = applicableTasks(tasks)
    .filter((t) => t.status !== "DONE" && t.dueDate)
    .sort((a, b) => a.dueDate!.localeCompare(b.dueDate!))
    .slice(0, 4);

  const recommendedModule =
    findModule(nba?.task.moduleSlug) ??
    findModule(
      applicableTasks(tasks).find((t) => t.status !== "DONE" && t.moduleSlug)?.moduleSlug
    );

  const actionable = applicableTasks(tasks)
    .filter((t) => !NOT_ACTIONABLE.includes(t.status))
    .filter((t) => t.id !== nba?.task.id)
    .slice(0, 4);

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
        {dashboard.greeting(assessment.answers.firstName)}
      </h1>

      {/* 1. Phase actuelle */}
      <p
        style={{
          fontFamily: fonts.sans,
          fontSize: "0.88rem",
          margin: "10px 0 0",
          color: colors.slate,
        }}
      >
        {dashboard.sections.phase} :{" "}
        <strong style={{ color: colors.navy900, fontWeight: 500 }}>
          {currentPhase ? PHASE_LABELS[currentPhase] : "à déterminer"}
        </strong>
      </p>

      {/* 2. Next Best Action — l'élément le plus proéminent de la page */}
      <section
        style={{
          marginTop: 32,
          padding: "34px 32px",
          background: gradients.darkSection,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ display: "block", width: 32, height: 1, backgroundColor: colors.gold }} />
          <span
            style={{
              fontFamily: fonts.sans,
              fontSize: "0.7rem",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: colors.goldLight,
            }}
          >
            {dashboard.sections.nextBestAction}
          </span>
          {nba?.urgent && (
            <span
              style={{
                fontFamily: fonts.sans,
                fontSize: "0.66rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: colors.navy900,
                background: gradients.goldButton,
                padding: "4px 10px",
              }}
            >
              {dashboard.nbaUrgent}
            </span>
          )}
        </div>

        {nba ? (
          <>
            <h2
              style={{
                fontFamily: fonts.serif,
                fontWeight: 400,
                fontSize: "1.7rem",
                lineHeight: 1.25,
                margin: "20px 0 0",
                color: colors.ivory,
              }}
            >
              {nba.task.title}
            </h2>
            <p
              style={{
                fontFamily: fonts.sans,
                fontSize: "0.93rem",
                lineHeight: 1.7,
                margin: "14px 0 0",
                maxWidth: 640,
                color: alpha.whiteCtaText,
              }}
            >
              {nba.task.explanation}
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 12,
                marginTop: 26,
              }}
            >
              <Fact label={dashboard.nbaReason} value={nba.reason} />
              <Fact label={dashboard.nbaDuration} value={nba.duration} />
              <Fact
                label={dashboard.nbaDue}
                value={nba.dueDate ? dateFr(nba.dueDate) : dashboard.nbaNoDue}
              />
              <Fact label={dashboard.nbaRisk} value={nba.delayRisk} />
            </div>

            <div style={{ marginTop: 26 }}>
              <TaskStatusControl taskId={nba.task.id} status={nba.task.status} />
            </div>

            {nba.resourceUrl && isModulePublished(nba.task.moduleSlug) && (
              <Link
                href={nba.resourceUrl}
                style={{
                  display: "inline-block",
                  marginTop: 18,
                  fontFamily: fonts.sans,
                  fontSize: "0.8rem",
                  letterSpacing: "0.04em",
                  padding: "12px 20px",
                  border: `1px solid ${alpha.goldBorderHover}`,
                  color: colors.goldLight,
                  textDecoration: "none",
                }}
              >
                {dashboard.nbaResource} →
              </Link>
            )}
          </>
        ) : (
          <p
            style={{
              fontFamily: fonts.sans,
              fontSize: "0.95rem",
              lineHeight: 1.7,
              margin: "20px 0 0",
              maxWidth: 640,
              color: alpha.whiteCtaText,
            }}
          >
            {dashboard.nbaEmpty}
          </p>
        )}
      </section>

      {/* 3. Progression et statistiques personnelles */}
      <Section title={dashboard.sections.progress}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <span
            style={{
              flex: 1,
              height: 4,
              backgroundColor: alpha.cardGridGap,
              display: "block",
              position: "relative",
            }}
          >
            <span
              style={{
                position: "absolute",
                inset: 0,
                transformOrigin: "left",
                transform: `scaleX(${progress.percent / 100})`,
                background: gradients.goldButton,
              }}
            />
          </span>
          <span
            style={{
              fontFamily: fonts.serif,
              fontSize: "1.5rem",
              color: colors.navy900,
              whiteSpace: "nowrap",
            }}
          >
            {progress.percent} %
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 1,
            backgroundColor: alpha.cardGridGap,
            border: `1px solid ${alpha.cardGridGap}`,
            marginTop: 20,
          }}
        >
          <Stat label={dashboard.statsLabels.tasksDone} value={String(stats.tasksDone)} />
          <Stat label={dashboard.statsLabels.tasksRemaining} value={String(stats.tasksRemaining)} />
          <Stat label={dashboard.statsLabels.waitingOnOthers} value={String(stats.waitingOnOthers)} />
          <Stat
            label={dashboard.statsLabels.overdue}
            value={String(stats.overdue)}
            alert={stats.overdue > 0}
          />
        </div>
      </Section>

      {/* 4. Échéances */}
      {upcoming.length > 0 && (
        <Section title={dashboard.sections.deadlines}>
          {upcoming.map((task) => (
            <div
              key={task.id}
              style={{
                display: "grid",
                gridTemplateColumns: "160px 1fr",
                gap: 18,
                padding: "12px 0",
                borderTop: `1px solid ${alpha.cardGridGap}`,
              }}
            >
              <span style={{ fontFamily: fonts.sans, fontSize: "0.8rem", color: colors.gold }}>
                {dateFr(task.dueDate!)}
              </span>
              <span style={{ fontFamily: fonts.sans, fontSize: "0.9rem", color: colors.navy900 }}>
                {task.title}
              </span>
            </div>
          ))}
        </Section>
      )}

      {/* 5. Tâches du moment */}
      {actionable.length > 0 && (
        <Section title={dashboard.sections.tasks}>
          {actionable.map((task) => (
            <div
              key={task.id}
              style={{ padding: "16px 0", borderTop: `1px solid ${alpha.cardGridGap}` }}
            >
              <span
                style={{
                  display: "block",
                  fontFamily: fonts.sans,
                  fontSize: "0.93rem",
                  color: colors.navy900,
                }}
              >
                {task.title}
              </span>
              <span
                style={{
                  display: "block",
                  fontFamily: fonts.sans,
                  fontSize: "0.78rem",
                  margin: "4px 0 12px",
                  color: colors.slate,
                }}
              >
                {PHASE_LABELS[task.phase]} · {STATUS_LABELS[task.status]}
                {task.dueDate ? ` · ${dateFr(task.dueDate)}` : ""}
              </span>
              <TaskStatusControl taskId={task.id} status={task.status} />
            </div>
          ))}
          <Link
            href="/app/roadmap"
            style={{
              display: "inline-block",
              marginTop: 20,
              fontFamily: fonts.sans,
              fontSize: "0.82rem",
              color: colors.gold,
              textDecoration: "none",
            }}
          >
            Voir toute la feuille de route →
          </Link>
        </Section>
      )}

      {/* 6. Étapes clés */}
      {milestones.length > 0 && (
        <Section title={dashboard.sections.milestones}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {milestones.map((m) => (
              <div
                key={m.milestone}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "12px 16px",
                  border: `1px solid ${m.achieved ? colors.gold : alpha.cardGridGap}`,
                }}
              >
                <span
                  aria-hidden
                  style={{ color: m.achieved ? colors.gold : alpha.cardNumIdle, fontSize: "0.9rem" }}
                >
                  ✦
                </span>
                <span style={{ fontFamily: fonts.sans, fontSize: "0.9rem", color: colors.navy900 }}>
                  {MILESTONE_LABELS[m.milestone]}
                </span>
                <span
                  style={{
                    marginLeft: "auto",
                    fontFamily: fonts.sans,
                    fontSize: "0.78rem",
                    color: colors.slate,
                  }}
                >
                  {m.done} / {m.total}
                </span>
              </div>
            ))}
          </div>
          <p
            style={{
              fontFamily: fonts.sans,
              fontSize: "0.8rem",
              lineHeight: 1.7,
              margin: "16px 0 0",
              maxWidth: 620,
              color: colors.slate,
            }}
          >
            {dashboard.milestonesNote}
          </p>
        </Section>
      )}

      {/* 7. Module recommandé */}
      {recommendedModule && (
        <Section title={dashboard.sections.module}>
          <span
            style={{ display: "block", fontFamily: fonts.serif, fontSize: "1.2rem", color: colors.navy900 }}
          >
            {recommendedModule.title}
          </span>
          <p
            style={{
              fontFamily: fonts.sans,
              fontSize: "0.88rem",
              lineHeight: 1.7,
              maxWidth: 660,
              margin: "8px 0 0",
              color: colors.slate,
            }}
          >
            {recommendedModule.summary}
          </p>
          <p
            style={{
              fontFamily: fonts.sans,
              fontSize: "0.82rem",
              margin: "12px 0 0",
              color: colors.gold,
            }}
          >
            {recommendedModule.published ? "" : dashboard.modulePlaceholder}
          </p>
        </Section>
      )}

      {/* 8. Documents */}
      <Section title={dashboard.sections.documents}>
        {documents.length === 0 ? (
          <p style={{ fontFamily: fonts.sans, fontSize: "0.88rem", lineHeight: 1.7, margin: 0, color: colors.slate }}>
            {vault.dashboardEmpty}
          </p>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {documents.map((document) => (
              <li
                key={document.id}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "9px 0",
                  borderTop: `1px solid ${alpha.cardGridGap}`,
                  fontFamily: fonts.sans,
                  fontSize: "0.88rem",
                  color: colors.navy900,
                }}
              >
                <span>{document.fileName}</span>
                <span style={{ color: colors.slate, fontSize: "0.78rem" }}>
                  {DOCUMENT_TYPE_LABELS[document.type]}
                </span>
              </li>
            ))}
          </ul>
        )}
        <Link
          href="/app/documents"
          style={{
            display: "inline-block",
            marginTop: 14,
            fontFamily: fonts.sans,
            fontSize: "0.8rem",
            letterSpacing: "0.04em",
            color: colors.gold,
            textDecoration: "none",
          }}
        >
          {vault.dashboardLink} →
        </Link>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: 44 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ display: "block", width: 32, height: 1, backgroundColor: colors.gold }} />
        <h2
          style={{
            fontFamily: fonts.sans,
            fontSize: "0.7rem",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: colors.gold,
            margin: 0,
          }}
        >
          {title}
        </h2>
      </div>
      <div style={{ marginTop: 18 }}>{children}</div>
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: "16px 16px", backgroundColor: alpha.whiteFaint, border: `1px solid ${alpha.goldBorderFaint}` }}>
      <span
        style={{
          display: "block",
          fontFamily: fonts.sans,
          fontSize: "0.64rem",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: colors.gold,
        }}
      >
        {label}
      </span>
      <span
        style={{
          display: "block",
          fontFamily: fonts.sans,
          fontSize: "0.85rem",
          lineHeight: 1.6,
          margin: "8px 0 0",
          color: colors.ivory,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function Stat({ label, value, alert }: { label: string; value: string; alert?: boolean }) {
  return (
    <div style={{ backgroundColor: colors.ivory, padding: "18px 16px" }}>
      <span
        style={{
          display: "block",
          fontFamily: fonts.sans,
          fontSize: "0.64rem",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: colors.gold,
        }}
      >
        {label}
      </span>
      <span
        style={{
          display: "block",
          fontFamily: fonts.serif,
          fontSize: "1.4rem",
          margin: "8px 0 0",
          color: alert ? colors.gold : colors.navy900,
        }}
      >
        {value}
      </span>
    </div>
  );
}
