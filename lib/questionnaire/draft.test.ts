import { describe, expect, it } from "vitest";
import { draftable, parseDraft, serializeDraft } from "./draft";
import type { Answers } from "./types";

const NOW = new Date("2026-08-02T12:00:00Z");
const jours = (n: number) => new Date(NOW.getTime() - n * 24 * 60 * 60 * 1000);

const COMPLET: Answers = {
  status: "APPLYING",
  education: "M2",
  university: "paris1",
  foreignBar: "NONE",
  careerGoal: "BIG_LAW",
  geoGoal: "KEEP_BOTH",
  budget: "60_100K",
  funding: "BOTH",
  intake: "Y1",
  english: "NOT_STARTED",
  usStatus: "FR_NO_STATUS",
  firstName: "Corentin",
  email: "corentin@example.fr",
  comment: "Je vise New York.",
  consentMarketing: true,
};

describe("brouillon du questionnaire", () => {
  it("n'enregistre AUCUN champ identifiant", () => {
    // Un navigateur est souvent partagé et le brouillon survit à la fermeture
    // de l'onglet : y écrire une adresse serait le contraire de la
    // minimisation appliquée partout ailleurs.
    const kept = draftable(COMPLET);
    expect(kept.firstName).toBeUndefined();
    expect(kept.email).toBeUndefined();
    expect(kept.comment).toBeUndefined();
  });

  it("n'enregistre pas le consentement marketing", () => {
    // Le restaurer reviendrait à le pré-cocher, ce que le CDC §34 interdit.
    expect(draftable(COMPLET).consentMarketing).toBeUndefined();
    expect(serializeDraft(COMPLET, NOW)).not.toContain("consentMarketing");
  });

  it("conserve les onze réponses fermées", () => {
    expect(Object.keys(draftable(COMPLET))).toHaveLength(11);
    expect(parseDraft(serializeDraft(COMPLET, NOW), NOW)).toEqual({
      answers: draftable(COMPLET),
      count: 11,
    });
  });

  it("écarte une valeur qui n'existe plus, et garde le reste", () => {
    // Une option retirée du questionnaire depuis l'enregistrement produirait
    // un profil que les moteurs ne savent pas lire.
    const raw = JSON.stringify({
      version: 1,
      savedAt: NOW.toISOString(),
      answers: { status: "APPLYING", education: "OPTION_DISPARUE", university: "inconnue" },
    });
    expect(parseDraft(raw, NOW)).toEqual({ answers: { status: "APPLYING" }, count: 1 });
  });

  it("refuse un brouillon périmé, futur, ou d'une autre version", () => {
    const at = (date: Date, version = 1) =>
      JSON.stringify({ version, savedAt: date.toISOString(), answers: { status: "APPLYING" } });

    expect(parseDraft(at(jours(6)), NOW)).not.toBeNull();
    expect(parseDraft(at(jours(8)), NOW)).toBeNull();
    expect(parseDraft(at(jours(-1)), NOW)).toBeNull();
    expect(parseDraft(at(NOW, 2), NOW)).toBeNull();
  });

  it("ne propose rien plutôt que de proposer du vide", () => {
    // Rien à reprendre : un bouton « reprendre » qui ne reprend rien coûte
    // plus de confiance qu'il n'en rend.
    expect(serializeDraft({ firstName: "C" }, NOW)).toBeNull();
    expect(parseDraft(null, NOW)).toBeNull();
    expect(parseDraft("{{", NOW)).toBeNull();
    expect(parseDraft(JSON.stringify({ version: 1, savedAt: NOW.toISOString() }), NOW)).toBeNull();
  });
});
