import Link from "next/link";
import type { Metadata } from "next";
import { colors, fonts, alpha } from "@/design/tokens";
import { consultationStore } from "@/lib/store/consultations";
import { assessmentStore } from "@/lib/store/assessments";
import { CONSULTATIONS } from "@/lib/consultations/types";
import { remainingAllowance, totalAllowance } from "@/lib/consultations/booking";
import { adminConsultations } from "@/content/consultations";
import { CloseSlotButton, GrantForm, OpenSlotForm } from "./SlotControls";
// Le MÊME libellé que la page du client : deux formatages divergeraient, et le
// créneau ouvert ici cesserait de correspondre à celui qui est lu là-bas.
import { slotLabel } from "@/lib/consultations/time";

export const metadata: Metadata = {
  title: "Consultations — Admitto",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";


/** Back-office — gestion des consultations (CDC §31 et §33). */
export default async function AdminConsultationsPage() {
  const slots = await consultationStore.slots();
  const bookings = await consultationStore.allBookings();
  const assessments = await assessmentStore.all();

  const people = await Promise.all(
    assessments.map(async (assessment) => {
      const entitlement = await consultationStore.entitlement(assessment.id);
      const mine = bookings.filter((b) => b.assessmentId === assessment.id);
      return {
        assessment,
        entitlement,
        used: mine.length,
        total: totalAllowance(entitlement),
        remaining: remainingAllowance(entitlement, mine),
      };
    })
  );

  return (
    <div>
      <Link
        href="/admin"
        style={{ fontFamily: fonts.sans, fontSize: "0.8rem", color: colors.slate, textDecoration: "none" }}
      >
        ← Retour à la file
      </Link>

      <h1
        style={{
          fontFamily: fonts.serif,
          fontWeight: 300,
          fontSize: "2.1rem",
          margin: "20px 0 0",
          color: colors.navy900,
        }}
      >
        {adminConsultations.title}
      </h1>
      <p
        style={{
          fontFamily: fonts.sans,
          fontSize: "0.88rem",
          lineHeight: 1.75,
          maxWidth: 680,
          margin: "10px 0 0",
          color: colors.slate,
        }}
      >
        {adminConsultations.intro}
      </p>

      <Section title={`${adminConsultations.slotsTitle} (${slots.length})`}>
        <OpenSlotForm />
        {slots.length === 0 ? (
          <Empty>{adminConsultations.noSlots}</Empty>
        ) : (
          <ul style={{ listStyle: "none", margin: "20px 0 0", padding: 0 }}>
            {slots.map((slot) => {
              const taken = bookings.some((b) => b.slotId === slot.id);
              return (
                <li
                  key={slot.id}
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "11px 0",
                    borderTop: `1px solid ${alpha.cardGridGap}`,
                    fontFamily: fonts.sans,
                    fontSize: "0.86rem",
                    color: colors.navy900,
                  }}
                >
                  <span>
                    {slotLabel(slot.startsAt, slot.minutes)}
                    <span style={{ color: taken ? colors.goldText : colors.slate }}>
                      {" · "}
                      {taken ? adminConsultations.slotTaken : adminConsultations.slotFree}
                    </span>
                  </span>
                  {!taken && <CloseSlotButton slotId={slot.id} />}
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      <Section title={`${adminConsultations.bookingsTitle} (${bookings.length})`}>
        {bookings.length === 0 ? (
          <Empty>{adminConsultations.noBookings}</Empty>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {bookings.map((booking) => {
              const slot = slots.find((s) => s.id === booking.slotId);
              const person = assessments.find((a) => a.id === booking.assessmentId);
              return (
                <li
                  key={booking.id}
                  style={{
                    padding: "11px 0",
                    borderTop: `1px solid ${alpha.cardGridGap}`,
                    fontFamily: fonts.sans,
                    fontSize: "0.86rem",
                    color: colors.navy900,
                  }}
                >
                  {CONSULTATIONS[booking.type].name}
                  <span style={{ color: colors.slate }}>
                    {" · "}
                    {person?.answers.firstName ?? "—"} ({person?.answers.email ?? "—"})
                    {slot ? ` · ${slotLabel(slot.startsAt, slot.minutes)}` : " · créneau retiré"}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      <Section title={adminConsultations.entitlementTitle}>
        <p
          style={{
            fontFamily: fonts.sans,
            fontSize: "0.82rem",
            lineHeight: 1.7,
            margin: "0 0 18px",
            maxWidth: 640,
            color: colors.slate,
          }}
        >
          {adminConsultations.entitlementHelp}
        </p>
        {people.map(({ assessment, entitlement, used, total, remaining }) => (
          <div
            key={assessment.id}
            style={{ padding: "14px 0", borderTop: `1px solid ${alpha.cardGridGap}` }}
          >
            <span
              style={{
                display: "block",
                fontFamily: fonts.sans,
                fontSize: "0.86rem",
                marginBottom: 8,
                color: colors.navy900,
              }}
            >
              {assessment.answers.firstName ?? "—"}{" "}
              <span style={{ color: colors.slate }}>
                · {assessment.answers.email ?? "—"} · {used} utilisée(s), {remaining} restante(s) sur{" "}
                {total}
              </span>
            </span>
            <GrantForm
              assessmentId={assessment.id}
              offer={entitlement.offer}
              granted={entitlement.granted}
            />
          </div>
        ))}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: 44 }}>
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
        {title}
      </h2>
      <div style={{ marginTop: 14 }}>{children}</div>
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: fonts.sans, fontSize: "0.86rem", margin: "18px 0 0", color: colors.slate }}>
      {children}
    </p>
  );
}
