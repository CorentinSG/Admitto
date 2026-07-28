"use client";

import { colors, fonts, gradients, alpha, layout } from "@/design/tokens";
import { useInView, thresholds } from "@/design/animations";
import { Badge, GoldCta, GhostCta } from "../_components/ui";
import { hero } from "@/content/homepage";

/**
 * Hero — cascade d'entrée en 1,2 s (badge 0 / h1 0.1s / p 0.2s / CTAs 0.3s).
 * Le shimmer du mot doré est permanent et indépendant du scroll.
 * Les deux cercles décoratifs et l'indicateur « défiler » sont STATIQUES.
 */
export function Hero() {
  const [ref, inView] = useInView(thresholds.hero);

  return (
    <section
      id="top"
      ref={ref}
      style={{
        minHeight: "100vh",
        padding: layout.heroPadding,
        position: "relative",
        overflow: "hidden",
        background: gradients.hero,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      {/* Cercles décoratifs — aucune animation, pointer-events désactivés. */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          top: "15%",
          right: "5%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          border: "1px solid rgba(201, 168, 76, 0.07)",
          pointerEvents: "none",
        }}
      />
      <span
        aria-hidden
        style={{
          position: "absolute",
          top: "22%",
          right: "9%",
          width: 260,
          height: 260,
          borderRadius: "50%",
          border: "1px solid rgba(201, 168, 76, 0.05)",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", maxWidth: 820 }}>
        <Badge
          style={{
            opacity: +!!inView,
            transform: inView ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.8s ease, transform 0.8s ease",
          }}
        >
          {hero.badge}
        </Badge>

        <h1
          style={{
            fontFamily: fonts.serif,
            fontWeight: 300,
            fontSize: "clamp(2.6rem, 5.4vw, 4.3rem)",
            lineHeight: 1.14,
            margin: "28px 0 0",
            color: colors.ivory,
            opacity: +!!inView,
            transform: inView ? "translateY(0)" : "translateY(30px)",
            transition: "opacity 0.9s ease 0.1s, transform 0.9s ease 0.1s",
          }}
        >
          {hero.titleBefore}
          <em
            style={{
              background: gradients.goldShimmer,
              backgroundSize: "200% auto",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontStyle: "italic",
              animation: "shimmer 4s ease infinite",
            }}
          >
            {hero.titleAccent}
          </em>
          {hero.titleAfter}
        </h1>

        <p
          style={{
            fontFamily: fonts.sans,
            fontSize: "1.05rem",
            lineHeight: 1.75,
            maxWidth: 640,
            margin: "30px 0 0",
            color: alpha.whiteCtaText,
            opacity: +!!inView,
            transform: inView ? "translateY(0)" : "translateY(30px)",
            transition: "opacity 0.9s ease 0.2s, transform 0.9s ease 0.2s",
          }}
        >
          {hero.subtitle}
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 18,
            marginTop: 44,
            opacity: +!!inView,
            transform: inView ? "translateY(0)" : "translateY(30px)",
            transition: "opacity 0.9s ease 0.3s, transform 0.9s ease 0.3s",
          }}
        >
          <GoldCta href="#commencer" shadowBlur={45}>
            {hero.ctaPrimary}
          </GoldCta>
          <GhostCta href="#parcours">{hero.ctaSecondary}</GhostCta>
        </div>

        {/* Signature du fondateur — même cadence que les CTA (CDC §6). */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            marginTop: 52,
            opacity: +!!inView,
            transform: inView ? "translateY(0)" : "translateY(30px)",
            transition: "opacity 0.9s ease 0.3s, transform 0.9s ease 0.3s",
          }}
        >
          {/* Emplacement de la photographie professionnelle (CDC §6) :
              remplacer par <Image src="/founder.jpg" …> dès qu'elle est fournie. */}
          <span
            aria-hidden
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              border: `1px solid ${alpha.goldBorderHover}`,
              backgroundColor: "rgba(201, 168, 76, 0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: fonts.serif,
              fontSize: "1.05rem",
              letterSpacing: "0.08em",
              color: colors.goldLight,
              flexShrink: 0,
            }}
          >
            {hero.founderInitials}
          </span>
          <span style={{ fontFamily: fonts.sans, fontSize: "0.86rem", lineHeight: 1.6 }}>
            <strong style={{ color: colors.ivory, fontWeight: 500 }}>{hero.founderName}</strong>
            <span style={{ color: colors.gold }}> · {hero.founderRole}</span>
            <br />
            <span style={{ color: alpha.whiteDesc }}>{hero.founderLine}</span>
          </span>
        </div>
      </div>

      {/* Indicateur « défiler » — statique, aucune animation. */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: 40,
          left: "50%",
          transform: "translateX(-50%)",
          opacity: 0.35,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span
          style={{
            fontFamily: fonts.sans,
            fontSize: "0.62rem",
            letterSpacing: "0.22em",
            color: colors.goldLight,
          }}
        >
          {hero.scrollLabel}
        </span>
        <span
          style={{
            display: "block",
            width: 1,
            height: 36,
            background: "linear-gradient(180deg, rgba(201, 168, 76, 0.9), transparent)",
          }}
        />
      </div>
    </section>
  );
}
