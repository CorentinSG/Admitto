import { prisma } from "@/lib/db/client";

/**
 * Rétention des diagnostics jamais rattachés à un compte (revue §A1.3).
 *
 * Un diagnostic est créé avant qu'aucun compte n'existe : c'est la mécanique du
 * produit, l'email J+0 part avant la première connexion. Beaucoup de ces
 * diagnostics ne seront jamais revendiqués. Ils contiennent pourtant un prénom,
 * une adresse email et un profil complet, et personne n'est là pour en demander
 * l'effacement — le titulaire n'a pas de compte depuis lequel le faire.
 *
 * Les conserver sans limite serait la seule donnée du produit qu'aucun geste
 * humain ne peut supprimer. D'où une durée fixée ici, annoncée dans la
 * politique de confidentialité, et appliquée sans décision : passé le délai,
 * la ligne disparaît.
 *
 * Un diagnostic rattaché à un compte n'est jamais touché par cette purge, quel
 * que soit son âge : c'est le travail de son titulaire, et lui seul en décide.
 */

/**
 * Douze mois : au-delà d'un cycle de candidature complet, un diagnostic non
 * revendiqué ne sert plus ni à celui qui l'a demandé ni au service. En deçà,
 * la purge effacerait le profil de quelqu'un qui candidate encore.
 */
export const UNCLAIMED_RETENTION_MONTHS = 12;

export function unclaimedCutoff(reference: Date = new Date()): Date {
  const cutoff = new Date(reference);
  cutoff.setUTCMonth(cutoff.getUTCMonth() - UNCLAIMED_RETENTION_MONTHS);
  return cutoff;
}

/**
 * Supprime les diagnostics jamais rattachés, antérieurs au seuil.
 *
 * Le schéma porte `onDelete: Cascade` sur tout ce qui dépend d'un diagnostic :
 * rapport, corrections, tâches, scénarios, documents, rappels envoyés, jalons,
 * réservations, droits. Une seule suppression suffit donc — et il n'existe pas
 * de chemin où la ligne partirait en laissant ses dépendances derrière elle.
 */
export async function purgeUnclaimedAssessments(reference: Date = new Date()): Promise<number> {
  const db = prisma();
  if (!db) return 0;

  const { count } = await db.assessment.deleteMany({
    where: { userId: null, createdAt: { lt: unclaimedCutoff(reference) } },
  });
  return count;
}
