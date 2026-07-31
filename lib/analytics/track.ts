import type { EventKind } from "./events";
import type { ScreenId } from "@/lib/questionnaire/types";

/**
 * Émission d'un événement depuis le navigateur (CDC §36).
 *
 * Trois propriétés voulues :
 *
 * 1. **Jamais bloquant.** Aucun `await` côté appelant, aucune erreur remontée :
 *    une mesure qui ferait attendre ou échouer un parcours coûterait plus
 *    qu'elle ne rapporte.
 * 2. **Résiste à la navigation.** `sendBeacon` quand il existe : un événement
 *    émis au moment où l'on quitte la page part quand même. `fetch` en repli.
 * 3. **Rien d'autre que le type et l'écran.** Pas d'URL, pas de référent, pas
 *    d'horodatage client — le serveur date lui-même, ce qui évite de faire
 *    voyager un fuseau qui identifierait un peu plus.
 */
export function track(kind: EventKind, screen?: ScreenId): void {
  if (typeof window === "undefined") return;

  const payload = JSON.stringify(screen ? { kind, screen } : { kind });

  try {
    if (typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon("/api/events", new Blob([payload], { type: "application/json" }));
      return;
    }
    void fetch("/api/events", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Bloqueur de traceurs, mode privé, réseau coupé : le parcours continue.
  }
}
