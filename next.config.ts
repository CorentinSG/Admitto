import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Les pages marketing sont statiques par défaut (App Router) : le cache CDN
  // de Vercel sert le HTML pré-rendu. Ne passer une page en dynamique que si
  // elle dépend réellement de la session (dashboard, résultat).
  poweredByHeader: false,
};

export default nextConfig;
