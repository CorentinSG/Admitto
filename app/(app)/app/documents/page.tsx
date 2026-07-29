import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { colors, fonts, alpha } from "@/design/tokens";
import { ACCESS_COOKIE, verifyAccessToken } from "@/lib/access/session";
import { documentStore } from "@/lib/store/documents";
import { storageEnabled } from "@/lib/vault/storage";
import { DOCUMENT_TYPES } from "@/lib/vault/types";
import { vault } from "@/content/vault";
import { DocumentPanel } from "./DocumentPanel";

export const metadata: Metadata = {
  title: "Vos documents — Admitto",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/** Coffre de documents (CDC §29). */
export default async function DocumentsPage() {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  const assessmentId = await verifyAccessToken(token, new Date());
  if (!assessmentId) redirect("/diagnostic");

  const documents = await documentStore.list(assessmentId);
  const enabled = storageEnabled();

  // Formatage des dates ici, côté serveur : voir le commentaire de DocumentView.
  const views = documents.map((document) => ({
    id: document.id,
    type: document.type,
    fileName: document.fileName,
    uploadedLabel: new Date(document.uploadedAt).toLocaleDateString("fr-FR"),
    stored: document.storageKey !== null,
  }));

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
        {vault.title}
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
        {vault.intro}
      </p>

      {!enabled && (
        <div
          style={{
            marginTop: 24,
            padding: "16px 20px",
            border: `1px solid ${colors.gold}`,
            maxWidth: 680,
          }}
        >
          <h2
            style={{
              fontFamily: fonts.sans,
              fontSize: "0.7rem",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: colors.gold,
              margin: 0,
            }}
          >
            {vault.disabledTitle}
          </h2>
          <p
            style={{
              fontFamily: fonts.sans,
              fontSize: "0.86rem",
              lineHeight: 1.75,
              margin: "10px 0 0",
              color: colors.navy900,
            }}
          >
            {vault.disabledBody}
          </p>
        </div>
      )}

      <div style={{ marginTop: 36 }}>
        {DOCUMENT_TYPES.map((type) => (
          <DocumentPanel
            key={type}
            type={type}
            documents={views.filter((d) => d.type === type)}
            storageEnabled={enabled}
          />
        ))}
      </div>

      <section
        style={{
          marginTop: 48,
          padding: "24px 26px",
          backgroundColor: colors.navy900,
          maxWidth: 680,
        }}
      >
        <h2
          style={{
            fontFamily: fonts.sans,
            fontSize: "0.7rem",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: colors.gold,
            margin: 0,
          }}
        >
          {vault.minimisationTitle}
        </h2>
        <p
          style={{
            fontFamily: fonts.sans,
            fontSize: "0.86rem",
            lineHeight: 1.75,
            margin: "12px 0 0",
            color: alpha.whiteCtaText,
          }}
        >
          {vault.minimisationIntro}
        </p>
        <ul style={{ margin: "14px 0 0", padding: "0 0 0 18px" }}>
          {vault.refusedCategories.map((category) => (
            <li
              key={category}
              style={{
                fontFamily: fonts.sans,
                fontSize: "0.86rem",
                lineHeight: 1.9,
                color: colors.ivory,
              }}
            >
              {category}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
