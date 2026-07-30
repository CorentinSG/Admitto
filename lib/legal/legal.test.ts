import { describe, expect, it } from "vitest";
import { LEGAL_DOCUMENTS, legalDocument } from "@/content/legal";
import { HELD_DATA, donnees } from "@/content/donnees";
import { footer } from "@/content/homepage";
import { isComplete, isPending, missingEntries, PENDING } from "./types";
import { UNCLAIMED_RETENTION_MONTHS, unclaimedCutoff } from "./retention";

describe("documents légaux", () => {
  it("couvre exactement les trois adresses du pied de page", () => {
    const legalColumn = footer.columns.find((column) => column.title === "LÉGAL");
    const linked = legalColumn!.links.map((link) => link.href.replace(/^\//, ""));

    // Le pied de page renvoyait vers ces adresses avant qu'elles n'existent :
    // le test verrouille l'égalité dans les deux sens, un lien orphelin comme
    // une page inaccessible.
    expect(linked.sort()).toEqual(LEGAL_DOCUMENTS.map((d) => d.slug).sort());
  });

  it("résout chaque document par son identifiant", () => {
    for (const document of LEGAL_DOCUMENTS) {
      expect(legalDocument(document.slug)).toBe(document);
    }
    expect(legalDocument("inconnu")).toBeUndefined();
  });

  it("ne contient aucune section vide", () => {
    for (const document of LEGAL_DOCUMENTS) {
      expect(document.sections.length).toBeGreaterThan(0);
      for (const section of document.sections) {
        expect(section.blocks.length, `${document.slug}/${section.id}`).toBeGreaterThan(0);
      }
    }
  });

  it("porte des identifiants de section uniques", () => {
    for (const document of LEGAL_DOCUMENTS) {
      const ids = document.sections.map((section) => section.id);
      expect(new Set(ids).size, document.slug).toBe(ids.length);
    }
  });
});

describe("mentions à compléter", () => {
  it("traite une valeur vide comme manquante", () => {
    // Une chaîne vide s'affiche exactement comme une mention absente : la
    // traiter comme fournie ferait passer un document incomplet pour publiable.
    expect(isPending("")).toBe(true);
    expect(isPending("   ")).toBe(true);
    expect(isPending(PENDING)).toBe(true);
    expect(isPending("SAS Admitto")).toBe(false);
  });

  it("remonte les mentions manquantes dans l'ordre du document", () => {
    const mentions = legalDocument("mentions-legales")!;
    const missing = missingEntries(mentions);

    expect(missing.length).toBeGreaterThan(0);
    expect(isComplete(mentions)).toBe(false);
    // Chaque mention manquante dit à quoi elle sert : sans cela, celui qui
    // complète devine ce qu'on attend de lui.
    for (const entry of missing) {
      expect(entry.why, entry.label).toBeTruthy();
    }
  });

  it("exige les mentions imposées par la LCEN", () => {
    const labels = missingEntries(legalDocument("mentions-legales")!).map((e) => e.label);
    for (const required of ["Dénomination sociale", "Siège social", "Hébergeur"]) {
      expect(
        labels.some((label) => label.includes(required)),
        required
      ).toBe(true);
    }
  });

  it("réclame un médiateur de la consommation dans les conditions générales", () => {
    // Obligatoire pour un professionnel vendant à des consommateurs : l'oubli
    // ne se voit pas à la lecture, d'où le test.
    const labels = missingEntries(legalDocument("conditions-generales")!).map((e) => e.label);
    expect(labels.some((label) => label.includes("Médiateur"))).toBe(true);
  });
});

describe("politique de confidentialité", () => {
  const policy = legalDocument("confidentialite")!;
  const tables = policy.sections
    .flatMap((section) => section.blocks)
    .filter((block) => block.kind === "TABLE");

  it("donne une base légale à chaque traitement", () => {
    const processing = tables.find((table) => table.columns[2].includes("Base légale"))!;
    expect(processing.rows.length).toBeGreaterThan(5);
    for (const [data, , basis] of processing.rows) {
      expect(basis.trim(), data).not.toBe("");
    }
  });

  it("fonde les emails d'information sur le consentement, jamais sur le contrat", () => {
    const processing = tables.find((table) => table.columns[2].includes("Base légale"))!;
    const marketing = processing.rows.find((row) => row[0].includes("Emails d'information"))!;
    expect(marketing[2]).toContain("Consentement");
  });

  it("annonce une durée pour chaque catégorie conservée", () => {
    const retention = tables.find((table) => table.columns[1].includes("Durée"))!;
    for (const [data, duration] of retention.rows) {
      expect(duration.trim(), data).not.toBe("");
    }
  });

  it("annonce la durée effectivement appliquée aux diagnostics non rattachés", () => {
    const retention = tables.find((table) => table.columns[1].includes("Durée"))!;
    const unclaimed = retention.rows.find((row) => row[0].includes("jamais rattaché"))!;
    // Le texte publié et le code doivent dire la même chose : une politique qui
    // annonce douze mois pendant que la purge en applique vingt-quatre est une
    // information trompeuse, et rien ne le signalerait.
    expect(unclaimed[1]).toContain(String(UNCLAIMED_RETENTION_MONTHS));
  });
});

describe("rétention des diagnostics non rattachés", () => {
  it("calcule un seuil antérieur de la durée annoncée", () => {
    const reference = new Date("2026-07-30T12:00:00.000Z");
    expect(unclaimedCutoff(reference).toISOString()).toBe("2025-07-30T12:00:00.000Z");
  });

  it("ne modifie pas la date de référence reçue", () => {
    // La date passée vient souvent de l'appelant qui s'en sert ensuite : la
    // muter décalerait silencieusement tout ce qui suit.
    const reference = new Date("2026-07-30T12:00:00.000Z");
    unclaimedCutoff(reference);
    expect(reference.toISOString()).toBe("2026-07-30T12:00:00.000Z");
  });
});

describe("page « Vos données »", () => {
  it("énumère ce qui est détenu", () => {
    expect(HELD_DATA.length).toBeGreaterThan(5);
  });

  it("demande un mot de confirmation avant l'effacement", () => {
    expect(donnees.erase.confirmWord.trim()).not.toBe("");
    expect(donnees.erase.confirmLabel).toContain(donnees.erase.confirmWord);
  });

  it("dit que la suppression est définitive avant de la proposer", () => {
    expect(donnees.erase.body).toMatch(/définitive/i);
    // Proposer d'effacer sans rappeler d'exporter d'abord ferait perdre à
    // quelqu'un la seule copie de son travail.
    expect(donnees.erase.hint).toMatch(/télécharg/i);
  });

  it("renvoie vers la politique de confidentialité", () => {
    expect(donnees.other.href).toBe("/confidentialite");
    expect(LEGAL_DOCUMENTS.some((d) => `/${d.slug}` === donnees.other.href)).toBe(true);
  });
});
