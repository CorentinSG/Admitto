import { prisma } from "@/lib/db/client";
import { purgeRateLimitHits } from "./rate-limit";
import { purgeUnclaimedAssessments } from "@/lib/legal/retention";
import { log } from "@/lib/observability/log";

/**
 * Purge des données techniques périmées (revue §B2/§C6).
 *
 * Ni les jetons de connexion expirés ni les tentatives comptées n'ont de valeur
 * au-delà de quelques minutes. Les garder fait grossir deux tables sans fin, et
 * un jeton expiré conservé reste une trace de qui a demandé à se connecter et
 * quand — donnée dont on n'a plus besoin.
 *
 * Greffée sur la route cron des rappels d'échéance : un déclencheur de moins à
 * configurer, et l'un ne sert à rien sans l'autre en production.
 */
export interface PurgeSummary {
  expiredTokens: number;
  rateLimitHits: number;
  /**
   * Diagnostics jamais rattachés à un compte, effacés au titre de la durée de
   * conservation annoncée dans la politique de confidentialité. Ce n'est pas
   * une donnée technique : c'est le seul effacement du produit que personne ne
   * peut demander — le titulaire n'a pas de compte depuis lequel le faire. Il
   * suit le même déclencheur faute d'en avoir un à lui.
   */
  unclaimedAssessments: number;
}

export async function purgeTechnicalData(reference: Date = new Date()): Promise<PurgeSummary> {
  const rateLimitHits = await purgeRateLimitHits(reference);
  const unclaimedAssessments = await purgeUnclaimedAssessments(reference);

  const db = prisma();
  const expiredTokens = db
    ? (await db.verificationToken.deleteMany({ where: { expires: { lt: reference } } })).count
    : 0;

  const summary = { expiredTokens, rateLimitHits, unclaimedAssessments };

  /*
   * Un seul point de journalisation, atteint par les deux régimes.
   *
   * La fonction sortait plus tôt quand la base est absente ; en journalisant
   * avant chaque `return`, le régime mémoire n'aurait rien écrit — c'est-à-dire
   * précisément le régime où l'on cherche à savoir si la purge tourne.
   *
   * Ce résumé compte des effacements, dont ceux de `unclaimedAssessments` :
   * la seule suppression que personne ne peut demander, faute de compte d'où
   * la demander. Elle doit laisser une trace de son passage — un effacement
   * dû qui ne s'exécute plus ne se voit autrement qu'en comptant les lignes
   * restées en base.
   */
  log("info", "purge.done", { ...summary, database: Boolean(db) });

  return summary;
}
