import Link from "next/link";
import type { Metadata } from "next";
import { colors, fonts, alpha } from "@/design/tokens";
import { assessmentStore } from "@/lib/store/assessments";
import { reportStore } from "@/lib/store/reports";
import { roadmapStore } from "@/lib/store/roadmap";
import { computeMetrics, formatMetric, type Metric } from "@/lib/analytics/metrics";
import { buildFunnel } from "@/lib/analytics/events";
import { eventStore } from "@/lib/store/events";
import { SCREENS } from "@/content/diagnostic";

export const metadata: Metadata = {
  title: "Métriques — Admitto",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Back-office — métriques (CDC §36).
 *
 * La métrique centrale du cahier des charges est la conversion rapport → achat
 * rapportée au temps humain nécessaire. Les deux sont donc présentées ensemble
 * et en tête : lue seule, une conversion élevée peut masquer un coût humain qui
 * rend l'offre intenable.
 */
export default async function AdminMetricsPage() {
  const assessments = await assessmentStore.all();
  const reports = await reportStore.all();

  const activatedRoadmaps: string[] = [];
  for (const assessment of assessments) {
    if (await roadmapStore.hasAny(assessment.id)) activatedRoadmaps.push(assessment.id);
  }

  const metrics = computeMetrics({ assessments, reports, activatedRoadmaps });

  // Entonnoir (CDC §36) : des compteurs anonymes, jamais des parcours. Le
  // nombre de diagnostics payés vient des RAPPORTS, pas des événements : un
  // achat est un fait comptable, il ne se mesure pas à un pixel.
  const funnel = buildFunnel(
    await eventStore.countsByKind(),
    await eventStore.countsByScreen(),
    reports.filter((report) => report.priority === "PAID").length
  );
  const screenTitles: Record<string, string> = Object.fromEntries(
    SCREENS.map((screen) => [screen.id, screen.question])
  );

  return (
    <div>
      <Link
        href="/admin"
        style={{ fontFamily: fonts.sans, fontSize: "0.8rem", color: colors.slate, textDecoration: "none" }}
      >
        ← Retour à la file
      </Link>

      <h1
        style={{
          fontFamily: fonts.serif,
          fontWeight: 300,
          fontSize: "2.1rem",
          margin: "20px 0 0",
          color: colors.navy900,
        }}
      >
        Métriques
      </h1>
      <p
        style={{
          fontFamily: fonts.sans,
          fontSize: "0.88rem",
          lineHeight: 1.75,
          maxWidth: 700,
          margin: "10px 0 0",
          color: colors.slate,
        }}
      >
        Chaque chiffre porte le nombre d&apos;observations sur lequel il est calculé. Un tiret
        signale une absence de mesure, jamais un zéro : à ce stade, confondre les deux conduirait
        à des décisions prises sur du vide.
      </p>

      <Section title="Métrique centrale (CDC §36)">
        <div style={grid}>
          <Card
            label="Conversion rapport → achat"
            metric={metrics.conversionToPaid}
            unit="%"
            note="Rapportée aux rapports envoyés : un rapport jamais parti n'a pas eu l'occasion de convertir."
            highlight
          />
          <Card
            label="Corrections par rapport"
            metric={metrics.correctionsPerReport}
            unit=""
            note="Proxy du temps humain. Une conversion élevée obtenue au prix d'un temps humain croissant n'est pas tenable."
            highlight
          />
        </div>
      </Section>

      <Section title="Production">
        <div style={grid}>
          <Card label="Diagnostics soumis" metric={{ value: metrics.assessments, sample: metrics.assessments }} unit="" />
          <Card label="Rapports en file" metric={{ value: metrics.reports, sample: metrics.reports }} unit="" />
          <Card label="Rapports envoyés" metric={metrics.reportsSent} unit="%" />
          <Card
            label="Délai de production"
            metric={metrics.productionHours}
            unit="h"
            note="Médiane, non moyenne : un rapport oublié une semaine ne doit pas déplacer la mesure centrale."
          />
          <Card
            label="Rapports ayant demandé un arbitrage"
            metric={metrics.reportsWithCorrections}
            unit="%"
          />
        </div>
      </Section>

      <Section title="Couverture et usage">
        <div style={grid}>
          <Card
            label="Détection de partenariats"
            metric={metrics.partnershipDetection}
            unit="%"
            note="Part des diagnostics dont l'université figure dans la base (CDC §27)."
          />
          <Card
            label="Feuilles de route ouvertes"
            metric={metrics.roadmapActivation}
            unit="%"
            note="Part des diagnostics ayant donné lieu à au moins une tâche touchée."
          />
        </div>
      </Section>

      <Section title="Entonnoir du questionnaire">
        <p
          style={{
            fontFamily: fonts.sans,
            fontSize: "0.85rem",
            lineHeight: 1.75,
            maxWidth: 700,
            margin: "0 0 18px",
            color: colors.slate,
          }}
        >
          Compteurs anonymes : aucun identifiant n&apos;est enregistré, aucun parcours
          individuel n&apos;est reconstituable. L&apos;abandon par écran est la différence
          entre deux compteurs successifs.
          <br />
          Un tiret remplace la part du départ quand les deux nombres ne portent pas sur la
          même population : après la soumission, les compteurs comptent des ouvertures de
          page — le lien du résultat part par email et se rouvre plusieurs fois — et les
          diagnostics payés viennent des rapports, dont beaucoup sont antérieurs à la mesure.
          Seule la conversion commencé → soumis est une vraie part.
        </p>

        {funnel.events === 0 ? (
          <p style={{ fontFamily: fonts.sans, fontSize: "0.88rem", margin: 0, color: colors.slate }}>
            Aucun événement enregistré pour l&apos;instant.
          </p>
        ) : (
          <>
            {funnel.steps.map((step) => (
              <div
                key={step.label}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "baseline",
                  gap: 14,
                  padding: "10px 0",
                  borderTop: `1px solid ${alpha.cardGridGap}`,
                }}
              >
                <span
                  style={{
                    fontFamily: fonts.sans,
                    fontSize: "0.88rem",
                    color: colors.navy900,
                    minWidth: 210,
                  }}
                >
                  {step.label}
                </span>
                <span
                  style={{
                    fontFamily: fonts.serif,
                    fontSize: "1.2rem",
                    color: colors.navy900,
                    minWidth: 48,
                  }}
                >
                  {step.count}
                </span>
                {/* Barre proportionnelle au PLUS GRAND compte, pas au départ :
                    les comptes se comparent entre eux même quand aucun n'est
                    une part de l'autre, et la barre ne peut pas déborder. */}
                <span
                  aria-hidden
                  style={{
                    display: "block",
                    height: 6,
                    width: `${step.barShare * 2.6}px`,
                    backgroundColor: colors.gold,
                  }}
                />
                <span style={{ fontFamily: fonts.sans, fontSize: "0.78rem", color: colors.slate }}>
                  {step.shareOfStart === null ? "—" : `${step.shareOfStart} %`}
                </span>
              </div>
            ))}

            <h3
              style={{
                fontFamily: fonts.sans,
                fontSize: "0.7rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: colors.gold,
                margin: "32px 0 4px",
              }}
            >
              Abandon par écran
            </h3>
            {funnel.dropOff.map((screen) => (
              <div
                key={screen.screen}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "baseline",
                  gap: 14,
                  padding: "8px 0",
                  borderTop: `1px solid ${alpha.cardGridGap}`,
                }}
              >
                <span
                  style={{
                    fontFamily: fonts.sans,
                    fontSize: "0.84rem",
                    color: colors.navy900,
                    minWidth: 300,
                  }}
                >
                  {screenTitles[screen.screen] ?? screen.screen}
                </span>
                <span style={{ fontFamily: fonts.sans, fontSize: "0.82rem", color: colors.slate }}>
                  {screen.reached} atteint(s)
                </span>
                <span
                  style={{
                    fontFamily: fonts.sans,
                    fontSize: "0.82rem",
                    color: screen.lost > 0 ? colors.gold : colors.slate,
                  }}
                >
                  {screen.lost} abandon(s)
                </span>
                {/* Un écran conditionnel est atteint par une fraction des
                    profils : son compte, lu à côté des autres, ressemblerait
                    sinon à un effondrement. */}
                {screen.conditional ? (
                  <span
                    style={{ fontFamily: fonts.sans, fontSize: "0.74rem", color: colors.slate }}
                  >
                    écran posé à certains profils seulement
                  </span>
                ) : null}
              </div>
            ))}
          </>
        )}
      </Section>
    </div>
  );
}

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: 1,
  backgroundColor: alpha.cardGridGap,
  border: `1px solid ${alpha.cardGridGap}`,
};

function Card({
  label,
  metric,
  unit,
  note,
  highlight,
}: {
  label: string;
  metric: Metric;
  unit: "%" | "h" | "";
  note?: string;
  highlight?: boolean;
}) {
  return (
    <div style={{ backgroundColor: colors.ivory, padding: "22px 20px" }}>
      <span
        style={{
          display: "block",
          fontFamily: fonts.sans,
          fontSize: "0.66rem",
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
          fontSize: highlight ? "2rem" : "1.5rem",
          margin: "10px 0 0",
          color: metric.value === null ? colors.slate : colors.navy900,
        }}
      >
        {formatMetric(metric, unit)}
      </span>
      <span
        style={{
          display: "block",
          fontFamily: fonts.sans,
          fontSize: "0.72rem",
          marginTop: 6,
          color: colors.slate,
        }}
      >
        {metric.sample === 0 ? "aucune observation" : `sur ${metric.sample} observation(s)`}
      </span>
      {note && (
        <p
          style={{
            fontFamily: fonts.sans,
            fontSize: "0.78rem",
            lineHeight: 1.7,
            margin: "12px 0 0",
            color: colors.slate,
          }}
        >
          {note}
        </p>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: 44 }}>
      <h2
        style={{
          fontFamily: fonts.sans,
          fontSize: "0.7rem",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: colors.gold,
          margin: "0 0 14px",
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}
