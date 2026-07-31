"use client";

import { colors, fonts, alpha, layout } from "@/design/tokens";
import { useInView, thresholds } from "@/design/animations";
import { SectionLabel, SectionTitle } from "../_components/ui";
import { founder, hero } from "@/content/homepage";

/**
 * Le parcours du fondateur (CDC §11.9) — expérience, erreurs, apprentissages,
 * raison d'être du produit. L'admission au barreau de New York est présentée
 * comme un fait de parcours, jamais comme la qualité au titre de laquelle le
 * service serait rendu (CDC §6).
 */
export function Founder() {
  const [ref, inView] = useInView(thresholds.solution);

  return (
    <section
      id="fondateur"
      ref={ref}
      style={{ backgroundColor: colors.ivory, padding: layout.sectionPadding }}
    >
      <SectionLabel inView={inView}>{founder.label}</SectionLabel>
      <SectionTitle inView={inView}>{founder.title}</SectionTitle>

      <div style={{ maxWidth: 720, marginTop: 32 }}>
        {founder.paragraphs.map((paragraph, i) => (
          <p
            key={i}
            style={{
              fontFamily: fonts.sans,
              fontSize: "1rem",
              lineHeight: 1.8,
              margin: "0 0 20px",
              color: colors.slate,
              opacity: +!!inView,
              transition: `opacity 0.8s ease ${0.2 + 0.1 * i}s`,
            }}
          >
            {paragraph}
          </p>
        ))}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            marginTop: 36,
            paddingTop: 28,
            borderTop: `1px solid ${alpha.cardGridGap}`,
            opacity: +!!inView,
            transition: "opacity 0.8s ease 0.5s",
          }}
        >
          <span
            aria-hidden
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              border: `1px solid ${colors.gold}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: fonts.serif,
              fontSize: "1rem",
              letterSpacing: "0.08em",
              color: colors.goldText,
              flexShrink: 0,
            }}
          >
            {hero.founderInitials}
          </span>
          <span style={{ fontFamily: fonts.sans, fontSize: "0.88rem", lineHeight: 1.6 }}>
            <strong style={{ color: colors.navy900, fontWeight: 500 }}>{founder.signature}</strong>
            <br />
            <span style={{ color: colors.slate }}>{founder.signatureRole}</span>
          </span>
        </div>
      </div>
    </section>
  );
}
