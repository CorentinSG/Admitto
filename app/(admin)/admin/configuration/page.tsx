import Link from "next/link";
import type { Metadata } from "next";
import { colors, fonts, alpha } from "@/design/tokens";
import { capabilityStates } from "@/lib/config/capabilities";
import { missingEntries } from "@/lib/legal/types";
import { LEGAL_DOCUMENTS } from "@/content/legal";
import { configuration } from "@/content/configuration";

export const metadata: Metadata = {
  title: "Configuration — Admitto",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Back-office — état de la configuration.
 *
 * Chaque capacité du produit est fermée par défaut et s'ouvre par
 * configuration. C'était vrai, documenté dans `.env.example`, et invisible :
 * pour savoir si le paiement était actif il fallait ouvrir une page de
 * paiement, pour savoir si les emails partaient il fallait en déclencher un.
 * Trois capacités s'ouvraient d'ailleurs à moitié sans que rien ne le dise.
 *
 * Cette page répond à la seule question qui compte le jour de la mise en
 * service : **qu'est-ce qui est ouvert, et que manque-t-il pour le reste ?**
 *
 * Elle ne lit JAMAIS la valeur d'une variable, seulement sa présence. Un
 * back-office qui affiche une clé secrète la met dans une capture d'écran.
 */
export default async function AdminConfigurationPage() {
  const capabilities = capabilityStates();
  const open = capabilities.filter((capability) => capability.open).length;

  // Les mentions légales manquantes appartiennent à la même question — ce qui
  // reste à faire avant d'ouvrir — et se comptent depuis la même page.
  const legalMissing = LEGAL_DOCUMENTS.flatMap((document) => missingEntries(document));

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 20 }}>
        <h1
          style={{
            fontFamily: fonts.serif,
            fontWeight: 300,
            fontSize: "2.2rem",
            margin: 0,
            color: colors.navy900,
          }}
        >
          {configuration.title}
        </h1>
        <Link
          href="/admin"
          style={{
            fontFamily: fonts.sans,
            fontSize: "0.82rem",
            color: colors.goldText,
            textDecoration: "none",
          }}
        >
          {configuration.backToQueue}
        </Link>
      </div>

      <p
        style={{
          fontFamily: fonts.sans,
          fontSize: "0.9rem",
          lineHeight: 1.75,
          maxWidth: 720,
          margin: "16px 0 0",
          color: colors.slate,
        }}
      >
        {configuration.intro}
      </p>

      <p
        style={{
          fontFamily: fonts.sans,
          fontSize: "0.9rem",
          margin: "24px 0 0",
          color: colors.navy900,
        }}
      >
        {configuration.summary(open, capabilities.length)}
      </p>

      <div style={{ marginTop: 28 }}>
        {capabilities.map((capability) => (
          <div
            key={capability.id}
            style={{
              padding: "18px 0",
              borderTop: `1px solid ${alpha.cardGridGap}`,
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) auto",
              gap: 16,
              alignItems: "start",
            }}
          >
            <div>
              <span
                style={{
                  display: "block",
                  fontFamily: fonts.sans,
                  fontSize: "0.98rem",
                  color: colors.navy900,
                }}
              >
                {capability.label}
              </span>
              <span
                style={{
                  display: "block",
                  fontFamily: fonts.sans,
                  fontSize: "0.82rem",
                  lineHeight: 1.7,
                  marginTop: 4,
                  color: colors.slate,
                }}
              >
                {capability.open ? configuration.openMeans : capability.closedMeans}
              </span>
              <span
                style={{
                  display: "block",
                  fontFamily: fonts.sans,
                  fontSize: "0.78rem",
                  lineHeight: 1.7,
                  marginTop: 6,
                  color: capability.missing.length > 0 ? colors.navy900 : colors.slate,
                }}
              >
                {capability.missing.length > 0
                  ? `${configuration.missingPrefix} ${capability.missing.join(", ")}`
                  : `${configuration.requiresPrefix} ${capability.requires.join(", ")}`}
              </span>
            </div>
            <span
              style={{
                fontFamily: fonts.sans,
                fontSize: "0.72rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                padding: "6px 12px",
                color: capability.open ? colors.goldText : colors.slate,
                border: `1px solid ${capability.open ? colors.gold : alpha.cardGridGap}`,
              }}
            >
              {capability.open ? configuration.stateOpen : configuration.stateClosed}
            </span>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 40,
          paddingTop: 24,
          borderTop: `1px solid ${alpha.cardGridGap}`,
        }}
      >
        <h2
          style={{
            fontFamily: fonts.serif,
            fontWeight: 300,
            fontSize: "1.4rem",
            margin: 0,
            color: colors.navy900,
          }}
        >
          {configuration.legalTitle}
        </h2>
        <p
          style={{
            fontFamily: fonts.sans,
            fontSize: "0.86rem",
            lineHeight: 1.75,
            maxWidth: 720,
            margin: "10px 0 0",
            color: colors.slate,
          }}
        >
          {legalMissing.length === 0
            ? configuration.legalComplete
            : configuration.legalMissing(legalMissing.length)}
        </p>
        {legalMissing.length > 0 && (
          <ul
            style={{
              fontFamily: fonts.sans,
              fontSize: "0.82rem",
              lineHeight: 1.9,
              margin: "12px 0 0",
              paddingLeft: 18,
              color: colors.navy900,
            }}
          >
            {legalMissing.map((entry) => (
              <li key={entry.label}>{entry.label}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
