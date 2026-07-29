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

/**
 * Boîte aux lettres de développement.
 *
 * Quand `ADMITTO_MAIL_LOG` désigne un fichier, chaque message y est écrit en
 * entier — corps compris, donc liens de connexion compris. C'est ce qui permet
 * aux vérifications navigateur de suivre un lien de connexion sans qu'aucune
 * route ne l'expose.
 *
 * Ce n'est pas une porte dérobée : la variable est absente par défaut, et le
 * transport console lui-même ne s'active que si `RESEND_API_KEY` manque —
 * c'est-à-dire quand aucun email ne part nulle part. En production, le
 * transport Resend est utilisé et rien n'est écrit sur disque.
 */
async function appendToMailLog(email: OutgoingEmail): Promise<void> {
  const path = process.env.ADMITTO_MAIL_LOG;
  if (!path) return;
  const { appendFile } = await import("node:fs/promises");
  await appendFile(path, `${JSON.stringify({ ...email, at: new Date().toISOString() })}\n`);
}

/** Transport de développement : trace l'envoi, n'expédie rien. */
export const consoleTransport: EmailTransport = {
  name: "console",
  async send(email) {
    console.info(
      `[email:${email.legalBasis}] → ${email.to} — « ${email.subject} » (non expédié : transport console)`
    );
    await appendToMailLog(email);
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
