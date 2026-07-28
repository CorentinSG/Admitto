import { Nav } from "./_components/Nav";
import { Footer } from "./_components/Footer";
import { Hero } from "./_sections/Hero";
import { Problem } from "./_sections/Problem";
import { Solution } from "./_sections/Solution";
import { Diagnostic } from "./_sections/Diagnostic";
import { Journey } from "./_sections/Journey";
import { DashboardPreview } from "./_sections/DashboardPreview";
import { Modules } from "./_sections/Modules";
import { Offers } from "./_sections/Offers";
import { Founder } from "./_sections/Founder";
import { Faq } from "./_sections/Faq";
import { FinalCta } from "./_sections/FinalCta";

/**
 * Page d'accueil — les dix blocs du CDC §11, dans l'ordre prescrit.
 * Les sections sont des client components (IntersectionObserver) ; la page
 * elle-même reste un server component et est prérendue statiquement, donc
 * servie depuis le CDN (voir docs/CACHE_OPTIMIZATION.md).
 */

const responsiveCss = `
@media (max-width: 900px) {
  .solution-grid-inner { grid-template-columns: 1fr !important; gap: 48px !important; }
  .nav-links { display: none !important; }
}
`;

export default function HomePage() {
  return (
    <>
      <style>{responsiveCss}</style>
      <Nav />
      <main>
        <Hero />
        <Problem />
        <Solution />
        <Diagnostic />
        <Journey />
        <DashboardPreview />
        <Modules />
        <Offers />
        <Founder />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
