import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { assessmentStore } from "./assessments";
import { reportStore } from "./reports";
import { roadmapStore } from "./roadmap";
import { scenarioStore } from "./scenarios";
import { documentStore } from "./documents";
import { noticeStore } from "./notifications";
import { milestoneStore } from "./milestones";
import { consultationStore } from "./consultations";
import { schoolStore } from "./schools";
import { blockRevisionStore, ruleRevisionStore } from "./matrices";
import { prisma, usingDatabase } from "@/lib/db/client";
import { computeAssessment } from "@/lib/assessment/compute";
import { defaultInputs } from "@/lib/simulator/defaults";
import { MAX_SCENARIOS } from "@/lib/simulator/types";
import type { Answers } from "@/lib/questionnaire/types";

/**
 * Contrat commun des stores.
 *
 * Ce fichier tourne contre le backend ACTIF : sans `DATABASE_URL` il couvre
 * l'implémentation en mémoire, avec `DATABASE_URL` il couvre Prisma. C'est ce
 * qui empêche les deux de diverger — une différence de comportement fait
 * échouer la même assertion d'un côté ou de l'autre.
 *
 * Lancer les deux :
 *   npm test
 *   DATABASE_URL=postgresql://… npm test
 */

const ANSWERS: Answers = {
  status: "APPLYING",
  education: "M2",
  university: "assas",
  foreignBar: "NONE",
  careerGoal: "BIG_LAW",
  geoGoal: "KEEP_BOTH",
  budget: "60_100K",
  funding: "BOTH",
  intake: "Y1",
  english: "TEST_TAKEN",
  usStatus: "FR_NO_STATUS",
  firstName: "Contrat",
  email: "contrat@example.com",
};

const REFERENCE = new Date("2026-07-29T10:00:00Z");

let counter = 0;
const createdIds: string[] = [];

/** Une évaluation persistée : parent obligatoire de tout le reste en base. */
async function newAssessment() {
  const id = `contrat-${Date.now()}-${counter++}`;
  const assessment = computeAssessment(ANSWERS, REFERENCE, id);
  await assessmentStore.save(assessment);
  createdIds.push(id);
  return assessment;
}

beforeEach(() => {
  counter += 1;
});

afterAll(async () => {
  // Nettoyage : les cascades emportent rapports, tâches, documents et séances.
  const client = prisma();
  if (client) {
    await client.consultationSlot.deleteMany({ where: { id: { startsWith: "contrat-" } } });
    await client.assessment.deleteMany({ where: { id: { in: createdIds } } });
    await client.$disconnect();
  }
});

describe("évaluations", () => {
  it("relit ce qui a été écrit, à l'identique", async () => {
    const saved = await newAssessment();
    const read = await assessmentStore.get(saved.id);

    expect(read).not.toBeNull();
    expect(read!.id).toBe(saved.id);
    expect(read!.createdAt).toBe(saved.createdAt);
    expect(read!.path).toBe(saved.path);
    expect(read!.answers).toEqual(saved.answers);
    expect(read!.derived).toEqual(saved.derived);
    expect(read!.costs).toEqual(saved.costs);
    expect(read!.deadlines).toEqual(saved.deadlines);
    expect(read!.rulesSnapshot).toEqual(saved.rulesSnapshot);
    expect(read!.textBlocks).toEqual(saved.textBlocks);
  });

  it("renvoie null pour un identifiant inconnu", async () => {
    expect(await assessmentStore.get("jamais-vu")).toBeNull();
  });

  it("réécrit sans échouer quand le profil est corrigé", async () => {
    const saved = await newAssessment();
    await assessmentStore.save({ ...saved, path: "HUMAN_REVIEW_REQUIRED" });
    expect((await assessmentStore.get(saved.id))!.path).toBe("HUMAN_REVIEW_REQUIRED");
  });

  it("liste les évaluations créées", async () => {
    const saved = await newAssessment();
    expect((await assessmentStore.all()).map((a) => a.id)).toContain(saved.id);
  });
});

describe("rapports", () => {
  it("crée, relit et fait transiter un rapport", async () => {
    const assessment = await newAssessment();
    const created = await reportStore.create(assessment);

    expect(created.status).toBe("QUEUED");
    expect(created.priority).toBe("FREE");
    expect(created.sentAt).toBeNull();
    expect(created.corrections).toEqual([]);
    expect(created.acknowledged).toEqual([]);

    const sentAt = "2026-07-30T12:00:00.000Z";
    await reportStore.setStatus(created.id, "SENT", sentAt);
    const read = await reportStore.get(created.id);
    expect(read!.status).toBe("SENT");
    expect(read!.sentAt).toBe(sentAt);
  });

  it("place les rapports payants devant dans la file (CDC §18)", async () => {
    const older = await newAssessment();
    const newer = await newAssessment();
    await reportStore.create(older);
    await reportStore.create(newer);
    await reportStore.markPaid(newer.id, {
      amountCents: 7_900,
      expiresAt: "2026-08-28",
      reason: "test",
    } as never);

    const queue = (await reportStore.queue()).map((r) => r.id);
    expect(queue.indexOf(newer.id)).toBeLessThan(queue.indexOf(older.id));
  });

  it("sort les rapports envoyés de la file active", async () => {
    const assessment = await newAssessment();
    await reportStore.create(assessment);
    const before = await reportStore.activeCount();

    await reportStore.setStatus(assessment.id, "SENT", "2026-07-30T12:00:00.000Z");
    expect(await reportStore.activeCount()).toBe(before - 1);
    expect((await reportStore.queue()).map((r) => r.id)).not.toContain(assessment.id);
  });

  it("journalise les corrections dans l'ordre", async () => {
    const assessment = await newAssessment();
    await reportStore.create(assessment);
    await reportStore.addCorrection(assessment.id, {
      at: "2026-07-30T10:00:00.000Z",
      author: "Fondateur",
      note: "Première",
    });
    await reportStore.addCorrection(assessment.id, {
      at: "2026-07-30T11:00:00.000Z",
      author: "Fondateur",
      note: "Seconde",
    });

    const read = await reportStore.get(assessment.id);
    expect(read!.corrections.map((c) => c.note)).toEqual(["Première", "Seconde"]);
  });

  it("acquitte un point de revue sans jamais le dupliquer", async () => {
    const assessment = await newAssessment();
    await reportStore.create(assessment);

    await reportStore.acknowledge(assessment.id, "path-arbitration");
    await reportStore.acknowledge(assessment.id, "path-arbitration");
    expect((await reportStore.get(assessment.id))!.acknowledged).toEqual(["path-arbitration"]);

    await reportStore.unacknowledge(assessment.id, "path-arbitration");
    expect((await reportStore.get(assessment.id))!.acknowledged).toEqual([]);
  });

  it("ne réouvre pas la fenêtre de déduction sur un webhook rejoué", async () => {
    const assessment = await newAssessment();
    await reportStore.create(assessment);
    const deduction = { amountCents: 7_900, expiresAt: "2026-08-28", reason: "premier" } as never;
    const replay = { amountCents: 7_900, expiresAt: "2026-09-30", reason: "rejeu" } as never;

    await reportStore.markPaid(assessment.id, deduction);
    await reportStore.markPaid(assessment.id, replay);

    const read = await reportStore.get(assessment.id);
    expect(read!.priority).toBe("PAID");
    expect((read!.deduction as { expiresAt: string }).expiresAt).toBe("2026-08-28");
  });

  it("renvoie null sur un rapport inconnu", async () => {
    expect(await reportStore.get("jamais-vu")).toBeNull();
    expect(await reportStore.addCorrection("jamais-vu", { at: "x", author: "y", note: "z" })).toBeNull();
    expect(await reportStore.acknowledge("jamais-vu", "p")).toBeNull();
  });
});

describe("feuille de route", () => {
  it("ne retient que les écarts au statut initial", async () => {
    const assessment = await newAssessment();
    expect(await roadmapStore.hasAny(assessment.id)).toBe(false);
    expect(await roadmapStore.statuses(assessment.id)).toEqual({});

    await roadmapStore.setStatus(assessment.id, "t-1", "IN_PROGRESS");
    expect(await roadmapStore.hasAny(assessment.id)).toBe(true);
    expect(await roadmapStore.statuses(assessment.id)).toEqual({ "t-1": "IN_PROGRESS" });
  });

  it("écrase le statut précédent de la même tâche", async () => {
    const assessment = await newAssessment();
    await roadmapStore.setStatus(assessment.id, "t-1", "IN_PROGRESS");
    await roadmapStore.setStatus(assessment.id, "t-1", "DONE");
    expect(await roadmapStore.statuses(assessment.id)).toEqual({ "t-1": "DONE" });
  });

  it("sépare les feuilles de route", async () => {
    const a = await newAssessment();
    const b = await newAssessment();
    await roadmapStore.setStatus(a.id, "t-1", "DONE");
    expect(await roadmapStore.statuses(b.id)).toEqual({});
  });
});

describe("scénarios de coût", () => {
  it("refuse au-delà du plafond du CDC §26", async () => {
    const assessment = await newAssessment();
    for (let i = 0; i < MAX_SCENARIOS; i++) {
      const result = await scenarioStore.save(assessment.id, {
        id: `${assessment.id}-s${i}`,
        inputs: defaultInputs(`Scénario ${i}`, "NEW_YORK"),
      });
      expect(result.ok).toBe(true);
    }

    const overflow = await scenarioStore.save(assessment.id, {
      id: `${assessment.id}-trop`,
      inputs: defaultInputs("De trop", "NEW_YORK"),
    });
    expect(overflow).toEqual({ ok: false, reason: "LIMIT_REACHED" });
  });

  it("laisse modifier un scénario existant une fois le plafond atteint", async () => {
    // Compter la mise à jour comme un ajout figerait les scénarios enregistrés.
    const assessment = await newAssessment();
    for (let i = 0; i < MAX_SCENARIOS; i++) {
      await scenarioStore.save(assessment.id, {
        id: `${assessment.id}-m${i}`,
        inputs: defaultInputs(`Scénario ${i}`, "NEW_YORK"),
      });
    }

    const updated = await scenarioStore.save(assessment.id, {
      id: `${assessment.id}-m0`,
      inputs: defaultInputs("Renommé", "BOSTON"),
    });
    expect(updated.ok).toBe(true);

    const list = await scenarioStore.list(assessment.id);
    expect(list).toHaveLength(MAX_SCENARIOS);
    expect(list.find((s) => s.id === `${assessment.id}-m0`)!.inputs.label).toBe("Renommé");
  });

  it("supprime sans toucher aux autres", async () => {
    const assessment = await newAssessment();
    await scenarioStore.save(assessment.id, {
      id: `${assessment.id}-x`,
      inputs: defaultInputs("X", "NEW_YORK"),
    });
    await scenarioStore.remove(assessment.id, `${assessment.id}-x`);
    expect(await scenarioStore.list(assessment.id)).toEqual([]);
  });
});

describe("coffre de documents", () => {
  const doc = (assessmentId: string, id: string, type: "CV" | "CHECKLIST" = "CV") => ({
    id,
    assessmentId,
    type,
    fileName: `${id}.pdf`,
    sizeBytes: 1234,
    uploadedAt: "2026-07-29T10:00:00.000Z",
    storageKey: null,
  });

  it("compte par type", async () => {
    const assessment = await newAssessment();
    await documentStore.add(doc(assessment.id, `${assessment.id}-d1`));
    await documentStore.add(doc(assessment.id, `${assessment.id}-d2`, "CHECKLIST"));

    expect(await documentStore.countOfType(assessment.id, "CV")).toBe(1);
    expect(await documentStore.countOfType(assessment.id, "CHECKLIST")).toBe(1);
    expect(await documentStore.countOfType(assessment.id, "SCHOOL_LIST")).toBe(0);
  });

  it("ne rend pas le document d'une autre évaluation", async () => {
    const a = await newAssessment();
    const b = await newAssessment();
    await documentStore.add(doc(a.id, `${a.id}-secret`));

    expect(await documentStore.get(b.id, `${a.id}-secret`)).toBeNull();
    expect(await documentStore.get(a.id, `${a.id}-secret`)).not.toBeNull();
  });

  it("ne supprime pas le document d'une autre évaluation", async () => {
    const a = await newAssessment();
    const b = await newAssessment();
    await documentStore.add(doc(a.id, `${a.id}-garde`));

    await documentStore.remove(b.id, `${a.id}-garde`);
    expect(await documentStore.get(a.id, `${a.id}-garde`)).not.toBeNull();
  });
});

describe("rappels envoyés", () => {
  it("est idempotent sur le même rappel", async () => {
    const assessment = await newAssessment();
    await noticeStore.markSent(assessment.id, "t-1:7");
    await noticeStore.markSent(assessment.id, "t-1:7");
    expect(await noticeStore.sent(assessment.id)).toEqual(["t-1:7"]);
  });

  it("sépare les destinataires", async () => {
    const a = await newAssessment();
    const b = await newAssessment();
    await noticeStore.markSent(a.id, "t-1:7");
    expect(await noticeStore.sent(b.id)).toEqual([]);
  });
});

describe("Milestone Challenges", () => {
  it("n'enregistre que la première acquisition", async () => {
    const assessment = await newAssessment();
    expect(
      await milestoneStore.recordFirst(assessment.id, "SCHOOL_LIST_COMPLETED", "2026-07-01T10:00:00.000Z")
    ).toBe(true);
    expect(
      await milestoneStore.recordFirst(assessment.id, "SCHOOL_LIST_COMPLETED", "2026-09-01T10:00:00.000Z")
    ).toBe(false);

    const dates = await milestoneStore.dates(assessment.id);
    expect(dates.SCHOOL_LIST_COMPLETED).toBe("2026-07-01T10:00:00.000Z");
  });

  it("ne renvoie rien pour une évaluation sans acquisition", async () => {
    const assessment = await newAssessment();
    expect(await milestoneStore.dates(assessment.id)).toEqual({});
  });
});

describe("consultations", () => {
  it("ouvre, réserve, puis annule", async () => {
    const assessment = await newAssessment();
    const slotId = `contrat-slot-${Date.now()}-${counter++}`;
    await consultationStore.addSlot({ id: slotId, startsAt: "2026-09-01T09:00:00.000Z", minutes: 45 });

    expect((await consultationStore.slots()).map((s) => s.id)).toContain(slotId);

    const bookingId = `${assessment.id}-b1`;
    await consultationStore.addBooking({
      id: bookingId,
      assessmentId: assessment.id,
      slotId,
      type: "ORIENTATION",
      bookedAt: "2026-07-29T10:00:00.000Z",
    });

    expect((await consultationStore.bookingsOf(assessment.id)).map((b) => b.id)).toEqual([bookingId]);
    expect(await consultationStore.removeBooking(assessment.id, bookingId)).toBe(true);
    expect(await consultationStore.bookingsOf(assessment.id)).toEqual([]);

    await consultationStore.removeSlot(slotId);
  });

  it("n'annule pas la séance d'un autre", async () => {
    const a = await newAssessment();
    const b = await newAssessment();
    const slotId = `contrat-slot-${Date.now()}-${counter++}`;
    await consultationStore.addSlot({ id: slotId, startsAt: "2026-09-02T09:00:00.000Z", minutes: 45 });
    await consultationStore.addBooking({
      id: `${a.id}-b`,
      assessmentId: a.id,
      slotId,
      type: "ORIENTATION",
      bookedAt: "2026-07-29T10:00:00.000Z",
    });

    expect(await consultationStore.removeBooking(b.id, `${a.id}-b`)).toBe(false);
    expect(await consultationStore.bookingsOf(a.id)).toHaveLength(1);

    await consultationStore.removeBooking(a.id, `${a.id}-b`);
    await consultationStore.removeSlot(slotId);
  });

  it("refuse un second créneau déjà réservé, sur les deux backends", async () => {
    const a = await newAssessment();
    const b = await newAssessment();
    const slotId = `${a.id}-race`;
    await consultationStore.addSlot({
      id: slotId,
      startsAt: new Date(Date.now() + 8 * 86_400_000).toISOString(),
      minutes: 45,
    });

    // `decideBooking` a vu le créneau libre pour les deux : entre sa lecture
    // et l'écriture, l'autre a réservé. C'est l'écriture qui doit trancher.
    expect(
      await consultationStore.addBooking({
        id: `${a.id}-first`,
        assessmentId: a.id,
        slotId,
        type: "ORIENTATION",
        bookedAt: new Date().toISOString(),
      })
    ).toBe(true);

    expect(
      await consultationStore.addBooking({
        id: `${b.id}-second`,
        assessmentId: b.id,
        slotId,
        type: "ORIENTATION",
        bookedAt: new Date().toISOString(),
      })
    ).toBe(false);

    // Le créneau n'appartient qu'au premier : sans ce contrôle, la mémoire
    // acceptait un double achat que la base refusait par une erreur serveur.
    expect(await consultationStore.bookingsOf(b.id)).toHaveLength(0);

    await consultationStore.removeBooking(a.id, `${a.id}-first`);
    await consultationStore.removeSlot(slotId);
  });

  it("n'accorde aucun droit par défaut", async () => {
    const assessment = await newAssessment();
    expect(await consultationStore.entitlement(assessment.id)).toEqual({ offer: null, granted: 0 });
  });

  it("enregistre et met à jour un droit", async () => {
    const assessment = await newAssessment();
    await consultationStore.setEntitlement(assessment.id, { offer: "GUIDED", granted: 2 });
    expect(await consultationStore.entitlement(assessment.id)).toEqual({ offer: "GUIDED", granted: 2 });

    await consultationStore.setEntitlement(assessment.id, { offer: null, granted: 0 });
    expect(await consultationStore.entitlement(assessment.id)).toEqual({ offer: null, granted: 0 });
  });
});

describe("schoolStore", () => {
  const choice = (assessmentId: string, id: string, name = "Fordham") => ({
    id,
    assessmentId,
    name,
    partnershipId: null,
    ambition: "TARGET" as const,
    status: "CONSIDERING" as const,
    applicationDeadline: "2027-01-15",
    notes: null,
    addedAt: "2026-07-30T10:00:00.000Z",
  });

  it("enregistre et relit une école, date sans heure", async () => {
    const assessment = await newAssessment();
    await schoolStore.add(choice(assessment.id, `${assessment.id}-s1`));

    const [stored] = await schoolStore.list(assessment.id);
    expect(stored.name).toBe("Fordham");
    // Une date limite de candidature n'a pas d'heure : en transporter une
    // inventerait un fuseau, et la date affichée basculerait d'un jour.
    expect(stored.applicationDeadline).toBe("2027-01-15");
  });

  it("modifie sur place et rend false pour une école inconnue", async () => {
    const assessment = await newAssessment();
    await schoolStore.add(choice(assessment.id, `${assessment.id}-s2`));

    expect(
      await schoolStore.update(assessment.id, `${assessment.id}-s2`, { status: "SHORTLISTED" })
    ).toBe(true);
    expect(await schoolStore.update(assessment.id, "inconnue", { status: "SUBMITTED" })).toBe(false);

    const [stored] = await schoolStore.list(assessment.id);
    expect(stored.status).toBe("SHORTLISTED");
  });

  it("efface une date limite quand elle est remise à vide", async () => {
    const assessment = await newAssessment();
    await schoolStore.add(choice(assessment.id, `${assessment.id}-s3`));
    await schoolStore.update(assessment.id, `${assessment.id}-s3`, { applicationDeadline: null });

    expect((await schoolStore.list(assessment.id))[0].applicationDeadline).toBeNull();
  });

  it("ne touche pas à la liste d'une autre évaluation", async () => {
    const a = await newAssessment();
    const b = await newAssessment();
    await schoolStore.add(choice(a.id, `${a.id}-secret`));

    // Un identifiant deviné ne doit rien atteindre : les deux opérations
    // filtrent sur l'évaluation, jamais sur l'identifiant seul.
    expect(await schoolStore.update(b.id, `${a.id}-secret`, { status: "DISCARDED" })).toBe(false);
    expect(await schoolStore.remove(b.id, `${a.id}-secret`)).toBe(false);
    expect(await schoolStore.list(a.id)).toHaveLength(1);

    expect(await schoolStore.remove(a.id, `${a.id}-secret`)).toBe(true);
    expect(await schoolStore.list(a.id)).toHaveLength(0);
  });
});

describe("matrices — révisions append-only", () => {
  // Identifiants uniques par exécution : avec base, les révisions survivent
  // d'un run à l'autre, et un identifiant fixe relirait l'historique du
  // run précédent.
  const RUN = `t-${Date.now().toString(36)}`;

  it("numérote les révisions de règle en séquence et rend la dernière", async () => {
    // JAMAIS une clé réelle : le store écrit dans la base partagée du
    // développement, et une révision sur R-NY-001 y ACTIVERAIT une règle de
    // droit pour tous les diagnostics suivants — c'est arrivé, et toutes les
    // suites navigateur en aval ont changé de voie préliminaire.
    // `effectiveRules` ignore un identifiant hors du code : ces lignes de
    // test sont inertes.
    const ruleId = `R-TEST-${RUN}`;
    const first = await ruleRevisionStore.add({
      ruleId,
      active: false,
      sourceUrl: `https://example.com/${RUN}/a`,
      verifiedAt: null,
    });
    const second = await ruleRevisionStore.add({
      ruleId,
      active: true,
      sourceUrl: `https://example.com/${RUN}/b`,
      verifiedAt: "2026-07-30",
    });

    expect(second.revision).toBe(first.revision + 1);

    const latest = (await ruleRevisionStore.latest()).get(ruleId);
    expect(latest?.revision).toBe(second.revision);
    expect(latest?.sourceUrl).toBe(`https://example.com/${RUN}/b`);
    // Date sans heure : c'est un jour de vérification, pas un instant.
    expect(latest?.verifiedAt).toBe("2026-07-30");

    // L'historique est complet et ordonné : rien n'a été écrasé.
    const history = await ruleRevisionStore.history(ruleId);
    const mine = history.filter((row) => row.sourceUrl.includes(RUN));
    expect(mine.map((row) => row.revision)).toEqual([first.revision, second.revision]);
  });

  it("numérote les révisions de bloc et les rend dans l'ordre", async () => {
    // Même règle : une clé hors registre est ignorée par `resolveBlocksAsOf`,
    // donc inoffensive pour les rendus réels.
    const key = `TEST:${RUN}`;
    const first = await blockRevisionStore.add(key, { kind: "TEXT", text: `${RUN} v1` });
    const second = await blockRevisionStore.add(key, { kind: "TEXT", text: `${RUN} v2` });
    expect(second.revision).toBe(first.revision + 1);

    const all = await blockRevisionStore.all();
    const mine = all.filter(
      (row) => row.payload.kind === "TEXT" && row.payload.text.startsWith(RUN)
    );
    expect(mine).toHaveLength(2);
    // `all` est ordonné par date de création : la résolution « à la date »
    // s'appuie dessus.
    expect(mine[0].createdAt <= mine[1].createdAt).toBe(true);
  });
});

describe("backend actif", () => {
  it("annonce lequel des deux est couvert", () => {
    // Diagnostic, pas assertion : sert à lire la sortie de test sans doute.
    console.info(`[stores] backend : ${usingDatabase() ? "Prisma" : "mémoire"}`);
    expect(typeof usingDatabase()).toBe("boolean");
  });
});
