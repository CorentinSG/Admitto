import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { colors, fonts, alpha } from "@/design/tokens";
import { currentAssessmentId } from "@/lib/auth/current";
import { assessmentStore } from "@/lib/store/assessments";
import { schoolStore } from "@/lib/store/schools";
import { analyseList, sortForDisplay } from "@/lib/schools/balance";
import { candidatesFor } from "@/lib/schools/candidates";
import { AMBITIONS } from "@/lib/schools/types";
import {
  AMBITION_HINTS,
  AMBITION_LABELS,
  OBSERVATION_MESSAGES,
  ecoles,
} from "@/content/ecoles";
import { SchoolBoard, type CandidateView, type SchoolView } from "./SchoolBoard";

export const metadata: Metadata = {
  title: "Votre liste d'écoles — Admitto",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/** Formatage des dates ici, côté serveur : voir le commentaire de `SchoolView`. */
const dateFr = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

/**
 * Sélecteur d'écoles (tâche T-SEL-03).
 *
 * La détection de partenariats est relue depuis le diagnostic enregistré, et
 * non recalculée : le rapport, le coût et cette page doivent parler des mêmes
 * accords. Recalculer ferait diverger la liste proposée ici de celle citée dans
 * le rapport dès le prochain import de la base.
 */
export default async function EcolesPage() {
  const assessmentId = await currentAssessmentId();
  if (!assessmentId) redirect("/diagnostic");

  const assessment = await assessmentStore.get(assessmentId);
  if (!assessment) redirect("/diagnostic");

  const schools = sortForDisplay(await schoolStore.list(assessmentId));
  const balance = analyseList(schools);
  const candidates = candidatesFor(assessment.partnerships, schools);

  const schoolViews: SchoolView[] = schools.map((school) => ({
    id: school.id,
    name: school.name,
    ambition: school.ambition,
    status: school.status,
    deadlineLabel: school.applicationDeadline ? dateFr(school.applicationDeadline) : "",
    deadlineValue: school.applicationDeadline ?? "",
    notes: school.notes ?? "",
    fromPartnership: school.partnershipId !== null,
  }));

  const candidateViews: CandidateView[] = candidates.map((candidate) => ({
    partnershipId: candidate.partnershipId,
    name: candidate.name,
    place: [candidate.city, candidate.state].filter(Boolean).join(", "),
    tuitionDisplay: candidate.tuitionDisplay,
    // La date de l'accord est une chaîne libre de la base source (« early
    // February », « rolling ») : elle est affichée telle quelle et n'alimente
    // le champ date que si elle est déjà au format attendu.
    deadlineLabel: candidate.applicationDeadline,
    deadlineValue: /^\d{4}-\d{2}-\d{2}$/.test(candidate.applicationDeadline ?? "")
      ? candidate.applicationDeadline!
      : "",
    officialLink: candidate.officialLink,
    confirmed: candidate.confirmed,
  }));

  const body = {
    fontFamily: fonts.sans,
    fontSize: "0.92rem",
    lineHeight: 1.8,
    maxWidth: 700,
    margin: 0,
    color: colors.slate,
  } as const;

  return (
    <div>
      <style>{`
@media (max-width: 700px) {
  .school-grid { grid-template-columns: 1fr !important; }
}
`}</style>

      <h1
        style={{
          fontFamily: fonts.serif,
          fontWeight: 300,
          fontSize: "2.1rem",
          margin: 0,
          color: colors.navy900,
        }}
      >
        {ecoles.title}
      </h1>
      <p style={{ ...body, margin: "14px 0 0" }}>{ecoles.intro}</p>

      <section
        style={{
          marginTop: 28,
          padding: "24px 26px",
          border: `1px solid ${alpha.cardGridGap}`,
        }}
      >
        <h2
          style={{
            fontFamily: fonts.serif,
            fontWeight: 400,
            fontSize: "1.3rem",
            margin: "0 0 12px",
            color: colors.navy900,
          }}
        >
          {ecoles.balance.title}
        </h2>

        <p style={body}>{ecoles.balance.counts(balance.active, balance.total)}</p>
        <p style={body}>
          {balance.nextDeadline
            ? ecoles.balance.nextDeadline(
                balance.nextDeadline.name,
                dateFr(balance.nextDeadline.date)
              )
            : ecoles.balance.noDeadline}
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 26, marginTop: 16 }}>
          {AMBITIONS.map((ambition) => (
            <div key={ambition} title={AMBITION_HINTS[ambition]}>
              <span
                style={{
                  display: "block",
                  fontFamily: fonts.serif,
                  fontSize: "1.8rem",
                  color: colors.navy900,
                }}
              >
                {balance.byAmbition[ambition]}
              </span>
              <span
                style={{
                  fontFamily: fonts.sans,
                  fontSize: "0.72rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: colors.gold,
                }}
              >
                {AMBITION_LABELS[ambition]}
              </span>
            </div>
          ))}
        </div>

        {balance.observations.length > 0 ? (
          <ul style={{ margin: "20px 0 0", paddingLeft: 20 }}>
            {balance.observations.map((observation) => (
              <li key={observation.kind} style={{ ...body, marginBottom: 8 }}>
                {OBSERVATION_MESSAGES[observation.kind](observation.detail)}
              </li>
            ))}
          </ul>
        ) : null}

        <p style={{ ...body, fontSize: "0.82rem", marginTop: 18, color: colors.slate }}>
          {ecoles.balance.disclaimer}
        </p>
      </section>

      <SchoolBoard schools={schoolViews} candidates={candidateViews} />
    </div>
  );
}
