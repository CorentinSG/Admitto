import { RULES } from "@/lib/engine-a/rules.seed";
import type { Rule } from "@/lib/engine-a/types";

/**
 * Révisions des règles du Moteur A (CDC §33).
 *
 * Ce que le fondateur édite sans code : l'ACTIVATION, la SOURCE et la DATE DE
 * VÉRIFICATION — exactement le travail que le CDC lui confie (« confronter la
 * règle à sa source officielle, puis l'activer »). La condition reste dans le
 * code : une logique de règle se teste, elle ne se modifie pas depuis un
 * formulaire un vendredi soir.
 *
 * Le garde-fou est le MÊME qu'en code : `check:rules` refuse au commit une
 * règle active sans source ni date ; `decideRuleRevision` refuse la même chose
 * à la sauvegarde. Deux verrous, une seule règle.
 *
 * La version effective est `version du code + numéro de révision` :
 * `rulesSnapshot` continue de figer id + version dans chaque évaluation, donc
 * un rapport reste traçable vers l'état exact de la règle qui l'a produit.
 */

export interface RuleRevisionRow {
  ruleId: string;
  revision: number;
  active: boolean;
  sourceUrl: string;
  verifiedAt: string | null;
  createdAt: string;
}

export type RuleRefusal =
  | { reason: "UNKNOWN_RULE" }
  | { reason: "ACTIVE_WITHOUT_SOURCE" }
  | { reason: "ACTIVE_WITHOUT_VERIFICATION" }
  | { reason: "INVALID_DATE" }
  | { reason: "VERIFIED_IN_FUTURE" };

export type RuleDecision =
  | { accepted: true; active: boolean; sourceUrl: string; verifiedAt: string | null }
  | { accepted: false; refusal: RuleRefusal };

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isRealDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

/**
 * Décide une révision AVANT toute écriture.
 *
 * La désactivation est toujours acceptée : couper une règle fait retomber le
 * moteur sur « revue humaine », qui est le comportement sûr — aucun motif ne
 * justifie de retenir quelqu'un qui veut fermer une règle douteuse.
 *
 * L'activation exige source ET date de vérification, et une date qui ne soit
 * pas dans le futur : « je la vérifierai la semaine prochaine » n'est pas une
 * vérification.
 */
export function decideRuleRevision(
  input: { ruleId: string; active: boolean; sourceUrl: string; verifiedAt: string },
  reference: Date,
  baseRules: Rule[] = RULES
): RuleDecision {
  if (!baseRules.some((rule) => rule.id === input.ruleId)) {
    return { accepted: false, refusal: { reason: "UNKNOWN_RULE" } };
  }

  const sourceUrl = input.sourceUrl.trim();
  const verifiedAt = input.verifiedAt.trim();

  if (verifiedAt && !isRealDate(verifiedAt)) {
    return { accepted: false, refusal: { reason: "INVALID_DATE" } };
  }
  if (verifiedAt && verifiedAt > reference.toISOString().slice(0, 10)) {
    return { accepted: false, refusal: { reason: "VERIFIED_IN_FUTURE" } };
  }

  if (input.active) {
    if (!sourceUrl) return { accepted: false, refusal: { reason: "ACTIVE_WITHOUT_SOURCE" } };
    if (!verifiedAt) {
      return { accepted: false, refusal: { reason: "ACTIVE_WITHOUT_VERIFICATION" } };
    }
  }

  return { accepted: true, active: input.active, sourceUrl, verifiedAt: verifiedAt || null };
}

/**
 * Règles effectives : la dernière révision par-dessus la règle du code.
 *
 * Une révision est écartée si — donnée corrompue, règle retirée du code — elle
 * violerait l'invariant « active ⇒ sourcée et vérifiée » : le moteur préfère
 * la règle du code à une révision qui casserait la garantie du CDC.
 */
export function effectiveRules(
  latestByRule: Map<string, RuleRevisionRow>,
  baseRules: Rule[] = RULES
): Rule[] {
  return baseRules.map((rule) => {
    const revision = latestByRule.get(rule.id);
    if (!revision) return rule;
    if (revision.active && (!revision.sourceUrl || !revision.verifiedAt)) return rule;

    return {
      ...rule,
      active: revision.active,
      sourceUrl: revision.sourceUrl || rule.sourceUrl,
      verifiedAt: revision.verifiedAt ?? rule.verifiedAt,
      version: rule.version + revision.revision,
    };
  });
}

/**
 * La règle effective contredit-elle l'état ACTIF que porte le code ?
 *
 * C'est arrivé le 2026-08-06 : R-ALT-001 venait d'être activée en code, et
 * vingt-six révisions résiduelles d'une suite de vérification la laissaient
 * éteinte. La révision gouverne — c'est voulu, on doit pouvoir fermer une règle
 * sans déploiement — mais rien ne le disait, et l'activation n'a produit aucune
 * erreur : seulement une absence.
 */
export function ruleDivergesFromCode(effective: Rule, baseRules: Rule[] = RULES): boolean {
  const fromCode = baseRules.find((rule) => rule.id === effective.id);
  return fromCode !== undefined && fromCode.active !== effective.active;
}
