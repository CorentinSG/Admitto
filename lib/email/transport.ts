import type { LegalBasis, RenderedEmail } from "./types";

/**
 * Transport d'email. L'implémentation réelle (Resend) n'est active que si la
 * clé est configurée ; sinon le transport journalise sans envoyer, ce qui
 * permet de faire tourner tout le parcours en développement sans risque
 * d'envoi accidentel à un vrai destinataire.
 */

export interface OutgoingEmail extends RenderedEmail {
  to: string;
}

export interface EmailTransport {
  readonly name: string;
  send(email: OutgoingEmail): Promise<{ ok: boolean; error?: string }>;
}

/** Transport de développement : trace l'envoi, n'expédie rien. */
export const consoleTransport: EmailTransport = {
  name: "console",
  async send(email) {
    console.info(
      `[email:${email.legalBasis}] → ${email.to} — « ${email.subject} » (non expédié : transport console)`
    );
    return { ok: true };
  },
};

/** Transport Resend, activé uniquement si RESEND_API_KEY est présente. */
export function resendTransport(apiKey: string, from: string): EmailTransport {
  return {
    name: "resend",
    async send(email) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: email.to,
          subject: email.subject,
          text: email.body,
        }),
      });

      if (!response.ok) {
        return { ok: false, error: `Resend a répondu ${response.status}` };
      }
      return { ok: true };
    },
  };
}

export function getTransport(): EmailTransport {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ADMITTO_EMAIL_FROM;
  if (apiKey && from) return resendTransport(apiKey, from);
  return consoleTransport;
}

/**
 * Envoi contrôlé : un email dont la base légale est le consentement ne part
 * jamais sans consentement, quelle que soit la façon dont il a été planifié.
 * Dernier verrou avant le transport (CDC §34).
 */
export async function sendGuarded(
  transport: EmailTransport,
  email: OutgoingEmail,
  consentMarketing: boolean
): Promise<{ ok: boolean; error?: string; skipped?: LegalBasis }> {
  if (email.legalBasis === "CONSENT" && !consentMarketing) {
    return { ok: true, skipped: "CONSENT" };
  }
  return transport.send(email);
}
