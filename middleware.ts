import { NextResponse, type NextRequest } from "next/server";

/**
 * Protection du back-office (CDC §33).
 *
 * Mesure de transition, volontairement minimale mais fermée par défaut :
 *  - sans `ADMITTO_ADMIN_TOKEN` configuré, /admin répond 404 — jamais de
 *    back-office ouvert par accident ;
 *  - l'accès se fait une fois par `/admin?token=…`, qui pose un cookie httpOnly ;
 *  - toute autre requête reçoit 404 plutôt que 401, pour ne pas révéler
 *    l'existence de l'interface.
 *
 * À remplacer par Auth.js avec rôles (ADMIN / REVIEWER) en Phase 2.
 */

const COOKIE = "admitto_admin";

export function middleware(request: NextRequest) {
  const expected = process.env.ADMITTO_ADMIN_TOKEN;
  if (!expected) return notFound(request);

  const provided = request.nextUrl.searchParams.get("token");
  if (provided && timingSafeEqual(provided, expected)) {
    const url = request.nextUrl.clone();
    url.searchParams.delete("token");
    const response = NextResponse.redirect(url);
    response.cookies.set(COOKIE, expected, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/admin",
    });
    return response;
  }

  const cookie = request.cookies.get(COOKIE)?.value;
  if (cookie && timingSafeEqual(cookie, expected)) return NextResponse.next();

  return notFound(request);
}

function notFound(request: NextRequest) {
  return NextResponse.rewrite(new URL("/404-admin", request.url), { status: 404 });
}

/** Comparaison à temps constant, pour ne pas fuiter le jeton octet par octet. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export const config = { matcher: "/admin/:path*" };
