import { describe, it, expect, vi, afterEach } from "vitest";
import { log, redact, reportServerError, LOG_EVENTS } from "./log";

/**
 * Ce que ces tests protègent : un journal ne passe sous aucun garde-fou.
 * `check:legal` ne voit que les modèles Prisma, l'effacement du compte ne
 * touche pas les fichiers de sortie du serveur. Si une donnée personnelle
 * entre ici, rien d'autre ne le signalera.
 */

function captureLines(level: "log" | "warn" | "error") {
  const lines: string[] = [];
  vi.spyOn(console, level).mockImplementation((...args: unknown[]) => {
    lines.push(String(args[0]));
  });
  return lines;
}

afterEach(() => {
  vi.restoreAllMocks();
  delete process.env.ADMITTO_ERROR_WEBHOOK;
});

describe("redact", () => {
  it("remplace une adresse email, ne la tronque pas", () => {
    // Une adresse tronquée reste une adresse : « camille.durand@ » désigne
    // toujours quelqu'un.
    const out = redact("échec pour camille.durand@exemple.fr lors de l'envoi");
    expect(out).not.toContain("camille.durand");
    expect(out).not.toContain("exemple.fr");
    expect(out).toContain("[courriel]");
  });

  it("remplace plusieurs adresses dans la même chaîne", () => {
    const out = redact("a@b.fr et c@d.com");
    expect(out).toBe("[courriel] et [courriel]");
  });

  it("remplace les jetons opaques, qui sont des capacités dans ce produit", () => {
    // L'identifiant d'une évaluation ouvre la page de résultat à qui le
    // détient : journalisé, il transformerait le journal en trousseau.
    const out = redact("rapport clx7k2p9a0000abcd1234efgh introuvable");
    expect(out).not.toContain("clx7k2p9a0000abcd1234efgh");
    expect(out).toContain("[identifiant]");
  });

  it("laisse intact un texte sans donnée personnelle", () => {
    expect(redact("signature invalide")).toBe("signature invalide");
  });

  it("préserve les noms de classe d'erreur, longs mais sans chiffre", () => {
    // C'est le champ sur lequel on trie une erreur. Une première version le
    // remplaçait par « [identifiant] » : le journal devenait inutile au moment
    // précis où on l'ouvre.
    for (const nom of [
      "PrismaClientInitializationError",
      "PrismaClientKnownRequestError",
      "UnhandledPromiseRejection",
    ]) {
      expect(redact(nom)).toBe(nom);
    }
  });

  it("remplace un uuid, qui mêle lettres et chiffres", () => {
    const out = redact("session 550e8400-e29b-41d4-a716-446655440000 expirée");
    expect(out).not.toContain("550e8400");
    expect(out).toContain("[identifiant]");
  });

  it("préserve le digest, seul lien entre l'écran vu et la ligne du journal", () => {
    // Redigé, il romprait la corrélation sans que rien ne le signale.
    expect(redact("844318385")).toBe("844318385");
  });

  it("borne la longueur : une ligne démesurée n'est plus lue", () => {
    expect(redact("x".repeat(500)).length).toBeLessThanOrEqual(201);
  });
});

describe("log", () => {
  it("écrit une seule ligne de JSON valide", () => {
    const lines = captureLines("log");
    log("info", "cron.done", { duree: 12, ok: true });

    expect(lines).toHaveLength(1);
    expect(lines[0]).not.toContain("\n");
    const parsed = JSON.parse(lines[0]);
    expect(parsed).toMatchObject({ level: "info", event: "cron.done", duree: 12, ok: true });
    expect(typeof parsed.at).toBe("string");
  });

  it("caviarde les chaînes passées en champ", () => {
    const lines = captureLines("warn");
    log("warn", "stripe.rejected", { motif: "rapport de jean@exemple.fr absent" });
    expect(lines[0]).not.toContain("jean@exemple.fr");
    expect(lines[0]).toContain("[courriel]");
  });

  it("dirige les erreurs vers la sortie d'erreur", () => {
    const out = captureLines("log");
    const err = captureLines("error");
    log("error", "server.error", {});
    expect(out).toHaveLength(0);
    expect(err).toHaveLength(1);
  });

  it("ne jette jamais, même sur un champ non sérialisable", () => {
    const lines = captureLines("log");
    const cyclique: Record<string, unknown> = {};
    cyclique.self = cyclique;
    // Un journal qui fait tomber la requête qu'il décrit transforme un
    // incident observable en panne.
    expect(() =>
      log("info", "cron.done", { boucle: cyclique as unknown as string })
    ).not.toThrow();
    expect(JSON.parse(lines[0]).serialisation).toBe(false);
  });

  it("ignore les champs absents plutôt que d'écrire null", () => {
    const lines = captureLines("log");
    log("info", "auth.signin", { rattaches: 0, digest: undefined });
    expect(Object.keys(JSON.parse(lines[0]))).not.toContain("digest");
  });
});

describe("reportServerError", () => {
  const champs = { route: "/rapport/[id]", method: "GET", name: "TypeError", digest: "abc123" };

  it("journalise le message localement", async () => {
    const lines = captureLines("error");
    await reportServerError(champs, "connexion perdue");
    expect(JSON.parse(lines[0]).message).toBe("connexion perdue");
  });

  it("reste inerte sans ADMITTO_ERROR_WEBHOOK", async () => {
    captureLines("error");
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    await reportServerError(champs);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("n'envoie JAMAIS le message d'erreur au webhook", async () => {
    captureLines("error");
    process.env.ADMITTO_ERROR_WEBHOOK = "https://exemple.test/alerte";
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 204 }));

    await reportServerError(champs, "Assessment camille@exemple.fr introuvable");

    const body = JSON.parse(String(fetchSpy.mock.calls[0]?.[1]?.body));
    // Ce qui quitte la machine est plus pauvre que ce qui reste dessus : un
    // message d'erreur cite les valeurs qui l'ont causé.
    expect(body).not.toHaveProperty("message");
    expect(JSON.stringify(body)).not.toContain("camille");
    expect(body.digest).toBe("abc123");
    expect(body.route).toBe("/rapport/[id]");
  });

  it("survit à un webhook injoignable", async () => {
    captureLines("error");
    process.env.ADMITTO_ERROR_WEBHOOK = "https://exemple.test/alerte";
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("réseau"));
    // Perdre l'alerte est acceptable ; perdre la requête ne l'est pas.
    await expect(reportServerError(champs)).resolves.toBeUndefined();
  });
});

describe("union fermée des événements", () => {
  it("ne contient pas de doublon", () => {
    expect(new Set(LOG_EVENTS).size).toBe(LOG_EVENTS.length);
  });
});
