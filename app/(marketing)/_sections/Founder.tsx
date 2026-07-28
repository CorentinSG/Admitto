"use client";

import Image from "next/image";
import { colors, fonts, alpha, layout } from "@/design/tokens";
import { useInView, thresholds } from "@/design/animations";
import { SectionLabel, SectionTitle } from "../_components/ui";
import { founder } from "@/content/homepage";

/**
 * Le parcours du fondateur (CDC §11.9) — expérience, erreurs, apprentissages,
 * raison d'être du produit. L'admission au barreau de New York est présentée
 * comme un fait de parcours, jamais comme la qualité au titre de laquelle le
 * service serait rendu (CDC §6).
 *
 * Mise en page à deux colonnes reprise de « La Solution » : le portrait glisse
 * en bloc depuis la droite (0,8 s ease 0,2 s), sans stagger interne.
 *
 * `overflow: hidden` sur la section est obligatoire : avant révélation le
 * portrait est décalé de translateX(40px) et déborderait à droite sur mobile
 * (même règle que les sections Solution et Dashboard).
 */
export function Founder() {
  const [ref, inView] = useInView(thresholds.solution);

  return (
    <section
      id="fondateur"
      ref={ref}
      style={{ backgroundColor: colors.ivory, padding: layout.sectionPadding, overflow: "hidden" }}
    >
      <div
        className="solution-grid-inner"
        style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: 72, alignItems: "end" }}
      >
        <div>
          <SectionLabel inView={inView}>{founder.label}</SectionLabel>
          <SectionTitle inView={inView}>{founder.title}</SectionTitle>

          <div style={{ maxWidth: 640, marginTop: 32 }}>
            {founder.paragraphs.map((paragraph, i) => (
              <p
                key={i}
                style={{
                  fontFamily: fonts.sans,
                  fontSize: "1rem",
                  lineHeight: 1.8,
                  margin: "0 0 20px",
                  color: colors.slate,
                  opacity: +!!inView,
                  transition: `opacity 0.8s ease ${0.2 + 0.1 * i}s`,
                }}
              >
                {paragraph}
              </p>
            ))}

            <div
              style={{
                marginTop: 36,
                paddingTop: 28,
                borderTop: `1px solid ${alpha.cardGridGap}`,
                opacity: +!!inView,
                transition: "opacity 0.8s ease 0.5s",
              }}
            >
              <span style={{ fontFamily: fonts.sans, fontSize: "0.88rem", lineHeight: 1.6 }}>
                <strong style={{ color: colors.navy900, fontWeight: 500 }}>
                  {founder.signature}
                </strong>
                <br />
                <span style={{ color: colors.slate }}>{founder.signatureRole}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Portrait détouré : le disque doré tient lieu de fond, le sujet déborde
            volontairement au-dessus (le PNG est transparent). */}
        <div
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "center",
            opacity: +!!inView,
            transform: inView ? "translateX(0)" : "translateX(40px)",
            transition: "opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s",
          }}
        >
          <span
            aria-hidden
            style={{
              position: "absolute",
              bottom: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: 320,
              height: 320,
              borderRadius: "50%",
              backgroundColor: "rgba(201, 168, 76, 0.10)",
              border: `1px solid ${alpha.goldBorderFaint}`,
            }}
          />
          <Image
            src="/founder-portrait.png"
            alt={founder.signature}
            width={640}
            height={960}
            sizes="(max-width: 900px) 60vw, 380px"
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 380,
              height: "auto",
              // Le détourage s'arrête net au bas du cadrage : fondu pour éviter
              // une coupe franche au milieu du buste.
              maskImage: "linear-gradient(180deg, rgba(0,0,0,1) 74%, rgba(0,0,0,0) 100%)",
              WebkitMaskImage: "linear-gradient(180deg, rgba(0,0,0,1) 74%, rgba(0,0,0,0) 100%)",
            }}
          />
        </div>
      </div>
    </section>
  );
}
