import type { Metadata } from "next";
import { Nav } from "../_components/Nav";
import { Footer } from "../_components/Footer";
import { Founder } from "../_sections/Founder";
import { FinalCta } from "../_sections/FinalCta";
import { MARKETING_PAGES } from "@/content/pages";
import { canonical } from "@/lib/seo/site";

const PAGE = MARKETING_PAGES[2];

export const metadata: Metadata = {
  title: PAGE.title,
  description: PAGE.description,
  alternates: canonical(PAGE.path),
};

/** À propos, servi seul (lot E). Voir `/offres` pour le motif. */
export default function AboutPage() {
  return (
    <>
      {/* Fond ivoire : voir `/faq`. */}
      <Nav solid />
      <main id="contenu" tabIndex={-1}>
        <Founder asPageTitle />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
