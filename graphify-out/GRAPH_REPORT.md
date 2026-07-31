# Graph Report - /home/user/Admitto  (2026-07-31)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1425 nodes · 3390 edges · 79 communities (72 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0e5d77e5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- derive.ts
- client.ts
- ecoles/page.tsx
- email/run.test.ts
- dashboard/page.tsx
- (marketing)/page.tsx
- stores.test.ts
- matrices/page.tsx
- scripts
- partenariats/page.tsx
- tokens.ts
- blocks.ts
- exhaustive.test.ts
- timeline.ts
- assemble.ts
- legal.ts
- compilerOptions
- admin/consultations/page.tsx
- devDependencies
- booking.ts
- assessments.ts
- Questionnaire.tsx
- engine-a/types.ts
- score.ts
- auth.ts
- metriques/page.tsx
- resultat/[id]/page.tsx
- rapports/[id]/page.tsx
- roadmap/page.tsx
- auth.config.ts
- reports.ts
- paiement/[id]/page.tsx
- deduction.ts
- current.ts
- stripe.ts
- dependencies
- modules.ts
- verify-dashboard.mjs
- verify-simulator.mjs
- AssessmentStore
- verify-backoffice.mjs
- verify-matrices.mjs
- rapport/[id]/page.tsx
- eligibility.ts
- check-legal.mjs
- verify-acces.mjs
- verify-accessibilite.mjs
- verify-degraded.mjs
- admin/page.tsx
- app/consultations/page.tsx
- desinscription/[id]/page.tsx
- wait.mjs
- verify-checkout.mjs
- verify-consultations.mjs
- verify-ecoles.mjs
- verify-espace.mjs
- import-partnerships.mjs
- verify-legal.mjs
- check-vocabulary.mjs
- verify-questionnaire.mjs
- verify-all.mjs
- package.json
- .prettierrc.json
- check-design-tokens.mjs
- check-rules.mjs
- check-suites.mjs
- verify-animations.mjs
- next.config.ts
- sign-in.mjs
- eslint.config.mjs
- check-skills.mjs
- render-report-pdf.mjs
- session-start.sh
- post-commit
- pre-commit
- { GET, POST }

## God Nodes (most connected - your core abstractions)
1. `colors` - 59 edges
2. `fonts` - 59 edges
3. `alpha` - 50 edges
4. `scripts` - 42 edges
5. `AssessmentStore` - 27 edges
6. `gradients` - 23 edges
7. `Answers` - 22 edges
8. `usingDatabase()` - 22 edges
9. `currentAssessmentId()` - 20 edges
10. `useInView()` - 18 edges

## Surprising Connections (you probably didn't know these)
- `SimulatorPage()` --calls--> `currentAssessmentId()`  [EXTRACTED]
  app/(app)/app/simulateur/page.tsx → lib/auth/current.ts
- `PrintableReportPage()` --calls--> `assembleReportLive()`  [EXTRACTED]
  app/(admin)/admin/rapports/[id]/impression/page.tsx → lib/matrices/load.ts
- `startCheckout()` --calls--> `getPaymentProvider()`  [EXTRACTED]
  app/(marketing)/diagnostic/paiement/[id]/actions.ts → lib/payments/stripe.ts
- `FieldGroup` --references--> `ScenarioInputs`  [EXTRACTED]
  content/simulator.ts → lib/simulator/types.ts
- `setTaskStatus()` --calls--> `currentAssessmentId()`  [EXTRACTED]
  app/(app)/app/actions.ts → lib/auth/current.ts

## Import Cycles
- None detected.

## Communities (79 total, 7 thin omitted)

### Community 0 - "derive.ts"
Cohesion: 0.06
Nodes (65): setTaskStatus(), TASK_TEMPLATES, dispatchEmail(), daysBetween(), deadlineList(), DeadlineNotice, dueNotices(), mostUrgentSent() (+57 more)

### Community 1 - "client.ts"
Cohesion: 0.06
Nodes (44): POST(), GET(), TrackView(), requestSignIn(), submitQuestionnaire(), security, buildFunnel(), EVENT_KINDS (+36 more)

### Community 2 - "ecoles/page.tsx"
Cohesion: 0.08
Nodes (43): addSchool(), removeSchool(), updateSchool(), dateFr(), EcolesPage(), metadata, body, CandidateView (+35 more)

### Community 3 - "email/run.test.ts"
Cohesion: 0.07
Nodes (42): POST(), EMAIL_TEMPLATES, timingSafeEqualString(), baseUrl(), emailVariables(), SUBMITTED, VARIABLES, ALLOWED_EMAIL_VARIABLES (+34 more)

### Community 4 - "dashboard/page.tsx"
Cohesion: 0.09
Nodes (36): DashboardPage(), dateFr(), metadata, removeDocument(), uploadDocument(), DocumentPanel(), DocumentView, metadata (+28 more)

### Community 5 - "(marketing)/page.tsx"
Cohesion: 0.14
Nodes (31): Badge(), GhostCta(), GoldCta(), SectionLabel(), SectionTitle(), DashboardPreview(), Diagnostic(), Faq() (+23 more)

### Community 6 - "stores.test.ts"
Cohesion: 0.10
Nodes (35): NUMERIC_FIELDS, parseInputs(), removeScenario(), saveScenario(), metadata, SimulatorPage(), inputStyle, labelStyle (+27 more)

### Community 7 - "matrices/page.tsx"
Cohesion: 0.08
Nodes (31): requireBackoffice(), saveBlockRevision(), saveRuleRevision(), BlockForm(), BlockView, field, label, meta (+23 more)

### Community 8 - "scripts"
Cohesion: 0.05
Nodes (42): scripts, build, check:all, check:legal, check:rules, check:skills, check:suites, check:tokens (+34 more)

### Community 9 - "partenariats/page.tsx"
Cohesion: 0.09
Nodes (27): metadata, RELIABILITY_LABELS, FRENCH_UNIVERSITIES_DATA, IMPORT_SOURCE, PARTNERSHIPS_DATA, UNIVERSITIES, UNIVERSITY_IDS, universityName() (+19 more)

### Community 10 - "tokens.ts"
Cohesion: 0.12
Nodes (17): SlotView, metadata, metadata, cormorant, dmSans, metadata, Footer(), label (+9 more)

### Community 11 - "blocks.ts"
Cohesion: 0.14
Nodes (27): AXIS_LABELS, RISK_BLOCKS, VERDICT_BLOCKS, Axis, Verdict, BLOCK_REGISTRY, BlockDecision, BlockDefinition (+19 more)

### Community 12 - "exhaustive.test.ts"
Cohesion: 0.12
Nodes (24): oneOf(), parseAnswers(), RFC-5321, Combo, cycles, isRealDate(), problemsOf(), REFERENCE (+16 more)

### Community 13 - "timeline.ts"
Cohesion: 0.11
Nodes (24): BAR_MILESTONES, computeDeadlines(), Deadline, isRelevant(), MILESTONES, shiftMonths(), keys(), REF (+16 more)

### Community 14 - "assemble.ts"
Cohesion: 0.11
Nodes (24): AXIS_COMMENTS, NEXT_STEPS, OFFER_BLOCKS, REPORT_STATIC, RECOMMENDABLE_OFFERS, RecommendedOffer, recommendOffer(), JourneyType (+16 more)

### Community 15 - "legal.ts"
Cohesion: 0.12
Nodes (19): LegalPage(), metadata, metadata, metadata, footer, CGV, CONFIDENTIALITE, LEGAL_DOCUMENTS (+11 more)

### Community 16 - "compilerOptions"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, graphify-out, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 17 - "admin/consultations/page.tsx"
Cohesion: 0.16
Nodes (12): closeSlot(), grantConsultations(), openSlot(), AdminConsultationsPage(), metadata, slotLabel(), button, CloseSlotButton() (+4 more)

### Community 18 - "devDependencies"
Cohesion: 0.07
Nodes (27): axe-core, eslint, eslint-config-next, @eslint/eslintrc, devDependencies, axe-core, eslint, eslint-config-next (+19 more)

### Community 19 - "booking.ts"
Cohesion: 0.19
Nodes (19): bookableSlots(), BookingDecision, BookingRequest, decideBooking(), Entitlement, remainingAllowance(), booking(), hoursFromNow() (+11 more)

### Community 20 - "assessments.ts"
Cohesion: 0.12
Nodes (18): computeAssessment(), ACADEMIC, add(), BAR, CostEstimate, CostRange, estimateCosts(), formatUsd() (+10 more)

### Community 21 - "Questionnaire.tsx"
Cohesion: 0.16
Nodes (17): metadata, Questionnaire(), intro, Option, Screen, SCREENS, ui, SCREEN_IDS (+9 more)

### Community 22 - "engine-a/types.ts"
Cohesion: 0.19
Nodes (16): evaluateCondition(), fireRules(), StructuredProfile, RULES, TEXT_BLOCKS, PATH_PRIORITY, runEngineA(), profileOf() (+8 more)

### Community 23 - "score.ts"
Cohesion: 0.21
Nodes (15): academicStrength(), buildVerdictInput(), clamp(), financialFit(), immigrationRisk(), professionalRealism(), scoreAxes(), REF (+7 more)

### Community 24 - "auth.ts"
Cohesion: 0.17
Nodes (8): endSession(), SignOutButton(), metadata, requestPlatformAccess(), AccessButton(), { handlers, auth, signIn, signOut }, auth, AUTH_EMAIL

### Community 25 - "metriques/page.tsx"
Cohesion: 0.16
Nodes (11): grid, metadata, computeMetrics(), formatMetric(), medianHours(), Metric, Metrics, MetricsInput (+3 more)

### Community 26 - "resultat/[id]/page.tsx"
Cohesion: 0.15
Nodes (11): accountsAvailable(), dateFr(), metadata, ResultPage(), PARTNERSHIP_LABELS, TUITION_LABELS, rapport, PATH_LABELS (+3 more)

### Community 27 - "rapports/[id]/page.tsx"
Cohesion: 0.14
Nodes (13): metadata, ReportControls(), ReviewChecklist(), Report, blockingPoints(), canSend(), missingDecisiveAnswers(), PATHS_REQUIRING_ARBITRATION (+5 more)

### Community 28 - "roadmap/page.tsx"
Cohesion: 0.18
Nodes (14): SELECTABLE, TaskStatusControl(), dateFr(), metadata, RoadmapPage(), LEGEND, STATE_STYLES, Timeline() (+6 more)

### Community 29 - "auth.config.ts"
Cohesion: 0.17
Nodes (11): BACKOFFICE_ROLES, isBackofficeRole(), Role, ROLES, { auth }, config, JWT, next-auth (+3 more)

### Community 30 - "reports.ts"
Cohesion: 0.19
Nodes (12): addCorrection(), setReportStatus(), setReviewPoint(), STATUS_LABELS, CorrectionEntry, globalStore, REPORT_PRIORITIES, REPORT_STATUSES (+4 more)

### Community 31 - "paiement/[id]/page.tsx"
Cohesion: 0.22
Nodes (9): startCheckout(), CheckoutButton(), metadata, formatEuros(), instalments(), Offer, OFFERS, paymentsEnabled() (+1 more)

### Community 32 - "deduction.ts"
Cohesion: 0.22
Nodes (12): checkout, applyDeduction(), DEDUCTIBLE_ON, Deduction, isDeductibleOn(), isDeductionValid(), PriceBreakdown, DEDUCTION_STATES (+4 more)

### Community 33 - "current.ts"
Cohesion: 0.30
Nodes (7): eraseAccount(), EraseForm(), metadata, donnees, HELD_DATA, CurrentUser, erasePersonalData()

### Community 34 - "stripe.ts"
Cohesion: 0.24
Nodes (8): POST(), createDeduction(), disabledProvider, getPaymentProvider(), PaymentProvider, stripeProvider(), NOW, verifyStripeSignature()

### Community 35 - "dependencies"
Cohesion: 0.15
Nodes (13): @auth/prisma-adapter, next, next-auth, dependencies, @auth/prisma-adapter, next, next-auth, @prisma/client (+5 more)

### Community 36 - "modules.ts"
Cohesion: 0.36
Nodes (10): findModule(), isModulePublished(), moduleBlockers(), MODULES, PRODUCTION_ORDER, isPublishable(), ModuleEntry, ModuleSection (+2 more)

### Community 37 - "verify-dashboard.mjs"
Cohesion: 0.15
Nodes (10): BASE, consoleErrors, countBefore, done, dots, EMAIL, failures, interdits (+2 more)

### Community 38 - "verify-simulator.mjs"
Cohesion: 0.17
Nodes (7): BASE, bourses, consoleErrors, EMAIL, failures, final, tuition

### Community 39 - "AssessmentStore"
Cohesion: 0.18
Nodes (4): metadata, PrintableReportPage(), AssessmentStore, reportStore

### Community 40 - "verify-backoffice.mjs"
Cohesion: 0.18
Nodes (8): BASE, blocked, boxes, detail, failures, printed, REQUESTER_EMAIL, review

### Community 41 - "verify-matrices.mjs"
Cohesion: 0.18
Nodes (5): BASE, consoleErrors, failures, LABELS, verdictForm

### Community 42 - "rapport/[id]/page.tsx"
Cohesion: 0.22
Nodes (3): ReportDocument(), metadata, ResultAccess

### Community 43 - "eligibility.ts"
Cohesion: 0.36
Nodes (9): Assessment, deductionVariables(), Eligibility, Ineligible, mainRisk(), reportVariables(), resourceFor(), SequenceContext (+1 more)

### Community 44 - "check-legal.mjs"
Cohesion: 0.20
Nodes (8): COVERED, failures, held, models, OUT_OF_SCOPE, policy, schema, slugs

### Community 45 - "verify-acces.mjs"
Cohesion: 0.20
Nodes (6): ALICE, BASE, BOB, consoleErrors, failures, LABELS

### Community 46 - "verify-accessibilite.mjs"
Cohesion: 0.29
Nodes (9): analyse(), auditer(), AXE_SOURCE, BASE, check(), failures, require, revealAll() (+1 more)

### Community 47 - "verify-degraded.mjs"
Cohesion: 0.20
Nodes (7): args, BASE, CLOSED_PAGES, failures, PUBLIC_PAGES, REGIME, UNKNOWN_RESOURCES

### Community 48 - "admin/page.tsx"
Cohesion: 0.36
Nodes (4): metadata, announcedDelay(), DELAY_TIERS, isSaturated()

### Community 49 - "app/consultations/page.tsx"
Cohesion: 0.12
Nodes (13): bookConsultation(), cancelConsultation(), BookingForm(), CancelButton(), ConsultationsPage(), metadata, slotLabel(), adminConsultations (+5 more)

### Community 50 - "desinscription/[id]/page.tsx"
Cohesion: 0.39
Nodes (4): confirmUnsubscribe(), metadata, UnsubscribeButton(), desinscription

### Community 51 - "wait.mjs"
Cohesion: 0.47
Nodes (6): answerScreens(), submitDiagnostic(), waitFor(), waitForText(), waitForTextChange(), waitForTextGone()

### Community 52 - "verify-checkout.mjs"
Cohesion: 0.22
Nodes (6): BASE, checkoutText, consent, consoleErrors, EMAIL, failures

### Community 53 - "verify-consultations.mjs"
Cohesion: 0.22
Nodes (6): BASE, consoleErrors, EMAIL, failures, local, slotDate

### Community 54 - "verify-ecoles.mjs"
Cohesion: 0.22
Nodes (6): BASE, candidateName, consoleErrors, EMAIL, failures, targetRow

### Community 55 - "verify-espace.mjs"
Cohesion: 0.22
Nodes (5): BASE, consoleErrors, declarative, EMAIL, failures

### Community 56 - "import-partnerships.mjs"
Cohesion: 0.25
Nodes (5): dataPath, db, partnerships, snapshotDate, universities

### Community 57 - "verify-legal.mjs"
Cohesion: 0.25
Nodes (5): BASE, consoleErrors, DOCUMENTS, EMAIL, failures

### Community 58 - "check-vocabulary.mjs"
Cohesion: 0.33
Nodes (5): ALLOWLIST, EXTS, FORBIDDEN, ROOTS, walk()

### Community 59 - "verify-questionnaire.mjs"
Cohesion: 0.29
Nodes (5): ANSWERS, BASE, consoleErrors, EMAIL, failures

### Community 60 - "verify-all.mjs"
Cohesion: 0.33
Nodes (3): broken, results, SUITES

### Community 61 - "package.json"
Cohesion: 0.40
Nodes (4): description, name, private, version

### Community 62 - ".prettierrc.json"
Cohesion: 0.40
Nodes (4): printWidth, semi, singleQuote, trailingComma

### Community 63 - "check-design-tokens.mjs"
Cohesion: 0.50
Nodes (4): EXTS, PALETTE, ROOTS, walk()

### Community 64 - "check-rules.mjs"
Cohesion: 0.40
Nodes (3): blocks, source, TODAY

### Community 65 - "check-suites.mjs"
Cohesion: 0.40
Nodes (3): failures, HELPER_MODULES, helpers

### Community 66 - "verify-animations.mjs"
Cohesion: 0.40
Nodes (3): consoleErrors, failures, longest

### Community 67 - "next.config.ts"
Cohesion: 0.50
Nodes (3): csp, nextConfig, securityHeaders

### Community 68 - "sign-in.mjs"
Cohesion: 0.83
Nodes (3): lastSignInLink(), mailLogPath(), signInByEmail()

## Knowledge Gaps
- **417 isolated node(s):** `session-start.sh script`, `printWidth`, `singleQuote`, `semi`, `trailingComma` (+412 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `colors` connect `tokens.ts` to `ecoles/page.tsx`, `dashboard/page.tsx`, `(marketing)/page.tsx`, `stores.test.ts`, `matrices/page.tsx`, `partenariats/page.tsx`, `admin/consultations/page.tsx`, `Questionnaire.tsx`, `auth.ts`, `metriques/page.tsx`, `resultat/[id]/page.tsx`, `rapports/[id]/page.tsx`, `roadmap/page.tsx`, `reports.ts`, `paiement/[id]/page.tsx`, `current.ts`, `rapport/[id]/page.tsx`, `admin/page.tsx`, `app/consultations/page.tsx`, `desinscription/[id]/page.tsx`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Why does `fonts` connect `tokens.ts` to `ecoles/page.tsx`, `dashboard/page.tsx`, `(marketing)/page.tsx`, `stores.test.ts`, `matrices/page.tsx`, `partenariats/page.tsx`, `admin/consultations/page.tsx`, `Questionnaire.tsx`, `auth.ts`, `metriques/page.tsx`, `resultat/[id]/page.tsx`, `rapports/[id]/page.tsx`, `roadmap/page.tsx`, `reports.ts`, `paiement/[id]/page.tsx`, `current.ts`, `rapport/[id]/page.tsx`, `admin/page.tsx`, `app/consultations/page.tsx`, `desinscription/[id]/page.tsx`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Why does `alpha` connect `tokens.ts` to `ecoles/page.tsx`, `dashboard/page.tsx`, `(marketing)/page.tsx`, `stores.test.ts`, `matrices/page.tsx`, `partenariats/page.tsx`, `admin/consultations/page.tsx`, `Questionnaire.tsx`, `auth.ts`, `metriques/page.tsx`, `resultat/[id]/page.tsx`, `rapports/[id]/page.tsx`, `roadmap/page.tsx`, `reports.ts`, `paiement/[id]/page.tsx`, `current.ts`, `rapport/[id]/page.tsx`, `admin/page.tsx`, `app/consultations/page.tsx`, `desinscription/[id]/page.tsx`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **What connects `session-start.sh script`, `printWidth`, `singleQuote` to the rest of the system?**
  _417 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `derive.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.059018367961457395 - nodes in this community are weakly interconnected._
- **Should `client.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.057692307692307696 - nodes in this community are weakly interconnected._
- **Should `ecoles/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07514124293785311 - nodes in this community are weakly interconnected._