import { describe, expect, it } from "vitest";
import { EVENT_KINDS, buildFunnel, parseEvent, type EventKind } from "./events";

const counts = (over: Partial<Record<EventKind, number>> = {}): Record<EventKind, number> =>
  ({ ...Object.fromEntries(EVENT_KINDS.map((k) => [k, 0])), ...over }) as Record<EventKind, number>;

describe("validation d'un événement", () => {
  it("accepte les types connus", () => {
    expect(parseEvent({ kind: "RESULT_VIEWED" })).toEqual({
      kind: "RESULT_VIEWED",
      screen: null,
    });
  });

  it("refuse un type inconnu et une valeur qui n'est pas une chaîne", () => {
    // La route est publique : tout ce qui n'est pas une valeur de l'union
    // fermée est refusé, jamais enregistré tel quel.
    expect(parseEvent({ kind: "PIXEL_TRACKER" })).toBeNull();
    expect(parseEvent({ kind: 42 })).toBeNull();
    expect(parseEvent({})).toBeNull();
  });

  it("exige un écran connu pour SCREEN_REACHED, et lui seul", () => {
    expect(parseEvent({ kind: "SCREEN_REACHED", screen: "budget" })).toEqual({
      kind: "SCREEN_REACHED",
      screen: "budget",
    });
    expect(parseEvent({ kind: "SCREEN_REACHED", screen: "inventé" })).toBeNull();
    expect(parseEvent({ kind: "SCREEN_REACHED" })).toBeNull();
    // Un écran passé avec un autre type est ignoré, pas enregistré : aucune
    // donnée n'entre par une porte qui ne lui est pas destinée.
    expect(parseEvent({ kind: "RESULT_VIEWED", screen: "budget" })?.screen).toBeNull();
  });
});

describe("entonnoir", () => {
  it("rend des parts nulles plutôt que 0 % quand rien n'a commencé", () => {
    const funnel = buildFunnel(counts(), {}, 0);
    for (const step of funnel.steps) expect(step.shareOfStart).toBeNull();
    expect(funnel.events).toBe(0);
  });

  it("calcule chaque étape en part du départ", () => {
    const funnel = buildFunnel(
      counts({
        QUESTIONNAIRE_STARTED: 100,
        QUESTIONNAIRE_SUBMITTED: 40,
        RESULT_VIEWED: 38,
        CHECKOUT_VIEWED: 12,
        REPORT_VIEWED: 5,
      }),
      {},
      6
    );
    const byLabel = Object.fromEntries(funnel.steps.map((s) => [s.label, s]));
    expect(byLabel["Questionnaire soumis"].shareOfStart).toBe(40);
    // Le paiement vient des rapports, pas des événements : un achat est un
    // fait comptable, il ne se mesure pas à un pixel. Son compte est réel, mais
    // il porte sur une population antérieure à la mesure — le rapporter au
    // départ produirait un taux de conversion entre deux ensembles différents.
    expect(byLabel["Diagnostic payé"].count).toBe(6);
    expect(byLabel["Diagnostic payé"].shareOfStart).toBeNull();
    // Même raison pour les ouvertures de page : le lien du résultat part par
    // email et se rouvre des jours plus tard.
    expect(byLabel["Résultat consulté"].shareOfStart).toBeNull();
    expect(byLabel["Rapport ouvert"].shareOfStart).toBeNull();
  });

  it("ne laisse jamais une barre dépasser, même quand une étape dépasse le départ", () => {
    // C'est le cas réel : 19 questionnaires commencés, 26 résultats consultés
    // (rouverts depuis l'email), 33 diagnostics payés (antérieurs à la mesure).
    // Rapportées au départ, ces barres affichaient « 137 % » et « 174 % » et
    // débordaient de leur colonne.
    const funnel = buildFunnel(
      counts({ QUESTIONNAIRE_STARTED: 19, QUESTIONNAIRE_SUBMITTED: 19, RESULT_VIEWED: 26 }),
      {},
      33
    );
    for (const step of funnel.steps) {
      expect(step.barShare, step.label).toBeGreaterThanOrEqual(0);
      expect(step.barShare, step.label).toBeLessThanOrEqual(100);
      if (step.shareOfStart !== null) expect(step.shareOfStart, step.label).toBeLessThanOrEqual(100);
    }
    // La barre se rapporte au plus grand compte : le plus grand la remplit.
    const byLabel = Object.fromEntries(funnel.steps.map((s) => [s.label, s]));
    expect(byLabel["Diagnostic payé"].barShare).toBe(100);
  });

  it("déduit l'abandon de la différence entre deux écrans successifs", () => {
    const funnel = buildFunnel(
      counts({ QUESTIONNAIRE_SUBMITTED: 30 }),
      { status: 100, education: 90, university: 60 },
      0,
      ["status", "education", "university"]
    );
    expect(funnel.dropOff).toEqual([
      { screen: "status", reached: 100, lost: 10, conditional: false },
      { screen: "education", reached: 90, lost: 30, conditional: false },
      // Le dernier écran se compare aux SOUMISSIONS : après lui il n'y a plus
      // d'écran, seulement l'acte de soumettre.
      { screen: "university", reached: 60, lost: 30, conditional: false },
    ]);
  });

  it("saute l'écran conditionnel pour mesurer l'abandon", () => {
    // Le défaut trouvé à l'écran des métriques : « barreau étranger » n'est
    // posé qu'à certains profils, et l'écran qui le précédait affichait 18
    // abandons sur 19 visiteurs alors que personne n'était parti.
    const funnel = buildFunnel(
      counts({ QUESTIONNAIRE_SUBMITTED: 18 }),
      { university: 19, foreignBar: 1, careerGoal: 19 },
      0,
      ["university", "foreignBar", "careerGoal"],
      (screen) => screen === "foreignBar"
    );
    const byScreen = Object.fromEntries(funnel.dropOff.map((d) => [d.screen, d]));
    // Comparé à « careerGoal » (19), que tout le monde voit, et non à
    // « foreignBar » (1), que presque personne ne voit.
    expect(byScreen.university.lost).toBe(0);
    expect(byScreen.foreignBar.conditional).toBe(true);
    expect(byScreen.university.conditional).toBe(false);
    // L'écran conditionnel lui-même se compare au suivant non conditionnel.
    expect(byScreen.foreignBar.lost).toBe(0);
    // Et le dernier écran retombe bien sur les soumissions.
    expect(byScreen.careerGoal.lost).toBe(1);
  });

  it("saute plusieurs écrans conditionnels d'affilée", () => {
    const funnel = buildFunnel(
      counts({ QUESTIONNAIRE_SUBMITTED: 0 }),
      { status: 100, education: 2, university: 3, careerGoal: 80 },
      0,
      ["status", "education", "university", "careerGoal"],
      (screen) => screen === "education" || screen === "university"
    );
    const byScreen = Object.fromEntries(funnel.dropOff.map((d) => [d.screen, d]));
    // 100 → 80 en sautant les deux écrans conditionnels intermédiaires.
    expect(byScreen.status.lost).toBe(20);
  });

  it("ne rend jamais un abandon négatif", () => {
    // Les écrans conditionnels font qu'un écran suivant peut être atteint plus
    // souvent que le précédent : « −12 abandons » ne voudrait rien dire.
    const funnel = buildFunnel(
      counts({ QUESTIONNAIRE_SUBMITTED: 50 }),
      { status: 10, education: 40 },
      0,
      ["status", "education"]
    );
    expect(funnel.dropOff.every((d) => d.lost >= 0)).toBe(true);
  });
});
