import { describe, expect, it } from "vitest";
import { decideUpload, detectSensitiveCategory, extensionOf } from "./policy";
import { storageKeyFor } from "./storage";
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
