import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { colors, fonts, alpha } from "@/design/tokens";
import { reportStore } from "@/lib/store/reports";
import { assessmentStore } from "@/lib/store/assessments";
import { assembleReport } from "@/lib/report/assemble";
import { resultAccess } from "@/lib/access/result";
import { announcedDelay } from "@/lib/capacity/delay";
import { rapport } from "@/content/rapport";
import { ReportDocument } from "@/app/_components/ReportDocument";

export const metadata: Metadata = {
  title: "Votre rapport — Admitto",
  robots: { index: false, follow: false }, // document personnel : jamais indexé
};

export const dynamic = "force-dynamic";

const dateFr = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

/**
 * Le rapport, du côté de celui qui l'a demandé (CDC §17).
 *
 * Il manquait purement et simplement. Le rapport est le livrable central du
 * diagnostic : il était rédigé, relu et marqué envoyé depuis le back-office,
 * et son destinataire n'avait aucun écran pour le lire. L'email « votre
 * rapport est prêt » pointait vers `/resultat/[id]`, c'est-à-dire vers le
 * résultat préliminaire gratuit — le lien tenait sa promesse à moitié.
 *
 * Deux règles :
 *
 * 1. **Même contrôle d'accès que le résultat** (`resultAccess`) : tant que le
 *    diagnostic n'est revendiqué par aucun compte, le lien suffit — le J+2
 *    part avant qu'un compte n'existe. Une fois revendiqué, il faut être
 *    connecté.
 * 2. **Rien n'est montré avant que le rapport ne soit envoyé.** Un rapport en
 *    cours de rédaction est un brouillon non relu ; l'afficher parce que
 *    l'assemblage sait le produire court-circuiterait la relecture humaine, qui
 *    est précisément ce que le CDC §17 impose.
 */
export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const assessment = await assessmentStore.get(id);
  if (!assessment) notFound();

  if ((await resultAccess(id)) === "DENIED") redirect("/connexion?motif=rapport");

  const record = await reportStore.get(id);
  const ready = record?.status === "SENT";

  if (!ready) {
    const active = await reportStore.activeCount();
    return (
      <main style={{ backgroundColor: colors.ivory, minHeight: "100vh", padding: "120px 8%" }}>
        <div style={{ maxWidth: 620 }}>
          <h1
            style={{
              fontFamily: fonts.serif,
              fontWeight: 300,
              fontSize: "2.2rem",
              margin: 0,
              color: colors.navy900,
            }}
          >
            {rapport.pendingTitle}
          </h1>
          <p
            style={{
              fontFamily: fonts.sans,
              fontSize: "0.95rem",
              lineHeight: 1.85,
              margin: "18px 0 0",
              color: colors.slate,
            }}
          >
            {rapport.pendingBody(announcedDelay(active))}
          </p>
          <Link
            href={`/resultat/${id}`}
            style={{
              display: "inline-block",
              marginTop: 32,
              paddingTop: 22,
              borderTop: `1px solid ${alpha.cardGridGap}`,
              fontFamily: fonts.sans,
              fontSize: "0.85rem",
              color: colors.gold,
              textDecoration: "none",
            }}
          >
            {rapport.backToResult} →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ backgroundColor: colors.ivory, minHeight: "100vh", padding: "40px 0 80px" }}>
      {/*
        Impression : une règle @media print suffit, plutôt qu'une seconde route.
        Le bouton du navigateur produit alors le même document que le PDF du
        back-office, puisque c'est le même composant.
      */}
      <style>{`
@page { size: A4; margin: 18mm 16mm; }
@media print { .no-print { display: none !important; } .page-break { break-before: page; } }
`}</style>

      <div
        className="no-print"
        style={{ maxWidth: 820, margin: "0 auto", padding: "0 40px 8px" }}
      >
        <p
          style={{
            fontFamily: fonts.sans,
            fontSize: "0.8rem",
            lineHeight: 1.7,
            margin: 0,
            color: colors.slate,
          }}
        >
          {rapport.printHint}
        </p>
      </div>

      <ReportDocument
        report={assembleReport(assessment)}
        assessment={assessment}
        dateFr={dateFr}
      />
    </main>
  );
}
