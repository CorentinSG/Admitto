"use client";

import { colors, fonts, alpha, gradients, layout } from "@/design/tokens";
import { useInView, thresholds } from "@/design/animations";
import { SectionLabel, SectionTitle } from "../_components/ui";
import { offers } from "@/content/homepage";

/**
 * Les offres (CDC §11.8 et §30) — prix transparents, paiement fractionné
 * visible, périmètre clair. Aucune offre ne promet un volume de consultations
 * non borné.
 */
/**
 * `asPageTitle` : la section est servie seule, sur /offres.
 * Son titre devient alors le `h1` de la page — voir `SectionTitle`.
 */
export function Offers({ asPageTitle = false }: { asPageTitle?: boolean } = {}) {
  const [ref, inView] = useInView(thresholds.solution);

  return (
    <section
      id="offres"
      ref={ref}
      style={{
        background: gradients.darkSection,
        padding: layout.sectionPadding,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <SectionLabel inView={inView} dark>
        {offers.label}
      </SectionLabel>
      <SectionTitle inView={inView} dark as={asPageTitle ? "h1" : "h2"}>
        {offers.title}
      </SectionTitle>

      <p
        style={{
          fontFamily: fonts.sans,
          fontSize: "0.88rem",
          lineHeight: 1.7,
          maxWidth: 640,
          margin: "24px 0 0",
          padding: "14px 18px",
          backgroundColor: alpha.goldBadgeBg,
          color: colors.goldLight,
          opacity: +!!inView,
          transition: "opacity 0.8s ease 0.2s",
        }}
      >
        {offers.betaNotice}
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
          marginTop: 56,
          opacity: +!!inView,
          transform: inView ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.8s ease 0.3s, transform 0.8s ease 0.3s",
        }}
      >
        {offers.plans.map((plan) => (
          <div
            key={plan.name}
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "34px 28px",
              backgroundColor: plan.highlight ? alpha.goldItemHoverBg : alpha.whiteFaint,
              border: `1px solid ${plan.highlight ? alpha.goldBorderHover : alpha.goldBorderFaint}`,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = alpha.goldItemHoverBg;
              e.currentTarget.style.borderColor = alpha.goldBorderHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = plan.highlight
                ? alpha.goldItemHoverBg
                : alpha.whiteFaint;
              e.currentTarget.style.borderColor = plan.highlight
                ? alpha.goldBorderHover
                : alpha.goldBorderFaint;
            }}
          >
            <span
              style={{
                fontFamily: fonts.sans,
                fontSize: "0.7rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: colors.gold,
              }}
            >
              {plan.name}
            </span>
            <span
              style={{
                fontFamily: fonts.serif,
                fontSize: "2rem",
                fontWeight: 300,
                margin: "16px 0 0",
                color: colors.ivory,
              }}
            >
              {plan.price}
            </span>
            {plan.period && (
              <span
                style={{
                  fontFamily: fonts.sans,
                  fontSize: "0.75rem",
                  margin: "4px 0 0",
                  color: alpha.whiteDesc,
                }}
              >
                {plan.period}
              </span>
            )}
            <p
              style={{
                fontFamily: fonts.sans,
                fontSize: "0.86rem",
                lineHeight: 1.7,
                margin: "18px 0 0",
                color: alpha.whiteCtaText,
              }}
            >
              {plan.desc}
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: "20px 0 0", flex: 1 }}>
              {plan.features.map((feature) => (
                <li
                  key={feature}
                  style={{
                    display: "flex",
                    gap: 10,
                    fontFamily: fonts.sans,
                    fontSize: "0.84rem",
                    lineHeight: 1.6,
                    color: alpha.whiteDesc,
                    marginBottom: 9,
                  }}
                >
                  <span aria-hidden style={{ color: colors.gold }}>
                    ✦
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
            <a
              href="#commencer"
              style={{
                marginTop: 24,
                textAlign: "center",
                padding: "14px 20px",
                fontFamily: fonts.sans,
                fontSize: "0.78rem",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                textDecoration: "none",
                background: plan.highlight ? gradients.goldButton : "transparent",
                color: plan.highlight ? colors.navy900 : alpha.whiteCtaText,
                border: plan.highlight ? "none" : `1px solid ${alpha.whiteCtaBorder}`,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!plan.highlight) {
                  e.currentTarget.style.borderColor = "rgba(201, 168, 76, 0.5)";
                  e.currentTarget.style.color = "#FFFFFF";
                } else {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 12px 40px rgba(201, 168, 76, 0.38)";
                }
              }}
              onMouseLeave={(e) => {
                if (!plan.highlight) {
                  e.currentTarget.style.borderColor = alpha.whiteCtaBorder;
                  e.currentTarget.style.color = alpha.whiteCtaText;
                } else {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }
              }}
            >
              {plan.cta}
            </a>
          </div>
        ))}
      </div>

      <p
        style={{
          fontFamily: fonts.sans,
          fontSize: "0.84rem",
          lineHeight: 1.75,
          maxWidth: 780,
          margin: "36px 0 0",
          color: alpha.whiteDesc,
          opacity: +!!inView,
          transition: "opacity 0.8s ease 0.45s",
        }}
      >
        {offers.paymentNote}
        <br />
        {offers.conciergeNote}
      </p>
    </section>
  );
}
