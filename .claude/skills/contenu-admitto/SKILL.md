---
name: contenu-admitto
description: À utiliser pour toute écriture ou modification de texte visible par l'utilisateur d'Admitto — copie de page, bloc de rapport, email, libellé d'offre, FAQ, disclaimer. Rappelle le vocabulaire interdit, la liste fermée des variables autorisées, les disclaimers obligatoires et les bases légales des emails. Déclencher dès qu'on touche à content/, à lib/report/ ou à lib/email/.
---

# Contenu Admitto — ce qui peut être écrit, et comment

Le produit vend de la rigueur. Une formule trop commerciale ou une promesse implicite
détruit sa crédibilité et l'expose juridiquement.

## Vocabulaire interdit

`npm run check:vocabulary` échoue sur : « attorney-reviewed », « Esq. »,
« Attorney at Law », « admission garantie », « résultat garanti », « succès garanti »,
« vous êtes éligible », « probabilité de réussite », « consultations illimitées ».

Au-delà de la liste, l'esprit : **aucune promesse d'emploi, de visa, de bourse ou
d'admission**, aucun verdict exprimé en pourcentage, aucune présentation du service
comme juridique. Le fondateur signe « Founder », jamais avec un titre d'avocat.

Les fichiers de test sont hors périmètre du garde-fou : ils citent nécessairement ces
termes pour vérifier leur absence.

## Disclaimers obligatoires

Le disclaimer complet du cahier des charges figure sur : le résultat immédiat, le rapport,
le tunnel de paiement, la CTA finale de la page d'accueil et le footer. Ne jamais
l'alléger « pour la lisibilité ».

Formulation de référence : produit éducatif et stratégique, fondé sur les informations
communiquées, des sources publiques, des parcours documentés et l'expérience personnelle
du fondateur ; ne constitue pas un conseil juridique ; ne crée aucune relation
avocat-client ; ne vaut décision d'aucune autorité.

## Blocs de rapport et d'email — variables fermées

Aucun texte n'est produit librement : tout est assemblé depuis des blocs pré-rédigés.

- Rapport : `content/report-blocks.ts`, variables autorisées dans `lib/report/fill.ts`
  (prénom, université, dates, coûts, partenariats, phase, parcours type).
- Emails : `content/emails.ts`, variables autorisées dans `lib/email/render.ts`.

`fill()` **lève une exception** sur une variable inconnue ou absente. C'est voulu : un
rapport à trou ou un texte improvisé ne doit jamais partir. Pour introduire une nouvelle
variable, l'ajouter explicitement à la liste et justifier qu'elle relève bien du
cahier des charges.

## Emails — base légale

Chaque email porte sa base légale dans `lib/email/types.ts` :

- **CONTRACT** (J+0 confirmation, J+2 rapport, J+5 suivi) : exécution du service, part
  toujours.
- **CONSENT** (J+12 contenu, J+25 expiration) : promotionnel, exige un consentement
  distinct, facultatif, non pré-coché, et porte un lien de désinscription.

Ne jamais requalifier un promotionnel en transactionnel pour contourner le consentement.
Deux verrous existent : la planification n'inclut pas les emails de consentement sans
consentement, et `sendGuarded` les rebloque au moment de l'envoi.

## Minimisation des données

Le questionnaire ne comporte qu'un champ libre, facultatif et plafonné. Les champs
détaillés (mention, score exact, situation professionnelle) ne sont demandés qu'après le
premier questionnaire. Le vault refuse les types sensibles : passeport, Character and
Fitness, documents médicaux ou disciplinaires, données financières, dossiers de visa.

## Ton

Sobre et factuel. Pas d'emphase commerciale, pas de gamification enfantine, pas de
superlatifs. Ce que le produit ne fait pas est dit aussi clairement que ce qu'il fait —
la FAQ est construite sur ce principe.

## Validation obligatoire

```bash
npm run check:vocabulary
npm run test   # les blocs de rapport et d'email sont couverts par des tests
```
