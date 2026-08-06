import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { RULES, TEXT_BLOCKS } from "@/lib/engine-a/rules.seed";
import { runEngineA } from "@/lib/engine-a/run";
import { flattenForRules } from "@/lib/profile/derive";
import { deriveProfile } from "@/lib/profile/derive";
import { VERDICT_BLOCKS } from "@/content/report-blocks";
import { computeAssessment } from "@/lib/assessment/compute";
import { assembleReport } from "@/lib/report/assemble";
import type { Answers } from "@/lib/questionnaire/types";
import type { Rule } from "@/lib/engine-a/types";
import {
  BLOCK_REGISTRY,
  blockDivergesFromCode,
  decideBlockRevision,
  resolveBlocksAsOf,
  riskBlocksFrom,
  verdictBlocksFrom,
  voieBlocksFrom,
  type BlockRevisionRow,
} from "./blocks";
import {
  decideRuleRevision,
  effectiveRules,
  ruleDivergesFromCode,
  type RuleRevisionRow,
} from "./rules";
import { FORBIDDEN_PATTERNS, vocabularyViolation } from "./vocabulary";

const NOW = new Date("2026-07-30T12:00:00.000Z");

// ── Vocabulaire : le verrou d'exécution suit le verrou de commit ────────────

describe("vocabulaire interdit à l'exécution", () => {
  it("chaque motif de lib/ figure dans le script de commit", () => {
    // Deux listes qui divergent en silence, c'est un texte refusé au commit
    // mais accepté au back-office — ou l'inverse. Le test lit le script.
    const script = readFileSync("scripts/check-vocabulary.mjs", "utf8");
    for (const { pattern } of FORBIDDEN_PATTERNS) {
      expect(script, pattern.source).toContain(pattern.source);
    }
  });

  it("détecte une promesse de résultat et rend le pourquoi", () => {
    const violation = vocabularyViolation("Votre admission garantie sous 30 jours.");
    expect(violation?.why).toContain("CDC §5");
    expect(vocabularyViolation("Une méthode exigeante, sans promesse de résultat.")).toBeNull();
  });
});

// ── Révisions de blocs : la décision précède l'écriture ────────────────────

describe("décision de révision d'un bloc", () => {
  const verdictKey = "VERDICT:VIABLE_WITH_MAJOR_PLANNING";

  it("accepte un contenu conforme et le normalise", () => {
    const decision = decideBlockRevision(verdictKey, {
      title: "  Projet viable avec planification  ",
      body: "Le projet tient, à condition d'organiser les étapes.",
    });
    expect(decision.accepted && decision.payload).toEqual({
      kind: "TITLED",
      title: "Projet viable avec planification",
      body: "Le projet tient, à condition d'organiser les étapes.",
    });
  });

  it("refuse un bloc inconnu", () => {
    const decision = decideBlockRevision("VERDICT:INVENTÉ", { title: "x", body: "y" });
    expect(!decision.accepted && decision.refusal.reason).toBe("UNKNOWN_KEY");
  });

  it("refuse le vocabulaire interdit, avec le motif du CDC", () => {
    const decision = decideBlockRevision(verdictKey, {
      title: "Résultat garanti",
      body: "corps",
    });
    expect(!decision.accepted && decision.refusal.reason).toBe("FORBIDDEN_VOCABULARY");
  });

  it("refuse une variable : ces blocs ne passent par aucune substitution", () => {
    // Un {prenom} écrit de bonne foi serait rendu littéralement au lecteur.
    const decision = decideBlockRevision(verdictKey, {
      title: "Titre",
      body: "Bonjour {prenom}, votre projet tient.",
    });
    expect(!decision.accepted && decision.refusal.reason).toBe("PLACEHOLDER");
  });

  it("refuse une partie vide et une partie démesurée", () => {
    expect(
      (() => {
        const d = decideBlockRevision(verdictKey, { title: "Titre", body: "   " });
        return !d.accepted && d.refusal.reason;
      })()
    ).toBe("EMPTY_PART");
    expect(
      (() => {
        const d = decideBlockRevision(verdictKey, { title: "Titre", body: "x".repeat(5_000) });
        return !d.accepted && d.refusal.reason;
      })()
    ).toBe("TOO_LONG");
  });

  it("découpe les actions d'un risque par ligne et borne leur nombre", () => {
    const key = "RISK:FINANCIAL_FIT";
    const ok = decideBlockRevision(key, {
      title: "Financement",
      body: "corps",
      actions: " Première action \n\n Deuxième action \n",
    });
    expect(ok.accepted && ok.payload.kind === "RISK" && ok.payload.actions).toEqual([
      "Première action",
      "Deuxième action",
    ]);

    const tooMany = decideBlockRevision(key, {
      title: "t",
      body: "b",
      actions: Array.from({ length: 7 }, (_, i) => `action ${i}`).join("\n"),
    });
    expect(!tooMany.accepted && tooMany.refusal.reason).toBe("TOO_MANY_ACTIONS");
  });
});

// ── Résolution « à la date » : le gel automatique ───────────────────────────

const revisionRow = (
  key: string,
  revision: number,
  createdAt: string,
  text: string
): BlockRevisionRow => ({
  key,
  revision,
  payload: key.startsWith("VOIE:")
    ? { kind: "TEXT", text }
    : { kind: "TITLED", title: text, body: text },
  createdAt,
});

describe("résolution des blocs à une date", () => {
  const key = "VOIE:TB-HUMAN-REVIEW";

  it("rend le code tant qu'aucune révision n'existe", () => {
    const resolved = resolveBlocksAsOf([], NOW);
    expect(voieBlocksFrom(resolved)["TB-HUMAN-REVIEW"]).toBe(TEXT_BLOCKS["TB-HUMAN-REVIEW"]);
    // Toutes les clés du registre sont présentes : aucun bloc ne disparaît.
    expect(resolved.size).toBe(BLOCK_REGISTRY.size);
  });

  it("une évaluation d'avant la révision garde le texte d'avant", () => {
    const revisions = [revisionRow(key, 1, "2026-07-15T10:00:00.000Z", "Texte révisé.")];
    const before = resolveBlocksAsOf(revisions, new Date("2026-07-10T00:00:00.000Z"));
    const after = resolveBlocksAsOf(revisions, new Date("2026-07-20T00:00:00.000Z"));

    expect(voieBlocksFrom(before)["TB-HUMAN-REVIEW"]).toBe(TEXT_BLOCKS["TB-HUMAN-REVIEW"]);
    expect(voieBlocksFrom(after)["TB-HUMAN-REVIEW"]).toBe("Texte révisé.");
  });

  it("la dernière révision antérieure l'emporte, pas la dernière tout court", () => {
    const revisions = [
      revisionRow(key, 1, "2026-07-10T10:00:00.000Z", "Première."),
      revisionRow(key, 2, "2026-07-20T10:00:00.000Z", "Seconde."),
    ];
    const between = resolveBlocksAsOf(revisions, new Date("2026-07-15T00:00:00.000Z"));
    expect(voieBlocksFrom(between)["TB-HUMAN-REVIEW"]).toBe("Première.");
  });

  it("ignore une révision de forme inattendue au profit du code", () => {
    // Donnée corrompue ou ancienne version : mieux vaut le texte d'origine
    // qu'un rapport qui ne se rend plus.
    const corrupt: BlockRevisionRow = {
      key: "VERDICT:PREMATURE",
      revision: 1,
      payload: { kind: "TEXT", text: "mauvaise forme" },
      createdAt: "2026-07-01T00:00:00.000Z",
    };
    const resolved = resolveBlocksAsOf([corrupt], NOW);
    expect(verdictBlocksFrom(resolved).PREMATURE).toEqual(VERDICT_BLOCKS.PREMATURE);
    expect(riskBlocksFrom(resolved).FINANCIAL_FIT.actions.length).toBeGreaterThan(0);
  });
});

// ── Révisions de règles ─────────────────────────────────────────────────────

describe("décision de révision d'une règle", () => {
  const base = { ruleId: "R-NY-001", sourceUrl: "https://www.nybarexam.org", verifiedAt: "2026-07-30" };

  it("accepte une activation sourcée et vérifiée", () => {
    const decision = decideRuleRevision({ ...base, active: true }, NOW);
    expect(decision.accepted && decision.verifiedAt).toBe("2026-07-30");
  });

  it("refuse une activation sans source ou sans vérification", () => {
    const noSource = decideRuleRevision({ ...base, active: true, sourceUrl: " " }, NOW);
    expect(!noSource.accepted && noSource.refusal.reason).toBe("ACTIVE_WITHOUT_SOURCE");

    const noDate = decideRuleRevision({ ...base, active: true, verifiedAt: "" }, NOW);
    expect(!noDate.accepted && noDate.refusal.reason).toBe("ACTIVE_WITHOUT_VERIFICATION");
  });

  it("refuse une vérification datée du futur", () => {
    // « Je la vérifierai la semaine prochaine » n'est pas une vérification.
    const decision = decideRuleRevision({ ...base, active: true, verifiedAt: "2026-08-15" }, NOW);
    expect(!decision.accepted && decision.refusal.reason).toBe("VERIFIED_IN_FUTURE");
  });

  it("refuse une date qui n'existe pas et une règle inconnue", () => {
    const badDate = decideRuleRevision({ ...base, active: true, verifiedAt: "2026-02-31" }, NOW);
    expect(!badDate.accepted && badDate.refusal.reason).toBe("INVALID_DATE");

    const unknown = decideRuleRevision({ ...base, ruleId: "R-INVENTÉE", active: false }, NOW);
    expect(!unknown.accepted && unknown.refusal.reason).toBe("UNKNOWN_RULE");
  });

  it("accepte toujours une désactivation", () => {
    // Couper une règle fait retomber sur « revue humaine » : comportement sûr.
    const decision = decideRuleRevision(
      { ruleId: "R-STRUCT-001", active: false, sourceUrl: "", verifiedAt: "" },
      NOW
    );
    expect(decision.accepted).toBe(true);
  });
});

describe("règles effectives", () => {
  const revision = (over: Partial<RuleRevisionRow>): RuleRevisionRow => ({
    ruleId: "R-NY-001",
    revision: 1,
    active: true,
    sourceUrl: "https://www.nybarexam.org/Rules/Rules.htm",
    verifiedAt: "2026-07-30",
    createdAt: NOW.toISOString(),
    ...over,
  });

  it("la révision gouverne, et la version reste traçable", () => {
    const rules = effectiveRules(new Map([["R-NY-001", revision({})]]));
    const rule = rules.find((r) => r.id === "R-NY-001")!;
    expect(rule.active).toBe(true);
    // version code (1) + révision (1) : `rulesSnapshot` pointe l'état exact.
    expect(rule.version).toBe(2);
    // La condition vient toujours du code : elle n'est pas éditable.
    expect(rule.condition).toEqual(RULES.find((r) => r.id === "R-NY-001")!.condition);
  });

  /*
   * Les deux points suivants portent sur une règle SYNTHÉTIQUE, et non plus sur
   * une clé du jeu réel.
   *
   * Ils ont suivi les activations successives — R-NY-001, puis R-NY-002 le
   * 2026-08-02, puis R-ALT-001 le 2026-08-06 — parce qu'ils avaient besoin
   * d'une règle inactive et se déplaçaient vers la dernière qui l'était. Il n'y
   * en a plus. Surtout, ce n'était pas leur sujet : ils vérifient qu'une
   * RÉVISION est correctement appliquée, ce qui ne demande aucune règle
   * particulière. Le CDC le dit d'ailleurs des tests qui touchent la base :
   * jamais de clé réelle, une révision posée sur `R-NY-001` activerait une
   * règle de droit pour tous les diagnostics suivants.
   */
  const DORMANTE: Rule = {
    id: "R-TEST-DORMANTE",
    condition: { field: "geoGoal", op: "eq", value: "RETURN_FRANCE" },
    factProduced: "NY_VIA_LLM_SUBJECT_TO_BOLE",
    textBlockId: "TB-HUMAN-REVIEW",
    sourceUrl: "interne:test",
    verifiedAt: null,
    version: 1,
    active: false,
  };

  it("écarte une révision qui violerait « active ⇒ sourcée et vérifiée »", () => {
    const rules = effectiveRules(
      new Map([[DORMANTE.id, revision({ ruleId: DORMANTE.id, sourceUrl: "", verifiedAt: null })]]),
      [DORMANTE]
    );
    expect(rules[0].active).toBe(false);
  });

  it("une règle activée par révision entre réellement dans l'évaluation", () => {
    const answers: Answers = {
      status: "LAWYER_EXPLORING",
      education: "CAPA",
      university: "assas",
      foreignBar: "OTHER_COUNTRY_LAW_DEGREE",
      careerGoal: "RETURN_FRANCE",
      geoGoal: "RETURN_FRANCE",
      budget: "60_100K",
      funding: "BOTH",
      intake: "Y1",
      english: "TEST_TAKEN",
      usStatus: "FR_NO_STATUS",
      firstName: "Alex",
      email: "alex@example.com",
    };
    const profile = flattenForRules(answers, deriveProfile(answers, NOW));
    const base = [...RULES, DORMANTE];

    const dormant = runEngineA(profile, effectiveRules(new Map(), base));
    expect(dormant.firedRules.map((r) => r.id)).not.toContain(DORMANTE.id);

    const awake = runEngineA(
      profile,
      effectiveRules(new Map([[DORMANTE.id, revision({ ruleId: DORMANTE.id })]]), base)
    );
    // version du code (1) + révision (1) : `rulesSnapshot` reste traçable.
    expect(awake.firedRules).toContainEqual({ id: DORMANTE.id, version: 2 });
    expect(awake.path).toBe("NY_VIA_LLM_SUBJECT_TO_BOLE");
  });
});

// ── Divergence code / révision : la panne silencieuse ──────────────────────

describe("une révision qui contredit le code se voit", () => {
  /*
   * C'est arrivé le 2026-08-06 : R-ALT-001 venait d'être activée en code, et
   * vingt-six révisions résiduelles d'une suite de vérification la laissaient
   * éteinte. La révision gouverne — c'est voulu, on doit pouvoir fermer une
   * règle ou corriger un texte sans déploiement — mais l'écart ne produisait
   * aucune erreur : seulement une absence, ce qui est le plus difficile à voir.
   */
  it("règle : signale l'écart, et lui seul", () => {
    const codeActive: Rule = { ...RULES[0], active: true };
    expect(ruleDivergesFromCode({ ...codeActive, active: false }, [codeActive])).toBe(true);
    expect(ruleDivergesFromCode({ ...codeActive, active: true }, [codeActive])).toBe(false);
    // Une version ou une source révisée ne sont pas des divergences d'état :
    // les signaler noierait celle qui compte.
    expect(ruleDivergesFromCode({ ...codeActive, version: 9 }, [codeActive])).toBe(false);
  });

  it("bloc : compare au texte que porte AUJOURD'HUI le code", () => {
    const key = "VOIE:TB-HUMAN-REVIEW";
    const duCode = BLOCK_REGISTRY.get(key)!.defaultPayload;
    expect(blockDivergesFromCode(key, duCode)).toBe(false);
    expect(blockDivergesFromCode(key, { kind: "TEXT", text: "Autre chose." })).toBe(true);
  });

  it("une clé inconnue ne déclenche aucune alerte", () => {
    // Un bloc retiré du registre n'est plus servi : l'annoncer divergent
    // signalerait un écart sans objet.
    expect(blockDivergesFromCode("VOIE:INEXISTANT", { kind: "TEXT", text: "x" })).toBe(false);
  });
});

// ── Bout en bout : compute et assemble avec matrices ────────────────────────

describe("matrices dans le calcul et l'assemblage", () => {
  const answers: Answers = {
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
    firstName: "Alex",
    email: "alex@example.com",
  };

  it("un bloc de voie révisé apparaît dans le diagnostic suivant", () => {
    // Le bloc révisé est celui de la voie que ce profil emprunte RÉELLEMENT.
    // C'était « TB-HUMAN-REVIEW » tant que R-NY-001 dormait ; ce profil M2
    // reçoit désormais la voie LL.M., et réviser un bloc qu'il n'atteint plus
    // n'aurait rien testé du mécanisme de révision.
    const assessment = computeAssessment(answers, NOW, "m-1", {
      voieBlocks: { ...TEXT_BLOCKS, "TB-NY-VIA-LLM": "Texte de voie révisé." },
    });
    expect(assessment.textBlocks).toContain("Texte de voie révisé.");
  });

  it("un verdict révisé apparaît au rendu, sans toucher l'évaluation", () => {
    const assessment = computeAssessment(answers, NOW, "m-2");
    const report = assembleReport(assessment, {
      verdicts: {
        ...VERDICT_BLOCKS,
        [assembleReport(assessment).verdict]: { title: "Titre révisé", body: "Corps révisé." },
      },
    });
    expect(report.verdictTitle).toBe("Titre révisé");
    // L'évaluation stockée n'a pas changé : le gel vient de la résolution par
    // date, pas d'une copie.
    expect(assessment.textBlocks).toEqual(computeAssessment(answers, NOW, "m-3").textBlocks);
  });
});
