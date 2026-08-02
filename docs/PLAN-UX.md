# Plan d'amélioration de l'expérience utilisateur

> Établi le 1er août 2026, après avoir parcouru le produit de bout en bout comme
> un candidat : accueil → questionnaire → résultat → email → connexion → espace
> payant, en 1280 px et en 390 px. Chaque constat ci-dessous est **mesuré**, pas
> supposé, et la commande qui l'a produit est indiquée.

## Ce qui fonctionne déjà, et qu'il ne faut pas casser

Le produit n'a pas de défaut d'ergonomie grossier. Il faut le dire, parce que le
plan qui suit ne parle que de ce qui cloche et donnerait sinon une image fausse :

- Le questionnaire est **rapide** : 3,0 s pour dix écrans en pilotage
  automatique, 1,3 s pour atteindre le premier, 1,6 s entre la soumission et le
  résultat. Barre de progression, retour arrière, bouton désactivé pendant
  l'envoi : tout est là.
- Sur mobile (390 px), un écran de question **tient entièrement dans la vue** —
  780 px de page pour 780 px d'écran, dernier bouton à 666 px. Aucun défilement
  pour répondre.
- Les **états vides sont rédigés**, ce qui est rare : consultations sans
  créneau, tableau de bord sans action, université hors base. Aucun écran ne
  laisse l'utilisateur devant un blanc.
- Le **délai de production est annoncé dynamiquement** (`announcedDelay`) et
  varie avec la charge réelle, au lieu d'une promesse figée.

Les six points qui suivent sont donc des défauts de **justesse** et de
**continuité**, pas de mise en page.

---

## 1. La page de résultat affirme un envoi qui n'a pas eu lieu — **à traiter avant la bêta**

**Constat.** `app/(marketing)/resultat/[id]/page.tsx` affiche « Une confirmation
vient d'être envoyée à … » sous la seule condition que l'adresse existe
(`{answers.email && …}`). Or en régime Phase 1A — celui de la bêta, sans
`RESEND_API_KEY` — le transport « console » journalise sans expédier. L'action
de soumission connaît pourtant le résultat (`sent.ok`), mais le jette après un
`console.error`.

**Effet.** Les quinze à vingt premiers candidats réels seront informés qu'un
email leur a été envoyé, et attendront un message qui ne partira jamais. C'est
le seul endroit du produit où l'on affirme un fait sans le savoir — tout le
reste de la base de code refuse précisément cela.

**Ce qu'il faut décider.** Deux réponses honnêtes, au choix :

- **Dire ce qui est vrai** : en Phase 1A, remplacer la phrase par ce qui se
  passe réellement (« conservez ce lien : c'est votre accès au résultat »). Le
  lien de la page EST le résultat, l'email n'était qu'un rappel.
- **Ne rien affirmer** : n'afficher la confirmation que si le transport a
  réellement expédié.

Recommandation : les deux. Le régime se lit déjà côté serveur ; la page doit
s'y conformer, comme `robots.txt` se conforme à `ADMITTO_BASE_URL`.

_Coût : faible. Une condition et un bloc de copie._

> **Livré.** `emailsAreDelivered()` (`lib/email/transport.ts`) répond à la
> question, et deux pages s'y conforment : le résultat annonce désormais
> « aucun email n'est expédié pendant la bêta : conservez ce lien, c'est votre
> accès à ce résultat », et la page de vérification du lien de connexion cesse
> d'inviter à surveiller des indésirables pour un message qui ne partira pas.
> Cette seconde page était atteinte du même défaut, sans que le présent plan
> l'ait vue. Elle passe en `force-dynamic` : figé au build, le texte
> annoncerait le régime de la machine qui a compilé.

---

## 2. La feuille de route naît en retard — **le plus gros défaut d'expérience**

**Constat, mesuré.** `dueDateFor` (`lib/roadmap/generate.ts`) ancre la rentrée au
**15 août de `année de référence + 1`** pour un intake « l'an prochain », puis
date chaque tâche « N mois avant ». Le nombre de tâches déjà dépassées le jour
de l'inscription dépend donc du mois où l'on s'inscrit :

| Inscription  | Tâches en retard dès le premier jour |
| ------------ | ------------------------------------ |
| janvier 2026 | 0 / 20                               |
| mai 2026     | 0 / 20                               |
| août 2026    | 3 / 20                               |
| **nov. 2026** | **12 / 20**                          |

**Effet.** Un candidat qui découvre le produit en novembre — c'est-à-dire en
pleine saison de dépôt des candidatures, le moment où l'on cherche ce genre
d'outil — ouvre son tableau de bord et lit, en premier : « PROCHAINE ACTION ·
ÉCHÉANCE PROCHE · L'échéance est proche ou dépassée · à faire avant le 15 juin ».
Le produit lui reproche un retard qu'il n'a pas causé, avant qu'il ait rien fait.
La feuille de route affiche « en retard » quatre fois sur la même page.

**Ce qu'il faut décider.** Le produit ne doit pas mentir en prétendant qu'il est
tôt. Mais « en retard » et « vous arrivez après la date idéale » ne sont pas la
même phrase, et aujourd'hui il n'existe qu'un seul mot pour les deux. Trois
options, cumulables :

1. **Distinguer les deux états.** Une tâche dépassée *à la génération* n'est pas
   une tâche que l'utilisateur a laissé filer. Vocabulaire distinct (« à
   rattraper » plutôt que « en retard »), et repère visuel distinct sur l'axe.
   C'est la correction la moins intrusive et elle traite le grief principal.
2. **Proposer la rentrée suivante** quand le temps restant ne suffit plus. Le
   produit sait combien de mois séparent l'inscription de la rentrée visée ; il
   peut le dire et proposer le cycle d'après, au lieu de dater des tâches dans
   le passé.
3. **Comprimer le calendrier** à partir de la date d'inscription. À écarter :
   comprimer revient à affirmer qu'un dossier se monte en trois mois, ce que la
   feuille de route existe justement pour démentir.

Recommandation : 1 puis 2. Ne pas faire 3.

> **Option 1 livrée.** Un état `BEHIND` (« à rattraper ») distingue désormais ce
> qui était déjà passé le jour de l'arrivée de ce qui a filé depuis. Aucune date
> n'a été modifiée : le produit ne prétend pas qu'il est tôt, il cesse
> d'accuser. Sur le profil témoin, la feuille de route est passée de 4 mentions
> « en retard » à 0, et la première phrase du tableau de bord de « L'échéance
> est proche ou dépassée » à « Cette date était déjà passée quand vous avez
> commencé ».
>
> **Option 2 livrée** à son tour. `intakeWindow` (`lib/roadmap/window.ts`)
> rapproche deux chiffres que le produit connaissait séparément — les mois qui
> restent, les mois que son calendrier suppose — et l'encart ne paraît que
> lorsque le premier est plus petit que le second. Il chiffre l'écart, dit que
> ce retard n'est pas du fait de la personne, et **nomme** le cycle suivant sans
> le prescrire. Le calendrier est lu sur les tâches du profil et non sur le
> catalogue : un parcours qui n'a que des tâches tardives serait déclaré serré à
> tort. L'option 3 reste écartée.

> **Analyse exhaustive des trente formes possibles de timeline :
> `docs/ANALYSE-TIMELINE.md`.** Neuf sont saines, vingt-et-une présentent au
> moins une pathologie — dont deux que ce plan n'avait pas vues : « j'ai déjà
> commencé » produit 100 % de tâches à rattraper, et « je ne sais pas encore
> quand » ne produit aucun axe du tout.

### Ce que la feuille de route ignore encore du profil — mesuré

Sur les douze réponses du questionnaire, **deux seulement** influencent la
feuille de route : le statut (qui filtre les tâches) et la rentrée (qui les
date). Vérifié en modifiant chaque champ isolément :

| Réponse                       | Effet sur la feuille de route |
| ----------------------------- | ----------------------------- |
| `status` → parcours           | filtre : de 11/20 à 4/20 tâches selon le parcours |
| `intake`                      | date les tâches               |
| `english`, `budget`, `funding`, `foreignBar`, `usStatus`, `careerGoal`, `geoGoal` | **aucun** |

Deux conséquences visibles, et indéfendables parce que la personne a
explicitement répondu le contraire :

- **« Programmer le test d'anglais »** est proposée à qui a répondu « test déjà
  passé ».
- **« Préparer votre dossier de statut étudiant »** est proposée à un binational
  américain — alors que le questionnaire sait déjà qu'il n'a pas besoin de visa
  (`needsVisaBranch`).

Le second cas est du **périmètre** : le modèle sait déjà l'exprimer
(`NOT_APPLICABLE`), il suffit de l'utiliser. Rien à décider.

Le premier touche à une règle du CDC §24 et demande votre arbitrage. Le code
pose aujourd'hui : « c'est l'utilisateur qui coche, jamais le système à sa
place » — et il a raison de refuser de PRÉSUMER. Mais honorer une réponse
explicite n'est pas présumer, c'est écouter. Trois lectures possibles :

1. **Marquer accomplie** ce que la personne a déclaré fait. Simple, mais un
   Milestone Challenge pourrait être acquis sans clic — c'est précisément ce
   que le §24 proscrit.
2. **Proposer la confirmation** : la tâche apparaît avec « vous avez indiqué
   l'avoir déjà fait — confirmer ? ». Un clic, et la règle « c'est
   l'utilisateur qui coche » est respectée à la lettre.
3. **Ne rien changer** et assumer que le questionnaire et la feuille de route
   sont deux moments distincts.

Recommandation : 2. C'est la seule qui adapte l'expérience sans toucher à
l'intégrité de la progression.

> **Option 2 livrée** : `declaredDone` (`lib/roadmap/declared.ts`) redit la
> réponse sur la tâche concernée et laisse le clic à la personne. Aucun statut
> n'est changé. La liste des correspondances est fermée et courte — « test
> passé » y entre, « test programmé » et « préparation commencée » non : un
> « à confirmer » posé sur une tâche à moitié faite ferait plus de dégâts que
> l'oubli qu'il corrige. Le cas du binational américain (tâche de visa proposée
> à qui n'en a pas besoin) est traité à part, par `NOT_APPLICABLE`.

_Coût : moyen. Le calcul est isolé dans `dueDateFor` et `timeline.ts` ; la
difficulté est le vocabulaire, pas le code._

---

## 3. Le questionnaire perd tout si l'onglet se ferme

**Constat.** `Questionnaire.tsx` ne contient aucun `localStorage` ni
`sessionStorage`. Les réponses vivent dans un `useState`. Fermer l'onglet,
recharger, suivre un lien : tout est perdu, et il faut reprendre à l'écran 1.

**Effet.** C'est le point de conversion du produit — douze écrans, trois à
quatre minutes, souvent sur mobile, souvent interrompus. Chaque interruption
coûte l'intégralité du parcours. Les événements du lot B mesureront l'abandon
par écran, mais ils ne diront pas *pourquoi* : la reprise impossible est une
cause qu'on peut supprimer sans attendre la donnée.

**Ce qu'il faut décider.** La sauvegarde doit rester **locale au navigateur**
jusqu'à la soumission. Envoyer les réponses au serveur avant que l'utilisateur
ait validé contredirait la promesse affichée (« aucune création de compte ») et
la minimisation : on stockerait le profil de gens qui ont renoncé. Le brouillon
s'efface à la soumission et se périme de lui-même.

_Coût : faible à moyen. Un effet de persistance, une reprise au chargement, et
un test de bout en bout qui ferme puis rouvre l'onglet._

> **Livré.** `lib/questionnaire/draft.ts`. Le brouillon reste local, se périme
> à sept jours, et n'enregistre **que les choix fermés** : ni prénom, ni
> adresse, ni commentaire — un navigateur est souvent partagé — ni le
> consentement marketing, dont la restauration reviendrait à le pré-cocher
> (CDC §34). Chaque valeur relue est confrontée à la liste fermée de son champ :
> une option retirée depuis produirait sinon un profil que les moteurs ne
> savent pas lire. La reprise est **proposée, jamais imposée** : deux boutons,
> « Reprendre mes N réponses » et « Repartir de zéro », le second effaçant le
> brouillon. L'écran d'arrivée est recalculé et non relu, la logique
> conditionnelle ayant pu déplacer les écrans entre-temps.

---

## 4. Aucune réponse ne peut être corrigée après la soumission

**Constat.** Aucune copie du produit ne propose de modifier une réponse. Or tout
en dérive : la voie préliminaire, le rapport, la feuille de route, les scénarios
de coût, les partenariats détectés, la liste d'écoles.

**Effet.** Une faute de frappe sur l'université, un budget mal estimé, une
rentrée qui se décale d'un an — et le seul recours est de refaire un diagnostic
entier. Ce qui heurte le plafond de trois diagnostics par heure, crée un second
profil pour la même personne, et laisse le back-office avec deux dossiers à
arbitrer.

**Ce qu'il faut décider.** La reprise doit produire une **nouvelle version** du
diagnostic, pas une mutation de l'ancien : un rapport déjà envoyé doit continuer
de citer le profil qui l'a produit. C'est exactement le motif append-only déjà
retenu pour les matrices, et il existe déjà dans le produit.

_Coût : moyen à élevé. C'est la seule entrée du plan qui touche au modèle de
données. À ne lancer qu'après la bêta, quand on saura quels champs sont
réellement corrigés._

---

## 5. La page de résultat se répète

**Constat.** Pour un profil Paris 1, la page liste **neuf** partenariats
confirmés, chacun avec la même phrase de frais mot pour mot (« Frais de
scolarité à payer auprès de Paris 1, montant proche d'une inscription en Master,
plus CVEC le cas échéant »). La page fait 5 371 caractères.

**Effet.** Le lecteur décroche là où le produit voulait le convaincre. Ce qui
distingue les neuf écoles — la ville, le niveau attendu — se noie dans ce qui
leur est commun.

**Piste.** Énoncer une fois ce qui vaut pour tous, et ne détailler par école que
ce qui varie. La donnée le permet déjà, c'est un problème de rendu.

_Coût : faible._

> **Livré.** `commonTuitionDisplay` (`lib/partnerships/detect.ts`) remonte la
> phrase de frais partagée par la plupart des fiches ; l'école qui en porte une
> autre garde la sienne, et l'énoncé commun se déclare alors non universel
> (« sauf mention contraire sous l'école »). Une seule fiche **sans** phrase de
> frais annule toute factorisation : elle n'afficherait rien sous son nom, et
> le lecteur lui appliquerait l'énoncé commun — une information inventée sur ce
> qu'elle coûte. Mesuré sur le profil Paris 1 : la page passe de 5 371 à
> 4 745 caractères, et la phrase répétée huit fois n'apparaît plus qu'une.

---

## 6. « Douze écrans » annoncés, « Étape 1 sur 11 » affichés

**Constat.** `content/diagnostic.ts` promet « Douze écrans » ; `SCREENS` en
déclare bien douze, mais l'écran « barreau étranger » est conditionnel. La
majorité des profils voit donc « Étape 1 sur 11 » à la première seconde.

**Effet.** Mineur, mais c'est le premier chiffre que lit l'utilisateur, et il
contredit la promesse qu'il vient de lire. Dans un produit dont l'argument est
la rigueur, l'écart se remarque.

**Piste.** Annoncer « onze à douze écrans », ou une durée plutôt qu'un compte.

_Coût : une ligne de copie._

> **Livré.** « Onze à douze écrans selon votre profil ».

---

## Ordre recommandé

```
Avant la bêta (F2)     1. Envoi affirmé sans avoir lieu      LIVRÉ
                       6. Douze / onze écrans                LIVRÉ

Pendant la bêta        2. Feuille de route née en retard     options 1 et 2 LIVRÉES
                       3. Reprise du questionnaire           LIVRÉ
                       5. Répétition du résultat             LIVRÉ

Après la bêta          4. Correction d'une réponse           moyen-élevé
```

Reste le point 4, délibérément : la bêta dira quels champs les gens veulent
corriger, et une reprise conçue avant cette donnée serait conçue à l'aveugle.

Le point 1 est le seul qui soit une **inexactitude** plutôt qu'une gêne : il
part avec les premiers utilisateurs réels et doit être traité avant eux. Le
point 4 est le seul à attendre délibérément : la bêta dira quels champs les gens
veulent corriger, et une reprise conçue avant cette donnée serait conçue à
l'aveugle.

## Ce que ce plan ne propose pas, et pourquoi

- **Aucune refonte visuelle.** Le design est une copie assumée du site de
  référence ; les défauts relevés sont de justesse et de continuité, pas
  d'esthétique.
- **Aucun raccourcissement du questionnaire.** Douze écrans en trois minutes est
  déjà court pour ce qui en est tiré ; le problème n'est pas la longueur, c'est
  l'impossibilité de reprendre.
- **Aucune gamification de la progression.** Les Milestone Challenges existent
  et sont adossés à des tâches réellement accomplies. En ajouter au-dessus
  d'une feuille de route qui annonce déjà du retard aggraverait le point 2.
