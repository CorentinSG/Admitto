import Link from "next/link";
import { colors, fonts, alpha } from "@/design/tokens";
import { dashboard } from "@/content/dashboard";
import { LEGAL_DOCUMENTS } from "@/content/legal";
import { SignOutButton } from "./SignOutButton";

/**
 * Layout de l'espace payant. Fond clair : c'est un outil de travail consulté
 * longuement, pas une page de séduction. La charte reste la même — mêmes
 * tokens, mêmes typographies, filets dorés.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: colors.ivory, minHeight: "100vh" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
          padding: "0 6%",
          height: 68,
          backgroundColor: colors.navy900,
        }}
      >
        <Link
          href="/app/dashboard"
          style={{
            fontFamily: fonts.serif,
            fontSize: "1.15rem",
            letterSpacing: "0.16em",
            color: colors.ivory,
            textDecoration: "none",
          }}
        >
          ADMITTO
        </Link>

        <nav style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {dashboard.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                fontFamily: fonts.sans,
                fontSize: "0.82rem",
                letterSpacing: "0.04em",
                color: alpha.whiteCtaText,
                textDecoration: "none",
              }}
            >
              {item.label}
            </Link>
          ))}
          <SignOutButton />
        </nav>
      </header>

      <main style={{ padding: "44px 6% 48px", maxWidth: 1120 }}>{children}</main>

      {/*
        Liens légaux au pied de l'espace payant aussi, et pas seulement sur le
        site public : c'est ici que se trouvent les personnes qui ont payé,
        donc celles qui ont un intérêt concret aux conditions et à la politique
        de confidentialité.
      */}
      <footer
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 22,
          padding: "0 6% 48px",
          maxWidth: 1120,
        }}
      >
        {LEGAL_DOCUMENTS.map((document) => (
          <Link
            key={document.slug}
            href={`/${document.slug}`}
            style={{
              fontFamily: fonts.sans,
              fontSize: "0.78rem",
              color: colors.slate,
              textDecoration: "none",
            }}
          >
            {document.title}
          </Link>
        ))}
      </footer>
    </div>
  );
}
