# Plan — une expérience profondément personnelle

> Établi le 16 août 2026, après la livraison du parcours consultation complet
> (réservation → confirmation → rappel → compte rendu) et de la note de suivi
> par tâche. Chaque constat ci-dessous est mesuré sur le code au moment de
> l'écriture.

## Le principe, avant la liste

Personnaliser, ici, ne veut pas dire générer : la V1 interdit toute IA visible,
tout texte produit librement, toute promesse de résultat. Personnaliser veut
dire **cesser d'ignorer ce que le produit sait déjà** de la personne — et il en
sait beaucoup :

| Ce qui est su | Où c'est utilisé aujourd'hui | Où c'est IGNORÉ aujourd'hui |
| --- | --- | --- |
| 12 réponses au questionnaire | Moteurs, rapport, feuille de route | Simulateur, bibliothèque de modules |
| Parcours type (4 profils) et phase actuelle | Tâches filtrées, libellé de phase | Modules, consultations, copie de l'espace |
| 5 axes de viabilité et risques (Moteur B) | Le rapport, une fois | TOUT l'espace payant, le J+12 |
| Budget déclaré et fourchette de coût calculée | Résultat, rapport | Le simulateur, qui repart de zéro |
| Université → accords détectés | Résultat, rapport, sélecteur d'écoles | — (bien utilisé) |
| Liste d'écoles, ambitions, échéances notées | Équilibre de la liste | Feuille de route (échéances notées) |
| Notes de suivi, jalons datés, comptes rendus | Chaque écran qui les porte | — (récents) |

La règle de chaque proposition : **des blocs fermés choisis par le profil,
jamais du texte engendré** — le mécanisme qui fait déjà tenir le rapport.

---

## Horizon 1 — le produit cesse de repartir de zéro (code seul, livrable maintenant)

### 1.1 Le simulateur s'ouvre sur LEUR situation, pas sur un gabarit

Mesuré : le simulateur s'ouvre sur « Mon scénario », préréglages de ville
génériques, alors que le diagnostic a déjà calculé une fourchette pour cette
personne et qu'elle a déclaré son budget. Quelqu'un qui a répondu « moins de
30 000 $ » et lit « Total : 78 000 $ » sur un scénario vierge ne se sent pas
attendu.

Proposition : au premier passage (aucun scénario enregistré), un premier
scénario est proposé — pas enregistré d'office — pré-rempli depuis la
fourchette de SON diagnostic, nommé d'après SA situation (« Votre point de
départ — rentrée 2027 »). Ses ressources déclarées (bourses envisagées, prêt)
précochent les postes correspondants. Rien n'est inventé : chaque valeur vient
d'une réponse ou du calcul déjà rendu.

_Coût : faible. Les données existent toutes ; c'est un constructeur de
`ScenarioInputs` depuis `Assessment`, et ses tests._

### 1.2 La bibliothèque de modules dit pourquoi CE module pour VOUS

Mesuré : les onze modules s'affichent dans le même ordre pour tout le monde
(`order`), sans un mot sur le profil. Un avocat étranger qui vise le transfert
lit d'abord « Choisir son LL.M. » ; un étudiant en M1 voit « Autres barreaux »
au même rang que lui.

Proposition : une carte de module gagne une ligne « pour votre parcours » —
issue d'une table fermée (parcours type × module → phrase rédigée à l'avance,
ou rien). Le module recommandé de la phase actuelle monte en tête avec la
raison déjà calculée par la feuille de route. L'ordre des autres ne change pas :
réordonner toute la bibliothèque par profil ferait perdre le repère des numéros.

_Coût : faible-moyen. Une table de copie, un tri stable, des tests de
couverture (chaque parcours a au moins ses lignes)._

### 1.3 Les cinq axes entrent dans l'espace payant

Mesuré : le Moteur B note cinq axes et le rapport les montre — une fois, dans
un document. L'espace payant, où la personne revient chaque semaine, ne les
montre JAMAIS. C'est pourtant la photographie la plus personnelle que le
produit possède.

Proposition : un écran (ou une section du tableau de bord) « Vos cinq axes »,
reprenant les scores FIGÉS du diagnostic avec leurs commentaires déjà rédigés,
et pour chaque axe faible, le lien vers l'outil ou le module qui le travaille
(la correspondance axe → ressource est une table fermée). Il est dit clairement
que c'est la photographie du diagnostic, à sa date — pas un score vivant : le
recalculer en continu contredirait le principe « le profil est stocké tel que
répondu », et un score qui bouge sans nouvelle réponse serait une invention.

_Coût : moyen. Aucun calcul nouveau — un rendu, une table axe → ressource, la
copie, les suites._

### 1.4 Le J+12 suit le risque principal, plus le module d'orientation

Mesuré : `resourceFor` (lib/email/eligibility.ts) envoie toujours
`module-0-decision`, et son commentaire l'admet : « le module recommandé par la
feuille de route serait plus fin ». Le produit calcule le risque principal de
la personne… et lui envoie à tous le même module.

Proposition : une table fermée axe-du-risque → module publié (financement →
« Financer son LL.M. », immigration → « Immigration », etc.), repli sur le
module 0 quand l'axe n'a pas de module. La garde existante reste : un module
non publié n'est jamais cité, un slug est vérifié par le test qui a attrapé
`module-0-orientation`.

_Coût : faible. La leçon du slug faux est déjà encodée en test._

### 1.5 La séance proposée d'abord est celle de leur étape

Mesuré : la page Consultations liste les quatre types dans le même ordre pour
tous. Un candidat en pleine sélection d'écoles voit « Cadrage du projet » avant
« Revue de la liste d'écoles ».

Proposition : le type correspondant à la phase actuelle monte en tête, avec une
ligne « la plus proche de votre étape » (table fermée phase → type). Les
autres restent listés — c'est une mise en avant, jamais un rétrécissement de
l'offre, et aucun libellé ne promet qu'elle « convient » : elle correspond à
l'étape, c'est tout ce que le produit sait.

_Coût : faible._

### 1.6 Les échéances notées sur les écoles rejoignent la timeline

Mesuré : la personne note des dates limites sur ses écoles (`SchoolChoice.
applicationDeadline`) — et la timeline, qui affiche losanges d'échéances
officielles et tâches datées, les ignore. Ce sont pourtant les dates les plus
personnelles du produit : celles qu'elle a choisies elle-même.

Proposition : les échéances d'écoles paraissent sur la timeline (feuille de
route et tableau de bord — c'est la MÊME projection, `timeline-view.ts`, donc
un seul point d'entrée), marquées comme « votre date », distinctes des
échéances calculées. Aucun statut inventé : une date passée est passée, le
produit ne dit pas si le dossier est parti.

_Coût : moyen. Toucher à `buildTimeline` demande de repasser ses tests de
recouvrement et les deux suites navigateur._

---

## Horizon 2 — la clé de voûte : un profil qui peut évoluer

Tout l'Horizon 1 personnalise sur la photographie du jour 0. Or la vie de la
personne bouge : le test d'anglais est passé, le budget s'est précisé, la
rentrée a glissé d'un an. Aujourd'hui le produit reste figé sur les réponses
initiales — c'est le n° 4 du plan UX, différé en attendant la bêta, et c'est
LA limite de toute personnalisation durable : **une expérience ne peut pas être
personnelle six mois si son image de la personne date du premier jour.**

Le motif technique est déjà choisi (nouvelle VERSION du diagnostic,
append-only, comme les révisions de matrices — jamais d'écrasement : les
réponses d'origine restent la preuve de ce qui a été répondu, le rapport déjà
envoyé reste figé sur sa génération). Ce qui recalcule : feuille de route,
timeline, fenêtre de rentrée, équilibre d'écoles, simulateur. Ce qui ne bouge
JAMAIS : le rapport envoyé, les comptes rendus, l'historique.

Recommandation : ne plus attendre la totalité de la bêta. Ouvrir d'abord les
DEUX champs dont le changement est un fait et non une nuance — la rentrée
visée et l'état du test d'anglais — pour éprouver le motif de versionnage sur
des cas nets. Les corrections libres attendront les demandes réelles.

_Coût : élevé — c'est le chantier structurant. Mais chaque brique de
l'Horizon 1 le rend plus rentable : tout ce qui lit le profil profitera de sa
mise à jour._

---

## Horizon 3 — ce que la bêta ajoutera à la personnalisation

| Donnée qui arrivera | Personnalisation qu'elle permettra |
| --- | --- |
| Modules réellement lus (compteurs anonymes agrégés) | Ne plus recommander un module déjà lu — exige de compter PAR personne, donc une décision de minimisation à documenter d'abord |
| Demandes de correction reçues | Quels champs ouvrir en plus des deux de l'Horizon 2 |
| Questions récurrentes en séance | Quelles lignes ajouter aux tables parcours × module |

---

## Ce que la personnalisation ne fera JAMAIS ici

Les rails existants s'appliquent à chaque proposition, sans exception :

1. **Jamais de texte engendré** — des blocs fermés, choisis par le profil.
2. **Jamais un classement d'écoles ni une chance d'admission** — l'ambition
   reste déclarée par la personne (règle du sélecteur).
3. **Jamais un score qui bouge sans nouvelle réponse** — la photographie est
   datée, l'évolution passe par l'Horizon 2.
4. **Jamais cocher, remplir ou décider à la place de la personne** — le
   simulateur PROPOSE le scénario de départ, il ne l'enregistre pas (CDC §24).
5. **Jamais de collecte nouvelle pour personnaliser** — tout l'Horizon 1
   fonctionne sur ce qui est déjà détenu ; ce qui exigerait de détenir plus
   (lecture par personne, dernière visite) est nommé comme tel et attend une
   décision de minimisation explicite.

---

## Ordre recommandé

```
Maintenant           1.1 Simulateur pré-rempli        faible, effet immédiat
                     1.4 J+12 par risque              faible, déjà préparé par les gardes
                     1.5 Séance de l'étape            faible
                     1.2 Modules « pour vous »        faible-moyen (table de copie à rédiger)

Ensuite              1.3 Les cinq axes dans l'espace  moyen — l'écran le plus personnel
                     1.6 Dates d'écoles en timeline   moyen — toucher à la projection unique

Puis                 Horizon 2 : rentrée + anglais    le chantier structurant
                     corrigeables (versionnage)

Après la bêta        Horizon 3                        selon les données
```

Le fil conducteur : chaque écran de l'espace payant doit pouvoir répondre à la
question « qu'est-ce que cette page sait de MOI ? » — et aujourd'hui, trois
écrans sur sept répondraient « rien ».
