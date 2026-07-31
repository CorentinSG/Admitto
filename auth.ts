import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { authConfig, type Role } from "./auth.config";
import { prisma } from "@/lib/db/client";
import { getTransport } from "@/lib/email/transport";
import { AUTH_EMAIL } from "@/content/auth";
import { log } from "@/lib/observability/log";

/**
 * Auth.js — comptes réels (CDC §10 et §33).
 *
 * Remplace le jeton d'accès signé de transition. Trois choix structurants :
 *
 * 1. **Lien de connexion par email, sans mot de passe.** Un mot de passe
 *    supplémentaire à retenir, à réinitialiser et à stocker n'apporte rien ici :
 *    l'adresse est déjà le point d'entrée du diagnostic.
 *
 * 2. **Fermé sans base.** L'adaptateur exige PostgreSQL. Sans `DATABASE_URL`,
 *    aucune connexion n'est possible et l'espace payant reste inaccessible —
 *    même règle que le reste du produit : ce qui n'est pas configuré est fermé,
 *    pas ouvert.
 *
 * 3. **Le premier administrateur s'amorce par configuration, pas par code.**
 *    `ADMITTO_ADMIN_EMAILS` élève au rôle ADMIN à la connexion. Sans cette
 *    variable, personne n'est administrateur et le back-office reste clos. La
 *    variable n'est lue qu'à la connexion : retirer une adresse n'ôte pas un
 *    rôle déjà accordé, c'est la colonne `User.role` qui fait foi ensuite.
 */

function bootstrapAdmins(): string[] {
  return (process.env.ADMITTO_ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export const { handlers, auth, signIn, signOut } = NextAuth(() => {
  const client = prisma();

  return {
    ...authConfig,
    // Sans base, aucun adaptateur : Auth.js refuse alors le fournisseur email,
    // et la connexion est impossible plutôt que silencieusement dégradée.
    adapter: client ? PrismaAdapter(client) : undefined,
    secret: process.env.AUTH_SECRET,
    providers: client
      ? [
          {
            id: "email",
            type: "email",
            name: "Email",
            from: process.env.ADMITTO_EMAIL_FROM ?? "admitto@localhost",
            maxAge: 15 * 60,
            options: {},
            /**
             * Passe par le transport du produit, et non par un envoi propre à
             * Auth.js : sans `RESEND_API_KEY` le lien est journalisé au lieu
             * d'être expédié, comme tout le reste des emails.
             */
            async sendVerificationRequest({
              identifier,
              url,
            }: {
              identifier: string;
              url: string;
            }) {
              await getTransport().send({
                to: identifier,
                subject: AUTH_EMAIL.subject,
                body: AUTH_EMAIL.body(url),
                // Un lien de connexion exécute le service : jamais promotionnel.
                legalBasis: "CONTRACT",
              });
            },
          },
        ]
      : [],
    callbacks: {
      ...authConfig.callbacks,

      /**
       * Rôle relu en base à la connexion.
       *
       * `authConfig.jwt` se contente de `user.role`, ce qui suffit au runtime
       * Edge mais dépend de l'ordre dans lequel Auth.js crée le compte et
       * mint le jeton. Ici, côté Node, on interroge la base : c'est la seule
       * valeur qui fasse foi, et une requête par connexion — pas par requête.
       */
      async jwt({ token, user }) {
        if (!user) return token;
        token.userId = user.id;

        const db = prisma();
        const row = user.id
          ? await db?.user.findUnique({ where: { id: user.id }, select: { role: true } })
          : null;
        token.role = (row?.role ?? (user as { role?: string }).role ?? "CLIENT") as Role;
        return token;
      },
    },

    events: {
      /**
       * Élévation du premier administrateur (CDC §33).
       *
       * Dans `events.createUser`, le compte existe : c'est le premier instant
       * où son rôle peut être écrit. La faire plus tôt viserait une ligne
       * inexistante.
       */
      async createUser({ user }) {
        const db = prisma();
        if (!db || !user.email || !user.id) return;
        if (!bootstrapAdmins().includes(user.email.toLowerCase())) return;

        await db.user.update({
          where: { id: user.id },
          data: { role: "ADMIN" satisfies Role },
        });

        // Une élévation de privilège se journalise toujours : c'est le seul
        // événement du produit qui donne accès aux données de tous les
        // autres. L'adresse n'est pas écrite — savoir QU'UN administrateur a
        // été amorcé suffit à repérer une élévation inattendue, et la base
        // dit lequel.
        log("warn", "auth.admin.bootstrap", { bootstrapped: true });
      },

      /**
       * Reprise du profil sans ressaisie (CDC §10).
       *
       * Rattachement dans un ÉVÉNEMENT et non dans le callback `signIn` : ce
       * callback s'exécute **avant** que l'adaptateur ne crée le compte, si
       * bien qu'à la première connexion il n'y avait aucun compte à rattacher.
       * Conséquence observée : tout nouvel utilisateur se connectait sans
       * jamais retrouver son diagnostic — l'exigence du CDC §10 tombait pour
       * exactement les personnes qu'elle vise.
       *
       * Un événement ne peut pas bloquer la connexion, ce qui est le bon
       * comportement : un rattachement raté ne doit pas empêcher d'entrer.
       */
      async signIn({ user }) {
        const db = prisma();
        if (!db || !user?.email || !user.id) return;

        const { count } = await db.assessment.updateMany({
          where: { email: user.email.toLowerCase(), userId: null },
          data: { userId: user.id },
        });

        // Le compteur, jamais l'adresse ni l'identifiant du compte. Ce qu'on
        // veut voir ici est un régime : si `attached` vaut toujours 0 alors
        // que des diagnostics arrivent, le rattachement du CDC §10 est cassé
        // — c'est exactement la panne qui avait déjà eu lieu, et que rien
        // n'avait signalée.
        log("info", "auth.signin", { attached: count });
      },
    },
  };
});
