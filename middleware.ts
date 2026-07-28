import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE, verifyAccessToken } from "@/lib/access/session";

/**
 * Protection du back-office (CDC §33) et de l'espace payant (CDC §21).
 *
 * Les deux sont **fermés par défaut** : sans le secret correspondant configuré,
 * l'accès est refusé. Une interface d'administration ou un espace payant ouvert
 * par accident serait pire qu'absent.
 *
 * À remplacer par Auth.js avec rôles (ADMIN / REVIEWER / USER) en Phase 3.
 */

const ADMIN_COOKIE = "admitto_admin";

export async function middleware(request: NextRequest) {
  return request.nextUrl.pathname.startsWith("/admin")
    ? guardAdmin(request)
    : guardApp(request);
}

/** Back-office : accès par jeton unique, une fois, qui pose un cookie. */
function guardAdmin(request: NextRequest) {
  const expected = process.env.ADMITTO_ADMIN_TOKEN;
  if (!expected) return notFound(request);

  const provided = request.nextUrl.searchParams.get("token");
  if (provided && timingSafeEqual(provided, expected)) {
    const url = request.nextUrl.clone();
    url.searchParams.delete("token");
    const response = NextResponse.redirect(url);
    response.cookies.set(ADMIN_COOKIE, expected, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/admin",
    });
    return response;
  }

  const cookie = request.cookies.get(ADMIN_COOKIE)?.value;
  if (cookie && timingSafeEqual(cookie, expected)) return NextResponse.next();

  return notFound(request);
}

/**
 * Espace payant : cookie signé portant l'identifiant d'évaluation. Un accès
 * refusé renvoie vers le diagnostic plutôt que vers une 404 — l'espace payant
 * n'est pas un secret, il est simplement réservé.
 */
async function guardApp(request: NextRequest) {
  const token = request.cookies.get(ACCESS_COOKIE)?.value;
  if (await verifyAccessToken(token, new Date())) return NextResponse.next();

  return NextResponse.redirect(new URL("/diagnostic", request.url));
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

export const config = { matcher: ["/admin/:path*", "/app/:path*"] };
