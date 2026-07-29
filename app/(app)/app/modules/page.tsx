import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { colors, fonts, alpha } from "@/design/tokens";
import { ACCESS_COOKIE, verifyAccessToken } from "@/lib/access/session";
import { isPublishable } from "@/lib/modules/types";
import { MODULES, modulesCopy } from "@/content/modules";

export const metadata: Metadata = {
  title: "Modules — Admitto",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/** Bibliothèque de modules (CDC §25). */
export default async function ModulesPage() {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  const assessmentId = await verifyAccessToken(token, new Date());
  if (!assessmentId) redirect("/diagnostic");

  const entries = [...MODULES].sort((a, b) => a.order - b.order);

  return (
    <div>
      <h1
        style={{
          fontFamily: fonts.serif,
          fontWeight: 300,
          fontSize: "2.1rem",
          margin: 0,
          color: colors.navy900,
        }}
      >
        {modulesCopy.title}
      </h1>
      <p
        style={{
          fontFamily: fonts.sans,
          fontSize: "0.92rem",
          lineHeight: 1.75,
          maxWidth: 680,
          margin: "14px 0 0",
          color: colors.slate,
        }}
      >
        {modulesCopy.intro}
      </p>
      <p
        style={{
          fontFamily: fonts.sans,
          fontSize: "0.85rem",
          lineHeight: 1.75,
          maxWidth: 680,
          margin: "10px 0 0",
          color: colors.slate,
        }}
      >
        {modulesCopy.productionNote}
      </p>

      <div style={{ marginTop: 36 }}>
        {entries.map((entry) => {
          const available = isPublishable(entry);
          const heading = (
            <>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 12 }}>
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
                <span
                  style={{
                    fontFamily: fonts.sans,
                    fontSize: "0.72rem",
                    color: colors.slate,
                  }}
                >
                  {available
                    ? `${modulesCopy.readingTime(entry.readingMinutes)} · ${modulesCopy.sectionsCount(entry.sections.length)}`
                    : modulesCopy.inProduction}
                </span>
              </div>
              <h2
                style={{
                  fontFamily: fonts.serif,
                  fontWeight: 400,
                  fontSize: "1.25rem",
                  margin: "8px 0 0",
                  color: available ? colors.navy900 : colors.slate,
                }}
              >
                {entry.title}
              </h2>
              <p
                style={{
                  fontFamily: fonts.sans,
                  fontSize: "0.87rem",
                  lineHeight: 1.7,
                  margin: "8px 0 0",
                  maxWidth: 640,
                  color: colors.slate,
                }}
              >
                {entry.summary}
              </p>
            </>
          );

          return available ? (
            <Link
              key={entry.slug}
              href={`/app/modules/${entry.slug}`}
              style={{
                display: "block",
                padding: "22px 0",
                borderTop: `1px solid ${alpha.cardGridGap}`,
                textDecoration: "none",
                color: "inherit",
              }}
            >
              {heading}
              <span
                style={{
                  display: "inline-block",
                  marginTop: 12,
                  fontFamily: fonts.sans,
                  fontSize: "0.78rem",
                  letterSpacing: "0.04em",
                  color: colors.gold,
                }}
              >
                Lire le module →
              </span>
            </Link>
          ) : (
            <div
              key={entry.slug}
              style={{ padding: "22px 0", borderTop: `1px solid ${alpha.cardGridGap}` }}
            >
              {heading}
            </div>
          );
        })}
      </div>
    </div>
  );
}
