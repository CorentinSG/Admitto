"use client";

import { useEffect, useState } from "react";
import { colors, fonts, alpha, layout, gradients } from "@/design/tokens";
import { nav } from "@/content/homepage";

/**
 * Navigation fixe (contrat d'animation §3).
 * État piloté par un listener scroll (pas un IntersectionObserver).
 * Quirk à conserver : border-bottom n'est PAS dans la liste des propriétés
 * animées — la bordure apparaît sèchement à 40 px pendant que le fond fond
 * en 0,4 s.
 */
export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: layout.navHeight,
        padding: "0 8%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: scrolled ? alpha.navScrolledBg : "transparent",
        backdropFilter: scrolled ? "blur(24px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(24px)" : "none",
        borderBottom: scrolled ? `1px solid ${alpha.goldBorderFaint}` : "none",
        transition: "background-color 0.4s ease, backdrop-filter 0.4s ease",
      }}
    >
      <a
        href="#top"
        style={{
          fontFamily: fonts.serif,
          fontSize: "1.4rem",
          letterSpacing: "0.18em",
          color: colors.ivory,
          textDecoration: "none",
        }}
      >
        {nav.brand}
      </a>

      <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
        <div className="nav-links" style={{ display: "flex", gap: 32 }}>
          {nav.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              style={{
                fontFamily: fonts.sans,
                fontSize: "0.82rem",
                letterSpacing: "0.04em",
                color: alpha.whiteCtaText,
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = colors.goldLight;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = alpha.whiteCtaText;
              }}
            >
              {link.label}
            </a>
          ))}
        </div>

        <a
          href="#commencer"
          style={{
            background: gradients.goldButton,
            color: colors.navy900,
            fontFamily: fonts.sans,
            fontSize: "0.78rem",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            padding: "12px 26px",
            textDecoration: "none",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 12px 40px rgba(201, 168, 76, 0.38)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          {nav.cta}
        </a>
      </div>
    </nav>
  );
}
