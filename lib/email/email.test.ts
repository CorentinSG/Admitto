import { describe, expect, it, vi } from "vitest";
import { scheduleSequence, dueEmails } from "./schedule";
import { renderEmail } from "./render";
import { sendGuarded, type EmailTransport } from "./transport";
import { EMAIL_LEGAL_BASIS } from "./types";
import { J12_MODULE_SLUG } from "./eligibility";
import { J2_FRAGMENTS } from "@/content/emails";
import { findModule, isModulePublished } from "@/content/modules";

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
  riskLine: "— risque principal identifié : Financement non sécurisé",
  offerParagraph: "L'offre qui correspond à votre situation est Roadmap & Platform.",
  offerName: "Roadmap & Platform",
  deductionAmount: "79 €",
  deductionExpiry: "27 août 2026",
  taskTitle: "Demander vos relevés de notes",
  noticeLead: "est à faire dans 7 jours",
  deadlineList: "— Demander vos relevés de notes : 2026-09-15 (est à faire dans 7 jours)",
  dashboardUrl: "https://admitto.app/app/roadmap",
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

  it("le rappel d'échéance repose sur le contrat, jamais sur le consentement", () => {
    // Requalifier ce rappel en promotionnel le ferait cesser de partir pour
    // ceux qui n'ont pas consenti — c'est-à-dire priver du service ceux qui
    // l'ont payé.
    expect(EMAIL_LEGAL_BASIS.DEADLINE_NOTICE).toBe("CONTRACT");
    const body = renderEmail("DEADLINE_NOTICE", VARIABLES).body;
    expect(body).not.toContain(VARIABLES.unsubscribeUrl);
    expect(body).toMatch(/pas envoyé à des fins promotionnelles/);
  });

  it("le rappel d'échéance n'entre pas dans la séquence datée", () => {
    // La séquence part de la soumission ; un rappel d'échéance dépend de la
    // feuille de route. Les mélanger planifierait un rappel à J+12.
    expect(scheduleSequence(SUBMITTED, true).map((e) => e.kind)).not.toContain("DEADLINE_NOTICE");
  });

  it("ne présente jamais le rapport comme un conseil juridique", () => {
    const body = renderEmail("J2_REPORT", VARIABLES).body;
    expect(body).toMatch(/ne constitue pas un conseil juridique/);
  });

  it("la ressource du J+12 désigne un module qui existe ET qui est publié", () => {
    /*
     * Le J+12 citait « module-0-orientation », un slug qui n'existe pas :
     * `isModulePublished` répondait non, l'email restait éternellement « en
     * attente », et rien ne le signalait — la garde ne pouvait pas distinguer
     * « module non publié » de « nom faux ». Même verrou que la feuille de
     * route, où chaque tâche qui cite un module cite un module qui existe.
     */
    expect(findModule(J12_MODULE_SLUG), `slug inconnu : ${J12_MODULE_SLUG}`).not.toBeNull();
    expect(isModulePublished(J12_MODULE_SLUG)).toBe(true);
  });
});

describe("fragments du J+2 (CDC §19 : aucun texte produit librement)", () => {
  /*
   * Deux situations que le gabarit unique ne pouvait pas écrire. Elles sont
   * testées ici, sur la copie, et leur SÉLECTION est testée sur le passage
   * d'envoi (`run.test.ts`).
   */
  it("dit autre chose plutôt que rien quand aucun axe n'est fragile", () => {
    // 14 % des profils, mesuré sur 18 900 rapports assemblés. Le gabarit
    // écrivait « risque principal identifié : » suivi de rien.
    expect(J2_FRAGMENTS.riskLineNone).not.toMatch(/risque principal identifié\s*:\s*$/);
    expect(J2_FRAGMENTS.riskLineNone.length).toBeGreaterThan(20);
    expect(J2_FRAGMENTS.riskLine("Financement non sécurisé")).toContain(
      "Financement non sécurisé"
    );
  });

  it("n'annonce aucune déduction quand le diagnostic a été offert", () => {
    const sans = J2_FRAGMENTS.offerWithoutDeduction("Roadmap & Platform");
    expect(sans).toContain("Roadmap & Platform");
    // Ni montant, ni date : il n'y a rien à déduire et rien à faire expirer.
    expect(sans).not.toMatch(/\d/);

    const avec = J2_FRAGMENTS.offerWithDeduction("Roadmap & Platform", "79 €", "27 août 2026");
    expect(avec).toContain("79 €");
    expect(avec).toContain("27 août 2026");
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
