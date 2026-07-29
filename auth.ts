import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { authConfig, type Role } from "./auth.config";
import { prisma } from "@/lib/db/client";
import { getTransport } from "@/lib/email/transport";
import { AUTH_EMAIL } from "@/content/auth";

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
       * Reprise du profil sans ressaisie (CDC §10).
       *
       * À la connexion, les diagnostics portant cette adresse et encore
       * rattachés à aucun compte sont attachés. Le rattachement se fait ici et
       * non à l'affichage : un utilisateur doit retrouver son profil parce
       * qu'il s'est connecté, pas parce qu'il a ouvert la bonne page.
       */
      async signIn({ user, email: request }) {
        // Auth.js appelle ce callback DEUX fois pour un lien email : d'abord à
        // la demande, où le compte n'existe pas encore, puis à l'ouverture du
        // lien. Rattacher dès la demande viserait un identifiant inexistant —
        // et la clé étrangère refuserait l'écriture.
        if (request?.verificationRequest) return true;

        const db = prisma();
        if (!db || !user.email) return true;
        const address = user.email.toLowerCase();

        // Le compte est relu par son adresse plutôt que pris dans `user` : le
        // rattachement doit viser une ligne dont on sait qu'elle existe.
        const account = await db.user.findUnique({ where: { email: user.email } });
        if (!account) return true;

        if (bootstrapAdmins().includes(address) && account.role === "CLIENT") {
          await db.user.update({
            where: { id: account.id },
            data: { role: "ADMIN" satisfies Role },
          });
        }

        await db.assessment.updateMany({
          where: { email: address, userId: null },
          data: { userId: account.id },
        });
        return true;
      },
    },
  };
});
