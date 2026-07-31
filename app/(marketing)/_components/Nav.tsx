"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { colors, fonts, alpha, layout, gradients } from "@/design/tokens";
import { nav } from "@/content/homepage";
import { sectionHref } from "./anchors";

/**
 * Navigation fixe (contrat d'animation §3).
 * État piloté par un listener scroll (pas un IntersectionObserver).
 * Quirk à conserver : border-bottom n'est PAS dans la liste des propriétés
 * animées — la bordure apparaît sèchement à 40 px pendant que le fond fond
 * en 0,4 s.
 *
 * Sous 900 px, les liens étaient masqués et rien ne les remplaçait : la
 * navigation disparaissait, et il ne restait que le bouton d'appel à l'action.
 * Le panneau ajouté ici n'existe QU'À cette largeur ; au-dessus, le rendu est
 * inchangé au pixel près — ce que vérifie `verify:animations`.
 *
 * Aucune transition sur le panneau : le contrat interdit toute animation de
 * sortie, et un menu qui se ferme en fondu en serait une.
 */
export function Nav({ solid = false }: { solid?: boolean } = {}) {
  const [scrolled, setScrolled] = useState(false);
  // Les ancres désignent des sections de l'accueil : hors de l'accueil, elles
  // doivent y ramener plutôt que de ne rien faire.
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  /**
   * Nav opaque d'emblée sur les pages à fond clair.
   *
   * Les liens et la marque sont blancs : conçus pour le héros sombre, ils
   * étaient posés sur ivoire dans les pages légales, où la marque devenait
   * invisible et les liens illisibles (axe : 16 violations de contraste sur
   * une seule page). Plutôt qu'un second jeu de couleurs, la nav prend ici
   * l'apparence qu'elle a DÉJÀ une fois défilée — fond navy, mêmes tokens,
   * même vocabulaire visuel — et le texte blanc y retrouve ses 17:1.
   */
  const opaque = solid || scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /**
   * Échap ferme le menu et rend le focus au bouton (WCAG 2.1.2).
   *
   * Sans cela, le menu ouvert au clavier ne se refermait que par un lien : il
   * n'existait aucun moyen d'en sortir sans quitter la page où l'on était. Le
   * focus revient au bouton d'ouverture, sans quoi il retomberait sur le
   * `<body>` et la tabulation suivante repartirait du début du document.
   */
  const burgerRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      burgerRef.current?.focus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <nav
      aria-label={nav.landmark}
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
        backgroundColor: opaque ? alpha.navScrolledBg : "transparent",
        backdropFilter: opaque ? "blur(24px)" : "none",
        WebkitBackdropFilter: opaque ? "blur(24px)" : "none",
        borderBottom: opaque ? `1px solid ${alpha.goldBorderFaint}` : "none",
        transition: "background-color 0.4s ease, backdrop-filter 0.4s ease",
      }}
    >
      <a
        href={sectionHref(pathname, "#top")}
        className="nav-brand"
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

      <div className="nav-actions" style={{ display: "flex", alignItems: "center", gap: 36 }}>
        <div className="nav-links" style={{ display: "flex", gap: 32 }}>
          {nav.links.map((link) => (
            <a
              key={link.href}
              href={sectionHref(pathname, link.href)}
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

        <button
          ref={burgerRef}
          type="button"
          className="nav-burger"
          aria-expanded={menuOpen}
          aria-controls="nav-panel"
          aria-label={menuOpen ? nav.menuClose : nav.menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          style={{
            alignItems: "center",
            justifyContent: "center",
            width: 40,
            height: 40,
            padding: 0,
            fontFamily: fonts.sans,
            fontSize: "1.1rem",
            color: colors.ivory,
            backgroundColor: "transparent",
            border: `1px solid ${alpha.whiteCtaBorder}`,
            cursor: "pointer",
          }}
        >
          <span aria-hidden>{menuOpen ? "\u2715" : "\u2261"}</span>
        </button>

        <a
          href={sectionHref(pathname, "#commencer")}
          className="nav-cta"
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

      {/*
        Panneau déroulant, hors du flux : il recouvre le haut de la page au
        lieu de pousser le contenu, la nav étant en position fixed.
        Toujours rendu, jamais monté conditionnellement — `data-open` pilote son
        affichage, ce qui garde l'attribut aria-controls valide en permanence.
      */}
      <div
        id="nav-panel"
        className="nav-panel"
        data-open={menuOpen}
        style={{
          position: "absolute",
          top: layout.navHeight,
          left: 0,
          right: 0,
          padding: "20px 8% 28px",
          backgroundColor: alpha.navScrolledBg,
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderBottom: `1px solid ${alpha.goldBorderFaint}`,
        }}
      >
        {nav.links.map((link) => (
          <a
            key={link.href}
            href={sectionHref(pathname, link.href)}
            onClick={() => setMenuOpen(false)}
            style={{
              display: "block",
              padding: "12px 0",
              fontFamily: fonts.sans,
              fontSize: "0.95rem",
              letterSpacing: "0.04em",
              color: alpha.whiteCtaText,
              textDecoration: "none",
            }}
          >
            {link.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
