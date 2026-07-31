# Graph Report - /home/user/Admitto  (2026-07-31)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1412 nodes · 3425 edges · 85 communities (77 shown, 8 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `07cb03b5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- assessment/compute.ts
- assemble.ts
- ecoles/page.tsx
- Simulator.tsx
- resultat/[id]/page.tsx
- alpha
- documents/actions.ts
- email/run.ts
- scripts
- LegalPage.tsx
- exhaustive.test.ts
- compilerOptions
- tokens.ts
- roadmap/types.ts
- devDependencies
- booking.ts
- rapports/[id]/page.tsx
- rate-limit.ts
- timeline.ts
- admin/consultations/page.tsx
- paiement/[id]/page.tsx
- current.ts
- roadmap/page.tsx
- metriques/page.tsx
- app/consultations/page.tsx
- dashboard/page.tsx
- auth.config.ts
- reports.ts
- AssessmentStore
- assessments.ts
- deadlines.ts
- analytics/events.ts
- email/run.test.ts
- derive.ts
- stripe.ts
- Questionnaire.tsx
- dependencies
- stores.test.ts
- verify-dashboard.mjs
- visibility.ts
- deduction.ts
- verify-simulator.mjs
- notifications/run.ts
- verify-backoffice.mjs
- verify-matrices.mjs
- eligibility.ts
- check-legal.mjs
- verify-acces.mjs
- verify-degraded.mjs
- admin/page.tsx
- deadlines/route.ts
- desinscription/[id]/page.tsx
- deadlines/compute.ts
- wait.mjs
- verify-checkout.mjs
- verify-consultations.mjs
- verify-ecoles.mjs
- verify-espace.mjs
- donnees/page.tsx
- import-partnerships.mjs
- verify-legal.mjs
- app/layout.tsx
- check-vocabulary.mjs
- verify-questionnaire.mjs
- verify-all.mjs
- limits.ts
- package.json
- .prettierrc.json
- check-design-tokens.mjs
- check-rules.mjs
- check-suites.mjs
- verify-animations.mjs
- next.config.ts
- sign-in.mjs
- Nav.tsx
- eslint.config.mjs
- check-skills.mjs
- render-report-pdf.mjs
- session-start.sh
- post-commit
- pre-commit
- { GET, POST }

## God Nodes (most connected - your core abstractions)
1. `colors` - 58 edges
2. `fonts` - 58 edges
3. `alpha` - 50 edges
4. `scripts` - 41 edges
5. `AssessmentStore` - 27 edges
6. `currentAssessmentId()` - 24 edges
7. `gradients` - 23 edges
8. `useInView()` - 22 edges
9. `Answers` - 22 edges
10. `usingDatabase()` - 22 edges

## Surprising Connections (you probably didn't know these)
- `AdminQueuePage()` --calls--> `assembleReportLive()`  [EXTRACTED]
  app/(admin)/admin/page.tsx → lib/matrices/load.ts
- `PrintableReportPage()` --calls--> `assembleReportLive()`  [EXTRACTED]
  app/(admin)/admin/rapports/[id]/impression/page.tsx → lib/matrices/load.ts
- `AdminReportPage()` --calls--> `assembleReportLive()`  [EXTRACTED]
  app/(admin)/admin/rapports/[id]/page.tsx → lib/matrices/load.ts
- `startCheckout()` --calls--> `getPaymentProvider()`  [EXTRACTED]
  app/(marketing)/diagnostic/paiement/[id]/actions.ts → lib/payments/stripe.ts
- `Output()` --calls--> `formatUsd()`  [EXTRACTED]
  app/(app)/app/simulateur/Simulator.tsx → lib/simulator/compute.ts

## Import Cycles
- None detected.

## Communities (85 total, 8 thin omitted)

### Community 0 - "assessment/compute.ts"
Cohesion: 0.05
Nodes (73): requireBackoffice(), saveBlockRevision(), saveRuleRevision(), BlockForm(), BlockView, field, label, meta (+65 more)

### Community 1 - "assemble.ts"
Cohesion: 0.06
Nodes (51): AXIS_COMMENTS, AXIS_LABELS, NEXT_STEPS, OFFER_BLOCKS, REPORT_STATIC, RISK_BLOCKS, VERDICT_BLOCKS, ACADEMIC (+43 more)

### Community 2 - "ecoles/page.tsx"
Cohesion: 0.08
Nodes (46): addSchool(), removeSchool(), updateSchool(), dateFr(), EcolesPage(), metadata, AddForm(), body (+38 more)

### Community 3 - "Simulator.tsx"
Cohesion: 0.08
Nodes (46): DocumentsPage(), metadata, ModulesPage(), metadata, ModulePage(), NUMERIC_FIELDS, parseInputs(), removeScenario() (+38 more)

### Community 4 - "resultat/[id]/page.tsx"
Cohesion: 0.07
Nodes (36): AdminPartnershipsPage(), metadata, RELIABILITY_LABELS, accountsAvailable(), dateFr(), metadata, ResultPage(), FRENCH_UNIVERSITIES_DATA (+28 more)

### Community 5 - "alpha"
Cohesion: 0.15
Nodes (32): Badge(), GhostCta(), GoldCta(), SectionLabel(), SectionTitle(), DashboardPreview(), Diagnostic(), Faq() (+24 more)

### Community 6 - "documents/actions.ts"
Cohesion: 0.11
Nodes (31): removeDocument(), uploadDocument(), DocumentPanel(), DocumentView, metadata, DOCUMENT_TYPE_HINTS, DOCUMENT_TYPE_LABELS, REFUSAL_MESSAGES (+23 more)

### Community 7 - "email/run.ts"
Cohesion: 0.10
Nodes (31): EMAIL_TEMPLATES, baseUrl(), emailVariables(), SUBMITTED, VARIABLES, ALLOWED_EMAIL_VARIABLES, AllowedEmailVariable, EmailVariables (+23 more)

### Community 8 - "scripts"
Cohesion: 0.05
Nodes (41): scripts, build, check:all, check:legal, check:rules, check:skills, check:suites, check:tokens (+33 more)

### Community 9 - "LegalPage.tsx"
Cohesion: 0.12
Nodes (22): Footer(), Block(), label, LegalPage(), metadata, metadata, metadata, footer (+14 more)

### Community 10 - "exhaustive.test.ts"
Cohesion: 0.13
Nodes (23): oneOf(), parseAnswers(), security, Combo, cycles, isRealDate(), problemsOf(), REFERENCE (+15 more)

### Community 11 - "compilerOptions"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, graphify-out, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 12 - "tokens.ts"
Cohesion: 0.17
Nodes (12): endSession(), SignOutButton(), requestSignIn(), metadata, SignInForm(), metadata, requestPlatformAccess(), AccessButton() (+4 more)

### Community 13 - "roadmap/types.ts"
Cohesion: 0.21
Nodes (12): formatDuration(), IMPORTANCE_RANK, NextBestAction, reasonFor(), selectNextBestAction(), EXCLUDED_STATUSES, Importance, IMPORTANCES (+4 more)

### Community 14 - "devDependencies"
Cohesion: 0.08
Nodes (25): eslint, eslint-config-next, @eslint/eslintrc, devDependencies, eslint, eslint-config-next, @eslint/eslintrc, playwright (+17 more)

### Community 15 - "booking.ts"
Cohesion: 0.16
Nodes (19): BookingDecision, BookingRefusal, BookingRequest, decideBooking(), Entitlement, booking(), hoursFromNow(), NOW (+11 more)

### Community 16 - "rapports/[id]/page.tsx"
Cohesion: 0.12
Nodes (17): setReviewPoint(), AdminReportPage(), metadata, ReviewChecklist(), blockingPoints(), canSend(), missingDecisiveAnswers(), PATHS_REQUIRING_ARBITRATION (+9 more)

### Community 17 - "rate-limit.ts"
Cohesion: 0.15
Nodes (16): POST(), submitQuestionnaire(), parseEvent(), callerIp(), checkRateLimit(), globalStore, Limit, purgeRateLimitHits() (+8 more)

### Community 18 - "timeline.ts"
Cohesion: 0.15
Nodes (17): TimelineView, Deadline, buildTimeline(), dayOf(), isDone(), stateOf(), REFERENCE, TIMELINE_STATES (+9 more)

### Community 19 - "admin/consultations/page.tsx"
Cohesion: 0.17
Nodes (15): closeSlot(), grantConsultations(), openSlot(), AdminConsultationsPage(), metadata, slotLabel(), button, CloseSlotButton() (+7 more)

### Community 20 - "paiement/[id]/page.tsx"
Cohesion: 0.19
Nodes (10): startCheckout(), CheckoutButton(), metadata, checkout, formatEuros(), instalments(), Offer, OFFERS (+2 more)

### Community 21 - "current.ts"
Cohesion: 0.18
Nodes (11): eraseAccount(), GET(), { handlers, auth, signIn, signOut }, AUTH_EMAIL, CurrentUser, prisma(), erasePersonalData(), ErasureSummary (+3 more)

### Community 22 - "roadmap/page.tsx"
Cohesion: 0.18
Nodes (15): setTaskStatus(), SELECTABLE, TaskStatusControl(), dateFr(), metadata, RoadmapPage(), LEGEND, STATE_STYLES (+7 more)

### Community 23 - "metriques/page.tsx"
Cohesion: 0.17
Nodes (11): grid, metadata, computeMetrics(), formatMetric(), medianHours(), Metric, Metrics, MetricsInput (+3 more)

### Community 24 - "app/consultations/page.tsx"
Cohesion: 0.20
Nodes (11): bookConsultation(), cancelConsultation(), BookingForm(), CancelButton(), SlotView, ConsultationsPage(), metadata, slotLabel() (+3 more)

### Community 25 - "dashboard/page.tsx"
Cohesion: 0.14
Nodes (22): DashboardPage(), dateFr(), metadata, MILESTONE_LABELS, activePhases(), applicableTasks(), dueDateFor(), generateRoadmap() (+14 more)

### Community 26 - "auth.config.ts"
Cohesion: 0.17
Nodes (11): BACKOFFICE_ROLES, isBackofficeRole(), Role, ROLES, { auth }, config, JWT, next-auth (+3 more)

### Community 27 - "reports.ts"
Cohesion: 0.21
Nodes (12): addCorrection(), setReportStatus(), ReportControls(), STATUS_LABELS, CorrectionEntry, globalStore, REPORT_PRIORITIES, REPORT_STATUSES (+4 more)

### Community 28 - "AssessmentStore"
Cohesion: 0.13
Nodes (7): metadata, PrintableReportPage(), ReportDocument(), metadata, ResultAccess, AssessmentStore, reportStore

### Community 29 - "assessments.ts"
Cohesion: 0.18
Nodes (9): databaseUrl(), db(), globalForPrisma, usingDatabase(), DerivedProfile, AssessmentRow, globalStore, globalUnsub (+1 more)

### Community 30 - "deadlines.ts"
Cohesion: 0.21
Nodes (14): daysBetween(), deadlineList(), DeadlineNotice, dueNotices(), mostUrgentSent(), NOTICE_DAYS, noticeId(), noticeLead() (+6 more)

### Community 31 - "analytics/events.ts"
Cohesion: 0.20
Nodes (11): AdminMetricsPage(), TrackView(), buildFunnel(), EVENT_KINDS, EventKind, Funnel, FunnelStep, ProductEvent (+3 more)

### Community 32 - "email/run.test.ts"
Cohesion: 0.19
Nodes (11): POST(), journalId(), runEmailSequence(), ANSWERS, later(), RUN, seed(), sent (+3 more)

### Community 33 - "derive.ts"
Cohesion: 0.25
Nodes (12): currentPhase(), deriveProfile(), hasBlockingGaps(), JOURNEY_TYPES, lawYearsValidated(), monthsUntilIntake(), Phase, PHASES (+4 more)

### Community 34 - "stripe.ts"
Cohesion: 0.24
Nodes (8): POST(), createDeduction(), disabledProvider, getPaymentProvider(), PaymentProvider, stripeProvider(), NOW, verifyStripeSignature()

### Community 35 - "Questionnaire.tsx"
Cohesion: 0.21
Nodes (8): metadata, intro, Option, Screen, SCREENS, ui, UNIVERSITIES, ScreenId

### Community 36 - "dependencies"
Cohesion: 0.15
Nodes (13): @auth/prisma-adapter, next, next-auth, dependencies, @auth/prisma-adapter, next, next-auth, @prisma/client (+5 more)

### Community 37 - "stores.test.ts"
Cohesion: 0.19
Nodes (10): computeAssessment(), globalStore, milestoneStore, globalStore, scenarioStore, StoredScenario, ANSWERS, createdIds (+2 more)

### Community 38 - "verify-dashboard.mjs"
Cohesion: 0.15
Nodes (10): BASE, consoleErrors, countBefore, done, dots, EMAIL, failures, interdits (+2 more)

### Community 39 - "visibility.ts"
Cohesion: 0.35
Nodes (10): Questionnaire(), CareerGoal, SCREEN_IDS, allowsTooEarlyGoal(), careerGoalOptions(), isAlreadyEnrolled(), isConditionalScreen(), progress() (+2 more)

### Community 40 - "deduction.ts"
Cohesion: 0.29
Nodes (10): applyDeduction(), DEDUCTIBLE_ON, Deduction, isDeductibleOn(), isDeductionValid(), PriceBreakdown, DEDUCTION_STATES, DeductionState (+2 more)

### Community 41 - "verify-simulator.mjs"
Cohesion: 0.17
Nodes (7): BASE, bourses, consoleErrors, EMAIL, failures, final, tuition

### Community 42 - "notifications/run.ts"
Cohesion: 0.29
Nodes (7): TASK_TEMPLATES, dispatchEmail(), RunSummary, loadRoadmap(), TASK_STATUSES, globalStore, roadmapStore

### Community 43 - "verify-backoffice.mjs"
Cohesion: 0.18
Nodes (8): BASE, blocked, boxes, detail, failures, printed, REQUESTER_EMAIL, review

### Community 44 - "verify-matrices.mjs"
Cohesion: 0.18
Nodes (5): BASE, consoleErrors, failures, LABELS, verdictForm

### Community 45 - "eligibility.ts"
Cohesion: 0.36
Nodes (9): Assessment, deductionVariables(), Eligibility, Ineligible, mainRisk(), reportVariables(), resourceFor(), SequenceContext (+1 more)

### Community 46 - "check-legal.mjs"
Cohesion: 0.20
Nodes (8): COVERED, failures, held, models, OUT_OF_SCOPE, policy, schema, slugs

### Community 47 - "verify-acces.mjs"
Cohesion: 0.20
Nodes (6): ALICE, BASE, BOB, consoleErrors, failures, LABELS

### Community 48 - "verify-degraded.mjs"
Cohesion: 0.20
Nodes (7): args, BASE, CLOSED_PAGES, failures, PUBLIC_PAGES, REGIME, UNKNOWN_RESOURCES

### Community 49 - "admin/page.tsx"
Cohesion: 0.36
Nodes (5): AdminQueuePage(), metadata, announcedDelay(), DELAY_TIERS, isSaturated()

### Community 50 - "deadlines/route.ts"
Cohesion: 0.36
Nodes (5): timingSafeEqualString(), purgeUnclaimedAssessments(), unclaimedCutoff(), PurgeSummary, purgeTechnicalData()

### Community 51 - "desinscription/[id]/page.tsx"
Cohesion: 0.39
Nodes (4): confirmUnsubscribe(), metadata, UnsubscribeButton(), desinscription

### Community 52 - "deadlines/compute.ts"
Cohesion: 0.33
Nodes (7): BAR_MILESTONES, computeDeadlines(), isRelevant(), MILESTONES, shiftMonths(), keys(), REF

### Community 53 - "wait.mjs"
Cohesion: 0.47
Nodes (6): answerScreens(), submitDiagnostic(), waitFor(), waitForText(), waitForTextChange(), waitForTextGone()

### Community 54 - "verify-checkout.mjs"
Cohesion: 0.22
Nodes (6): BASE, checkoutText, consent, consoleErrors, EMAIL, failures

### Community 55 - "verify-consultations.mjs"
Cohesion: 0.22
Nodes (6): BASE, consoleErrors, EMAIL, failures, local, slotDate

### Community 56 - "verify-ecoles.mjs"
Cohesion: 0.22
Nodes (6): BASE, candidateName, consoleErrors, EMAIL, failures, targetRow

### Community 57 - "verify-espace.mjs"
Cohesion: 0.22
Nodes (5): BASE, consoleErrors, declarative, EMAIL, failures

### Community 58 - "donnees/page.tsx"
Cohesion: 0.43
Nodes (4): EraseForm(), metadata, donnees, HELD_DATA

### Community 59 - "import-partnerships.mjs"
Cohesion: 0.25
Nodes (5): dataPath, db, partnerships, snapshotDate, universities

### Community 60 - "verify-legal.mjs"
Cohesion: 0.25
Nodes (5): BASE, consoleErrors, DOCUMENTS, EMAIL, failures

### Community 61 - "app/layout.tsx"
Cohesion: 0.29
Nodes (3): cormorant, dmSans, metadata

### Community 62 - "check-vocabulary.mjs"
Cohesion: 0.33
Nodes (5): ALLOWLIST, EXTS, FORBIDDEN, ROOTS, walk()

### Community 63 - "verify-questionnaire.mjs"
Cohesion: 0.29
Nodes (5): ANSWERS, BASE, consoleErrors, EMAIL, failures

### Community 64 - "verify-all.mjs"
Cohesion: 0.33
Nodes (3): broken, results, SUITES

### Community 65 - "limits.ts"
Cohesion: 0.60
Nodes (3): RFC-5321, boundedText(), validEmail()

### Community 66 - "package.json"
Cohesion: 0.40
Nodes (4): description, name, private, version

### Community 67 - ".prettierrc.json"
Cohesion: 0.40
Nodes (4): printWidth, semi, singleQuote, trailingComma

### Community 68 - "check-design-tokens.mjs"
Cohesion: 0.40
Nodes (3): EXTS, PALETTE, ROOTS

### Community 69 - "check-rules.mjs"
Cohesion: 0.40
Nodes (3): blocks, source, TODAY

### Community 70 - "check-suites.mjs"
Cohesion: 0.40
Nodes (3): failures, HELPER_MODULES, helpers

### Community 71 - "verify-animations.mjs"
Cohesion: 0.40
Nodes (3): consoleErrors, failures, longest

### Community 72 - "next.config.ts"
Cohesion: 0.50
Nodes (3): csp, nextConfig, securityHeaders

### Community 73 - "sign-in.mjs"
Cohesion: 0.83
Nodes (3): lastSignInLink(), mailLogPath(), signInByEmail()

## Knowledge Gaps
- **411 isolated node(s):** `session-start.sh script`, `printWidth`, `singleQuote`, `semi`, `trailingComma` (+406 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `colors` connect `tokens.ts` to `assessment/compute.ts`, `assemble.ts`, `ecoles/page.tsx`, `Simulator.tsx`, `resultat/[id]/page.tsx`, `alpha`, `documents/actions.ts`, `LegalPage.tsx`, `rapports/[id]/page.tsx`, `admin/consultations/page.tsx`, `paiement/[id]/page.tsx`, `roadmap/page.tsx`, `metriques/page.tsx`, `app/consultations/page.tsx`, `dashboard/page.tsx`, `reports.ts`, `AssessmentStore`, `Questionnaire.tsx`, `admin/page.tsx`, `desinscription/[id]/page.tsx`, `donnees/page.tsx`, `app/layout.tsx`, `Nav.tsx`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Why does `fonts` connect `tokens.ts` to `assessment/compute.ts`, `assemble.ts`, `ecoles/page.tsx`, `Simulator.tsx`, `resultat/[id]/page.tsx`, `alpha`, `documents/actions.ts`, `LegalPage.tsx`, `rapports/[id]/page.tsx`, `admin/consultations/page.tsx`, `paiement/[id]/page.tsx`, `roadmap/page.tsx`, `metriques/page.tsx`, `app/consultations/page.tsx`, `dashboard/page.tsx`, `reports.ts`, `AssessmentStore`, `Questionnaire.tsx`, `admin/page.tsx`, `desinscription/[id]/page.tsx`, `donnees/page.tsx`, `app/layout.tsx`, `Nav.tsx`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Why does `alpha` connect `alpha` to `assessment/compute.ts`, `ecoles/page.tsx`, `Simulator.tsx`, `resultat/[id]/page.tsx`, `documents/actions.ts`, `LegalPage.tsx`, `tokens.ts`, `rapports/[id]/page.tsx`, `admin/consultations/page.tsx`, `paiement/[id]/page.tsx`, `roadmap/page.tsx`, `metriques/page.tsx`, `app/consultations/page.tsx`, `dashboard/page.tsx`, `reports.ts`, `AssessmentStore`, `Questionnaire.tsx`, `admin/page.tsx`, `desinscription/[id]/page.tsx`, `donnees/page.tsx`, `Nav.tsx`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **What connects `session-start.sh script`, `printWidth`, `singleQuote` to the rest of the system?**
  _411 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `assessment/compute.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.050073637702503684 - nodes in this community are weakly interconnected._
- **Should `assemble.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.061018437225636525 - nodes in this community are weakly interconnected._
- **Should `ecoles/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08022598870056497 - nodes in this community are weakly interconnected._