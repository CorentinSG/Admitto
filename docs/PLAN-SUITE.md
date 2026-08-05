# Plan — la suite des améliorations

> Établi le 3 août 2026, après la livraison des six points du plan UX
> (`docs/PLAN-UX.md`, tous livrés sauf le n° 4, différé volontairement) et la
> seconde vérification de R-NY-002. Chaque constat ci-dessous est mesuré sur le
> code au moment de l'écriture.

Le constat d'ensemble : le produit n'a plus de défaut connu qui se corrige par
du code seul. Ce qui reste se répartit en trois horizons — ce qui débloque la
bêta, ce qui enrichit l'expérience sans elle, et ce qui a besoin de ses données.

---

## Horizon 1 — débloquer la bêta

C'est la file critique : tout le reste du produit attend des utilisateurs réels
plus qu'il n'attend du code.

### 1.1 Publier les six modules restants — **je rédige, vous validez**

État mesuré : 5 modules publiés sur 11. Les six autres sont **entièrement
écrits** sauf leurs sections `OFFICIAL_RULE`, et c'est le compilateur qui les
retient — une section qui énonce une procédure officielle sans source ne peut
pas paraître :

| Module | Section(s) bloquante(s) |
| --- | --- |
| 2 — Choisir son LL.M. | `m2-acces-barreau` |
| 4 — Immigration | `m4-statuts` |
| 5 — BOLE | `m5-conditions`, `m5-pieces` |
| 6 — Bar exam | `m6-epreuves` |
| 7 — Admission | `m7-procedure` |
| 8 — Autres barreaux | `m8-transfert` |

Méthode éprouvée sur R-NY-001 et R-NY-002 : je rédige chaque section avec sa
source officielle (BOLE, USCIS, NCBE, Appellate Division) et sa date, vous
relisez, je publie. Sept sections en tout. La recherche BOLE du 2 août couvre
déjà une bonne part des modules 5 et 7.

_Coût : moyen. Une session de rédaction + votre relecture._

### 1.2 Les 17 mentions légales `PENDING` — **vous seul**

Raison sociale, hébergeur, médiateur de la consommation, adresse… Le produit
les affiche comme manquantes plutôt que d'inventer. Aucun code à écrire : il
faut les valeurs.

### 1.3 Les clés de production — **vous seul**

`DATABASE_URL`, `AUTH_SECRET`, `RESEND_API_KEY` + `ADMITTO_EMAIL_FROM`,
`ADMITTO_BASE_URL` public, `ADMITTO_CRON_SECRET`, et Stripe quand la Phase 1B
viendra. La bascule est déjà entièrement par configuration : rien à coder,
tout à configurer.

### 1.4 R-ALT-001 — **votre arbitrage, cinq minutes**

Dernière règle inactive. Elle n'énonce aucun droit américain : elle dit qu'un
projet « retour en France » (objectif métier ET géographique) oriente vers
d'autres options qu'un barreau américain. Sans effet tant que R-NY-001 prime.
À activer, reformuler ou laisser dormir — décision métier, pas vérification.

---

## Horizon 2 — enrichir l'expérience, livrable sans la bêta

Par ordre de valeur décroissante, selon le même critère que les phases
précédentes : le produit doit cesser d'ignorer ce qu'il sait déjà.

### 2.1 Questionnaire avocats étrangers : deux écrans conditionnels

La recherche BOLE du 2 août l'a montré : ce qui compte pour un avocat déjà
admis n'est pas « France ou ailleurs », mais **la juridiction précise** et **la
base de l'admission** (diplôme de droit, ou combinaison études + formation en
cabinet — training contract, articles, clerkship). Le questionnaire ne recueille
ni l'une ni l'autre.

Deux écrans, visibles uniquement quand `foreignBar ≠ NONE` (la logique
conditionnelle existe) :

- « Dans quelle juridiction êtes-vous admis ? » — champ court, même traitement
  que le champ libre existant (borné, refusé au-delà).
- « Sur quelle base ? » — trois réponses fermées : diplôme de droit /
  études + formation pratique / autre.

Le moteur n'en tire AUCUNE conclusion (le BOLE ne publie pas de critère) ;
les réponses alimentent le rapport et la revue humaine, qui gagnent les deux
informations que le BOLE demandera de toute façon.

_Coût : moyen. Types fermés, visibilité, tests, suites._

### 2.2 Feuille de route : les deux trous mesurés — **proposition à valider**

Mesuré sur `content/roadmap-tasks.ts` :

- Le parcours **« vise le barreau »** n'a que 4 tâches (BOLE, bar ×2,
  admission). Rien sur l'inscription à l'examen (dates NCBE/BOLE), le MPRE,
  ou la logistique de l'examen.
- Les tâches **financement** s'arrêtent à l'admission. Rien entre l'admission
  et la rentrée : confirmation du prêt, échéancier de l'école, justificatifs
  financiers du visa (le I-20 les exige).

Choisir quelles tâches existent est une décision métier — c'est votre
calendrier vécu qui fait la valeur du produit. Je peux rédiger une proposition
de 4 à 6 tâches avec échéances relatives, que vous corrigez, puis je les
intègre avec leurs tests.

_Coût : faible une fois la liste arrêtée._

> **Livré, et sans arbitrage nécessaire.** La lecture des textes du 2026-08-03 a
> montré que l'existence de ces tâches n'était pas affaire de goût mais de
> règlement. Six ajoutées : déposer la demande d'évaluation (les dates de dépôt
> sont fermes), passer l'examen de responsabilité professionnelle, suivre le
> cours et l'examen de droit new-yorkais, engager les cinquante heures de
> bénévolat — faisables depuis la France, et découvertes trop tard —, choisir sa
> voie pour la condition de compétences, et boucler le financement après
> l'admission. Une correction au passage : « réunir les pièces du dossier
> d'évaluation » était datée du mois même de l'échéance qu'elle sert à préparer.
> Le parcours « vise le barreau » passe de 4 à 9 tâches, celui de l'étudiant en
> LL.M. de 5 à 11. Trois tests verrouillent les enchaînements que le calendrier
> ne doit pas inverser. **Ce qui reste de votre ressort : relire ces échéances
> au regard de votre calendrier vécu.**

### 2.3 Corriger une réponse après soumission (PLAN-UX n° 4)

Toujours différé, et toujours pour la même raison : la bêta dira quels champs
les gens corrigent réellement. Le motif technique est déjà choisi
(nouvelle version du diagnostic, append-only, comme les matrices).

---

## Horizon 3 — ce que la bêta décidera

Les instruments sont déjà posés ; il faudra les lire, pas les construire :

| Donnée déjà mesurée | Décision qu'elle éclairera |
| --- | --- |
| Abandon par écran du questionnaire (compteurs anonymes, CDC §36) | Quels écrans reformuler ou réordonner |
| Taux de couverture des partenariats (`coverageRate`) | Quelles universités ajouter à la base |
| Demandes de correction reçues au back-office | Quels champs rendre corrigeables (2.3) |
| File des rapports et délai annoncé | Où placer le seuil de charge |

---

## Ordre recommandé

```
Fait                 1.1 Sections des modules       11 modules publiés sur 11
                     2.2 Tâches manquantes          6 tâches ajoutées, sourcées

Cette semaine        1.4 R-ALT-001                  votre arbitrage (5 min)
                     Relecture des échéances        votre calendrier vécu

Dès que possible     1.2 Mentions légales           vous
                     1.3 Clés de production         vous

Ensuite              2.1 Écrans avocats étrangers   moi
                     → LANCEMENT BÊTA

Après la bêta        2.3 Correction de réponse      selon les demandes reçues
                     Horizon 3                      lecture des données
```

Le chemin le plus court vers la bêta ne passe plus par du code : il passe par
sept sections de modules à sourcer, dix-sept valeurs légales et cinq clés.
