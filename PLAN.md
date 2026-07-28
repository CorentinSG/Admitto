# Plan de construction détaillé — Plateforme LL.M. & Barreau américain (Admitto)

> **Sources de vérité**
> 1. *Cahier des charges complet — Plateforme LL.M. et barreau américain, v1.0, juillet 2026* (Corentin Saint-Girons). Toute ambiguïté substantielle doit être signalée, jamais improvisée.
> 2. **Design** : reproduction à l'identique du site existant `admitto.nanocorp.app` (palette, typographies, mise en page, styles inline).
> 3. **Animations** : document « Prompt de reconstruction — système d'animation du site Admitto » (spécification extraite du code réel du site). Les valeurs sont reprises telles quelles en §3 ci-dessous.

---

## 1. Principes directeurs (non négociables)

1. **Service expert productisé d'abord, plateforme automatisée ensuite.** Le code suit les apprentissages terrain. On ne construit pas la V4 en Phase 1.
2. **Aucune IA générative visible** dans l'expérience utilisateur V1 : pas de chatbot, pas de texte libre généré, pas de roadmap générée librement. Personnalisation = règles déterministes + matrices + profils types + blocs de texte pré-rédigés + revue humaine.
3. **Un seul profil, une seule expérience continue** : questionnaire → résultat immédiat → rapport → plateforme payante utilisent les mêmes données. Jamais de ressaisie après achat.
4. **Positionnement premium sobre** : crédibilité d'un cabinet + clarté d'un outil de gestion de projet + fluidité d'un produit tech. Interdits : promesses irréalistes, ton trop commercial, gamification enfantine, interfaces surchargées, vocabulaire de résultat garanti.
5. **Cadre juridique strict** : produit éducatif et stratégique, jamais de conseil juridique, jamais de relation avocat-client, jamais de signature « Esq. »/« Attorney at Law », disclaimers systématiques, seules les autorités compétentes (BOLE, universités, autorités migratoires) décident.
6. **Chaque fonctionnalité** doit servir au moins un objectif du §1 du cahier des charges (comprendre, décider, réduire un risque, prochaine action, organiser, accéder aux contenus, suivre la progression, accompagnement humain, qualité/traçabilité des informations). Sinon, elle n'est pas construite.

---

## 2. Stack technique

| Couche | Choix | Justification |
|---|---|---|
| Framework | **Next.js (App Router) + React 19** | Identique au site existant ; SSR pour le SEO (canal d'acquisition prioritaire) ; page marketing en client component `"use client"`. |
| Styling | **Styles 100 % inline dans le JSX** + Tailwind v4 uniquement pour le reset/preflight | Contrainte de fidélité au design existant : le markup du site n'utilise quasiment aucune classe utilitaire. |
| Animations | **Aucune librairie** (ni Framer Motion, ni GSAP, ni Lenis, ni AOS) | IntersectionObserver + useState + transitions CSS inline + 2 `@keyframes` (cf. §3). |
| Polices | `Cormorant Garamond` (titres, italiques) + `DM Sans` (corps), via `next/font` | Identique au site existant. |
| Base de données | **PostgreSQL** + Prisma (ou Supabase Postgres) | Modèle relationnel riche (règles versionnées, partenariats, roadmaps) ; contraintes d'intégrité. |
| Auth | Auth.js (email magic link + mot de passe) | Création de compte seulement après achat (parcours §10 du CdC). |
| Paiement | **Stripe** (Checkout + paiement en 3-4 fois via Klarna/Alma) | Phase 1B ; le paiement fractionné doit être visible. |
| Emails | **Resend** (ou Postmark) + templates React Email | Séquence J+0 → J+25 ; séparation stricte transactionnel / marketing (RGPD). |
| PDF du rapport | Rendu HTML → PDF (Puppeteer/`@react-pdf`) depuis les blocs validés | Le rapport est assemblé à partir de blocs pré-rédigés, jamais généré librement. |
| Hébergement | Vercel (front + API) + Postgres managé (UE) | Données hébergées en UE de préférence (RGPD, transferts internationaux). |
| Analytics | Plausible ou PostHog (UE, sans cookies tiers) | Métriques du §36 sans alourdir la conformité. |
| Back-office | Route group `/admin` protégée (RBAC) | Suffisant en V1 ; pas d'outil externe tant que le volume est faible. |

**Arborescence cible (monorepo simple) :**

```
/app
  /(marketing)/page.tsx          # Landing — design Admitto à l'identique
  /(marketing)/faq, /founder     # si extraites de la landing
  /assessment                    # Questionnaire (12 écrans max)
  /assessment/result             # Résultat préliminaire immédiat
  /checkout                      # Tunnel Diagnostic (Phase 1B) puis offres
  /(app)/dashboard               # Espace payant
  /(app)/roadmap
  /(app)/modules/[slug]
  /(app)/simulator
  /(app)/vault
  /(app)/settings
  /admin/...                     # Back-office (§33)
/lib
  /engine-a                      # Moteur A : règles déterministes, voies préliminaires
  /engine-b                      # Moteur B : viabilité 5 axes + plafonnement
  /report                        # Assemblage de blocs → rapport
  /emails                        # Séquences transactionnelles et marketing
/content
  /blocks                        # Blocs de texte validés (versionnés)
  /modules                       # Contenus pédagogiques
/prisma/schema.prisma
```

---

## 3. Design system — reproduction exacte du site Admitto

**Règle absolue : ne rien réinterpréter.** Les valeurs ci-dessous viennent du code réel de `admitto.nanocorp.app` et s'appliquent à toutes les nouvelles pages (landing, questionnaire, dashboard…) pour une identité visuelle unique.

### 3.1 Palette

```
--navy-900 #0A1628   --navy-800 #0E1D3A   --navy-700 #142240   --navy-600 #1E3561
--ivory    #FAFAF7   --slate    #3D4F6B
--gold     #C9A84C   --gold-light #E8C87A
```

- Sections sombres : dégradés `linear-gradient(160deg, #0A1628 → #142240 → #0E1D3A → #0A1628)` + radial-gradients navy/gold en surcouche.
- Sections claires : fond `#FAFAF7`, texte `#0A1628`, corps `#3D4F6B`.
- Accents et CTA : dégradé or `linear-gradient(135deg, #C9A84C 0%, #E8C87A 100%)`, texte `#0A1628`.

### 3.2 Typographie

- **Titres / italiques** : `'Cormorant Garamond', serif` (chiffres décoratifs en 3.5rem weight 300).
- **Corps / UI** : `'DM Sans', sans-serif`.
- Boutons : `font-size 0.88rem; letter-spacing 0.06em; text-transform: uppercase; padding 18px 44px`.
- Labels de section : trait doré 40×1px + libellé majuscules (ex. « LE DÉFI »).

### 3.3 Primitive d'animation unique — `useInView`

Une seule primitive gère **toutes** les apparitions, reproduite exactement :

```jsx
function useInView(threshold = 0.12) {
  const [inView, setInView] = useState(false);
  const ref = useCallback((node) => {
    if (!node) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();          // one-shot : jamais de re-trigger
        }
      },
      { threshold }                 // pas de rootMargin
    );
    io.observe(node);
    return () => io.disconnect();   // cleanup ref callback (React 19)
  }, []);
  return [ref, inView];
}
```

Points non négociables : **ref callback** (pas useRef+useEffect) ; `io.disconnect()` dès la première intersection (aucune animation de sortie) ; `threshold` seul ; deps `[]`. Opacité écrite `opacity: +!!flag`, transform `flag ? "translateY(0)" : "translateY(30px)"`.

Instanciation landing : Hero (0.05), #problematique (0.08), #solution (0.08), #parcours (0.05), #commencer (0.08).

### 3.4 Règles globales CSS

```css
html { scroll-behavior: smooth; }
body { transition: opacity 0.2s ease-in; }
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

Keyframes (exactement ces 4 ; `fadeIn`/`fadeInUp` déclarées mais **non utilisées**) :

- `shimmer` : `background-position 0% → 100% → 0% center` (cycle 4s).
- `pulse-gold` : `box-shadow 0 0 0 0 rgba(201,168,76,0.5)` → `0 0 0 8px rgba(201,168,76,0)`.
- `fadeInUp`, `fadeIn` (déclarées, non utilisées).

**Easing : uniquement `ease`.** Aucune cubic-bezier custom, aucun spring, aucun `will-change`.

### 3.5 Navigation fixe

`position:fixed; top/left/right:0; z-index:100; height:72px; padding:0 8%`, listener scroll (`scrolled = window.scrollY > 40`, passive) :

| Propriété | scrollY ≤ 40 | scrollY > 40 |
|---|---|---|
| backgroundColor | transparent | rgba(10,22,40,0.97) |
| backdropFilter | none | blur(24px) |
| borderBottom | none | 1px solid rgba(201,168,76,0.14) |

`transition: background-color 0.4s ease, backdrop-filter 0.4s ease` — la bordure apparaît **sèchement** à 40px (quirk à conserver).

### 3.6 Sections de la landing (structure + animations)

1. **Hero** (`min-height:100vh; padding:140px 8% 100px`, fond 3 couches radial+linear, 2 cercles décoratifs statiques) — cascade badge → h1 → sous-titre → CTAs par `transition-delay` 0 / 0.1 / 0.2 / 0.3s (0.8–0.9s ease), durée totale 1,2s. `<em>` doré en shimmer 4s infini dès le chargement. Indicateur « DÉFILER » statique (barre 1×36px dégradé or, opacity 0.35).
2. **Le Défi** (`#problematique`, fond #FAFAF7, padding 120px 8%) — label fade 0.8s, h2 fade+translateY(20px) 0.8s +0.1s. 4 cartes en grille `repeat(auto-fit, minmax(240px,1fr))`, `gap:1px` sur fond `rgba(10,22,40,0.08)` (filets séparateurs). **Quirk à reproduire** : `transition: background-color 0.3s` seulement → les cartes apparaissent d'un coup (pas de fondu), seuls label/titre fondent. Hover : inversion complète en 0.3s via onMouseEnter/onMouseLeave (carte #FAFAF7→#0A1628, chiffre rgba(10,22,40,0.12)→#C9A84C, titre →white, description →rgba(255,255,255,0.6)).
3. **La Solution** (`#solution`, fond dégradé navy 160deg, padding 120px 8%) — colonne gauche en cascade (0 / 0.1 / 0.2 / 0.3s) ; colonne droite : **le conteneur entier** glisse `translateX(40px)→0` en 0.8s +0.2s (aucun stagger d'items). Hover des 6 items (`all 0.2s`) : fond rgba(255,255,255,0.03)→rgba(201,168,76,0.05), bordure rgba(201,168,76,0.14)→0.42. Responsive : les 2 colonnes s'empilent (`1fr !important; gap 48px`).
4. **Le Parcours** (`#parcours`, fond #FAFAF7) — 5 lignes en grille `72px 20px 1fr`, stagger horizontal `translateX(-24px)→0`, 0.7s ease, delays 0.10/0.22/0.34/0.46/0.58s. Pastilles or 10px : `pulse-gold 2.5s ease infinite` avec delays 0/0.4/0.8/1.2/1.6s, **`animation:none` tant que la section n'est pas révélée**. Fil vertical 1px dégradé or, statique, rendu si `i < steps.length - 1`.
5. **CTA final** (`#commencer`, fond radial+linear navy, centré) — badge fade 0.8s, h2 +0.1s (translateY 20px), p +0.2s, wrapper CTA +0.3s (translateY 24px), disclaimer légal +0.45s.

### 3.7 Micro-interactions (tous les hovers en JS inline, jamais en CSS)

| Élément | transition | Hover |
|---|---|---|
| CTA doré (hero/solution/final) | transform 0.2s, box-shadow 0.2s | translateY(-2px) + ombre or (blur 45/40/50px) |
| CTA secondaire hero | all 0.2s | borderColor rgba(201,168,76,0.5), color white |
| Carte Défi | background-color 0.3s (+ color 0.3s enfants) | inversion navy complète |
| Item liste Solution | all 0.2s | bordure + fond dorés |
| Liens footer | color 0.2s | — |

### 3.8 Interdits (checklist anti-dérive)

❌ Parallax, scroll-driven animation, scroll-timeline • ❌ animations de sortie • ❌ librairies d'animation • ❌ easing custom • ❌ blur/scale/rotate à l'entrée (uniquement opacity + translateX/Y) • ❌ curseur custom, effet magnétique, compteur animé • ❌ animation des cercles décoratifs, du fil de timeline, de l'indicateur défiler.

### 3.9 Extension du design system aux nouvelles pages

Le CdC ajoute des écrans que le site actuel n'a pas (questionnaire, dashboard, rapport…). Règles d'extension :
- Mêmes palette, polices, paddings de section (120px 8%), labels à trait doré, cartes à filets 1px, CTAs or.
- Questionnaire : fond navy dégradé (comme hero), une carte ivoire centrale par écran, barre de progression fine en dégradé or, boutons de réponse = style « item Solution » (bordure or 0.14 → hover 0.42).
- Dashboard/app : fond #FAFAF7 dominant, cartes ivoire à filets, accents or réservés au Next Best Action et aux jalons ; sobriété absolue (pas de couleurs vives, pas de badges décoratifs).
- Toute apparition d'élément utilise `useInView` + opacity/translate, easing `ease`, one-shot.

---

## 4. Modèle de données (Prisma, schéma cible)

Entités principales (V1 complète ; construites progressivement par phase) :

- **User** (id, email, prénom, rôle, consentement marketing distinct + horodatage, dates).
- **Profile** — champs directs du §13 : statut du parcours, diplôme max, université, barreau étranger, objectif professionnel, préférence géographique, budget, financement, rentrée visée, anglais, statut US, commentaire. Champs inférés : années d'études validées, profil type, besoin probable de visa, mois avant rentrée, partenariats applicables, objectif de parcours, phase actuelle.
- **QuestionnaireSession / Answer** (versionnées ; le questionnaire évolue sans casser l'historique).
- **Rule** (Moteur A) : identifiant, condition (JSON), fait produit, bloc de texte associé, source officielle, date de vérification, version, statut actif/inactif. **Versionnée, modifiable sans code depuis le back-office.**
- **ViabilityAssessment** (Moteur B) : score 1-4 par axe (académique, financier, professionnel, calendrier, migratoire), facteurs bloquants, verdict (6 valeurs du §14.4), justifications par blocs.
- **Report** : statut (file d'attente → en revue → envoyé), blocs assemblés, reviewer, délai annoncé, PDF, horodatages. + **ReviewQueue** (capacité quotidienne, priorité payant, délai affiché dynamique : ≤10 → 48h ; 11-25 → 3 j ouvrés ; au-delà → limitation).
- **TextBlock** : blocs pré-rédigés versionnés, variables autorisées uniquement (prénom, université, dates, coûts, partenariats, phase, parcours type).
- **Partnership** (§27) : université FR, law school US, type d'avantage, conditions, procédure, deadline, source, date de vérification, statut. + métriques de taux de détection.
- **JourneyType** (5 parcours types §20) → contrôle phases, modules recommandés, tâches, échéances, alertes, offre recommandée.
- **RoadmapPhase / Task** (§22) : titre, explication, deadline, temps estimé, importance, statut (À faire / En cours / En attente d'un tiers / Complété / Bloqué / Non applicable), module associé, document associé.
- **Module / Lesson** (§25), **CostScenario** (§26, jusqu'à 3 comparés), **AlumniTrajectory** (§28), **VaultDocument** (§29, minimisation : CV, personal statements, listes d'écoles, documents de travail, checklists — jamais passeport/C&F/médical/financier sensible).
- **Offer / Purchase / Payment** (§30) : Free, Diagnostic (49-99 €, test 79 €, déduction 30 jours), Roadmap & Platform (399-699 €, 24 mois d'outils dynamiques), Guided (1 500-2 500 €), Concierge (sur candidature).
- **EmailEvent** (séquence §19), **MilestoneChallenge** (§24, 5 challenges, uniquement actions contrôlées par l'utilisateur), **CorrectionLog** (journal des corrections), **AuditLog**.

---

## 5. Les deux moteurs (cœur logique)

### Moteur A — Faits objectifs et voies préliminaires
- Automatique dès le lancement. Entrées : formation, durée d'études, statut professionnel, partenariats, calendrier, besoin de visa, scénarios de coût.
- Sorties : une **voie préliminaire** parmi : voie NY probablement fondée sur un LL.M. (sous réserve du BOLE) • voie directe potentielle à examiner • formation probablement insuffisante à ce stade • option alternative à examiner • cas nécessitant une revue humaine • informations insuffisantes.
- **Jamais d'éligibilité définitive.** Implémentation : table `Rule` évaluée séquentiellement, chaque règle traçable (source + date de vérification). Cas non couverts → « revue humaine » (jamais de fallback inventé).

### Moteur B — Viabilité (5 axes, notation 1-4)
1. Solidité académique (l'université ne doit pas être le seul critère)
2. Adéquation financière (budget faible → déclenche d'abord une recherche de financement)
3. Réalisme professionnel
4. Faisabilité du calendrier
5. Risque migratoire (neutralisé si aucun visa nécessaire ; plus prudent si « rester aux US » exigé)

**Plafonnement (pas de moyenne simple)** : un axe à 1/4 empêche « fortement pertinent » ; deux axes faibles → au minimum « planification importante » ; timeline critique → décale vers une rentrée ultérieure ; objectif flou → « à clarifier ». Verdicts : les 6 du §14.4, jamais présentés comme une probabilité de réussite.

---

## 6. Phasage de développement

### Phase 1A — Lancement bêta gratuite (~4-6 semaines)

**Objectif : 15-20 rapports gratuits pour calibrer le système.**

| Semaine | Livrables |
|---|---|
| S1 | Setup repo, Next.js + fonts + reset Tailwind v4 ; design system (§3) : `useInView`, keyframes, nav fixe, composants de base (CTA or, cartes, labels). **Landing complète à l'identique du site actuel**, enrichie des sections du §11 du CdC : hero (promesse + nom + photo + phrase parcours + CTA « Start Your Free Preliminary Assessment »), le problème (sources d'info fragmentées), la solution (8 items), le diagnostic (2 temps), le parcours couvert (timeline 5 étapes), aperçu dashboard, modules intégrés à la roadmap, offres (prix transparents + paiement fractionné visible), parcours du fondateur, FAQ (6 questions du §11.10), footer + disclaimers. |
| S2 | **Questionnaire** : 12 écrans max, 1 question/écran, barre de progression, 3-4 min cible, boutons/listes/cases uniquement, champ libre final facultatif. Logique conditionnelle (§12.4 : LL.M. inscrit, national US, licence « trop tôt », avocat). Stockage Profile (champs directs + inférés). |
| S3 | **Moteur A** (règles v1 dans la table `Rule`) + **Moteur B** (5 axes + plafonnement) + **page de résultat immédiat** (§15 : voie préliminaire, partenariats détectés, échéances, éléments migratoires généraux, fourchette de coût, limites de l'analyse + annonce du délai du rapport). Email transactionnel J+0 (Resend). |
| S4 | **Grille d'évaluation + bibliothèque de blocs de texte** (TextBlock) ; **outil interne d'assemblage du rapport** (semi-manuel : l'admin sélectionne/ajuste les blocs, variables autorisées seulement) ; export PDF 3-4 pages avec signature « Prepared by Corentin Saint-Girons, Founder… » et disclaimer recommandé (§7). File de rapports + délai dynamique (§18). |
| S5-6 | Back-office minimal (utilisateurs, questionnaires, règles, blocs, partenariats, file de rapports, journal des corrections) ; base de partenariats initiale ; mentions RGPD (politique de confidentialité, registre, consentement marketing distinct non pré-coché) ; mise en prod ; **bêta : 15-20 diagnostics gratuits**, mention « bêta » affichée, collecte du feedback. |

**Données à observer pendant la bêta** : temps de production, questions ambiguës, cas non prévus, qualité perçue, intérêt pour les offres, prix acceptable, fréquence des corrections.

**Critères de sortie 1A** : 15-20 rapports livrés ; grille et règles stabilisées ; temps de production/rapport mesuré ; landing conforme pixel/animation au site actuel (checklist §8 ci-dessous).

### Phase 1B — Diagnostic payant (~2-3 semaines)

- Stripe Checkout : rapport complet **79 €** (fourchette autorisée 49-99 €), résultat immédiat toujours gratuit.
- Mécanisme de **déduction des 79 € sur l'offre principale pendant 30 jours** (code de réduction lié au compte/à l'email).
- Tunnel de paiement conforme : contenu du rapport, délai, nature éducative et stratégique, absence de conseil juridique, mécanisme de déduction, rétractation, politique de remboursement.
- **Séquence email complète** (§19) : J+0 confirmation (+ lien de correction d'information), J+2 rapport (PDF, résumé, risques, offre recommandée, déduction + expiration), J+5 suivi court, J+12 contenu contextualisé selon le risque principal (financement / timeline / carrière / immigration / académique), J+25 rappel d'expiration. Base légale distincte pour les emails promotionnels.
- Priorité de la file aux rapports payants.

### Phase 2 — Plateforme payante (~8-10 semaines)

| Bloc | Contenu |
|---|---|
| Compte & achat | Auth.js, création de compte post-achat, offres Roadmap & Platform (399-699 €, accès 24 mois aux outils dynamiques + accès long aux contenus, renouvellement annuel réduit — distinction affichée avant achat §31), paiement 3-4× visible. |
| Dashboard (§21) | Première page post-connexion : phase actuelle, **Next Best Action**, échéances, progression, tâches, documents, module recommandé. Jamais une bibliothèque vidéo. |
| Roadmap (§22) | Génération depuis le parcours type (5 JourneyTypes) : 13 phases possibles, tâches complètes (titre, explication, deadline, temps estimé, importance, statut ×6, module lié, document lié). |
| Next Best Action (§23) | Action + raison + temps + date + risque du retard + lien ressource. Principe UX : jamais besoin de parcourir toute la roadmap pour savoir quoi faire aujourd'hui. |
| Modules v1 (§25.1) | Ordre de production : **Module 0** (décision), **Module 2** (choix du LL.M.), **Module 5** (BOLE), **Module 6** (bar prep) + vidéo d'introduction 5-10 min. Les autres modules selon la demande observée. |
| Simulateur de coût simple (§26) | Entrées : tuition, frais, ville, logement, assurance, transport, LSAC, traductions, visa, voyages, bar prep, examens, admission, retake, période sans revenu, bourses, partenariats. Sorties : coût académique / vie / bar / post-graduation / total / net. Jusqu'à 3 scénarios comparés. Aucun ROI garanti. |
| Vault v1 (§29) | CV, personal statements, listes d'écoles, documents de travail, checklists. Minimisation stricte. |

### Phase 3 — Automatisation & échelle (~8-12 semaines)

- Automatisation de l'assemblage du rapport (l'humain passe de rédacteur à relecteur ; revue humaine toujours obligatoire avant envoi ; second reviewer avec méthodologie écrite et dérogations documentées).
- **Milestone Challenges** (§24) : School List Completed, Applications Ready, BOLE File Prepared, Bar Registration Completed, Admission Package Prepared — uniquement des actions contrôlées par l'utilisateur. Gamification limitée à : progression par phases, checklists, NBA, challenges, statistiques personnelles. **Exclus : XP, niveaux, streaks, leaderboards, monnaie virtuelle, badges décoratifs.**
- Notifications (échéances, alertes de phase), modules complets (1, 3, 4, 7, 8, 9, 10), coaching intégré (offre Guided : 3-5 consultations, relectures définies, 6 ou 12 mois — jamais « illimité »), back-office avancé (§33 complet : matrices, roadmaps, offres, paiements, emails, consultations, analytics).
- Trajectoires d'alumni (§28) : base structurée, jamais présentée comme statistiques représentatives sans échantillon suffisant.

### Phase 4 — Expansion (hors périmètre de ce plan, décisions séparées)

Marketplace recruteurs, portail partenaires, international, app mobile, éventuelles fonctionnalités IA après décision séparée.

**Exclusions V1 (rappel §38)** : marketplace, app mobile native, IA visible, chatbot, consultations illimitées, traductions officielles par IA, soumission automatique aux autorités, vault sensible complet, gamification complexe, couverture de tous les barreaux.

---

## 7. RGPD & conformité (transverse, dès la Phase 1A)

- Responsable de traitement identifié, finalités, bases légales, durées de conservation, registre, liste des sous-traitants (Vercel, Stripe, Resend, hébergeur DB), droits des personnes (suppression + export en self-service), sécurité, gestion des incidents, transferts internationaux documentés, évaluation DPO/AIPD.
- Consentement marketing **distinct, facultatif, non pré-coché** ; emails d'exécution du service séparés des emails promotionnels.
- Minimisation des données du vault (§29) ; champs détaillés (mention, TOEFL exact, écoles…) demandés **après** le premier questionnaire seulement.
- Disclaimers systématiques : résultat immédiat, rapport, emails, tunnel de paiement, footer. Jamais « attorney-reviewed », jamais d'avis juridique.

---

## 8. Qualité — checklists de validation

### Design/animations (avant chaque mise en prod de page)
1. À froid en haut de page : nav transparente ; cascade hero badge → titre → sous-titre → boutons en 1,2 s ; mot doré en shimmer 4 s.
2. À 41 px de scroll : fond de nav fond en 0,4 s vers rgba(10,22,40,0.97) + blur 24 px ; bordure or apparaît d'un coup.
3. Section Défi : label puis titre fondent (0,8 s) ; les 4 cartes apparaissent sans fondu ; hover = inversion navy 0,3 s, chiffre doré.
4. Section Solution : cascade gauche 0→0,3 s ; colonne droite glisse de 40 px en bloc, +0,2 s.
5. Section Parcours : 5 lignes depuis la gauche à 0,10/0,22/0,34/0,46/0,58 s ; pastilles en onde pulse-gold (2,5 s, décalage 0,4 s).
6. Remonter la page : **rien ne se rejoue**.
7. `prefers-reduced-motion: reduce` : tout instantané, shimmer et pulse une seule itération.

### Produit (par phase)
- Questionnaire : ≤12 écrans, ≤5 min réel, aucune ressaisie post-achat, logique conditionnelle testée sur les 7 profils prioritaires (§9).
- Moteurs : chaque règle a source + date de vérification ; cas ambigus → revue humaine, jamais d'improvisation ; plafonnement testé (axe à 1/4, deux axes faibles, timeline critique, objectif flou).
- Rapport : 3-4 pages, blocs validés uniquement, variables autorisées uniquement, revue humaine obligatoire, signature et disclaimer conformes (§7 CdC).
- Copies : aucun vocabulaire de garantie de résultat, aucune promesse d'emploi/visa/admission.

---

## 9. Métriques (instrumentées dès la Phase 1A)

Taux de démarrage du questionnaire, taux de complétion, taux d'ouverture du rapport, **conversion rapport → achat comparée au temps humain par utilisateur (métrique centrale)**, temps de production du rapport, marge par offre, taux de détection des partenariats, corrections humaines, temps avant première tâche, progression, satisfaction.

---

## 10. Risques & points de vigilance

| Risque | Mitigation |
|---|---|
| Dérive juridique (perçu comme conseil juridique) | Blocs de texte validés, disclaimers systématiques, revue de copies, jamais de « Esq. », services juridiques strictement séparés (§32). |
| Goulot d'étranglement humain sur les rapports | File + capacité quotidienne + délai dynamique + alertes (§18) ; automatisation seulement en Phase 3. |
| Sur-ingénierie précoce | Gate de phase : rien de la Phase 2 avant la fin de la bêta 1A ; chaque fonctionnalité justifiée par le §1. |
| Règles obsolètes (BOLE, visas, partenariats) | Chaque règle/partenariat porte source + date de vérification + version ; revue périodique dans le back-office. |
| Dérive du design sur les nouvelles pages | Design system unique (§3.9) + checklist animations obligatoire ; interdits du §3.8. |
| RGPD (emails, vault, données sensibles) | Consentement distinct, minimisation, self-service suppression/export dès la 1A. |

---

## 11. Prochaines actions immédiates

1. Initialiser le projet Next.js (App Router, React 19, fonts, reset Tailwind v4) et le design system §3.
2. Reconstruire la landing à l'identique (structure actuelle du site) puis l'enrichir des sections manquantes du §11 du CdC (aperçu dashboard, offres, fondateur, FAQ).
3. Construire le questionnaire 12 écrans + Profile.
4. Implémenter Moteur A/Moteur B v1 + page de résultat immédiat + email J+0.
5. Créer la bibliothèque de blocs + l'outil interne d'assemblage du rapport PDF.
6. Lancer la bêta (15-20 rapports gratuits) et calibrer.
