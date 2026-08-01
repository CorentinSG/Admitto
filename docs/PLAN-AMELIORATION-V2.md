# Plan d'amélioration V2 — après la revue du 30 juillet 2026

> Succède au plan en cinq lots de `REVUE-AMELIORATION.md`, dont les lots 1 à 3
> sont livrés et le lot 4 aux deux tiers. Point de départ vérifié : 382 tests,
> 11 suites navigateur (279 points, deux exécutions consécutives identiques),
> 8 garde-fous, régimes dégradés sondés route par route.

> **État : les cinq lots A à E sont livrés.** Vérifié : 465 tests unitaires
> (mémoire et PostgreSQL), 14/14 suites (355 points), 10 garde-fous, les deux
> régimes dégradés sondés sur les 39 routes de l'application, SEO 100/100 sur
> les sept pages publiques.
>
> **La piste code s'arrête ici, délibérément.** Ce qui reste — F1 à F5 — ne
> relève pas du code, et le CDC §2 place la bêta AVANT toute nouvelle
> fonctionnalité. Ajouter du code maintenant inverserait à nouveau l'ordre
> apprentissage → code, qui est la raison d'être de ce plan.

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
| F1  | Vérifier R-NY-001, R-NY-002, R-ALT-001 contre les sources officielles (NY BOLE, Court of Appeals) et les activer — **protocole question par question dans `docs/VERIFICATION-REGLES.md`** | Le Moteur A tourne à vide : 83 % des profils tombent en « revue humaine ». Sûr, mais non différenciant. Attention : R-NY-001 seule ramène ce taux à 0 % — ce n'est pas une règle d'appoint | `lib/engine-a/` — `check:rules` refuse une activation non sourcée ; l'enregistrement se fait au back-office, sans code |
| F2  | Lancer la bêta : 15–20 diagnostics réels, rapports rédigés à la main                                             | C'est l'ordre imposé par le CDC §2 ; tout le reste du produit est une hypothèse tant que ce n'est pas fait   | Le produit est prêt : régime Phase 1A sans aucune clé                 |
| F3  | **Sept sections officielles à écrire et sourcer** : `m2-acces-barreau`, `m4-statuts`, `m5-conditions`, `m5-pieces`, `m6-epreuves`, `m7-procedure`, `m8-transfert`. Tout le reste des onze modules est rédigé | Chacune énonce une procédure d'autorité : le type impose une source officielle datée, que seul le fondateur peut confronter. Une fois ces sept sections écrites, six modules s'ouvrent d'un coup | `content/modules.ts` — `publicationBlockers` nomme, pour chaque module retenu, la section et ce qui lui manque |
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

**Livré.** Trois écarts au plan, tous délibérés :

1. **Aucun identifiant, pas même « anonyme avant compte ».** Le plan tolérait un
   identifiant de passage ; il n'y en a aucun. Un événement est un triplet
   (type, écran, instant), et deux lignes du même visiteur sont indiscernables
   de deux lignes de deux visiteurs. La question à laquelle la bêta doit
   répondre — « où s'arrête-t-on ? » — se lit en compteurs : l'abandon à
   l'écran N est la différence entre les compteurs de N et du suivant. Corréler
   n'apporterait que la capacité de suivre quelqu'un.
2. **Pas d'événement « lien email cliqué ».** Il exigerait un jeton par
   destinataire dans l'URL, c'est-à-dire précisément l'identifiant que le point
   précédent refuse. Renoncer à cette mesure coûte moins que détenir la donnée.
3. **Les parts ne sont calculées que là où elles ont un sens.** Après la
   soumission, les compteurs comptent des ouvertures de page (le lien du
   résultat part par email et se rouvre), et les diagnostics payés viennent des
   rapports, dont beaucoup précèdent la mesure. Seule la conversion
   commencé → soumis est une vraie part ; les autres étapes gardent leur compte
   et affichent un tiret.

Deux défauts trouvés à la vérification, invisibles aux tests unitaires :

- **Le compteur des soumissions ne pouvait pas monter.** L'appel était placé
  après `submitQuestionnaire`, mais l'action réussit par `redirect()`, qui lève :
  tout ce qui suit était du code mort. L'étape centrale de l'entonnoir serait
  restée à zéro, et le dernier écran aurait affiché tous ses visiteurs comme
  perdus. La soumission est désormais comptée dans l'action, après les refus.
- **L'abandon était calculé contre un écran conditionnel.** « Barreau
  étranger » n'est posé qu'à certains profils : l'écran qui le précède
  affichait 18 abandons sur 19 visiteurs alors que personne n'était parti.
  L'abandon se mesure maintenant contre le prochain écran vu de tous
  (`CONDITIONAL_SCREENS`, tenu en parité avec `visibleScreens` par un test).

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

**Livré**, avec une suite dédiée `verify:accessibilite` (28 points) plutôt qu'un
ajout à `verify:animations` : cette dernière ne couvre que l'accueil, et
n'aurait donc rien prouvé sur le contraste, qui se joue sur les fonds clairs de
l'espace payant et du back-office.

Arbitrage du contraste : **ton dédié `goldText` (#826A27)**. La mesure réelle
était plus mauvaise que l'estimation du plan — 2,19:1 et non ~2,8:1, sous le
seuil de 3:1 des grands textes eux-mêmes. Le ton garde la teinte (44°) et la
saturation (54 %) du doré, assombri jusqu'à tenir sur les DEUX fonds clairs :
l'ivoire (4,97:1) et les panneaux dorés translucides (4,56:1). `gold` est
inchangé pour les bordures, les filets, les aplats et tout le texte sur navy —
la signature du site, à 7,93:1. 93 usages basculés, 3 conservés (les seuls
posés sur fond sombre).

Trois défauts trouvés à la vérification, qu'aucune relecture n'avait vus :

- **La navigation était illisible sur les pages légales.** Conçue pour le héros
  sombre, elle y posait une marque ivoire sur ivoire — invisible — et des liens
  blancs sur clair : 16 violations sur une seule page. Elle prend désormais sur
  fond clair l'apparence qu'elle a DÉJÀ une fois défilée, sans second jeu de
  couleurs à maintenir.
- **axe ne mesurait presque rien.** Les sections n'apparaissent qu'une fois
  entrées dans le champ et restent d'ici là à `opacity: 0` : un premier passage
  rendait « accueil : 0 violation » alors que seul le héros avait été examiné.
  La suite fait défiler la page, puis **attend la fin des fondus** — mesurer
  pendant l'animation lisait des couleurs composées (#826A27 relevé en #937E45)
  et accusait le produit de défauts que personne ne voit.
- **Deux repères de navigation anonymes** sur les pages légales, annoncés
  « navigation » deux fois sans moyen de les distinguer. Chacun porte son nom.

Les numéros ornementaux des cartes « Le Défi » (1,28:1) restent tels quels :
c'est un quirk du site de référence, et WCAG 1.4.3 exclut la décoration pure.
Ils portent `aria-hidden`, et la suite les écarte par un sélecteur NOMMÉ plutôt
que par un seuil relevé — un seuil ferait taire les vraies violations avec eux.

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

**Livré.** L'erreur a été provoquée pour de bon — une instance lancée contre une
base injoignable, puis une page qui l'interroge — et non simulée en test.

La décision qui structure le lot : **un journal est un puits de données qu'aucun
garde-fou ne surveille**. `check:legal` relie chaque modèle Prisma à la
politique de confidentialité ; un journal n'est pas un modèle. Une adresse
écrite dans un log n'échoue à aucun contrôle, ne figure dans aucun registre, et
survit à l'effacement du compte qu'elle désigne — `personal-data.ts` efface la
base, pas les fichiers de sortie du serveur. Le journal est donc construit pour
qu'aucune donnée personnelle n'y entre : noms d'événements en union fermée,
toute chaîne traversant `redact()` (remplacement, jamais troncature — une
adresse tronquée désigne encore quelqu'un), et **ce qui quitte la machine est
plus pauvre que ce qui reste dessus** : le webhook ne reçoit jamais de message
d'erreur, parce qu'un message cite la valeur qui l'a causé.

Deux conséquences non prévues au plan :

- **La route journalisée est le PATRON (`/rapport/[id]`), jamais le chemin
  appelé.** Le chemin résolu contient l'identifiant, et cet identifiant est une
  capacité : il ouvre la page de résultat à qui le détient. Un journal
  d'erreurs serait devenu une liste de liens d'accès — et les journaux se
  copient et se transfèrent. Le repli n'est pas le chemin réel : mieux vaut
  ignorer où l'erreur s'est produite que déposer une clé dans un fichier.
- **Les journaux techniques sont désormais décrits dans la politique de
  confidentialité** (nouvelle section). Ce que la politique affirme — aucune
  donnée personnelle, remplacement avant écriture, alerte externe plus pauvre
  encore — n'est vrai que grâce aux choix ci-dessus.

Deux défauts trouvés à la vérification :

- **`global-error` ne suffisait pas.** Il ne prend le relais que si la mise en
  page RACINE échoue ; une erreur de rendu de page remontait à la page 500 par
  défaut de Next.js, un corps vide. L'utilisateur voyait une page blanche et le
  `digest` journalisé ne lui parvenait jamais : la référence censée relier son
  signalement à la ligne du journal n'existait que pour un incident dont
  personne ne pouvait parler. `app/error.tsx` couvre désormais les pages, et
  partage son rendu avec `global-error` via `ErrorScreen` — deux écrans séparés
  divergeraient, et le moins vu serait le moins soigné.
- **La redaction mangeait le champ le plus utile.** Sa première règle prenait
  toute chaîne de plus de seize caractères et remplaçait
  `PrismaClientInitializationError` par « [identifiant] » : le journal devenait
  illisible au moment précis où on l'ouvre. La règle exige maintenant lettres
  ET chiffres — les jetons du produit (cuid, uuid, hexadécimal) les mêlent
  tous, un nom de classe jamais.

Vérifié de bout en bout : ligne JSON complète (patron de route, classe
d'erreur, digest), webhook recevant le sous-ensemble pauvre, écran d'erreur
affichant la référence `844318385` correspondant à la ligne, aucune trace
d'exécution au navigateur, et un passage cron journalisant ses quatre résumés
(`notifications.done`, `email.sequence.done`, `purge.done`, `cron.done`).

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

**Livré**, malgré la condition d'entrée du lot — aucune date de mise en ligne
n'existe et F4 reste ouvert. D'où le choix qui gouverne tout le lot :
**l'indexation est fermée par défaut**. `lib/seo/site.ts` ne pose qu'une
question, et à partir d'une variable qui existait déjà (`ADMITTO_BASE_URL`,
nécessaire aux liens des emails) : ce serveur est-il l'exemplaire public ?
Absente ou locale, `robots.txt` interdit tout et le sitemap est vide. Un second
interrupteur « ce site est public » aurait fini par contredire le premier, et
c'est celui qu'on oublie qui décide. Ce sens de défaut protège de deux choses :
une prévisualisation qui concurrence le site réel, et un référencement obtenu
avec des mentions légales encore incomplètes — une infraction qui a l'air d'un
site normal.

1. **`/offres`, `/faq`, `/a-propos`** servent EXACTEMENT les sections de
   l'accueil : aucune copie dupliquée, c'est le même composant. Seule la balise
   de son titre change — `h1` sur la page autonome, `h2` sur l'accueil où la
   section est un chapitre. Une page sans `h1` n'a de titre ni pour un moteur
   ni pour un lecteur d'écran.
2. **`robots.ts`, `sitemap.ts`, `metadataBase`, OpenGraph.** La liste des pages
   indexables est FERMÉE (`content/pages.ts`) : un sitemap construit par
   balayage du système de fichiers publierait la première route personnelle
   ajoutée.
3. **Bundle `/admin/rapports/[id]` : 18,9 Ko → 2,88 Ko**, très en deçà de la
   cible de 8 Ko. Une seule ligne l'expliquait : un composant client important
   `REPORT_STATUSES` depuis le module du store y amenait le client Prisma —
   18,9 Ko pour dessiner trois boutons. `import type` n'aurait rien coûté ; une
   VALEUR charge le module. La constante vit désormais dans un module sans
   dépendance.
4. **Unicité (diagnostic, nom normalisé) sur la liste d'écoles.** Le contrôle
   existait dans `decideAdd`, mais il LIT avant d'écrire : deux soumissions
   simultanées le franchissaient toutes deux. La contrainte est passée au
   stockage, et la mémoire applique la même — deux implémentations qui divergent
   sur un refus se découvrent en production.

Trois défauts trouvés à la vérification :

- **`robots.txt` et `sitemap.xml` étaient figés au build.** Next.js les prérend :
  `ADMITTO_BASE_URL` posée seulement au démarrage n'avait aucun effet. Le piège
  est muet — le fichier existe, il est valide, il est vide — et le site
  n'aurait jamais été indexé. Les deux routes sont désormais évaluées à chaque
  requête.
- **Les canoniques relatives.** Sans domaine connu à la compilation, Next
  émettait `href="/offres"` : Lighthouse la refuse (92/100), et la balise a l'air
  correcte tout en n'affirmant rien. Elle est maintenant absolue ou absente.
  Les sept pages sont à **100/100** dans les deux régimes — build ignorant son
  domaine, et build servi sur son domaine réel (vérifié via un alias d'hôte).
- **Les ancres de section ne marchaient que sur l'accueil.** `#solution` depuis
  une page légale ne faisait rien ; défaut préexistant que trois pages de plus
  auraient étendu. Le préfixe n'est ajouté que hors de l'accueil, où
  `/#solution` provoquerait un rechargement complet.

Deux corrections d'outillage, découvertes en écrivant les budgets :

- **La mesure de bundle mélangeait deux unités** — `content-length` (compressé)
  pour les unes, longueur du corps (décompressé) pour les autres, dans la même
  somme. Le même chargement donnait 21 Ko ou 174 Ko. Elle lit désormais les
  octets réellement passés sur le fil.
- **`verify-all` rejouait les échecs d'assertion de `verify-animations`**, dont
  la ligne de bilan porte un mot de plus que le motif attendu. Son propre
  en-tête l'interdit : une reprise sur assertion transforme la suite en machine
  à fabriquer du vert.

Le budget navigateur prescrit par le plan reste large par nature — le socle
commun domine, une régression de quinze kilo-octets s'y perdrait, c'est-à-dire
l'ordre de grandeur du défaut corrigé ici. `check:bundle` le complète : mesure
déterministe, par route, hors socle, sans navigateur.

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
