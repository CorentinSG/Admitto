# Plan d'amélioration V2 — après la revue du 30 juillet 2026

> Succède au plan en cinq lots de `REVUE-AMELIORATION.md`, dont les lots 1 à 3
> sont livrés et le lot 4 aux deux tiers. Point de départ vérifié : 382 tests,
> 11 suites navigateur (279 points, deux exécutions consécutives identiques),
> 8 garde-fous, régimes dégradés sondés route par route.

## Le principe qui ordonne ce plan

**Le code n'est plus le chemin critique.** L'infrastructure couvre ~95 % du
CDC ; ce qui manque pour que le produit remplisse ses objectifs est du contenu
(modules, règles vérifiées) et de la validation terrain (les 15–20 rapports de
la bêta que le CDC §2 place AVANT la plateforme). Le rôle du code est donc
désormais de **rendre le fondateur autonome et mesurable**, puis de finir les
dettes connues — pas d'ajouter des fonctions.

Deux pistes avancent en parallèle. Elles ne se bloquent pas l'une l'autre.

---

## Piste fondateur (aucun code, mais chemin critique du projet)

| #   | Action                                                                                                           | Pourquoi c'est bloquant                                                                                      | Où                                                                    |
| --- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| F1  | Vérifier R-NY-001, R-NY-002, R-ALT-001 contre les sources officielles (NY BOLE, Court of Appeals) et les activer | Le Moteur A tourne à vide : quasi tous les profils tombent en « revue humaine ». Sûr, mais non différenciant | `lib/engine-a/` — `check:rules` refuse une activation non sourcée     |
| F2  | Lancer la bêta : 15–20 diagnostics réels, rapports rédigés à la main                                             | C'est l'ordre imposé par le CDC §2 ; tout le reste du produit est une hypothèse tant que ce n'est pas fait   | Le produit est prêt : régime Phase 1A sans aucune clé                 |
| F3  | Rédiger les modules 1 à 10 (ordre de production §25.1)                                                           | L'offre PLATFORM promet une bibliothèque qui existe à 9 %                                                    | `content/modules.ts` — `isPublishable` retient tout module non sourcé |
| F4  | Compléter les mentions `À COMPLÉTER` des pages légales                                                           | Reporté par décision assumée (pas de commercialisation avant 2027) — à faire avant toute URL publique        | Listées en tête de chaque page concernée                              |
| F5  | Clés de production le moment venu (DATABASE_URL, AUTH, RESEND, STRIPE, VAULT)                                    | Chaque absence ferme proprement la fonction correspondante                                                   | `.env.example`                                                        |

Le lot A ci-dessous réduit la charge de F1 et F3 : il permet de faire ces
itérations sans commit.

---

## Piste code

### Lot A — Autonomie du fondateur : matrices éditables (§33) — **FAIT**

Le dernier « À faire » du plan de construction. Objectif : que F1 et F3 ne
passent plus par un dépôt Git.

1. **Règles du Moteur A éditables depuis le back-office** : activer/désactiver,
   modifier source, date de vérification et version. Le garde-fou reste le
   même qu'en code : une règle sans source ni date ne peut pas être activée —
   le refus vit dans lib/, pas dans l'écran.
2. **Blocs de texte du rapport éditables** (`content/report-blocks.ts` →
   table `TextBlock` versionnée). Chaque modification crée une VERSION, jamais
   d'écrasement : un rapport rouvert doit citer les blocs tels qu'ils étaient
   à sa génération — même principe que `rulesSnapshot`.
3. **Périmètre exclu, délibérément** : les barèmes du Moteur B et les gabarits
   d'email restent en code. Les premiers parce qu'un plafonnement se teste, ne
   s'improvise pas en production ; les seconds parce que `check:vocabulary` ne
   voit que le dépôt.
4. Le questionnaire, les moteurs et l'assemblage lisent la base quand elle est
   là, le fichier sinon — même motif à double implémentation que les stores.

_Vérification : nouvelle suite `verify:matrices` (modifier un bloc depuis le
back-office → le rapport suivant l'utilise, l'ancien rapport cite l'ancienne
version ; activer une règle sans source → refus). `check:rules` rejoué contre
la base._

### Lot B — Boucle de mesure (fin du lot 4) — ~2-3 jours, priorité 2

La bêta (F2) n'apprend rien sans mesure. À livrer avant son lancement.

1. **Événements produit §36** : questionnaire démarré / complété / abandonné
   (avec l'écran d'abandon), résultat ouvert, rapport ouvert, lien email
   cliqué. Stockés en base (table `ProductEvent`, anonyme avant compte),
   affichés dans `/admin/metriques`. Aucun traceur tiers — la politique de
   confidentialité l'affirme déjà, l'implémentation doit le rester.
2. **État « déduction expirée »** affiché sur la page de paiement : le prix
   plein et la raison, jamais un prix sans explication (le calcul existe,
   `applyDeduction` rend déjà `reason: "EXPIRED"` — il n'est pas affiché).
3. **Funnel dans les métriques** : démarrés → complétés → ouverts → payés,
   chaque chiffre avec son nombre d'observations, comme les métriques
   existantes.

_Vérification : événements visibles dans `/admin/metriques` après un parcours
de la suite navigateur ; `check:legal` échouera sur la nouvelle table tant que
la politique de confidentialité ne la déclare pas — c'est voulu._

### Lot C — Accessibilité — ~2 jours, priorité 3

Le seul endroit où le produit est en dessous de son propre standard.

1. Lien d'évitement vers le contenu principal, sur toutes les pages.
2. Focus géré dans le questionnaire : au changement d'écran, le focus va au
   titre de l'écran — aujourd'hui il reste sur le bouton disparu.
3. **Arbitrage contraste** (décision fondateur dans la boucle) : le doré
   #C9A84C sur ivoire est à ~2,8:1, sous le seuil AA (4,5:1). Deux options :
   un ton dédié au texte sur fond clair dans `tokens.ts` (le doré actuel
   restant pour bordures et fonds sombres), ou l'assumer documenté. La
   première préserve la charte à l'œil — le doré sur navy, signature du site,
   n'est pas touché.
4. Navigation clavier complète du menu mobile et des formulaires de l'espace
   payant (déjà largement correcte : `aria-label` discriminants en place).

_Vérification : axe-core ajouté à `verify:animations` (0 violation sérieuse),
parcours questionnaire au clavier seul dans `verify:questionnaire`._

### Lot D — Observabilité — ~1-2 jours, priorité 4, avant toute URL publique

1. `global-error.tsx` + capture des erreurs serveur non rattrapées vers un
   journal structuré (JSON une ligne). Pas de service tiers imposé : une
   variable `ADMITTO_ERROR_WEBHOOK` optionnelle, inerte sans — même régime que
   tout le reste.
2. Logs structurés sur les trois routes sensibles (cron, webhook Stripe,
   authentification) : aujourd'hui un échec y est silencieux ou en
   `console.error` libre.
3. La purge et la séquence email journalisent leur résumé à chaque passage —
   les compteurs existent déjà, ils partent au client HTTP et nulle part
   ailleurs.

_Vérification : provoquer une erreur serveur → une ligne JSON complète, aucune
stack au navigateur._

### Lot E — Croissance (horizon 2027, dernier délibérément) — ~1 sprint

À ne lancer que quand une date de mise en ligne publique existe.

1. Pages marketing autonomes `/offres`, `/faq`, `/a-propos` — la copie existe
   dans `content/homepage.ts`, il s'agit de la servir en pages indexables.
2. `sitemap.ts`, `robots.ts`, `metadataBase`, OpenGraph. Les pages
   personnelles restent `noindex` (déjà le cas).
3. Bundle `/admin/rapports/[id]` (18,7 Ko client) : découpe de
   `ReviewChecklist` / `ReportControls`, cible < 8 Ko.
4. Petites dettes : contrainte d'unicité (diagnostic, nom normalisé) sur la
   liste d'écoles — le doublon au double-clic, connu et cosmétique.

_Vérification : Lighthouse SEO ≥ 95 sur les pages publiques, budget de bundle
dans `verify:animations`._

---

## Ordre recommandé et jalons

```
Semaine 1        Lot A (matrices)             F1 règles vérifiées (fondateur)
Semaine 2        Lot B (mesure) puis Lot C    F2 bêta lancée dès B livré
Semaine 3        Lot D                        F2 en cours, F3 modules au fil de l'eau
Ensuite          — pause code —               F2/F3 : le terrain décide de la suite
Horizon 2027     Lot E + F4/F5                Ouverture publique
```

Jalon de sortie de la bêta (critère du CDC §2) : 15–20 rapports livrés, temps
humain par rapport mesuré (lot B), et la conversion rapport → achat lue dans
`/admin/metriques` avant d'écrire la moindre fonctionnalité nouvelle.

## Ce que ce plan ne contient pas, et pourquoi

- **Nouvelles fonctionnalités utilisateur** : le produit couvre le CDC ; en
  ajouter avant la bêta inverserait à nouveau l'ordre apprentissage → code.
- **Paiement en plusieurs fois côté Stripe** : l'affichage existe, le
  prélèvement réel attend les clés (F5) — rien à coder d'ici là.
- **Refonte du contraste doré sur navy** : signature visuelle du site de
  référence, hors de question d'y toucher sans décision explicite.
