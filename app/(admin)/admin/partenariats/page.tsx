import Link from "next/link";
import type { Metadata } from "next";
import { colors, fonts, alpha } from "@/design/tokens";
import { PARTNERSHIPS_DATA, IMPORT_SOURCE } from "@/content/partnerships.generated";
import { PARTNERSHIP_LABELS, TUITION_LABELS } from "@/content/partnerships-labels";
import { UNIVERSITIES } from "@/content/universities";
import { assessmentStore } from "@/lib/store/assessments";
import { reportStore } from "@/lib/store/reports";
import { coverageRate } from "@/lib/partnerships/detect";

export const metadata: Metadata = {
  title: "Partenariats — Admitto",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const RELIABILITY_LABELS: Record<string, string> = {
  confirmed: "Confirmé",
  to_confirm: "À confirmer",
  incomplete: "Incomplet",
};

/**
 * Back-office — base de partenariats (CDC §27 et §33).
 *
 * Affiche la couverture, le taux de détection mesuré sur les diagnostics reçus,
 * et les universités fréquemment demandées mais non couvertes — les trois
 * métriques que le cahier des charges demande de suivre.
 */
export default async function AdminPartnershipsPage() {
  const reports = await reportStore.all();
  const assessments = await Promise.all(reports.map((r) => assessmentStore.get(r.assessmentId)));
  const requested = assessments.map((a) => a?.answers.university);

  const covered = new Set(PARTNERSHIPS_DATA.map((p) => p.frenchUniversityId));
  const missing = new Map<string, number>();
  for (const id of requested) {
    if (id && !covered.has(id)) missing.set(id, (missing.get(id) ?? 0) + 1);
  }

  const confirmed = PARTNERSHIPS_DATA.filter((p) => p.active).length;
  const byUniversity = [...covered]
    .map((id) => ({
      id,
      name: UNIVERSITIES.find((u) => u.id === id)?.name ?? id,
      total: PARTNERSHIPS_DATA.filter((p) => p.frenchUniversityId === id).length,
      confirmed: PARTNERSHIPS_DATA.filter((p) => p.frenchUniversityId === id && p.active).length,
    }))
    .sort((a, b) => b.total - a.total);

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
        Base de partenariats
      </h1>
      <p style={{ fontFamily: fonts.sans, fontSize: "0.85rem", margin: "8px 0 0", color: colors.slate }}>
        Importée depuis{" "}
        <a href={IMPORT_SOURCE.repo} style={{ color: colors.gold }}>
          {IMPORT_SOURCE.repo.replace("https://github.com/", "")}
        </a>{" "}
        · commit {IMPORT_SOURCE.commit.slice(0, 8)} · instantané du {IMPORT_SOURCE.importedAt}
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
          gap: 1,
          backgroundColor: alpha.cardGridGap,
          border: `1px solid ${alpha.cardGridGap}`,
          marginTop: 28,
        }}
      >
        <Stat label="Partenariats" value={String(PARTNERSHIPS_DATA.length)} />
        <Stat label="Dont confirmés" value={String(confirmed)} />
        <Stat label="Universités couvertes" value={String(covered.size)} />
        <Stat
          label="Taux de détection"
          value={requested.length ? `${coverageRate(requested)} %` : "—"}
        />
      </div>
      <p
        style={{
          fontFamily: fonts.sans,
          fontSize: "0.8rem",
          lineHeight: 1.7,
          margin: "12px 0 0",
          color: colors.slate,
        }}
      >
        Le taux de détection est la part des diagnostics reçus dont l&apos;université figure dans la
        base (CDC §27). Il se mesure sur {requested.length} diagnostic(s).
      </p>

      {missing.size > 0 && (
        <Section title="Universités demandées mais non couvertes">
          {[...missing.entries()]
            .sort((a, b) => b[1] - a[1])
            .map(([id, count]) => (
              <Row
                key={id}
                left={UNIVERSITIES.find((u) => u.id === id)?.name ?? id}
                right={`${count} demande(s)`}
              />
            ))}
        </Section>
      )}

      <Section title="Couverture par université">
        {byUniversity.map((u) => (
          <Row key={u.id} left={u.name} right={`${u.confirmed} confirmés / ${u.total}`} />
        ))}
      </Section>

      <Section title={`Fiches (${PARTNERSHIPS_DATA.length})`}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
            <thead>
              <tr>
                {["Université française", "Law school", "Avantage", "Frais", "Niveau", "Fiabilité"].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "0 12px 10px 0",
                        fontFamily: fonts.sans,
                        fontSize: "0.68rem",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: colors.slate,
                        fontWeight: 400,
                      }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {PARTNERSHIPS_DATA.map((p) => (
                <tr key={p.id} style={{ borderTop: `1px solid ${alpha.cardGridGap}` }}>
                  <Cell>{p.frenchUniversity}</Cell>
                  <Cell>{p.usLawSchool}</Cell>
                  <Cell>{PARTNERSHIP_LABELS[p.partnershipType]}</Cell>
                  <Cell>{TUITION_LABELS[p.tuitionCategory]}</Cell>
                  <Cell>{p.requiredLevel ?? "—"}</Cell>
                  <Cell highlight={p.reliability !== "confirmed"}>
                    {RELIABILITY_LABELS[p.reliability]}
                  </Cell>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
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
          margin: 0,
        }}
      >
        {title}
      </h2>
      <div style={{ marginTop: 14 }}>{children}</div>
    </section>
  );
}

function Row({ left, right }: { left: string; right: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 16,
        padding: "10px 0",
        borderTop: `1px solid ${alpha.cardGridGap}`,
        fontFamily: fonts.sans,
        fontSize: "0.88rem",
        color: colors.navy900,
      }}
    >
      <span>{left}</span>
      <span style={{ color: colors.slate }}>{right}</span>
    </div>
  );
}

function Cell({ children, highlight }: { children: React.ReactNode; highlight?: boolean }) {
  return (
    <td
      style={{
        padding: "10px 12px 10px 0",
        fontFamily: fonts.sans,
        fontSize: "0.84rem",
        color: highlight ? colors.gold : colors.navy900,
        verticalAlign: "top",
      }}
    >
      {children}
    </td>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ backgroundColor: colors.ivory, padding: "20px 18px" }}>
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
          fontSize: "1.5rem",
          margin: "8px 0 0",
          color: colors.navy900,
        }}
      >
        {value}
      </span>
    </div>
  );
}
