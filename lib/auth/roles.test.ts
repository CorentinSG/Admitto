import { describe, expect, it } from "vitest";
import { BACKOFFICE_ROLES, ROLES, authConfig, isBackofficeRole } from "@/auth.config";

/**
 * Rôles et destination après connexion (CDC §10 et §33).
 *
 * Les callbacks sont testés directement : ils décident de l'accès au
 * back-office et de la page d'atterrissage, deux comportements qu'aucune
 * vérification navigateur ne peut couvrir exhaustivement.
 */

describe("rôles", () => {
  it("n'expose que trois rôles", () => {
    expect([...ROLES]).toEqual(["CLIENT", "REVIEWER", "ADMIN"]);
  });

  it("n'ouvre le back-office qu'aux rôles prévus", () => {
    expect(isBackofficeRole("ADMIN")).toBe(true);
    expect(isBackofficeRole("REVIEWER")).toBe(true);
    expect(isBackofficeRole("CLIENT")).toBe(false);
  });

  it("un rôle inconnu n'ouvre rien", () => {
    // Un jeton forgé portant « SUPERADMIN » ne doit pas passer par défaut.
    for (const forged of ["SUPERADMIN", "admin", "", "root"]) {
      expect(isBackofficeRole(forged), forged).toBe(false);
    }
  });

  it("la liste du back-office et le contrôle disent la même chose", () => {
    for (const role of ROLES) {
      expect(BACKOFFICE_ROLES.includes(role)).toBe(isBackofficeRole(role));
    }
  });
});

describe("jeton", () => {
  const jwt = authConfig.callbacks.jwt;

  it("porte le rôle lu en base à la connexion", async () => {
    const token = await jwt({
      token: {},
      user: { id: "u1", role: "ADMIN" },
    } as never);
    expect(token).toMatchObject({ userId: "u1", role: "ADMIN" });
  });

  it("retombe sur CLIENT quand le compte ne porte pas de rôle", async () => {
    // Un compte sans rôle ne doit jamais hériter d'un privilège par défaut.
    const token = await jwt({ token: {}, user: { id: "u2" } } as never);
    expect(token).toMatchObject({ role: "CLIENT" });
  });

  it("ne réécrit pas le jeton hors connexion", async () => {
    const token = await jwt({ token: { userId: "u3", role: "REVIEWER" } } as never);
    expect(token).toMatchObject({ userId: "u3", role: "REVIEWER" });
  });
});

describe("destination après connexion", () => {
  const redirect = authConfig.callbacks.redirect;
  const baseUrl = "https://admitto.app";

  it("accepte un chemin relatif", async () => {
    expect(await redirect({ url: "/app/roadmap", baseUrl } as never)).toBe(
      "https://admitto.app/app/roadmap"
    );
  });

  it("accepte une URL de même origine", async () => {
    expect(await redirect({ url: `${baseUrl}/app/documents`, baseUrl } as never)).toBe(
      `${baseUrl}/app/documents`
    );
  });

  it("ne redirige jamais hors du site", async () => {
    for (const hostile of [
      "https://exemple-malveillant.test/app/dashboard",
      "https://admitto.app.exemple.test/app/dashboard",
      "//exemple.test",
    ]) {
      const result = await redirect({ url: hostile, baseUrl } as never);
      expect(result.startsWith(baseUrl), hostile).toBe(true);
    }
  });

  it("conserve le chemin demandé dans l'espace payant, sur notre domaine", async () => {
    expect(await redirect({ url: "https://autre.test/app/simulateur", baseUrl } as never)).toBe(
      `${baseUrl}/app/simulateur`
    );
  });

  it("atterrit sur le tableau de bord plutôt que sur l'accueil", async () => {
    // Le défaut d'Auth.js renvoie à l'accueil : la personne qui ouvre son lien
    // se retrouve alors nulle part, sans comprendre pourquoi.
    expect(await redirect({ url: "https://autre.test/", baseUrl } as never)).toBe(
      `${baseUrl}/app/dashboard`
    );
    expect(await redirect({ url: "pas-une-url", baseUrl } as never)).toBe(
      `${baseUrl}/app/dashboard`
    );
  });
});
