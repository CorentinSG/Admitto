"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { colors, fonts, alpha, gradients } from "@/design/tokens";
import { SCREENS, intro, ui } from "@/content/diagnostic";
import { CAREER_GOAL, type Answers, type ScreenId } from "@/lib/questionnaire/types";
import { careerGoalOptions, visibleScreens } from "@/lib/questionnaire/visibility";
import { clearDraft, readDraft, writeDraft, type Draft } from "@/lib/questionnaire/draft";
import { submitQuestionnaire } from "./actions";
import { track } from "@/lib/analytics/track";

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

  /**
   * Brouillon local (voir `lib/questionnaire/draft.ts`).
   *
   * La lecture vit dans un effet, pas dans l'état initial : le rendu serveur
   * n'a pas de `localStorage`, et un état initial qui en dépend produirait
   * deux arbres différents — React régénère alors la page entière, ce que le
   * reste du produit évite avec soin (dates formatées côté serveur, etc.).
   */
  const [draft, setDraft] = useState<Draft | null>(null);
  useEffect(() => setDraft(readDraft(new Date())), []);

  /*
   * Enregistrement à chaque réponse, une fois commencé seulement : ouvrir la
   * page sans rien répondre ne doit rien écrire.
   */
  useEffect(() => {
    if (started) writeDraft(answers, new Date());
  }, [started, answers]);

  /**
   * Mesure de l'entonnoir (CDC §36) : un compteur par écran atteint, sans
   * aucun identifiant. `currentId` en dépendance et non `index` : deux écrans
   * différents peuvent porter le même index quand la logique conditionnelle
   * en insère un, et c'est l'écran vu qui compte.
   *
   * Un écran n'est compté qu'UNE fois par passage. Revenir en arrière pour
   * corriger une réponse est un geste courant ; sans ce garde-fou, l'écran
   * repasserait au compteur et paraîtrait plus atteint que le précédent. La
   * courbe d'abandon se lit en différences entre écrans successifs : la
   * gonfler ainsi ferait disparaître un abandon réel dans un écart inversé.
   *
   * Le `Set` vit dans le composant, jamais au-delà : ce n'est pas un
   * identifiant, rien n'en sort et il disparaît avec la page.
   */
  const counted = useRef<Set<ScreenId>>(new Set());
  useEffect(() => {
    if (!started) return;
    if (counted.current.has(currentId)) return;
    counted.current.add(currentId);
    track("SCREEN_REACHED", currentId);
  }, [started, currentId]);

  /**
   * Focus sur la question à chaque changement d'écran (WCAG 2.4.3).
   *
   * Répondre fait disparaître le bouton cliqué. Le focus retombait alors sur
   * le `<body>` : au clavier, la tabulation suivante repartait du tout début
   * de la page, et un lecteur d'écran n'annonçait pas la nouvelle question —
   * l'écran changeait sans que rien ne le dise. Le porter sur le titre annonce
   * la question et place la tabulation juste avant ses réponses.
   *
   * L'anneau de focus est CONSERVÉ ici, contrairement à la cible du lien
   * d'évitement : sur un titre il désigne quelque chose de précis, et c'est
   * ce qui montre à quelqu'un qui navigue au clavier où il vient d'atterrir.
   */
  const questionRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (started) questionRef.current?.focus();
  }, [started, currentId]);

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

  /** Départ à neuf : le brouillon est effacé AVANT, pas laissé derrière. */
  function start() {
    track("QUESTIONNAIRE_STARTED");
    clearDraft();
    setDraft(null);
    setStarted(true);
  }

  /**
   * Reprise. L'écran d'arrivée est RECALCULÉ, jamais relu : la logique
   * conditionnelle peut avoir inséré ou retiré un écran depuis
   * l'enregistrement, et un index mémorisé désignerait alors la mauvaise
   * question.
   */
  function resume(saved: Draft) {
    track("QUESTIONNAIRE_STARTED");
    const restored = visibleScreens(saved.answers);
    const first = restored.findIndex((id) => saved.answers[id as keyof Answers] === undefined);
    setAnswers(saved.answers);
    setIndex(first === -1 ? restored.length - 1 : first);
    setStarted(true);
  }

  function submit() {
    setError(null);
    // Le brouillon disparaît à la soumission : le réoffrir à quelqu'un qui a
    // déjà son résultat le renverrait refaire ce qu'il vient de faire. Il est
    // remis en cas d'échec — sinon un serveur momentanément indisponible
    // coûterait le parcours entier.
    clearDraft();
    startTransition(async () => {
      const result = await submitQuestionnaire(answers as Record<string, unknown>);
      // Rien ne peut être mesuré ici : en cas de succès l'action redirige, et
      // `redirect()` lève — le code qui suit ne s'exécute jamais. La soumission
      // est donc comptée dans l'action elle-même (voir actions.ts).
      if (result?.error) {
        setError(result.error);
        writeDraft(answers, new Date());
      }
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
        {/* Un parcours interrompu se reprend, il ne se refait pas. La reprise
            passe devant : c'est ce que veut quelqu'un dont les réponses sont
            là. Repartir de zéro reste offert, sans être le geste par défaut. */}
        {draft && (
          <div style={{ marginTop: 40 }}>
            <button
              type="button"
              onClick={() => resume(draft)}
              style={{
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
              {intro.resume(draft.count)}
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={start}
          style={{
            marginTop: draft ? 20 : 40,
            background: draft ? "none" : gradients.goldButton,
            color: draft ? alpha.whiteCtaText : colors.navy900,
            border: draft ? `1px solid ${alpha.goldBorderFaint}` : "none",
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
            if (!draft) e.currentTarget.style.boxShadow = "0 15px 45px rgba(201, 168, 76, 0.42)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          {draft ? intro.restart : intro.cta}
        </button>
        {draft && (
          <p
            style={{
              fontFamily: fonts.sans,
              fontSize: "0.78rem",
              lineHeight: 1.7,
              margin: "24px 0 0",
              maxWidth: 520,
              color: alpha.whiteDesc,
            }}
          >
            {intro.resumeNote}
          </p>
        )}
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
          ref={questionRef}
          tabIndex={-1}
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
