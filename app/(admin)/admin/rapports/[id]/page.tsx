import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { colors, fonts, alpha } from "@/design/tokens";
import { reportStore } from "@/lib/store/reports";
import { assessmentStore } from "@/lib/store/assessments";
import { assembleReportLive } from "@/lib/matrices/load";
import { canSend, reviewChecklist } from "@/lib/report/review";
import { ReportControls } from "./ReportControls";
import { ReviewChecklist } from "./ReviewChecklist";

export const metadata: Metadata = {
  title: "Rapport — Admitto",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Fiche rapport du back-office : profil, sorties des deux moteurs, projet de
 * rapport assemblé, transitions de statut et journal des corrections.
 * Le projet assemblé n'est pas envoyable en l'état : il doit être relu (CDC §17).
 */
export default async function AdminReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const record = await reportStore.get(id);
  const assessment = record ? await assessmentStore.get(record.assessmentId) : null;
  if (!record || !assessment) notFound();

  const report = await assembleReportLive(assessment);
  const points = reviewChecklist(assessment, report);
  const sendable = canSend(points, record.acknowledged);

  return (
    <div>
      <Link
        href="/admin"
        style={{
          fontFamily: fonts.sans,
          fontSize: "0.8rem",
          color: colors.slate,
          textDecoration: "none",
        }}
      >
        ← Retour à la file
      </Link>

      <h1
        style={{
          fontFamily: fonts.serif,
          fontWeight: 300,
          fontSize: "2rem",
          margin: "20px 0 0",
          color: colors.navy900,
        }}
      >
        {assessment.answers.firstName ?? "Sans prénom"}
      </h1>
      <p style={{ fontFamily: fonts.sans, fontSize: "0.9rem", margin: "6px 0 0", color: colors.slate }}>
        {assessment.answers.email} · reçu le{" "}
        {new Date(record.createdAt).toLocaleDateString("fr-FR")} ·{" "}
        {record.priority === "PAID" ? "payant" : "gratuit"}
      </p>

      <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
        <Link
          href={`/admin/rapports/${id}/impression`}
          style={{
            fontFamily: fonts.sans,
            fontSize: "0.8rem",
            letterSpacing: "0.04em",
            padding: "11px 18px",
            border: `1px solid ${colors.gold}`,
            color: colors.navy900,
            textDecoration: "none",
          }}
        >
          Ouvrir la version imprimable
        </Link>
      </div>

      <ReportControls id={id} status={record.status} sendBlocked={!sendable.ok} />

      <Section title="Revue avant envoi">
        <ReviewChecklist id={id} points={points} acknowledged={record.acknowledged} />
      </Section>

      {/* Sorties des moteurs */}
      <Section title="Sorties des moteurs">
        <Field label="Voie préliminaire (Moteur A)" value={report.pathLabel} />
        <Field label="Verdict de viabilité (Moteur B)" value={report.verdictTitle} />
        <Field label="Parcours type" value={report.nextSteps.length ? "attribué" : "non attribué"} />
        <Field label="Offre recommandée" value={report.offerName} />
        <Field
          label="Règles déclenchées"
          value={
            assessment.rulesSnapshot.length
              ? assessment.rulesSnapshot.map((r) => `${r.id} v${r.version}`).join(", ")
              : "aucune"
          }
        />
        {report.shiftIntake && (
          <Field label="Alerte calendrier" value="Rentrée ultérieure à envisager" alert />
        )}
      </Section>

      {/* Axes */}
      <Section title="Cinq axes">
        {report.axes.map((axis) => (
          <div
            key={axis.axis}
            style={{
              display: "grid",
              gridTemplateColumns: "220px 60px 1fr",
              gap: 16,
              padding: "14px 0",
              borderTop: `1px solid ${alpha.cardGridGap}`,
            }}
          >
            <span style={{ fontFamily: fonts.sans, fontSize: "0.9rem", color: colors.navy900 }}>
              {axis.label}
            </span>
            <span style={{ fontFamily: fonts.serif, fontSize: "1.1rem", color: colors.gold }}>
              {axis.score} / 4
            </span>
            <span style={{ fontFamily: fonts.sans, fontSize: "0.85rem", lineHeight: 1.6, color: colors.slate }}>
              {axis.comment}
            </span>
          </div>
        ))}
      </Section>

      {/* Réponses brutes */}
      <Section title="Réponses au questionnaire">
        <pre
          style={{
            fontFamily: "ui-monospace, monospace",
            fontSize: "0.78rem",
            lineHeight: 1.7,
            whiteSpace: "pre-wrap",
            margin: 0,
            padding: "16px 18px",
            border: `1px solid ${alpha.cardGridGap}`,
            color: colors.slate,
          }}
        >
          {JSON.stringify(assessment.answers, null, 2)}
        </pre>
      </Section>

      {/* Journal des corrections */}
      <Section title={`Journal des corrections (${record.corrections.length})`}>
        {record.corrections.length === 0 ? (
          <p style={{ fontFamily: fonts.sans, fontSize: "0.88rem", color: colors.slate, margin: 0 }}>
            Aucune correction consignée.
          </p>
        ) : (
          record.corrections.map((entry, i) => (
            <div
              key={i}
              style={{ padding: "12px 0", borderTop: `1px solid ${alpha.cardGridGap}` }}
            >
              <span style={{ fontFamily: fonts.sans, fontSize: "0.75rem", color: colors.gold }}>
                {new Date(entry.at).toLocaleString("fr-FR")} · {entry.author}
              </span>
              <p
                style={{
                  fontFamily: fonts.sans,
                  fontSize: "0.9rem",
                  lineHeight: 1.6,
                  margin: "6px 0 0",
                  color: colors.navy900,
                }}
              >
                {entry.note}
              </p>
            </div>
          ))
        )}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: 48 }}>
      <h2
        style={{
          fontFamily: fonts.sans,
          fontSize: "0.72rem",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: colors.gold,
          margin: 0,
        }}
      >
        {title}
      </h2>
      <div style={{ marginTop: 16 }}>{children}</div>
    </section>
  );
}

function Field({ label, value, alert }: { label: string; value: string; alert?: boolean }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "260px 1fr",
        gap: 16,
        padding: "10px 0",
        borderTop: `1px solid ${alpha.cardGridGap}`,
      }}
    >
      <span style={{ fontFamily: fonts.sans, fontSize: "0.85rem", color: colors.slate }}>
        {label}
      </span>
      <span
        style={{
          fontFamily: fonts.sans,
          fontSize: "0.9rem",
          color: alert ? colors.gold : colors.navy900,
        }}
      >
        {value}
      </span>
    </div>
  );
}
