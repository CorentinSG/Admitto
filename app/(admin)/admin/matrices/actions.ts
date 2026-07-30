"use server";

import { revalidatePath } from "next/cache";
import { currentUser } from "@/lib/auth/current";
import { isBackofficeRole } from "@/auth.config";
import { decideBlockRevision } from "@/lib/matrices/blocks";
import { decideRuleRevision } from "@/lib/matrices/rules";
import { blockRevisionStore, ruleRevisionStore } from "@/lib/store/matrices";
import {
  BLOCK_REFUSAL_MESSAGES,
  RULE_REFUSAL_MESSAGES,
  matrices,
} from "@/content/matrices";

/**
 * Édition des matrices (CDC §33).
 *
 * Le rôle est revérifié ICI, en plus du middleware. Le reste du back-office
 * s'en remet au middleware ; ces actions touchent aux règles qui produisent
 * les voies préliminaires et aux textes que lisent les clients — pour elles,
 * la défense en profondeur se justifie : un middleware mal configuré un jour
 * ne doit pas suffire à ouvrir l'édition.
 *
 * Les décisions (`decideRuleRevision`, `decideBlockRevision`) vivent dans
 * lib/ : une action appelée directement se heurte aux mêmes refus que le
 * formulaire — activation sans source, vocabulaire interdit, variable qui ne
 * serait jamais substituée.
 */

async function requireBackoffice(): Promise<boolean> {
  const user = await currentUser();
  return user !== null && isBackofficeRole(user.role);
}

export async function saveRuleRevision(formData: FormData) {
  if (!(await requireBackoffice())) return { error: matrices.errors.access };

  const decision = decideRuleRevision(
    {
      ruleId: String(formData.get("ruleId") ?? ""),
      active: formData.get("active") === "on",
      sourceUrl: String(formData.get("sourceUrl") ?? ""),
      verifiedAt: String(formData.get("verifiedAt") ?? ""),
    },
    new Date()
  );
  if (!decision.accepted) return { error: RULE_REFUSAL_MESSAGES[decision.refusal.reason] };

  await ruleRevisionStore.add({
    ruleId: String(formData.get("ruleId")),
    active: decision.active,
    sourceUrl: decision.sourceUrl,
    verifiedAt: decision.verifiedAt,
  });

  revalidatePath("/admin/matrices");
  return { ok: true };
}

export async function saveBlockRevision(formData: FormData) {
  if (!(await requireBackoffice())) return { error: matrices.errors.access };

  const key = String(formData.get("key") ?? "");
  const decision = decideBlockRevision(key, {
    title: formData.get("title") ?? undefined,
    text: formData.get("text") ?? undefined,
    body: formData.get("body") ?? undefined,
    actions: formData.get("actions") ?? undefined,
  });
  if (!decision.accepted) {
    const { reason } = decision.refusal;
    const detail = "detail" in decision.refusal ? decision.refusal.detail : undefined;
    return { error: BLOCK_REFUSAL_MESSAGES[reason](detail) };
  }

  await blockRevisionStore.add(key, decision.payload);

  revalidatePath("/admin/matrices");
  return { ok: true };
}
