import { afterEach, describe, expect, it, vi } from "vitest";
import { CAPABILITIES, CAPABILITY_IDS, capabilityStates } from "./capabilities";

/**
 * Le test qui aurait attrapé les trois défauts d'un coup.
 *
 * La règle du produit — fermé par défaut, ouvert par configuration — était
 * appliquée à chaque variable prise séparément, jamais aux ENSEMBLES. Trois
 * capacités s'ouvraient donc à moitié configurées, et l'entre-deux n'était
 * vérifié nulle part : le régime minimal (aucune variable) et le régime complet
 * l'étaient, jamais celui où l'on a renseigné deux valeurs sur trois — qui est
 * pourtant l'état normal d'une mise en service.
 */

/**
 * Valeur plausible par variable.
 *
 * `ADMITTO_BASE_URL` doit être PUBLIQUE : une adresse locale ne rend pas un
 * lien cliquable depuis une boîte mail, et le produit la traite comme absente.
 * Y mettre `http://localhost:3000` ferait passer le test sans rien prouver.
 */
const SAMPLE: Record<string, string> = {
  DATABASE_URL: "postgresql://user:pass@localhost:5432/admitto",
  AUTH_SECRET: "secret-de-test-suffisamment-long-0000",
  RESEND_API_KEY: "re_test_x",
  ADMITTO_EMAIL_FROM: "bonjour@admitto.fr",
  ADMITTO_BASE_URL: "https://admitto.fr",
  STRIPE_SECRET_KEY: "sk_test_x",
  STRIPE_WEBHOOK_SECRET: "whsec_x",
  ADMITTO_VAULT_DIR: "/var/lib/admitto/coffre",
  ADMITTO_CRON_SECRET: "cron-test",
  ADMITTO_ERROR_WEBHOOK: "https://exemple.invalid/hook",
};

/** Toutes les variables du tableau, éteintes ; puis celles demandées, allumées. */
function configure(present: readonly string[]): void {
  for (const name of Object.keys(SAMPLE)) vi.stubEnv(name, "");
  for (const name of present) vi.stubEnv(name, SAMPLE[name]);
}

const ALL_REQUIRED = [...new Set(CAPABILITIES.flatMap((c) => c.requires))];

afterEach(() => vi.unstubAllEnvs());

describe("capacités ouvertes par configuration", () => {
  it("chaque variable citée a un échantillon : le test ne peut pas se croire complet", () => {
    // Une variable ajoutée à `requires` sans échantillon serait éteinte dans
    // TOUS les cas, et la capacité paraîtrait correctement fermée — le test
    // passerait au vert en ne testant plus rien.
    expect(ALL_REQUIRED.filter((name) => !(name in SAMPLE))).toEqual([]);
  });

  it("tout est fermé quand rien n'est configuré", () => {
    configure([]);
    for (const state of capabilityStates()) {
      expect(state.open, state.id).toBe(false);
      expect(state.missing, state.id).toEqual([...state.requires]);
    }
  });

  it("tout est ouvert quand tout est configuré", () => {
    configure(ALL_REQUIRED);
    for (const state of capabilityStates()) {
      expect(state.open, state.id).toBe(true);
      expect(state.missing, state.id).toEqual([]);
    }
  });

  it("il manque UNE variable, la capacité reste fermée", () => {
    /*
     * Le cœur du test. Pour chaque capacité, on renseigne tout sauf une de ses
     * variables, à tour de rôle. Une capacité qui s'ouvrirait quand même est
     * une capacité qui promet ce qu'elle ne peut pas tenir :
     *
     * — le paiement encaissait sans pouvoir enregistrer l'encaissement ;
     * — l'envoi expédiait des liens vers `localhost`, désinscription comprise.
     */
    for (const capability of CAPABILITIES) {
      for (const absent of capability.requires) {
        configure(ALL_REQUIRED.filter((name) => name !== absent));
        const state = capabilityStates().find((s) => s.id === capability.id)!;
        expect(state.open, `${capability.id} sans ${absent}`).toBe(false);
        expect(state.missing, `${capability.id} sans ${absent}`).toContain(absent);
        vi.unstubAllEnvs();
      }
    }
  });

  it("le tableau couvre exactement les capacités déclarées", () => {
    expect(CAPABILITIES.map((c) => c.id).sort()).toEqual([...CAPABILITY_IDS].sort());
  });

  it("chaque capacité dit ce que sa fermeture ferme", () => {
    /*
     * Le back-office affiche ces phrases : une capacité fermée sans dire ce
     * qu'elle ferme se diagnostique en relisant le code, pas en regardant
     * l'écran. Seule leur PRÉSENCE se teste — une première version cherchait
     * ici les mots « erreur » et « panne » pour vérifier qu'une fermeture ne
     * se lit pas comme une avarie, et refusait la seule capacité dont le sujet
     * EST les erreurs. Une règle de rédaction ne se contrôle pas au mot-clé.
     */
    for (const capability of CAPABILITIES) {
      expect(capability.label.length, capability.id).toBeGreaterThan(0);
      expect(capability.closedMeans.length, capability.id).toBeGreaterThan(30);
      expect(capability.requires.length, capability.id).toBeGreaterThan(0);
    }
  });
});
