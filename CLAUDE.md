# Admitto — Plateforme LL.M. & Barreau américain

Système personnalisé de décision/planification/exécution pour juristes formés en France
visant un LL.M. américain et le New York Bar. Source de vérité produit : `PLAN.md`
(dérivé du cahier des charges v1.0). Ce fichier est volontairement stable — ne le modifier
que pour des changements durables (stabilité = cache prompt efficace).

## Commandes

- `npm run dev` / `npm run build` — dev server / build production
- `npm run check:all` — lint + typecheck + tests + garde-fous (à lancer avant tout commit)
- `npm run test` — tests unitaires Vitest (moteurs A/B notamment)
- `npm run check:vocabulary` — vocabulaire interdit (CDC §5–7)
- `npm run check:tokens` — couleurs hors palette Admitto
- `npm run check:rules` — règles du Moteur A : source + date de vérification obligatoires
- `npm run verify:animations|questionnaire|backoffice|checkout <url>` — checklists design,
  diagnostic, back-office et tunnel de paiement dans un vrai navigateur
  (serveur lancé + Playwright ; `verify:backoffice` exige `ADMITTO_ADMIN_TOKEN`)
- `npm run report:pdf <url-impression> <sortie.pdf>` — rendu PDF d'un rapport
- `npm run graph:update` — met à jour le graphe Graphify (voir ci-dessous)

## Skills de projet (`.claude/skills/`)

Instructions chargées **à la demande**, pas à chaque session — elles n'alourdissent le
contexte que lorsqu'elles servent :

- `verification-avant-livraison` — avant d'annoncer un travail terminé ou de committer
- `debogage-systematique` — dès qu'un bug ou une vérification échoue
- `design-admitto` — toute modification visuelle (contrat d'animation, palette, quirks)
- `moteurs-admitto` — règles du Moteur A, notation du Moteur B
- `contenu-admitto` — copie visible, blocs de rapport et d'email, bases légales

Validés par `npm run check:skills` (un skill mal formé est ignoré silencieusement).

## Exploration du code — Graphify d'abord (économie de tokens)

**Avant tout grep/glob large : lire `graphify-out/GRAPH_REPORT.md`** (god nodes,
communautés, connexions). Puis requêtes ciblées :

```bash
graphify query "…" --budget 1500   # question structurelle
graphify explain "NomDuNoeud"      # tout savoir sur un nœud
graphify path "A" "B"              # chemin entre deux nœuds
```

Réserver grep/glob à : pattern regex exact, fichier très récent non indexé, ou
recherche restreinte au sous-dossier qu'indique le graphe.
Après une session de modifications : `npm run graph:update`.
Détails : `docs/TOKEN_OPTIMIZATION.md`. Cache : `docs/CACHE_OPTIMIZATION.md`.

## Architecture

- `app/` — Next.js App Router. `(marketing)` public, `(app)` payant, `(admin)` back-office.
- `design/tokens.ts` — palette/typos/gradients : SEULE source de couleurs autorisée.
- `design/animations.tsx` — contrat d'animation strict (useInView one-shot,
  easing `ease` uniquement). Ne JAMAIS ajouter de librairie d'animation.
- `design/global-css.ts` — règles globales + les 4 keyframes. Module SERVEUR
  volontairement : une constante exportée d'un module `"use client"` arrive au
  layout comme référence client, et les keyframes ne sont jamais injectées.
- `content/homepage.ts` — toute la copie de la page d'accueil, source unique.
- `lib/questionnaire/` — 12 écrans (types fermés) + logique conditionnelle CDC §12.4.
- `lib/profile/derive.ts` — champs inférés. Les calculs de date prennent une date de
  référence en paramètre : jamais de `Date.now()` implicite (déterminisme des tests).
- `lib/engine-a/` — Moteur A : règles déterministes versionnées → voie préliminaire (6 catégories).
  Une règle non vérifiée reste `active: false` ; le moteur retombe alors sur « revue humaine ».
- `lib/engine-b/` — Moteur B : notation des 5 axes + plafonnement → 6 verdicts. Une réponse
  absente ne vaut jamais une réponse positive (un écran non affiché laisse le champ `undefined`).
- `lib/report/` — assemblage du rapport depuis `content/report-blocks.ts`. `fill.ts` refuse
  toute variable hors de la liste du CDC §17 : c'est ce qui empêche un texte produit librement.
- `lib/email/` — séquence J+0 → J+25. `types.ts` fixe la base légale de chaque email :
  un promotionnel ne part jamais sans consentement, `sendGuarded` est le dernier verrou.
- `lib/payments/` — catalogue, déduction 30 jours, Stripe. Sans clé, le paiement est
  désactivé et le webhook inerte : la bascule Phase 1A → 1B se fait par configuration.
- `app/(admin)/` — back-office, protégé par `middleware.ts` (jeton `ADMITTO_ADMIN_TOKEN`,
  404 par défaut).
- Variables d'environnement : voir `.env.example`. Toutes optionnelles ; leur absence
  place le produit en régime Phase 1A (bêta gratuite, emails non expédiés).
- `lib/store/assessments.ts` — persistance de transition en mémoire (accrochée à
  `globalThis`, car Next.js duplique les modules entre action serveur et page).
  À remplacer par Prisma avant la bêta.
- `scripts/` — garde-fous exécutés par les hooks git (`.githooks/`) et la CI.

## Règles non négociables (résumé — détail dans PLAN.md)

1. **Design = copie exacte du site admitto.nanocorp.app** : styles inline, palette
   `design/tokens.ts`, animations selon le contrat `design/animations.tsx` et PLAN.md §3.
   Checklist de validation : PLAN.md §10.
2. **Aucune IA générative visible** dans l'expérience utilisateur V1.
3. **Jamais de vocabulaire de garantie** (éligible, garanti, attorney-reviewed, Esq.,
   probabilité de réussite) — le script `check:vocabulary` échoue sinon.
4. Les moteurs ne concluent jamais à une éligibilité définitive ; cas ambigus →
   catégorie « revue humaine », jamais d'improvisation.
5. Chaque règle du Moteur A porte source officielle + date de vérification + version.
6. Minimisation des données (RGPD) : le vault refuse les types sensibles.

## Style de code

- TypeScript strict. Types fermés (`as const` + unions) pour les listes du CDC
  (verdicts, voies, statuts) — jamais de string libre.
- Styles inline dans le JSX (convention du site) ; pas de classes utilitaires dans
  le markup marketing ; pas de CSS-in-JS externe.
- Tests unitaires obligatoires pour toute logique des moteurs (règles, plafonnement).
- Commentaires : uniquement pour les contraintes invisibles dans le code (quirks du
  design à conserver, exigences CDC).
