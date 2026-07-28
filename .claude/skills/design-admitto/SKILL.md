---
name: design-admitto
description: À utiliser pour toute modification visuelle d'Admitto — nouvelle page, nouvelle section, animation, couleur, mise en page, composant. Rappelle le contrat d'animation strict, la palette unique, les quirks du site de référence à conserver et les pièges de mise en page. Déclencher dès qu'on touche à app/, design/ ou à un style inline.
---

# Design Admitto — contrat strict

Le design est une **copie exacte** du site `admitto.nanocorp.app`. Rien ne s'invente ici :
tout nouveau composant réutilise les primitives existantes.

## Sources de vérité

- `design/tokens.ts` — palette, typographies, dégradés. **Seule** source de couleurs.
- `design/animations.tsx` — `useInView`, seuils, helpers de révélation.
- `design/global-css.ts` — règles globales et les 4 keyframes. **Module serveur** :
  ne jamais y ajouter `"use client"`, sinon les keyframes cessent d'être injectées.
- `design/reset.ts` — preflight minimal. Sans `box-sizing: border-box`, les hauteurs
  en `100vh` s'additionnent aux paddings.

## Interdits absolus

- Aucune librairie d'animation (ni Framer Motion, ni GSAP, ni Lenis, ni AOS).
- Aucun easing autre que `ease`. Pas de cubic-bezier, pas de spring.
- Aucune animation de sortie : une fois révélé, un élément ne se re-cache jamais.
- Aucun parallax, aucune animation pilotée par le scroll, aucun compteur animé.
- Aucune couleur hors palette (`npm run check:tokens` échoue).
- Aucun `:hover` en CSS : les survols passent par `onMouseEnter` / `onMouseLeave`
  mutant `e.currentTarget.style`.

## Primitives à réutiliser

```tsx
const [ref, inView] = useInView(thresholds.solution);
// Révélation standard : opacity + translateY, 0,8 s ease, delays 0 / 0.1 / 0.2 / 0.3 s
style={{ opacity: +!!inView, transform: inView ? "translateY(0)" : "translateY(24px)",
         transition: "opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s" }}
```

Composants partagés : `SectionLabel`, `SectionTitle`, `Badge`, `GoldCta`, `GhostCta`
(`app/(marketing)/_components/ui.tsx`).

## Quirks du site de référence — à conserver

Ce ne sont pas des bugs. Ne pas « corriger » sans décision explicite.

- **Cartes de la section « Le Défi »** : leur transition ne contient que
  `background-color`. L'opacité et le translate basculent donc instantanément malgré les
  delays échelonnés — label et titre fondent, les cartes apparaissent d'un coup.
- **Bordure de la nav** : elle n'est pas dans la liste des propriétés animées. Elle
  apparaît sèchement à 40 px de scroll pendant que le fond fond en 0,4 s.
- **Colonne droite de « La Solution »** : c'est le conteneur entier qui glisse de 40 px,
  sans aucun stagger interne.
- **`fadeIn` et `fadeInUp`** sont déclarées dans les keyframes mais jamais utilisées.

## Pièges de mise en page

- Toute section dont un enfant est décalé en `translateX` avant révélation **doit** porter
  `overflow: hidden`, sinon elle déborde à droite sur mobile.
- Les pages portant une donnée personnelle (résultat, rapport, back-office) déclarent
  `robots: { index: false, follow: false }`.
- Les pages marketing restent des server components et donc statiques : n'y lire ni
  cookie ni session, sous peine de les basculer en dynamique.
- Responsive : la classe `.solution-grid-inner` passe en une colonne sous 900 px.

## Validation obligatoire

```bash
npm run check:tokens
npm run build && npx next start -p 3000
npm run verify:animations http://127.0.0.1:3000/
```

Puis **regarder une capture d'écran** de la page modifiée : les quinze points de la
checklist ne couvrent pas la justesse esthétique.
