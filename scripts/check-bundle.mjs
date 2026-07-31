#!/usr/bin/env node
/**
 * Budget de JavaScript PAR ROUTE (lot E).
 *
 * Complète les budgets mesurés au navigateur (`verify:animations`,
 * `verify:backoffice`), qui pèsent le chargement complet d'une page. Utile,
 * mais grossier : le socle commun à toutes les routes y représente l'essentiel
 * du poids, et une régression de quinze kilo-octets s'y perd. C'est exactement
 * l'ordre de grandeur du défaut que ce lot a corrigé — un composant client
 * important une constante depuis le module du store y amenait le client
 * Prisma, 18,9 Ko pour dessiner trois boutons.
 *
 * Ce script mesure donc ce qui est PROPRE à chaque route : ses fichiers moins
 * ceux que toutes les routes chargent de toute façon. Un import qui traverse
 * la frontière serveur/client s'y voit immédiatement, et sur la route exacte.
 *
 * Déterministe, sans navigateur : lit le manifeste produit par `next build`.
 *
 * Usage : node scripts/check-bundle.mjs
 */
import { readFileSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const NEXT = ".next";
const MANIFEST = join(NEXT, "app-build-manifest.json");

if (!existsSync(MANIFEST)) {
  console.error("✗ Aucun build à mesurer. Lancer `npm run build` d'abord.");
  process.exit(1);
}

/**
 * Plafonds, en kilo-octets NON compressés — l'unité du manifeste.
 *
 * Volontairement serrés autour des valeurs mesurées : un plafond confortable
 * ne signale jamais rien. Les relever demande une seconde de réflexion, ce qui
 * est précisément le but.
 */
const BUDGETS_KO = {
  /*
   * Défaut calibré sur les routes mesurées, avec une marge courte : un plafond
   * confortable ne signale jamais rien. Le relever demande une seconde de
   * réflexion, ce qui est le but.
   *
   * Attention à la lecture : un fichier partagé par DEUX routes compte
   * entièrement dans les deux. Ces chiffres ne s'additionnent donc pas, et
   * sont plus élevés que la colonne « Size » de `next build`, qui déduit
   * davantage. Ce qu'ils mesurent bien, c'est la VARIATION d'une route.
   */
  défaut: 20,
  // L'accueil porte les onze sections du CDC §11 ; les pages autonomes du lot
  // E en portent une chacune, plus la nav et le pied de page.
  "/(marketing)/page": 56,
  "/(marketing)/offres/page": 36,
  "/(marketing)/faq/page": 34,
  "/(marketing)/a-propos/page": 34,
  // Pages légales : tableaux, listes et blocs d'entrées à compléter.
  "/(marketing)/mentions-legales/page": 36,
  "/(marketing)/confidentialite/page": 36,
  "/(marketing)/conditions-generales/page": 36,
  // Tableau de bord et feuille de route partagent la projection temporelle,
  // le composant interactif le plus gros du produit.
  "/(app)/app/dashboard/page": 28,
  "/(app)/app/roadmap/page": 28,
};

const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
const routes = Object.entries(manifest.pages);

/** Fichiers chargés par TOUTES les routes : le socle, hors budget de route. */
const shared = new Set(
  routes.length
    ? routes[0][1].filter((file) => routes.every(([, files]) => files.includes(file)))
    : []
);

const sizeOf = (file) => {
  try {
    return statSync(join(NEXT, file)).size;
  } catch {
    return 0;
  }
};

const failures = [];
const mesures = [];

for (const [route, files] of routes) {
  const bytes = files.filter((file) => !shared.has(file)).reduce((sum, f) => sum + sizeOf(f), 0);
  const ko = bytes / 1024;
  const budget = BUDGETS_KO[route] ?? BUDGETS_KO.défaut;
  mesures.push({ route, ko, budget });
  if (ko > budget) failures.push({ route, ko, budget });
}

mesures.sort((a, b) => b.ko - a.ko);
console.log(`Socle commun : ${[...shared].reduce((s, f) => s + sizeOf(f), 0) / 1024 | 0} Ko`);
console.log("Cinq routes les plus lourdes (hors socle) :");
for (const { route, ko, budget } of mesures.slice(0, 5)) {
  console.log(`  ${ko.toFixed(1).padStart(6)} Ko / ${budget} Ko   ${route}`);
}

if (failures.length) {
  console.error("");
  for (const { route, ko, budget } of failures) {
    console.error(`✗ ${route} — ${ko.toFixed(1)} Ko, budget ${budget} Ko`);
  }
  // Ligne de bilan à la convention des suites : `verify-all` distingue un
  // échec d'assertion d'un plantage à cette phrase, et reprendrait inutilement
  // un contrôle déterministe sans elle.
  console.error(`\n${failures.length} point(s) en échec.`);
  console.error(
    "\nUn dépassement vient presque toujours d'un import qui traverse la frontière\n" +
      "serveur/client : une valeur (et non un `import type`) tirée d'un module qui\n" +
      "atteint Prisma, le transport d'email ou un module `node:*`."
  );
  process.exit(1);
}

console.log(`\n✓ check:bundle — ${routes.length} routes sous leur budget.`);
