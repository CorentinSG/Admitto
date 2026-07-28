---
name: debogage-systematique
description: À utiliser dès qu'un bug, un test en échec ou un comportement inattendu apparaît sur Admitto, AVANT de proposer un correctif. Impose une investigation de la cause racine plutôt qu'une correction de symptôme. Déclencher sur toute erreur de build, 404 inattendu, rendu incorrect, ou vérification navigateur en échec.
---

# Débogage systématique

> Adapté du pattern `systematic-debugging` de
> [obra/superpowers](https://github.com/obra/superpowers), avec les points
> d'entrée de diagnostic de ce dépôt.

## La règle

**Aucun correctif avant d'avoir identifié la cause racine.** Corriger un symptôme garantit
une reprise du travail plus tard, et souvent un second bug.

## Phase 1 — Investigation

- Lire le message d'erreur en entier, pas seulement sa première ligne.
- Reproduire de façon fiable. Sur ce projet, cela veut souvent dire :
  `npm run build && npx next start -p 3000` puis le script `verify:*` concerné.
- Regarder les journaux du serveur, pas seulement la sortie du navigateur
  (les envois d'email et les erreurs d'action serveur n'apparaissent que là).
- Remonter le flux de données jusqu'à l'endroit où la valeur devient fausse.

## Phase 2 — Comparaison

Chercher du code voisin qui fonctionne, et lister **toutes** les différences.

Points d'entrée efficaces sur ce dépôt :

```bash
graphify explain "NomDuSymbole"     # tout ce que le graphe sait d'un nœud
graphify path "A" "B"               # comment deux modules se relient
```

Exemple vécu : la section « Le parcours du fondateur » débordait à droite sur mobile.
Les sections Solution et Dashboard, au motif identique, ne débordaient pas — la seule
différence était `overflow: hidden`. La comparaison a donné la cause en une minute.

## Phase 3 — Hypothèse

Énoncer une hypothèse vérifiable, la tester par le changement minimal, et **mesurer**.
Si le test infirme l'hypothèse, en formuler une autre : ne pas empiler les correctifs.

## Phase 4 — Correction

- Écrire d'abord le test qui échoue (obligatoire pour toute logique de moteur).
- Corriger la cause, pas le symptôme.
- Vérifier que la correction ne casse rien : `npm run check:all`.
- Commenter la contrainte invisible si elle risque d'être réintroduite.

Après trois correctifs infructueux, arrêter et remettre en cause l'architecture plutôt
que de continuer à patcher.

## Pièges déjà rencontrés sur ce projet

Les vérifier en premier, ils reviennent :

- **Réponse absente ≠ réponse négative.** Un écran de questionnaire non affiché laisse son
  champ `undefined`. Tester l'égalité à la valeur attendue, jamais `!== "NONE"`.
- **Module client vs serveur.** Une constante exportée d'un module `"use client"` arrive
  dans un server component comme référence client, pas comme valeur. Symptôme : du CSS ou
  une chaîne qui « disparaît » silencieusement.
- **Duplication de modules par Next.js.** Un état de module (`Map`, cache) n'est pas
  partagé entre une action serveur et une page en build de production. Accrocher à
  `globalThis`.
- **`innerText` restitue le texte rendu.** `text-transform: uppercase` remonte en
  majuscules : comparer sans tenir compte de la casse dans les scripts de vérification.
- **Types générés obsolètes.** Après suppression ou déplacement d'une page, `.next/types`
  provoque des erreurs fantômes : `rm -rf .next` avant de conclure.
