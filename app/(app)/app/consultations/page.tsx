import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { colors, fonts, alpha } from "@/design/tokens";
import { currentAssessmentId } from "@/lib/auth/current";
import { consultationStore } from "@/lib/store/consultations";
import { bookableSlots, remainingAllowance, totalAllowance } from "@/lib/consultations/booking";
import { CONSULTATIONS, CONSULTATION_TYPES } from "@/lib/consultations/types";
import { consultations } from "@/content/consultations";
// Libellé partagé avec le back-office : deux formatages divergeraient, et le
// créneau que le fondateur ouvre cesserait de correspondre à celui qui est lu.
import { slotLabel } from "@/lib/consultations/time";
import { BookingForm, CancelButton } from "./BookingForm";

export const metadata: Metadata = {
  title: "Consultations — Admitto",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";


/** Consultations (CDC §30 et §31). */
export default async function ConsultationsPage() {
  const assessmentId = await currentAssessmentId();
  // Session valide mais aucun diagnostic rattaché : le parcours reprend
  // au diagnostic, dont la soumission rattachera le profil au compte.
  if (!assessmentId) redirect("/diagnostic");

  const now = new Date();
  const entitlement = await consultationStore.entitlement(assessmentId);
  const mine = await consultationStore.bookingsOf(assessmentId);
  const allBookings = await consultationStore.allBookings();
  const slots = await consultationStore.slots();

  const total = totalAllowance(entitlement);
  const remaining = remainingAllowance(entitlement, mine);
  const open = bookableSlots(slots, allBookings, now).map((slot) => ({
    id: slot.id,
    label: slotLabel(slot.startsAt, slot.minutes),
  }));

  const withSlots = mine
    .map((booking) => ({ booking, slot: slots.find((s) => s.id === booking.slotId) }))
    .filter((row) => row.slot)
    .sort((a, b) => a.slot!.startsAt.localeCompare(b.slot!.startsAt));

  /*
   * À venir et passées, séparées : une séance passée ne s'annule plus, elle se
   * relit. C'est là que vit le compte rendu (CDC §31) — et tant qu'il n'est pas
   * rédigé, la séance le dit, plutôt que de disparaître de l'écran comme si
   * elle n'avait pas eu lieu.
   */
  const upcoming = withSlots.filter((row) => Date.parse(row.slot!.startsAt) > now.getTime());
  const past = withSlots
    .filter((row) => Date.parse(row.slot!.startsAt) <= now.getTime())
    .reverse(); // la plus récente d'abord : c'est elle qu'on vient relire

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
        {consultations.title}
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
        {consultations.intro}
      </p>

      {/* Le solde est toujours affiché : ne pas le montrer laisserait croire
          qu'il n'y en a pas, ce qui est la promesse d'illimité en creux. */}
      <div
        style={{
          display: "inline-block",
          marginTop: 24,
          padding: "16px 22px",
          border: `1px solid ${total > 0 ? colors.gold : alpha.cardGridGap}`,
        }}
      >
        <span
          style={{
            display: "block",
            fontFamily: fonts.sans,
            fontSize: "0.66rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: colors.goldText,
          }}
        >
          {consultations.allowanceLabel}
        </span>
        <span
          style={{
            display: "block",
            fontFamily: fonts.serif,
            fontSize: "1.5rem",
            margin: "8px 0 0",
            color: colors.navy900,
          }}
        >
          {consultations.allowanceOf(remaining, total)}
        </span>
      </div>

      {total === 0 && (
        <Notice title={consultations.noAllowanceTitle} body={consultations.noAllowanceBody} />
      )}
      {total > 0 && open.length === 0 && (
        <Notice title={consultations.noSlotsTitle} body={consultations.noSlotsBody} />
      )}

      {upcoming.length > 0 && (
        <section style={{ marginTop: 44 }}>
          <SectionTitle>{consultations.upcoming}</SectionTitle>
          <ul style={{ listStyle: "none", margin: "14px 0 0", padding: 0 }}>
            {upcoming.map(({ booking, slot }) => (
              <li
                key={booking.id}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "12px 0",
                  borderTop: `1px solid ${alpha.cardGridGap}`,
                  fontFamily: fonts.sans,
                  fontSize: "0.88rem",
                  color: colors.navy900,
                }}
              >
                <span>
                  {CONSULTATIONS[booking.type].name}
                  <span style={{ color: colors.slate }}>
                    {" · "}
                    {slotLabel(slot!.startsAt, slot!.minutes)}
                  </span>
                </span>
                <CancelButton bookingId={booking.id} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {past.length > 0 && (
        <section style={{ marginTop: 44 }}>
          <SectionTitle>{consultations.pastTitle}</SectionTitle>
          <ul style={{ listStyle: "none", margin: "14px 0 0", padding: 0 }}>
            {past.map(({ booking, slot }) => (
              <li
                key={booking.id}
                style={{
                  padding: "16px 0",
                  borderTop: `1px solid ${alpha.cardGridGap}`,
                  fontFamily: fonts.sans,
                  fontSize: "0.88rem",
                  color: colors.navy900,
                }}
              >
                <span>
                  {CONSULTATIONS[booking.type].name}
                  <span style={{ color: colors.slate }}>
                    {" · "}
                    {slotLabel(slot!.startsAt, slot!.minutes)}
                  </span>
                </span>
                {booking.summary ? (
                  <div style={{ marginTop: 10, maxWidth: 680 }}>
                    <span
                      style={{
                        display: "block",
                        fontSize: "0.66rem",
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: colors.goldText,
                      }}
                    >
                      {consultations.summaryLabel}
                    </span>
                    {/* Les paragraphes du fondateur, tels qu'écrits : le saut de
                        ligne est sa ponctuation, on ne l'aplatit pas. */}
                    <p
                      style={{
                        fontSize: "0.88rem",
                        lineHeight: 1.75,
                        whiteSpace: "pre-line",
                        margin: "8px 0 0",
                        color: colors.navy900,
                      }}
                    >
                      {booking.summary}
                    </p>
                  </div>
                ) : (
                  <p
                    style={{
                      fontSize: "0.82rem",
                      lineHeight: 1.7,
                      margin: "8px 0 0",
                      color: colors.slate,
                    }}
                  >
                    {consultations.summaryPending}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div style={{ marginTop: 44 }}>
        {CONSULTATION_TYPES.map((type) => {
          const definition = CONSULTATIONS[type];
          return (
            <section
              key={type}
              style={{ padding: "26px 0", borderTop: `1px solid ${alpha.cardGridGap}` }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 12 }}>
                <h2
                  style={{
                    fontFamily: fonts.serif,
                    fontWeight: 400,
                    fontSize: "1.2rem",
                    margin: 0,
                    color: colors.navy900,
                  }}
                >
                  {definition.name}
                </h2>
                <span style={{ fontFamily: fonts.sans, fontSize: "0.75rem", color: colors.goldText }}>
                  {consultations.duration(definition.minutes)}
                </span>
              </div>

              <ScopeList title={consultations.covers} items={definition.covers} />
              <ScopeList title={consultations.excludes} items={definition.excludes} muted />

              <BookingForm
                type={type}
                slots={open}
                disabled={remaining <= 0}
              />
            </section>
          );
        })}
      </div>

      <p
        style={{
          fontFamily: fonts.sans,
          fontSize: "0.8rem",
          lineHeight: 1.75,
          margin: "36px 0 0",
          maxWidth: 640,
          color: colors.slate,
        }}
      >
        {consultations.noticeNote}
      </p>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontFamily: fonts.sans,
        fontSize: "0.7rem",
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: colors.goldText,
        margin: 0,
      }}
    >
      {children}
    </h2>
  );
}

function ScopeList({
  title,
  items,
  muted,
}: {
  title: string;
  items: string[];
  muted?: boolean;
}) {
  return (
    <div style={{ marginTop: 16 }}>
      <span
        style={{
          display: "block",
          fontFamily: fonts.sans,
          fontSize: "0.66rem",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: muted ? colors.slate : colors.goldText,
        }}
      >
        {title}
      </span>
      <ul style={{ margin: "8px 0 0", padding: "0 0 0 18px" }}>
        {items.map((item) => (
          <li
            key={item}
            style={{
              fontFamily: fonts.sans,
              fontSize: "0.87rem",
              lineHeight: 1.8,
              color: muted ? colors.slate : colors.navy900,
            }}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Notice({ title, body }: { title: string; body: string }) {
  return (
    <div style={{ marginTop: 24, padding: "16px 20px", border: `1px solid ${colors.gold}`, maxWidth: 680 }}>
      <SectionTitle>{title}</SectionTitle>
      <p
        style={{
          fontFamily: fonts.sans,
          fontSize: "0.86rem",
          lineHeight: 1.75,
          margin: "10px 0 0",
          color: colors.navy900,
        }}
      >
        {body}
      </p>
    </div>
  );
}
