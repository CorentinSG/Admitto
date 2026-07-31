"use client";

import { colors, fonts, alpha, layout } from "@/design/tokens";
import { useInView, thresholds } from "@/design/animations";
import { SectionLabel, SectionTitle } from "../_components/ui";
import { problem } from "@/content/homepage";

/**
 * Section « Le Défi » — fond ivoire.
 *
 * QUIRK À CONSERVER (contrat d'animation §5) : la transition des cartes ne
 * contient QUE background-color. L'opacité et le translateY basculent donc
 * instantanément, et le transitionDelay échelonné ne s'applique en pratique
 * qu'au fond. Résultat voulu : label et titre fondent en douceur, les 4 cartes
 * apparaissent d'un coup. Ne pas « corriger » sans décision explicite.
 */
export function Problem() {
  const [ref, inView] = useInView(thresholds.problems);

  return (
    <section
      id="problematique"
      ref={ref}
      style={{ backgroundColor: colors.ivory, padding: layout.sectionPadding }}
    >
      <SectionLabel inView={inView}>{problem.label}</SectionLabel>
      <SectionTitle inView={inView}>{problem.title}</SectionTitle>

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
        {problem.intro}
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 1,
          backgroundColor: alpha.cardGridGap,
          marginTop: 64,
        }}
      >
        {problem.cards.map((card, i) => (
          <div
            key={card.num}
            style={{
              backgroundColor: colors.ivory,
              padding: "40px 32px",
              cursor: "default",
              transition: "background-color 0.3s",
              opacity: +!!inView,
              transform: inView ? "translateY(0)" : "translateY(24px)",
              transitionDelay: `${0.1 + 0.1 * i}s`,
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.backgroundColor = colors.navy900;
              (el.querySelector("[data-num]") as HTMLElement).style.color = colors.gold;
              (el.querySelector("[data-title]") as HTMLElement).style.color = "#FFFFFF";
              (el.querySelector("[data-desc]") as HTMLElement).style.color = alpha.whiteDesc;
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.backgroundColor = colors.ivory;
              (el.querySelector("[data-num]") as HTMLElement).style.color = alpha.cardNumIdle;
              (el.querySelector("[data-title]") as HTMLElement).style.color = colors.navy900;
              (el.querySelector("[data-desc]") as HTMLElement).style.color = colors.slate;
            }}
          >
            {/* Numéro ornemental : il redit le rang de la carte, que la
                structure porte déjà. Très pâle au repos, il ne tient que
                1,28:1 sur ivoire — c'est le quirk du site de référence, et il
                se conserve. Le retirer des technologies d'assistance dit ce
                qu'il est vraiment : une décoration, pas un texte à lire. */}
            <span
              data-num
              aria-hidden
              style={{
                display: "block",
                fontFamily: fonts.serif,
                fontSize: "3.5rem",
                fontWeight: 300,
                lineHeight: 1,
                color: alpha.cardNumIdle,
                transition: "color 0.3s",
              }}
            >
              {card.num}
            </span>
            <h3
              data-title
              style={{
                fontFamily: fonts.serif,
                fontWeight: 400,
                fontSize: "1.25rem",
                lineHeight: 1.35,
                margin: "28px 0 0",
                color: colors.navy900,
                transition: "color 0.3s",
              }}
            >
              {card.title}
            </h3>
            <p
              data-desc
              style={{
                fontFamily: fonts.sans,
                fontSize: "0.9rem",
                lineHeight: 1.7,
                margin: "14px 0 0",
                color: colors.slate,
                transition: "color 0.3s",
              }}
            >
              {card.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
