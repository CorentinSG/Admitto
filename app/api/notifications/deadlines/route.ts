import { NextResponse } from "next/server";
import { timingSafeEqualString } from "@/lib/access/constant-time";
import { runDeadlineNotifications } from "@/lib/notifications/run";
import { runEmailSequence } from "@/lib/email/run";
import { purgeTechnicalData } from "@/lib/security/purge";

/**
 * Déclenchement des rappels d'échéance (CDC §22).
 *
 * Appelé par une tâche planifiée externe. Sans `ADMITTO_CRON_SECRET`, la route
 * est inerte plutôt que permissive : la même règle que le webhook Stripe et le
 * back-office — ce qui n'est pas configuré est fermé, pas ouvert.
 *
 * La comparaison du jeton est à temps constant : une route qui répond plus vite
 * sur un mauvais premier caractère se laisse deviner caractère par caractère.
 */
export async function POST(request: Request) {
  const secret = process.env.ADMITTO_CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Déclencheur non configuré." }, { status: 503 });
  }

  const provided = request.headers.get("authorization")?.replace(/^Bearer /, "") ?? "";
  if (!timingSafeEqualString(provided, secret)) {
    return NextResponse.json({ error: "Jeton invalide." }, { status: 401 });
  }

  const now = new Date();
  const summary = await runDeadlineNotifications(now);
  // La séquence J+0 → J+25 suit le même déclencheur. Elle était écrite,
  // testée, et personne ne l'appelait : seul le J+0 partait, depuis la
  // soumission du questionnaire. Les quatre suivants — dont le J+2 qui porte
  // le rapport — n'ont jamais quitté le produit.
  const sequence = await runEmailSequence(now);
  // La purge suit le même déclencheur : un cron de moins à configurer, et
  // l'un ne va pas sans l'autre en production (revue §B2 et §C6).
  const purged = await purgeTechnicalData(now);
  return NextResponse.json({ ...summary, sequence, purged });
}
