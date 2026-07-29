import type { Assessment } from "@/lib/assessment/compute";
import type { Report } from "./assemble";
import { RULES } from "@/lib/engine-a/rules.seed";

/**
 * Revue structurée d'un projet de rapport (CDC §17 et §18).
 *
 * La semi-automatisation ne consiste pas à envoyer plus vite : elle consiste à
 * ce que la machine désigne elle-même ce qu'un humain doit contrôler. Le
 * relecteur ne cherche plus les points sensibles, il les traite.
 *
 * Deux niveaux, et un seul est bloquant :
 *
 * - `BLOCKING` — le rapport ne peut pas partir tant que le point n'est pas
 *   traité. Ce sont les cas où un envoi non relu affirmerait quelque chose que
 *   ni le moteur ni la source ne permettent d'affirmer.
 * - `ATTENTION` — à regarder, sans fermer l'envoi.
 *
 * Les points sont dérivés, jamais saisis : ajouter une règle non vérifiée ou un
 * partenariat non confirmé fait apparaître le point correspondant sans qu'on ait
 * à y penser. C'est ce qui rend la revue robuste au passage du temps.
 */

export const REVIEW_SEVERITIES = ["BLOCKING", "ATTENTION"] as const;
export type ReviewSeverity = (typeof REVIEW_SEVERITIES)[number];

export interface ReviewPoint {
  id: string;
  severity: ReviewSeverity;
  /** Ce que le relecteur doit faire. */
  label: string;
  /** Pourquoi le système l'a soulevé — l'origine du point, pas une consigne générale. */
  why: string;
}

/** Voies qui n'autorisent aucun envoi sans arbitrage humain. */
const PATHS_REQUIRING_ARBITRATION: Record<string, string> = {
  HUMAN_REVIEW_REQUIRED:
    "Le Moteur A n'a pas conclu : aucune règle active ne couvre ce profil. Le rapport repose donc entièrement sur votre analyse.",
  INSUFFICIENT_INFORMATION:
    "Le profil ne comporte pas assez d'éléments pour qu'une voie préliminaire soit dégagée.",
  EDUCATION_LIKELY_INSUFFICIENT:
    "La voie retenue annonce une formation vraisemblablement insuffisante : c'est la conclusion la plus lourde de conséquences pour la personne, et la moins réversible si elle est erronée.",
};

/** Verdicts du Moteur B dont la formulation engage particulièrement. */
const VERDICTS_REQUIRING_ARBITRATION: Record<string, string> = {
  NOT_CURRENTLY_RECOMMENDED:
    "Le verdict déconseille le projet en l'état. Vérifiez que les axes faibles reflètent bien la situation décrite et non une réponse manquante.",
  NEEDS_CLARIFICATION:
    "Le verdict demande une clarification préalable : le rapport doit dire précisément quoi clarifier.",
};

export function reviewChecklist(assessment: Assessment, report: Report): ReviewPoint[] {
  const points: ReviewPoint[] = [];

  // ── Voie préliminaire ────────────────────────────────────────────────────
  const pathReason = PATHS_REQUIRING_ARBITRATION[assessment.path];
  if (pathReason) {
    points.push({
      id: "path-arbitration",
      severity: "BLOCKING",
      label: `Arbitrer la voie préliminaire « ${report.pathLabel} »`,
      why: pathReason,
    });
  }

  // ── Règles non vérifiées ─────────────────────────────────────────────────
  // Le rapport peut citer une règle dont la source n'a jamais été confrontée.
  const usedRuleIds = new Set(assessment.rulesSnapshot.map((r) => r.id));
  const unverified = RULES.filter((rule) => usedRuleIds.has(rule.id) && rule.verifiedAt === null);
  for (const rule of unverified) {
    points.push({
      id: `rule-unverified-${rule.id}`,
      severity: "BLOCKING",
      label: `Confronter la règle ${rule.id} à sa source avant envoi`,
      why: `Cette règle n'a pas de date de vérification. Tant qu'elle n'en a pas, ce qu'elle produit ne peut pas être présenté comme établi.`,
    });
  }

  // ── Verdict du Moteur B ──────────────────────────────────────────────────
  const verdictReason = VERDICTS_REQUIRING_ARBITRATION[report.verdict];
  if (verdictReason) {
    points.push({
      id: "verdict-arbitration",
      severity: "BLOCKING",
      label: `Relire la formulation du verdict « ${report.verdictTitle} »`,
      why: verdictReason,
    });
  }

  // ── Réponses manquantes qui pèsent sur la notation ───────────────────────
  // Un écran non affiché laisse le champ indéfini ; le Moteur B ne compte alors
  // aucun point. Le relecteur doit savoir que le score bas vient d'une absence
  // de réponse et non d'une situation constatée.
  const missing = missingDecisiveAnswers(assessment);
  if (missing.length > 0) {
    points.push({
      id: "missing-answers",
      severity: "BLOCKING",
      label: "Vérifier les notations assises sur une réponse absente",
      why: `Non renseigné : ${missing.join(", ")}. Une réponse absente ne vaut jamais une réponse négative, mais elle ne rapporte aucun point — le score correspondant est donc plus bas que la réalité possible.`,
    });
  }

  // ── Partenariats non confirmés ───────────────────────────────────────────
  if (assessment.partnerships.toConfirm.length > 0) {
    points.push({
      id: "partnerships-to-confirm",
      severity: "ATTENTION",
      label: `Statuer sur ${assessment.partnerships.toConfirm.length} accord(s) non confirmé(s)`,
      why: "Ces accords existent en base mais leur fiabilité n'est pas établie. Le rapport ne les présente pas comme acquis ; dites si l'un mérite d'être mentionné autrement.",
    });
  }

  // ── Université hors base ─────────────────────────────────────────────────
  if (!assessment.partnerships.universityCovered) {
    points.push({
      id: "university-not-covered",
      severity: "ATTENTION",
      label: "Université absente de la base de partenariats",
      why: "L'absence d'accord détecté ne signifie pas qu'il n'en existe pas : elle signifie que la base n'en connaît pas. À vérifier si la personne a un intérêt marqué pour un programme précis.",
    });
  }

  // ── Coût reposant sur des valeurs par défaut ─────────────────────────────
  if (assessment.answers.budget === undefined) {
    points.push({
      id: "budget-default",
      severity: "ATTENTION",
      label: "Fourchette de coût établie sans budget déclaré",
      why: "La personne n'a pas indiqué de budget : la fourchette provient des seules valeurs de référence.",
    });
  }

  // ── Rentrée non décidée ──────────────────────────────────────────────────
  if (report.timeline.length === 0) {
    points.push({
      id: "no-timeline",
      severity: "ATTENTION",
      label: "Aucune échéance datée",
      why: "Sans rentrée visée, le calendrier reste vide. Le rapport doit expliquer ce qui déclenchera les dates plutôt que de laisser un bloc muet.",
    });
  }

  return points;
}

/**
 * Champs dont l'absence abaisse mécaniquement un axe du Moteur B.
 * Le libellé est celui que verra le relecteur, pas le nom du champ.
 */
function missingDecisiveAnswers(assessment: Assessment): string[] {
  const { answers } = assessment;
  const missing: string[] = [];

  if (answers.foreignBar === undefined) missing.push("admission à un barreau étranger");
  if (answers.education === undefined) missing.push("niveau d'études");
  if (answers.english === undefined) missing.push("test d'anglais");
  if (answers.careerGoal === undefined) missing.push("objectif professionnel");
  if (answers.intake === undefined) missing.push("rentrée visée");

  return missing;
}

export function blockingPoints(points: ReviewPoint[]): ReviewPoint[] {
  return points.filter((p) => p.severity === "BLOCKING");
}

/**
 * Un rapport ne peut passer à « envoyé » que si chaque point bloquant a été
 * traité. Le contrôle vit ici, pas dans l'interface : une action serveur
 * appelée directement ne doit pas pouvoir contourner la revue.
 */
export function canSend(
  points: ReviewPoint[],
  acknowledged: readonly string[]
): { ok: true } | { ok: false; pending: ReviewPoint[] } {
  const pending = blockingPoints(points).filter((p) => !acknowledged.includes(p.id));
  return pending.length === 0 ? { ok: true } : { ok: false, pending };
}
