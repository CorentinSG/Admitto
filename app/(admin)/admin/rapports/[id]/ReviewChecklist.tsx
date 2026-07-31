"use client";

import { useOptimistic, useState, useTransition } from "react";
import { colors, fonts, alpha } from "@/design/tokens";
import type { ReviewPoint } from "@/lib/report/review";
import { setReviewPoint } from "../../actions";

/**
 * Revue structurée avant envoi (CDC §17).
 *
 * Les points ne sont pas une checklist générique : ils sont dérivés de ce
 * profil-ci. Cocher n'est pas « j'ai lu », c'est « j'ai arbitré » — d'où le
 * rappel du motif sous chaque point, qui reste visible une fois coché.
 */
export function ReviewChecklist({
  id,
  points,
  acknowledged,
}: {
  id: string;
  points: ReviewPoint[];
  acknowledged: string[];
}) {
  const [error, setError] = useState<string | null>(null);
  // Pas de désactivation pendant l'aller-retour : la case reflète déjà le clic,
  // et le relecteur doit pouvoir en traiter plusieurs à la suite.
  const [, startTransition] = useTransition();

  /**
   * La case reflète le clic immédiatement, puis se réaligne sur le serveur.
   * Sans cela elle reste figée le temps de l'aller-retour, et le relecteur
   * clique une seconde fois en croyant avoir manqué la case.
   */
  const [shown, markOptimistic] = useOptimistic(
    acknowledged,
    (current: string[], change: { id: string; done: boolean }) =>
      change.done ? [...current, change.id] : current.filter((p) => p !== change.id)
  );

  if (points.length === 0) {
    return (
      <p
        style={{
          fontFamily: fonts.sans,
          fontSize: "0.88rem",
          lineHeight: 1.7,
          margin: "14px 0 0",
          color: colors.slate,
        }}
      >
        Aucun point signalé : la voie préliminaire est établie par des règles vérifiées, le verdict
        ne demande pas d&apos;arbitrage et aucune réponse décisive ne manque. La relecture reste
        nécessaire ; elle n&apos;est simplement pas bloquée.
      </p>
    );
  }

  const blocking = points.filter((p) => p.severity === "BLOCKING");
  const remaining = blocking.filter((p) => !shown.includes(p.id)).length;

  return (
    <div style={{ marginTop: 14 }}>
      <p
        style={{
          fontFamily: fonts.sans,
          fontSize: "0.85rem",
          lineHeight: 1.7,
          margin: 0,
          color: remaining > 0 ? colors.goldText : colors.slate,
        }}
      >
        {remaining > 0
          ? `${remaining} point(s) bloquant(s) sur ${blocking.length} : l'envoi reste fermé tant qu'ils ne sont pas traités.`
          : "Tous les points bloquants sont traités : l'envoi est ouvert."}
      </p>

      <ul style={{ listStyle: "none", margin: "18px 0 0", padding: 0 }}>
        {points.map((point) => {
          const done = shown.includes(point.id);
          const isBlocking = point.severity === "BLOCKING";
          return (
            <li
              key={point.id}
              style={{
                display: "flex",
                gap: 14,
                padding: "16px 0",
                borderTop: `1px solid ${alpha.cardGridGap}`,
              }}
            >
              <input
                type="checkbox"
                id={`review-${point.id}`}
                checked={done}
                onChange={(e) => {
                  const next = e.target.checked;
                  startTransition(async () => {
                    setError(null);
                    markOptimistic({ id: point.id, done: next });
                    const res = await setReviewPoint(id, point.id, next);
                    if (res?.error) setError(res.error);
                  });
                }}
                style={{ marginTop: 4, accentColor: colors.gold, width: 16, height: 16 }}
              />
              <div>
                <label
                  htmlFor={`review-${point.id}`}
                  style={{
                    display: "block",
                    fontFamily: fonts.sans,
                    fontSize: "0.92rem",
                    lineHeight: 1.6,
                    cursor: "pointer",
                    color: done ? colors.slate : colors.navy900,
                    textDecoration: done ? "line-through" : "none",
                  }}
                >
                  {point.label}
                </label>
                <span
                  style={{
                    display: "inline-block",
                    marginTop: 6,
                    fontFamily: fonts.sans,
                    fontSize: "0.64rem",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: isBlocking ? colors.goldText : colors.slate,
                  }}
                >
                  {isBlocking ? "Bloquant" : "Attention"}
                </span>
                <p
                  style={{
                    fontFamily: fonts.sans,
                    fontSize: "0.84rem",
                    lineHeight: 1.75,
                    margin: "6px 0 0",
                    maxWidth: 620,
                    color: colors.slate,
                  }}
                >
                  {point.why}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      {error && (
        <p
          role="alert"
          style={{ fontFamily: fonts.sans, fontSize: "0.82rem", margin: "12px 0 0", color: colors.goldText }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
