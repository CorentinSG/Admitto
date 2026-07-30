import type { Assessment } from "@/lib/assessment/compute";
import { announcedDelay } from "@/lib/capacity/delay";
import { PATH_LABELS } from "@/content/result";
import { renderEmail, type EmailVariables } from "./render";
import { getTransport, sendGuarded } from "./transport";
import type { EmailKind, LegalBasis } from "./types";

/**
 * Envoi d'un email de la séquence à partir d'une évaluation (CDC §19).
 * Les variables sont construites ici, jamais dans les blocs de texte.
 */

export function baseUrl(): string {
  return process.env.ADMITTO_BASE_URL ?? "http://localhost:3000";
}

export function emailVariables(
  assessment: Assessment,
  activeReports: number,
  extra: EmailVariables = {}
): EmailVariables {
  const url = baseUrl();
  return {
    firstName: assessment.answers.firstName ?? "",
    resultUrl: `${url}/resultat/${assessment.id}`,
    reportUrl: `${url}/resultat/${assessment.id}`,
    unsubscribeUrl: `${url}/desinscription/${assessment.id}`,
    delay: announcedDelay(activeReports),
    pathLabel: PATH_LABELS[assessment.path],
    ...extra,
  };
}

/**
 * Envoie un email en respectant la base légale. Un échec de transport n'est
 * jamais fatal pour le parcours utilisateur : il est journalisé et remonté.
 */
export async function dispatchEmail(
  kind: EmailKind,
  to: string,
  variables: EmailVariables,
  consentMarketing: boolean
): Promise<{ ok: boolean; error?: string; skipped?: LegalBasis }> {
  try {
    const rendered = renderEmail(kind, variables);
    const result = await sendGuarded(getTransport(), { ...rendered, to }, consentMarketing);
    // `skipped` est remonté : un envoi écarté faute de consentement rend
    // `ok: true` sans avoir rien envoyé. L'appelant qui ne verrait que `ok`
    // le noterait comme envoyé dans son journal, et l'email ne partirait
    // jamais si le consentement revenait ensuite.
    return { ok: result.ok, error: result.error, skipped: result.skipped };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}
