import { describe, expect, it } from "vitest";
import type { PartnershipDetection } from "@/lib/partnerships/detect";
import type { Partnership } from "@/lib/partnerships/types";
import { analyseList, sortForDisplay, RECOMMENDED_ACTIVE } from "./balance";
import { candidatesFor } from "./candidates";
import { decideAdd, normalizeName, MAX_SCHOOLS, type SchoolChoice } from "./types";

const school = (over: Partial<SchoolChoice> = {}): SchoolChoice => ({
  id: over.id ?? "s1",
  assessmentId: "a1",
  name: over.name ?? "Columbia Law School",
  partnershipId: over.partnershipId ?? null,
  ambition: over.ambition ?? "TARGET",
  status: over.status ?? "CONSIDERING",
  applicationDeadline: over.applicationDeadline ?? null,
  notes: over.notes ?? null,
  addedAt: over.addedAt ?? "2026-07-01T10:00:00.000Z",
});

const partnership = (over: Partial<Partnership> = {}): Partnership =>
  ({
    id: over.id ?? "p1",
    frenchUniversityId: "paris1",
    frenchUniversity: "Université Paris 1",
    usLawSchool: over.usLawSchool ?? "Fordham University School of Law",
    city: "New York",
    state: "NY",
    partnershipType: "reserved_seat",
    tuitionCategory: "reduced_tuition",
    tuitionDisplay: "Frais réduits",
    financialAid: null,
    seatsDisplay: null,
    seatsMin: null,
    seatsMax: null,
    requiredLevel: "M2",
    requiredLevelRaw: null,
    programLanguage: null,
    duration: null,
    specialties: [],
    admissionConditions: null,
    languageTests: [],
    applicationDeadline: over.applicationDeadline ?? "2027-01-15",
    shortDescription: null,
    officialLink: null,
    reliability: "confirmed",
    missingInformation: [],
    notes: null,
    active: true,
    verifiedAt: "2026-07-29",
    ...over,
  }) as Partnership;

const detection = (over: Partial<PartnershipDetection> = {}): PartnershipDetection => ({
  confirmed: over.confirmed ?? [],
  toConfirm: over.toConfirm ?? [],
  aboveLevel: over.aboveLevel ?? [],
  universityCovered: over.universityCovered ?? true,
  universityId: over.universityId ?? "paris1",
});

describe("ajout d'une école", () => {
  const base = { ambition: "TARGET", status: "CONSIDERING", existing: [] as Array<{ name: string }> };

  it("accepte une saisie complète et normalise le nom", () => {
    const decision = decideAdd({ ...base, name: "  Columbia   Law School " });
    expect(decision).toEqual({
      accepted: true,
      name: "Columbia Law School",
      notes: null,
      applicationDeadline: null,
    });
  });

  it("refuse un nom vide", () => {
    expect(decideAdd({ ...base, name: "   " })).toEqual({
      accepted: false,
      reason: "EMPTY_NAME",
    });
  });

  it("refuse un classement ou un avancement hors liste", () => {
    // Une chaîne libre écrite en base rendrait un libellé vide à l'écran et
    // fausserait le décompte de l'équilibre sans que rien ne le signale.
    expect(decideAdd({ ...base, name: "X", ambition: "PROBABLE" })).toEqual({
      accepted: false,
      reason: "UNKNOWN_AMBITION",
    });
    expect(decideAdd({ ...base, name: "X", status: "PEUT_ETRE" })).toEqual({
      accepted: false,
      reason: "UNKNOWN_STATUS",
    });
  });

  it("refuse une date qui n'existe pas", () => {
    // « 2027-02-31 » a le bon format et ne correspond à aucun jour : accepté,
    // il produirait une échéance impossible à atteindre.
    expect(decideAdd({ ...base, name: "X", applicationDeadline: "2027-02-31" })).toEqual({
      accepted: false,
      reason: "INVALID_DEADLINE",
    });
    expect(decideAdd({ ...base, name: "X", applicationDeadline: "15/01/2027" })).toEqual({
      accepted: false,
      reason: "INVALID_DEADLINE",
    });
  });

  it("accepte une date valide", () => {
    const decision = decideAdd({ ...base, name: "X", applicationDeadline: "2027-01-15" });
    expect(decision.accepted && decision.applicationDeadline).toBe("2027-01-15");
  });

  it("refuse un doublon quelle que soit la casse ou l'accentuation", () => {
    const existing = [{ name: "Université de Georgetown" }];
    expect(decideAdd({ ...base, name: "  universite DE georgetown ", existing })).toEqual({
      accepted: false,
      reason: "DUPLICATE",
    });
  });

  it("refuse au-delà du plafond", () => {
    const existing = Array.from({ length: MAX_SCHOOLS }, (_, i) => ({ name: `École ${i}` }));
    expect(decideAdd({ ...base, name: "Une de plus", existing })).toEqual({
      accepted: false,
      reason: "LIMIT_REACHED",
    });
  });

  it("compare les noms sans casse ni accents", () => {
    expect(normalizeName("  ÉCOLE   Dé Droit ")).toBe("ecole de droit");
  });
});

describe("équilibre de la liste", () => {
  const reference = new Date("2026-07-30T12:00:00.000Z");

  it("signale une liste vide sans rien inventer d'autre", () => {
    const balance = analyseList([], reference);
    expect(balance.total).toBe(0);
    expect(balance.observations.map((o) => o.kind)).toEqual(["EMPTY"]);
  });

  it("ne compte pas les écoles écartées dans l'équilibre", () => {
    // Les compter ferait paraître couverte une liste dont il ne reste rien.
    const balance = analyseList(
      [
        school({ id: "1", name: "A", ambition: "SAFETY", status: "DISCARDED" }),
        school({ id: "2", name: "B", ambition: "REACH" }),
      ],
      reference
    );
    expect(balance.active).toBe(1);
    expect(balance.byAmbition.SAFETY).toBe(0);
    expect(balance.observations.map((o) => o.kind)).toContain("TOO_FEW");
  });

  it("constate l'absence d'école sûre dès que la liste est assez fournie", () => {
    const schools = ["A", "B", "C", "D"].map((name, i) =>
      school({ id: String(i), name, ambition: "REACH", status: "SHORTLISTED" })
    );
    const kinds = analyseList(schools, reference).observations.map((o) => o.kind);
    expect(kinds).toContain("NO_SAFETY");
    expect(kinds).toContain("ONLY_REACH");
    expect(kinds).not.toContain("TOO_FEW");
  });

  it("n'examine pas l'équilibre d'une liste trop courte", () => {
    // Reprocher l'absence d'école sûre sur une liste de deux écoles ferait du
    // bruit sur un travail à peine commencé.
    const kinds = analyseList(
      [school({ id: "1", name: "A", ambition: "REACH" }), school({ id: "2", name: "B", ambition: "REACH" })],
      reference
    ).observations.map((o) => o.kind);
    expect(kinds).not.toContain("NO_SAFETY");
    expect(kinds).toContain("TOO_FEW");
  });

  it("retient la prochaine date limite à venir, jamais une date passée", () => {
    const balance = analyseList(
      [
        school({ id: "1", name: "Passée", applicationDeadline: "2026-01-10" }),
        school({ id: "2", name: "À venir", applicationDeadline: "2027-01-15" }),
      ],
      reference
    );
    expect(balance.nextDeadline).toEqual({ name: "À venir", date: "2027-01-15" });
  });

  it("alerte quand la prochaine date limite est proche", () => {
    const balance = analyseList(
      [school({ id: "1", name: "Bientôt", applicationDeadline: "2026-08-10" })],
      reference
    );
    const soon = balance.observations.find((o) => o.kind === "DEADLINE_SOON");
    expect(soon?.detail).toBe("11");
  });

  it("compte les écoles sans date limite", () => {
    const balance = analyseList(
      [
        school({ id: "1", name: "A", applicationDeadline: "2027-01-15" }),
        school({ id: "2", name: "B" }),
        school({ id: "3", name: "C" }),
      ],
      reference
    );
    expect(balance.observations.find((o) => o.kind === "MISSING_DEADLINES")?.detail).toBe("2");
  });

  it("signale qu'aucune école n'est retenue tant que tout reste à l'étude", () => {
    const schools = Array.from({ length: RECOMMENDED_ACTIVE }, (_, i) =>
      school({ id: String(i), name: `École ${i}`, ambition: "SAFETY" })
    );
    expect(analyseList(schools, reference).observations.map((o) => o.kind)).toContain(
      "NOTHING_SHORTLISTED"
    );
  });

  it("range les écoles écartées en dernier", () => {
    const sorted = sortForDisplay([
      school({ id: "1", name: "Écartée", ambition: "REACH", status: "DISCARDED" }),
      school({ id: "2", name: "Sûre", ambition: "SAFETY" }),
      school({ id: "3", name: "Ambitieuse", ambition: "REACH" }),
    ]);
    expect(sorted.map((s) => s.name)).toEqual(["Ambitieuse", "Sûre", "Écartée"]);
  });
});

describe("écoles proposées depuis les accords", () => {
  it("propose les fiches confirmées avant les pistes", () => {
    const candidates = candidatesFor(
      detection({
        confirmed: [partnership({ id: "c1", usLawSchool: "Fordham" })],
        toConfirm: [partnership({ id: "t1", usLawSchool: "Cardozo" })],
      }),
      []
    );
    expect(candidates.map((c) => c.name)).toEqual(["Fordham", "Cardozo"]);
    expect(candidates[0].confirmed).toBe(true);
    expect(candidates[1].confirmed).toBe(false);
  });

  it("exclut les accords fermés au niveau d'études actuel", () => {
    // Les proposer ferait construire une liste sur des portes fermées.
    const candidates = candidatesFor(
      detection({ aboveLevel: [partnership({ id: "a1", usLawSchool: "Yale" })] }),
      []
    );
    expect(candidates).toHaveLength(0);
  });

  it("ne propose pas deux fois la même école couverte par deux accords", () => {
    const candidates = candidatesFor(
      detection({
        confirmed: [
          partnership({ id: "c1", usLawSchool: "Fordham" }),
          partnership({ id: "c2", usLawSchool: "FORDHAM" }),
        ],
      }),
      []
    );
    expect(candidates).toHaveLength(1);
  });

  it("ne propose pas une école déjà présente dans la liste", () => {
    const candidates = candidatesFor(
      detection({ confirmed: [partnership({ id: "c1", usLawSchool: "Fordham" })] }),
      [school({ name: "fordham" })]
    );
    expect(candidates).toHaveLength(0);
  });

  it("ne préremplit aucune ambition", () => {
    // Suggérer « sûre » depuis l'existence d'un accord reviendrait à annoncer
    // une chance d'admission que l'accord ne dit pas.
    const [candidate] = candidatesFor(
      detection({ confirmed: [partnership({ id: "c1" })] }),
      []
    );
    expect(Object.keys(candidate)).not.toContain("ambition");
  });
});
