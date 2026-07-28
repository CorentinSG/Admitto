import { describe, expect, it, vi } from "vitest";
import { scheduleSequence, dueEmails } from "./schedule";
import { renderEmail } from "./render";
import { sendGuarded, type EmailTransport } from "./transport";
import { EMAIL_LEGAL_BASIS } from "./types";

const SUBMITTED = new Date(Date.UTC(2026, 6, 28));

const VARIABLES = {
  firstName: "Camille",
  resultUrl: "https://admitto.app/resultat/x",
  reportUrl: "https://admitto.app/rapport/x",
  resourceUrl: "https://admitto.app/modules/financement",
  unsubscribeUrl: "https://admitto.app/desinscription/x",
  delay: "sous 48 heures",
  pathLabel: "Situation nécessitant une revue humaine",
  verdictTitle: "Projet viable avec une planification importante",
  mainRisk: "Financement non sécurisé",
  offerName: "Roadmap & Platform",
  deductionAmount: "79 €",
  deductionExpiry: "27 août 2026",
};

describe("calendrier de la séquence (CDC §19)", () => {
  it("planifie les cinq emails aux bons décalages avec consentement", () => {
    const schedule = scheduleSequence(SUBMITTED, true);
    expect(schedule.map((e) => e.kind)).toEqual([
      "J0_CONFIRMATION",
      "J2_REPORT",
      "J5_FOLLOWUP",
      "J12_CONTENT",
      "J25_DEDUCTION_EXPIRY",
    ]);
    expect(schedule[0].sendAt.slice(0, 10)).toBe("2026-07-28");
    expect(schedule[1].sendAt.slice(0, 10)).toBe("2026-07-30");
    expect(schedule[4].sendAt.slice(0, 10)).toBe("2026-08-22");
  });

  it("n'planifie aucun email promotionnel sans consentement (CDC §34)", () => {
    const schedule = scheduleSequence(SUBMITTED, false);
    expect(schedule.map((e) => e.kind)).toEqual([
      "J0_CONFIRMATION",
      "J2_REPORT",
      "J5_FOLLOWUP",
    ]);
    expect(schedule.every((e) => e.legalBasis === "CONTRACT")).toBe(true);
  });

  it("ne renvoie que les emails dus et non déjà envoyés", () => {
    const schedule = scheduleSequence(SUBMITTED, true);
    const due = dueEmails(schedule, ["J0_CONFIRMATION"], new Date(Date.UTC(2026, 7, 2)));
    expect(due.map((e) => e.kind)).toEqual(["J2_REPORT", "J5_FOLLOWUP"]);
  });
});

describe("rendu des emails", () => {
  it("rend chaque email de la séquence sans variable manquante", () => {
    for (const kind of Object.keys(EMAIL_LEGAL_BASIS) as Array<keyof typeof EMAIL_LEGAL_BASIS>) {
      const email = renderEmail(kind, VARIABLES);
      expect(email.subject.length).toBeGreaterThan(0);
      expect(email.body).not.toMatch(/\{\w+\}/); // aucun placeholder résiduel
    }
  });

  it("échoue plutôt que d'envoyer un email à trou", () => {
    expect(() => renderEmail("J0_CONFIRMATION", { firstName: "Camille" })).toThrow(
      /attendue mais absente/
    );
  });

  it("porte un lien de désinscription sur les emails promotionnels", () => {
    expect(renderEmail("J12_CONTENT", VARIABLES).body).toContain(VARIABLES.unsubscribeUrl);
    expect(renderEmail("J25_DEDUCTION_EXPIRY", VARIABLES).body).toContain(VARIABLES.unsubscribeUrl);
  });

  it("ne présente jamais le rapport comme un conseil juridique", () => {
    const body = renderEmail("J2_REPORT", VARIABLES).body;
    expect(body).toMatch(/ne constitue pas un conseil juridique/);
  });
});

describe("verrou d'envoi", () => {
  const transport = (): EmailTransport & { sent: string[] } => {
    const sent: string[] = [];
    return {
      name: "test",
      sent,
      async send(email) {
        sent.push(email.subject);
        return { ok: true };
      },
    };
  };

  it("bloque un email promotionnel sans consentement, même s'il a été planifié", async () => {
    const t = transport();
    const email = { ...renderEmail("J12_CONTENT", VARIABLES), to: "camille@example.com" };
    const result = await sendGuarded(t, email, false);
    expect(result.skipped).toBe("CONSENT");
    expect(t.sent).toHaveLength(0);
  });

  it("laisse passer les emails d'exécution du service", async () => {
    const t = transport();
    const email = { ...renderEmail("J0_CONFIRMATION", VARIABLES), to: "camille@example.com" };
    await sendGuarded(t, email, false);
    expect(t.sent).toHaveLength(1);
  });

  it("le transport par défaut n'expédie rien sans clé configurée", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const { getTransport } = await import("./transport");
    expect(getTransport().name).toBe("console");
    vi.unstubAllEnvs();
  });
});
