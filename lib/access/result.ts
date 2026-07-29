import { prisma } from "@/lib/db/client";
import { currentUser } from "@/lib/auth/current";

/**
 * Qui peut consulter un résultat de diagnostic (revue §B1).
 *
 * Le lien du résultat est envoyé par email avant qu'aucun compte n'existe : il
 * doit donc fonctionner sans session. Mais dès que la personne s'est connectée,
 * son diagnostic est rattaché à son compte — et le laisser accessible à
 * quiconque détient l'URL n'a plus de justification, alors que le risque, lui,
 * reste : un lien atterrit dans un historique, une messagerie, un presse-papier
 * partagé.
 *
 * La règle est donc celle de la revendication :
 *
 * - diagnostic **non revendiqué** (`userId` nul) → le lien suffit ;
 * - diagnostic **revendiqué** → seul son propriétaire y accède, ou un rôle du
 *   back-office qui doit précisément pouvoir relire les dossiers.
 *
 * Sans base de données, il n'y a ni compte ni revendication possible : le lien
 * suffit, ce qui correspond au régime Phase 1A.
 */

export type ResultAccess = "OPEN" | "GRANTED" | "DENIED";

export async function resultAccess(assessmentId: string): Promise<ResultAccess> {
  const db = prisma();
  if (!db) return "OPEN";

  const row = await db.assessment.findUnique({
    where: { id: assessmentId },
    select: { userId: true },
  });
  // Un diagnostic introuvable n'est pas un refus : la page rend son propre 404.
  if (!row || row.userId === null) return "OPEN";

  const user = await currentUser();
  if (!user) return "DENIED";
  if (user.id === row.userId) return "GRANTED";

  // Le back-office relit les dossiers : c'est son objet même (CDC §18).
  return user.role === "ADMIN" || user.role === "REVIEWER" ? "GRANTED" : "DENIED";
}
