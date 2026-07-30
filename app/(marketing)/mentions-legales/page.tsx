import type { Metadata } from "next";
import { LegalPage } from "../_components/LegalPage";
import { legalDocument, LEGAL_DOCUMENTS } from "@/content/legal";

/**
 * Mentions légales (LCEN art. 6-III).
 *
 * Trois routes explicites plutôt qu'une route dynamique : les adresses sont
 * déjà câblées dans le pied de page et n'ont aucune raison de varier. Une
 * `[slug]` à la racine du groupe marketing capterait en prime tout chemin
 * inconnu, et un 404 deviendrait une page légale vide.
 */
const document = legalDocument("mentions-legales")!;

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
