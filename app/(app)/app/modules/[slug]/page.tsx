import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { colors, fonts, alpha } from "@/design/tokens";
import { ACCESS_COOKIE, verifyAccessToken } from "@/lib/access/session";
import { isPublishable } from "@/lib/modules/types";
import { findModule, modulesCopy } from "@/content/modules";

export const metadata: Metadata = {
  title: "Module — Admitto",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Lecture d'un module (CDC §25).
 *
 * Un module non publiable — non publié, sans contenu, ou dont une section
 * officielle n'est pas sourcée — répond 404 plutôt que de s'afficher amputé.
 * La bibliothèque ne le lie pas ; l'URL directe ne doit pas non plus l'ouvrir.
 */
export default async function ModulePage({ params }: { params: Promise<{ slug: string }> }) {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  const assessmentId = await verifyAccessToken(token, new Date());
  if (!assessmentId) redirect("/diagnostic");

  const { slug } = await params;
  const entry = findModule(slug);
  if (!entry || !isPublishable(entry)) notFound();

  return (
    <article>
      <Link
        href="/app/modules"
        style={{
          fontFamily: fonts.sans,
          fontSize: "0.8rem",
          color: colors.slate,
          textDecoration: "none",
        }}
      >
        ← {modulesCopy.back}
      </Link>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 12, marginTop: 24 }}>
        <span
          style={{
            fontFamily: fonts.sans,
            fontSize: "0.68rem",
            letterSpacing: "0.16em",
            color: colors.gold,
          }}
        >
          MODULE {entry.order}
        </span>
        <span style={{ fontFamily: fonts.sans, fontSize: "0.72rem", color: colors.slate }}>
          {modulesCopy.readingTime(entry.readingMinutes)}
        </span>
      </div>

      <h1
        style={{
          fontFamily: fonts.serif,
          fontWeight: 300,
          fontSize: "2.1rem",
          margin: "10px 0 0",
          maxWidth: 720,
          color: colors.navy900,
        }}
      >
        {entry.title}
      </h1>

      <div style={{ maxWidth: 700 }}>
        {entry.sections.map((section) => (
          <section key={section.id} style={{ marginTop: 44 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ display: "block", width: 32, height: 1, backgroundColor: colors.gold }} />
              <h2
                style={{
                  fontFamily: fonts.serif,
                  fontWeight: 400,
                  fontSize: "1.3rem",
                  margin: 0,
                  color: colors.navy900,
                }}
              >
                {section.title}
              </h2>
            </div>

            {section.body.map((paragraph, index) => (
              <p
                key={index}
                style={{
                  fontFamily: fonts.sans,
                  fontSize: "0.95rem",
                  lineHeight: 1.85,
                  margin: "16px 0 0",
                  color: colors.slate,
                }}
              >
                {paragraph}
              </p>
            ))}

            {section.keyPoints && section.keyPoints.length > 0 && (
              <div
                style={{
                  marginTop: 22,
                  padding: "18px 22px",
                  borderLeft: `2px solid ${colors.gold}`,
                  backgroundColor: alpha.cardGridGap,
                }}
              >
                <span
                  style={{
                    display: "block",
                    fontFamily: fonts.sans,
                    fontSize: "0.66rem",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: colors.gold,
                  }}
                >
                  {modulesCopy.keyPointsTitle}
                </span>
                <ul style={{ margin: "10px 0 0", padding: "0 0 0 18px" }}>
                  {section.keyPoints.map((point) => (
                    <li
                      key={point}
                      style={{
                        fontFamily: fonts.sans,
                        fontSize: "0.88rem",
                        lineHeight: 1.8,
                        color: colors.navy900,
                      }}
                    >
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {section.kind === "OFFICIAL_RULE" && (
              <p
                style={{
                  fontFamily: fonts.sans,
                  fontSize: "0.78rem",
                  lineHeight: 1.7,
                  margin: "14px 0 0",
                  color: colors.slate,
                }}
              >
                {modulesCopy.sourceLabel} :{" "}
                <a href={section.source.url} style={{ color: colors.gold }}>
                  {section.source.label}
                </a>{" "}
                · {modulesCopy.verifiedLabel} {section.source.verifiedAt}
              </p>
            )}
          </section>
        ))}
      </div>

      <p
        style={{
          fontFamily: fonts.sans,
          fontSize: "0.8rem",
          lineHeight: 1.75,
          margin: "56px 0 0",
          padding: "16px 20px",
          maxWidth: 700,
          border: `1px solid ${alpha.cardGridGap}`,
          color: colors.slate,
        }}
      >
        {modulesCopy.disclaimer}
      </p>
    </article>
  );
}
