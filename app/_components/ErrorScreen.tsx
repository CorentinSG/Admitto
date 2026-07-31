"use client";

import { colors, fonts } from "@/design/tokens";

/**
 * Écran d'erreur, rendu UNIQUE (lot D).
 *
 * Partagé par `app/error.tsx` — qui attrape les erreurs de rendu des pages —
 * et par `app/global-error.tsx`, qui prend le relais quand c'est la mise en
 * page racine elle-même qui a échoué. Deux écrans séparés divergeraient sans
 * que rien ne le signale, et celui qu'on verrait le moins souvent serait
 * justement le moins soigné.
 *
 * Ce qu'il montre, et ce qu'il ne montre pas :
 *
 * - **Aucune trace d'exécution, aucun message.** Une pile d'appels au
 *   navigateur cite des chemins de fichiers, des noms de variables et souvent
 *   la valeur qui a causé l'erreur. Next.js les retire en production ; ne rien
 *   afficher ici rend le comportement identique en développement, où le piège
 *   se tend d'habitude.
 * - **Le `digest`**, et lui seul. C'est le même code que porte la ligne du
 *   journal serveur : il relie ce que la personne a vu à ce que l'éditeur peut
 *   lire, sans rien révéler par lui-même. Sans lui, un signalement
 *   d'utilisateur est intraçable — et c'était le cas avant ce lot.
 *
 * Pas de date affichée : le serveur formaterait en UTC et le navigateur dans
 * le fuseau local, ce qui régénère l'arbre React (cf. `DocumentView`).
 *
 * `standalone` couvre le cas de la mise en page racine perdue : ni polices, ni
 * fond hérités, donc l'écran porte les siens.
 */
export function ErrorScreen({
  digest,
  reset,
  standalone = false,
}: {
  digest?: string;
  reset: () => void;
  standalone?: boolean;
}) {
  return (
    <main
      style={{
        minHeight: standalone ? "100vh" : "70vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: standalone ? "0 8%" : "120px 8% 96px",
        backgroundColor: colors.navy900,
      }}
    >
      <span
        aria-hidden
        style={{ display: "block", width: 32, height: 1, backgroundColor: colors.gold }}
      />
      <h1
        style={{
          fontFamily: fonts.serif,
          fontWeight: 300,
          fontSize: "2.4rem",
          lineHeight: 1.2,
          margin: "24px 0 0",
          color: colors.ivory,
          maxWidth: 620,
        }}
      >
        Une erreur est survenue.
      </h1>
      <p
        style={{
          fontFamily: fonts.sans,
          fontSize: "0.95rem",
          lineHeight: 1.9,
          margin: "18px 0 0",
          maxWidth: 560,
          color: colors.goldLight,
        }}
      >
        Elle a été enregistrée. Votre diagnostic et vos documents ne sont pas affectés : rien
        n&apos;est perdu par cet écran.
      </p>

      {digest ? (
        <p
          style={{
            fontFamily: fonts.sans,
            fontSize: "0.78rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            margin: "28px 0 0",
            color: colors.gold,
          }}
        >
          Référence : {digest}
        </p>
      ) : null}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 36 }}>
        <button
          type="button"
          onClick={reset}
          style={{
            fontFamily: fonts.sans,
            fontSize: "0.78rem",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            padding: "14px 28px",
            color: colors.navy900,
            backgroundColor: colors.gold,
            border: "none",
            cursor: "pointer",
          }}
        >
          Réessayer
        </button>
        {/*
          `<a>` et non `<Link>`, délibérément : cet écran s'affiche quand
          l'application a échoué, et une navigation par le routeur réutiliserait
          précisément ce qui vient de casser. Un chargement complet du document
          repart d'un état neuf.
        */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a
          href="/"
          style={{
            fontFamily: fonts.sans,
            fontSize: "0.78rem",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            padding: "14px 28px",
            color: colors.ivory,
            border: `1px solid ${colors.gold}`,
            textDecoration: "none",
          }}
        >
          Retour à l&apos;accueil
        </a>
      </div>
    </main>
  );
}
