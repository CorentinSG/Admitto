# Optimisation des caches

Quatre couches de cache, chacune avec sa stratégie.

## 1. Cache prompt (sessions Claude Code)

Le cache prompt d'Anthropic réutilise le préfixe de conversation tant qu'il est identique.
Concrètement, pour ce repo :

- **`CLAUDE.md` stable** : il est injecté en tête de chaque session. Chaque modification
  invalide le cache de toutes les sessions suivantes → ne le modifier que pour des
  changements durables ; le contenu volatil va dans docs/ ou PLAN.md.
- **Hooks et settings stables** (`.claude/settings.json`, `.claude/hooks/`) : même logique.
- **Travailler en fil continu** : dans une session, éviter de recharger d'énormes fichiers
  déjà lus (ils sont dans le contexte, donc dans le cache) ; préférer les éditions ciblées.
- **Graphify réduit aussi le cache nécessaire** : moins de tokens chargés = préfixe plus
  court = cache plus efficace et moins cher.

## 2. Cache CI (GitHub Actions)

Déjà configuré dans `.github/workflows/ci.yml` :

- **npm** : `actions/setup-node` avec `cache: npm` — cache `~/.npm` keyé sur
  `package-lock.json`. Un lockfile inchangé = install quasi instantanée.
- **Next.js** : `actions/cache` sur `.next/cache` — le compilateur réutilise les artefacts
  du build précédent. Clé primaire lockfile + hash des sources, `restore-keys` en repli
  pour toujours repartir du cache le plus proche.

Règle d'or : ne jamais supprimer `package-lock.json` du repo (il est la clé de tous ces
caches et garantit des installs reproductibles).

## 3. Caches Next.js en production (Vercel)

Stratégie cible pour l'application (à appliquer au fil des sprints) :

| Surface | Stratégie |
|---|---|
| Pages marketing (`/`, `/offres`, `/faq`, `/a-propos`) | **Statiques** (prérendu au build, servies par le CDN). Aucune donnée de session — ne pas y lire de cookies, sinon elles basculent en dynamique. |
| Contenus modules / blocs de texte | ISR (`revalidate`) ou `revalidateTag` déclenché par le back-office quand un bloc/une règle change — jamais de refetch à chaque requête. |
| Questionnaire | Statique côté page ; les réponses partent en Server Actions. |
| Dashboard / résultat / rapport | Dynamiques (session), mais requêtes DB mutualisées par requête via `cache()` de React et `unstable_cache`/`revalidateTag` pour les référentiels (partenariats, règles). |
| Polices | `next/font` (déjà en place) : self-hosted, cache immutable, zéro requête externe au runtime. |
| Images (photo fondateur, mockups) | `next/image` — formats modernes + cache CDN. |

Référentiels quasi statiques (règles versionnées, partenariats, blocs de texte) :
**cache long + invalidation par tag** au moment de la publication back-office, plutôt que
TTL court. Le back-office est la seule source d'écriture → l'invalidation est fiable.

## 4. Cache local développeur

- `.next/cache` et `tsconfig` incrémental (`.tsbuildinfo`) sont ignorés par git mais
  conservés entre les builds locaux — ne pas les supprimer par réflexe.
- Vitest ne relance que les tests affectés en mode watch (`npm run test:watch`).
- Graphify : `--update` (incrémental) plutôt que reconstruction complète ; le hook
  post-commit le fait automatiquement en arrière-plan.
