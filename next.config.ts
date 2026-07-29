import type { NextConfig } from "next";

/**
 * En-têtes de sécurité (revue §A3).
 *
 * La politique de contenu doit composer avec la convention du site : tous les
 * styles sont **inline dans le JSX**, ce qui impose `'unsafe-inline'` sur
 * `style-src`. Ce n'est pas un oubli — c'est le prix du design system, et il
 * n'ouvre aucune exécution de script. Tout le reste est verrouillé, en
 * particulier :
 *
 * - `frame-ancestors 'none'` : le back-office ne peut pas être encadré, donc
 *   pas de détournement de clic sur ses boutons d'envoi de rapport ;
 * - `form-action 'self'` : un formulaire injecté ne peut pas poster ailleurs ;
 * - `object-src 'none'` et `base-uri 'self'` : deux vecteurs classiques fermés.
 *
 * `script-src` conserve `'unsafe-inline'` : Next.js injecte le script
 * d'hydratation en ligne. Le durcir suppose des nonces, donc un middleware qui
 * réécrit chaque réponse HTML — à faire quand le bénéfice le justifiera.
 */
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data:",
  // Les polices sont auto-hébergées par next/font au build : 'self' suffit.
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline'",
  "connect-src 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Doublon volontaire de `frame-ancestors` : les navigateurs anciens ignorent
  // la CSP mais respectent cet en-tête.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Aucune de ces API n'est utilisée : les refuser évite qu'une dépendance
  // future les réclame sans que personne ne s'en aperçoive.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Les pages marketing sont statiques par défaut (App Router) : le cache CDN
  // de Vercel sert le HTML pré-rendu. Ne passer une page en dynamique que si
  // elle dépend réellement de la session (dashboard, résultat).
  poweredByHeader: false,

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
