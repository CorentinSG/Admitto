import type { Rule, RuleCondition } from "./types";

/** Profil structuré minimal — sera aligné sur le schéma Prisma (PLAN.md §4). */
export type StructuredProfile = Record<string, unknown>;

export function evaluateCondition(cond: RuleCondition, profile: StructuredProfile): boolean {
  if ("all" in cond) return cond.all.every((c) => evaluateCondition(c, profile));
  if ("any" in cond) return cond.any.some((c) => evaluateCondition(c, profile));

  const actual = profile[cond.field];
  switch (cond.op) {
    case "eq":
      return actual === cond.value;
    case "neq":
      return actual !== cond.value;
    case "in":
      return Array.isArray(cond.value) && cond.value.includes(actual);
    case "gte":
      return typeof actual === "number" && typeof cond.value === "number" && actual >= cond.value;
    case "lte":
      return typeof actual === "number" && typeof cond.value === "number" && actual <= cond.value;
  }
}

/** Retourne les règles actives déclenchées par le profil, avec leur version (traçabilité). */
export function fireRules(rules: Rule[], profile: StructuredProfile) {
  return rules
    .filter((r) => r.active)
    .filter((r) => evaluateCondition(r.condition, profile))
    .map((r) => ({ id: r.id, version: r.version, fact: r.factProduced, textBlockId: r.textBlockId }));
}
