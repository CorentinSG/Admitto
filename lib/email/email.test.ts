import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { scheduleSequence, dueEmails } from "./schedule";
import { renderEmail } from "./render";
import { emailsAreDelivered, sendGuarded, type EmailTransport } from "./transport";
import { baseUrl } from "./dispatch";
import { EMAIL_LEGAL_BASIS } from "./types";
import { J12_MODULE_SLUG } from "./eligibility";
import { J2_FRAGMENTS } from "@/content/emails";
import { DELIVERY_PROMISE, deliveryPromise } from "@/content/diagnostic-delivery";
import { rapport } from "@/content/rapport";
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
  consultationName: "Cadrage du projet",
  consultationCovers: "— Clarifier le marché visé",
  consultationExcludes: "— Aucune appréciation de votre dossier",
  consultationsUrl: "https://admitto.app/app/consultations",
  slotLabel: "lundi 3 novembre à 14:00 (heure de Paris) · 45 min",
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

describe("confirmation de séance (CDC §31)", () => {
  /*
   * Réserver une séance ne produisait AUCUN email : la personne posait un
   * rendez-vous et n'avait rien à mettre dans son agenda, rien à retrouver dans
   * sa boîte. Pour le seul rendez-vous humain du produit — et le plus cher —
   * c'est la confirmation qui fait exister le service.
   */
  it("repose sur le contrat, jamais sur le consentement", () => {
    // La requalifier en promotionnel priverait de confirmation quelqu'un qui
    // vient de réserver une séance qu'il a payée.
    expect(EMAIL_LEGAL_BASIS.BOOKING_CONFIRMATION).toBe("CONTRACT");
    const body = renderEmail("BOOKING_CONFIRMATION", VARIABLES).body;
    expect(body).not.toContain(VARIABLES.unsubscribeUrl);
    expect(body).toMatch(/pas envoyée à des fins promotionnelles/);
  });

  it("porte l'heure avec son fuseau, jamais une heure nue", () => {
    // « 14:00 » sans fuseau dans un email est une heure que le destinataire
    // doit deviner — et il peut manquer sa séance.
    const body = renderEmail("BOOKING_CONFIRMATION", VARIABLES).body;
    expect(body).toContain(VARIABLES.slotLabel);
    expect(body).toMatch(/heure de Paris/);
  });

  it("énonce ce que la séance NE couvre PAS", () => {
    // Un périmètre qui n'énonce que ses inclusions se lit comme ouvert : c'est
    // ainsi qu'une séance de méthode devient une relecture juridique (CDC §30).
    const body = renderEmail("BOOKING_CONFIRMATION", VARIABLES).body;
    expect(body).toContain(VARIABLES.consultationExcludes);
    expect(body).toMatch(/ne couvre pas/i);
  });

  it("n'entre pas dans la séquence datée", () => {
    // Elle se déclenche à la réservation, pas à un décalage depuis la
    // soumission : les mélanger la planifierait à J+12.
    expect(scheduleSequence(SUBMITTED, true).map((e) => e.kind)).not.toContain(
      "BOOKING_CONFIRMATION"
    );
  });

  it("l'annonce du compte rendu repose sur le contrat et pointe vers l'espace", () => {
    // Le compte rendu VIT dans l'espace, derrière la session : l'email dit
    // qu'il existe et où, il ne recopie pas son contenu — un email se
    // transfère et finit dans des boîtes que personne ne maîtrise.
    expect(EMAIL_LEGAL_BASIS.BOOKING_SUMMARY).toBe("CONTRACT");
    const body = renderEmail("BOOKING_SUMMARY", VARIABLES).body;
    expect(body).not.toContain(VARIABLES.unsubscribeUrl);
    expect(body).toMatch(/pas envoyé à des fins promotionnelles/);
    expect(body).toContain(VARIABLES.consultationsUrl);
    expect(body).toContain(VARIABLES.consultationName);
  });

  it("le rappel repose lui aussi sur le contrat, et reste court", () => {
    expect(EMAIL_LEGAL_BASIS.BOOKING_REMINDER).toBe("CONTRACT");
    const body = renderEmail("BOOKING_REMINDER", VARIABLES).body;
    expect(body).not.toContain(VARIABLES.unsubscribeUrl);
    expect(body).toMatch(/pas envoyé à des fins promotionnelles/);
    expect(body).toContain(VARIABLES.slotLabel);

    /*
     * Il ne REDIT pas le périmètre : la confirmation le porte en entier, et un
     * rappel qui recopie tout se lit en diagonale. Réénoncer la moitié du
     * périmètre le ferait de surcroît paraître plus ouvert qu'il n'est — il
     * désigne donc où le trouver.
     */
    expect(body).not.toContain(VARIABLES.consultationExcludes);
    expect(body).toMatch(/email de confirmation/);
    expect(body.length).toBeLessThan(
      renderEmail("BOOKING_CONFIRMATION", VARIABLES).body.length
    );
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

describe("aucun email ne part avec des liens qui ne mènent nulle part", () => {
  /*
   * Tout email de ce produit porte un lien : le résultat, le rapport, la
   * ressource, la désinscription. Ils sont bâtis sur `ADMITTO_BASE_URL`, dont
   * le repli est `http://localhost:3000`. La clé et l'expéditeur suffisaient
   * pourtant à expédier pour de bon — le produit envoyait donc de vrais
   * messages à de vraies personnes, avec des liens morts, et rien ne rattrape
   * un email parti.
   *
   * Le lien de désinscription en fait plus qu'une gêne : un promotionnel dont
   * le lien de retrait ne fonctionne pas n'offre plus le moyen de retirer son
   * consentement (CDC §34).
   */
  const configure = (base?: string) => {
    vi.stubEnv("RESEND_API_KEY", "re_test_x");
    vi.stubEnv("ADMITTO_EMAIL_FROM", "bonjour@admitto.fr");
    vi.stubEnv("ADMITTO_BASE_URL", base ?? "");
  };

  afterEach(() => vi.unstubAllEnvs());

  it("expédie quand les trois valeurs sont là", () => {
    configure("https://admitto.fr");
    expect(emailsAreDelivered()).toBe(true);
    expect(baseUrl()).toBe("https://admitto.fr");
  });

  it("n'expédie pas sans adresse publique, même avec la clé et l'expéditeur", () => {
    configure();
    expect(emailsAreDelivered()).toBe(false);
  });

  it("traite une adresse locale comme une absence", () => {
    // `http://localhost:3000` saisi à la main n'est pas plus cliquable depuis
    // la boîte du destinataire qu'une variable absente.
    for (const local of ["http://localhost:3000", "http://127.0.0.1:3100"]) {
      configure(local);
      expect(emailsAreDelivered(), local).toBe(false);
      expect(baseUrl(), local).toBe("http://localhost:3000");
    }
  });

  it("chaque lien d'un email est bâti sur cette même racine", () => {
    // Un lien qui échapperait à `baseUrl()` échapperait aussi au verrou.
    configure("https://admitto.fr");
    const url = baseUrl();
    for (const kind of Object.keys(EMAIL_LEGAL_BASIS) as Array<keyof typeof EMAIL_LEGAL_BASIS>) {
      const body = renderEmail(kind, VARIABLES).body;
      for (const lien of body.match(/https?:\/\/[^\s]+/g) ?? []) {
        expect(lien.startsWith(VARIABLES.resultUrl.slice(0, 20)) || lien.startsWith(url)).toBe(true);
      }
    }
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

describe("aucun écran n'annonce un email que le régime n'expédie pas", () => {
  /*
   * Le défaut est une AFFIRMATION FAUSSE, pas un défaut d'affichage : en
   * Phase 1A le transport journalise sans expédier, et quatre écrans
   * promettaient un message. Deux ont été corrigés le 2026-08-05 (résultat,
   * connexion) ; les deux derniers l'ont été le 2026-08-07 — le questionnaire,
   * qui annonce ce qu'on va recevoir AVANT même de laisser son adresse, et la
   * page du rapport, où l'on attend précisément ce message.
   *
   * Le test lit les fichiers de copie : c'est le seul moyen d'attraper une
   * cinquième promesse ajoutée demain.
   */
  const PROMESSE = /vous recevrez|par email|vient d'être envoyée/i;

  it("le questionnaire ne promet un email que dans la variante qui l'expédie", () => {
    expect(DELIVERY_PROMISE.withEmail).toMatch(PROMESSE);
    expect(DELIVERY_PROMISE.withoutEmail).not.toMatch(PROMESSE);
    // Elle ne se contente pas de retirer la promesse : elle dit par où le
    // rapport arrivera vraiment. Retirer sans remplacer laisserait la question.
    expect(DELIVERY_PROMISE.withoutEmail).toMatch(/lien/i);
    expect(deliveryPromise(true)).toBe(DELIVERY_PROMISE.withEmail);
    expect(deliveryPromise(false)).toBe(DELIVERY_PROMISE.withoutEmail);
  });

  it("la page du rapport ne promet un email que dans la variante qui l'expédie", () => {
    expect(rapport.pendingBody("sous 48 heures")).toMatch(PROMESSE);
    expect(rapport.pendingBodyWithoutEmail("sous 48 heures")).not.toMatch(PROMESSE);
    expect(rapport.pendingBodyWithoutEmail("sous 48 heures")).toMatch(/ce lien|cette page|ici/i);
    // Le délai reste dit dans les deux : c'est lui qui évite la relance.
    expect(rapport.pendingBodyWithoutEmail("sous 48 heures")).toContain("sous 48 heures");
  });

  it("la copie du questionnaire n'emporte aucune variante jusqu'au navigateur", () => {
    /*
     * `content/diagnostic.ts` est importé par un composant client : une
     * variante qui n'y sert jamais voyagerait quand même, et le budget de la
     * route l'a dit avant que quiconque ne le remarque. Le serveur choisit la
     * phrase ; le client reçoit celle qui s'affiche.
     */
    const source = readFileSync("content/diagnostic.ts", "utf8");
    expect(source).not.toMatch(/deliverable/);
    expect(readFileSync("app/(marketing)/diagnostic/Questionnaire.tsx", "utf8")).not.toMatch(
      /diagnostic-delivery|RESEND/
    );
  });
});
