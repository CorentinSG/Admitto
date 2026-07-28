import { colors, fonts, gradients, goldButtonStyle } from "@/design/tokens";

/**
 * Placeholder de la homepage — sera remplacée par le portage complet du site
 * Admitto (Sprint 2 du PLAN.md). Sert de smoke test au design system.
 */
export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: gradients.hero,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 32,
        padding: "140px 8% 100px",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          fontFamily: fonts.serif,
          fontWeight: 300,
          fontSize: "3rem",
          margin: 0,
          color: colors.ivory,
        }}
      >
        Admitto — chantier en cours
      </h1>
      <p style={{ color: colors.slate, maxWidth: 560, lineHeight: 1.6 }}>
        Socle technique validé. Le portage de la homepage (Sprint 2) remplacera cette page.
      </p>
      <span style={goldButtonStyle}>Design system opérationnel</span>
    </main>
  );
}
