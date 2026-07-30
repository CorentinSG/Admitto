"use client";

import { useState, useTransition } from "react";
import { colors, fonts, alpha } from "@/design/tokens";
import { AMBITIONS, SCHOOL_STATUSES, MAX_NOTES_LENGTH } from "@/lib/schools/types";
import type { Ambition, SchoolStatus } from "@/lib/schools/types";
import {
  AMBITION_HINTS,
  AMBITION_LABELS,
  STATUS_LABELS,
  ecoles,
} from "@/content/ecoles";
import { addSchool, removeSchool, updateSchool } from "./actions";

/**
 * Vue d'une école, dates déjà formatées côté serveur.
 *
 * Même règle que `DocumentView` : aucun composant client ne formate de date.
 * Le serveur formate en UTC, le navigateur dans le fuseau de l'utilisateur ; à
 * cheval sur minuit les deux rendus divergent et React régénère l'arbre.
 * `deadlineValue` est la valeur brute `AAAA-MM-JJ` du champ date, qui n'est
 * pas un affichage et ne dépend d'aucun fuseau.
 */
export interface SchoolView {
  id: string;
  name: string;
  ambition: Ambition;
  status: SchoolStatus;
  deadlineLabel: string;
  deadlineValue: string;
  notes: string;
  fromPartnership: boolean;
}

export interface CandidateView {
  partnershipId: string;
  name: string;
  place: string;
  tuitionDisplay: string | null;
  deadlineLabel: string | null;
  deadlineValue: string;
  officialLink: string | null;
  confirmed: boolean;
}

const field = {
  fontFamily: fonts.sans,
  fontSize: "0.88rem",
  padding: "9px 11px",
  color: colors.navy900,
  backgroundColor: colors.ivory,
  border: `1px solid ${alpha.cardGridGap}`,
} as const;

const label = {
  display: "block",
  fontFamily: fonts.sans,
  fontSize: "0.72rem",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: colors.gold,
  marginBottom: 6,
} as const;

const body = {
  fontFamily: fonts.sans,
  fontSize: "0.88rem",
  lineHeight: 1.75,
  color: colors.slate,
  margin: 0,
} as const;

function ErrorLine({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p style={{ ...body, color: colors.navy900, marginTop: 10 }} role="alert">
      {message}
    </p>
  );
}

/** Une école de la liste : classement et avancement modifiables sur place. */
function SchoolRow({ school }: { school: SchoolView }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <li
      style={{
        padding: "20px 0",
        borderTop: `1px solid ${alpha.cardGridGap}`,
        opacity: school.status === "DISCARDED" ? 0.55 : 1,
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 12 }}>
        <h3
          style={{
            fontFamily: fonts.serif,
            fontWeight: 400,
            fontSize: "1.15rem",
            margin: 0,
            color: colors.navy900,
          }}
        >
          {school.name}
        </h3>
        {school.fromPartnership ? (
          <span
            style={{
              fontFamily: fonts.sans,
              fontSize: "0.68rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              padding: "3px 9px",
              color: colors.gold,
              backgroundColor: alpha.goldBadgeBg,
            }}
          >
            {ecoles.list.fromPartnership}
          </span>
        ) : null}
        <span style={{ ...body, fontSize: "0.8rem" }}>
          {ecoles.list.deadline} : {school.deadlineLabel || ecoles.list.noDeadline}
        </span>
      </div>

      <form
        action={(formData) =>
          startTransition(async () => {
            setError(null);
            const result = await updateSchool(school.id, formData);
            if (result?.error) setError(result.error);
          })
        }
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 14,
          marginTop: 14,
        }}
        className="school-grid"
      >
        <div>
          <label style={label} htmlFor={`ambition-${school.id}`}>
            {ecoles.add.ambition}
          </label>
          <select
            id={`ambition-${school.id}`}
            name="ambition"
            defaultValue={school.ambition}
            style={{ ...field, width: "100%" }}
          >
            {AMBITIONS.map((ambition) => (
              <option key={ambition} value={ambition}>
                {AMBITION_LABELS[ambition]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={label} htmlFor={`status-${school.id}`}>
            {ecoles.add.status}
          </label>
          <select
            id={`status-${school.id}`}
            name="status"
            defaultValue={school.status}
            style={{ ...field, width: "100%" }}
          >
            {SCHOOL_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={label} htmlFor={`deadline-${school.id}`}>
            {ecoles.add.deadline}
          </label>
          <input
            id={`deadline-${school.id}`}
            name="deadline"
            type="date"
            defaultValue={school.deadlineValue}
            style={{ ...field, width: "100%" }}
          />
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label style={label} htmlFor={`notes-${school.id}`}>
            {ecoles.add.notes}
          </label>
          <textarea
            id={`notes-${school.id}`}
            name="notes"
            rows={2}
            maxLength={MAX_NOTES_LENGTH}
            defaultValue={school.notes}
            style={{ ...field, width: "100%", resize: "vertical" }}
          />
        </div>

        <div style={{ gridColumn: "1 / -1", display: "flex", gap: 14, flexWrap: "wrap" }}>
          <button
            type="submit"
            disabled={pending}
            // Nom accessible discriminant : sans l'école, tous les boutons
            // « Enregistrer » de la page portent le même nom et une
            // vérification ne peut plus désigner celui qu'elle veut.
            aria-label={`Enregistrer — ${school.name}`}
            style={{
              fontFamily: fonts.sans,
              fontSize: "0.8rem",
              letterSpacing: "0.08em",
              padding: "10px 22px",
              color: colors.navy900,
              backgroundColor: "transparent",
              border: `1px solid ${colors.gold}`,
              cursor: pending ? "wait" : "pointer",
            }}
          >
            Enregistrer
          </button>

          <button
            type="button"
            disabled={pending}
            aria-label={`${ecoles.list.remove} — ${school.name}`}
            onClick={() =>
              startTransition(async () => {
                setError(null);
                const result = await removeSchool(school.id);
                if (result?.error) setError(result.error);
              })
            }
            style={{
              fontFamily: fonts.sans,
              fontSize: "0.8rem",
              letterSpacing: "0.08em",
              padding: "10px 22px",
              color: colors.slate,
              backgroundColor: "transparent",
              border: `1px solid ${alpha.cardGridGap}`,
              cursor: pending ? "wait" : "pointer",
            }}
          >
            {ecoles.list.remove}
          </button>
        </div>
      </form>

      <ErrorLine message={error} />
    </li>
  );
}

/** Ajout manuel d'une école qui ne vient d'aucun accord. */
function AddForm() {
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) =>
        startTransition(async () => {
          setError(null);
          const result = await addSchool(formData);
          if (result?.error) {
            setError(result.error);
            return;
          }
          setName("");
        })
      }
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
        gap: 14,
        marginTop: 18,
      }}
      className="school-grid"
    >
      <div style={{ gridColumn: "1 / -1" }}>
        <label style={label} htmlFor="new-name">
          {ecoles.add.name}
        </label>
        <input
          id="new-name"
          name="name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          style={{ ...field, width: "100%" }}
        />
      </div>

      <div>
        <label style={label} htmlFor="new-ambition">
          {ecoles.add.ambition}
        </label>
        <select id="new-ambition" name="ambition" defaultValue="TARGET" style={{ ...field, width: "100%" }}>
          {AMBITIONS.map((ambition) => (
            <option key={ambition} value={ambition}>
              {AMBITION_LABELS[ambition]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label style={label} htmlFor="new-status">
          {ecoles.add.status}
        </label>
        <select
          id="new-status"
          name="status"
          defaultValue="CONSIDERING"
          style={{ ...field, width: "100%" }}
        >
          {SCHOOL_STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label style={label} htmlFor="new-deadline">
          {ecoles.add.deadline}
        </label>
        <input id="new-deadline" name="deadline" type="date" style={{ ...field, width: "100%" }} />
      </div>

      <div style={{ gridColumn: "1 / -1" }}>
        <label style={label} htmlFor="new-notes">
          {ecoles.add.notes}
        </label>
        <textarea
          id="new-notes"
          name="notes"
          rows={2}
          maxLength={MAX_NOTES_LENGTH}
          placeholder={ecoles.add.notesHint}
          style={{ ...field, width: "100%", resize: "vertical" }}
        />
      </div>

      <div style={{ gridColumn: "1 / -1" }}>
        <button
          type="submit"
          disabled={pending}
          style={{
            fontFamily: fonts.sans,
            fontSize: "0.82rem",
            letterSpacing: "0.08em",
            padding: "12px 26px",
            color: colors.navy900,
            backgroundColor: "transparent",
            border: `1px solid ${colors.gold}`,
            cursor: pending ? "wait" : "pointer",
          }}
        >
          {ecoles.add.submit}
        </button>
        <ErrorLine message={error} />
      </div>
    </form>
  );
}

/** Un accord proposé : ajouté en un geste, sans classement pré-rempli. */
function CandidateRow({ candidate }: { candidate: CandidateView }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <li style={{ padding: "18px 0", borderTop: `1px solid ${alpha.cardGridGap}` }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 10 }}>
        <span
          style={{
            fontFamily: fonts.serif,
            fontSize: "1.05rem",
            color: colors.navy900,
          }}
        >
          {candidate.name}
        </span>
        {candidate.place ? <span style={{ ...body, fontSize: "0.8rem" }}>{candidate.place}</span> : null}
        {!candidate.confirmed ? (
          <span
            style={{
              fontFamily: fonts.sans,
              fontSize: "0.68rem",
              letterSpacing: "0.1em",
              padding: "3px 9px",
              color: colors.gold,
              backgroundColor: alpha.goldBadgeBg,
            }}
          >
            {ecoles.candidates.toConfirm}
          </span>
        ) : null}
      </div>

      {candidate.tuitionDisplay ? (
        <p style={{ ...body, fontSize: "0.82rem", marginTop: 6 }}>
          {ecoles.candidates.tuitionLabel} : {candidate.tuitionDisplay}
        </p>
      ) : null}
      {candidate.deadlineLabel ? (
        <p style={{ ...body, fontSize: "0.82rem" }}>
          {ecoles.candidates.deadlineLabel} : {candidate.deadlineLabel}
        </p>
      ) : null}

      <form
        action={(formData) =>
          startTransition(async () => {
            setError(null);
            const result = await addSchool(formData);
            if (result?.error) setError(result.error);
          })
        }
        style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: 12, marginTop: 12 }}
      >
        <input type="hidden" name="name" value={candidate.name} />
        <input type="hidden" name="partnershipId" value={candidate.partnershipId} />
        <input type="hidden" name="deadline" value={candidate.deadlineValue} />
        <input type="hidden" name="status" value="CONSIDERING" />

        <div>
          <label style={label} htmlFor={`cand-ambition-${candidate.partnershipId}`}>
            {ecoles.add.ambition}
          </label>
          <select
            id={`cand-ambition-${candidate.partnershipId}`}
            name="ambition"
            defaultValue="TARGET"
            style={field}
          >
            {AMBITIONS.map((ambition) => (
              <option key={ambition} value={ambition}>
                {AMBITION_LABELS[ambition]}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={pending}
          aria-label={`${ecoles.candidates.add} — ${candidate.name}`}
          style={{
            fontFamily: fonts.sans,
            fontSize: "0.8rem",
            letterSpacing: "0.08em",
            padding: "10px 22px",
            color: colors.navy900,
            backgroundColor: "transparent",
            border: `1px solid ${colors.gold}`,
            cursor: pending ? "wait" : "pointer",
          }}
        >
          {ecoles.candidates.add}
        </button>

        {candidate.officialLink ? (
          <a
            href={candidate.officialLink}
            target="_blank"
            rel="noreferrer noopener"
            style={{
              fontFamily: fonts.sans,
              fontSize: "0.8rem",
              color: colors.gold,
              textDecoration: "none",
            }}
          >
            {ecoles.candidates.officialLink} ↗
          </a>
        ) : null}
      </form>

      <ErrorLine message={error} />
    </li>
  );
}

export function SchoolBoard({
  schools,
  candidates,
}: {
  schools: SchoolView[];
  candidates: CandidateView[];
}) {
  const heading = {
    fontFamily: fonts.serif,
    fontWeight: 400,
    fontSize: "1.3rem",
    margin: "0 0 8px",
    color: colors.navy900,
  } as const;

  return (
    <>
      <section style={{ marginTop: 36 }}>
        <h2 style={heading}>{ecoles.list.title}</h2>
        {schools.length === 0 ? (
          <p style={body}>{ecoles.list.empty}</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: "8px 0 0" }}>
            {schools.map((school) => (
              <SchoolRow key={school.id} school={school} />
            ))}
          </ul>
        )}
      </section>

      <section style={{ marginTop: 44 }}>
        <h2 style={heading}>{ecoles.add.title}</h2>
        <AddForm />
      </section>

      <section style={{ marginTop: 44 }}>
        <h2 style={heading}>{ecoles.candidates.title}</h2>
        <p style={body}>{ecoles.candidates.intro}</p>
        {candidates.length === 0 ? (
          <p style={{ ...body, marginTop: 12 }}>{ecoles.candidates.empty}</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: "12px 0 0" }}>
            {candidates.map((candidate) => (
              <CandidateRow key={candidate.partnershipId} candidate={candidate} />
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

export { AMBITION_HINTS };
