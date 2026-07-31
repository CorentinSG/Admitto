import type { MetadataRoute } from "next";
import { publicBaseUrl } from "@/lib/seo/site";
import { INDEXABLE_PATHS } from "@/content/pages";

/**
 * sitemap.xml (lot E).
 *
 * Liste FERMÉE, tenue dans `content/pages.ts` : rien n'est découvert par
 * balayage du système de fichiers. Un sitemap construit depuis l'arborescence
 * publierait chaque nouvelle route sans qu'on ait décidé qu'elle est publique
 * — et la première route personnelle ajoutée s'y retrouverait.
 *
 * Vide tant que le site n'est pas public : un sitemap d'URL locales n'aurait
 * aucun sens, et Next.js sert alors un document valide mais sans entrée.
 *
 * Pas de `lastModified` : il faudrait une date de publication par page pour
 * qu'il dise quelque chose. Inventée à la date du rendu, elle affirmerait que
 * tout change à chaque déploiement — un signal faux vaut moins que pas de
 * signal.
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

export default function sitemap(): MetadataRoute.Sitemap {
  const base = publicBaseUrl();
  if (!base) return [];

  return INDEXABLE_PATHS.map((path) => ({
    url: path === "/" ? base : `${base}${path}`,
    changeFrequency: "monthly" as const,
    priority: path === "/" ? 1 : 0.7,
  }));
}
