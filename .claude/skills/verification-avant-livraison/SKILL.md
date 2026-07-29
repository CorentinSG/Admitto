---
name: verification-avant-livraison
description: À utiliser avant d'annoncer qu'un travail est terminé, corrigé ou conforme, et avant tout commit ou push sur Admitto. Impose d'exécuter les commandes de vérification et de lire leur sortie avant toute affirmation de réussite. Déclencher aussi quand on s'apprête à écrire « ça marche », « c'est corrigé », « tout est vert ».
---

# Vérification avant livraison

> Adapté du pattern `verification-before-completion` de
> [obra/superpowers](https://github.com/obra/superpowers), avec les commandes
> réelles de ce dépôt.

## La règle

**Aucune affirmation de réussite sans avoir exécuté la commande qui la prouve, dans la
session en cours.** Une exécution précédente, un raisonnement, ou « ça devrait marcher »
ne comptent pas.

## Ce que chaque affirmation exige

| Affirmation | Commande qui la prouve |
|---|---|
| « les types passent » | `npm run typecheck` |
| « les tests passent » | `npm run test` |
| « tout est vert » | `npm run check:all` |
| « le build passe » | `npm run build` |
| « le design est conforme » | `npm run verify:animations <url>` |
| « le questionnaire fonctionne » | `npm run verify:questionnaire <url>` |
| « le back-office fonctionne » | `ADMITTO_ADMIN_EMAIL=… npm run verify:backoffice <url>` |
| « le tunnel de paiement est conforme » | `npm run verify:checkout <url>` |
| « la page s'affiche correctement » | capture d'écran au navigateur, **et la regarder** |

Les scripts `verify:*` exigent un serveur lancé :
`npm run build && npx next start -p 3000`.

## Pourquoi c'est non négociable ici

Sur ce projet, plusieurs bugs réels n'ont été trouvés **que** par la vérification au
navigateur, jamais par les types ni par les tests :

- les `@keyframes` n'étaient pas injectées — pourtant `getComputedStyle` renvoyait bien
  `animation: shimmer 4s`, donc tout paraissait correct ;
- le `min-height: 100vh` du hero s'ajoutait à son padding faute de `box-sizing` ;
- le stockage en mémoire renvoyait un 404 systématique, Next.js dupliquant les modules ;
- un écran de questionnaire non affiché laissait son champ `undefined`, ce qui faisait
  passer tout profil non interrogé pour un avocat déjà inscrit au barreau.

Aucun de ces défauts n'aurait été détecté par un raisonnement sur le code.

## Procédure

1. Identifier la commande qui prouve l'affirmation.
2. L'exécuter en entier — pas un sous-ensemble, pas un résultat en cache.
3. Lire la sortie complète et le code de sortie.
4. Vérifier que la sortie soutient réellement l'affirmation.
5. Alors seulement, l'énoncer, en citant le résultat observé.

Pour une modification visuelle, l'étape 3 signifie **regarder la capture d'écran**, pas
seulement constater que le script s'est terminé sans erreur.

## Signaux d'alerte

Interrompre et vérifier si l'on s'apprête à :

- committer ou pousser sans avoir lancé `npm run check:all` ;
- écrire « corrigé », « conforme », « fonctionne » en s'appuyant sur la confiance ;
- conclure d'un test unitaire vert que le rendu est correct ;
- annoncer une correction visuelle sans avoir regardé le résultat rendu.

## Rapport honnête

Si une vérification échoue, le dire avec la sortie. Si une étape a été sautée, le dire.
Un travail partiellement vérifié est annoncé comme tel, jamais comme terminé.
