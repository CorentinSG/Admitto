import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { colors, fonts } from "@/design/tokens";
import { globalCss } from "@/design/animations";

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
        <style>{globalCss}</style>
        {children}
      </body>
    </html>
  );
}
