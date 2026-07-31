import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { colors, fonts, alpha } from "@/design/tokens";
import { currentUser } from "@/lib/auth/current";
import { usingDatabase } from "@/lib/db/client";
import { donnees, HELD_DATA } from "@/content/donnees";
import { EraseForm } from "./EraseForm";

export const metadata: Metadata = {
  title: "Vos données — Admitto",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Exercice des droits d'accès, de portabilité et d'effacement (revue §A1.2).
 *
 * Contrairement aux autres écrans de l'espace, celui-ci ne dépend pas d'un
 * diagnostic : quelqu'un qui n'en a jamais soumis a tout de même un compte, et
 * donc le droit de l'effacer. Rediriger vers `/diagnostic` faute de diagnostic
 * lui refuserait l'accès à ses propres droits.
 */
export default async function DonneesPage() {
  const user = await currentUser();
  if (!user) redirect("/connexion");

  const available = usingDatabase();

  const heading = {
    fontFamily: fonts.serif,
    fontWeight: 400,
    fontSize: "1.3rem",
    margin: "0 0 12px",
    color: colors.navy900,
  } as const;

  const body = {
    fontFamily: fonts.sans,
    fontSize: "0.9rem",
    lineHeight: 1.8,
    maxWidth: 660,
    margin: 0,
    color: colors.slate,
  } as const;

  const card = {
    marginTop: 32,
    padding: "28px 30px",
    border: `1px solid ${alpha.cardGridGap}`,
  } as const;

  return (
    <div>
      <h1
        style={{
          fontFamily: fonts.serif,
          fontWeight: 300,
          fontSize: "2.1rem",
          margin: 0,
          color: colors.navy900,
        }}
      >
        {donnees.title}
      </h1>
      <p style={{ ...body, margin: "14px 0 0" }}>{donnees.intro}</p>

      <section style={card}>
        <h2 style={heading}>{donnees.held.title}</h2>
        <p style={body}>{donnees.held.intro}</p>
        <ul style={{ margin: "16px 0 0", paddingLeft: 20 }}>
          {HELD_DATA.map((item) => (
            <li key={item} style={{ ...body, marginBottom: 8 }}>
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section style={card}>
        <h2 style={heading}>{donnees.export.title}</h2>
        <p style={body}>{available ? donnees.export.body : donnees.export.unavailable}</p>
        {available ? (
          // Lien plutôt que bouton : le téléchargement est une navigation vers
          // une route qui renvoie un fichier, pas une mutation.
          <a
            href="/app/donnees/export"
            style={{
              display: "inline-block",
              marginTop: 18,
              fontFamily: fonts.sans,
              fontSize: "0.82rem",
              letterSpacing: "0.08em",
              padding: "12px 26px",
              color: colors.navy900,
              border: `1px solid ${colors.gold}`,
              textDecoration: "none",
            }}
          >
            {donnees.export.action}
          </a>
        ) : null}
      </section>

      <section style={card}>
        <h2 style={heading}>{donnees.erase.title}</h2>
        <p style={body}>{available ? donnees.erase.body : donnees.erase.unavailable}</p>
        {available ? (
          <>
            <p style={{ ...body, marginTop: 12, color: colors.goldText }}>{donnees.erase.hint}</p>
            <EraseForm disabled={!available} />
          </>
        ) : null}
      </section>

      <section style={card}>
        <h2 style={heading}>{donnees.other.title}</h2>
        <p style={body}>{donnees.other.body}</p>
        <Link
          href={donnees.other.href}
          style={{
            display: "inline-block",
            marginTop: 16,
            fontFamily: fonts.sans,
            fontSize: "0.85rem",
            color: colors.goldText,
            textDecoration: "none",
          }}
        >
          {donnees.other.link} →
        </Link>
      </section>
    </div>
  );
}
