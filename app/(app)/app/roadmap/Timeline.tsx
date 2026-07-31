"use client";

import { useState } from "react";
import Link from "next/link";
import { colors, fonts, alpha } from "@/design/tokens";
import { useInView } from "@/design/animations";
import type { TimelineState } from "@/lib/roadmap/timeline";
import { dashboard } from "@/content/dashboard";

/**
 * Timeline interactive du parcours (CDC §22).
 *
 * Un axe de temps, du départ à la dernière échéance : ce qui est derrière
 * (accompli ou en retard), le repère « aujourd'hui », ce qui approche, ce qui
 * est loin. Elle avance TOUTE SEULE : l'état vient des statuts de la feuille
 * de route — cocher une tâche en bas la remplit ici, il n'existe pas de
 * second état à désynchroniser.
 *
 * Toutes les dates arrivent déjà formatées du serveur (règle du dépôt : aucun
 * composant client ne formate de date). Le client ne gère que la sélection.
 *
 * Interdits respectés : aucune librairie d'animation, `pulse-gold` est l'une
 * des quatre keyframes officielles, pas d'animation de sortie — une pastille
 * remplie ne se vide jamais sous les yeux.
 *
 * Révélation : `useInView` one-shot, `ease` uniquement, opacity + translateY —
 * la primitive du site. La chorégraphie raconte l'axe dans l'ordre où il se
 * lit : le rail, puis le chemin parcouru qui SE REMPLIT jusqu'à aujourd'hui,
 * puis les marqueurs en cascade gauche → droite (l'ordre du temps), enfin la
 * légende et le détail. `prefers-reduced-motion` est géré globalement.
 */

export interface TimelinePointView {
  id: string;
  title: string;
  state: TimelineState;
  position: number;
  /** « 12 mars 2027 » — formaté côté serveur. */
  dateLabel: string;
  /** « dans 23 jours » / « en retard de 12 jours » — formaté côté serveur. */
  leftLabel: string;
  statusLabel: string;
  delayRisk: string;
  toolHref?: string;
  toolLabel?: string;
}

export interface TimelineDeadlineView {
  key: string;
  label: string;
  note: string;
  position: number;
  dateLabel: string;
  leftLabel: string;
  passed: boolean;
}

export interface TimelineView {
  points: TimelinePointView[];
  /** Échéances officielles du diagnostic — losanges au-dessus du rail. */
  deadlines: TimelineDeadlineView[];
  /** Les prochaines tâches non entamées — références aux points de l'axe. */
  toStart: TimelinePointView[];
  todayPosition: number;
  ticks: Array<{ label: string; position: number }>;
  doneCount: number;
  totalCount: number;
  /** Phrase déjà rédigée côté serveur, vide si toutes les tâches sont datées. */
  undatedNote: string;
}

/** Ce que chaque état dit à l'œil — la légende reprend exactement ces mots. */
const STATE_STYLES: Record<
  TimelineState,
  { fill: string; border: string; label: string; pulse?: boolean }
> = {
  DONE: { fill: colors.gold, border: colors.gold, label: "Accompli" },
  OVERDUE: { fill: colors.navy900, border: colors.navy900, label: "En retard" },
  URGENT: { fill: colors.ivory, border: colors.gold, label: "Approche", pulse: true },
  IN_PROGRESS: { fill: alpha.goldBadgeBg, border: colors.gold, label: "En cours" },
  UPCOMING: { fill: colors.ivory, border: alpha.cardNumIdle, label: "À venir" },
};

const LEGEND: TimelineState[] = ["DONE", "IN_PROGRESS", "URGENT", "UPCOMING", "OVERDUE"];

export function Timeline({ view }: { view: TimelineView }) {
  // La première tâche non accomplie est présélectionnée : c'est celle que la
  // personne vient chercher — « où j'en suis, que faire ensuite ».
  const first = view.points.find((point) => point.state !== "DONE") ?? view.points[0];
  const [selectedId, setSelectedId] = useState<string | null>(first?.id ?? null);
  const selected = view.points.find((point) => point.id === selectedId) ?? null;
  // Préfixe « D: » : une échéance sélectionnée ne peut pas entrer en collision
  // avec un identifiant de tâche.
  const selectedDeadline =
    view.deadlines.find((deadline) => `D:${deadline.key}` === selectedId) ?? null;

  const [sectionRef, inView] = useInView(0.15);

  // Deux marqueurs le même jour occupent le même point de l'axe : sans étage,
  // l'un recouvre l'autre et intercepte ses clics — trouvé en essayant de
  // cliquer la seconde de deux échéances du 15 novembre. La position
  // horizontale est du TEMPS et ne doit pas mentir : l'empilement est
  // vertical, jamais un décalage sur l'axe.
  const levelsOf = <T,>(items: T[], positionOf: (item: T) => number): Map<T, number> => {
    const seen = new Map<number, number>();
    const levels = new Map<T, number>();
    for (const item of items) {
      const at = positionOf(item);
      const level = seen.get(at) ?? 0;
      levels.set(item, level);
      seen.set(at, level + 1);
    }
    return levels;
  };
  const deadlineLevels = levelsOf(view.deadlines, (d) => d.position);
  const pointLevels = levelsOf(view.points, (p) => p.position);

  // La cascade suit l'ordre du temps : un marqueur apparaît d'autant plus tard
  // qu'il est loin sur l'axe. Dérivé de la POSITION, pas de l'index — deux
  // marqueurs au même endroit apparaissent ensemble.
  const staggerOf = (position: number) => 0.5 + (position / 100) * 0.5;
  const markerReveal = (position: number) => ({
    opacity: inView ? 1 : 0,
    transition: `opacity 0.4s ease ${staggerOf(position)}s`,
  });

  const small = {
    fontFamily: fonts.sans,
    fontSize: "0.75rem",
    color: colors.slate,
  } as const;

  return (
    <section
      ref={sectionRef}
      aria-label="Timeline du parcours"
      style={{
        marginTop: 36,
        padding: "26px 28px 20px",
        border: `1px solid ${alpha.cardGridGap}`,
        backgroundColor: colors.ivory,
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(24px)",
        transition: "opacity 0.8s ease, transform 0.8s ease",
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 14 }}>
        <h2
          style={{
            fontFamily: fonts.serif,
            fontWeight: 400,
            fontSize: "1.3rem",
            margin: 0,
            color: colors.navy900,
          }}
        >
          {dashboard.timeline.title}
        </h2>
        <span style={small}>
          {dashboard.timeline.progress(view.doneCount, view.totalCount)}
        </span>
      </div>

      {/* L'axe déborde horizontalement sur petit écran plutôt que d'écraser
          les positions : le temps ne se compresse pas. */}
      <div style={{ overflowX: "auto", paddingBottom: 6 }}>
        {/* Marges internes : un marqueur à 0 % ou 100 % est centré sur le bord
            de l'axe, sa moitié dépasse — sans elles, elle serait rognée. */}
        <div
          style={{ position: "relative", minWidth: 640, height: 152, margin: "18px 12px 0" }}
        >
          {/* Rail */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 70,
              height: 2,
              backgroundColor: alpha.cardGridGap,
            }}
          />
          {/* Le chemin parcouru SE REMPLIT jusqu'à aujourd'hui : c'est le
              seul mouvement qui raconte quelque chose — le temps déjà
              couvert — et il ne rejoue jamais (one-shot). */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              left: 0,
              width: inView ? `${view.todayPosition}%` : "0%",
              top: 70,
              height: 2,
              backgroundColor: colors.gold,
              transition: "width 0.9s ease 0.2s",
            }}
          />

          {/* Repère du jour — apparaît quand le chemin parcouru l'atteint. */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              left: `${view.todayPosition}%`,
              top: 40,
              transform: "translateX(-50%)",
              textAlign: "center",
              opacity: inView ? 1 : 0,
              transition: "opacity 0.5s ease 1s",
            }}
          >
            <span
              style={{
                ...small,
                display: "block",
                fontSize: "0.62rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: colors.goldText,
                marginBottom: 4,
              }}
            >
              {dashboard.timeline.today}
            </span>
            <span
              style={{
                display: "block",
                width: 1,
                height: 40,
                margin: "0 auto",
                backgroundColor: colors.gold,
              }}
            />
          </div>

          {/* Graduations mensuelles */}
          {view.ticks.map((tick) => (
            <span
              key={tick.label + tick.position}
              aria-hidden
              style={{
                position: "absolute",
                left: `${tick.position}%`,
                top: 134,
                transform: "translateX(-50%)",
                ...small,
                fontSize: "0.66rem",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              {tick.label}
            </span>
          ))}

          {/* Les échéances officielles — losanges au-dessus du rail. Une
              échéance n'est pas une tâche : une tâche est un travail à soi,
              une échéance est une porte qui ferme. */}
          {view.deadlines.map((deadline) => {
            const key = `D:${deadline.key}`;
            const isSelected = key === selectedId;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedId(key)}
                aria-label={`Échéance : ${deadline.label} — ${deadline.dateLabel}`}
                aria-pressed={isSelected}
                title={deadline.label}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateX(-50%) rotate(45deg) scale(1.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateX(-50%) rotate(45deg) scale(1)";
                }}
                style={{
                  position: "absolute",
                  left: `${deadline.position}%`,
                  top: 8 + (deadlineLevels.get(deadline) ?? 0) * 17,
                  transform: "translateX(-50%) rotate(45deg)",
                  width: 11,
                  height: 11,
                  padding: 0,
                  backgroundColor: deadline.passed ? alpha.cardNumIdle : colors.navy900,
                  border: `2px solid ${isSelected ? colors.gold : colors.navy900}`,
                  cursor: "pointer",
                  opacity: markerReveal(deadline.position).opacity,
                  // transform est réservé au survol : l'apparition passe par
                  // l'opacité seule, sinon les deux se disputeraient la propriété.
                  transition: `${markerReveal(deadline.position).transition}, transform 0.2s ease, border-color 0.2s ease`,
                }}
              />
            );
          })}

          {/* Les tâches */}
          {view.points.map((point) => {
            const style = STATE_STYLES[point.state];
            const isSelected = point.id === selectedId;
            return (
              <button
                key={point.id}
                type="button"
                onClick={() => setSelectedId(point.id)}
                aria-label={`${point.title} — ${point.dateLabel}`}
                aria-pressed={isSelected}
                title={point.title}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateX(-50%) scale(1.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateX(-50%) scale(1)";
                }}
                style={{
                  position: "absolute",
                  left: `${point.position}%`,
                  top: 62 + (pointLevels.get(point) ?? 0) * 24,
                  transform: "translateX(-50%)",
                  width: 18,
                  height: 18,
                  padding: 0,
                  borderRadius: "50%",
                  backgroundColor: style.fill,
                  border: `2px solid ${isSelected ? colors.navy900 : style.border}`,
                  cursor: "pointer",
                  animation: style.pulse ? "pulse-gold 2.4s ease infinite" : "none",
                  opacity: markerReveal(point.position).opacity,
                  transition: `${markerReveal(point.position).transition}, transform 0.2s ease, border-color 0.2s ease`,
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Légende — les mêmes mots que les pastilles */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 18px", marginTop: 6 }}>
        {LEGEND.map((state) => {
          const style = STATE_STYLES[state];
          return (
            <span key={state} style={{ ...small, display: "flex", alignItems: "center", gap: 6 }}>
              <span
                aria-hidden
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: style.fill,
                  border: `2px solid ${style.border}`,
                  display: "inline-block",
                }}
              />
              {style.label}
            </span>
          );
        })}
        {view.deadlines.length > 0 ? (
          <span style={{ ...small, display: "flex", alignItems: "center", gap: 6 }}>
            <span
              aria-hidden
              style={{
                width: 8,
                height: 8,
                backgroundColor: colors.navy900,
                transform: "rotate(45deg)",
                display: "inline-block",
              }}
            />
            {dashboard.timeline.deadlineLegend}
          </span>
        ) : null}
      </div>

      {/* Détail de l'échéance sélectionnée */}
      {selectedDeadline ? (
        <div
          style={{
            marginTop: 18,
            paddingTop: 16,
            borderTop: `1px solid ${alpha.cardGridGap}`,
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 12 }}>
            <strong
              style={{
                fontFamily: fonts.sans,
                fontWeight: 500,
                fontSize: "0.95rem",
                color: colors.navy900,
              }}
            >
              {dashboard.timeline.deadlineLegend} — {selectedDeadline.label}
            </strong>
            <span style={{ ...small, color: colors.goldText }}>
              {selectedDeadline.dateLabel} · {selectedDeadline.leftLabel}
            </span>
          </div>
          <p
            style={{
              fontFamily: fonts.sans,
              fontSize: "0.85rem",
              lineHeight: 1.7,
              maxWidth: 700,
              margin: "8px 0 0",
              color: colors.slate,
            }}
          >
            {selectedDeadline.note}
          </p>
        </div>
      ) : null}

      {/* Détail de la tâche sélectionnée */}
      {selected ? (
        <div
          style={{
            marginTop: 18,
            paddingTop: 16,
            borderTop: `1px solid ${alpha.cardGridGap}`,
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 12 }}>
            <strong
              style={{
                fontFamily: fonts.sans,
                fontWeight: 500,
                fontSize: "0.95rem",
                color: colors.navy900,
              }}
            >
              {selected.title}
            </strong>
            <span style={{ ...small, color: colors.goldText }}>
              {selected.dateLabel} · {selected.leftLabel}
            </span>
            <span style={small}>{selected.statusLabel}</span>
          </div>
          <p
            style={{
              fontFamily: fonts.sans,
              fontSize: "0.85rem",
              lineHeight: 1.7,
              maxWidth: 700,
              margin: "8px 0 0",
              color: colors.slate,
            }}
          >
            {selected.delayRisk}
          </p>
          {selected.toolHref && selected.toolLabel ? (
            <Link
              href={selected.toolHref}
              style={{
                display: "inline-block",
                marginTop: 10,
                fontFamily: fonts.sans,
                fontSize: "0.82rem",
                color: colors.goldText,
                textDecoration: "none",
              }}
            >
              {selected.toolLabel} →
            </Link>
          ) : null}
        </div>
      ) : null}

      {/* À commencer maintenant : les prochaines tâches non entamées. Une
          ligne SÉLECTIONNE son point sur l'axe — même état, même détail. */}
      {view.toStart.length > 0 ? (
        <div
          style={{
            marginTop: 18,
            paddingTop: 16,
            borderTop: `1px solid ${alpha.cardGridGap}`,
          }}
        >
          <span
            style={{
              ...small,
              fontSize: "0.68rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: colors.goldText,
            }}
          >
            {dashboard.timeline.toStart}
          </span>
          <ul style={{ listStyle: "none", margin: "10px 0 0", padding: 0 }}>
            {view.toStart.map((point) => (
              <li
                key={point.id}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "baseline",
                  gap: 10,
                  padding: "6px 0",
                }}
              >
                <button
                  type="button"
                  onClick={() => setSelectedId(point.id)}
                  aria-label={`${dashboard.timeline.toStart} — ${point.title}`}
                  style={{
                    fontFamily: fonts.sans,
                    fontSize: "0.88rem",
                    color: colors.navy900,
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    textDecoration: "underline",
                    textDecorationColor: alpha.goldBorderHover,
                    textUnderlineOffset: 3,
                  }}
                >
                  {point.title}
                </button>
                <span style={{ ...small, color: point.state === "OVERDUE" || point.state === "URGENT" ? colors.goldText : colors.slate }}>
                  {point.dateLabel} · {point.leftLabel}
                </span>
                {point.toolHref && point.toolLabel ? (
                  <Link
                    href={point.toolHref}
                    style={{
                      ...small,
                      color: colors.goldText,
                      textDecoration: "none",
                    }}
                  >
                    {point.toolLabel} →
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {view.undatedNote ? (
        <p style={{ ...small, margin: "14px 0 0" }}>{view.undatedNote}</p>
      ) : null}
    </section>
  );
}
