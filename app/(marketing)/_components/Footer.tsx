"use client";

import { colors, fonts, alpha } from "@/design/tokens";
import { footer } from "@/content/homepage";
import { usePathname } from "next/navigation";
import { sectionHref } from "./anchors";

/** Footer — liens en `color 0.2s` au survol, disclaimer permanent (CDC §7). */
export function Footer() {
  const pathname = usePathname();

  return (
    <footer
      style={{
        backgroundColor: colors.navy900,
        borderTop: `1px solid ${alpha.goldBorderFaint}`,
        padding: "80px 8% 48px",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 48,
        }}
      >
        <div>
          <span
            style={{
              fontFamily: fonts.serif,
              fontSize: "1.4rem",
              letterSpacing: "0.18em",
              color: colors.ivory,
            }}
          >
            {footer.brand}
          </span>
          <p
            style={{
              fontFamily: fonts.sans,
              fontSize: "0.85rem",
              lineHeight: 1.7,
              maxWidth: 260,
              margin: "16px 0 0",
              color: alpha.whiteDesc,
            }}
          >
            {footer.tagline}
          </p>
        </div>

        {footer.columns.map((column) => (
          <div key={column.title}>
            <span
              style={{
                fontFamily: fonts.sans,
                fontSize: "0.68rem",
                letterSpacing: "0.16em",
                color: colors.gold,
              }}
            >
              {column.title}
            </span>
            <ul style={{ listStyle: "none", padding: 0, margin: "18px 0 0" }}>
              {column.links.map((link) => (
                <li key={link.href} style={{ marginBottom: 10 }}>
                  <a
                    href={sectionHref(pathname, link.href)}
                    style={{
                      fontFamily: fonts.sans,
                      fontSize: "0.85rem",
                      color: alpha.whiteDesc,
                      textDecoration: "none",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = colors.goldLight;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = alpha.whiteDesc;
                    }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 56,
          paddingTop: 28,
          borderTop: `1px solid ${alpha.goldBorderFaint}`,
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
          justifyContent: "space-between",
        }}
      >
        <p
          style={{
            fontFamily: fonts.sans,
            fontSize: "0.75rem",
            lineHeight: 1.7,
            maxWidth: 620,
            margin: 0,
            color: alpha.whiteDesc,
          }}
        >
          {footer.legal}
        </p>
        <p style={{ fontFamily: fonts.sans, fontSize: "0.75rem", margin: 0, color: alpha.whiteDesc }}>
          {footer.copyright}
        </p>
      </div>
    </footer>
  );
}
