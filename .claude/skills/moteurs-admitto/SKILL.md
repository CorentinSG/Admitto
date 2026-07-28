---
name: moteurs-admitto
description: À utiliser pour toute modification des moteurs de décision d'Admitto — ajouter ou activer une règle du Moteur A, changer la notation d'un axe du Moteur B, toucher au plafonnement, aux voies préliminaires ou aux verdicts. Rappelle les champs obligatoires d'une règle, l'interdiction de conclure à une éligibilité, et les pièges de notation. Déclencher dès qu'on touche à lib/engine-a/ ou lib/engine-b/.
---

# Moteurs de décision Admitto

Les deux moteurs sont la partie du produit où une erreur a des conséquences réelles pour
l'utilisateur. Rien n'y est approximatif.

## Règle cardinale

**Les moteurs ne concluent jamais à une éligibilité définitive.** Seules les autorités
compétentes décident : universités, New York Board of Law Examiners, autorités
migratoires. En cas d'ambiguïté, la sortie est « revue humaine » — jamais une
improvisation, jamais une conclusion par défaut.

## Moteur A — ajouter ou modifier une règle

Fichier : `lib/engine-a/rules.seed.ts`. Toute règle porte **huit champs obligatoires** :
identifiant, condition, fait produit, bloc de texte, source officielle, date de
vérification, version, statut actif.

```ts
{
  id: "R-NY-003",
  condition: { all: [{ field: "education", op: "in", value: ["M2", "CAPA"] }] },
  factProduced: "NY_VIA_LLM_SUBJECT_TO_BOLE",
  textBlockId: "TB-NY-VIA-LLM",
  sourceUrl: "https://www.nybarexam.org/…",
  verifiedAt: null,   // ← null tant que la source n'a pas été lue
  version: 1,
  active: false,      // ← une règle non vérifiée reste INACTIVE
}
```

**Activer une règle exige d'avoir lu sa source.** `npm run check:rules` refuse toute règle
active dépourvue de source ou de date de vérification, et alerte au-delà de douze mois.
Les règles énonçant une règle de droit américain sont livrées inactives : leur activation
relève du fondateur, pas d'une décision technique.

Modifier une règle en production : **incrémenter `version`**, jamais réécrire en place.
Les évaluations passées portent un `rulesSnapshot` qui doit rester interprétable.

## Moteur B — notation des axes

Fichier : `lib/engine-b/score.ts`. Cinq axes notés 1 à 4, puis plafonnement dans
`verdict.ts`. Le verdict n'est **jamais** une moyenne simple.

Contraintes du cahier des charges à respecter :

- l'université ne doit jamais être le seul critère académique — elle fait remonter d'un
  cran au plus, et jamais jusqu'à la note maximale, réservée à un cursus achevé ;
- un budget faible déclenche d'abord une recherche de financement avant de dégrader ;
- l'axe migratoire est neutralisé quand aucun visa n'est nécessaire, et plus prudent
  quand l'utilisateur exige de rester aux États-Unis ;
- un axe à 1/4 interdit le verdict le plus favorable ; deux axes faibles imposent au
  minimum « planification importante » ; un objectif flou produit « à clarifier ».

## Le piège qui a déjà causé un bug

**Une réponse absente ne vaut jamais une réponse positive.** La logique conditionnelle
n'affiche pas tous les écrans : un champ non demandé reste `undefined`.

```ts
// FAUX : un profil jamais interrogé passe pour un avocat inscrit
const qualified = answers.foreignBar !== "NONE";

// JUSTE : tester l'égalité aux valeurs attendues
const qualified = answers.foreignBar === "FRANCE" || answers.foreignBar === "OTHER_COUNTRY";
```

## Déterminisme

Aucun calcul de date ne lit l'horloge implicitement. Les fonctions reçoivent une date de
référence en paramètre — c'est ce qui rend les tests reproductibles.

## Validation obligatoire

```bash
npm run test          # tout changement de logique exige un test
npm run check:rules
```

Un changement de notation modifie les verdicts d'utilisateurs réels : lancer la suite
complète et vérifier le diff des verdicts sur les profils-types avant de committer.
