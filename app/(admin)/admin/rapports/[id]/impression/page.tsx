import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { reportStore } from "@/lib/store/reports";
import { assessmentStore } from "@/lib/store/assessments";
import { assembleReportLive } from "@/lib/matrices/load";
import { ReportDocument } from "@/app/_components/ReportDocument";

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
 *
 * Le rendu lui-même vit dans `ReportDocument`, partagé avec la page que lit
 * l'utilisateur : deux rendus séparés divergeraient, et le document imprimé
 * cesserait de correspondre à celui lu à l'écran sans que rien ne le signale.
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

  return (
    <>
      <style>{printCss}</style>
      <ReportDocument
        report={await assembleReportLive(assessment)}
        assessment={assessment}
        dateFr={dateFr}
      />
    </>
  );
}
