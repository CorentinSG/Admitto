"use client";

import { useState } from "react";
import Link from "next/link";
import { colors, fonts, alpha } from "@/design/tokens";
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

export interface TimelineView {
  points: TimelinePointView[];
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

  const small = {
    fontFamily: fonts.sans,
    fontSize: "0.75rem",
    color: colors.slate,
  } as const;

  return (
    <section
      aria-label="Timeline du parcours"
      style={{
        marginTop: 36,
        padding: "26px 28px 20px",
        border: `1px solid ${alpha.cardGridGap}`,
        backgroundColor: colors.ivory,
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
        <div style={{ position: "relative", minWidth: 640, height: 108, marginTop: 18 }}>
          {/* Rail */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 54,
              height: 2,
              backgroundColor: alpha.cardGridGap,
            }}
          />
          {/* Le chemin parcouru : rempli jusqu'à aujourd'hui. */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              left: 0,
              width: `${view.todayPosition}%`,
              top: 54,
              height: 2,
              backgroundColor: colors.gold,
            }}
          />

          {/* Repère du jour */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              left: `${view.todayPosition}%`,
              top: 30,
              transform: "translateX(-50%)",
              textAlign: "center",
            }}
          >
            <span
              style={{
                ...small,
                display: "block",
                fontSize: "0.62rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: colors.gold,
                marginBottom: 4,
              }}
            >
              {dashboard.timeline.today}
            </span>
            <span
              style={{
                display: "block",
                width: 1,
                height: 34,
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
                top: 62,
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
                style={{
                  position: "absolute",
                  left: `${point.position}%`,
                  top: 46,
                  transform: "translateX(-50%)",
                  width: 18,
                  height: 18,
                  padding: 0,
                  borderRadius: "50%",
                  backgroundColor: style.fill,
                  border: `2px solid ${isSelected ? colors.navy900 : style.border}`,
                  cursor: "pointer",
                  animation: style.pulse ? "pulse-gold 2.4s ease infinite" : "none",
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
      </div>

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
            <span style={{ ...small, color: colors.gold }}>
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
                color: colors.gold,
                textDecoration: "none",
              }}
            >
              {selected.toolLabel} →
            </Link>
          ) : null}
        </div>
      ) : null}

      {view.undatedNote ? (
        <p style={{ ...small, margin: "14px 0 0" }}>{view.undatedNote}</p>
      ) : null}
    </section>
  );
}
