"use client";

import { useState, useTransition } from "react";
import { colors, fonts, alpha, gradients } from "@/design/tokens";
import { SCREENS, intro, ui } from "@/content/diagnostic";
import { CAREER_GOAL, type Answers, type ScreenId } from "@/lib/questionnaire/types";
import { careerGoalOptions, visibleScreens } from "@/lib/questionnaire/visibility";
import { submitQuestionnaire } from "./actions";

/**
 * Questionnaire — une question par écran, douze écrans visibles au maximum,
 * barre de progression, réponses par boutons (CDC §12.2).
 *
 * Animations : la transition entre écrans réutilise la cadence du hero
 * (opacity + translateY, 0,8 s ease). Aucun nouveau motif d'animation n'est
 * introduit — contrat design PLAN.md §3.
 */
export function Questionnaire() {
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<Answers>({});
  const [index, setIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const screens = visibleScreens(answers);
  const currentId: ScreenId = screens[Math.min(index, screens.length - 1)];
  const screen = SCREENS.find((s) => s.id === currentId)!;
  const isLast = index >= screens.length - 1;

  const options =
    currentId === "careerGoal"
      ? careerGoalOptions(answers, CAREER_GOAL).map(
          (value) => screen.options.find((o) => o.value === value)!
        )
      : screen.options;

  function choose(value: string) {
    setAnswers((prev) => ({ ...prev, [currentId]: value }));
    // Laisse voir la sélection avant d'enchaîner.
    setTimeout(() => setIndex((i) => Math.min(i + 1, screens.length - 1)), 180);
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await submitQuestionnaire(answers as Record<string, unknown>);
      if (result?.error) setError(result.error);
    });
  }

  if (!started) {
    return (
      <div style={{ maxWidth: 640 }}>
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
          {intro.badge}
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
          {intro.title}
        </h1>
        <p
          style={{
            fontFamily: fonts.sans,
            fontSize: "1rem",
            lineHeight: 1.75,
            margin: "24px 0 0",
            color: alpha.whiteCtaText,
          }}
        >
          {intro.body}
        </p>
        <button
          type="button"
          onClick={() => setStarted(true)}
          style={{
            marginTop: 40,
            background: gradients.goldButton,
            color: colors.navy900,
            border: "none",
            padding: "18px 44px",
            fontSize: "0.88rem",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            fontFamily: fonts.sans,
            cursor: "pointer",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 15px 45px rgba(201, 168, 76, 0.42)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          {intro.cta}
        </button>
        <p
          style={{
            fontFamily: fonts.sans,
            fontSize: "0.78rem",
            lineHeight: 1.7,
            margin: "40px 0 0",
            maxWidth: 520,
            color: alpha.whiteDesc,
          }}
        >
          {intro.legal}
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680, width: "100%" }}>
      {/* Barre de progression */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span
          style={{
            fontFamily: fonts.sans,
            fontSize: "0.7rem",
            letterSpacing: "0.16em",
            color: colors.gold,
            whiteSpace: "nowrap",
          }}
        >
          {ui.stepLabel(index + 1, screens.length)}
        </span>
        <span
          style={{
            flex: 1,
            height: 1,
            backgroundColor: alpha.goldBorderFaint,
            position: "relative",
            display: "block",
          }}
        >
          <span
            style={{
              position: "absolute",
              inset: 0,
              transformOrigin: "left",
              transform: `scaleX(${(index + 1) / screens.length})`,
              background: gradients.goldButton,
              transition: "transform 0.4s ease",
            }}
          />
        </span>
      </div>

      {/* key sur l'écran : remonte le nœud à chaque question, ce qui rejoue la
          cascade d'entrée sans avoir besoin d'un nouveau motif d'animation. */}
      <div key={currentId} style={{ marginTop: 48 }}>
        <h2
          style={{
            fontFamily: fonts.serif,
            fontWeight: 300,
            fontSize: "clamp(1.7rem, 3.2vw, 2.4rem)",
            lineHeight: 1.25,
            margin: 0,
            color: colors.ivory,
          }}
        >
          {screen.question}
        </h2>
        {screen.helper && (
          <p
            style={{
              fontFamily: fonts.sans,
              fontSize: "0.92rem",
              lineHeight: 1.7,
              margin: "14px 0 0",
              color: alpha.whiteDesc,
            }}
          >
            {screen.helper}
          </p>
        )}

        {currentId === "contact" ? (
          <ContactScreen
            answers={answers}
            setAnswers={setAnswers}
            onSubmit={submit}
            pending={pending}
            error={error}
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 36 }}>
            {options.map((option) => {
              const selected = answers[currentId as keyof Answers] === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => choose(option.value)}
                  style={{
                    textAlign: "left",
                    padding: "18px 22px",
                    backgroundColor: selected ? alpha.goldItemHoverBg : alpha.whiteFaint,
                    border: `1px solid ${selected ? alpha.goldBorderHover : alpha.goldBorderFaint}`,
                    color: colors.ivory,
                    fontFamily: fonts.sans,
                    fontSize: "0.95rem",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = alpha.goldItemHoverBg;
                    e.currentTarget.style.borderColor = alpha.goldBorderHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = selected
                      ? alpha.goldItemHoverBg
                      : alpha.whiteFaint;
                    e.currentTarget.style.borderColor = selected
                      ? alpha.goldBorderHover
                      : alpha.goldBorderFaint;
                  }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        )}

        {index > 0 && (
          <button
            type="button"
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            style={{
              marginTop: 32,
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              fontFamily: fonts.sans,
              fontSize: "0.82rem",
              color: alpha.whiteDesc,
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = colors.goldLight;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = alpha.whiteDesc;
            }}
          >
            ← {ui.back}
          </button>
        )}
      </div>

      {isLast && currentId !== "contact" && (
        <button
          type="button"
          onClick={() => setIndex(screens.length - 1)}
          style={{ display: "none" }}
        />
      )}
    </div>
  );
}

function ContactScreen({
  answers,
  setAnswers,
  onSubmit,
  pending,
  error,
}: {
  answers: Answers;
  setAnswers: React.Dispatch<React.SetStateAction<Answers>>;
  onSubmit: () => void;
  pending: boolean;
  error: string | null;
}) {
  const inputStyle = {
    width: "100%",
    padding: "16px 18px",
    backgroundColor: alpha.whiteFaint,
    border: `1px solid ${alpha.goldBorderFaint}`,
    color: colors.ivory,
    fontFamily: fonts.sans,
    fontSize: "0.95rem",
    outline: "none",
  } as const;

  return (
    <div style={{ marginTop: 36, display: "flex", flexDirection: "column", gap: 14 }}>
      <p
        style={{
          fontFamily: fonts.sans,
          fontSize: "0.88rem",
          lineHeight: 1.7,
          margin: 0,
          paddingLeft: 16,
          borderLeft: `1px solid ${colors.gold}`,
          color: alpha.whiteCtaText,
        }}
      >
        {ui.deliverable}
      </p>

      <input
        type="text"
        placeholder={ui.firstName}
        value={answers.firstName ?? ""}
        onChange={(e) => setAnswers((p) => ({ ...p, firstName: e.target.value }))}
        style={inputStyle}
      />
      <input
        type="email"
        placeholder={ui.email}
        value={answers.email ?? ""}
        onChange={(e) => setAnswers((p) => ({ ...p, email: e.target.value }))}
        style={inputStyle}
      />
      <textarea
        placeholder={ui.optionalComment}
        value={answers.comment ?? ""}
        maxLength={800}
        onChange={(e) => setAnswers((p) => ({ ...p, comment: e.target.value }))}
        style={{ ...inputStyle, minHeight: 110, resize: "vertical" }}
      />

      {/* Consentement marketing (CDC §34) : distinct des emails d'exécution du
          service, facultatif, et jamais pré-coché. */}
      <label
        style={{
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
          fontFamily: fonts.sans,
          fontSize: "0.84rem",
          lineHeight: 1.6,
          color: alpha.whiteDesc,
          cursor: "pointer",
        }}
      >
        <input
          type="checkbox"
          checked={answers.consentMarketing === true}
          onChange={(e) => setAnswers((p) => ({ ...p, consentMarketing: e.target.checked }))}
          style={{ marginTop: 3, accentColor: colors.gold, flexShrink: 0 }}
        />
        <span>
          {ui.consentLabel}
          <span style={{ display: "block", marginTop: 4, opacity: 0.75 }}>{ui.consentNote}</span>
        </span>
      </label>

      {error && (
        <p style={{ fontFamily: fonts.sans, fontSize: "0.85rem", margin: 0, color: colors.goldLight }}>
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={onSubmit}
        disabled={pending}
        style={{
          marginTop: 10,
          background: gradients.goldButton,
          color: colors.navy900,
          border: "none",
          padding: "18px 44px",
          fontSize: "0.88rem",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          fontFamily: fonts.sans,
          cursor: pending ? "progress" : "pointer",
          opacity: pending ? 0.7 : 1,
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
      >
        {pending ? ui.submitting : ui.submit}
      </button>
    </div>
  );
}
