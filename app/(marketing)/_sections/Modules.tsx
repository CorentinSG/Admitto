"use client";

import { colors, fonts, alpha, layout } from "@/design/tokens";
import { useInView, thresholds } from "@/design/animations";
import { SectionLabel, SectionTitle } from "../_components/ui";
import { modules } from "@/content/homepage";

/**
 * Modules et outils (CDC §11.7) — présentés comme ressources rattachées à la
 * roadmap, jamais comme une bibliothèque isolée.
 * Réutilise la grille à filets 1 px et l'inversion navy au survol.
 */
export function Modules() {
  const [ref, inView] = useInView(thresholds.problems);

  return (
    <section
      id="modules"
      ref={ref}
      style={{ backgroundColor: colors.ivory, padding: layout.sectionPadding }}
    >
      <SectionLabel inView={inView}>{modules.label}</SectionLabel>
      <SectionTitle inView={inView}>{modules.title}</SectionTitle>
      <p
        style={{
          fontFamily: fonts.sans,
          fontSize: "1rem",
          lineHeight: 1.75,
          maxWidth: 640,
          margin: "24px 0 0",
          color: colors.slate,
          opacity: +!!inView,
          transition: "opacity 0.8s ease 0.2s",
        }}
      >
        {modules.body}
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 1,
          backgroundColor: alpha.cardGridGap,
          marginTop: 56,
        }}
      >
        {modules.items.map((item) => (
          <div
            key={item.title}
            style={{
              backgroundColor: colors.ivory,
              padding: "32px 28px",
              cursor: "default",
              transition: "background-color 0.3s",
              opacity: +!!inView,
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.backgroundColor = colors.navy900;
              (el.querySelector("[data-title]") as HTMLElement).style.color = "#FFFFFF";
              (el.querySelector("[data-desc]") as HTMLElement).style.color = alpha.whiteDesc;
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.backgroundColor = colors.ivory;
              (el.querySelector("[data-title]") as HTMLElement).style.color = colors.navy900;
              (el.querySelector("[data-desc]") as HTMLElement).style.color = colors.slate;
            }}
          >
            <h3
              data-title
              style={{
                fontFamily: fonts.serif,
                fontWeight: 400,
                fontSize: "1.2rem",
                margin: 0,
                color: colors.navy900,
                transition: "color 0.3s",
              }}
            >
              {item.title}
            </h3>
            <p
              data-desc
              style={{
                fontFamily: fonts.sans,
                fontSize: "0.88rem",
                lineHeight: 1.7,
                margin: "12px 0 0",
                color: colors.slate,
                transition: "color 0.3s",
              }}
            >
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
