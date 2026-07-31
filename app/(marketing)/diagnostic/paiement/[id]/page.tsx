import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TrackView } from "@/app/_components/TrackView";
import { colors, fonts, alpha, gradients } from "@/design/tokens";
import { assessmentStore } from "@/lib/store/assessments";
import { reportStore } from "@/lib/store/reports";
import { announcedDelay } from "@/lib/capacity/delay";
import { OFFERS, formatEuros, paymentsEnabled } from "@/lib/payments/offers";
import { checkout } from "@/content/checkout";
import { CheckoutButton } from "./CheckoutButton";

export const metadata: Metadata = {
  title: "Votre rapport personnalisé — Admitto",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Tunnel de paiement du diagnostic (CDC §16.2).
 * Les six mentions obligatoires — contenu, délai, nature, déduction,
 * rétractation, remboursement — sont affichées avant le bouton de paiement,
 * jamais derrière un lien.
 */
export default async function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const assessment = await assessmentStore.get(id);
  if (!assessment) notFound();

  const delay = announcedDelay(await reportStore.activeCount());
  const priceLabel = formatEuros(OFFERS.DIAGNOSTIC.priceCents ?? 0);

  return (
    <main id="contenu" tabIndex={-1} style={{ background: gradients.hero, minHeight: "100vh", padding: "140px 8% 100px" }}>
      <TrackView kind="CHECKOUT_VIEWED" />
      <div style={{ maxWidth: 720 }}>
        <span
          style={{
            display: "inline-block",
            backgroundColor: alpha.goldBadgeBg,
            color: colors.goldLight,
            fontFamily: fonts.sans,
            fontSize: "0.72rem",
            letterSpacing: "0.16em",
            padding: "9px 18px",
          }}
        >
          {checkout.badge}
        </span>

        <h1
          style={{
            fontFamily: fonts.serif,
            fontWeight: 300,
            fontSize: "clamp(2rem, 4vw, 2.9rem)",
            lineHeight: 1.18,
            margin: "28px 0 0",
            color: colors.ivory,
          }}
        >
          {checkout.title}
        </h1>

        <p
          style={{
            fontFamily: fonts.sans,
            fontSize: "1rem",
            lineHeight: 1.75,
            margin: "22px 0 0",
            color: alpha.whiteCtaText,
          }}
        >
          {checkout.intro}
        </p>

        {paymentsEnabled() && (
          <p
            style={{
              fontFamily: fonts.serif,
              fontSize: "2.2rem",
              fontWeight: 300,
              margin: "32px 0 0",
              color: colors.ivory,
            }}
          >
            {priceLabel}
            <span
              style={{
                fontFamily: fonts.sans,
                fontSize: "0.8rem",
                marginLeft: 12,
                color: alpha.whiteDesc,
              }}
            >
              paiement unique
            </span>
          </p>
        )}

        {/* Contenu du rapport */}
        <Block title={checkout.contents.title}>
          <ul style={{ margin: "16px 0 0" }}>
            {checkout.contents.items.map((item) => (
              <li
                key={item}
                style={{
                  display: "flex",
                  gap: 12,
                  fontFamily: fonts.sans,
                  fontSize: "0.92rem",
                  lineHeight: 1.7,
                  color: alpha.whiteCtaText,
                  marginBottom: 8,
                }}
              >
                <span aria-hidden style={{ color: colors.gold }}>
                  ✦
                </span>
                {item}
              </li>
            ))}
          </ul>
        </Block>

        <Block title={checkout.delay.title}>
          <Paragraph>{checkout.delay.body.replace("{delay}", delay)}</Paragraph>
        </Block>

        <Block title={checkout.nature.title}>
          <Paragraph>{checkout.nature.body}</Paragraph>
        </Block>

        <Block title={checkout.deduction.title}>
          <Paragraph>{checkout.deduction.body}</Paragraph>
        </Block>

        <Block title={checkout.withdrawal.title}>
          <Paragraph>{checkout.withdrawal.body}</Paragraph>
        </Block>

        <Block title={checkout.refund.title}>
          <Paragraph>{checkout.refund.body}</Paragraph>
        </Block>

        <CheckoutButton
          assessmentId={id}
          enabled={paymentsEnabled()}
          priceLabel={priceLabel}
        />
      </div>
    </main>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: 44 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ display: "block", width: 40, height: 1, backgroundColor: colors.gold }} />
        <h2
          style={{
            fontFamily: fonts.sans,
            fontSize: "0.72rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: colors.goldLight,
            margin: 0,
          }}
        >
          {title}
        </h2>
      </div>
      <div style={{ marginTop: 14 }}>{children}</div>
    </section>
  );
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: fonts.sans,
        fontSize: "0.93rem",
        lineHeight: 1.75,
        margin: 0,
        color: alpha.whiteCtaText,
      }}
    >
      {children}
    </p>
  );
}
