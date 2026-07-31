"use client";

import type { CSSProperties, ReactNode } from "react";
import { colors, fonts, alpha, gradients } from "@/design/tokens";

/**
 * Primitives visuelles partagées — reprises telles quelles du site Admitto.
 * Les hovers passent tous par onMouseEnter/onMouseLeave (jamais de :hover CSS),
 * conformément au contrat d'animation §9.
 */

/** Ligne de label de section : trait doré 40×1 px + libellé uppercase. */
export function SectionLabel({
  children,
  inView,
  dark = false,
}: {
  children: ReactNode;
  inView: boolean;
  dark?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        opacity: +!!inView,
        transition: "opacity 0.8s ease",
      }}
    >
      <span style={{ display: "block", width: 40, height: 1, backgroundColor: colors.gold }} />
      <span
        style={{
          fontFamily: fonts.sans,
          fontSize: "0.72rem",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: dark ? colors.goldLight : colors.goldText,
        }}
      >
        {children}
      </span>
    </div>
  );
}

/** Badge « ✦ LIBELLÉ » sur fond doré translucide. */
export function Badge({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <span
      style={{
        display: "inline-block",
        backgroundColor: alpha.goldBadgeBg,
        color: colors.goldLight,
        fontFamily: fonts.sans,
        fontSize: "0.72rem",
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        padding: "9px 18px",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

/**
 * CTA doré. `shadowBlur` reproduit la seule différence entre les trois boutons
 * du site : l'intensité de l'ombre au survol (45 / 40 / 50 px de flou).
 */
export function GoldCta({
  href,
  children,
  shadowBlur = 45,
  shadowAlpha = 0.42,
}: {
  href: string;
  children: ReactNode;
  shadowBlur?: number;
  shadowAlpha?: number;
}) {
  return (
    <a
      href={href}
      style={{
        background: gradients.goldButton,
        color: colors.navy900,
        padding: "18px 44px",
        fontSize: "0.88rem",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        display: "inline-block",
        fontFamily: fonts.sans,
        textDecoration: "none",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = `0 ${Math.round(shadowBlur / 3)}px ${shadowBlur}px rgba(201, 168, 76, ${shadowAlpha})`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {children}
    </a>
  );
}

/** CTA secondaire : bordure blanche translucide → dorée au survol. */
export function GhostCta({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      style={{
        border: `1px solid ${alpha.whiteCtaBorder}`,
        color: alpha.whiteCtaText,
        padding: "18px 44px",
        fontSize: "0.88rem",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        display: "inline-block",
        fontFamily: fonts.sans,
        textDecoration: "none",
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(201, 168, 76, 0.5)";
        e.currentTarget.style.color = "#FFFFFF";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = alpha.whiteCtaBorder;
        e.currentTarget.style.color = alpha.whiteCtaText;
      }}
    >
      {children}
    </a>
  );
}

/**
 * Titre de section (Cormorant, weight 300).
 *
 * `as` existe pour les pages autonomes `/offres`, `/faq`, `/a-propos`, qui
 * servent la MÊME section que la page d'accueil. Sur l'accueil, ces sections
 * sont des chapitres et leur titre est un `h2` ; servies seules, elles SONT la
 * page, et une page sans `h1` n'a pas de titre — ni pour un moteur de
 * recherche, ni pour un lecteur d'écran qui parcourt la structure. Le rendu
 * visuel est identique dans les deux cas : seule la balise change.
 */
export function SectionTitle({
  children,
  inView,
  dark = false,
  style,
  as: Tag = "h2",
}: {
  children: ReactNode;
  inView: boolean;
  dark?: boolean;
  style?: CSSProperties;
  as?: "h1" | "h2";
}) {
  return (
    <Tag
      style={{
        fontFamily: fonts.serif,
        fontWeight: 300,
        fontSize: "clamp(1.9rem, 3.4vw, 2.9rem)",
        lineHeight: 1.2,
        margin: "22px 0 0",
        maxWidth: 780,
        color: dark ? colors.ivory : colors.navy900,
        opacity: +!!inView,
        transform: inView ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.8s ease 0.1s, transform 0.8s ease 0.1s",
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}
