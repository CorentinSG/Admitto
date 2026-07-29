import { NextResponse } from "next/server";
import { timingSafeEqualString } from "@/lib/access/constant-time";
import { runDeadlineNotifications } from "@/lib/notifications/run";

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

  const summary = await runDeadlineNotifications(new Date());
  return NextResponse.json(summary);
}
