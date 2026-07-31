"use client";

import { colors, fonts, gradients, layout } from "@/design/tokens";
import { useInView, thresholds } from "@/design/animations";
import { SectionLabel, SectionTitle } from "../_components/ui";
import { journey } from "@/content/homepage";

/**
 * Section « Le parcours couvert » — timeline en 5 étapes.
 * Stagger horizontal : chaque ligne glisse de 24 px depuis la GAUCHE en 0,7 s,
 * delays 0,10 / 0,22 / 0,34 / 0,46 / 0,58 s (durée totale 1,28 s).
 * Pastilles : pulse-gold 2,5 s infini, décalé de 0,4 s par étape — l'animation
 * ne démarre littéralement qu'à la révélation (`none` tant que stepsIn est faux).
 * Le fil vertical est STATIQUE (pas de tracé progressif).
 */
export function Journey() {
  const [ref, stepsIn] = useInView(thresholds.steps);

  return (
    <section
      id="parcours"
      ref={ref}
      style={{
        backgroundColor: colors.ivory,
        padding: layout.sectionPadding,
        overflow: "hidden",
      }}
    >
      <SectionLabel inView={stepsIn}>{journey.label}</SectionLabel>
      <SectionTitle inView={stepsIn}>{journey.title}</SectionTitle>

      <div style={{ marginTop: 64, maxWidth: 860 }}>
        {journey.steps.map((step, i) => (
          <div
            key={step.title}
            style={{
              display: "grid",
              gridTemplateColumns: "72px 20px 1fr",
              gap: "0 28px",
              opacity: +!!stepsIn,
              transform: stepsIn ? "translateX(0)" : "translateX(-24px)",
              transition: `opacity 0.7s ease ${0.1 + 0.12 * i}s, transform 0.7s ease ${0.1 + 0.12 * i}s`,
            }}
          >
            <span
              style={{
                fontFamily: fonts.sans,
                fontSize: "0.68rem",
                letterSpacing: "0.14em",
                color: colors.goldText,
                marginTop: 22,
              }}
            >
              {step.phase}
            </span>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: colors.gold,
                  marginTop: 24,
                  flexShrink: 0,
                  animation: stepsIn ? `pulse-gold 2.5s ease infinite ${0.4 * i}s` : "none",
                }}
              />
              {i < journey.steps.length - 1 && (
                <span
                  style={{
                    width: 1,
                    flex: 1,
                    minHeight: 60,
                    background: gradients.timelineWire,
                  }}
                />
              )}
            </div>

            <div style={{ paddingBottom: 34 }}>
              <h3
                style={{
                  fontFamily: fonts.serif,
                  fontWeight: 400,
                  fontSize: "1.35rem",
                  margin: "14px 0 0",
                  color: colors.navy900,
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  fontFamily: fonts.sans,
                  fontSize: "0.92rem",
                  lineHeight: 1.7,
                  margin: "10px 0 0",
                  color: colors.slate,
                }}
              >
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
