"use client";

import { useRef, useState, useTransition } from "react";
import { colors, fonts, alpha, gradients } from "@/design/tokens";
import { DOCUMENT_TYPE_HINTS, DOCUMENT_TYPE_LABELS, vault } from "@/content/vault";
import { ALLOWED_EXTENSIONS, type DocumentType } from "@/lib/vault/types";
import { removeDocument, uploadDocument } from "./actions";

/**
 * Le libellé de date arrive déjà formaté du serveur.
 *
 * Formater ici appellerait `toLocaleDateString` des deux côtés du rendu : le
 * serveur dans son fuseau, le navigateur dans celui de l'utilisateur. À cheval
 * sur minuit, les deux ne donnent pas la même date et React régénère tout
 * l'arbre (erreur d'hydratation). C'est le seul composant client du projet qui
 * affichait une date — les autres formatages sont côté serveur.
 */
export interface DocumentView {
  id: string;
  fileName: string;
  uploadedLabel: string;
  stored: boolean;
}

/**
 * Un panneau par type de document (CDC §29).
 *
 * Le champ de dépôt n'apparaît que si le stockage est actif. Sinon le panneau
 * bascule en déclaration : l'utilisateur note ce qu'il a préparé, aucun octet
 * ne part de sa machine — et l'interface le dit, plutôt que de laisser croire
 * à un envoi qui n'a pas lieu.
 */
export function DocumentPanel({
  type,
  documents,
  storageEnabled,
}: {
  type: DocumentType;
  documents: DocumentView[];
  storageEnabled: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [declared, setDeclared] = useState("");
  const [pending, startTransition] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);

  const submit = (formData: FormData) =>
    startTransition(async () => {
      setError(null);
      const result = await uploadDocument(formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setDeclared("");
      if (fileInput.current) fileInput.current.value = "";
    });

  return (
    <section
      style={{
        padding: "24px 0",
        borderTop: `1px solid ${alpha.cardGridGap}`,
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 12 }}>
        <h2
          style={{
            fontFamily: fonts.serif,
            fontWeight: 400,
            fontSize: "1.15rem",
            margin: 0,
            color: colors.navy900,
          }}
        >
          {DOCUMENT_TYPE_LABELS[type]}
        </h2>
        <span style={{ fontFamily: fonts.sans, fontSize: "0.75rem", color: colors.goldText }}>
          {vault.countSuffix(documents.length)}
        </span>
      </div>

      <p
        style={{
          fontFamily: fonts.sans,
          fontSize: "0.85rem",
          lineHeight: 1.7,
          margin: "6px 0 0",
          maxWidth: 620,
          color: colors.slate,
        }}
      >
        {DOCUMENT_TYPE_HINTS[type]}
      </p>

      {documents.length > 0 && (
        <ul style={{ listStyle: "none", margin: "16px 0 0", padding: 0 }}>
          {documents.map((document) => (
            <li
              key={document.id}
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                padding: "10px 0",
                borderTop: `1px solid ${alpha.cardGridGap}`,
              }}
            >
              <span
                style={{
                  fontFamily: fonts.sans,
                  fontSize: "0.88rem",
                  color: colors.navy900,
                }}
              >
                {/* Une pièce déposée se rouvre : sans ce lien, le seul geste
                    possible sur un document était de le retirer. Un document
                    seulement DÉCLARÉ n'a pas d'octet à rendre — il reste du
                    texte, et un lien mort serait pire que pas de lien. */}
                {document.stored ? (
                  <a
                    href={`/app/documents/${document.id}`}
                    download={document.fileName}
                    style={{ color: colors.navy900, textDecoration: "underline" }}
                  >
                    {document.fileName}
                  </a>
                ) : (
                  document.fileName
                )}
                <span style={{ color: colors.slate, fontSize: "0.78rem" }}>
                  {" · "}
                  {document.uploadedLabel}
                  {document.stored ? ` · ${vault.downloadHint}` : ` · ${vault.declaredNote}`}
                </span>
              </span>
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    setError(null);
                    const result = await removeDocument(document.id);
                    if (result?.error) setError(result.error);
                  })
                }
                style={{
                  padding: "6px 12px",
                  fontFamily: fonts.sans,
                  fontSize: "0.72rem",
                  letterSpacing: "0.03em",
                  cursor: "pointer",
                  border: `1px solid ${alpha.cardGridGap}`,
                  background: "transparent",
                  color: colors.slate,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = colors.gold;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = alpha.cardGridGap;
                }}
              >
                {vault.removeLabel}
              </button>
            </li>
          ))}
        </ul>
      )}

      <form
        action={submit}
        style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginTop: 16 }}
      >
        <input type="hidden" name="type" value={type} />

        {storageEnabled ? (
          <input
            ref={fileInput}
            type="file"
            name="file"
            accept={ALLOWED_EXTENSIONS.join(",")}
            aria-label={`${vault.chooseFile} — ${DOCUMENT_TYPE_LABELS[type]}`}
            style={{
              fontFamily: fonts.sans,
              fontSize: "0.82rem",
              color: colors.slate,
              maxWidth: "100%",
            }}
          />
        ) : (
          <input
            type="text"
            name="fileName"
            value={declared}
            onChange={(e) => setDeclared(e.target.value)}
            placeholder={`${DOCUMENT_TYPE_LABELS[type]}.pdf`}
            aria-label={`${vault.declareLabel} — ${DOCUMENT_TYPE_LABELS[type]}`}
            style={{
              padding: "9px 12px",
              minWidth: 240,
              fontFamily: fonts.sans,
              fontSize: "0.85rem",
              color: colors.navy900,
              border: `1px solid ${alpha.cardGridGap}`,
              background: colors.ivory,
            }}
          />
        )}

        <button
          type="submit"
          disabled={pending}
          style={{
            padding: "9px 18px",
            fontFamily: fonts.sans,
            fontSize: "0.76rem",
            letterSpacing: "0.06em",
            cursor: pending ? "default" : "pointer",
            border: `1px solid ${colors.gold}`,
            background: gradients.goldButton,
            color: colors.navy900,
          }}
        >
          {storageEnabled ? vault.addLabel : vault.declareLabel}
        </button>
      </form>

      {error && (
        <p
          role="alert"
          style={{
            fontFamily: fonts.sans,
            fontSize: "0.82rem",
            lineHeight: 1.7,
            margin: "10px 0 0",
            maxWidth: 620,
            color: colors.goldText,
          }}
        >
          {error}
        </p>
      )}
    </section>
  );
}
