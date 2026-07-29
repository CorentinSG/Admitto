import type { NextAuthConfig } from "next-auth";

/**
 * Configuration Auth.js commune, sans adaptateur ni fournisseur (CDC §10).
 *
 * Ce fichier est importé par le middleware, qui s'exécute dans le runtime Edge.
 * Il ne doit donc atteindre ni Prisma, ni `node:*`, ni le transport d'email —
 * c'est la raison d'être de la scission avec `auth.ts`. Y ajouter l'adaptateur
 * ferait échouer le build du middleware, pas au premier appel mais à la
 * compilation.
 *
 * La session est portée par un JWT plutôt que par une ligne de base : le
 * middleware peut alors vérifier le rôle sans requête SQL à chaque navigation.
 */

export const ROLES = ["CLIENT", "REVIEWER", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

/** Rôles autorisés à ouvrir le back-office (CDC §33). */
export const BACKOFFICE_ROLES: readonly Role[] = ["ADMIN", "REVIEWER"];

/**
 * Le compte peut-il ouvrir le back-office ?
 *
 * Prend une chaîne, non un `Role` : la valeur vient d'un jeton, et un jeton
 * peut porter n'importe quoi. Comparer à la liste fermée est le contrôle.
 */
export function isBackofficeRole(role: string | undefined): boolean {
  return BACKOFFICE_ROLES.includes(role as Role);
}

export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/connexion",
    verifyRequest: "/connexion/verification",
    error: "/connexion",
  },
  providers: [],
  callbacks: {
    /**
     * Le rôle voyage dans le jeton. Il n'y est écrit qu'à la connexion, depuis
     * la colonne `User.role` : une élévation de privilège demande donc une
     * écriture en base, pas seulement un jeton forgé.
     */
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.role = (user as { role?: string }).role ?? "CLIENT";
      }
      return token;
    },
    /**
     * Destination après connexion.
     *
     * Le comportement par défaut renvoie à l'accueil dès que l'URL de retour
     * n'a pas exactement la même origine que celle qu'Auth.js s'attribue —
     * ce qui arrive au moindre écart d'hôte (127.0.0.1 contre localhost,
     * domaine apex contre www, proxy). L'utilisateur qui ouvre son lien se
     * retrouve alors sur la page d'accueil sans comprendre pourquoi.
     *
     * On garde donc la règle de sécurité — ne jamais rediriger hors du site —
     * mais on remplace le repli : l'accueil devient le tableau de bord.
     */
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        const target = new URL(url);
        if (target.origin === baseUrl) return url;
        // Origine différente : on ne suit jamais, mais on conserve le chemin
        // demandé s'il appartient à l'espace payant.
        if (target.pathname.startsWith("/app/")) return `${baseUrl}${target.pathname}`;
      } catch {
        // URL illisible : repli sur la destination par défaut.
      }
      return `${baseUrl}/app/dashboard`;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.userId as string) ?? "";
        session.user.role = (token.role as Role) ?? "CLIENT";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
