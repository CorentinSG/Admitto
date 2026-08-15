import { NextResponse } from "next/server";
import { timingSafeEqualString } from "@/lib/access/constant-time";
import { runDeadlineNotifications } from "@/lib/notifications/run";
import { runEmailSequence } from "@/lib/email/run";
import { runBookingReminders } from "@/lib/consultations/remind";
import { purgeTechnicalData } from "@/lib/security/purge";
import { log } from "@/lib/observability/log";

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
    // Journalisé en `warn` : un déclencheur planifié qui frappe une route
    // inerte est un incident de configuration silencieux — les emails ne
    // partent pas, et rien ne le dit.
    log("warn", "cron.rejected", { reason: "unconfigured" });
    return NextResponse.json({ error: "Déclencheur non configuré." }, { status: 503 });
  }

  const provided = request.headers.get("authorization")?.replace(/^Bearer /, "") ?? "";
  if (!timingSafeEqualString(provided, secret)) {
    // Le jeton fourni n'est PAS journalisé : ce serait écrire dans un fichier
    // la valeur qu'on refuse justement de divulguer.
    log("warn", "cron.rejected", { reason: "bad_token" });
    return NextResponse.json({ error: "Jeton invalide." }, { status: 401 });
  }

  const now = new Date();
  const startedAt = Date.now();
  const summary = await runDeadlineNotifications(now);
  // La séquence J+0 → J+25 suit le même déclencheur. Elle était écrite,
  // testée, et personne ne l'appelait : seul le J+0 partait, depuis la
  // soumission du questionnaire. Les quatre suivants — dont le J+2 qui porte
  // le rapport — n'ont jamais quitté le produit.
  const sequence = await runEmailSequence(now);
  // Les rappels de séance suivent le même déclencheur. Ils balaient les
  // réservations, pas les diagnostics : peu nombreuses et déjà bornées à
  // l'avenir proche.
  const reminders = await runBookingReminders(now);
  // La purge suit le même déclencheur : un cron de moins à configurer, et
  // l'un ne va pas sans l'autre en production (revue §B2 et §C6).
  const purged = await purgeTechnicalData(now);

  // Chaque tâche journalise déjà son propre résumé ; cette ligne-ci porte ce
  // qu'aucune ne connaît : la durée du passage complet. Un cron qui glisse de
  // trente secondes à dix minutes annonce sa prochaine panne.
  log("info", "cron.done", { ms: Date.now() - startedAt });

  return NextResponse.json({ ...summary, sequence, reminders, purged });
}
