import { describe, it, expect, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { publicBaseUrl, isPublicSite, canonical } from "./site";
import { INDEXABLE_PATHS } from "@/content/pages";

const ORIGINAL = process.env.ADMITTO_BASE_URL;
afterEach(() => {
  if (ORIGINAL === undefined) delete process.env.ADMITTO_BASE_URL;
  else process.env.ADMITTO_BASE_URL = ORIGINAL;
});

describe("publicBaseUrl", () => {
  it("rend null sans variable : le site n'est pas public par défaut", () => {
    delete process.env.ADMITTO_BASE_URL;
    expect(publicBaseUrl()).toBeNull();
    expect(isPublicSite()).toBe(false);
  });

  it("rend null pour une adresse locale", () => {
    // Une prévisualisation indexée concurrence le site réel sur ses propres
    // termes, et se retire lentement.
    for (const local of [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://0.0.0.0:3000",
      "https://localhost",
    ]) {
      process.env.ADMITTO_BASE_URL = local;
      expect(publicBaseUrl(), local).toBeNull();
    }
  });

  it("rend null pour une valeur mal formée plutôt qu'un sitemap d'URL cassées", () => {
    for (const invalide of ["pas-une-url", "ftp://exemple.fr", "   "]) {
      process.env.ADMITTO_BASE_URL = invalide;
      expect(publicBaseUrl(), invalide).toBeNull();
    }
  });

  it("retire la barre finale, pour ne pas produire d'URL à double barre", () => {
    process.env.ADMITTO_BASE_URL = "https://admitto.fr/";
    expect(publicBaseUrl()).toBe("https://admitto.fr");
  });
});

describe("canonical", () => {
  it("n'émet rien quand le domaine est inconnu", () => {
    // Plutôt qu'une canonique relative, qui a l'air correcte sans remplir son
    // rôle : la balise est là, elle a un href, et elle n'affirme rien.
    delete process.env.ADMITTO_BASE_URL;
    expect(canonical("/offres")).toBeUndefined();
  });

  it("émet une URL absolue, racine comprise", () => {
    process.env.ADMITTO_BASE_URL = "https://admitto.fr";
    expect(canonical("/offres")).toEqual({ canonical: "https://admitto.fr/offres" });
    // La racine ne doit pas produire « https://admitto.fr/ » avec une barre
    // seule : c'est une URL différente pour un moteur de recherche.
    expect(canonical("/")).toEqual({ canonical: "https://admitto.fr" });
  });
});

describe("parité avec la suite SEO", () => {
  it("audite exactement les pages déclarées indexables", () => {
    // Le script est en JavaScript et ne peut pas importer le contenu : sans ce
    // test, une page ajoutée à INDEXABLE_PATHS n'aurait jamais de note et rien
    // ne le signalerait.
    const source = readFileSync("scripts/verify-seo.mjs", "utf8");
    const bloc = source.slice(source.indexOf("const PAGES = ["));
    const audites = [...bloc.slice(0, bloc.indexOf("];")).matchAll(/"([^"]+)"/g)].map((m) => m[1]);
    expect(audites).toEqual([...INDEXABLE_PATHS]);
  });
});
