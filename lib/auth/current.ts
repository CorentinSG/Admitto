import { auth } from "@/auth";
import { prisma } from "@/lib/db/client";

/**
 * Identité courante côté serveur (CDC §10).
 *
 * Remplace `verifyAccessToken` : l'accès ne vient plus d'un jeton portant un
 * identifiant d'évaluation, mais d'un compte. Le diagnostic consulté est celui
 * qui appartient à ce compte — un identifiant d'évaluation présenté dans une
 * URL ne donne donc plus aucun droit à lui seul.
 *
 * `currentAssessmentId` renvoie `null` dans trois cas indissociables du point
 * de vue de l'appelant : pas de session, pas de base, ou aucun diagnostic
 * rattaché. Tous conduisent au même endroit — l'espace payant est fermé.
 */

export interface CurrentUser {
  id: string;
  email: string;
  role: string;
}

export async function currentUser(): Promise<CurrentUser | null> {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) return null;
  return { id: session.user.id, email: session.user.email, role: session.user.role };
}

/**
 * Diagnostic rattaché au compte connecté. Le plus récent si la personne en a
 * soumis plusieurs : c'est celui qui reflète sa situation actuelle.
 */
export async function currentAssessmentId(): Promise<string | null> {
  const user = await currentUser();
  const db = prisma();
  if (!user || !db) return null;

  const assessment = await db.assessment.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
  return assessment?.id ?? null;
}


