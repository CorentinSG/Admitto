# Plan de construction détaillé — Plateforme LL.M. & Barreau américain (Admitto)

> Document d'ingénierie dérivé du **Cahier des charges v1.0 (juillet 2026)** de Corentin Saint-Girons.
> Source de vérité produit : le cahier des charges. Source de vérité design : le site existant
> **https://admitto.nanocorp.app/** et le document « Système d'animation du site Admitto ».
> En cas d'ambiguïté substantielle (règle juridique, éligibilité, promesse commerciale, workflow),
> **signaler l'ambiguïté au lieu d'improviser** (CDC §1).

---

## 0. Principes directeurs (non négociables)

1. **Service expert productisé d'abord, plateforme automatisée ensuite.** Le code suit les
   apprentissages du terrain (CDC §2). On ne construit pas la Phase 2 avant d'avoir validé la
   Phase 1 par 15–20 rapports réels.
2. **Aucune IA générative visible** dans l'expérience utilisateur V1 (CDC §8). Personnalisation =
   règles déterministes + matrices + blocs de texte pré-rédigés + revue humaine.
3. **Jamais de promesse de résultat.** Pas de « éligible », « garanti », « attorney-reviewed »,
   pas de signature « Esq. ». Disclaimers systématiques (CDC §6, §7).
4. **Une seule expérience continue** : questionnaire → résultat → rapport → plateforme payante
   partagent le même profil ; aucune ressaisie après achat (CDC §10).
5. **Design identique au site Admitto existant** : mêmes palette, typographies, animations,
   conventions de code (voir §2 et §3 ci-dessous).
6. **Minimisation des données** (RGPD, CDC §29 et §34).

---

## 1. Stack technique

| Couche | Choix | Justification |
|---|---|---|
| Framework | **Next.js (App Router) + React 19 + TypeScript** | Identique au site existant (le design doit être reproduit à l'identique) ; SSR pour le SEO (CDC §35). |
| Styling | **Styles inline dans le JSX** + Tailwind v4 pour le reset/preflight uniquement | Convention du site existant. Pas de librairie UI, pas de classes utilitaires dans le markup marketing. Pour l'app privée (dashboard), on peut factoriser via des objets de style partagés (`styles.ts`), mais on garde la même palette/typo. |
| Animations | **Aucune librairie** (ni Framer Motion, ni GSAP, ni Lenis). IntersectionObserver + useState + transitions CSS inline + 2 @keyframes (`shimmer`, `pulse-gold`) | Contrat strict du document d'animations (voir §3). |
| Polices | `Cormorant Garamond` (titres, italiques) + `DM Sans` (corps) via `next/font` | Identique au site. |
| Base de données | **PostgreSQL** (Neon ou Supabase) + **Prisma** | Modèle relationnel riche (règles versionnées, partenariats, roadmap). |
| Auth | **Auth.js (NextAuth)** — email magic link + mot de passe | Compte créé seulement à l'achat (CDC §10) ; le questionnaire reste sans compte. |
| Paiement | **Stripe Checkout + webhooks** (Phase 1B) | Paiement 3–4×, déduction des 79 € via coupon/credit automatisé. |
| Emails | **Resend** (transactionnel) + templates React Email | Séquence J+0 → J+25 (CDC §19) ; séparation stricte transactionnel / marketing. |
| PDF du rapport | Rendu HTML → PDF (page `@react-pdf` ou Playwright print) avec la charte Admitto | Rapport 3–4 pages signé « Founder » (CDC §7, §17). |
| Hébergement | **Vercel** (comme le site actuel `*.nanocorp.app`) | Continuité de déploiement. |
| Analytics | Plausible ou Vercel Analytics + tables d'événements internes | Métriques du CDC §36 sans cookies invasifs. |

**Arborescence cible du repo :**

```
/app
  /(marketing)          # pages publiques — design Admitto strict
    page.tsx            # homepage
    /diagnostic         # questionnaire (12 écrans max)
    /resultat           # résultat préliminaire immédiat
    /offres             # pricing
    /faq
    /a-propos           # parcours du fondateur
  /(app)                # espace payant — layout authentifié
    /dashboard
    /roadmap
    /modules/[slug]
    /simulateur
    /documents          # vault
    /compte
  /(admin)              # back-office (CDC §33)
  /api                  # webhooks Stripe, Resend, cron
/lib
  /engine-a             # Moteur A : faits objectifs & voies préliminaires
  /engine-b             # Moteur B : viabilité (5 axes + plafonnement)
  /rules                # règles versionnées (chargées depuis la DB)
  /report               # assemblage du rapport à partir des blocs
/design
  tokens.ts             # palette, typo, ombres — copie exacte du site
  animations.tsx        # useInView, keyframes, styles nav/hero
/prisma
  schema.prisma
/content
  /blocks               # blocs de texte pré-rédigés (MDX/JSON) versionnés
  /modules              # contenus pédagogiques
```

---

## 2. Design system — copie exacte du site Admitto

Le design de **toutes** les pages (marketing, questionnaire, dashboard, rapport PDF, emails)
reprend le système du site existant.

### 2.1 Palette (à réutiliser telle quelle)

```
--navy-900  #0A1628    --navy-800  #0E1D3A    --navy-700  #142240    --navy-600  #1E3561
--ivory     #FAFAF7    --slate     #3D4F6B
--gold      #C9A84C    --gold-light #E8C87A
```

- Sections sombres : dégradés navy `linear-gradient(160deg, #0A1628 0%, #142240 …, #0E1D3A …)`
  + radial-gradients navy/gold en couches (cf. hero et CTA finale du site).
- Sections claires : fond `#FAFAF7`, texte `#0A1628`, secondaire `#3D4F6B`.
- Accent unique : l'or `#C9A84C` → `#E8C87A` (boutons, labels, pastilles, filets).

### 2.2 Typographies

- **Cormorant Garamond, serif** : h1/h2, chiffres décoratifs (3.5rem, weight 300), italiques dorés.
- **DM Sans, sans-serif** : corps, labels (uppercase, letter-spacing 0.06em+), boutons.

### 2.3 Composants récurrents (repris du site)

- **Nav fixe 72 px**, padding `0 8%`, transparente en haut de page, `rgba(10,22,40,0.97)` +
  `blur(24px)` + bordure `rgba(201,168,76,0.14)` après 40 px de scroll (transition 0.4s ease sur
  fond/blur, bordure sèche — quirk à conserver, voir §3).
- **Badge** « ✦ LABEL » (fond `rgba(201,168,76,0.12)`, texte doré, uppercase).
- **Ligne de label de section** : trait doré 40×1 px + libellé uppercase.
- **Boutons dorés** : `linear-gradient(135deg, #C9A84C 0%, #E8C87A 100%)`, texte `#0A1628`,
  padding `18px 44px`, uppercase, `letter-spacing 0.06em` ; hover = `translateY(-2px)` + ombre dorée.
- **Cartes claires à filets** : grille `gap:1px` sur fond `rgba(10,22,40,0.08)` (le gap fait office
  de séparateur), hover = inversion complète vers navy en 0.3 s.
- **Timeline verticale** : pastilles dorées 10 px + fil 1 px en dégradé doré, pulse `pulse-gold`.
- **Cercles décoratifs statiques** (bordures dorées à 5–7 % d'opacité) dans les sections sombres.
- Padding de section standard : `120px 8%` (hero : `140px 8% 100px`, min-height 100vh).

Ces tokens sont centralisés dans `/design/tokens.ts` et importés partout (y compris rapport PDF
et emails) pour garantir l'unité visuelle exigée par le CDC §5 (« crédibilité d'un cabinet,
clarté d'un outil de gestion de projet, fluidité d'un produit moderne »).

---

## 3. Système d'animation — contrat strict

Reproduction **à l'identique** du document « Système d'animation du site Admitto ».
Fichier unique `/design/animations.tsx`.

### 3.1 La primitive unique

```tsx
function useInView(threshold = 0.12) {
  const [inView, setInView] = useState(false);
  const ref = useCallback((node) => {
    if (!node) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setInView(true); io.disconnect(); } // one-shot
      },
      { threshold }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);
  return [ref, inView];
}
```

Règles : **ref callback** (pas useRef+useEffect), `io.disconnect()` dès la première intersection
(jamais de re-trigger ni d'animation de sortie), `threshold` seul (pas de rootMargin), deps `[]`.
Opacité écrite `opacity: +!!flag`, transform `flag ? "translateY(0)" : "translateY(30px)"`.

### 3.2 Réglages globaux

- `html { scroll-behavior: smooth; }` — ancres `#problematique`, `#solution`, `#parcours`, `#commencer`.
- `body { transition: opacity 0.2s ease-in; }` — fade-in au chargement.
- `@media (prefers-reduced-motion: reduce)` : durées à 0.01 ms, itérations à 1.
- **4 keyframes exactement** : `shimmer` (4 s, boucle infinie sur l'italique doré du h1),
  `pulse-gold` (halo 0→8 px, 2.5 s infini), `fadeInUp` et `fadeIn` **déclarées mais non utilisées**.
- **Easing : `ease` uniquement.** Aucune cubic-bezier, aucun spring, aucun will-change.

### 3.3 Cadences par section (thresholds & delays)

| Section | threshold | Pattern |
|---|---|---|
| Hero | 0.05 | Cascade badge → h1 → p → CTAs : delays 0/0.1/0.2/0.3 s, durées 0.8–0.9 s (total 1.2 s). Shimmer indépendant du scroll. Indicateur « défiler » statique. |
| Le Défi | 0.08 | Label (opacity 0.8s) puis h2 (0.8s +0.1s, translateY 20px). **Quirk à conserver** : les cartes n'animent que `background-color 0.3s` → opacité/transform basculent instantanément malgré les delays 0.1–0.4 s. |
| La Solution | 0.08 | Colonne gauche en cascade 0→0.3 s ; colonne droite = **le conteneur entier** glisse de `translateX(40px)` (0.8s ease 0.2s), aucun stagger interne. |
| Le Parcours | 0.05 | 5 lignes en stagger horizontal depuis la gauche (−24 px, 0.7 s, delays 0.10/0.22/0.34/0.46/0.58 s). Pastilles : `pulse-gold 2.5s ease infinite ${0.4*i}s` — `animation: none` tant que la section n'est pas vue. Fil vertical statique. |
| CTA finale | 0.08 | Badge → h2 → p → CTA (translateY 24px) → disclaimer : delays 0/0.1/0.2/0.3/0.45 s. |

### 3.4 Micro-interactions

Tous les hovers passent par `onMouseEnter/onMouseLeave` mutant `e.currentTarget.style`
(aucun `:hover` CSS) ; transitions déclarées inline :

- CTAs dorés : `transform 0.2s, box-shadow 0.2s` → `translateY(-2px)` + ombre dorée (flou 40–50 px).
- CTA secondaire : `all 0.2s` → bordure `rgba(201,168,76,0.5)`, texte blanc.
- Cartes « Défi » : inversion navy 0.3 s (carte `#0A1628`, chiffre doré, titre blanc, desc `rgba(255,255,255,0.6)`).
- Items liste Solution : `all 0.2s` → fond `rgba(201,168,76,0.05)`, bordure `rgba(201,168,76,0.42)`.
- Liens footer : `color 0.2s`.

### 3.5 Interdits

Pas de parallax, pas de scroll-driven animation, pas d'animation de sortie, pas de librairie,
pas d'easing custom, pas de blur/scale/rotate à l'entrée, pas de curseur custom, pas de compteur
animé, pas d'animation sur les cercles décoratifs / fil de timeline / indicateur défiler.

**Extension aux nouvelles pages** : le questionnaire, le dashboard et les modules réutilisent
exclusivement ces primitives (useInView + cascades opacity/translateY, mêmes durées et delays,
mêmes hovers). Aucun nouveau pattern d'animation ne doit être inventé.

---

## 4. Modèle de données (Prisma / PostgreSQL)

```
User            id, email, firstName, role (USER|ADMIN|REVIEWER), createdAt, consentMarketing(bool, horodaté)
Lead            id, email, firstName, source, createdAt          # avant création de compte
Questionnaire   id, leadId?, userId?, version, startedAt, completedAt, answers (JSONB normalisé)
Profile         id, questionnaireId — champs directs (statut parcours, diplôme max, université,
                barreau étranger, objectif pro, préférence géo, budget, financement, rentrée visée,
                anglais, statut US, prénom, email, commentaire)
                + champs inférés (années d'études validées, profilType, besoinVisa,
                moisAvantRentree, partenariatsApplicables, objectifParcours, phaseActuelle)
Rule            id, code, condition (JSON), factProduced, textBlockId, sourceUrl,
                verifiedAt, version, active(bool)                 # Moteur A — versionné, éditable sans code
TextBlock       id, code, locale, body, version, active           # blocs pré-rédigés
Assessment      id, profileId, engineAOutput (voie préliminaire + faits),
                engineBOutput (5 axes 1–4 + plafonnement + verdict), computedAt, rulesSnapshot
Report          id, assessmentId, status (QUEUED|IN_REVIEW|SENT), pdfUrl, reviewerId,
                reviewedAt, sentAt, priority (PAID|FREE), correctionsLog (JSONB)
ReportQueue     capacité quotidienne, délai affiché, alertes      # CDC §18
Partnership     id, universitéFR, lawSchoolUS, typeAvantage, conditions, procédure,
                deadline, sourceUrl, verifiedAt, status           # CDC §27
AlumniPath      id, formation, école, coût, bourse, visa, bar, emploi, erreurs, conseils, anonymisé
Offer           id, code (FREE|DIAGNOSTIC|PLATFORM|GUIDED|CONCIERGE), prix, périmètre, actif
Purchase        id, userId, offerId, stripeId, montant, paiementNx, deductionAppliquée, expiresAt
Journey         id (profil type) : PRE_LLM_EXPLORER | LLM_APPLICANT | CURRENT_LLM_STUDENT |
                BAR_CANDIDATE | FOREIGN_QUALIFIED_LAWYER          # CDC §20
Phase           13 phases de roadmap (Clarification → Stratégie post-admission)   # CDC §22
Task            id, userId, phaseId, titre, explication, deadline, tempsEstimé, importance,
                statut (A_FAIRE|EN_COURS|EN_ATTENTE_TIERS|COMPLETE|BLOQUE|NON_APPLICABLE),
                moduleId?, documentId?
Milestone       5 challenges (School List Completed, Applications Ready, BOLE File Prepared,
                Bar Registration Completed, Admission Package Prepared)            # CDC §24
Module          id, slug (0–10), titre, contenu, vidéos, ordre de production
CostScenario    id, userId, inputs (tuition, ville, logement, LSAC, bar prep, retake, …),
                outputs (coût académique / vie / bar / post-grad / total / net), max 3 par user
Document        id, userId, type (CV|PERSONAL_STATEMENT|SCHOOL_LIST|WORKING_DOC|CHECKLIST),
                storageKey  # types sensibles refusés à l'upload (CDC §29)
EmailEvent      id, leadId/userId, type (J0|J2|J5|J12|J25|…), sentAt, openedAt
AuditLog        journal des corrections humaines et des dérogations                # CDC §18, §33
```

Points structurants :
- **`rulesSnapshot`** sur chaque Assessment : la version exacte des règles utilisées est figée
  (traçabilité exigée CDC §14.1 — identifiant, condition, source, date de vérification, version).
- Les **règles et blocs de texte sont en base**, éditables depuis le back-office **sans code** (CDC §33).
- Le vault **refuse** passeport, Character & Fitness, documents médicaux/disciplinaires,
  données financières sensibles, dossiers visa complets (CDC §29).

---

## 5. Les deux moteurs (lib/engine-a, lib/engine-b)

### Moteur A — faits objectifs & voie préliminaire (100 % automatique dès le lancement)
- Entrées : formation, durée d'études, statut pro, partenariats, calendrier, visa, coûts.
- Sorties : une voie parmi **6 catégories** (NY via LL.M. sous réserve BOLE / voie directe à
  examiner / formation probablement insuffisante / alternative à examiner / revue humaine /
  informations insuffisantes) + faits + blocs de texte sourcés.
- Implémentation : évaluateur de règles JSON (`condition` → `fact`), pur et testable ;
  chaque règle porte id, condition, fait, bloc, source, date de vérification, version, statut.
- **Jamais de conclusion d'éligibilité définitive.**

### Moteur B — viabilité (5 axes, notés 1–4)
1. Solidité académique (l'université n'est pas le seul critère)
2. Adéquation financière (budget faible → déclenche d'abord une recherche de financement)
3. Réalisme professionnel
4. Faisabilité du calendrier (mois restants, TOEFL, deadlines, BOLE, bar)
5. Risque migratoire (neutralisé si aucun visa nécessaire ; durci si « rester aux US » exigé)

**Plafonnement (pas de moyenne simple)** : un axe à 1/4 interdit « fortement pertinent » ;
deux axes faibles ⇒ au minimum « planification importante » ; timeline critique ⇒ décale la
rentrée ; objectif flou ⇒ « à clarifier ». Verdicts : les 6 du CDC §14.4, jamais présentés
comme une probabilité de réussite.

**Tests** : suite de cas-types (un par profil du CDC §9 + cas limites) exécutée en CI ; tout
changement de règle doit faire tourner la suite et produire un diff des verdicts.

---

## 6. Plan de développement par phases

### Phase 1A — Bêta gratuite (Sprints 1–4, ~4–6 semaines)

**Objectif : 15–20 rapports gratuits pour calibrer** (CDC §16.1). Paiement non activé.

| Sprint | Livrables |
|---|---|
| **S1 — Socle & design system** | Init Next.js App Router + TS + Prisma + Postgres. Portage exact du design system (`tokens.ts`, `animations.tsx`, nav, boutons, cartes, timeline). Storybook léger ou page `/dev/ui` pour valider pixel par pixel contre le site existant. Checklist d'animation §3 validée au navigateur. |
| **S2 — Homepage** | Les 10 blocs du CDC §11 dans la structure du site actuel : Hero (promesse + nom + photo + phrase parcours + CTA « Start Your Free Preliminary Assessment »), Le problème (cartes à inversion navy), La solution (2 colonnes, liste glissant de droite), Le diagnostic (2 temps), Le parcours couvert (timeline 5+ étapes avec pulse-gold), Aperçu dashboard, Modules intégrés à la roadmap, Offres (prix transparents, paiement en plusieurs fois visible), Parcours du fondateur, FAQ (6 questions du CDC §11.10). SEO de base (métadonnées, sitemap). |
| **S3 — Questionnaire + profil + Moteur A** | 12 écrans max, 1 question/écran, barre de progression, boutons/listes/cases (aucun champ libre obligatoire, 1 facultatif final), cible 3–4 min. Logique conditionnelle (§12.4 : inscrit LL.M., national US, licence « trop tôt », avocat). Persistance Lead+Questionnaire+Profile, champs inférés. Moteur A + règles seed + page **résultat immédiat** (voie préliminaire, partenariats, échéances, éléments migratoires, fourchette de coût, limites de l'analyse + rappel autorités compétentes). Email transactionnel J+0. |
| **S4 — Moteur B + rapport + mini back-office** | Moteur B (5 axes + plafonnement). Assemblage du rapport 3–4 pages depuis les blocs (variables : prénom, université, dates, coûts, partenariats, phase, parcours type). Rendu PDF charte Admitto, signature « Prepared by Corentin Saint-Girons, Founder… » + disclaimer exact du CDC §7. Back-office minimal : file de rapports, édition des blocs avant envoi, marquage revu/envoyé, journal des corrections. File de capacité (délais 48 h / 3 j ouvrés / limitation, CDC §18). Bandeau « bêta » + demande de feedback. |

**Données à observer pendant la bêta** : temps de production, questions ambiguës, cas non prévus,
qualité perçue, intérêt pour les offres, prix acceptable, fréquence des corrections (CDC §16.1).

**Critères de sortie de la Phase 1A** : 15–20 rapports livrés ; grille et règles stabilisées ;
temps de production par rapport mesuré ; homepage conforme pixel/animation au site actuel
(checklist §10 validée). **La Phase 2 ne démarre pas avant.**

### Phase 1B — Diagnostic payant (Sprints 5–6, ~2–3 semaines)

- Stripe Checkout : rapport à **79 €** (test dans la fourchette 49–99 €), résultat immédiat
  toujours gratuit.
- Mécanisme de **déduction des 79 € pendant 30 jours** sur l'offre principale (crédit/coupon
  automatique, date d'expiration stockée).
- Tunnel de paiement conforme : contenu du rapport, délai, nature éducative et stratégique,
  absence de conseil juridique, mécanisme de déduction, rétractation, remboursement (CDC §16.2).
- **Séquence email complète** J+0 confirmation / J+2 rapport PDF + offre + déduction /
  J+5 suivi court / J+12 ressource liée au risque principal / J+25 rappel expiration (CDC §19).
  Base légale : transactionnel séparé du promotionnel, consentement marketing distinct,
  facultatif, non pré-coché (CDC §34).
- Priorité de file aux rapports payants.

### Phase 2 — Plateforme payante (Sprints 7–12, ~8–10 semaines)

- **Compte & achat** : Auth.js, création de compte à l'achat, reprise automatique du profil
  (zéro ressaisie). Offres Roadmap & Platform (399–699 €) et Guided (1 500–2 500 €),
  paiement 3–4× visible, périmètres et durées d'accès affichés avant achat (24 mois d'outils
  dynamiques, accès long aux contenus, renouvellement annuel réduit — CDC §30–31).
- **Dashboard** (première page après connexion — pas une bibliothèque vidéo) : phase actuelle,
  **Next Best Action** (action, raison, temps, date, risque de retard, lien ressource),
  échéances, progression, tâches, documents, module recommandé (CDC §21, §23).
- **Roadmap personnalisée** : 13 phases, tâches générées par parcours type (5 journeys),
  6 statuts, deadlines calculées depuis la rentrée visée.
- **Gamification professionnelle uniquement** : phases, checklists, NBA, 5 Milestone Challenges
  (actions contrôlées par l'utilisateur seulement), statistiques personnelles. Exclus : XP,
  niveaux, streaks, leaderboards, monnaie, badges décoratifs (CDC §24).
- **Modules** : vidéo d'introduction 5–10 min, puis production dans l'ordre **0 → 2 → 5 → 6**
  (décision, choix LL.M., BOLE, bar prep) ; les autres selon la demande observée (CDC §25).
  Modules présentés comme ressources intégrées à la roadmap.
- **Simulateur de coût** : 17 postes d'entrée (tuition → partenariats), 6 sorties (académique,
  vie, bar, post-grad, total, net), comparaison de 3 scénarios max, aucun ROI garanti (CDC §26).
- **Document vault** minimal (5 types autorisés, refus des types sensibles).
- Base **partenariats** consultable + mesure du taux de détection (CDC §27) ;
  base **trajectoires d'alumni** (sans présentation statistique non représentative, CDC §28).

### Phase 3 — Industrialisation (Sprints 13+)

- Semi-automatisation de l'assemblage du rapport (revue humaine conservée), Milestone
  Challenges actifs, notifications d'échéances, modules complets, coaching intégré
  (réservation de consultations, périmètre défini, jamais « illimité »), back-office avancé
  (matrices, analytics, gestion des consultations).

### Phase 4 — Extensions (hors périmètre de ce plan)

Marketplace recruteurs, portail partenaires, expansion internationale, app mobile, IA éventuelle
**après décision séparée** (CDC §37–38).

**Exclusions V1 (rappel CDC §38)** : marketplace de recrutement, application mobile native,
IA visible, chatbot, consultations illimitées, traductions officielles par IA, soumission
automatique aux autorités, vault sensible complet, gamification complexe, couverture de tous
les barreaux.

---

## 7. Spécifications page par page (V1)

### 7.1 Homepage (`/`)
Structure = site Admitto actuel étendu aux 10 blocs du CDC §11, dans cet ordre :
nav fixe → Hero (fond 3 couches radial/linear navy-gold, cercles décoratifs statiques, badge ✦,
h1 avec italique shimmer, photo + nom + phrase du fondateur, CTA principal pulse « Start Your
Free Preliminary Assessment » + CTA secondaire) → Le problème (`#problematique`, ivory, cartes
1px-gap, inversion navy au hover — sources de confusion : universités, LSAC, BOLE, forums,
consultants…) → La solution (`#solution`, navy, liste des 8 capacités glissant depuis la droite)
→ Le diagnostic en 2 temps → Le parcours couvert (`#parcours`, timeline stagger + pulse-gold)
→ Aperçu du dashboard (mockup dans la charte) → Modules & outils → Offres (transparentes,
paiement en plusieurs fois) → Le parcours du fondateur (expérience, erreurs, apprentissages,
raison d'être) → FAQ (accordéon sobre) → CTA finale (`#commencer`) → footer.
Chaque contenu conduit vers le **diagnostic gratuit**, pas vers les offres chères (CDC §35).

### 7.2 Questionnaire (`/diagnostic`)
- 12 écrans max (§12.3), une question par écran, barre de progression dorée sur navy,
  transitions entre écrans = fade/translateY aux cadences du hero (0.8–0.9 s ease).
- Boutons de réponse = style « item liste Solution » (bordure dorée 0.14 → 0.42 au hover/sélection).
- Écran 12 : prénom + email + explication claire du livrable + champ facultatif.
- Sauvegarde progressive (reprise possible), validation côté serveur, honeypot anti-spam.

### 7.3 Résultat immédiat (`/resultat`)
Page navy/ivory : voie préliminaire (badge), partenariats détectés, échéances principales,
éléments migratoires généraux, fourchette de coût, **limites de l'analyse** + rappel que seules
les autorités compétentes décident + annonce du délai du rapport (dynamique selon la file §18).

### 7.4 Dashboard (`/dashboard`)
Hiérarchie : 1) carte « Phase actuelle » ; 2) carte **Next Best Action** (la plus proéminente,
CTA doré) ; 3) échéances ; 4) barre de progression par phase ; 5) tâches du moment ;
6) documents ; 7) module recommandé. Impression immédiate de clarté, contrôle, priorisation.

### 7.5 Back-office (`/(admin)`)
Utilisateurs, questionnaires, file de rapports (avec capacité/alertes/délai dynamique), éditeur
de règles versionnées (activer/désactiver, sources, dates de vérification), blocs de texte,
matrices, partenariats, roadmaps types, modules, offres, paiements, emails, consultations,
documents, journal des corrections, analytics. **Toute règle réglementaire modifiable sans code.**

---

## 8. Conformité, RGPD, garde-fous (transverse, dès S1)

- Disclaimers du CDC §7 : pied du rapport, tunnel de paiement, FAQ, footer, emails.
- Interdictions de vocabulaire encodées dans une checklist de revue de contenu : pas de
  « garanti », « éligible » (au sens définitif), « attorney-reviewed », « Esq. », pas de
  probabilité de réussite.
- RGPD (CDC §34) : registre des traitements, finalités et bases légales par table, durées de
  conservation, DPA des sous-traitants (Vercel, Neon/Supabase, Stripe, Resend), pages
  confidentialité + mentions, export et suppression de compte en self-service, sécurité
  (chiffrement au repos, RBAC admin), procédure incident, évaluation DPO/AIPD documentée.
- Coaching ≠ service juridique : offres, engagements, tarification et confidentialité séparés ;
  vérification de conflits pour tout service juridique distinct (CDC §32).

---

## 9. Métriques (instrumentées dès la Phase 1A)

Événements : démarrage/complétion questionnaire, ouverture du rapport, conversion
rapport→achat, temps de production du rapport, temps humain par client, marge par offre,
taux de détection des partenariats, corrections humaines, temps avant première tâche,
progression, satisfaction. **Métrique centrale : conversion rapport→achat rapportée au temps
humain nécessaire** (CDC §36) — tableau de bord dédié dans le back-office.

---

## 10. Definition of Done — design, animations & produit

### 10.1 Design/animations — avant toute mise en ligne d'une page, valider la checklist du document d'animations :

1. Nav transparente à froid ; cascade hero badge→titre→sous-titre→boutons en 1,2 s ;
   mot doré en shimmer 4 s.
2. À 41 px de scroll : fond de nav fondu 0,4 s vers `rgba(10,22,40,0.97)` + blur 24 px,
   bordure dorée apparaissant d'un coup.
3. Section Défi : label puis titre fondent 0,8 s ; cartes sans fondu (quirk conservé) ;
   hover = inversion navy 0,3 s, chiffre doré.
4. Section Solution : cascade gauche 0→0,3 s ; colonne droite glisse en bloc de 40 px (delay 0,2 s).
5. Section Parcours : 5 lignes à 0,10/0,22/0,34/0,46/0,58 s ; pastilles en onde 2,5 s (décalage 0,4 s).
6. Remonter la page : rien ne se rejoue.
7. `prefers-reduced-motion` : tout instantané, shimmer/pulse une seule itération.
8. Palette/typo strictement conformes à §2 (aucune couleur hors tokens).

### 10.2 Produit — par phase

- **Questionnaire** : ≤ 12 écrans, ≤ 5 min en réel, aucune ressaisie post-achat, logique
  conditionnelle testée sur les 7 profils prioritaires du CDC §9.
- **Moteurs** : chaque règle porte source + date de vérification ; cas ambigus → catégorie
  « revue humaine », jamais d'improvisation ; plafonnement testé (axe à 1/4, deux axes faibles,
  timeline critique, objectif flou).
- **Rapport** : 3–4 pages, blocs validés uniquement, variables autorisées uniquement
  (prénom, université, dates, coûts, partenariats, phase, parcours type), revue humaine
  obligatoire avant envoi, signature et disclaimer conformes au CDC §7.
- **Copies** : aucun vocabulaire de garantie de résultat, aucune promesse d'emploi, de visa,
  de bourse ou d'admission ; aucun verdict présenté comme une probabilité de réussite.

---

## 11. Risques & points de vigilance

| Risque | Mitigation |
|---|---|
| Dérive vers l'automatisation prématurée | Gate explicite : Phase 2 ne démarre qu'après 15–20 rapports bêta et validation des règles. |
| Règles juridiques obsolètes (BOLE, visas) | Dates de vérification obligatoires sur chaque règle/partenariat + alerte back-office au-delà de N mois. |
| Pic de demandes de rapports | File de capacité + délai affiché dynamique + limitation temporaire (CDC §18). |
| Divergence de design entre marketing et app | Tokens/animations centralisés, checklist §10 en revue de PR. |
| Confusion service éducatif / conseil juridique | Disclaimers systématiques + checklist vocabulaire + revue humaine de chaque rapport. |
| Ambiguïté d'une règle ou d'un cas utilisateur | Catégorie « revue humaine » du Moteur A + signalement explicite (jamais d'improvisation). |

---

## 12. Prochaines actions immédiates

1. Valider ce plan et les choix de stack (§1) avec le fondateur.
2. Sprint 1 : initialiser le projet, porter le design system et faire valider la page `/dev/ui`
   contre le site existant (pixel + checklist animations).
3. Rédiger les premières règles du Moteur A et les blocs de texte du rapport (contenu à fournir
   par le fondateur, structuré selon §14.1 du CDC).
4. Constituer la liste initiale des partenariats universités FR ↔ law schools US.
5. Lancer la bêta (15–20 diagnostics gratuits) et instrumenter les métriques du §9.
