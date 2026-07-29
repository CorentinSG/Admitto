import type { Role } from "@/auth.config";

/**
 * Le rôle circule dans la session et dans le jeton.
 *
 * Déclaré ici plutôt que casté à chaque lecture : un `as Role` dispersé dans
 * les pages finirait par masquer une session qui ne porte pas de rôle du tout.
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      role: Role;
    };
  }

  interface User {
    role?: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    role?: Role;
  }
}
