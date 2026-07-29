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
- `npm run verify:animations|questionnaire|backoffice|checkout|dashboard|simulator|espace|consultations <url>`
  — checklists design, diagnostic, back-office, paiement, espace payant, simulateur, coffre,
  modules et consultations au navigateur (serveur lancé + Playwright ; `verify:backoffice` exige
  `AUTH_SECRET`, `DATABASE_URL` et `ADMITTO_MAIL_LOG` ; les suites du back-office exigent en
  plus `ADMITTO_ADMIN_EMAIL`. **Passer la même origine que celle vue par Auth.js** :
  un écart 127.0.0.1 / localhost fait tomber le cookie de session)
- `npm run verify:all <url>` — enchaîne les huit suites et résume. Une seule reprise par
  suite, et seulement sur plantage : un échec d'assertion reste rouge.
- `npm run report:pdf <url-impression> <sortie.pdf>` — rendu PDF d'un rapport
- `npm run db:migrate` / `db:deploy` / `db:studio` — migrations Prisma (dev / prod / inspection)
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
- `lib/partnerships/` + `content/partnerships.generated.ts` — 42 accords importés depuis
  `corentinsg/llm-partnerships` (`npm run import:partnerships <chemin>`). Le fichier généré
  est commité. Une fiche non « confirmed » n'est jamais présentée comme acquise, et un
  niveau requis inconnu n'exclut jamais un candidat.
- `content/universities.ts` — liste unique des universités. Le questionnaire stocke
  l'IDENTIFIANT, jamais le libellé : comparer à un libellé casserait la détection.
- `lib/simulator/` — simulateur de coût (CDC §26). Les valeurs de départ sont dans
  `defaults.ts`, séparées du calcul : les réviser ne touche à aucune logique.
- `lib/roadmap/` — feuille de route (CDC §22), Next Best Action (§23), progression et
  Milestone Challenges (§24). Rien n'est coché à la place de l'utilisateur : présumer une
  tâche accomplie gonflerait la progression et offrirait un challenge non mérité.
- `lib/vault/` + `content/vault.ts` — coffre de documents (CDC §29). Cinq types fermés :
  la liste EST le contrôle de minimisation. `policy.ts` décide avant toute écriture, et
  refuse les images — un scan de pièce d'identité en est une. Sans `ADMITTO_VAULT_DIR`,
  aucun fichier n'est reçu et l'écran le dit.
- `lib/modules/` + `content/modules.ts` — modules pédagogiques (CDC §25). Une section
  `OFFICIAL_RULE` porte sa source dans son type : le compilateur interdit d'énoncer une
  procédure sans dire d'où elle vient. `isPublishable` retire de la bibliothèque tout
  module publié dont une source manque — seul le Module 0 est rédigé à ce jour.
  Les modules vivent sous `/app/modules/…`, jamais `/modules/…` : hors zone protégée.
- Aucun composant client ne formate de date. Le serveur formate en UTC, le navigateur
  dans le fuseau de l'utilisateur : à cheval sur minuit les deux rendus divergent et
  React régénère l'arbre. Passer un libellé déjà formaté (cf. `DocumentView`).
- `lib/report/review.ts` — revue avant envoi (CDC §17). Les points sont dérivés du
  profil ; `canSend` vit dans lib/ et non dans l'interface, pour qu'une action serveur
  appelée directement ne saute pas la relecture.
- `lib/notifications/` — rappels d'échéance (CDC §22). Un seul palier par tâche et par
  passage, jamais de retour vers un palier moins urgent, un seul message par destinataire.
  Déclenchés par `POST /api/notifications/deadlines`, inerte sans `ADMITTO_CRON_SECRET`.
- `lib/consultations/` — coaching (CDC §30–31). `included` est un `number` : il n'existe
  pas de valeur « illimité » à écrire, et un plafond oublié vaut zéro séance. Chaque type
  porte ses exclusions dans son type — un périmètre qui n'énonce que ses inclusions se lit
  comme ouvert.
- `lib/security/rate-limit.ts` — plafonds des formulaires publics. Deux clés aux rôles
  distincts : par email STRICT (protège une personne d'un envoi massif), par IP LARGE
  (une IP est partagée — campus, cabinet — et n'identifie personne). Les tentatives
  refusées sont comptées : sinon la fenêtre se vide pendant qu'un script frappe.
- `lib/access/result.ts` — un résultat revendiqué par un compte n'est plus consultable
  sur simple possession de l'URL ; non revendiqué, le lien suffit (le J0 part avant
  qu'aucun compte n'existe).
- `next.config.ts` — en-têtes de sécurité. `style-src 'unsafe-inline'` est le prix
  assumé des styles inline ; tout le reste est verrouillé.
- `scripts/lib/` — helpers des suites : `wait.mjs` (attentes sur condition, JAMAIS de
  délai fixe), `questionnaire.mjs`, `sign-in.mjs`, `identity.mjs` (une adresse unique par
  exécution : réutiliser une adresse heurte le plafond de 3 diagnostics/heure).
- `auth.ts` / `auth.config.ts` — Auth.js, lien de connexion par email (CDC §10).
  Le rattachement des diagnostics vit dans `events.signIn`, pas dans le callback
  `signIn` : ce callback s'exécute AVANT que l'adaptateur ne crée le compte, si bien
  qu'à la première connexion il n'y a aucun compte à rattacher.
  La scission est structurelle : `auth.config.ts` est importé par le middleware Edge et ne
  doit atteindre ni Prisma, ni `node:*`, ni le transport d'email. Le rôle voyage dans le JWT,
  écrit depuis `User.role` : élever un privilège demande une écriture en base.
  `ADMITTO_ADMIN_EMAILS` n'amorce que le premier administrateur.
- `app/(admin)/` et `app/(app)/` — back-office et espace payant, protégés par
  `middleware.ts` : fermés par défaut faute de session. `/admin` répond 404 (ne pas révéler
  son existence), `/app` redirige vers `/connexion`.
- Variables d'environnement : voir `.env.example`. Toutes optionnelles ; leur absence
  place le produit en régime Phase 1A (bêta gratuite, emails non expédiés).
- `lib/db/client.ts` + `prisma/schema.prisma` — persistance. Chaque store de
  `lib/store/` porte DEUX implémentations dans le même fichier : Prisma quand
  `DATABASE_URL` est défini, mémoire du processus sinon. Les garder côte à côte
  est délibéré — séparées, elles divergeraient sans que rien ne le signale.
  Le contrat commun est `lib/store/stores.test.ts`, qui tourne contre le backend
  actif ; la CI le rejoue sur PostgreSQL. Ne jamais importer de module `node:*`
  dans `lib/store/` : ces fichiers sont atteints depuis des composants clients
  via les actions serveur, et le bundle client ne résout pas `node:`.
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
