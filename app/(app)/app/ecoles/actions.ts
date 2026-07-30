"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { currentAssessmentId } from "@/lib/auth/current";
import { schoolStore } from "@/lib/store/schools";
import { decideAdd, type Ambition, type SchoolStatus } from "@/lib/schools/types";
import { AMBITIONS, SCHOOL_STATUSES } from "@/lib/schools/types";
import { REFUSAL_MESSAGES, ecoles } from "@/content/ecoles";

/**
 * Écriture de la liste d'écoles (tâche T-SEL-03).
 *
 * `decideAdd` vit dans lib/ et décide AVANT toute écriture : une action serveur
 * appelée directement se heurte aux mêmes refus que le formulaire — nom vide,
 * doublon, plafond, date inexistante. Le formulaire ne fait que rendre ces
 * refus lisibles plus tôt.
 */
export async function addSchool(formData: FormData) {
  const assessmentId = await currentAssessmentId();
  if (!assessmentId) return { error: ecoles.errors.access };

  const existing = await schoolStore.list(assessmentId);
  const decision = decideAdd({
    name: String(formData.get("name") ?? ""),
    ambition: String(formData.get("ambition") ?? ""),
    status: String(formData.get("status") ?? ""),
    applicationDeadline: String(formData.get("deadline") ?? ""),
    notes: String(formData.get("notes") ?? ""),
    existing,
  });

  if (!decision.accepted) return { error: REFUSAL_MESSAGES[decision.reason] };

  const partnershipId = String(formData.get("partnershipId") ?? "").trim() || null;

  await schoolStore.add({
    id: randomUUID(),
    assessmentId,
    name: decision.name,
    partnershipId,
    ambition: String(formData.get("ambition")) as Ambition,
    status: String(formData.get("status")) as SchoolStatus,
    applicationDeadline: decision.applicationDeadline,
    notes: decision.notes,
    addedAt: new Date().toISOString(),
  });

  revalidatePath("/app/ecoles");
  return { ok: true };
}

/**
 * Modification d'une école déjà listée.
 *
 * Les valeurs sont revalidées contre les unions fermées avant d'atteindre la
 * base : une chaîne libre écrite en base rendrait un libellé vide à l'écran, et
 * fausserait silencieusement le décompte de l'équilibre.
 */
export async function updateSchool(schoolId: string, formData: FormData) {
  const assessmentId = await currentAssessmentId();
  if (!assessmentId) return { error: ecoles.errors.access };

  const ambition = String(formData.get("ambition") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!(AMBITIONS as readonly string[]).includes(ambition)) {
    return { error: REFUSAL_MESSAGES.UNKNOWN_AMBITION };
  }
  if (!(SCHOOL_STATUSES as readonly string[]).includes(status)) {
    return { error: REFUSAL_MESSAGES.UNKNOWN_STATUS };
  }

  // La liste courante moins l'école modifiée : sans cette exclusion, elle se
  // heurterait à son propre nom et tout enregistrement serait un doublon.
  const existing = (await schoolStore.list(assessmentId)).filter(
    (school) => school.id !== schoolId
  );
  const current = (await schoolStore.list(assessmentId)).find((s) => s.id === schoolId);
  if (!current) return { error: ecoles.errors.notFound };

  const decision = decideAdd({
    name: current.name,
    ambition,
    status,
    applicationDeadline: String(formData.get("deadline") ?? ""),
    notes: String(formData.get("notes") ?? ""),
    existing,
  });
  if (!decision.accepted) return { error: REFUSAL_MESSAGES[decision.reason] };

  const updated = await schoolStore.update(assessmentId, schoolId, {
    ambition: ambition as Ambition,
    status: status as SchoolStatus,
    applicationDeadline: decision.applicationDeadline,
    notes: decision.notes,
  });
  if (!updated) return { error: ecoles.errors.notFound };

  revalidatePath("/app/ecoles");
  return { ok: true };
}

export async function removeSchool(schoolId: string) {
  const assessmentId = await currentAssessmentId();
  if (!assessmentId) return { error: ecoles.errors.access };

  // La suppression est bornée par l'évaluation dans le store : un identifiant
  // deviné ne retire rien de la liste de quelqu'un d'autre.
  const removed = await schoolStore.remove(assessmentId, schoolId);
  if (!removed) return { error: ecoles.errors.notFound };

  revalidatePath("/app/ecoles");
  return { ok: true };
}
