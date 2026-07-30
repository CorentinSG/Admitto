import type { Metadata } from "next";
import { LegalPage } from "../_components/LegalPage";
import { legalDocument, LEGAL_DOCUMENTS } from "@/content/legal";

/** Conditions générales de vente et d'utilisation. */
const document = legalDocument("conditions-generales")!;

export const metadata: Metadata = {
  title: `${document.title} — Admitto`,
  description: document.intro,
};

export default function Page() {
  return (
    <LegalPage
      document={document}
      others={LEGAL_DOCUMENTS.filter((d) => d.slug !== document.slug)}
    />
  );
}
