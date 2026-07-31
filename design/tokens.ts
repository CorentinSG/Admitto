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
  /**
   * Doré réservé au TEXTE posé sur fond clair (ivoire) — espace payant et
   * back-office.
   *
   * `gold` y était à 2,19:1 pour un seuil AA de 4,5:1, et sous le seuil de
   * 3:1 des grands textes : les libellés de section dorés y étaient à la
   * limite du lisible, et invisibles pour une vue affaiblie. Ce ton garde la
   * teinte (44°) et la saturation (54 %) du doré, assombri jusqu'à tenir le
   * seuil sur les DEUX fonds clairs du produit : l'ivoire (4,97:1) et les
   * panneaux dorés translucides comme le bloc « mentions à compléter »
   * (4,56:1), où le fond teinté grignote encore un peu de contraste.
   *
   * Il ne remplace PAS `gold` : bordures, filets, aplats et tout le texte
   * posé sur navy — la signature du site, à 7,93:1 — restent inchangés.
   * Ne jamais l'employer sur fond sombre : il n'y tient que 3,49:1.
   */
  goldText: "#826A27",
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
