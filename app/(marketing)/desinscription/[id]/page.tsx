import Link from "next/link";
import type { Metadata } from "next";
import { colors, fonts, alpha } from "@/design/tokens";
import { assessmentStore } from "@/lib/store/assessments";
import { desinscription } from "@/content/desinscription";
import { UnsubscribeButton } from "./UnsubscribeButton";

export const metadata: Metadata = {
  title: "Désinscription — Admitto",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Retrait du consentement marketing (CDC §34).
 *
 * Chaque email promotionnel portait déjà un lien vers cette adresse — qui
 * n'existait pas. Un lien de désinscription qui rend 404 n'est pas un détail :
 * c'est la seule sortie offerte à quelqu'un qui ne veut plus être écrit, et
 * l'annoncer sans la fournir est pire que ne rien annoncer.
 *
 * Le retrait n'est PAS exécuté au chargement de la page. Un GET ne doit rien
 * modifier : les aperçus de lien et les antivirus de messagerie visitent les
 * URL des emails, et désinscriraient à la place du destinataire. Un geste
 * explicite est donc demandé.
 *
 * Le retrait ne touche jamais aux emails contractuels — lien de connexion,
 * envoi du rapport, rappel d'une échéance inscrite à la feuille de route. Les
 * couper reviendrait à priver du service ceux qui refusent la prospection.
 */
export default async function UnsubscribePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Un lien périmé n'affiche ni erreur ni 404 : la personne n'a rien à
  // corriger, et le résultat qu'elle cherche — ne plus être écrite — est
  // acquis dans les deux cas.
  const assessment = await assessmentStore.get(id);
  const already = assessment ? await assessmentStore.isUnsubscribed(id) : true;

  return (
    <main id="contenu" tabIndex={-1} style={{ backgroundColor: colors.ivory, minHeight: "100vh", padding: "120px 8%" }}>
      <div style={{ maxWidth: 620 }}>
        <h1
          style={{
            fontFamily: fonts.serif,
            fontWeight: 300,
            fontSize: "2.2rem",
            margin: 0,
            color: colors.navy900,
          }}
        >
          {desinscription.title}
        </h1>

        <p
          style={{
            fontFamily: fonts.sans,
            fontSize: "0.95rem",
            lineHeight: 1.85,
            margin: "18px 0 0",
            color: colors.slate,
          }}
        >
          {already ? desinscription.already : desinscription.intro}
        </p>

        <p
          style={{
            fontFamily: fonts.sans,
            fontSize: "0.88rem",
            lineHeight: 1.8,
            margin: "16px 0 0",
            color: colors.slate,
          }}
        >
          {desinscription.keeps}
        </p>

        {!already ? <UnsubscribeButton id={id} /> : null}

        <Link
          href="/"
          style={{
            display: "inline-block",
            marginTop: 36,
            paddingTop: 22,
            borderTop: `1px solid ${alpha.cardGridGap}`,
            fontFamily: fonts.sans,
            fontSize: "0.82rem",
            color: colors.goldText,
            textDecoration: "none",
          }}
        >
          {desinscription.home} →
        </Link>
      </div>
    </main>
  );
}
