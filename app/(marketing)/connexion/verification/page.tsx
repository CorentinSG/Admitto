import Link from "next/link";
import type { Metadata } from "next";
import { colors, fonts } from "@/design/tokens";
import { auth as copy } from "@/content/auth";

export const metadata: Metadata = {
  title: "Vérifiez votre email — Admitto",
  robots: { index: false, follow: false },
};

/**
 * Confirmation d'envoi (CDC §10).
 *
 * Le texte est volontairement conditionnel — « si un compte peut être créé » :
 * confirmer l'existence d'un compte ferait de cette page un outil
 * d'énumération des clients.
 */
export default function VerifyRequestPage() {
  return (
    <main id="contenu" tabIndex={-1} style={{ backgroundColor: colors.ivory, minHeight: "100vh", padding: "120px 8%" }}>
      <div style={{ maxWidth: 620 }}>
        <h1
          style={{
            fontFamily: fonts.serif,
            fontWeight: 300,
            fontSize: "2.2rem",
            margin: 0,
            color: colors.navy900,
          }}
        >
          {copy.checkTitle}
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
          {copy.checkBody}
        </p>
        <p
          style={{
            fontFamily: fonts.sans,
            fontSize: "0.88rem",
            lineHeight: 1.8,
            margin: "14px 0 0",
            color: colors.slate,
          }}
        >
          {copy.checkNote}
        </p>

        <Link
          href="/connexion"
          style={{
            display: "inline-block",
            marginTop: 32,
            fontFamily: fonts.sans,
            fontSize: "0.82rem",
            color: colors.goldText,
            textDecoration: "none",
          }}
        >
          ← {copy.backToSignIn}
        </Link>
      </div>
    </main>
  );
}
