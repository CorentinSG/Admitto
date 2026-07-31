import type { Metadata } from "next";
import { Nav } from "../_components/Nav";
import { Footer } from "../_components/Footer";
import { Offers } from "../_sections/Offers";
import { FinalCta } from "../_sections/FinalCta";
import { MARKETING_PAGES } from "@/content/pages";
import { canonical } from "@/lib/seo/site";

const PAGE = MARKETING_PAGES[0];

export const metadata: Metadata = {
  title: PAGE.title,
  description: PAGE.description,
  alternates: canonical(PAGE.path),
};

/**
 * Offres et tarifs, servis seuls (lot E).
 *
 * La section est celle de la page d'accueil, sans copie dupliquée : c'est la
 * MÊME `<Offers />`. Seule sa balise de titre change — `h1` ici, `h2` là-bas
 * (voir `SectionTitle`).
 *
 * Nav transparente : la section est sur fond sombre, comme le héros de
 * l'accueil. Les pages à fond clair (`/faq`, `/a-propos`) la passent en
 * `solid`, sinon la marque serait ivoire sur ivoire.
 */
export default function OffersPage() {
  return (
    <>
      <Nav />
      <main id="contenu" tabIndex={-1}>
        <Offers asPageTitle />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
