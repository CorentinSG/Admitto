import { prisma } from "@/lib/db/client";
import { vaultStorage } from "@/lib/vault/storage";

/**
 * Accès, portabilité et effacement (RGPD art. 15, 17 et 20 — revue §A1.2).
 *
 * Le règlement n'exige pas qu'un droit s'exerce en un clic ; il exige qu'il
 * s'exerce. Mais une demande écrite à traiter à la main est un droit qui
 * dépend de la disponibilité de celui qui la reçoit. Ici, l'export et
 * l'effacement sont des opérations du produit : ils aboutissent sans qu'aucune
 * décision humaine n'intervienne.
 *
 * Deux principes tiennent l'implémentation :
 *
 * 1. **L'export énumère les tables, il ne les résume pas.** Un export qui
 *    n'affiche qu'un profil « propre » cache précisément ce que la personne
 *    veut voir : ce qui est réellement stocké. Chaque section correspond à un
 *    modèle de `prisma/schema.prisma`.
 *
 * 2. **L'effacement supprime les diagnostics AVANT le compte.** `User` →
 *    `Assessment` porte `onDelete: SetNull`, pas `Cascade` : supprimer le
 *    compte seul détacherait les diagnostics au lieu de les effacer, et
 *    laisserait en base un prénom, une adresse email et un profil complet que
 *    plus personne ne pourrait supprimer — le compte depuis lequel le demander
 *    n'existerait plus. La suppression explicite des diagnostics est donc la
 *    première opération, et c'est elle qui emporte, en cascade cette fois,
 *    rapports, corrections, tâches, scénarios, documents, rappels, jalons,
 *    réservations et droits.
 */

export interface PersonalDataExport {
  /** Horodatage de l'export, ISO — sert de preuve de date à qui le conserve. */
  exportedAt: string;
  account: {
    email: string;
    name: string | null;
    role: string;
    createdAt: string;
  };
  assessments: unknown[];
  /** Ce que l'export ne contient pas, et pourquoi. */
  notIncluded: string[];
}

const NOT_INCLUDED = [
  "Le contenu des fichiers déposés dans le coffre : ils sont téléchargeables depuis la page Documents, et les inclure ici en produirait une seconde copie.",
  "Les traces de paiement détenues par le prestataire de paiement, à demander directement auprès de lui.",
  "Les tentatives comptées sur les formulaires publics : elles sont effacées au bout de quelques heures et ne sont pas rattachées à un compte.",
];

/**
 * Copie des données rattachées à un compte.
 *
 * Renvoie `null` sans base : mieux vaut ne rien produire qu'un export vide qui
 * se lirait comme « le service ne détient rien sur vous ».
 */
export async function exportPersonalData(userId: string): Promise<PersonalDataExport | null> {
  const db = prisma();
  if (!db) return null;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true, role: true, createdAt: true },
  });
  if (!user) return null;

  const assessments = await db.assessment.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    include: {
      report: { include: { corrections: true } },
      taskStatuses: true,
      scenarios: true,
      // Métadonnées seules : le coffre ne stocke de toute façon pas le contenu
      // en base, seulement une clé de fichier.
      documents: {
        select: { id: true, type: true, fileName: true, sizeBytes: true, uploadedAt: true },
      },
      notices: true,
      milestones: true,
      bookings: { include: { slot: true } },
      entitlement: true,
    },
  });

  return {
    exportedAt: new Date().toISOString(),
    account: {
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
    },
    assessments,
    notIncluded: NOT_INCLUDED,
  };
}

export interface ErasureSummary {
  /** Nombre de diagnostics emportés — ce que la personne voit confirmé. */
  assessments: number;
}

/**
 * Efface les diagnostics rattachés, puis le compte.
 *
 * L'ordre n'est pas indifférent (voir l'en-tête du module) : commencer par le
 * compte détacherait les diagnostics au lieu de les effacer.
 *
 * Le nombre est renvoyé par `deleteMany` lui-même plutôt que compté au
 * préalable : deux requêtes séparées pourraient annoncer un nombre que la
 * suppression n'a pas atteint.
 */
export async function erasePersonalData(userId: string): Promise<ErasureSummary | null> {
  const db = prisma();
  if (!db) return null;

  /*
   * Les fichiers du coffre AVANT les lignes. La cascade du schéma emporte les
   * lignes `Document`, pas les octets sur le disque — et l'ordre inverse
   * laisserait, en cas d'interruption entre les deux, des fichiers que plus
   * aucune ligne ne désigne : invisibles, irretirables, au nom de quelqu'un
   * qui vient de demander leur effacement. Dans ce sens-ci, une interruption
   * laisse des lignes sans octets — un état que la route de téléchargement
   * traite déjà (« introuvable »), et que relancer l'effacement achève.
   */
  const assessments = await db.assessment.findMany({ where: { userId }, select: { id: true } });
  for (const { id } of assessments) await vaultStorage.removeAll(id);

  const { count } = await db.assessment.deleteMany({ where: { userId } });
  await db.user.delete({ where: { id: userId } });
  return { assessments: count };
}
