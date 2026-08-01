# Admitto — démarrage en local

Plateforme LL.M. & Barreau américain. La source de vérité produit est
[`PLAN.md`](PLAN.md) ; les conventions de code sont dans [`CLAUDE.md`](CLAUDE.md).
Ce fichier ne traite que d'une chose : faire tourner le projet sur une machine.

## Prérequis

| Outil   | Version              | Pourquoi                                           |
| ------- | -------------------- | -------------------------------------------------- |
| Node.js | 20 minimum, 22 en CI | Next.js 15                                         |
| npm     | fourni avec Node     | le dépôt est verrouillé par `package-lock.json`    |
| Docker  | facultatif           | uniquement pour la base PostgreSQL (voir plus bas) |

## Installation (trois commandes)

```bash
npm ci                 # installe et génère le client Prisma (postinstall)
npm run setup:local    # écrit .env.local et crée les répertoires de travail
npm run dev            # http://localhost:3000
```

`npm run setup:local` remplit ce qu'une machine peut décider seule — les deux
secrets aléatoires, l'URL locale, le répertoire du coffre et la boîte aux
lettres de développement. Il n'écrase **jamais** une valeur déjà renseignée :
relancé, il n'ajoute que les clés manquantes.

Deux options utiles :

```bash
node scripts/setup-local.mjs --admin=votre.adresse@exemple.fr   # amorce un administrateur
node scripts/setup-local.mjs --with-db                          # pointe vers la base Docker
```

## Ce qui marche sans rien configurer de plus

Toutes les variables d'environnement sont optionnelles. Sans elles, le produit
tourne en **régime Phase 1A** : c'est le régime voulu en développement, pas une
version dégradée par accident.

| Zone                                               | Sans configuration                                                                    |
| -------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Page d'accueil, questionnaire, rapport, simulateur | fonctionnent                                                                          |
| Données (`DATABASE_URL` vide)                      | mémoire du processus — perdues à chaque redémarrage                                   |
| Emails (`RESEND_API_KEY` vide)                     | transport « console » : journalisés, jamais expédiés                                  |
| Connexion (`AUTH_SECRET`)                          | rempli par `setup:local` — le lien de connexion arrive dans `.admitto-local/mail.log` |
| Paiement (`STRIPE_SECRET_KEY` vide)                | désactivé, le diagnostic est offert ; webhook inerte                                  |
| `/admin`                                           | 404 tant qu'aucune adresse n'est amorcée (ne pas révéler son existence)               |
| `/app`                                             | redirige vers `/connexion`                                                            |

### Se connecter en local

Le lien de connexion n'est pas envoyé : il est écrit dans la boîte aux lettres
de développement. Demander le lien sur `/connexion`, puis :

```bash
tail -f .admitto-local/mail.log
```

Coller l'URL de connexion dans le navigateur. Si l'adresse figure dans
`ADMITTO_ADMIN_EMAILS`, le rôle ADMIN est accordé à cette première connexion et
`/admin` s'ouvre.

> Utiliser **la même origine** partout (`localhost` **ou** `127.0.0.1`, pas les
> deux) : un écart entre l'URL du navigateur et celle vue par Auth.js fait
> tomber le cookie de session.

## Avec une vraie base de données

```bash
docker compose up -d db                    # PostgreSQL 16, mêmes identifiants que la CI
node scripts/setup-local.mjs --with-db     # renseigne DATABASE_URL
npm run db:deploy                          # applique les migrations existantes
```

Ensuite `npm run db:studio` pour inspecter, `npm run db:migrate` pour créer une
migration en développement. Sans Docker, n'importe quel PostgreSQL fait
l'affaire : renseigner `DATABASE_URL` à la main dans `.env.local`.

Les stores portent deux implémentations (Prisma et mémoire) validées par le
même contrat de test : les tests jouent contre le backend actif, donc les
lancer une fois avec `DATABASE_URL` défini vérifie la moitié Prisma.

## Vérifications

```bash
npm run check:all      # lint + types + tests + garde-fous — à lancer avant tout commit
npm run test           # tests unitaires seuls (moteurs A/B, stores)
```

`check:all` est ce que rejoue la CI, et les hooks git de `.githooks/` en
appellent une partie. C'est le seuil avant de committer.

### Suites navigateur (facultatif)

Elles pilotent un vrai navigateur et exigent un serveur déjà démarré :

```bash
npx playwright install chromium   # une seule fois
npm run build && npm run start    # dans un autre terminal
npm run verify:all http://localhost:3000
```

Certaines suites ont des exigences propres — `verify:backoffice` demande
`AUTH_SECRET`, `DATABASE_URL`, `ADMITTO_MAIL_LOG` et `ADMITTO_ADMIN_EMAIL`.
`verify:seo` est hors de `verify:all` : il exige un serveur déclaré public, car
en local `robots.txt` interdit l'exploration et l'audit mesurerait cette
fermeture volontaire au lieu des pages.

## Explorer le code

Avant tout `grep` large, lire [`graphify-out/GRAPH_REPORT.md`](graphify-out/GRAPH_REPORT.md)
puis interroger le graphe (`graphify query …`). Détails dans
[`docs/TOKEN_OPTIMIZATION.md`](docs/TOKEN_OPTIMIZATION.md).

## Fichiers locaux, jamais commités

- `.env.local` — écrit en permissions `600`, contient les secrets de la machine
- `.admitto-local/vault/` — pièces déposées dans le coffre
- `.admitto-local/mail.log` — messages du transport « console », **liens de
  connexion compris** : ce fichier vaut un mot de passe

Les trois sont ignorés par git.

## Problèmes courants

| Symptôme                                            | Cause                                                                           |
| --------------------------------------------------- | ------------------------------------------------------------------------------- |
| Session perdue en boucle après le lien de connexion | origine `localhost` / `127.0.0.1` mélangées                                     |
| `/admin` répond 404 alors qu'on est connecté        | adresse absente d'`ADMITTO_ADMIN_EMAILS` au moment de la **première** connexion |
| Les diagnostics disparaissent au redémarrage        | `DATABASE_URL` vide — c'est le comportement attendu du store mémoire            |
| Aucun email reçu                                    | normal : lire `.admitto-local/mail.log`                                         |
| Dépôt de fichier refusé dans le coffre              | `ADMITTO_VAULT_DIR` vide, ou type de document hors des cinq autorisés           |
| `npm run verify:*` échoue immédiatement             | aucun serveur ne tourne à l'URL passée, ou Chromium non installé                |
