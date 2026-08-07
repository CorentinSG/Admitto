import { existsSync, readFileSync } from "node:fs";
import { rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { decideUpload, detectSensitiveCategory, extensionOf } from "./policy";
import { storageKeyFor, vaultStorage } from "./storage";
import {
  ALLOWED_EXTENSIONS,
  DOCUMENT_TYPES,
  MAX_DOCUMENTS_PER_TYPE,
  MAX_FILE_BYTES,
  REFUSED_CATEGORIES,
} from "./types";

const candidate = (over: Partial<Parameters<typeof decideUpload>[0]> = {}) => ({
  type: "CV",
  fileName: "cv-corentin.pdf",
  sizeBytes: 120_000,
  existingOfType: 0,
  ...over,
});

describe("liste fermée des types (CDC §29)", () => {
  it("n'accepte que les cinq types du cahier des charges", () => {
    expect([...DOCUMENT_TYPES]).toEqual([
      "CV",
      "PERSONAL_STATEMENT",
      "SCHOOL_LIST",
      "WORKING_DOC",
      "CHECKLIST",
    ]);
  });

  it("refuse un type inventé", () => {
    const decision = decideUpload(candidate({ type: "PASSPORT" }));
    expect(decision).toMatchObject({ accepted: false, reason: "UNKNOWN_TYPE" });
  });

  it("accepte chacun des cinq types", () => {
    for (const type of DOCUMENT_TYPES) {
      expect(decideUpload(candidate({ type })).accepted).toBe(true);
    }
  });
});

describe("détection des pièces sensibles", () => {
  const sensitive: Array<[string, string]> = [
    ["passeport-corentin.pdf", "Passeport et pièces d'identité"],
    ["Passport_scan.pdf", "Passeport et pièces d'identité"],
    ["carte d'identité recto.pdf", "Passeport et pièces d'identité"],
    ["character-and-fitness-questionnaire.pdf", "Dossier Character and Fitness"],
    ["certificat medical.pdf", "Documents médicaux ou disciplinaires"],
    ["casier judiciaire.pdf", "Documents médicaux ou disciplinaires"],
    ["releve bancaire janvier.pdf", "Relevés bancaires et pièces financières sensibles"],
    ["bank statement 2026.pdf", "Relevés bancaires et pièces financières sensibles"],
    ["avis d'imposition 2025.pdf", "Relevés bancaires et pièces financières sensibles"],
    ["I-20 Columbia.pdf", "Dossiers de visa complets"],
    ["ds-160 confirmation.pdf", "Dossiers de visa complets"],
    ["dossier visa complet.pdf", "Dossiers de visa complets"],
  ];

  it.each(sensitive)("refuse « %s »", (fileName, category) => {
    expect(detectSensitiveCategory(fileName)).toBe(category);
    expect(decideUpload(candidate({ fileName }))).toMatchObject({
      accepted: false,
      reason: "SENSITIVE_CONTENT",
      detail: category,
    });
  });

  it("chaque catégorie annoncée à l'utilisateur est effectivement détectable", () => {
    const detectable = new Set(sensitive.map(([, category]) => category));
    for (const category of REFUSED_CATEGORIES) {
      expect(detectable.has(category)).toBe(true);
    }
  });

  it("normalise accents, casse et séparateurs", () => {
    expect(detectSensitiveCategory("RELEVÉ_BANCAIRE.PDF")).not.toBeNull();
    expect(detectSensitiveCategory("Relevé bancaire.pdf")).not.toBeNull();
  });

  it("laisse passer une checklist de démarches visa", () => {
    // Le CDC ne refuse que le dossier de visa complet : une checklist est le
    // cœur du produit, la refuser viderait le coffre de son usage.
    expect(detectSensitiveCategory("checklist-demarches-visa.pdf")).toBeNull();
    expect(decideUpload(candidate({ type: "CHECKLIST", fileName: "checklist-demarches-visa.pdf" })).accepted).toBe(
      true
    );
  });

  it("laisse passer un personal statement qui évoque son parcours", () => {
    expect(detectSensitiveCategory("personal-statement-v3.docx")).toBeNull();
    expect(detectSensitiveCategory("liste-ecoles-financement.csv")).toBeNull();
  });

  it("refuse avant toute écriture, quel que soit le type déclaré", () => {
    // Déclarer un passeport comme « document de travail » ne le fait pas passer.
    for (const type of DOCUMENT_TYPES) {
      expect(decideUpload(candidate({ type, fileName: "passeport.pdf" }))).toMatchObject({
        accepted: false,
        reason: "SENSITIVE_CONTENT",
      });
    }
  });
});

describe("formats et tailles", () => {
  it("accepte les extensions de la liste", () => {
    for (const extension of ALLOWED_EXTENSIONS) {
      expect(decideUpload(candidate({ fileName: `document${extension}` })).accepted).toBe(true);
    }
  });

  it("refuse les images — un scan de pièce d'identité en est une", () => {
    for (const fileName of ["scan.jpg", "photo.png", "piece.heic", "page.tiff"]) {
      expect(decideUpload(candidate({ fileName }))).toMatchObject({
        accepted: false,
        reason: "EXTENSION_NOT_ALLOWED",
      });
    }
  });

  it("refuse une archive et un exécutable", () => {
    for (const fileName of ["dossier.zip", "script.sh", "installeur.exe"]) {
      expect(decideUpload(candidate({ fileName })).accepted).toBe(false);
    }
  });

  it("refuse un fichier sans extension", () => {
    expect(decideUpload(candidate({ fileName: "monfichier" }))).toMatchObject({
      accepted: false,
      reason: "EXTENSION_NOT_ALLOWED",
      detail: "sans extension",
    });
  });

  it("ignore la casse de l'extension", () => {
    expect(extensionOf("CV.PDF")).toBe(".pdf");
    expect(decideUpload(candidate({ fileName: "CV.PDF" })).accepted).toBe(true);
  });

  it("refuse un fichier vide et un fichier trop lourd", () => {
    expect(decideUpload(candidate({ sizeBytes: 0 }))).toMatchObject({ accepted: false, reason: "EMPTY" });
    expect(decideUpload(candidate({ sizeBytes: MAX_FILE_BYTES + 1 }))).toMatchObject({
      accepted: false,
      reason: "TOO_LARGE",
    });
    expect(decideUpload(candidate({ sizeBytes: MAX_FILE_BYTES })).accepted).toBe(true);
  });
});

describe("clé de stockage", () => {
  it("ne contient jamais le nom d'origine du fichier", () => {
    const key = storageKeyFor("assess-1", "doc-1", ".pdf");
    expect(key).toBe("assess-1/doc-1.pdf");
  });

  it("neutralise une tentative de traversée de répertoire", () => {
    expect(storageKeyFor("../../etc", "../passwd", ".pdf")).toBe("etc/passwd.pdf");
  });

  it("n'écrit sur le disque qu'une extension de la liste autorisée", () => {
    expect(storageKeyFor("a", "b", ".php")).toBe("a/b");
    expect(storageKeyFor("a", "b", ".pdf.exe")).toBe("a/b");
    expect(storageKeyFor("a", "b", "")).toBe("a/b");
    expect(storageKeyFor("a", "b", ".PDF")).toBe("a/b.pdf");
  });
});

describe("quota par type", () => {
  it("refuse au-delà de la limite", () => {
    expect(decideUpload(candidate({ existingOfType: MAX_DOCUMENTS_PER_TYPE - 1 })).accepted).toBe(true);
    expect(decideUpload(candidate({ existingOfType: MAX_DOCUMENTS_PER_TYPE }))).toMatchObject({
      accepted: false,
      reason: "TOO_MANY",
    });
  });

  it("le quota ne prime jamais sur le refus d'une pièce sensible", () => {
    // L'ordre compte : si le quota était évalué d'abord, un coffre plein
    // renverrait « trop de documents » pour un passeport, message qui invite
    // à réessayer après suppression.
    expect(
      decideUpload(candidate({ fileName: "passeport.pdf", existingOfType: MAX_DOCUMENTS_PER_TYPE }))
    ).toMatchObject({ accepted: false, reason: "SENSITIVE_CONTENT" });
  });
});

describe("relecture d'une pièce déposée", () => {
  /*
   * Le coffre écrivait sans jamais relire. Rien ne le signalait : l'écran
   * listait un nom, une date et un bouton « Retirer », si bien que le seul
   * geste possible sur un document était de le détruire. Les octets restaient
   * pourtant sur le disque — conserver un fichier dont personne ne peut rien
   * faire est le contraire de la minimisation.
   */
  const ROUTE = readFileSync("app/(app)/app/documents/[id]/route.ts", "utf8");

  it("sert la pièce en fichier joint, jamais rendue dans le navigateur", () => {
    // L'extension est contrôlée au dépôt, PAS le contenu : un fichier nommé
    // `.pdf` peut porter du HTML. En pièce jointe, il ne s'exécute pas.
    expect(ROUTE).toMatch(/attachment;/);
    expect(ROUTE).toMatch(/application\/octet-stream/);
    // Un type déduit de l'extension rouvrirait exactement ce que le point
    // précédent ferme.
    expect(ROUTE).not.toMatch(/text\/html|extensionOf|lookup\(/);
  });

  it("répond « introuvable » et jamais « interdit »", () => {
    // Un 403 apprendrait à qui devine un identifiant que le document existe.
    const statuts = [...ROUTE.matchAll(/status:\s*(\d{3})/g)].map((m) => m[1]);
    expect(statuts.length).toBeGreaterThan(0);
    expect([...new Set(statuts)]).toEqual(["404"]);
  });

  it("ne met en cache nulle part une pièce personnelle", () => {
    expect(ROUTE).toMatch(/no-store/);
  });

  it("vit sous le chemin que le middleware protège", () => {
    // Le middleware ne couvre que `/admin` et `/app`. Sous `/api`, la même
    // route serait ouverte par défaut — l'inverse de la règle du projet.
    expect(existsSync("app/(app)/app/documents/[id]/route.ts")).toBe(true);
    expect(existsSync("app/api/documents/[id]/route.ts")).toBe(false);
  });
});

describe("effacement des pièces d'une évaluation", () => {
  /*
   * Les chemins d'effacement (compte supprimé, purge de rétention) suppriment
   * les lignes, et la cascade du schéma emporte les lignes `Document` — mais
   * les OCTETS sous `ADMITTO_VAULT_DIR` n'étaient retirés nulle part ailleurs
   * que par le bouton « Retirer ». Après un effacement de compte, le CV et le
   * personal statement restaient sur le disque, orphelins : plus aucune ligne
   * ne les désignait, plus personne ne pouvait les supprimer — la donnée
   * qu'aucun geste humain ne peut retirer, exactement ce que la rétention
   * existe pour empêcher.
   */
  const base = join(tmpdir(), `admitto-vault-test-${process.pid}`);

  beforeEach(async () => {
    vi.stubEnv("ADMITTO_VAULT_DIR", base);
    await rm(base, { recursive: true, force: true });
  });

  afterEach(async () => {
    vi.unstubAllEnvs();
    await rm(base, { recursive: true, force: true });
  });

  it("retire toutes les pièces de l'évaluation, et n'en laisse aucune", async () => {
    await vaultStorage.put(storageKeyFor("efface-1", "doc-a", ".pdf"), new Uint8Array([1]));
    await vaultStorage.put(storageKeyFor("efface-1", "doc-b", ".docx"), new Uint8Array([2]));

    await vaultStorage.removeAll("efface-1");

    expect(await vaultStorage.get(storageKeyFor("efface-1", "doc-a", ".pdf"))).toBeNull();
    expect(await vaultStorage.get(storageKeyFor("efface-1", "doc-b", ".docx"))).toBeNull();
    expect(existsSync(join(base, "efface-1"))).toBe(false);
  });

  it("ne touche pas aux pièces des autres évaluations", async () => {
    await vaultStorage.put(storageKeyFor("efface-2", "doc", ".pdf"), new Uint8Array([1]));
    await vaultStorage.put(storageKeyFor("voisine", "doc", ".pdf"), new Uint8Array([9]));

    await vaultStorage.removeAll("efface-2");

    expect(await vaultStorage.get(storageKeyFor("voisine", "doc", ".pdf"))).not.toBeNull();
  });

  it("est idempotent : effacer ce qui n'existe pas n'échoue pas", async () => {
    await expect(vaultStorage.removeAll("jamais-vue")).resolves.toBeUndefined();
  });

  it("un identifiant réduit à rien n'efface jamais la racine du coffre", async () => {
    // L'identifiant est assaini avant de devenir un chemin ; réduit à vide,
    // le geste viserait le répertoire du coffre ENTIER.
    await vaultStorage.put(storageKeyFor("voisine-2", "doc", ".pdf"), new Uint8Array([9]));

    await vaultStorage.removeAll("../..");
    await vaultStorage.removeAll("");

    expect(await vaultStorage.get(storageKeyFor("voisine-2", "doc", ".pdf"))).not.toBeNull();
  });

  it("les deux chemins d'effacement retirent les fichiers AVANT les lignes", () => {
    /*
     * Le contrat traverse deux modules ; le vérifier en base exigerait
     * PostgreSQL et un compte. Le garde-fou lit donc la source, comme celui de
     * la copie du rapport : chaque chemin d'effacement appelle `removeAll`, et
     * l'appelle avant `deleteMany` — interrompu entre les deux, l'effacement
     * doit laisser des lignes sans octets, jamais des octets sans lignes.
     */
    for (const file of ["lib/legal/personal-data.ts", "lib/legal/retention.ts"]) {
      const source = readFileSync(file, "utf8");
      const removeAt = source.indexOf("vaultStorage.removeAll");
      const deleteAt = source.indexOf(".deleteMany");
      expect(removeAt, `${file} n'efface pas les fichiers du coffre`).toBeGreaterThan(-1);
      expect(removeAt, `${file} : les fichiers doivent partir avant les lignes`).toBeLessThan(deleteAt);
    }
  });
});
