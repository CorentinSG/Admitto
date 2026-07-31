# Graph Report - /home/user/Admitto  (2026-07-31)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1491 nodes · 3525 edges · 87 communities (80 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `be21ad02`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- stores.test.ts
- app/consultations/page.tsx
- eligibility.ts
- tokens.ts
- notifications/run.ts
- currentAssessmentId
- scripts
- assemble.ts
- alpha
- matrices/page.tsx
- Nav.tsx
- resultat/[id]/page.tsx
- dashboard/page.tsx
- LegalPage.tsx
- partenariats/page.tsx
- ecoles/page.tsx
- devDependencies
- blocks.ts
- exhaustive.test.ts
- compilerOptions
- rate-limit.ts
- assessment/compute.ts
- rapports/[id]/page.tsx
- offers.ts
- roadmap/types.ts
- balance.ts
- metriques/page.tsx
- analytics/events.ts
- AssessmentStore
- auth.config.ts
- timeline.ts
- reports.ts
- assessments.ts
- roadmap.test.ts
- Questionnaire.tsx
- dependencies
- modules.ts
- score.ts
- derive.ts
- verify-dashboard.mjs
- partnerships/types.ts
- schools.test.ts
- visibility.ts
- verify-backoffice.mjs
- verify-simulator.mjs
- admin/page.tsx
- stripe.ts
- verify-matrices.mjs
- email/run.test.ts
- check-legal.mjs
- verify-acces.mjs
- verify-accessibilite.mjs
- verify-degraded.mjs
- desinscription/[id]/page.tsx
- deadlines/compute.ts
- wait.mjs
- verify-checkout.mjs
- verify-consultations.mjs
- verify-ecoles.mjs
- verify-espace.mjs
- next-best-action.ts
- check-bundle.mjs
- import-partnerships.mjs
- verify-legal.mjs
- check-vocabulary.mjs
- verify-questionnaire.mjs
- verify-all.mjs
- verify-animations.mjs
- limits.ts
- package.json
- .prettierrc.json
- check-design-tokens.mjs
- check-rules.mjs
- check-suites.mjs
- verify-seo.mjs
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
1. `colors` - 61 edges
2. `fonts` - 60 edges
3. `alpha` - 50 edges
4. `scripts` - 44 edges
5. `AssessmentStore` - 27 edges
6. `gradients` - 23 edges
7. `Answers` - 22 edges
8. `usingDatabase()` - 22 edges
9. `currentAssessmentId()` - 20 edges
10. `useInView()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `SimulatorPage()` --calls--> `currentAssessmentId()`  [EXTRACTED]
  app/(app)/app/simulateur/page.tsx → lib/auth/current.ts
- `PrintableReportPage()` --calls--> `assembleReportLive()`  [EXTRACTED]
  app/(admin)/admin/rapports/[id]/impression/page.tsx → lib/matrices/load.ts
- `FinalCta()` --calls--> `useInView()`  [EXTRACTED]
  app/(marketing)/_sections/FinalCta.tsx → design/animations.tsx
- `startCheckout()` --calls--> `getPaymentProvider()`  [EXTRACTED]
  app/(marketing)/diagnostic/paiement/[id]/actions.ts → lib/payments/stripe.ts
- `FieldGroup` --references--> `ScenarioInputs`  [EXTRACTED]
  content/simulator.ts → lib/simulator/types.ts

## Import Cycles
- None detected.

## Communities (87 total, 7 thin omitted)

### Community 0 - "stores.test.ts"
Cohesion: 0.05
Nodes (59): eraseAccount(), EraseForm(), GET(), metadata, NUMERIC_FIELDS, parseInputs(), removeScenario(), saveScenario() (+51 more)

### Community 1 - "app/consultations/page.tsx"
Cohesion: 0.07
Nodes (45): closeSlot(), grantConsultations(), openSlot(), AdminConsultationsPage(), metadata, slotLabel(), button, CloseSlotButton() (+37 more)

### Community 2 - "eligibility.ts"
Cohesion: 0.08
Nodes (41): EMAIL_TEMPLATES, Assessment, baseUrl(), dispatchEmail(), emailVariables(), deductionVariables(), Eligibility, Ineligible (+33 more)

### Community 3 - "tokens.ts"
Cohesion: 0.09
Nodes (18): metadata, metadata, endSession(), SignOutButton(), ErrorScreen(), cormorant, dmSans, metadata (+10 more)

### Community 4 - "notifications/run.ts"
Cohesion: 0.08
Nodes (33): POST(), POST(), onRequestError(), timingSafeEqualString(), runEmailSequence(), purgeUnclaimedAssessments(), unclaimedCutoff(), daysBetween() (+25 more)

### Community 5 - "currentAssessmentId"
Cohesion: 0.11
Nodes (32): removeDocument(), uploadDocument(), DocumentPanel(), DocumentView, metadata, DOCUMENT_TYPE_HINTS, DOCUMENT_TYPE_LABELS, REFUSAL_MESSAGES (+24 more)

### Community 6 - "scripts"
Cohesion: 0.05
Nodes (44): scripts, build, check:all, check:bundle, check:legal, check:rules, check:skills, check:suites (+36 more)

### Community 7 - "assemble.ts"
Cohesion: 0.09
Nodes (33): AXIS_COMMENTS, AXIS_LABELS, NEXT_STEPS, OFFER_BLOCKS, REPORT_STATIC, RISK_BLOCKS, VERDICT_BLOCKS, PATH_LABELS (+25 more)

### Community 8 - "alpha"
Cohesion: 0.13
Nodes (34): Badge(), GhostCta(), GoldCta(), SectionLabel(), SectionTitle(), metadata, DashboardPreview(), Diagnostic() (+26 more)

### Community 9 - "matrices/page.tsx"
Cohesion: 0.09
Nodes (30): requireBackoffice(), saveBlockRevision(), saveRuleRevision(), BlockForm(), BlockView, field, label, meta (+22 more)

### Community 10 - "Nav.tsx"
Cohesion: 0.16
Nodes (14): metadata, sectionHref(), Footer(), Nav(), metadata, metadata, FinalCta(), robots() (+6 more)

### Community 11 - "resultat/[id]/page.tsx"
Cohesion: 0.09
Nodes (14): metadata, PrintableReportPage(), ReportDocument(), metadata, accountsAvailable(), dateFr(), metadata, ResultPage() (+6 more)

### Community 12 - "dashboard/page.tsx"
Cohesion: 0.13
Nodes (22): TaskStatusControl(), DashboardPage(), dateFr(), metadata, dateFr(), metadata, RoadmapPage(), LEGEND (+14 more)

### Community 13 - "LegalPage.tsx"
Cohesion: 0.14
Nodes (19): label, LegalPage(), metadata, metadata, metadata, CGV, CONFIDENTIALITE, LEGAL_DOCUMENTS (+11 more)

### Community 14 - "partenariats/page.tsx"
Cohesion: 0.12
Nodes (18): metadata, RELIABILITY_LABELS, FRENCH_UNIVERSITIES_DATA, IMPORT_SOURCE, PARTNERSHIPS_DATA, UNIVERSITIES, UNIVERSITY_IDS, universityName() (+10 more)

### Community 15 - "ecoles/page.tsx"
Cohesion: 0.12
Nodes (21): addSchool(), removeSchool(), updateSchool(), dateFr(), EcolesPage(), metadata, body, CandidateView (+13 more)

### Community 16 - "devDependencies"
Cohesion: 0.07
Nodes (29): axe-core, eslint, eslint-config-next, @eslint/eslintrc, lighthouse, devDependencies, axe-core, eslint (+21 more)

### Community 17 - "blocks.ts"
Cohesion: 0.15
Nodes (24): BLOCK_REGISTRY, BlockDecision, BlockDefinition, BlockKind, BlockRefusal, buildRegistry(), checkText(), clean() (+16 more)

### Community 18 - "exhaustive.test.ts"
Cohesion: 0.13
Nodes (23): oneOf(), parseAnswers(), Combo, cycles, isRealDate(), problemsOf(), REFERENCE, PRELIMINARY_PATHS (+15 more)

### Community 19 - "compilerOptions"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, graphify-out, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 20 - "rate-limit.ts"
Cohesion: 0.14
Nodes (17): POST(), requestSignIn(), submitQuestionnaire(), security, parseEvent(), callerIp(), checkRateLimit(), globalStore (+9 more)

### Community 21 - "assessment/compute.ts"
Cohesion: 0.20
Nodes (16): computeAssessment(), evaluateCondition(), fireRules(), StructuredProfile, RULES, TEXT_BLOCKS, PATH_PRIORITY, runEngineA() (+8 more)

### Community 22 - "rapports/[id]/page.tsx"
Cohesion: 0.12
Nodes (16): metadata, ReportControls(), ReviewChecklist(), blockingPoints(), canSend(), missingDecisiveAnswers(), PATHS_REQUIRING_ARBITRATION, REVIEW_SEVERITIES (+8 more)

### Community 23 - "offers.ts"
Cohesion: 0.20
Nodes (16): applyDeduction(), createDeduction(), DEDUCTIBLE_ON, Deduction, isDeductibleOn(), isDeductionValid(), PriceBreakdown, DEDUCTION_STATES (+8 more)

### Community 24 - "roadmap/types.ts"
Cohesion: 0.20
Nodes (16): setTaskStatus(), SELECTABLE, TASK_TEMPLATES, dueDateFor(), generateRoadmap(), initialStatus(), PHASE_ORDER, phaseIndex() (+8 more)

### Community 25 - "balance.ts"
Cohesion: 0.15
Nodes (17): AMBITION_ORDER, analyseList(), emptyAmbitions(), emptyStatuses(), Observation, OBSERVATION_KINDS, ObservationKind, SchoolBalance (+9 more)

### Community 26 - "metriques/page.tsx"
Cohesion: 0.16
Nodes (11): grid, metadata, computeMetrics(), formatMetric(), medianHours(), Metric, Metrics, MetricsInput (+3 more)

### Community 27 - "analytics/events.ts"
Cohesion: 0.17
Nodes (12): TrackView(), buildFunnel(), EVENT_KINDS, EventKind, Funnel, FunnelStep, ProductEvent, ScreenDropOff (+4 more)

### Community 28 - "AssessmentStore"
Cohesion: 0.17
Nodes (6): startCheckout(), CheckoutButton(), metadata, checkout, paymentsEnabled(), AssessmentStore

### Community 29 - "auth.config.ts"
Cohesion: 0.17
Nodes (11): BACKOFFICE_ROLES, isBackofficeRole(), Role, ROLES, { auth }, config, JWT, next-auth (+3 more)

### Community 30 - "timeline.ts"
Cohesion: 0.18
Nodes (13): Deadline, buildTimeline(), dayOf(), isDone(), stateOf(), REFERENCE, TIMELINE_STATES, TimelineDeadline (+5 more)

### Community 31 - "reports.ts"
Cohesion: 0.18
Nodes (11): addCorrection(), setReportStatus(), setReviewPoint(), REPORT_STATUSES, ReportStatus, CorrectionEntry, globalStore, REPORT_PRIORITIES (+3 more)

### Community 32 - "assessments.ts"
Cohesion: 0.15
Nodes (11): ACADEMIC, add(), BAR, CostEstimate, CostRange, estimateCosts(), LIVING, DerivedProfile (+3 more)

### Community 33 - "roadmap.test.ts"
Cohesion: 0.25
Nodes (13): activePhases(), applicableTasks(), computeProgress(), MilestoneState, milestoneStates(), PersonalStats, PhaseProgress, Progress (+5 more)

### Community 34 - "Questionnaire.tsx"
Cohesion: 0.22
Nodes (8): metadata, Questionnaire(), intro, Option, Screen, SCREENS, ui, ScreenId

### Community 35 - "dependencies"
Cohesion: 0.15
Nodes (13): @auth/prisma-adapter, next, next-auth, dependencies, @auth/prisma-adapter, next, next-auth, @prisma/client (+5 more)

### Community 36 - "modules.ts"
Cohesion: 0.36
Nodes (10): findModule(), isModulePublished(), moduleBlockers(), MODULES, PRODUCTION_ORDER, isPublishable(), ModuleEntry, ModuleSection (+2 more)

### Community 37 - "score.ts"
Cohesion: 0.37
Nodes (10): academicStrength(), buildVerdictInput(), clamp(), financialFit(), immigrationRisk(), professionalRealism(), scoreAxes(), REF (+2 more)

### Community 38 - "derive.ts"
Cohesion: 0.27
Nodes (11): currentPhase(), deriveProfile(), hasBlockingGaps(), JOURNEY_TYPES, JourneyType, lawYearsValidated(), monthsUntilIntake(), PHASES (+3 more)

### Community 39 - "verify-dashboard.mjs"
Cohesion: 0.15
Nodes (10): BASE, consoleErrors, countBefore, done, dots, EMAIL, failures, interdits (+2 more)

### Community 40 - "partnerships/types.ts"
Cohesion: 0.20
Nodes (10): PARTNERSHIP_LABELS, TUITION_LABELS, LanguageTest, PARTNERSHIP_TYPES, PartnershipType, PartnerUniversity, RELIABILITY_STATUSES, ReliabilityStatus (+2 more)

### Community 41 - "schools.test.ts"
Cohesion: 0.29
Nodes (7): PartnershipDetection, Partnership, candidatesFor(), SchoolCandidate, toCandidate(), decideAdd(), normalizeName()

### Community 42 - "visibility.ts"
Cohesion: 0.35
Nodes (10): CareerGoal, SCREEN_IDS, allowsTooEarlyGoal(), careerGoalOptions(), isAlreadyEnrolled(), isConditionalScreen(), needsVisaBranch(), progress() (+2 more)

### Community 43 - "verify-backoffice.mjs"
Cohesion: 0.17
Nodes (9): BASE, blocked, boxes, budgetResponses, detail, failures, printed, REQUESTER_EMAIL (+1 more)

### Community 44 - "verify-simulator.mjs"
Cohesion: 0.17
Nodes (7): BASE, bourses, consoleErrors, EMAIL, failures, final, tuition

### Community 45 - "admin/page.tsx"
Cohesion: 0.29
Nodes (5): metadata, STATUS_LABELS, announcedDelay(), DELAY_TIERS, isSaturated()

### Community 46 - "stripe.ts"
Cohesion: 0.25
Nodes (7): CheckoutRequest, disabledProvider, getPaymentProvider(), PaymentProvider, stripeProvider(), NOW, verifyStripeSignature()

### Community 47 - "verify-matrices.mjs"
Cohesion: 0.18
Nodes (5): BASE, consoleErrors, failures, LABELS, verdictForm

### Community 48 - "email/run.test.ts"
Cohesion: 0.29
Nodes (7): journalId(), ANSWERS, later(), RUN, seed(), sent, SUBMITTED

### Community 49 - "check-legal.mjs"
Cohesion: 0.20
Nodes (8): COVERED, failures, held, models, OUT_OF_SCOPE, policy, schema, slugs

### Community 50 - "verify-acces.mjs"
Cohesion: 0.20
Nodes (6): ALICE, BASE, BOB, consoleErrors, failures, LABELS

### Community 51 - "verify-accessibilite.mjs"
Cohesion: 0.29
Nodes (9): analyse(), auditer(), AXE_SOURCE, BASE, check(), failures, require, revealAll() (+1 more)

### Community 52 - "verify-degraded.mjs"
Cohesion: 0.20
Nodes (7): args, BASE, CLOSED_PAGES, failures, PUBLIC_PAGES, REGIME, UNKNOWN_RESOURCES

### Community 53 - "desinscription/[id]/page.tsx"
Cohesion: 0.39
Nodes (4): confirmUnsubscribe(), metadata, UnsubscribeButton(), desinscription

### Community 54 - "deadlines/compute.ts"
Cohesion: 0.33
Nodes (7): BAR_MILESTONES, computeDeadlines(), isRelevant(), MILESTONES, shiftMonths(), keys(), REF

### Community 55 - "wait.mjs"
Cohesion: 0.47
Nodes (6): answerScreens(), submitDiagnostic(), waitFor(), waitForText(), waitForTextChange(), waitForTextGone()

### Community 56 - "verify-checkout.mjs"
Cohesion: 0.22
Nodes (6): BASE, checkoutText, consent, consoleErrors, EMAIL, failures

### Community 57 - "verify-consultations.mjs"
Cohesion: 0.22
Nodes (6): BASE, consoleErrors, EMAIL, failures, local, slotDate

### Community 58 - "verify-ecoles.mjs"
Cohesion: 0.22
Nodes (6): BASE, candidateName, consoleErrors, EMAIL, failures, targetRow

### Community 59 - "verify-espace.mjs"
Cohesion: 0.22
Nodes (5): BASE, consoleErrors, declarative, EMAIL, failures

### Community 60 - "next-best-action.ts"
Cohesion: 0.32
Nodes (7): formatDuration(), IMPORTANCE_RANK, NextBestAction, reasonFor(), selectNextBestAction(), Importance, NOT_ACTIONABLE

### Community 61 - "check-bundle.mjs"
Cohesion: 0.25
Nodes (6): BUDGETS_KO, failures, MANIFEST, mesures, routes, shared

### Community 62 - "import-partnerships.mjs"
Cohesion: 0.25
Nodes (5): dataPath, db, partnerships, snapshotDate, universities

### Community 63 - "verify-legal.mjs"
Cohesion: 0.25
Nodes (5): BASE, consoleErrors, DOCUMENTS, EMAIL, failures

### Community 64 - "check-vocabulary.mjs"
Cohesion: 0.33
Nodes (5): ALLOWLIST, EXTS, FORBIDDEN, ROOTS, walk()

### Community 65 - "verify-questionnaire.mjs"
Cohesion: 0.29
Nodes (5): ANSWERS, BASE, consoleErrors, EMAIL, failures

### Community 66 - "verify-all.mjs"
Cohesion: 0.33
Nodes (3): broken, results, SUITES

### Community 67 - "verify-animations.mjs"
Cohesion: 0.33
Nodes (4): budgetResponses, consoleErrors, failures, longest

### Community 68 - "limits.ts"
Cohesion: 0.60
Nodes (3): RFC-5321, boundedText(), validEmail()

### Community 69 - "package.json"
Cohesion: 0.40
Nodes (4): description, name, private, version

### Community 70 - ".prettierrc.json"
Cohesion: 0.40
Nodes (4): printWidth, semi, singleQuote, trailingComma

### Community 71 - "check-design-tokens.mjs"
Cohesion: 0.50
Nodes (4): EXTS, PALETTE, ROOTS, walk()

### Community 72 - "check-rules.mjs"
Cohesion: 0.40
Nodes (3): blocks, source, TODAY

### Community 73 - "check-suites.mjs"
Cohesion: 0.40
Nodes (3): failures, HELPER_MODULES, helpers

### Community 74 - "verify-seo.mjs"
Cohesion: 0.40
Nodes (3): BASE, failures, PAGES

### Community 75 - "next.config.ts"
Cohesion: 0.50
Nodes (3): csp, nextConfig, securityHeaders

### Community 76 - "sign-in.mjs"
Cohesion: 0.83
Nodes (3): lastSignInLink(), mailLogPath(), signInByEmail()

## Knowledge Gaps
- **442 isolated node(s):** `session-start.sh script`, `printWidth`, `singleQuote`, `semi`, `trailingComma` (+437 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `colors` connect `tokens.ts` to `stores.test.ts`, `app/consultations/page.tsx`, `currentAssessmentId`, `alpha`, `matrices/page.tsx`, `Nav.tsx`, `resultat/[id]/page.tsx`, `dashboard/page.tsx`, `LegalPage.tsx`, `partenariats/page.tsx`, `ecoles/page.tsx`, `rapports/[id]/page.tsx`, `roadmap/types.ts`, `metriques/page.tsx`, `AssessmentStore`, `reports.ts`, `Questionnaire.tsx`, `admin/page.tsx`, `desinscription/[id]/page.tsx`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **Why does `fonts` connect `tokens.ts` to `stores.test.ts`, `app/consultations/page.tsx`, `currentAssessmentId`, `alpha`, `matrices/page.tsx`, `Nav.tsx`, `resultat/[id]/page.tsx`, `dashboard/page.tsx`, `LegalPage.tsx`, `partenariats/page.tsx`, `ecoles/page.tsx`, `rapports/[id]/page.tsx`, `roadmap/types.ts`, `metriques/page.tsx`, `AssessmentStore`, `reports.ts`, `Questionnaire.tsx`, `admin/page.tsx`, `desinscription/[id]/page.tsx`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Why does `alpha` connect `alpha` to `stores.test.ts`, `app/consultations/page.tsx`, `tokens.ts`, `currentAssessmentId`, `matrices/page.tsx`, `Nav.tsx`, `resultat/[id]/page.tsx`, `dashboard/page.tsx`, `LegalPage.tsx`, `partenariats/page.tsx`, `ecoles/page.tsx`, `rapports/[id]/page.tsx`, `roadmap/types.ts`, `metriques/page.tsx`, `AssessmentStore`, `reports.ts`, `Questionnaire.tsx`, `admin/page.tsx`, `desinscription/[id]/page.tsx`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **What connects `session-start.sh script`, `printWidth`, `singleQuote` to the rest of the system?**
  _442 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `stores.test.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05170998632010944 - nodes in this community are weakly interconnected._
- **Should `app/consultations/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0689484126984127 - nodes in this community are weakly interconnected._
- **Should `eligibility.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07764876632801161 - nodes in this community are weakly interconnected._