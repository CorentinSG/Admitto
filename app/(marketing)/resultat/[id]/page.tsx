import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { colors, fonts, alpha, gradients } from "@/design/tokens";
import { assessmentStore } from "@/lib/store/assessments";
import { announcedDelay } from "@/lib/capacity/delay";
import { reportStore } from "@/lib/store/reports";
import { formatUsd } from "@/lib/costs/estimate";
import { PATH_LABELS, result } from "@/content/result";
import { usingDatabase } from "@/lib/db/client";
import { AccessButton } from "./AccessButton";
import { PARTNERSHIP_LABELS, TUITION_LABELS } from "@/content/partnerships-labels";
import type { PartnershipDetection } from "@/lib/partnerships/detect";
import type { Partnership } from "@/lib/partnerships/types";

export const metadata: Metadata = {
  title: "Votre résultat préliminaire — Admitto",
  robots: { index: false, follow: false }, // page personnelle : jamais indexée
};

const dateFr = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

/**
 * Résultat préliminaire immédiat (CDC §15).
 * Rendu serveur, dynamique par nature (donnée personnelle) — jamais mis en cache.
 */
/** Les comptes exigent une base et un secret : sans eux, aucun accès à proposer. */
const accountsAvailable = () => usingDatabase() && Boolean(process.env.AUTH_SECRET);

export default async function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const assessment = await assessmentStore.get(id);
  if (!assessment) notFound();

  // Délai annoncé calculé sur la file réelle (CDC §18).
  const activeReports = await reportStore.activeCount();

  const { answers, derived, path, textBlocks, partnerships, costs, deadlines } = assessment;

  return (
    <main style={{ background: gradients.hero, minHeight: "100vh", padding: "140px 8% 100px" }}>
      <div style={{ maxWidth: 780 }}>
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
          {result.badge}
        </span>

        <h1
          style={{
            fontFamily: fonts.serif,
            fontWeight: 300,
            fontSize: "clamp(2.1rem, 4vw, 3.1rem)",
            lineHeight: 1.18,
            margin: "28px 0 0",
            color: colors.ivory,
          }}
        >
          {result.greeting(answers.firstName)}
        </h1>

        {answers.email && (
          <p
            style={{
              fontFamily: fonts.sans,
              fontSize: "0.88rem",
              margin: "16px 0 0",
              color: alpha.whiteDesc,
            }}
          >
            {result.emailConfirmation(answers.email)}
          </p>
        )}

        {/* Voie préliminaire */}
        <Block title={result.sections.path}>
          <span
            style={{
              display: "inline-block",
              border: `1px solid ${alpha.goldBorderHover}`,
              color: colors.goldLight,
              fontFamily: fonts.sans,
              fontSize: "0.8rem",
              letterSpacing: "0.04em",
              padding: "10px 16px",
            }}
          >
            {PATH_LABELS[path]}
          </span>
          {textBlocks.map((text) => (
            <Paragraph key={text}>{text}</Paragraph>
          ))}
        </Block>

        {/* Partenariats */}
        <Block title={result.sections.partnerships}>
          <PartnershipList detection={partnerships} />
        </Block>

        {/* Échéances */}
        {deadlines.length > 0 && (
          <Block title={result.sections.deadlines}>
            <div style={{ marginTop: 20 }}>
              {deadlines.map((d) => (
                <div
                  key={d.label}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "150px 1fr",
                    gap: 20,
                    padding: "14px 0",
                    borderTop: `1px solid ${alpha.goldBorderFaint}`,
                  }}
                >
                  <span
                    style={{
                      fontFamily: fonts.sans,
                      fontSize: "0.8rem",
                      color: colors.gold,
                      letterSpacing: "0.04em",
                    }}
                  >
                    {dateFr(d.date)}
                  </span>
                  <span>
                    <span
                      style={{
                        display: "block",
                        fontFamily: fonts.sans,
                        fontSize: "0.95rem",
                        color: colors.ivory,
                      }}
                    >
                      {d.label}
                    </span>
                    <span
                      style={{
                        display: "block",
                        fontFamily: fonts.sans,
                        fontSize: "0.82rem",
                        lineHeight: 1.6,
                        marginTop: 4,
                        color: alpha.whiteDesc,
                      }}
                    >
                      {d.note}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </Block>
        )}

        {/* Éléments migratoires */}
        <Block title={result.sections.immigration}>
          <Paragraph>{result.immigration[derived.visaNeed]}</Paragraph>
        </Block>

        {/* Fourchette de coût */}
        <Block title={result.sections.costs}>
          <Paragraph>{result.costsIntro}</Paragraph>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
              gap: 12,
              marginTop: 22,
            }}
          >
            {[
              ["Coût académique", costs.academic],
              ["Coût de la vie", costs.living],
              ["Barreau et admission", costs.barAndAdmission],
              ["Total indicatif", costs.total],
            ].map(([label, range]) => {
              const r = range as { lowUsd: number; highUsd: number };
              return (
                <div
                  key={label as string}
                  style={{
                    padding: "20px 18px",
                    backgroundColor: alpha.whiteFaint,
                    border: `1px solid ${alpha.goldBorderFaint}`,
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      fontFamily: fonts.sans,
                      fontSize: "0.68rem",
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: colors.gold,
                    }}
                  >
                    {label as string}
                  </span>
                  <span
                    style={{
                      display: "block",
                      fontFamily: fonts.serif,
                      fontSize: "1.2rem",
                      whiteSpace: "nowrap",
                      margin: "10px 0 0",
                      color: colors.ivory,
                    }}
                  >
                    {formatUsd(r.lowUsd)} – {formatUsd(r.highUsd)}
                  </span>
                </div>
              );
            })}
          </div>
          <p
            style={{
              fontFamily: fonts.sans,
              fontSize: "0.82rem",
              lineHeight: 1.7,
              margin: "20px 0 0",
              color: alpha.whiteDesc,
            }}
          >
            {result.costsNotIncluded} {costs.notIncluded.join(", ")}.
          </p>
        </Block>

        {/* Limites */}
        <Block title={result.sections.limits}>
          <ul style={{ margin: "18px 0 0" }}>
            {result.limits.map((limit) => (
              <li
                key={limit}
                style={{
                  display: "flex",
                  gap: 12,
                  fontFamily: fonts.sans,
                  fontSize: "0.9rem",
                  lineHeight: 1.7,
                  color: alpha.whiteCtaText,
                  marginBottom: 10,
                }}
              >
                <span aria-hidden style={{ color: colors.gold }}>
                  ✦
                </span>
                {limit}
              </li>
            ))}
          </ul>
        </Block>

        {/* Suite */}
        <div
          style={{
            marginTop: 56,
            padding: "32px 28px",
            backgroundColor: alpha.goldItemHoverBg,
            border: `1px solid ${alpha.goldBorderHover}`,
          }}
        >
          <h2
            style={{
              fontFamily: fonts.serif,
              fontWeight: 400,
              fontSize: "1.5rem",
              margin: 0,
              color: colors.ivory,
            }}
          >
            {result.nextTitle}
          </h2>
          <Paragraph>{result.nextBody}</Paragraph>
          <p
            style={{
              fontFamily: fonts.sans,
              fontSize: "0.88rem",
              margin: "14px 0 0",
              color: colors.goldLight,
            }}
          >
            {result.nextDelay(announcedDelay(activeReports))}
          </p>
          <Link
            href={`/diagnostic/paiement/${id}`}
            style={{
              display: "inline-block",
              marginTop: 20,
              fontFamily: fonts.sans,
              fontSize: "0.82rem",
              letterSpacing: "0.04em",
              padding: "13px 22px",
              border: `1px solid ${alpha.goldBorderHover}`,
              color: colors.goldLight,
              textDecoration: "none",
            }}
          >
            {result.nextCta} →
          </Link>

          {/* L'espace payant n'est proposé que s'il est activé côté serveur. */}
          {accountsAvailable() && <AccessButton assessmentId={id} />}
        </div>

        <p
          style={{
            fontFamily: fonts.sans,
            fontSize: "0.76rem",
            lineHeight: 1.7,
            margin: "48px 0 0",
            color: alpha.whiteDesc,
          }}
        >
          {result.disclaimer}
        </p>

        <Link
          href="/"
          style={{
            display: "inline-block",
            marginTop: 32,
            fontFamily: fonts.sans,
            fontSize: "0.82rem",
            color: colors.goldLight,
            textDecoration: "none",
          }}
        >
          ← {result.homeCta}
        </Link>
      </div>
    </main>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: 56 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ display: "block", width: 40, height: 1, backgroundColor: colors.gold }} />
        <span
          style={{
            fontFamily: fonts.sans,
            fontSize: "0.72rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: colors.goldLight,
          }}
        >
          {title}
        </span>
      </div>
      <div style={{ marginTop: 20 }}>{children}</div>
    </section>
  );
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: fonts.sans,
        fontSize: "0.95rem",
        lineHeight: 1.75,
        margin: "16px 0 0",
        color: alpha.whiteCtaText,
      }}
    >
      {children}
    </p>
  );
}

/**
 * Partenariats détectés (CDC §15 et §27).
 * La fiabilité est rendue lisible : une fiche confirmée et une piste à vérifier
 * ne sont pas présentées de la même façon. Un partenariat ne dit rien de
 * l'éligibilité au barreau — seul le BOLE se prononce.
 */
function PartnershipList({ detection }: { detection: PartnershipDetection }) {
  const { confirmed, toConfirm, aboveLevel, universityCovered } = detection;

  if (!universityCovered) {
    return <Paragraph>{result.partnershipsNone}</Paragraph>;
  }

  return (
    <div>
      {confirmed.length > 0 ? (
        <>
          <Paragraph>{result.partnershipsFound(confirmed.length)}</Paragraph>
          <div style={{ marginTop: 20 }}>
            {confirmed.map((p) => (
              <PartnershipRow key={p.id} partnership={p} />
            ))}
          </div>
        </>
      ) : (
        <Paragraph>{result.partnershipsNoneAtLevel}</Paragraph>
      )}

      {toConfirm.length > 0 && (
        <>
          <Paragraph>{result.partnershipsToConfirm(toConfirm.length)}</Paragraph>
          <ul style={{ margin: "12px 0 0" }}>
            {toConfirm.map((p) => (
              <li
                key={p.id}
                style={{
                  fontFamily: fonts.sans,
                  fontSize: "0.86rem",
                  lineHeight: 1.7,
                  color: alpha.whiteDesc,
                  marginBottom: 6,
                }}
              >
                {p.usLawSchool}
                {p.city ? ` — ${p.city}` : ""}
              </li>
            ))}
          </ul>
        </>
      )}

      {aboveLevel.length > 0 && (
        <Paragraph>{result.partnershipsAboveLevel(aboveLevel.length)}</Paragraph>
      )}
    </div>
  );
}

function PartnershipRow({ partnership }: { partnership: Partnership }) {
  return (
    <div style={{ padding: "16px 0", borderTop: `1px solid ${alpha.goldBorderFaint}` }}>
      <span
        style={{
          display: "block",
          fontFamily: fonts.serif,
          fontSize: "1.1rem",
          color: colors.ivory,
        }}
      >
        {partnership.usLawSchool}
      </span>
      <span
        style={{
          display: "block",
          fontFamily: fonts.sans,
          fontSize: "0.78rem",
          margin: "4px 0 0",
          color: colors.gold,
        }}
      >
        {[partnership.city, partnership.state].filter(Boolean).join(", ")}
        {" · "}
        {PARTNERSHIP_LABELS[partnership.partnershipType]}
        {" · "}
        {TUITION_LABELS[partnership.tuitionCategory]}
      </span>
      {partnership.tuitionDisplay && (
        <span
          style={{
            display: "block",
            fontFamily: fonts.sans,
            fontSize: "0.86rem",
            lineHeight: 1.7,
            margin: "8px 0 0",
            color: alpha.whiteCtaText,
          }}
        >
          {partnership.tuitionDisplay}
        </span>
      )}
      {partnership.requiredLevelRaw && (
        <span
          style={{
            display: "block",
            fontFamily: fonts.sans,
            fontSize: "0.78rem",
            margin: "6px 0 0",
            color: alpha.whiteDesc,
          }}
        >
          Niveau attendu : {partnership.requiredLevelRaw}
        </span>
      )}
    </div>
  );
}
