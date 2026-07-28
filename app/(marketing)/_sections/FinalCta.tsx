"use client";

import { colors, fonts, alpha, gradients, layout } from "@/design/tokens";
import { useInView, thresholds } from "@/design/animations";
import { Badge, GoldCta } from "../_components/ui";
import { finalCta } from "@/content/homepage";

/**
 * Section CTA finale — cascade badge 0 / h2 0.1s / p 0.2s / CTA 0.3s (+24 px)
 * / disclaimer 0.45s. Le disclaimer est obligatoire (CDC §7).
 */
export function FinalCta() {
  const [ref, ctaIn] = useInView(thresholds.cta);

  return (
    <section
      id="commencer"
      ref={ref}
      style={{
        background: gradients.finalCta,
        padding: layout.sectionPadding,
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Badge style={{ opacity: +!!ctaIn, transition: "opacity 0.8s ease" }}>{finalCta.badge}</Badge>

      <h2
        style={{
          fontFamily: fonts.serif,
          fontWeight: 300,
          fontSize: "clamp(2rem, 4vw, 3.2rem)",
          lineHeight: 1.2,
          margin: "28px auto 0",
          maxWidth: 760,
          color: colors.ivory,
          opacity: +!!ctaIn,
          transform: ctaIn ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.8s ease 0.1s, transform 0.8s ease 0.1s",
        }}
      >
        {finalCta.title}
      </h2>

      <p
        style={{
          fontFamily: fonts.sans,
          fontSize: "1rem",
          lineHeight: 1.75,
          maxWidth: 600,
          margin: "24px auto 0",
          color: alpha.whiteCtaText,
          opacity: +!!ctaIn,
          transition: "opacity 0.8s ease 0.2s",
        }}
      >
        {finalCta.body}
      </p>

      <div
        style={{
          marginTop: 44,
          opacity: +!!ctaIn,
          transform: ctaIn ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.8s ease 0.3s, transform 0.8s ease 0.3s",
        }}
      >
        <GoldCta href="/diagnostic" shadowBlur={50} shadowAlpha={0.42}>
          {finalCta.cta}
        </GoldCta>
      </div>

      <p
        style={{
          fontFamily: fonts.sans,
          fontSize: "0.76rem",
          lineHeight: 1.7,
          maxWidth: 760,
          margin: "48px auto 0",
          color: alpha.whiteDesc,
          opacity: +!!ctaIn,
          transition: "opacity 0.8s ease 0.45s",
        }}
      >
        {finalCta.disclaimer}
      </p>
    </section>
  );
}
