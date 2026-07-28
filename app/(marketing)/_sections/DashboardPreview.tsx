"use client";

import { colors, fonts, alpha, gradients, layout } from "@/design/tokens";
import { useInView, thresholds } from "@/design/animations";
import { SectionLabel, SectionTitle } from "../_components/ui";
import { dashboard } from "@/content/homepage";

/**
 * Aperçu du dashboard (CDC §11.6) — fond navy.
 * Même structure que « La Solution » : cascade à gauche, le conteneur des
 * panneaux glisse en bloc depuis la droite (aucun stagger interne).
 */
export function DashboardPreview() {
  const [ref, inView] = useInView(thresholds.solution);

  return (
    <section
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
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}
      >
        <div>
          <SectionLabel inView={inView} dark>
            {dashboard.label}
          </SectionLabel>
          <SectionTitle inView={inView} dark>
            {dashboard.title}
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
            {dashboard.body}
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 12,
            opacity: +!!inView,
            transform: inView ? "translateX(0)" : "translateX(40px)",
            transition: "opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s",
          }}
        >
          {dashboard.panels.map((panel) => (
            <div
              key={panel.label}
              style={{
                padding: "24px 22px",
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
                style={{
                  display: "block",
                  fontFamily: fonts.sans,
                  fontSize: "0.65rem",
                  letterSpacing: "0.16em",
                  color: colors.gold,
                }}
              >
                {panel.label}
              </span>
              <span
                style={{
                  display: "block",
                  fontFamily: fonts.serif,
                  fontSize: "1.3rem",
                  fontWeight: 400,
                  margin: "12px 0 0",
                  color: colors.ivory,
                }}
              >
                {panel.value}
              </span>
              <span
                style={{
                  display: "block",
                  fontFamily: fonts.sans,
                  fontSize: "0.78rem",
                  margin: "8px 0 0",
                  color: alpha.whiteDesc,
                }}
              >
                {panel.hint}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
