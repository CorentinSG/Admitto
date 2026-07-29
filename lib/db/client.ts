import { PrismaClient } from "@prisma/client";

/**
 * Client Prisma (PLAN.md §4).
 *
 * Accroché à `globalThis` pour la même raison que les anciens stores en
 * mémoire : Next.js instancie le même module plusieurs fois entre l'action
 * serveur et la page, et en développement le rechargement à chaud recrée le
 * module à chaque édition. Sans ce singleton, on ouvre un pool de connexions
 * par rechargement jusqu'à saturer la base.
 *
 * Sans `DATABASE_URL`, aucun client n'est créé et les stores retombent sur
 * leur implémentation en mémoire. C'est la même bascule par configuration que
 * Stripe, Resend et le coffre : ce qui n'est pas configuré ne casse rien, il
 * dégrade explicitement. Le régime Phase 1A reste donc jouable sans base, et
 * la suite de tests tourne sans dépendance externe.
 */

const globalForPrisma = globalThis as typeof globalThis & {
  __admittoPrisma?: PrismaClient;
};

export function databaseUrl(): string | null {
  return process.env.DATABASE_URL?.trim() || null;
}

export function usingDatabase(): boolean {
  return databaseUrl() !== null;
}

/**
 * Client Prisma, ou `null` si la base n'est pas configurée.
 *
 * Renvoyer `null` plutôt que lancer laisse chaque store décider : tous
 * basculent sur la mémoire, et aucun ne fait échouer une page au chargement
 * pour une variable absente.
 */
export function prisma(): PrismaClient | null {
  if (!usingDatabase()) return null;
  globalForPrisma.__admittoPrisma ??= new PrismaClient();
  return globalForPrisma.__admittoPrisma;
}

/** Variante non nullable, pour le corps d'une branche déjà gardée. */
export function db(): PrismaClient {
  const client = prisma();
  if (!client) throw new Error("Base de données non configurée.");
  return client;
}
