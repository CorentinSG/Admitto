import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { issueAccessToken, verifyAccessToken } from "./session";

const NOW = new Date(Date.UTC(2026, 6, 28));

describe("jeton d'accès à l'espace payant", () => {
  beforeEach(() => vi.stubEnv("ADMITTO_SESSION_SECRET", "secret-de-test"));
  afterEach(() => vi.unstubAllEnvs());

  it("émet un jeton vérifiable qui restitue l'évaluation", async () => {
    const token = (await issueAccessToken("eval-123", NOW))!;
    expect(await verifyAccessToken(token, NOW)).toBe("eval-123");
  });

  it("refuse un jeton forgé", async () => {
    const token = (await issueAccessToken("eval-123", NOW))!;
    const forge = token.replace(/\.[0-9a-f]+$/, ".0000000000000000000000000000000000000000000000000000000000000000");
    expect(await verifyAccessToken(forge, NOW)).toBeNull();
  });

  it("refuse un jeton dont l'identifiant a été changé", async () => {
    const token = (await issueAccessToken("eval-123", NOW))!;
    expect(await verifyAccessToken(token.replace("eval-123", "eval-999"), NOW)).toBeNull();
  });

  it("refuse un jeton expiré", async () => {
    const token = (await issueAccessToken("eval-123", NOW))!;
    const tardif = new Date(Date.UTC(2026, 8, 30)); // au-delà des trente jours
    expect(await verifyAccessToken(token, tardif)).toBeNull();
  });

  it("refuse un jeton mal formé sans lever d'exception", async () => {
    expect(await verifyAccessToken("nimportequoi", NOW)).toBeNull();
    expect(await verifyAccessToken(undefined, NOW)).toBeNull();
    expect(await verifyAccessToken("a.b", NOW)).toBeNull();
  });

  it("est fermé par défaut : sans secret, aucun jeton n'est émis ni accepté", async () => {
    const token = (await issueAccessToken("eval-123", NOW))!;
    vi.stubEnv("ADMITTO_SESSION_SECRET", "");
    expect(await issueAccessToken("eval-123", NOW)).toBeNull();
    expect(await verifyAccessToken(token, NOW)).toBeNull();
  });
});
