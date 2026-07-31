"use client";

import { useState } from "react";
import { colors, fonts, alpha, layout } from "@/design/tokens";
import { useInView, thresholds } from "@/design/animations";
import { SectionLabel, SectionTitle } from "../_components/ui";
import { faq } from "@/content/homepage";

/**
 * FAQ (CDC §11.10) — 7 questions imposées par le cahier des charges.
 * Ouverture/fermeture par simple bascule d'affichage : le contrat d'animation
 * interdit d'inventer de nouveaux patterns (pas d'animation de hauteur).
 * Seule la couleur transitionne, en 0,2 s.
 */
/**
 * `asPageTitle` : la section est servie seule, sur /faq.
 * Son titre devient alors le `h1` de la page — voir `SectionTitle`.
 */
export function Faq({ asPageTitle = false }: { asPageTitle?: boolean } = {}) {
  const [ref, inView] = useInView(thresholds.problems);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faq"
      ref={ref}
      style={{ backgroundColor: colors.ivory, padding: layout.sectionPadding }}
    >
      <SectionLabel inView={inView}>{faq.label}</SectionLabel>
      <SectionTitle inView={inView} as={asPageTitle ? "h1" : "h2"}>{faq.title}</SectionTitle>

      <div
        style={{
          maxWidth: 820,
          marginTop: 56,
          opacity: +!!inView,
          transform: inView ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s",
        }}
      >
        {faq.items.map((item, i) => {
          const open = openIndex === i;
          return (
            <div key={item.q} style={{ borderTop: `1px solid ${alpha.cardGridGap}` }}>
              <button
                type="button"
                aria-expanded={open}
                onClick={() => setOpenIndex(open ? null : i)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 24,
                  padding: "26px 0",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: fonts.serif,
                  fontSize: "1.15rem",
                  fontWeight: 400,
                  color: open ? colors.goldText : colors.navy900,
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = colors.goldText;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = open ? colors.goldText : colors.navy900;
                }}
              >
                {item.q}
                <span aria-hidden style={{ color: colors.goldText, fontSize: "1.4rem", lineHeight: 1 }}>
                  {open ? "−" : "+"}
                </span>
              </button>
              {open && (
                <p
                  style={{
                    fontFamily: fonts.sans,
                    fontSize: "0.94rem",
                    lineHeight: 1.8,
                    margin: "0 0 28px",
                    maxWidth: 700,
                    color: colors.slate,
                  }}
                >
                  {item.a}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
