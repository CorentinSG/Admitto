import { beforeEach, describe, expect, it } from "vitest";
import {
  HIT_RETENTION_MINUTES,
  RATE_LIMITS,
  RATE_LIMIT_SCOPES,
  callerIp,
  checkRateLimit,
  purgeRateLimitHits,
} from "./rate-limit";

/**
 * Limitation de débit (revue §A2).
 *
 * Tourne contre le backend actif, comme le contrat des stores : sans base, la
 * mémoire du processus ; avec base, PostgreSQL. Les mêmes assertions doivent
 * passer des deux côtés.
 */

const NOW = new Date("2026-07-29T12:00:00Z");
const later = (minutes: number) => new Date(NOW.getTime() + minutes * 60_000);

let seq = 0;
/** Adresse unique par test : les compteurs sont partagés entre les cas. */
const freshIp = () => `203.0.113.${(seq += 1)}`;
const freshEmail = () => `limite${(seq += 1)}@example.com`;

/**
 * Plafond par email d'un périmètre qui en a un.
 *
 * `perEmail` peut valoir `null` — le périmètre ne comporte alors aucune
 * adresse. Les tests ci-dessous portent sur des périmètres qui en ont un :
 * l'assertion ici fait échouer le test avec un message clair si ce n'était
 * plus le cas, au lieu de laisser une comparaison avec `null` passer pour
 * un plafond de zéro.
 */
const emailCap = (scope: "DIAGNOSTIC" | "SIGN_IN"): number => {
  const cap = RATE_LIMITS[scope].perEmail;
  if (cap === null) throw new Error(`${scope} n'a plus de plafond par email`);
  return cap;
};

beforeEach(async () => {
  // Repart d'un journal vide en mémoire ; en base, les clés sont uniques.
  await purgeRateLimitHits(later(HIT_RETENTION_MINUTES * 10));
});

describe("plafonds", () => {
  it("définit un plafond fini pour chaque périmètre", () => {
    for (const scope of RATE_LIMIT_SCOPES) {
      const limit = RATE_LIMITS[scope];
      // Le plafond par IP, lui, n'est jamais absent : c'est la seule clé
      // dont dispose une route qui ne demande aucune identité.
      expect(limit.perIp, scope).toBeGreaterThan(0);
      expect(limit.windowMinutes, scope).toBeGreaterThan(0);
      // `null` dit « ce périmètre ne comporte pas d'adresse ». Zéro dirait
      // « une seule tentative suffit à dépasser », ce qui refuserait tout dès
      // la première requête : la distinction n'est pas cosmétique.
      if (limit.perEmail !== null) expect(limit.perEmail, scope).toBeGreaterThan(0);
    }
  });

  it("plafonne l'adresse email plus strictement que l'IP", () => {
    // Une IP partagée (entreprise, campus) porte plusieurs personnes ; une
    // adresse email n'en porte qu'une.
    for (const scope of RATE_LIMIT_SCOPES) {
      const { perEmail, perIp } = RATE_LIMITS[scope];
      if (perEmail === null) continue;
      expect(perEmail, scope).toBeLessThan(perIp);
    }
  });

  it("n'enferme pas un périmètre sans email dans un plafond de zéro", async () => {
    // Le piège que le type ferme : avec `perEmail: 0`, une adresse parvenant
    // ici ferait 1 > 0 et la toute première requête serait refusée. Le
    // périmètre EVENT n'en reçoit jamais, mais rien dans le code appelant ne
    // l'empêche — la limite doit donc rester inerte, pas fatale.
    expect(RATE_LIMITS.EVENT.perEmail).toBeNull();
    // Dix passages avec la MÊME adresse, chacun depuis une IP différente :
    // aucun ne doit être refusé. C'est ce qui prouve que la clé email
    // n'accumule rien ici, et pas seulement que le premier appel passe.
    const email = freshEmail();
    for (let i = 0; i < 10; i++) {
      const verdict = await checkRateLimit("EVENT", { ip: freshIp(), email }, NOW);
      expect(verdict.ok, `passage ${i + 1}`).toBe(true);
    }
  });

  it("laisse passer un réseau partagé", async () => {
    // Dix personnes d'un même campus, chacune son adresse, dans la même heure :
    // aucune ne doit être refusée. Un plafond par IP trop serré transforme la
    // protection en panne pour des candidats légitimes.
    const shared = freshIp();
    for (let i = 0; i < 10; i++) {
      const verdict = await checkRateLimit(
        "DIAGNOSTIC",
        { ip: shared, email: freshEmail() },
        NOW
      );
      expect(verdict.ok, `personne ${i + 1}`).toBe(true);
    }
  });
});

describe("limite par adresse email", () => {
  it("accepte jusqu'au plafond puis refuse", async () => {
    const email = freshEmail();
    const perEmail = emailCap("DIAGNOSTIC");

    for (let i = 0; i < perEmail; i++) {
      const verdict = await checkRateLimit("DIAGNOSTIC", { ip: null, email }, NOW);
      expect(verdict.ok, `tentative ${i + 1}`).toBe(true);
    }

    const refused = await checkRateLimit("DIAGNOSTIC", { ip: null, email }, NOW);
    expect(refused.ok).toBe(false);
    if (!refused.ok) {
      expect(refused.retryAfterMinutes).toBe(RATE_LIMITS.DIAGNOSTIC.windowMinutes);
    }
  });

  it("ignore la casse et les espaces de l'adresse", async () => {
    const email = freshEmail();
    const perEmail = emailCap("DIAGNOSTIC");

    for (let i = 0; i < perEmail; i++) {
      await checkRateLimit("DIAGNOSTIC", { ip: null, email: `  ${email.toUpperCase()} ` }, NOW);
    }
    const refused = await checkRateLimit("DIAGNOSTIC", { ip: null, email }, NOW);
    expect(refused.ok).toBe(false);
  });

  it("protège une adresse même si l'attaquant change d'IP", async () => {
    // C'est précisément le scénario du bombardement d'email : mille IP, une
    // seule victime.
    const email = freshEmail();
    for (let i = 0; i < emailCap("SIGN_IN"); i++) {
      await checkRateLimit("SIGN_IN", { ip: freshIp(), email }, NOW);
    }
    const refused = await checkRateLimit("SIGN_IN", { ip: freshIp(), email }, NOW);
    expect(refused.ok).toBe(false);
  });
});

describe("limite par adresse IP", () => {
  it("arrête un script qui essaie des adresses différentes", async () => {
    const ip = freshIp();
    for (let i = 0; i < RATE_LIMITS.DIAGNOSTIC.perIp; i++) {
      const verdict = await checkRateLimit("DIAGNOSTIC", { ip, email: freshEmail() }, NOW);
      expect(verdict.ok, `tentative ${i + 1}`).toBe(true);
    }
    const refused = await checkRateLimit("DIAGNOSTIC", { ip, email: freshEmail() }, NOW);
    expect(refused.ok).toBe(false);
  });

  it("n'applique aucune limite commune quand l'IP est inconnue", async () => {
    // Rabattre les IP inconnues sur une clé partagée bloquerait tout le monde
    // dès qu'un seul visiteur dépasse.
    for (let i = 0; i < RATE_LIMITS.DIAGNOSTIC.perIp + 5; i++) {
      const verdict = await checkRateLimit("DIAGNOSTIC", { ip: null, email: freshEmail() }, NOW);
      expect(verdict.ok, `tentative ${i + 1}`).toBe(true);
    }
  });
});

describe("fenêtre glissante", () => {
  it("libère après la fenêtre", async () => {
    const email = freshEmail();
    const perEmail = emailCap("DIAGNOSTIC");
    const { windowMinutes } = RATE_LIMITS.DIAGNOSTIC;

    for (let i = 0; i < perEmail; i++) {
      await checkRateLimit("DIAGNOSTIC", { ip: null, email }, NOW);
    }
    expect((await checkRateLimit("DIAGNOSTIC", { ip: null, email }, NOW)).ok).toBe(false);

    // Une minute après la sortie de fenêtre, le compteur est vide.
    expect(
      (await checkRateLimit("DIAGNOSTIC", { ip: null, email }, later(windowMinutes + 1))).ok
    ).toBe(true);
  });

  it("l'acharnement prolonge le blocage", async () => {
    // Les tentatives refusées sont comptées : sinon la fenêtre se viderait
    // pendant qu'un script frappe, et le plafond ne tiendrait jamais.
    const email = freshEmail();
    const perEmail = emailCap("DIAGNOSTIC");
    const { windowMinutes } = RATE_LIMITS.DIAGNOSTIC;

    for (let i = 0; i < perEmail + 5; i++) {
      await checkRateLimit("DIAGNOSTIC", { ip: null, email }, later(i));
    }
    // La dernière tentative est récente : la fenêtre n'est pas vide.
    expect((await checkRateLimit("DIAGNOSTIC", { ip: null, email }, later(windowMinutes))).ok).toBe(
      false
    );
  });
});

describe("cloisonnement des périmètres", () => {
  it("saturer le diagnostic ne bloque pas la connexion", async () => {
    const email = freshEmail();
    for (let i = 0; i < emailCap("DIAGNOSTIC") + 2; i++) {
      await checkRateLimit("DIAGNOSTIC", { ip: null, email }, NOW);
    }
    expect((await checkRateLimit("SIGN_IN", { ip: null, email }, NOW)).ok).toBe(true);
  });
});

describe("adresse de l'appelant", () => {
  const withHeaders = (entries: Record<string, string>) => new Headers(entries);

  it("retient le premier élément de x-forwarded-for", () => {
    // Les suivants sont les proxys traversés ; le client d'origine est en tête.
    expect(callerIp(withHeaders({ "x-forwarded-for": "203.0.113.7, 70.41.3.18" }))).toBe(
      "203.0.113.7"
    );
  });

  it("tolère les espaces", () => {
    expect(callerIp(withHeaders({ "x-forwarded-for": "  203.0.113.9  " }))).toBe("203.0.113.9");
  });

  it("retombe sur x-real-ip", () => {
    expect(callerIp(withHeaders({ "x-real-ip": "198.51.100.4" }))).toBe("198.51.100.4");
  });

  it("rend null plutôt qu'une valeur inventée", () => {
    expect(callerIp(withHeaders({}))).toBeNull();
    expect(callerIp(withHeaders({ "x-forwarded-for": "" }))).toBeNull();
  });
});

describe("purge", () => {
  it("efface les tentatives périmées et conserve les récentes", async () => {
    const ancien = freshEmail();
    const recent = freshEmail();

    await checkRateLimit("DIAGNOSTIC", { ip: null, email: ancien }, NOW);
    await checkRateLimit("DIAGNOSTIC", { ip: null, email: recent }, later(HIT_RETENTION_MINUTES));

    // Purge au moment où seule la première tentative est périmée.
    await purgeRateLimitHits(later(HIT_RETENTION_MINUTES + 1));

    // L'ancienne clé repart de zéro : son plafond est de nouveau entier.
    for (let i = 0; i < emailCap("DIAGNOSTIC"); i++) {
      const verdict = await checkRateLimit(
        "DIAGNOSTIC",
        { ip: null, email: ancien },
        later(HIT_RETENTION_MINUTES + 2)
      );
      expect(verdict.ok, `tentative ${i + 1}`).toBe(true);
    }
  });
});
