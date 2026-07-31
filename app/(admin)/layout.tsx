import Link from "next/link";
import { colors, fonts, alpha } from "@/design/tokens";

/**
 * Layout du back-office. Volontairement sobre : c'est un outil de travail,
 * mais il reste dans la charte (mêmes tokens, mêmes typographies).
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: colors.ivory, minHeight: "100vh" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 6%",
          height: 64,
          backgroundColor: colors.navy900,
        }}
      >
        <Link
          href="/admin"
          style={{
            fontFamily: fonts.serif,
            fontSize: "1.1rem",
            letterSpacing: "0.16em",
            color: colors.ivory,
            textDecoration: "none",
          }}
        >
          ADMITTO
        </Link>
        <span
          style={{
            fontFamily: fonts.sans,
            fontSize: "0.68rem",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: colors.gold,
          }}
        >
          Back-office
        </span>
      </header>

      <main id="contenu" tabIndex={-1} style={{ padding: "48px 6% 96px", maxWidth: 1100 }}>{children}</main>

      <footer
        style={{
          padding: "24px 6% 40px",
          borderTop: `1px solid ${alpha.cardGridGap}`,
        }}
      >
        <p
          style={{
            fontFamily: fonts.sans,
            fontSize: "0.75rem",
            lineHeight: 1.7,
            margin: 0,
            color: colors.slate,
          }}
        >
          Chaque rapport doit être relu par un humain avant envoi (CDC §17). Toute dérogation à la
          méthodologie doit être consignée dans le journal des corrections.
        </p>
      </footer>
    </div>
  );
}
