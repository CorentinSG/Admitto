import { NextResponse } from "next/server";
import { parseEvent } from "@/lib/analytics/events";
import { eventStore } from "@/lib/store/events";
import { callerIp, checkRateLimit } from "@/lib/security/rate-limit";

/**
 * Enregistrement d'un événement produit (CDC §36).
 *
 * Route publique, et volontairement la plus pauvre du produit : elle accepte
 * un type et un écran, tous deux issus d'unions fermées, et n'enregistre rien
 * d'autre. Ni l'adresse IP de l'appelant, ni son agent, ni un identifiant de
 * passage — voir `lib/analytics/events.ts` pour le raisonnement.
 *
 * L'IP sert au SEUL plafond de débit, dans la table des tentatives déjà
 * couverte par la politique de confidentialité, et purgée en quelques heures.
 * Elle n'entre jamais dans l'événement.
 *
 * La réponse est toujours 204, y compris en cas de refus : une mesure n'a pas
 * à renseigner l'appelant sur ses propres limites, et l'interface n'a rien à
 * faire de ce résultat — un événement perdu est un compteur légèrement bas,
 * jamais un parcours interrompu.
 */
export async function POST(request: Request) {
  const verdict = await checkRateLimit("EVENT", { ip: callerIp(request.headers) });
  if (!verdict.ok) return new NextResponse(null, { status: 204 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  const event = parseEvent((body ?? {}) as { kind?: unknown; screen?: unknown });
  if (!event) return new NextResponse(null, { status: 204 });

  try {
    await eventStore.record(event.kind, event.screen);
  } catch {
    // Une mesure ne casse jamais un parcours : l'échec est silencieux côté
    // client, et le compteur manquera — c'est le bon arbitrage.
  }
  return new NextResponse(null, { status: 204 });
}
