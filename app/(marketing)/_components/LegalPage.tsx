import Link from "next/link";
import { colors, fonts, alpha } from "@/design/tokens";
import { missingEntries, isPending, type LegalBlock, type LegalDocument } from "@/lib/legal/types";
import { legalNotice } from "@/content/legal";
import { Nav } from "./Nav";
import { Footer } from "./Footer";

/**
 * Rendu commun des trois pages légales (revue §A1).
 *
 * Server component : ces textes ne bougent pas d'une visite à l'autre, ils sont
 * donc prérendus et servis depuis le CDN comme la page d'accueil.
 *
 * Les mentions manquantes sont affichées, pas masquées. Une page légale
 * incomplète qui a l'air complète est plus dangereuse qu'une page qui dit ce
 * qu'elle n'a pas : le lecteur sait à quoi s'en tenir, et le mainteneur voit ce
 * qui reste à faire à l'endroit exact où il faut le faire.
 */

const label = {
  updated: "Dernière mise à jour",
  toComplete: "À compléter",
  otherPages: "Autres documents",
};

function Block({ block }: { block: LegalBlock }) {
  const paragraph = {
    fontFamily: fonts.sans,
    fontSize: "0.92rem",
    lineHeight: 1.9,
    color: colors.slate,
    margin: "0 0 16px",
  } as const;

  if (block.kind === "TEXT") {
    return (
      <>
        {block.body.map((line) => (
          <p key={line.slice(0, 40)} style={paragraph}>
            {line}
          </p>
        ))}
      </>
    );
  }

  if (block.kind === "LIST") {
    return (
      <>
        {block.intro ? <p style={paragraph}>{block.intro}</p> : null}
        <ul style={{ margin: "0 0 16px", paddingLeft: 20 }}>
          {block.items.map((item) => (
            <li key={item.slice(0, 40)} style={{ ...paragraph, margin: "0 0 10px" }}>
              {item}
            </li>
          ))}
        </ul>
      </>
    );
  }

  if (block.kind === "ENTRIES") {
    return (
      <dl style={{ margin: "0 0 16px" }}>
        {block.entries.map((entry) => {
          const pending = isPending(entry.value);
          return (
            <div
              key={entry.label}
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(180px, 30%) 1fr",
                gap: 16,
                padding: "12px 0",
                borderBottom: `1px solid ${alpha.cardGridGap}`,
              }}
              className="legal-entry"
            >
              <dt
                style={{
                  fontFamily: fonts.sans,
                  fontSize: "0.82rem",
                  letterSpacing: "0.04em",
                  color: colors.navy900,
                }}
              >
                {entry.label}
              </dt>
              <dd style={{ margin: 0 }}>
                <span
                  style={{
                    fontFamily: fonts.sans,
                    fontSize: "0.9rem",
                    color: pending ? colors.goldText : colors.slate,
                  }}
                >
                  {entry.value}
                </span>
                {pending && entry.why ? (
                  <span
                    style={{
                      display: "block",
                      fontFamily: fonts.sans,
                      fontSize: "0.78rem",
                      lineHeight: 1.7,
                      marginTop: 6,
                      color: colors.slate,
                    }}
                  >
                    {entry.why}
                  </span>
                ) : null}
              </dd>
            </div>
          );
        })}
      </dl>
    );
  }

  return (
    // Le tableau déborde sur mobile plutôt que d'écraser les colonnes : un
    // tableau de durées de conservation illisible ne renseigne personne.
    <div style={{ overflowX: "auto", margin: "0 0 16px" }}>
      <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 520 }}>
        <thead>
          <tr>
            {block.columns.map((column) => (
              <th
                key={column}
                style={{
                  textAlign: "left",
                  fontFamily: fonts.sans,
                  fontSize: "0.72rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: colors.goldText,
                  padding: "0 16px 12px 0",
                  borderBottom: `1px solid ${alpha.cardGridGap}`,
                }}
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row) => (
            <tr key={row[0]}>
              {row.map((cell, index) => (
                <td
                  key={cell}
                  style={{
                    fontFamily: fonts.sans,
                    fontSize: "0.86rem",
                    lineHeight: 1.7,
                    color: index === 0 ? colors.navy900 : colors.slate,
                    padding: "12px 16px 12px 0",
                    borderBottom: `1px solid ${alpha.cardGridGap}`,
                    verticalAlign: "top",
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const responsiveCss = `
@media (max-width: 720px) {
  .legal-entry { grid-template-columns: 1fr !important; gap: 4px !important; }
  .nav-links { display: none !important; }
}
`;

export function LegalPage({
  document,
  others,
}: {
  document: LegalDocument;
  others: Array<{ slug: string; title: string }>;
}) {
  const missing = missingEntries(document);

  return (
    <>
      <style>{responsiveCss}</style>
      {/* Page à fond ivoire : la nav transparente y posait du texte blanc sur
          clair — marque invisible, liens illisibles. */}
      <Nav solid />
      <main id="contenu" tabIndex={-1} style={{ backgroundColor: colors.ivory, padding: "160px 8% 96px" }}>
        <div style={{ maxWidth: 820 }}>
          <h1
            style={{
              fontFamily: fonts.serif,
              fontWeight: 300,
              fontSize: "2.6rem",
              lineHeight: 1.2,
              margin: 0,
              color: colors.navy900,
            }}
          >
            {document.title}
          </h1>
          <p
            style={{
              fontFamily: fonts.sans,
              fontSize: "0.95rem",
              lineHeight: 1.9,
              margin: "20px 0 0",
              color: colors.slate,
            }}
          >
            {document.intro}
          </p>
          <p
            style={{
              fontFamily: fonts.sans,
              fontSize: "0.75rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              margin: "20px 0 0",
              color: colors.goldText,
            }}
          >
            {label.updated} : {document.updatedAt}
          </p>

          {missing.length > 0 ? (
            <div
              style={{
                marginTop: 40,
                padding: "24px 28px",
                border: `1px solid ${colors.gold}`,
                backgroundColor: alpha.goldBadgeBg,
              }}
            >
              <p
                style={{
                  fontFamily: fonts.sans,
                  fontSize: "0.78rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  margin: 0,
                  color: colors.goldText,
                }}
              >
                {legalNotice.title}
              </p>
              <p
                style={{
                  fontFamily: fonts.sans,
                  fontSize: "0.88rem",
                  lineHeight: 1.8,
                  margin: "12px 0 0",
                  color: colors.slate,
                }}
              >
                {legalNotice.body}
              </p>
              <ul style={{ margin: "12px 0 0", paddingLeft: 20 }}>
                {missing.map((entry) => (
                  <li
                    key={entry.label}
                    style={{
                      fontFamily: fonts.sans,
                      fontSize: "0.85rem",
                      lineHeight: 1.8,
                      color: colors.navy900,
                    }}
                  >
                    {entry.label}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {document.sections.map((section) => (
            <section key={section.id} id={section.id} style={{ marginTop: 56 }}>
              <h2
                style={{
                  fontFamily: fonts.serif,
                  fontWeight: 400,
                  fontSize: "1.5rem",
                  margin: "0 0 20px",
                  color: colors.navy900,
                }}
              >
                {section.title}
              </h2>
              {section.blocks.map((block, index) => (
                <Block key={`${section.id}-${index}`} block={block} />
              ))}
            </section>
          ))}

          <nav
            aria-label={label.otherPages}
            style={{
              marginTop: 64,
              paddingTop: 28,
              borderTop: `1px solid ${alpha.cardGridGap}`,
            }}
          >
            <p
              style={{
                fontFamily: fonts.sans,
                fontSize: "0.72rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                margin: "0 0 14px",
                color: colors.goldText,
              }}
            >
              {label.otherPages}
            </p>
            {others.map((other) => (
              <Link
                key={other.slug}
                href={`/${other.slug}`}
                style={{
                  display: "block",
                  fontFamily: fonts.sans,
                  fontSize: "0.9rem",
                  marginBottom: 10,
                  color: colors.navy900,
                  textDecoration: "none",
                }}
              >
                {other.title} →
              </Link>
            ))}
          </nav>
        </div>
      </main>
      <Footer />
    </>
  );
}
