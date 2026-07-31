import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { colors, fonts } from "@/design/tokens";
import { globalCss } from "@/design/global-css";
import { resetCss } from "@/design/reset";

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

export const metadata: Metadata = {
  title: "Admitto — U.S. LL.M. & New York Bar, avec méthode",
  description:
    "Un système personnalisé de décision, de planification et d'exécution pour les juristes formés en France qui visent un LL.M. américain et le barreau de New York.",
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
