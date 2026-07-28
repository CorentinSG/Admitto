/**
 * Design tokens Admitto — copie exacte du site admitto.nanocorp.app.
 * SOURCE DE VÉRITÉ pour toutes les couleurs, typos et constantes visuelles.
 * Aucune couleur hors de cette palette ne doit apparaître dans le code
 * (vérifié par `npm run check:tokens`).
 */

export const colors = {
  navy900: "#0A1628",
  navy800: "#0E1D3A",
  navy700: "#142240",
  navy600: "#1E3561",
  ivory: "#FAFAF7",
  slate: "#3D4F6B",
  gold: "#C9A84C",
  goldLight: "#E8C87A",
} as const;

/** Teintes dérivées autorisées (rgba des tokens ci-dessus, telles quelles sur le site). */
export const alpha = {
  navScrolledBg: "rgba(10, 22, 40, 0.97)",
  goldBorderFaint: "rgba(201, 168, 76, 0.14)",
  goldBorderHover: "rgba(201, 168, 76, 0.42)",
  goldBadgeBg: "rgba(201, 168, 76, 0.12)",
  goldItemHoverBg: "rgba(201, 168, 76, 0.05)",
  goldPulse: "rgba(201, 168, 76, 0.5)",
  cardGridGap: "rgba(10, 22, 40, 0.08)",
  cardNumIdle: "rgba(10, 22, 40, 0.12)",
  whiteFaint: "rgba(255, 255, 255, 0.03)",
  whiteDesc: "rgba(255, 255, 255, 0.6)",
  whiteCtaBorder: "rgba(255, 255, 255, 0.18)",
  whiteCtaText: "rgba(255, 255, 255, 0.75)",
} as const;

export const fonts = {
  serif: "'Cormorant Garamond', serif",
  sans: "'DM Sans', sans-serif",
} as const;

export const gradients = {
  goldButton: `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldLight} 100%)`,
  goldShimmer: `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldLight} 50%, ${colors.gold} 100%)`,
  darkSection: `linear-gradient(160deg, ${colors.navy900} 0%, ${colors.navy700} 50%, ${colors.navy800} 100%)`,
  hero: [
    "radial-gradient(ellipse at 20% 50%, rgba(30, 53, 97, 0.8) 0%, transparent 60%)",
    "radial-gradient(ellipse at 80% 20%, rgba(201, 168, 76, 0.15) 0%, transparent 50%)",
    `linear-gradient(160deg, ${colors.navy900} 0%, ${colors.navy700} 40%, ${colors.navy800} 70%, ${colors.navy900} 100%)`,
  ].join(", "),
  finalCta: [
    "radial-gradient(ellipse at 30% 50%, rgba(30, 53, 97, 0.9) 0%, transparent 55%)",
    `linear-gradient(160deg, ${colors.navy900} 0%, ${colors.navy700} 60%, ${colors.navy900} 100%)`,
  ].join(", "),
  timelineWire: "linear-gradient(180deg, #C9A84C 0%, rgba(201, 168, 76, 0.15) 100%)",
} as const;

export const layout = {
  navHeight: 72,
  sectionPadding: "120px 8%",
  heroPadding: "140px 8% 100px",
  goldButtonPadding: "18px 44px",
} as const;

/** Base commune des 3 CTA dorés du site. */
export const goldButtonStyle = {
  background: gradients.goldButton,
  color: colors.navy900,
  padding: layout.goldButtonPadding,
  fontSize: "0.88rem",
  letterSpacing: "0.06em",
  textTransform: "uppercase" as const,
  display: "inline-block" as const,
  fontFamily: fonts.sans,
  textDecoration: "none",
  border: "none",
  cursor: "pointer",
};
