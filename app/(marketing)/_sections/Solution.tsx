"use client";

import { colors, fonts, alpha, gradients, layout } from "@/design/tokens";
import { useInView, thresholds } from "@/design/animations";
import { SectionLabel, SectionTitle, GoldCta } from "../_components/ui";
import { solution } from "@/content/homepage";

/**
 * Section « La Solution » — fond navy.
 * Colonne gauche : cascade classique 0 → 0,3 s.
 * Colonne droite : SEULE animation horizontale entrante de la page — c'est le
 * conteneur entier qui glisse de 40 px depuis la droite, sans aucun stagger
 * interne (contrat d'animation §6).
 */
export function Solution() {
  const [ref, inView] = useInView(thresholds.solution);

  return (
    <section
      id="solution"
      ref={ref}
      style={{
        background: gradients.darkSection,
        padding: layout.sectionPadding,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        className="solution-grid-inner"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 80,
          alignItems: "start",
        }}
      >
        <div>
          <SectionLabel inView={inView} dark>
            {solution.label}
          </SectionLabel>
          <SectionTitle inView={inView} dark>
            {solution.title}
          </SectionTitle>
          <p
            style={{
              fontFamily: fonts.sans,
              fontSize: "1rem",
              lineHeight: 1.75,
              margin: "26px 0 0",
              color: alpha.whiteCtaText,
              opacity: +!!inView,
              transition: "opacity 0.8s ease 0.2s",
            }}
          >
            {solution.body}
          </p>
          <div
            style={{
              marginTop: 40,
              opacity: +!!inView,
              transition: "opacity 0.8s ease 0.3s",
            }}
          >
            <GoldCta href="#commencer" shadowBlur={40} shadowAlpha={0.38}>
              {solution.cta}
            </GoldCta>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            opacity: +!!inView,
            transform: inView ? "translateX(0)" : "translateX(40px)",
            transition: "opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s",
          }}
        >
          {solution.items.map((item) => (
            <div
              key={item}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "20px 24px",
                backgroundColor: alpha.whiteFaint,
                border: `1px solid ${alpha.goldBorderFaint}`,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = alpha.goldItemHoverBg;
                e.currentTarget.style.borderColor = alpha.goldBorderHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = alpha.whiteFaint;
                e.currentTarget.style.borderColor = alpha.goldBorderFaint;
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: colors.gold,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: fonts.sans,
                  fontSize: "0.92rem",
                  color: colors.ivory,
                }}
              >
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
