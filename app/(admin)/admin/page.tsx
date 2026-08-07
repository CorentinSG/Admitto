import Link from "next/link";
import type { Metadata } from "next";
import { colors, fonts, alpha } from "@/design/tokens";
import { reportStore } from "@/lib/store/reports";
import { assessmentStore } from "@/lib/store/assessments";
import { announcedDelay, isSaturated } from "@/lib/capacity/delay";
import { assembleReportLive } from "@/lib/matrices/load";
import { canSend, reviewChecklist } from "@/lib/report/review";
import { STATUS_LABELS } from "@/content/admin";

export const metadata: Metadata = {
  title: "File de rapports — Admitto",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Back-office — file de rapports (CDC §18 et §33).
 * Affiche la capacité, le délai actuellement annoncé et l'alerte de saturation.
 */
export default async function AdminQueuePage() {
  const queue = await reportStore.queue();
  const active = await reportStore.activeCount();
  const saturated = isSaturated(active);

  const rows = await Promise.all(
    queue.map(async (report) => {
      const assessment = await assessmentStore.get(report.assessmentId);
      // La file annonce ce qui reste à arbitrer : sans cela, on ouvre chaque
      // rapport pour découvrir lesquels sont réellement prêts à partir.
      const pending = assessment
        ? canSend(reviewChecklist(assessment, await assembleReportLive(assessment)), report.acknowledged)
        : { ok: false as const, pending: [] };
      return { report, assessment, blocking: pending.ok ? 0 : pending.pending.length };
    })
  );

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 20 }}>
        <h1
          style={{
            fontFamily: fonts.serif,
            fontWeight: 300,
            fontSize: "2.2rem",
            margin: 0,
            color: colors.navy900,
          }}
        >
          File de rapports
        </h1>
        <Link
          href="/admin/partenariats"
          style={{
            fontFamily: fonts.sans,
            fontSize: "0.82rem",
            color: colors.goldText,
            textDecoration: "none",
          }}
        >
          Base de partenariats →
        </Link>
        <Link
          href="/admin/consultations"
          style={{
            fontFamily: fonts.sans,
            fontSize: "0.82rem",
            color: colors.goldText,
            textDecoration: "none",
          }}
        >
          Consultations →
        </Link>
        <Link
          href="/admin/metriques"
          style={{
            fontFamily: fonts.sans,
            fontSize: "0.82rem",
            color: colors.goldText,
            textDecoration: "none",
          }}
        >
          Métriques →
        </Link>
        <Link
          href="/admin/matrices"
          style={{
            fontFamily: fonts.sans,
            fontSize: "0.82rem",
            color: colors.goldText,
            textDecoration: "none",
          }}
        >
          Matrices →
        </Link>
        <Link
          href="/admin/configuration"
          style={{
            fontFamily: fonts.sans,
            fontSize: "0.82rem",
            color: colors.goldText,
            textDecoration: "none",
          }}
        >
          Configuration →
        </Link>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 1,
          backgroundColor: alpha.cardGridGap,
          marginTop: 32,
          border: `1px solid ${alpha.cardGridGap}`,
        }}
      >
        <Stat label="Rapports actifs" value={String(active)} />
        <Stat label="Délai annoncé" value={announcedDelay(active)} />
        <Stat
          label="Capacité"
          value={saturated ? "Saturée" : "Nominale"}
          alert={saturated}
        />
      </div>

      {saturated && (
        <p
          style={{
            fontFamily: fonts.sans,
            fontSize: "0.88rem",
            lineHeight: 1.7,
            margin: "20px 0 0",
            padding: "14px 18px",
            border: `1px solid ${colors.gold}`,
            color: colors.navy900,
          }}
        >
          Au-delà de vingt-cinq rapports actifs, le cahier des charges impose de limiter
          temporairement les commandes ou d&apos;afficher un délai supérieur. Le délai annoncé aux
          nouveaux utilisateurs a déjà basculé automatiquement.
        </p>
      )}

      <h2
        style={{
          fontFamily: fonts.serif,
          fontWeight: 400,
          fontSize: "1.4rem",
          margin: "48px 0 0",
          color: colors.navy900,
        }}
      >
        En attente ({queue.length})
      </h2>

      {rows.length === 0 ? (
        <p
          style={{
            fontFamily: fonts.sans,
            fontSize: "0.92rem",
            margin: "16px 0 0",
            color: colors.slate,
          }}
        >
          Aucun rapport en file.
        </p>
      ) : (
        <div style={{ marginTop: 20 }}>
          {rows.map(({ report, assessment, blocking }) => (
            <Link
              key={report.id}
              href={`/admin/rapports/${report.id}`}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 130px 110px 120px 130px",
                gap: 16,
                alignItems: "center",
                padding: "16px 0",
                borderTop: `1px solid ${alpha.cardGridGap}`,
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <span style={{ fontFamily: fonts.sans, fontSize: "0.95rem", color: colors.navy900 }}>
                {assessment?.answers.firstName ?? "—"}{" "}
                <span style={{ color: colors.slate }}>· {assessment?.answers.email ?? "—"}</span>
              </span>
              <span style={{ fontFamily: fonts.sans, fontSize: "0.8rem", color: colors.slate }}>
                {new Date(report.createdAt).toLocaleDateString("fr-FR")}
              </span>
              <span style={{ fontFamily: fonts.sans, fontSize: "0.78rem", color: colors.goldText }}>
                {report.priority === "PAID" ? "Payant" : "Gratuit"}
              </span>
              <span style={{ fontFamily: fonts.sans, fontSize: "0.78rem", color: colors.navy900 }}>
                {STATUS_LABELS[report.status]}
              </span>
              <span
                style={{
                  fontFamily: fonts.sans,
                  fontSize: "0.78rem",
                  color: blocking > 0 ? colors.goldText : colors.slate,
                }}
              >
                {blocking > 0 ? `${blocking} à arbitrer` : "Revue faite"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, alert }: { label: string; value: string; alert?: boolean }) {
  return (
    <div style={{ backgroundColor: colors.ivory, padding: "22px 20px" }}>
      <span
        style={{
          display: "block",
          fontFamily: fonts.sans,
          fontSize: "0.68rem",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: colors.goldText,
        }}
      >
        {label}
      </span>
      <span
        style={{
          display: "block",
          fontFamily: fonts.serif,
          fontSize: "1.5rem",
          margin: "10px 0 0",
          color: alert ? colors.goldText : colors.navy900,
        }}
      >
        {value}
      </span>
    </div>
  );
}
