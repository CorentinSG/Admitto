"use client";

import { colors, fonts, alpha, layout } from "@/design/tokens";
import { useInView, thresholds } from "@/design/animations";
import { SectionLabel, SectionTitle } from "../_components/ui";
import { diagnostic } from "@/content/homepage";

/**
 * Section « Le diagnostic » (CDC §11.4) — les deux temps de l'analyse.
 * Réutilise strictement les primitives existantes : label + titre en cascade,
 * puis deux blocs révélés en opacity + translateY aux cadences standard.
 */
export function Diagnostic() {
  const [ref, inView] = useInView(thresholds.solution);

  return (
    <section
      id="diagnostic"
      ref={ref}
      style={{ backgroundColor: colors.ivory, padding: layout.sectionPadding }}
    >
      <SectionLabel inView={inView}>{diagnostic.label}</SectionLabel>
      <SectionTitle inView={inView}>{diagnostic.title}</SectionTitle>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 1,
          backgroundColor: alpha.cardGridGap,
          marginTop: 56,
        }}
      >
        {diagnostic.steps.map((step, i) => (
          <div
            key={step.title}
            style={{
              backgroundColor: colors.ivory,
              padding: "40px 32px",
              opacity: +!!inView,
              transform: inView ? "translateY(0)" : "translateY(24px)",
              transition: `opacity 0.8s ease ${0.2 + 0.1 * i}s, transform 0.8s ease ${0.2 + 0.1 * i}s`,
            }}
          >
            <span
              style={{
                display: "inline-block",
                fontFamily: fonts.sans,
                fontSize: "0.68rem",
                letterSpacing: "0.16em",
                color: colors.gold,
                border: `1px solid ${alpha.goldBorderHover}`,
                padding: "6px 12px",
              }}
            >
              {step.tag}
            </span>
            <h3
              style={{
                fontFamily: fonts.serif,
                fontWeight: 400,
                fontSize: "1.45rem",
                margin: "24px 0 0",
                color: colors.navy900,
              }}
            >
              {step.title}
            </h3>
            <p
              style={{
                fontFamily: fonts.sans,
                fontSize: "0.92rem",
                lineHeight: 1.75,
                margin: "16px 0 0",
                color: colors.slate,
              }}
            >
              {step.desc}
            </p>
          </div>
        ))}
      </div>

      <p
        style={{
          fontFamily: fonts.sans,
          fontSize: "0.85rem",
          lineHeight: 1.7,
          maxWidth: 720,
          margin: "40px 0 0",
          paddingLeft: 18,
          borderLeft: `1px solid ${colors.gold}`,
          color: colors.slate,
          opacity: +!!inView,
          transition: "opacity 0.8s ease 0.45s",
        }}
      >
        {diagnostic.note}
      </p>
    </section>
  );
}
