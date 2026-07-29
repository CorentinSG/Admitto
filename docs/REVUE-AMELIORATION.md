# Revue complète du site — juillet 2026

> État constaté, pas supposé : 295 tests unitaires verts (avec et sans base),
> les huit suites navigateur conformes contre un serveur complet
> (PostgreSQL + comptes + coffre + rappels), build propre.
> Ce document liste ce qui manque, classé par risque réel, avec un plan
> d'amélioration en cinq lots ordonnés.

---

## 1. Ce qui fonctionne (vérifié, pas déclaré)

| Domaine | Preuve |
|---|---|
| Parcours diagnostic → résultat → rapport | `verify:questionnaire`, `verify:backoffice` conformes |
| Espace payant complet (dashboard, roadmap, simulateur, coffre, modules, consultations) | 5 suites conformes |
| Comptes et rôles (lien email, ADMIN/REVIEWER/CLIENT, 404 hors rôle) | `verify:backoffice` + 12 tests rôles |
| Persistance : les données survivent au redémarrage | test kill/restart, résultat 200, progression conservée |
| Design et contrat d'animation | `verify:animations` conforme (keyframes réellement injectées) |
| Garde-fous CDC (vocabulaire, palette, sourçage des règles) | hooks git + CI |
| Paiement/webhook/emails : fermés par défaut, bascule par configuration | `verify:checkout` + tests |

Mesures : page d'accueil statique, TTFB ~3 ms en local, HTML ~73 Ko,
First Load JS 102–124 Ko selon la route, middleware Edge 87 Ko (Auth.js).

---

## 2. Constats, par gravité

### A. Bloquant avant toute ouverture réelle

**A1. Aucune page légale, aucun parcours RGPD.**
Le questionnaire collecte prénom + email + profil depuis la Phase 1A. Il n'existe
ni mentions légales, ni politique de confidentialité, ni CGV, ni aucun moyen pour
une personne d'exercer ses droits (accès, suppression, export). Le pied de page
n'a aucun lien légal. C'est le seul point *juridiquement* bloquant.

**A2. Aucune protection anti-abus sur les deux formulaires publics.**
- `POST diagnostic` : chaque soumission écrit en base, crée un rapport en file
  **et envoie un email J0 à l'adresse fournie** — vecteur de bombardement
  d'email d'autrui et de saturation de la file (le délai annoncé §18 bascule à
  25 rapports actifs : atteignable en une minute de script).
- `requestSignIn` : chaque appel déclenche un email de connexion — même vecteur.
Aucune limitation de débit, aucun honeypot, aucune vérification d'origine.

**A3. Aucun en-tête de sécurité HTTP.**
Pas de `X-Frame-Options`/`frame-ancestors` (clickjacking du back-office), pas de
`X-Content-Type-Options`, pas de `Referrer-Policy`, pas de HSTS. Une CSP stricte
est difficile avec les styles inline (`style-src 'unsafe-inline'` restera), mais
tout le reste est gratuit dans `next.config.ts`.

### B. Important avant la bêta

**B1. Le résultat est servi à quiconque possède l'URL.**
`/resultat/[id]` affiche prénom, université, budget, voie préliminaire sans
session. L'identifiant est un UUID v4 (128 bits, non énumérable) et la page est
`noindex` — le risque réel est le **partage de lien** (historique, messagerie,
proxy). Décision à prendre : soit l'assumer documenté (lien = capacité, comme un
lien Google Docs), soit exiger la session quand le diagnostic est rattaché à un
compte, avec repli sur l'email sinon.

**B2. Suites navigateur sensibles au démarrage à froid.**
Lancées dos à dos juste après le boot du serveur, certaines crashent
(timeout Playwright non rattrapé) puis passent en relance. Causes : `waitForTimeout`
fixes (220–1500 ms) au lieu d'attentes sur condition, aucun retry, premier accès
Prisma/Auth à froid. Tant que c'est flou, « la suite est rouge » ne veut pas dire
« le produit est cassé » — c'est exactement ce qu'une suite doit garantir.

**B3. Emails de la séquence J+2 → J+25 planifiés mais jamais déclenchés.**
`scheduleSequence`/`dueEmails` existent et sont testés, mais aucun déclencheur ne
les exécute (seuls les rappels d'échéance ont leur route cron). Le J0 part à la
soumission ; J2/J5 (contractuels) et J12/J25 (consentement) restent lettre morte.

**B4. Fenêtre de déduction jamais purgée à l'affichage.**
La déduction de 79 € expire à 30 jours (`expiresAt`) ; la logique de calcul la
refuse après expiration, mais aucune page ne montre l'état « expirée » — l'email
J25 qui devait prévenir n'est pas déclenché (cf. B3).

**B5. Sauvegardes et rétention de la base : rien de défini.**
La persistance existe ; la stratégie de sauvegarde, la rétention des diagnostics
sans compte (combien de temps garde-t-on un profil jamais réclamé ?) et la purge
RGPD n'existent pas. Lié à A1.

### C. Optimisations réelles mais non urgentes

**C1. `/admin/rapports/[id]` : 18,7 Ko de JS client** (vs ~3 Ko ailleurs) —
probablement un import qui tire du contenu serveur dans le bundle client.
À tracer avec `@next/bundle-analyzer`. Impact : back-office seulement.

**C2. HTML d'accueil à 73 Ko** — conséquence assumée des styles inline
(convention du site). Compressé en brotli par Vercel, réel impact faible.
Ne pas « corriger » : c'est la convention. À surveiller seulement.

**C3. Accessibilité** — bonne base (boutons natifs, labels, `role="alert"`,
`prefers-reduced-motion`), mais : pas de lien d'évitement (« aller au
contenu »), pas de gestion du focus entre écrans du questionnaire (un lecteur
d'écran ne sait pas que l'écran a changé), contrastes du doré sur ivoire à
vérifier (C9A84C sur FAFAF7 ≈ 2,8:1 — sous le seuil AA pour du texte).

**C4. SEO minimal** — `robots.ts`, `sitemap.ts`, `metadataBase`, OpenGraph
absents. Peu grave tant que la seule page publique est l'accueil ; devient le
prérequis des pages marketing (§35) le jour où /offres, /faq, /a-propos
existent en pages autonomes.

**C5. Observabilité** — aucun log structuré, aucune capture d'erreur serveur
(Sentry ou équivalent), aucun événement produit (§36 : démarrage/complétion du
questionnaire, ouverture du rapport). Le tableau de métriques calcule sur les
données stockées mais les événements de parcours ne sont pas mesurés.

**C6. Purge des jetons Auth.js expirés** — `VerificationToken` s'accumule ;
négligeable en volume, simple `deleteMany` périodique.

### D. Dettes connues, déjà documentées (rappel)

- Règles juridiques du Moteur A inactives → tout profil part en « revue
  humaine ». **Seul le fondateur peut lever ce point** (vérification des
  sources officielles).
- Contenu des modules 1 à 10 à rédiger (garde-fou de sourçage en place).
- Matrices éditables sans code (§33) : débloquées par Prisma, en attente d'une
  décision de périmètre (l'écran doit porter les mêmes contrôles que
  `check:rules`).
- Coffre : stockage local à remplacer par un stockage objet chiffré avant la
  bêta ; en attendant, sans `ADMITTO_VAULT_DIR` le coffre est déclaratif.
- Pages marketing autonomes (/offres, /faq, /a-propos) : sections de l'accueil
  aujourd'hui.

---

## 3. Plan d'amélioration structuré

Cinq lots, ordonnés par le rapport risque/effort. Chaque lot est livrable et
vérifiable indépendamment.

### Lot 1 — Conformité légale (bloquant, ~1 sprint)
1. Pages : mentions légales, politique de confidentialité, CGV — structure et
   copie générées, **les éléments qui engagent (raison sociale, hébergeur,
   médiation) complétés par le fondateur**.
2. Parcours de droits : page « Vos données » (accès, export JSON, suppression),
   suppression en cascade déjà garantie par le schéma (`onDelete: Cascade`).
3. Politique de rétention : purge automatique des diagnostics jamais rattachés
   à un compte après N mois (décision produit), documentée dans la politique.
4. Liens légaux au pied de chaque page + case de consentement reliée à la
   politique.
   *Vérification : nouvelle suite `verify:legal` (liens présents, export
   fonctionne, suppression efface réellement — contrôle en base).*

### Lot 2 — Durcissement — **FAIT**
### Lot 3 — Fiabilité de la vérification — **FAIT**

Voir la section 4 pour ce que ces deux lots ont révélé.

<details><summary>Contenu prévu (conservé pour mémoire)</summary>

### Lot 2 — Durcissement (avant toute URL publique, ~2-3 jours)
1. Limitation de débit sur `POST diagnostic` et `requestSignIn` (fenêtre
   glissante par IP + par adresse email, en base — pas de dépendance externe).
2. En-têtes de sécurité dans `next.config.ts` : `frame-ancestors 'none'`,
   `nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, HSTS.
3. Décision sur `/resultat/[id]` (B1) : session exigée si rattaché à un compte.
4. Purge périodique des `VerificationToken` expirés (greffée sur la route cron).
   *Vérification : tests de débit (11e requête refusée), en-têtes assertés dans
   une suite.*

### Lot 3 — Fiabilité de la vérification (~2 jours)
1. Remplacer les `waitForTimeout` fixes par des attentes sur condition
   (`expect.poll` / `waitForSelector`).
2. Un retry unique par suite en cas de crash (pas par assertion : un vrai échec
   doit rester rouge).
3. Réchauffage : un `GET` sur chaque zone avant la première assertion.
4. Orchestrateur `verify:all` qui lance les huit suites en série et résume.
   *Critère : trois exécutions complètes consécutives vertes départ à froid.*

</details>

### Lot 4 — Cycle de vie email (~2-3 jours)
1. Route cron pour la séquence J+2 → J+25 (même modèle que les rappels :
   fermée sans secret, idempotente par clé composée, un passage = un envoi max).
2. État « déduction expirée » affiché sur la page de paiement.
3. Événements produit minimaux (§36) : démarrage/complétion questionnaire,
   ouverture du résultat — stockés en base, affichés dans /admin/metriques.
   *Vérification : passage cron rejoué = zéro doublon ; métriques alimentées.*

### Lot 5 — Croissance (quand les lots 1-2 sont en production)
1. Pages marketing autonomes /offres, /faq, /a-propos + `sitemap.ts`,
   `robots.ts`, `metadataBase`, OpenGraph.
2. Accessibilité : lien d'évitement, focus géré entre écrans du questionnaire,
   audit de contraste du doré (peut imposer un ton plus sombre pour le texte
   doré sur fond clair — à arbitrer avec la charte).
3. Bundle back-office (C1) : analyse et découpe.
4. Observabilité : capture d'erreurs serveur + logs structurés.

### Hors plan (décisions du fondateur, aucune tâche de code)
- Vérifier et activer R-NY-001 / R-NY-002 / R-ALT-001 (sources officielles).
- Clés de production : DATABASE_URL, AUTH_SECRET, RESEND, STRIPE, VAULT.
- Rédaction des modules 1 à 10.
- Périmètre exact des matrices éditables.


---

## 4. Ce que les lots 2 et 3 ont révélé

Trois défauts que l'analyse statique n'avait pas vus, tous trouvés en exécutant.

**Un bug produit sérieux : aucun nouvel utilisateur ne retrouvait son diagnostic.**
Le rattachement du profil (CDC §10, « aucune ressaisie ») vivait dans le callback
`signIn` d'Auth.js. Ce callback s'exécute **avant** que l'adaptateur ne crée le
compte : à la première connexion, la requête cherchait un compte inexistant,
n'en trouvait pas, et repartait sans rien rattacher. Toute personne se
connectant pour la première fois arrivait donc sur un espace vide, redirigée
vers le diagnostic qu'elle venait de remplir. Le défaut se cachait parce que les
suites réutilisaient les mêmes adresses : à la deuxième exécution le compte
existait et tout passait. Le rattachement vit maintenant dans `events.signIn`,
qui s'exécute après la création — vérifié sur une adresse neuve.

**Un plafond mal calibré, révélé par la suite elle-même.** Cinq diagnostics par
heure et par IP a bloqué la vérification au bout de six suites. La leçon dépasse
le test : une IP ne désigne pas une personne. Un campus de droit, un cabinet, un
espace de coworking sortent par une seule adresse — le plafond aurait bloqué des
candidats légitimes le jour d'une conférence. Les rôles des deux clés sont
maintenant explicites : **par email strict** (3 diagnostics/heure — c'est ce qui
protège une boîte d'un envoi massif), **par IP large** (30/heure — il ne s'agit
que d'arrêter un script, qui produit des centaines de requêtes, pas des dizaines).

**Une attente sur un signal optimiste.** En remplaçant les délais fixes, j'ai
d'abord fait attendre la suite sur l'état d'une case à cocher — sauf que cette
case est optimiste : elle se coche instantanément, avant toute réponse du
serveur. L'attente ne prouvait donc rien. Le seul signal confirmé était
l'ouverture du bouton d'envoi, calculée côté serveur. Un délai fixe supprimé au
profit d'une condition fausse est une régression, pas un progrès.

### Contraintes à connaître pour la vérification

- **Une adresse par exécution** (`scripts/lib/identity.mjs`). Réutiliser une
  adresse heurte le plafond de 3 diagnostics/heure — comportement correct du
  produit.
- **Environ quatre exécutions complètes par heure** depuis une même machine : au
  delà, le plafond de 30 diagnostics/heure par IP mord. C'est voulu.
- **Passer la même origine que celle vue par Auth.js** : un écart
  127.0.0.1 / localhost fait tomber le cookie de session.

### Reste du lot 2 non traité

La CSP conserve `script-src 'unsafe-inline'` : Next.js injecte son script
d'hydratation en ligne, et le durcir suppose des nonces, donc un middleware qui
réécrit chaque réponse HTML. À faire quand le bénéfice le justifiera.
