"use server";

import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ACCESS_COOKIE, verifyAccessToken } from "@/lib/access/session";
import { documentStore } from "@/lib/store/documents";
import { decideUpload, extensionOf } from "@/lib/vault/policy";
import { storageKeyFor, vaultStorage } from "@/lib/vault/storage";
import type { DocumentType } from "@/lib/vault/types";
import { REFUSAL_MESSAGES, vault } from "@/content/vault";

/**
 * Dépôt et retrait de documents (CDC §29).
 *
 * L'ordre des opérations porte la règle : la décision d'acceptation précède
 * toute lecture des octets et toute écriture. Un fichier refusé n'aura jamais
 * existé côté serveur.
 */
export async function uploadDocument(formData: FormData) {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  const assessmentId = await verifyAccessToken(token, new Date());
  if (!assessmentId) return { error: vault.accessError };

  const type = String(formData.get("type") ?? "");
  const file = formData.get("file");
  const declaredName = String(formData.get("fileName") ?? "").trim();

  const hasFile = file instanceof File && file.size > 0;
  const fileName = hasFile ? file.name : declaredName;
  if (!fileName) return { error: REFUSAL_MESSAGES.EMPTY };

  // Sans stockage, la taille n'est pas une contrainte : rien n'est écrit.
  const sizeBytes = hasFile ? file.size : 1;

  const decision = decideUpload({
    type,
    fileName,
    sizeBytes,
    existingOfType: await documentStore.countOfType(assessmentId, type as DocumentType),
  });

  if (!decision.accepted) {
    const message = REFUSAL_MESSAGES[decision.reason];
    return {
      error:
        decision.reason === "SENSITIVE_CONTENT" && decision.detail
          ? `${message} ${vault.sensitivePrefix} : ${decision.detail}.`
          : decision.detail
            ? `${message} (${decision.detail})`
            : message,
    };
  }

  const id = randomUUID();
  let storageKey: string | null = null;

  if (hasFile && vaultStorage.enabled()) {
    storageKey = storageKeyFor(assessmentId, id, extensionOf(fileName));
    await vaultStorage.put(storageKey, new Uint8Array(await file.arrayBuffer()));
  }

  await documentStore.add({
    id,
    assessmentId,
    type: decision.type,
    fileName,
    sizeBytes: hasFile ? file.size : 0,
    uploadedAt: new Date().toISOString(),
    storageKey,
  });

  revalidatePath("/app/documents");
  revalidatePath("/app/dashboard");
  return { ok: true };
}

export async function removeDocument(documentId: string) {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  const assessmentId = await verifyAccessToken(token, new Date());
  if (!assessmentId) return { error: vault.accessError };

  // La lecture est bornée à l'évaluation du cookie : on ne supprime jamais
  // par identifiant seul, sinon un identifiant deviné atteindrait un autre coffre.
  const existing = await documentStore.get(assessmentId, documentId);
  if (!existing) return { ok: true };

  if (existing.storageKey) await vaultStorage.remove(existing.storageKey);
  await documentStore.remove(assessmentId, documentId);

  revalidatePath("/app/documents");
  revalidatePath("/app/dashboard");
  return { ok: true };
}
