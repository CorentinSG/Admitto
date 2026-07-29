import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig, isBackofficeRole } from "./auth.config";

/**
 * Protection du back-office (CDC §33) et de l'espace payant (CDC §21).
 *
 * Les deux restent **fermés par défaut** : sans session valide, l'accès est
 * refusé. Ce qui change avec Auth.js, c'est la nature de la preuve — un compte
 * et un rôle, non plus un jeton partagé.
 *
 * Le middleware s'exécute en Edge. Il utilise donc `authConfig` seul, sans
 * adaptateur Prisma : le rôle est lu dans le JWT, sans requête SQL. Importer
 * `@/auth` ici ferait entrer Prisma dans le bundle Edge et casserait le build.
 *
 * Deux refus différents, délibérément :
 * - `/admin` répond 404. Une interface d'administration ne doit pas révéler
 *   son existence à qui n'y a pas droit.
 * - `/app` redirige vers la connexion. L'espace payant n'est pas un secret,
 *   il est réservé — et la personne a une action à portée de main.
 */
const { auth } = NextAuth(authConfig);

export default auth((request) => {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/admin")) {
    if (isBackofficeRole(request.auth?.user?.role)) return NextResponse.next();
    return NextResponse.rewrite(new URL("/404-admin", request.url), { status: 404 });
  }

  if (request.auth?.user?.id) return NextResponse.next();
  return NextResponse.redirect(new URL("/connexion", request.url));
});

export const config = { matcher: ["/admin/:path*", "/app/:path*"] };
