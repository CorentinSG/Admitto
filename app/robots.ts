import type { MetadataRoute } from "next";
import { publicBaseUrl } from "@/lib/seo/site";

/**
 * robots.txt (lot E).
 *
 * Fermé par défaut, comme le reste du produit : sans `ADMITTO_BASE_URL`
 * pointant vers une adresse publique, tout est interdit à l'exploration. Une
 * prévisualisation ne doit pas se faire indexer, et les mentions légales
 * portent encore des valeurs à compléter (voir `lib/seo/site.ts`).
 *
 * Quand le site est public, l'interdiction est ciblée : les zones privées
 * portent déjà `robots: noindex` dans leurs métadonnées, mais une balise ne
 * s'applique qu'à une page qu'on a d'abord chargée. Le refus d'exploration
 * évite le chargement lui-même — et `/admin` n'a pas à exister pour un robot.
 */
/**
 * Évalué à CHAQUE requête, pas au build.
 *
 * Par défaut Next.js prérend ce fichier : `ADMITTO_BASE_URL` était alors lue
 * sur la machine de compilation, et une valeur posée seulement au démarrage
 * n'avait aucun effet. Le piège est silencieux — le fichier existe, il est
 * valide, il est vide — et le site n'aurait jamais été indexé sans que rien
 * ne le signale. Toute la configuration de ce produit est lue à l'exécution ;
 * ces deux routes doivent l'être aussi.
 */
export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  const base = publicBaseUrl();

  if (!base) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/app/",
          "/api/",
          "/connexion",
          "/resultat/",
          "/rapport/",
          "/desinscription/",
          "/diagnostic/paiement/",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
