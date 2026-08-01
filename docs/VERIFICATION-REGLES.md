# Vérifier et activer les règles du Moteur A (jalon F1)

> Ce document ne contient aucune affirmation de droit américain. Il dit ce qu'il
> faut vérifier, où, et ce que chaque réponse implique. Les trois règles restent
> `active: false` tant que vous ne les avez pas confrontées vous-même à la
> source — c'est le comportement voulu par le CDC §1, pas un oubli.

## Ce que l'activation change, mesuré

Balayage de 1 080 profils complets (produit cartésien de : niveau d'études ×
type de parcours × barreau étranger × objectif géographique × objectif de
carrière ; `hasBlockingGaps: false`). Ces nombres décrivent la **structure des
conditions**, pas le trafic réel — ils disent quelle part de l'espace des
profils chaque règle capture.

| Règles actives      | Revue humaine | Autres voies                                    |
| ------------------- | ------------- | ----------------------------------------------- |
| aucune (aujourd'hui) | 900 (83 %)    | études insuffisantes : 180                       |
| R-ALT-001 seule     | 800 (74 %)    | + alternative : 100                              |
| **R-NY-001 seule**  | **0 (0 %)**   | + voie LL.M. : 900                               |
| R-NY-002 seule      | 450 (42 %)    | + voie directe : 450                             |
| les trois           | 0 (0 %)       | voie LL.M. : 450, voie directe : 450             |

Trois enseignements, à lire avant de décider :

1. **R-NY-001 supprime la revue humaine.** Elle se déclenche pour tout profil
   dont les études dépassent la licence, quel que soit le reste. Ce n'est pas
   une règle d'appoint : c'est elle qui décide de la sortie du moteur pour
   l'écrasante majorité des profils.
2. **R-NY-002 l'emporte sur R-NY-001** quand les deux se déclenchent
   (`DIRECT_PATH_TO_EXAMINE` est prioritaire dans `PATH_PRIORITY`). Un profil
   admis à un barreau étranger reçoit la voie directe, jamais la voie LL.M.
3. **R-ALT-001 devient inopérante dès que R-NY-001 est active.**
   `ALTERNATIVE_TO_EXAMINE` est la voie la moins prioritaire, et R-NY-001 se
   déclenche pour les mêmes profils : son texte ne serait jamais affiché.
   L'activer seule a du sens ; l'activer après R-NY-001 n'en a aucun.

## R-NY-001 — voie du LL.M.

**Se déclenche pour** : études ∈ {M1, M2, CRFPA, CAPA, DOCTORAT} **et**
type de parcours renseigné.

> Note : la seconde condition n'exclut personne en pratique. Le type de parcours
> est dérivé du statut déclaré, et les cinq statuts possibles donnent tous une
> valeur. La règle se déclenche donc sur le seul niveau d'études.

**Texte reçu par l'utilisateur** : « Votre formation correspond au profil des
juristes qui empruntent la voie du LL.M. américain avant de demander l'accès à
l'examen du barreau de New York. Cette voie suppose une évaluation individuelle
par le New York Board of Law Examiners, seule autorité compétente pour se
prononcer. »

**À vérifier, dans cet ordre :**

1. Une voie existe-t-elle par laquelle un juriste formé à l'étranger peut être
   admis à se présenter à l'examen de New York après un LL.M. ? (Si non, la
   règle ne s'active pas et son texte est à réécrire.)
2. Le NY BOLE est-il bien l'autorité qui se prononce, et l'appréciation est-elle
   individuelle ?
3. **Le point le plus important : M1 a-t-il sa place dans la liste ?** Si la
   condition officielle comporte une exigence de durée d'études, un M1 et un M2
   ne sont pas équivalents. La règle les traite aujourd'hui de la même façon.
   Si M1 ne satisfait pas la condition, **retirez-le de la liste avant
   d'activer** — la condition vit dans `lib/engine-a/rules.seed.ts` et se
   modifie en code, pas au back-office (une logique de règle se teste).
4. Même question pour CRFPA, qui désigne une école d'avocats **en cours** :
   est-ce un état de formation achevée au sens de la condition officielle ?

## R-NY-002 — voie directe

**Se déclenche pour** : barreau étranger ∈ {FRANCE, OTHER_COUNTRY}. L'écran
n'est posé qu'aux profils « avocat qui explore », « vise le barreau », ou dont
les études valent CRFPA, CAPA ou DOCTORAT — la règle ne peut donc pas se
déclencher ailleurs.

**Texte reçu** : « Une admission à un barreau étranger peut, selon les cas,
ouvrir un examen de voie directe. Cette appréciation relève exclusivement du New
York Board of Law Examiners et suppose l'examen de votre dossier complet. »

**À vérifier :**

1. Une admission à un barreau étranger peut-elle ouvrir une voie distincte de
   celle du LL.M. ?
2. **La règle traite FRANCE et OTHER_COUNTRY à l'identique.** Un avocat français
   et un avocat admis dans un pays de common law relèvent-ils du même traitement
   au regard de la condition officielle ? Si non, il faut deux règles, pas une.
3. La priorité est-elle la bonne ? Aujourd'hui la voie directe l'emporte sur la
   voie LL.M. quand les deux se déclenchent. Si l'admission à un barreau
   étranger ne dispense de rien, cette priorité induit l'utilisateur en erreur.

## R-ALT-001 — alternatives

**Se déclenche pour** : objectif géographique = retour en France **et** objectif
de carrière = retour en France.

**Texte reçu** : « Votre objectif géographique et professionnel oriente vers
d'autres options que l'admission à un barreau américain. Ces alternatives sont
examinées dans votre rapport. »

**Cette règle n'énonce aucun droit américain** : sa source est `interne:profil`,
elle constate ce que l'utilisateur a déclaré. Ce qu'elle affirme est en revanche
un **jugement stratégique** — qu'un projet de retour oriente ailleurs qu'un
barreau américain. Beaucoup de juristes passent le barreau de New York puis
rentrent. À vous de décider si cette orientation est celle que vous voulez
énoncer ; c'est de la compétence métier, pas de la vérification de source.

**Conséquence à connaître** : l'activer sort ces profils de la revue humaine.
Et, comme indiqué plus haut, elle est masquée par R-NY-001 dès que celle-ci est
active.

## Comment enregistrer la vérification

Aucun développement n'est nécessaire. Depuis `/admin/matrices`, chaque règle
porte trois champs modifiables : source, date de vérification, activation. Le
même garde-fou qu'au commit s'applique à l'enregistrement — une règle active
sans source ni date est refusée (`decideRuleRevision`, et `npm run check:rules`).

1. Ouvrez `/admin/matrices` (compte administrateur requis).
2. Pour chaque règle vérifiée : collez l'URL de la source consultée, la date du
   jour au format `AAAA-MM-JJ`, cochez l'activation, enregistrez.
3. Les révisions sont **append-only** : un rapport déjà produit continue de
   citer la version de règle qui l'a produit (`rulesSnapshot`).

Si une **condition** doit changer — retirer M1, scinder FRANCE et
OTHER_COUNTRY — cela passe par le code (`lib/engine-a/rules.seed.ts`) et non par
le back-office : une logique de règle se teste, et `lib/engine-a/run.test.ts`
plus le balayage de `lib/assessment/exhaustive.test.ts` couvrent l'effet du
changement sur l'ensemble des profils.

## Où chercher la source

Les textes applicables n'étaient pas accessibles depuis l'environnement de
développement (accès réseau sortant fermé). Les points d'entrée à consulter :

- **New York State Board of Law Examiners** — `nybarexam.org`, rubrique relative
  à la formation juridique étrangère.
- **Rules of the Court of Appeals for the Admission of Attorneys and Counselors
  at Law** — titre 22 du NYCRR, partie 520, publiées par les juridictions de
  l'État de New York.

Vérifiez le texte **en vigueur à la date où vous l'activez**, et non un résumé :
c'est cette date que vous inscrirez dans le champ de vérification, et c'est elle
qui rend la règle réactivable en confiance dans un an.
