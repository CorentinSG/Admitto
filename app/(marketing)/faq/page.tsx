import type { Metadata } from "next";
import { Nav } from "../_components/Nav";
import { Footer } from "../_components/Footer";
import { Faq } from "../_sections/Faq";
import { FinalCta } from "../_sections/FinalCta";
import { MARKETING_PAGES } from "@/content/pages";
import { canonical } from "@/lib/seo/site";

const PAGE = MARKETING_PAGES[1];

export const metadata: Metadata = {
  title: PAGE.title,
  description: PAGE.description,
  alternates: canonical(PAGE.path),
};

/** Questions fréquentes, servies seules (lot E). Voir `/offres` pour le motif. */
export default function FaqPage() {
  return (
    <>
      {/* Fond ivoire : nav opaque, sans quoi marque et liens blancs seraient
          posés sur clair. */}
      <Nav solid />
      <main id="contenu" tabIndex={-1}>
        <Faq asPageTitle />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
