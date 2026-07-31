import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { colors, fonts } from "@/design/tokens";
import { globalCss } from "@/design/global-css";
import { resetCss } from "@/design/reset";
import { publicBaseUrl } from "@/lib/seo/site";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-dm-sans",
});

const TITLE = "Admitto — U.S. LL.M. & New York Bar, avec méthode";
const DESCRIPTION =
  "Un système personnalisé de décision, de planification et d'exécution pour les juristes formés en France qui visent un LL.M. américain et le barreau de New York.";

/**
 * Métadonnées communes (lot E).
 *
 * `metadataBase` n'est posé que si le site est public. Sans lui, Next.js rend
 * les URL canoniques et OpenGraph en chemins relatifs — ce qui est le bon
 * comportement en prévisualisation : une balise canonique absolue pointant
 * vers un domaine de test survit au copier-coller et désigne le mauvais site.
 *
 * `title.template` évite de répéter la marque dans chaque page : une page qui
 * pose son propre titre obtient « Titre — Admitto » sans le savoir. Les pages
 * qui portent déjà la marque dans leur titre restent explicites, le gabarit ne
 * s'applique qu'aux titres bruts.
 */
export const metadata: Metadata = {
  metadataBase: publicBaseUrl() ? new URL(publicBaseUrl() as string) : undefined,
  title: { default: TITLE, template: "%s" },
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Admitto",
    title: TITLE,
    description: DESCRIPTION,
  },
  // Pas d'image OpenGraph : il n'en existe aucune. En déclarer une absente
  // produirait un aperçu vide chez chaque destinataire d'un lien partagé.
  twitter: { card: "summary", title: TITLE, description: DESCRIPTION },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body
        style={{
          margin: 0,
          backgroundColor: colors.navy900,
          color: colors.ivory,
          fontFamily: fonts.sans,
        }}
      >
        <style>{resetCss + globalCss}</style>
        {/*
          Premier élément focusable du document, sur TOUTES les pages (WCAG
          2.4.1). Sans lui, atteindre le contenu au clavier demandait de
          traverser la navigation entière à chaque page — jusqu'à huit entrées
          dans l'espace payant. Sa cible est le `<main id="contenu">` de chaque
          page ; le style vit dans `design/global-css.ts`, il dépend de `:focus`.
        */}
        <a href="#contenu" className="skip-link">
          Aller au contenu principal
        </a>
        {children}
      </body>
    </html>
  );
}
