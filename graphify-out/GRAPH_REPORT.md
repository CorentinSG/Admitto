# Graph Report - .  (2026-07-30)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1352 nodes · 3244 edges · 63 communities (56 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6e1d799a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- tokens.ts
- assessment/compute.ts
- dashboard/page.tsx
- exhaustive.test.ts
- assemble.ts
- eligibility.ts
- resultat/[id]/page.tsx
- ecoles/page.tsx
- stores.test.ts
- LegalPage.tsx
- currentAssessmentId
- scripts
- current.ts
- compilerOptions
- paiement/[id]/page.tsx
- devDependencies
- auth.ts
- app/consultations/page.tsx
- metriques/page.tsx
- admin/page.tsx
- admin/consultations/page.tsx
- booking.ts
- reports.ts
- dependencies
- assessments.ts
- stripe.ts
- verify-simulator.mjs
- booking.test.ts
- verify-backoffice.mjs
- verify-matrices.mjs
- check-legal.mjs
- verify-acces.mjs
- verify-dashboard.mjs
- verify-degraded.mjs
- admin/actions.ts
- rapports/[id]/page.tsx
- wait.mjs
- verify-checkout.mjs
- verify-consultations.mjs
- verify-ecoles.mjs
- verify-espace.mjs
- import-partnerships.mjs
- verify-legal.mjs
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
1. `colors` - 57 edges
2. `fonts` - 57 edges
3. `alpha` - 49 edges
4. `scripts` - 41 edges
5. `AssessmentStore` - 27 edges
6. `currentAssessmentId()` - 24 edges
7. `gradients` - 23 edges
8. `useInView()` - 21 edges
9. `Answers` - 21 edges
10. `usingDatabase()` - 21 edges

## Surprising Connections (you probably didn't know these)
- `ModulePage()` --calls--> `currentAssessmentId()`  [EXTRACTED]
  app/(app)/app/modules/[slug]/page.tsx → lib/auth/current.ts
- `ModulesPage()` --calls--> `currentAssessmentId()`  [EXTRACTED]
  app/(app)/app/modules/page.tsx → lib/auth/current.ts
- `SimulatorPage()` --calls--> `currentAssessmentId()`  [EXTRACTED]
  app/(app)/app/simulateur/page.tsx → lib/auth/current.ts
- `AdminQueuePage()` --calls--> `assembleReportLive()`  [EXTRACTED]
  app/(admin)/admin/page.tsx → lib/matrices/load.ts
- `PrintableReportPage()` --calls--> `assembleReportLive()`  [EXTRACTED]
  app/(admin)/admin/rapports/[id]/impression/page.tsx → lib/matrices/load.ts

## Import Cycles
- None detected.

## Communities (63 total, 7 thin omitted)

### Community 0 - "tokens.ts"
Cohesion: 0.07
Nodes (54): endSession(), SignOutButton(), cormorant, dmSans, metadata, Footer(), Nav(), Badge() (+46 more)

### Community 1 - "assessment/compute.ts"
Cohesion: 0.05
Nodes (71): requireBackoffice(), saveBlockRevision(), saveRuleRevision(), BlockForm(), BlockView, field, label, meta (+63 more)

### Community 2 - "dashboard/page.tsx"
Cohesion: 0.05
Nodes (74): setTaskStatus(), SELECTABLE, TaskStatusControl(), DashboardPage(), dateFr(), metadata, dateFr(), metadata (+66 more)

### Community 3 - "exhaustive.test.ts"
Cohesion: 0.05
Nodes (58): oneOf(), parseAnswers(), submitQuestionnaire(), metadata, Questionnaire(), intro, Option, Screen (+50 more)

### Community 4 - "assemble.ts"
Cohesion: 0.06
Nodes (52): ReportDocument(), AXIS_COMMENTS, AXIS_LABELS, NEXT_STEPS, OFFER_BLOCKS, REPORT_STATIC, RISK_BLOCKS, VERDICT_BLOCKS (+44 more)

### Community 5 - "eligibility.ts"
Cohesion: 0.06
Nodes (49): POST(), EMAIL_TEMPLATES, Assessment, baseUrl(), dispatchEmail(), emailVariables(), deductionVariables(), Eligibility (+41 more)

### Community 6 - "resultat/[id]/page.tsx"
Cohesion: 0.06
Nodes (40): AdminPartnershipsPage(), metadata, RELIABILITY_LABELS, accountsAvailable(), dateFr(), metadata, ResultPage(), FRENCH_UNIVERSITIES_DATA (+32 more)

### Community 7 - "ecoles/page.tsx"
Cohesion: 0.08
Nodes (48): addSchool(), removeSchool(), updateSchool(), dateFr(), EcolesPage(), metadata, AddForm(), body (+40 more)

### Community 8 - "stores.test.ts"
Cohesion: 0.08
Nodes (47): NUMERIC_FIELDS, parseInputs(), removeScenario(), saveScenario(), metadata, SimulatorPage(), inputStyle, labelStyle (+39 more)

### Community 9 - "LegalPage.tsx"
Cohesion: 0.06
Nodes (39): Block(), label, LegalPage(), metadata, metadata, requestSignIn(), metadata, CGV (+31 more)

### Community 10 - "currentAssessmentId"
Cohesion: 0.11
Nodes (33): removeDocument(), uploadDocument(), DocumentPanel(), DocumentView, DocumentsPage(), metadata, DOCUMENT_TYPE_HINTS, DOCUMENT_TYPE_LABELS (+25 more)

### Community 11 - "scripts"
Cohesion: 0.05
Nodes (41): scripts, build, check:all, check:legal, check:rules, check:skills, check:suites, check:tokens (+33 more)

### Community 12 - "current.ts"
Cohesion: 0.11
Nodes (27): eraseAccount(), EraseForm(), GET(), metadata, metadata, ModulesPage(), metadata, ModulePage() (+19 more)

### Community 13 - "compilerOptions"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, graphify-out, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 14 - "paiement/[id]/page.tsx"
Cohesion: 0.15
Nodes (18): POST(), startCheckout(), CheckoutButton(), CheckoutPage(), metadata, checkout, applyDeduction(), createDeduction() (+10 more)

### Community 15 - "devDependencies"
Cohesion: 0.08
Nodes (25): eslint, eslint-config-next, @eslint/eslintrc, devDependencies, eslint, eslint-config-next, @eslint/eslintrc, playwright (+17 more)

### Community 16 - "auth.ts"
Cohesion: 0.13
Nodes (13): BACKOFFICE_ROLES, isBackofficeRole(), Role, ROLES, { handlers, auth, signIn, signOut }, AUTH_EMAIL, { auth }, config (+5 more)

### Community 17 - "app/consultations/page.tsx"
Cohesion: 0.17
Nodes (13): bookConsultation(), cancelConsultation(), BookingForm(), CancelButton(), SlotView, ConsultationsPage(), metadata, slotLabel() (+5 more)

### Community 18 - "metriques/page.tsx"
Cohesion: 0.17
Nodes (13): AdminMetricsPage(), Card(), grid, metadata, computeMetrics(), formatMetric(), medianHours(), Metric (+5 more)

### Community 19 - "admin/page.tsx"
Cohesion: 0.16
Nodes (14): AdminQueuePage(), metadata, blockingPoints(), canSend(), missingDecisiveAnswers(), PATHS_REQUIRING_ARBITRATION, REVIEW_SEVERITIES, reviewChecklist() (+6 more)

### Community 20 - "admin/consultations/page.tsx"
Cohesion: 0.18
Nodes (12): closeSlot(), grantConsultations(), openSlot(), metadata, button, CloseSlotButton(), field, GrantForm() (+4 more)

### Community 21 - "booking.ts"
Cohesion: 0.25
Nodes (10): BookingDecision, BookingRequest, Entitlement, Booking, CONSULTATION_TYPES, ConsultationDefinition, ConsultationSlot, ConsultationType (+2 more)

### Community 22 - "reports.ts"
Cohesion: 0.15
Nodes (10): metadata, PrintableReportPage(), Deduction, CorrectionEntry, globalStore, REPORT_PRIORITIES, ReportPriority, ReportRow (+2 more)

### Community 23 - "dependencies"
Cohesion: 0.15
Nodes (13): @auth/prisma-adapter, next, next-auth, dependencies, @auth/prisma-adapter, next, next-auth, @prisma/client (+5 more)

### Community 24 - "assessments.ts"
Cohesion: 0.15
Nodes (5): DerivedProfile, AssessmentRow, AssessmentStore, globalStore, globalUnsub

### Community 25 - "stripe.ts"
Cohesion: 0.23
Nodes (8): PriceBreakdown, OfferCode, CheckoutRequest, disabledProvider, getPaymentProvider(), PaymentProvider, stripeProvider(), NOW

### Community 26 - "verify-simulator.mjs"
Cohesion: 0.17
Nodes (7): BASE, bourses, consoleErrors, EMAIL, failures, final, tuition

### Community 27 - "booking.test.ts"
Cohesion: 0.31
Nodes (10): AdminConsultationsPage(), slotLabel(), decideBooking(), remainingAllowance(), booking(), hoursFromNow(), NOW, request() (+2 more)

### Community 28 - "verify-backoffice.mjs"
Cohesion: 0.18
Nodes (8): BASE, blocked, boxes, detail, failures, printed, REQUESTER_EMAIL, review

### Community 29 - "verify-matrices.mjs"
Cohesion: 0.18
Nodes (5): BASE, consoleErrors, failures, LABELS, verdictForm

### Community 30 - "check-legal.mjs"
Cohesion: 0.20
Nodes (8): COVERED, failures, held, models, OUT_OF_SCOPE, policy, schema, slugs

### Community 31 - "verify-acces.mjs"
Cohesion: 0.20
Nodes (6): ALICE, BASE, BOB, consoleErrors, failures, LABELS

### Community 32 - "verify-dashboard.mjs"
Cohesion: 0.20
Nodes (7): BASE, consoleErrors, done, EMAIL, failures, interdits, roadmap

### Community 33 - "verify-degraded.mjs"
Cohesion: 0.20
Nodes (7): args, BASE, CLOSED_PAGES, failures, PUBLIC_PAGES, REGIME, UNKNOWN_RESOURCES

### Community 34 - "admin/actions.ts"
Cohesion: 0.44
Nodes (6): addCorrection(), setReportStatus(), ReportControls(), STATUS_LABELS, REPORT_STATUSES, ReportStatus

### Community 35 - "rapports/[id]/page.tsx"
Cohesion: 0.28
Nodes (5): setReviewPoint(), AdminReportPage(), metadata, ReviewChecklist(), ReviewPoint

### Community 36 - "wait.mjs"
Cohesion: 0.47
Nodes (6): answerScreens(), submitDiagnostic(), waitFor(), waitForText(), waitForTextChange(), waitForTextGone()

### Community 37 - "verify-checkout.mjs"
Cohesion: 0.22
Nodes (6): BASE, checkoutText, consent, consoleErrors, EMAIL, failures

### Community 38 - "verify-consultations.mjs"
Cohesion: 0.22
Nodes (6): BASE, consoleErrors, EMAIL, failures, local, slotDate

### Community 39 - "verify-ecoles.mjs"
Cohesion: 0.22
Nodes (6): BASE, candidateName, consoleErrors, EMAIL, failures, targetRow

### Community 40 - "verify-espace.mjs"
Cohesion: 0.22
Nodes (5): BASE, consoleErrors, declarative, EMAIL, failures

### Community 41 - "import-partnerships.mjs"
Cohesion: 0.25
Nodes (5): dataPath, db, partnerships, snapshotDate, universities

### Community 42 - "verify-legal.mjs"
Cohesion: 0.25
Nodes (5): BASE, consoleErrors, DOCUMENTS, EMAIL, failures

### Community 43 - "verify-questionnaire.mjs"
Cohesion: 0.29
Nodes (5): ANSWERS, BASE, consoleErrors, EMAIL, failures

### Community 44 - "verify-all.mjs"
Cohesion: 0.33
Nodes (3): broken, results, SUITES

### Community 45 - "package.json"
Cohesion: 0.40
Nodes (4): description, name, private, version

### Community 46 - ".prettierrc.json"
Cohesion: 0.40
Nodes (4): printWidth, semi, singleQuote, trailingComma

### Community 47 - "check-design-tokens.mjs"
Cohesion: 0.40
Nodes (3): EXTS, PALETTE, ROOTS

### Community 48 - "check-rules.mjs"
Cohesion: 0.40
Nodes (3): blocks, source, TODAY

### Community 49 - "check-suites.mjs"
Cohesion: 0.40
Nodes (3): failures, HELPER_MODULES, helpers

### Community 50 - "verify-animations.mjs"
Cohesion: 0.40
Nodes (3): consoleErrors, failures, longest

### Community 51 - "next.config.ts"
Cohesion: 0.50
Nodes (3): csp, nextConfig, securityHeaders

### Community 52 - "sign-in.mjs"
Cohesion: 0.83
Nodes (3): lastSignInLink(), mailLogPath(), signInByEmail()

## Knowledge Gaps
- **391 isolated node(s):** `session-start.sh script`, `printWidth`, `singleQuote`, `semi`, `trailingComma` (+386 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `colors` connect `tokens.ts` to `assessment/compute.ts`, `admin/actions.ts`, `rapports/[id]/page.tsx`, `dashboard/page.tsx`, `assemble.ts`, `resultat/[id]/page.tsx`, `ecoles/page.tsx`, `stores.test.ts`, `LegalPage.tsx`, `currentAssessmentId`, `exhaustive.test.ts`, `current.ts`, `paiement/[id]/page.tsx`, `app/consultations/page.tsx`, `metriques/page.tsx`, `admin/page.tsx`, `admin/consultations/page.tsx`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Why does `fonts` connect `tokens.ts` to `assessment/compute.ts`, `admin/actions.ts`, `rapports/[id]/page.tsx`, `dashboard/page.tsx`, `assemble.ts`, `resultat/[id]/page.tsx`, `ecoles/page.tsx`, `stores.test.ts`, `LegalPage.tsx`, `currentAssessmentId`, `exhaustive.test.ts`, `current.ts`, `paiement/[id]/page.tsx`, `app/consultations/page.tsx`, `metriques/page.tsx`, `admin/page.tsx`, `admin/consultations/page.tsx`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Why does `alpha` connect `tokens.ts` to `assessment/compute.ts`, `admin/actions.ts`, `rapports/[id]/page.tsx`, `dashboard/page.tsx`, `exhaustive.test.ts`, `resultat/[id]/page.tsx`, `ecoles/page.tsx`, `stores.test.ts`, `LegalPage.tsx`, `currentAssessmentId`, `current.ts`, `paiement/[id]/page.tsx`, `app/consultations/page.tsx`, `metriques/page.tsx`, `admin/page.tsx`, `admin/consultations/page.tsx`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **What connects `session-start.sh script`, `printWidth`, `singleQuote` to the rest of the system?**
  _391 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `tokens.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07091321377035663 - nodes in this community are weakly interconnected._
- **Should `assessment/compute.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0509020618556701 - nodes in this community are weakly interconnected._
- **Should `dashboard/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05416666666666667 - nodes in this community are weakly interconnected._