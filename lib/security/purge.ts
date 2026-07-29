import { prisma } from "@/lib/db/client";
import { purgeRateLimitHits } from "./rate-limit";

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
}

export async function purgeTechnicalData(reference: Date = new Date()): Promise<PurgeSummary> {
  const rateLimitHits = await purgeRateLimitHits(reference);

  const db = prisma();
  if (!db) return { expiredTokens: 0, rateLimitHits };

  const { count } = await db.verificationToken.deleteMany({
    where: { expires: { lt: reference } },
  });
  return { expiredTokens: count, rateLimitHits };
}
