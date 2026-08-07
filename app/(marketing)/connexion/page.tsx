import Link from "next/link";
import type { Metadata } from "next";
import { colors, fonts, alpha } from "@/design/tokens";
import { auth as copy } from "@/content/auth";
import { SignInForm } from "./SignInForm";
import { accountsAvailable } from "@/lib/config/capabilities";

export const metadata: Metadata = {
  title: "Connexion — Admitto",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/** Connexion par lien email (CDC §10). */
export default function SignInPage() {
  // Fermé plutôt que cassé : sans base ni secret, aucune connexion n'est
  // possible et la page le dit, au lieu d'offrir un formulaire sans effet.
  const available = accountsAvailable();

  return (
    <main id="contenu" tabIndex={-1} style={{ backgroundColor: colors.ivory, minHeight: "100vh", padding: "120px 8%" }}>
      <div style={{ maxWidth: 620 }}>
        <h1
          style={{
            fontFamily: fonts.serif,
            fontWeight: 300,
            fontSize: "2.4rem",
            margin: 0,
            color: colors.navy900,
          }}
        >
          {copy.title}
        </h1>
        <p
          style={{
            fontFamily: fonts.sans,
            fontSize: "0.95rem",
            lineHeight: 1.8,
            margin: "16px 0 0",
            color: colors.slate,
          }}
        >
          {available ? copy.intro : copy.closedBody}
        </p>

        <SignInForm disabled={!available} />

        <Link
          href="/diagnostic"
          style={{
            display: "inline-block",
            marginTop: 36,
            paddingTop: 24,
            borderTop: `1px solid ${alpha.cardGridGap}`,
            fontFamily: fonts.sans,
            fontSize: "0.82rem",
            color: colors.goldText,
            textDecoration: "none",
          }}
        >
          {copy.startDiagnostic} →
        </Link>
      </div>
    </main>
  );
}
