# Timeline : analyse exhaustive des situations

> Établie le 1er août 2026. Chaque chiffre vient d'un balayage du code, pas
> d'une estimation. Objectif : que l'axe du temps serve les objectifs déclarés
> de la personne, dans **toutes** les situations que le questionnaire permet —
> pas seulement dans le cas moyen.

## Méthode, et un premier résultat qui cadre tout le reste

La feuille de route ne dépend que de **deux** des douze réponses :

| Réponse                                                                           | Effet                                             |
| --------------------------------------------------------------------------------- | ------------------------------------------------- |
| `status` → parcours                                                               | **filtre** les tâches (de 4 à 12 sur 20)          |
| `intake` (rentrée visée)                                                          | **date** les tâches                               |
| `education`, `university`, `english`, `budget`, `funding`, `foreignBar`, `usStatus`, `careerGoal`, `geoGoal` | **aucun**                                         |

Vérifié en modifiant chaque champ isolément, toutes choses égales par ailleurs.
Il existe donc **5 × 6 = 30 formes de timeline** possibles, pour des dizaines de
milliers de situations distinctes. Tout ce qui suit se lit dans cette grille.

## La carte des trente

Balayage de `status × intake`, arrivée simulée au 1er novembre 2026 (saison de
dépôt des candidatures, cas le plus défavorable) :

| Parcours                 | Y1        | Y2  | Y3  | LATER | UNDECIDED   | ALREADY_STARTED |
| ------------------------ | --------- | --- | --- | ----- | ----------- | --------------- |
| **Explore un LL.M.**     | 10/11 ⚠️  | ✅  | ✅  | ✅    | **pas d'axe** | **11/11** ⛔    |
| **Candidate**            | 9/12 ⚠️   | ✅  | ✅  | ✅    | **pas d'axe** | **12/12** ⛔    |
| **Admis ou inscrit**     | 4 tâches  | 4   | 4   | 4     | **pas d'axe** | 4 tâches        |
| **Vise le barreau**      | 4 tâches  | 4   | 4   | 4     | **pas d'axe** | 4 tâches        |
| **Avocat qui explore**   | 5/5 ⛔    | ✅  | ✅  | ✅    | **pas d'axe** | **5/5** ⛔      |

_Lecture : « 10/11 » = dix tâches à rattraper sur onze dès le premier jour._

**Neuf formes sur trente sont saines.** Les vingt-et-une autres présentent au
moins une des quatre pathologies ci-dessous.

---

## Pathologie 1 — « J'ai déjà commencé » : 100 % à rattraper

**Constat.** `intake: ALREADY_STARTED` donne un décalage de **zéro année** : la
rentrée est fixée au 15 août de l'année **courante**. Passée cette date, toutes
les tâches sont datées dans le passé. Trois parcours sur cinq basculent alors à
100 % de tâches à rattraper.

**Effet.** Quelqu'un qui déclare avoir déjà commencé — donc quelqu'un d'engagé,
souvent le plus proche de payer — reçoit une feuille de route dont **chaque
ligne** est en souffrance. C'est le pire accueil du produit, réservé au profil
le plus avancé.

**Piste.** Pour un parcours déjà entamé, l'ancrage sur une rentrée n'a plus de
sens : les échéances qui comptent sont celles de l'examen et de l'admission, pas
celles des candidatures. Soit ancrer sur la prochaine échéance officielle
pertinente, soit assumer une liste ordonnée **sans dates** plutôt qu'un axe
faux.

---

## Pathologie 2 — « Je ne sais pas encore » : aucun axe du tout

**Constat.** `intake: UNDECIDED` → aucune tâche n'est datée → `buildTimeline`
rend `null`. **Cinq formes sur trente**, soit un sixième des utilisateurs, n'ont
pas de timeline.

Le code l'assume explicitement : « sans rentrée décidée il n'y a pas d'axe de
temps, et en dessiner un serait une invention ». **Le raisonnement est juste** —
inventer des dates serait pire.

**Mais** « je ne sais pas encore quand » est la réponse naturelle de qui
explore, c'est-à-dire du public d'entrée du produit. Or les tâches existent,
elles ont un **ordre** et des dépendances ; seules les dates manquent.

**Piste.** Servir la séquence sans l'axe : une liste ordonnée par phase, avec
les durées estimées et les enchaînements, plus une invitation à décider la
rentrée — ce qui est précisément la première décision utile. Aucune date
inventée, donc aucune entorse au principe.

---

## Pathologie 3 — Arrivée en cours de cycle : jusqu'à 10 tâches sur 11 à rattraper

**Constat.** Déjà documenté dans `PLAN-UX.md` §2, et **partiellement traité** :
l'état `BEHIND` distingue désormais « à rattraper » de « en retard ». Le
vocabulaire n'accuse plus.

**Ce qui reste.** Une feuille de route dont 83 % des lignes sont « à rattraper »
reste illisible : tout est urgent, donc plus rien ne l'est. La priorisation
disparaît au moment où elle serait la plus utile.

**Piste.** C'est l'option 2 du plan UX : quand le temps restant est notoirement
insuffisant, **proposer la rentrée suivante** plutôt que d'empiler du retard.
Le produit connaît le nombre de mois restants et le nombre de tâches qu'il
faudrait mener ; il peut le dire.

---

## Pathologie 4 — Les profils les plus avancés reçoivent quatre tâches

**Constat.** `ADMITTED_OR_ENROLLED` et `TARGETING_BAR` obtiennent **quatre**
tâches, et **trois leur sont communes**. Ces deux parcours — les plus engagés,
les plus proches d'une offre payante — sont quasi indiscernables et presque
vides.

### Matrice de couverture

| Tâche       | Explore | Candidate | Admis | Barreau | Avocat |
| ----------- | ------- | --------- | ----- | ------- | ------ |
| T-CLAR-01 objectif professionnel | ✕ | | | | ✕ |
| T-CLAR-02 fourchette de budget | ✕ | ✕ | | | ✕ |
| T-CAREER-01 trois profils modèles | ✕ | ✕ | | | ✕ |
| T-SEL-01 accords de l'université | ✕ | ✕ | | | |
| T-SEL-02 test d'anglais | ✕ | ✕ | | | |
| T-SEL-03 liste d'écoles | ✕ | ✕ | | | |
| T-APP-01 CV et personal statement | ✕ | ✕ | | | |
| T-APP-02 recommandations | ✕ | ✕ | | | |
| T-APP-03 relevés et traductions | ✕ | ✕ | | | |
| T-APP-04 dossiers complets | | ✕ | | | |
| T-FUND-01 bourses | ✕ | ✕ | | | |
| T-FUND-02 coût net cible | ✕ | ✕ | | | |
| **T-VISA-01 statut étudiant** | | ✕ | | | |
| T-BOLE-01 dossier d'évaluation | | | ✕ | ✕ | |
| T-NET-01 networking et stage | | | ✕ | | |
| T-BAR-01 planning de révision | | | ✕ | ✕ | |
| T-BAR-02 inscription à l'examen | | | ✕ | ✕ | |
| T-ADM-01 dossier d'admission | | | | ✕ | |
| T-FQL-01 examiner l'admission actuelle | | | | | ✕ |
| T-FQL-02 impact sur l'activité | | | | | ✕ |

### Quatre trous qui se voient dans cette matrice

1. **Le visa n'existe que pour « candidate ».** Or c'est **à l'admission** que
   le dossier de statut se prépare : celui qui vient d'être admis ne le voit
   nulle part. C'est le trou le plus coûteux — un statut manqué annule l'année.
2. **Le financement s'arrête à l'admission.** Ni bourses ni coût net pour un
   admis, qui a pourtant encore tout à payer.
3. **Le networking n'existe que pour les admis.** Ni pour qui candidate — alors
   que le module 9 lui est destiné — ni pour qui vise le barreau, moment où la
   recherche d'emploi devient le sujet principal.
4. **L'avocat qui explore n'a aucune tâche de sélection ni de candidature.**
   S'il décide de partir, la feuille de route ne l'accompagne pas ; il devrait
   refaire un diagnostic pour changer de parcours.

**Ces quatre points relèvent du métier, pas du code.** L'appartenance d'une
tâche à un parcours est une décision de fond : je la signale, je ne la tranche
pas.

---

## Ce que « servir les objectifs » demanderait en plus

Les objectifs déclarés — `careerGoal`, `geoGoal` — n'ont **aucun** effet
aujourd'hui. Deux personnes visant l'une un grand cabinet à New York, l'autre un
retour en France dans un cabinet parisien, reçoivent la même feuille de route au
jour près.

Trois niveaux d'adaptation, du moins au plus ambitieux :

1. **Écarter ce qui ne s'applique pas** (mécanique, aucune décision) : pas de
   dossier de visa pour un binational américain — le questionnaire le sait déjà
   (`needsVisaBranch`), le modèle sait l'exprimer (`NOT_APPLICABLE`).
2. **Honorer les réponses explicites** (un arbitrage, cf. `PLAN-UX.md`) : ne pas
   proposer « programmer le test d'anglais » à qui a répondu « test déjà passé ».
3. **Pondérer selon l'objectif** (le vrai sujet) : `geoGoal: RETURN_FRANCE`
   devrait faire remonter les tâches de valorisation du parcours en France et
   descendre celles de recherche d'emploi américaine ; `careerGoal: ARBITRATION`
   devrait orienter le choix des cours et des personnes à rencontrer. Cela
   suppose d'ajouter aux tâches une **pertinence par objectif**, ce qui est un
   travail de contenu autant que de code.

## Ordre recommandé

```
1. Pathologie 1 — « déjà commencé » à 100 % à rattraper     structurel, pire accueil
2. Trou du visa à l'admission                               risque réel pour la personne
3. Pathologie 2 — « je ne sais pas » sans aucun axe         un sixième des utilisateurs
4. Écarter ce qui ne s'applique pas (visa binational, etc.) mécanique
5. Pathologie 3 — proposer la rentrée suivante              déjà à moitié traité
6. Honorer les réponses explicites (test d'anglais)         demande votre arbitrage
7. Pondérer par objectif                                    contenu + code
```

Les points 1, 3 et 4 sont mécaniques : le produit dispose déjà de l'information
et ne s'en sert pas. Les points 2, 6 et 7 demandent une décision de fond — quelle
tâche appartient à quel parcours, et ce qu'un objectif déclaré doit changer.
