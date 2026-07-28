import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { colors, fonts } from "@/design/tokens";
import { reportStore } from "@/lib/store/reports";
import { assessmentStore } from "@/lib/store/assessments";
import { assembleReport } from "@/lib/report/assemble";
import { formatUsd } from "@/lib/costs/estimate";

export const metadata: Metadata = {
  title: "Rapport personnalisé — Admitto",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Version imprimable du rapport (CDC §17) — trois à quatre pages A4.
 * C'est la source du PDF : `node scripts/render-report-pdf.mjs <url> <sortie>`.
 *
 * Le document est en fond clair : un fond navy pleine page serait illisible à
 * l'impression et ruineux en encre. L'identité tient à la typographie, aux
 * filets dorés et à la mise en page.
 */
const printCss = `
@page { size: A4; margin: 18mm 16mm; }
@media print {
  .page-break { break-before: page; }
  a { text-decoration: none; color: inherit; }
}
`;

const dateFr = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

export default async function PrintableReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const record = await reportStore.get(id);
  const assessment = record ? await assessmentStore.get(record.assessmentId) : null;
  if (!record || !assessment) notFound();

  const r = assembleReport(assessment);

  return (
    <article
      style={{
        backgroundColor: colors.ivory,
        color: colors.navy900,
        maxWidth: 820,
        margin: "0 auto",
        padding: "48px 40px 72px",
        fontFamily: fonts.sans,
      }}
    >
      <style>{printCss}</style>

      {/* En-tête */}
      <header style={{ borderBottom: `2px solid ${colors.gold}`, paddingBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontFamily: fonts.serif, fontSize: "1.3rem", letterSpacing: "0.18em" }}>
            ADMITTO
          </span>
          <span style={{ fontSize: "0.72rem", letterSpacing: "0.12em", color: colors.slate }}>
            {dateFr(r.generatedAt)}
          </span>
        </div>
        <h1
          style={{
            fontFamily: fonts.serif,
            fontWeight: 300,
            fontSize: "2rem",
            lineHeight: 1.2,
            margin: "22px 0 0",
          }}
        >
          Rapport éducatif et stratégique
          {r.firstName ? ` — ${r.firstName}` : ""}
        </h1>
      </header>

      <Section title="Synthèse">
        <P>{r.summary}</P>
      </Section>

      <Section title="Voie préliminaire">
        <Callout>{r.pathLabel}</Callout>
        {r.pathText.map((t) => (
          <P key={t}>{t}</P>
        ))}
      </Section>

      <Section title="Partenariats">
        <P>{r.partnerships}</P>
      </Section>

      <Section title="Viabilité du projet — cinq axes">
        <Callout>{r.verdictTitle}</Callout>
        <P>{r.verdictBody}</P>
        {r.shiftIntake && (
          <P>
            Le calendrier actuel est très contraint : viser la rentrée suivante permettrait de
            déposer un dossier complet plutôt qu&apos;un dossier précipité.
          </P>
        )}
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 18 }}>
          <tbody>
            {r.axes.map((axis) => (
              <tr key={axis.axis} style={{ borderTop: `1px solid rgba(10, 22, 40, 0.12)` }}>
                <td
                  style={{
                    padding: "10px 12px 10px 0",
                    fontSize: "0.86rem",
                    width: 190,
                    verticalAlign: "top",
                  }}
                >
                  {axis.label}
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    fontFamily: fonts.serif,
                    fontSize: "1rem",
                    color: colors.gold,
                    width: 56,
                    verticalAlign: "top",
                  }}
                >
                  {axis.score}/4
                </td>
                <td
                  style={{
                    padding: "10px 0",
                    fontSize: "0.84rem",
                    lineHeight: 1.6,
                    color: colors.slate,
                  }}
                >
                  {axis.comment}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <div className="page-break" />

      <Section title="Risques principaux et actions correctrices">
        {r.risks.length === 0 ? (
          <P>
            Aucun axe ne ressort comme fragile à partir des informations transmises. Les risques
            résiduels tiennent à l&apos;exécution : respect des échéances et qualité du dossier.
          </P>
        ) : (
          r.risks.map((risk) => (
            <div key={risk.axis} style={{ marginTop: 22 }}>
              <h3 style={{ fontFamily: fonts.serif, fontWeight: 400, fontSize: "1.1rem", margin: 0 }}>
                {risk.title}
              </h3>
              <P>{risk.body}</P>
              <ul style={{ margin: "10px 0 0", paddingLeft: 0 }}>
                {risk.actions.map((action) => (
                  <li
                    key={action}
                    style={{
                      display: "flex",
                      gap: 10,
                      fontSize: "0.86rem",
                      lineHeight: 1.65,
                      color: colors.slate,
                      marginBottom: 6,
                    }}
                  >
                    <span style={{ color: colors.gold }}>✦</span>
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </Section>

      <Section title="Prochaines étapes">
        <ol style={{ margin: "12px 0 0", paddingLeft: 0, counterReset: "step" }}>
          {r.nextSteps.map((step, i) => (
            <li
              key={step}
              style={{
                display: "flex",
                gap: 12,
                fontSize: "0.88rem",
                lineHeight: 1.65,
                marginBottom: 8,
              }}
            >
              <span style={{ color: colors.gold, fontFamily: fonts.serif }}>{i + 1}.</span>
              {step}
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Timeline">
        <P>{r.timelineLead}</P>
        {r.timeline.map((d) => (
          <div
            key={d.key}
            style={{
              display: "grid",
              gridTemplateColumns: "140px 1fr",
              gap: 14,
              padding: "9px 0",
              borderTop: `1px solid rgba(10, 22, 40, 0.12)`,
            }}
          >
            <span style={{ fontSize: "0.8rem", color: colors.gold }}>{dateFr(d.date)}</span>
            <span style={{ fontSize: "0.86rem" }}>
              {d.label}
              <span style={{ display: "block", fontSize: "0.78rem", color: colors.slate }}>
                {d.note}
              </span>
            </span>
          </div>
        ))}
      </Section>

      <Section title="Scénarios de coût">
        <P>{r.costsLead}</P>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 14 }}>
          <tbody>
            {[
              ["Coût académique", assessment.costs.academic],
              ["Coût de la vie", assessment.costs.living],
              ["Barreau et admission", assessment.costs.barAndAdmission],
              ["Total indicatif", assessment.costs.total],
            ].map(([label, range]) => {
              const v = range as { lowUsd: number; highUsd: number };
              return (
                <tr key={label as string} style={{ borderTop: `1px solid rgba(10, 22, 40, 0.12)` }}>
                  <td style={{ padding: "9px 0", fontSize: "0.86rem" }}>{label as string}</td>
                  <td
                    style={{
                      padding: "9px 0",
                      fontSize: "0.86rem",
                      textAlign: "right",
                      fontFamily: fonts.serif,
                    }}
                  >
                    {formatUsd(v.lowUsd)} – {formatUsd(v.highUsd)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <P>Non compris à ce stade : {assessment.costs.notIncluded.join(", ")}.</P>
      </Section>

      <Section title="Offre recommandée">
        <Callout>{r.offerName}</Callout>
        <P>{r.offerBody}</P>
      </Section>

      <Section title="Sources et dates de vérification">
        <P>{r.sourcesLead}</P>
        {r.sources.length === 0 ? (
          <P>
            Aucune règle réglementaire n&apos;a été appliquée automatiquement à votre situation :
            elle fait l&apos;objet d&apos;une revue humaine.
          </P>
        ) : (
          <ul style={{ margin: "10px 0 0" }}>
            {r.sources.map((s) => (
              <li
                key={s.label}
                style={{ fontSize: "0.82rem", lineHeight: 1.6, color: colors.slate, marginBottom: 6 }}
              >
                {s.label} — {s.url} — vérifiée le {s.verifiedAt ?? "—"}
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Signature et disclaimer */}
      <footer style={{ marginTop: 44, borderTop: `2px solid ${colors.gold}`, paddingTop: 20 }}>
        {r.signature.map((line, i) => (
          <p
            key={line}
            style={{
              margin: 0,
              fontSize: i === 0 ? "0.95rem" : "0.82rem",
              fontFamily: i === 0 ? fonts.serif : fonts.sans,
              color: i === 0 ? colors.navy900 : colors.slate,
              lineHeight: 1.6,
            }}
          >
            {line}
          </p>
        ))}
        <p
          style={{
            fontSize: "0.72rem",
            lineHeight: 1.65,
            margin: "22px 0 0",
            color: colors.slate,
          }}
        >
          {r.disclaimer}
        </p>
      </footer>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: 34 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ display: "block", width: 28, height: 1, backgroundColor: colors.gold }} />
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
      <div style={{ marginTop: 12 }}>{children}</div>
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: "0.88rem", lineHeight: 1.7, margin: "10px 0 0", color: colors.slate }}>
      {children}
    </p>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-block",
        border: `1px solid ${colors.gold}`,
        padding: "8px 14px",
        fontSize: "0.82rem",
        letterSpacing: "0.03em",
        color: colors.navy900,
      }}
    >
      {children}
    </span>
  );
}
