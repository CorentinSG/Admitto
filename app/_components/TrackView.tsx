"use client";

import { useEffect } from "react";
import type { EventKind } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";

/**
 * Émet un événement de consultation à l'affichage d'une page (CDC §36).
 *
 * Un composant client minuscule, glissé dans une page serveur : la page reste
 * un composant serveur, seul ce fragment s'exécute au navigateur. Mesurer
 * côté serveur compterait aussi les préchargements et les robots ; mesurer ici
 * compte des pages réellement rendues à quelqu'un.
 *
 * Ne rend rien et n'a aucun effet visuel.
 */
export function TrackView({ kind }: { kind: EventKind }) {
  useEffect(() => {
    track(kind);
  }, [kind]);
  return null;
}
