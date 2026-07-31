import { SCREEN_IDS, type ScreenId } from "@/lib/questionnaire/types";
import { isConditionalScreen } from "@/lib/questionnaire/visibility";

/**
 * Événements produit (CDC §36) — la boucle de mesure de la bêta.
 *
 * **Aucun identifiant, d'aucune sorte.** Pas de cookie, pas de session, pas
 * d'empreinte, pas même un identifiant de passage aléatoire : un événement est
 * une ligne (type, écran, instant) et rien d'autre. Deux lignes du même
 * visiteur sont indiscernables de deux lignes de deux visiteurs.
 *
 * Ce n'est pas une privation : la question du fondateur — « où les gens
 * abandonnent-ils ? » — se répond en COMPTEURS. Chaque écran atteint incrémente
 * son compteur ; l'abandon à l'écran N est la différence entre les compteurs de
 * N et de N+1. La courbe d'abandon émerge sans qu'aucun parcours individuel
 * n'ait à être reconstitué. Corréler n'apporterait qu'une chose de plus :
 * la capacité de suivre quelqu'un.
 *
 * Conséquence assumée : ces compteurs ne se recoupent pas avec les diagnostics.
 * On sait combien de personnes ont atteint l'écran « budget », pas lesquelles.
 * C'est exactement ce que le CDC §36 demande, et rien de plus.
 */

export const EVENT_KINDS = [
  "QUESTIONNAIRE_STARTED", // « Commencer » cliqué
  "SCREEN_REACHED", // un écran s'affiche — porte son identifiant
  "QUESTIONNAIRE_SUBMITTED", // soumission acceptée
  "RESULT_VIEWED", // page de résultat préliminaire ouverte
  "CHECKOUT_VIEWED", // tunnel de paiement ouvert
  "REPORT_VIEWED", // rapport ouvert par son destinataire
] as const;

export type EventKind = (typeof EVENT_KINDS)[number];

export interface ProductEvent {
  kind: EventKind;
  /** Renseigné pour `SCREEN_REACHED` seulement. */
  screen: ScreenId | null;
  at: string;
}

/**
 * Valide une soumission brute. La route est publique : tout ce qui n'est pas
 * une valeur des unions fermées est refusé, jamais enregistré tel quel — un
 * champ libre écrit depuis l'extérieur serait exactement la donnée que ce
 * module s'interdit de détenir.
 */
export function parseEvent(raw: {
  kind?: unknown;
  screen?: unknown;
}): { kind: EventKind; screen: ScreenId | null } | null {
  if (typeof raw.kind !== "string") return null;
  if (!(EVENT_KINDS as readonly string[]).includes(raw.kind)) return null;
  const kind = raw.kind as EventKind;

  if (kind !== "SCREEN_REACHED") return { kind, screen: null };

  if (typeof raw.screen !== "string") return null;
  if (!(SCREEN_IDS as readonly string[]).includes(raw.screen)) return null;
  return { kind, screen: raw.screen as ScreenId };
}

// ── Entonnoir ───────────────────────────────────────────────────────────────

export interface FunnelStep {
  label: string;
  count: number;
  /**
   * Part du départ, en pourcentage entier.
   *
   * `null` dès que la comparaison n'aurait pas de sens — voir `buildFunnel`.
   * Une part fausse est pire qu'une part absente : elle se lit comme un
   * taux de conversion et oriente une décision.
   */
  shareOfStart: number | null;
  /**
   * Largeur relative de la barre, de 0 à 100, rapportée au plus grand
   * compteur de l'entonnoir. Sert UNIQUEMENT à dessiner : les comptes se
   * comparent entre eux même quand aucun n'est une part de l'autre.
   */
  barShare: number;
}

export interface ScreenDropOff {
  screen: ScreenId;
  reached: number;
  /** Personnes qui n'ont pas atteint l'écran suivant. Jamais négatif. */
  lost: number;
  /** L'écran n'est pas montré à tout le monde : son compte ne se compare pas. */
  conditional: boolean;
}

export interface Funnel {
  steps: FunnelStep[];
  /**
   * Abandon écran par écran. Le dernier écran n'a pas de suivant : sa perte se
   * mesure contre les soumissions, pas contre un écran qui n'existe pas.
   */
  dropOff: ScreenDropOff[];
  /** Total d'événements enregistrés — le dénominateur de tout le reste. */
  events: number;
}

const share = (count: number, start: number): number | null =>
  start === 0 ? null : Math.round((count / start) * 100);

/**
 * Construit l'entonnoir à partir des compteurs bruts.
 *
 * **Toutes les étapes ne se comparent pas au départ.** Deux raisons, et elles
 * ne disparaîtront pas avec le temps :
 *
 * 1. Après la soumission, les compteurs comptent des OUVERTURES DE PAGE, pas
 *    des personnes. Le lien du résultat part par email : il est rouvert des
 *    jours plus tard, plusieurs fois. « Résultat consulté » peut donc dépasser
 *    « questionnaire commencé » sans que rien ne soit anormal.
 * 2. `paidCount` vient des RAPPORTS — un achat est un fait comptable, il ne se
 *    mesure pas à un pixel — et la table des rapports est antérieure à la
 *    mesure. Son total porte sur une population que les compteurs n'ont jamais
 *    vue commencer.
 *
 * Rapporter ces nombres au départ produisait des « 174 % » : lus comme un taux
 * de conversion, ils auraient orienté une décision sur une comparaison entre
 * deux populations différentes. Seule la conversion commencé → soumis est une
 * vraie part : mêmes actes, même origine de mesure. Les autres étapes gardent
 * leur compte, et leur part vaut `null`.
 */
export function buildFunnel(
  counts: Record<EventKind, number>,
  screenCounts: Record<string, number>,
  paidCount: number,
  visibleScreens: readonly ScreenId[] = SCREEN_IDS,
  conditional: (screen: ScreenId) => boolean = isConditionalScreen
): Funnel {
  const start = counts.QUESTIONNAIRE_STARTED;

  // `comparable` dit si la part du départ a un sens pour cette étape.
  const raw: Array<{ label: string; count: number; comparable: boolean }> = [
    { label: "Questionnaire commencé", count: start, comparable: true },
    { label: "Questionnaire soumis", count: counts.QUESTIONNAIRE_SUBMITTED, comparable: true },
    { label: "Résultat consulté", count: counts.RESULT_VIEWED, comparable: false },
    { label: "Tunnel de paiement ouvert", count: counts.CHECKOUT_VIEWED, comparable: false },
    { label: "Diagnostic payé", count: paidCount, comparable: false },
    { label: "Rapport ouvert", count: counts.REPORT_VIEWED, comparable: false },
  ];

  // La barre se dessine par rapport au plus grand compte, jamais au départ :
  // c'est ce qui l'empêche de déborder quand une étape le dépasse.
  const largest = Math.max(...raw.map((step) => step.count), 0);

  const steps: FunnelStep[] = raw.map((step) => ({
    label: step.label,
    count: step.count,
    shareOfStart: step.comparable ? share(step.count, start) : null,
    barShare: largest === 0 ? 0 : Math.round((step.count / largest) * 100),
  }));

  const dropOff: ScreenDropOff[] = visibleScreens.map((screen, i) => {
    const reached = screenCounts[screen] ?? 0;

    // L'écran suivant montré à TOUT LE MONDE. Comparer à l'écran d'à côté
    // quand celui-ci est conditionnel fabriquait des abandons imaginaires :
    // « barreau étranger » n'est posé qu'à certains profils, si bien que
    // l'écran qui le précédait affichait presque tous ses visiteurs comme
    // perdus alors que personne n'était parti.
    let next = counts.QUESTIONNAIRE_SUBMITTED;
    for (let j = i + 1; j < visibleScreens.length; j++) {
      if (conditional(visibleScreens[j])) continue;
      next = screenCounts[visibleScreens[j]] ?? 0;
      break;
    }
    // Après le dernier écran il n'y a plus d'écran, seulement l'acte de
    // soumettre : la boucle laisse alors `next` sur les soumissions.

    // Jamais négatif : un écran peut être atteint plus souvent que le
    // précédent, et une « perte négative » ne veut rien dire.
    return { screen, reached, lost: Math.max(0, reached - next), conditional: conditional(screen) };
  });

  return {
    steps,
    dropOff,
    events: Object.values(counts).reduce((a, b) => a + b, 0),
  };
}
