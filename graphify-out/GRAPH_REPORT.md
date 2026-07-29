# Graph Report - .  (2026-07-29)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1046 nodes · 2459 edges · 53 communities (46 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a7d78b2d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- tokens.ts
- stores.test.ts
- dashboard/page.tsx
- reports.ts
- questionnaire/types.ts
- resultat/[id]/page.tsx
- documents/actions.ts
- dispatch.ts
- scripts
- offers.ts
- assemble.ts
- compilerOptions
- devDependencies
- app/consultations/page.tsx
- engine-a/run.ts
- assessments.ts
- booking.ts
- score.ts
- modules.ts
- admin/consultations/page.tsx
- notifications/run.ts
- auth.config.ts
- AssessmentStore
- dependencies
- verify-simulator.mjs
- verify-backoffice.mjs
- verify-dashboard.mjs
- wait.mjs
- verify-checkout.mjs
- verify-consultations.mjs
- verify-espace.mjs
- import-partnerships.mjs
- estimate.ts
- check-vocabulary.mjs
- verify-questionnaire.mjs
- verify-all.mjs
- package.json
- .prettierrc.json
- check-design-tokens.mjs
- check-rules.mjs
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
1. `colors` - 47 edges
2. `fonts` - 47 edges
3. `alpha` - 41 edges
4. `scripts` - 34 edges
5. `currentAssessmentId()` - 26 edges
6. `gradients` - 23 edges
7. `useInView()` - 21 edges
8. `AssessmentStore` - 19 edges
9. `Answers` - 18 edges
10. `usingDatabase()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `ModulePage()` --calls--> `currentAssessmentId()`  [EXTRACTED]
  app/(app)/app/modules/[slug]/page.tsx → lib/auth/current.ts
- `ModulesPage()` --calls--> `currentAssessmentId()`  [EXTRACTED]
  app/(app)/app/modules/page.tsx → lib/auth/current.ts
- `Output()` --calls--> `formatUsd()`  [EXTRACTED]
  app/(app)/app/simulateur/Simulator.tsx → lib/simulator/compute.ts
- `FieldGroup` --references--> `ScenarioInputs`  [EXTRACTED]
  content/simulator.ts → lib/simulator/types.ts
- `AdminPartnershipsPage()` --calls--> `coverageRate()`  [EXTRACTED]
  app/(admin)/admin/partenariats/page.tsx → lib/partnerships/detect.ts

## Import Cycles
- None detected.

## Communities (53 total, 7 thin omitted)

### Community 0 - "tokens.ts"
Cohesion: 0.06
Nodes (58): setReviewPoint(), metadata, ReviewChecklist(), endSession(), SignOutButton(), cormorant, dmSans, metadata (+50 more)

### Community 1 - "stores.test.ts"
Cohesion: 0.06
Nodes (54): DocumentsPage(), NUMERIC_FIELDS, parseInputs(), removeScenario(), saveScenario(), metadata, SimulatorPage(), inputStyle (+46 more)

### Community 2 - "dashboard/page.tsx"
Cohesion: 0.07
Nodes (58): setTaskStatus(), SELECTABLE, TaskStatusControl(), DashboardPage(), dateFr(), metadata, dateFr(), metadata (+50 more)

### Community 3 - "reports.ts"
Cohesion: 0.06
Nodes (45): addCorrection(), setReportStatus(), AdminMetricsPage(), Card(), grid, metadata, AdminQueuePage(), metadata (+37 more)

### Community 4 - "questionnaire/types.ts"
Cohesion: 0.06
Nodes (49): POST(), oneOf(), parseAnswers(), submitQuestionnaire(), intro, Option, Screen, ui (+41 more)

### Community 5 - "resultat/[id]/page.tsx"
Cohesion: 0.07
Nodes (37): AdminPartnershipsPage(), metadata, RELIABILITY_LABELS, accountsAvailable(), dateFr(), metadata, ResultPage(), FRENCH_UNIVERSITIES_DATA (+29 more)

### Community 6 - "documents/actions.ts"
Cohesion: 0.11
Nodes (31): removeDocument(), uploadDocument(), DocumentPanel(), DocumentView, metadata, DOCUMENT_TYPE_HINTS, DOCUMENT_TYPE_LABELS, REFUSAL_MESSAGES (+23 more)

### Community 7 - "dispatch.ts"
Cohesion: 0.09
Nodes (31): EMAIL_TEMPLATES, baseUrl(), dispatchEmail(), emailVariables(), SUBMITTED, VARIABLES, ALLOWED_EMAIL_VARIABLES, AllowedEmailVariable (+23 more)

### Community 8 - "scripts"
Cohesion: 0.06
Nodes (34): scripts, build, check:all, check:rules, check:skills, check:tokens, check:vocabulary, db:deploy (+26 more)

### Community 9 - "offers.ts"
Cohesion: 0.13
Nodes (24): POST(), startCheckout(), CheckoutPage(), applyDeduction(), createDeduction(), DEDUCTIBLE_ON, Deduction, isDeductibleOn() (+16 more)

### Community 10 - "assemble.ts"
Cohesion: 0.13
Nodes (24): AXIS_COMMENTS, AXIS_LABELS, NEXT_STEPS, OFFER_BLOCKS, REPORT_STATIC, RISK_BLOCKS, VERDICT_BLOCKS, Verdict (+16 more)

### Community 11 - "compilerOptions"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, graphify-out, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 12 - "devDependencies"
Cohesion: 0.08
Nodes (25): eslint, eslint-config-next, @eslint/eslintrc, devDependencies, eslint, eslint-config-next, @eslint/eslintrc, playwright (+17 more)

### Community 13 - "app/consultations/page.tsx"
Cohesion: 0.15
Nodes (13): bookConsultation(), cancelConsultation(), BookingForm(), CancelButton(), SlotView, ConsultationsPage(), metadata, slotLabel() (+5 more)

### Community 14 - "engine-a/run.ts"
Cohesion: 0.19
Nodes (16): evaluateCondition(), fireRules(), StructuredProfile, RULES, TEXT_BLOCKS, PATH_PRIORITY, runEngineA(), profileOf() (+8 more)

### Community 15 - "assessments.ts"
Cohesion: 0.17
Nodes (15): Assessment, CostEstimate, BAR_MILESTONES, computeDeadlines(), Deadline, isRelevant(), MILESTONES, shiftMonths() (+7 more)

### Community 16 - "booking.ts"
Cohesion: 0.19
Nodes (19): bookableSlots(), BookingDecision, BookingRequest, decideBooking(), Entitlement, remainingAllowance(), booking(), hoursFromNow() (+11 more)

### Community 17 - "score.ts"
Cohesion: 0.19
Nodes (16): academicStrength(), buildVerdictInput(), clamp(), financialFit(), immigrationRisk(), professionalRealism(), scoreAxes(), REF (+8 more)

### Community 18 - "modules.ts"
Cohesion: 0.23
Nodes (15): metadata, ModulesPage(), metadata, ModulePage(), findModule(), isModulePublished(), moduleBlockers(), MODULES (+7 more)

### Community 19 - "admin/consultations/page.tsx"
Cohesion: 0.18
Nodes (13): closeSlot(), grantConsultations(), openSlot(), AdminConsultationsPage(), metadata, slotLabel(), button, CloseSlotButton() (+5 more)

### Community 20 - "notifications/run.ts"
Cohesion: 0.22
Nodes (14): daysBetween(), deadlineList(), DeadlineNotice, dueNotices(), mostUrgentSent(), NOTICE_DAYS, noticeId(), noticeLead() (+6 more)

### Community 21 - "auth.config.ts"
Cohesion: 0.17
Nodes (11): BACKOFFICE_ROLES, isBackofficeRole(), Role, ROLES, { auth }, config, JWT, next-auth (+3 more)

### Community 22 - "AssessmentStore"
Cohesion: 0.16
Nodes (8): dateFr(), metadata, PrintableReportPage(), formatUsd(), assembleReport(), sourcesUsed(), report(), AssessmentStore

### Community 23 - "dependencies"
Cohesion: 0.15
Nodes (13): @auth/prisma-adapter, next, next-auth, dependencies, @auth/prisma-adapter, next, next-auth, @prisma/client (+5 more)

### Community 24 - "verify-simulator.mjs"
Cohesion: 0.17
Nodes (7): BASE, bourses, consoleErrors, EMAIL, failures, final, tuition

### Community 25 - "verify-backoffice.mjs"
Cohesion: 0.18
Nodes (8): BASE, blocked, boxes, detail, failures, printed, REQUESTER_EMAIL, review

### Community 26 - "verify-dashboard.mjs"
Cohesion: 0.20
Nodes (7): BASE, consoleErrors, done, EMAIL, failures, interdits, roadmap

### Community 27 - "wait.mjs"
Cohesion: 0.47
Nodes (6): answerScreens(), submitDiagnostic(), waitFor(), waitForText(), waitForTextChange(), waitForTextGone()

### Community 28 - "verify-checkout.mjs"
Cohesion: 0.22
Nodes (6): BASE, checkoutText, consent, consoleErrors, EMAIL, failures

### Community 29 - "verify-consultations.mjs"
Cohesion: 0.22
Nodes (6): BASE, consoleErrors, EMAIL, failures, local, slotDate

### Community 30 - "verify-espace.mjs"
Cohesion: 0.22
Nodes (5): BASE, consoleErrors, declarative, EMAIL, failures

### Community 31 - "import-partnerships.mjs"
Cohesion: 0.25
Nodes (5): dataPath, db, partnerships, snapshotDate, universities

### Community 32 - "estimate.ts"
Cohesion: 0.33
Nodes (6): ACADEMIC, add(), BAR, CostRange, estimateCosts(), LIVING

### Community 33 - "check-vocabulary.mjs"
Cohesion: 0.33
Nodes (5): ALLOWLIST, EXTS, FORBIDDEN, ROOTS, walk()

### Community 34 - "verify-questionnaire.mjs"
Cohesion: 0.29
Nodes (5): ANSWERS, BASE, consoleErrors, EMAIL, failures

### Community 35 - "verify-all.mjs"
Cohesion: 0.33
Nodes (3): broken, results, SUITES

### Community 36 - "package.json"
Cohesion: 0.40
Nodes (4): description, name, private, version

### Community 37 - ".prettierrc.json"
Cohesion: 0.40
Nodes (4): printWidth, semi, singleQuote, trailingComma

### Community 38 - "check-design-tokens.mjs"
Cohesion: 0.40
Nodes (3): EXTS, PALETTE, ROOTS

### Community 39 - "check-rules.mjs"
Cohesion: 0.40
Nodes (3): blocks, source, TODAY

### Community 40 - "verify-animations.mjs"
Cohesion: 0.40
Nodes (3): consoleErrors, failures, longest

### Community 41 - "next.config.ts"
Cohesion: 0.50
Nodes (3): csp, nextConfig, securityHeaders

### Community 42 - "sign-in.mjs"
Cohesion: 0.83
Nodes (3): lastSignInLink(), mailLogPath(), signInByEmail()

## Knowledge Gaps
- **299 isolated node(s):** `session-start.sh script`, `printWidth`, `singleQuote`, `semi`, `trailingComma` (+294 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `colors` connect `tokens.ts` to `stores.test.ts`, `dashboard/page.tsx`, `reports.ts`, `resultat/[id]/page.tsx`, `documents/actions.ts`, `app/consultations/page.tsx`, `modules.ts`, `admin/consultations/page.tsx`, `AssessmentStore`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Why does `fonts` connect `tokens.ts` to `stores.test.ts`, `dashboard/page.tsx`, `reports.ts`, `resultat/[id]/page.tsx`, `documents/actions.ts`, `app/consultations/page.tsx`, `modules.ts`, `admin/consultations/page.tsx`, `AssessmentStore`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Why does `alpha` connect `tokens.ts` to `stores.test.ts`, `dashboard/page.tsx`, `reports.ts`, `resultat/[id]/page.tsx`, `documents/actions.ts`, `app/consultations/page.tsx`, `modules.ts`, `admin/consultations/page.tsx`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **What connects `session-start.sh script`, `printWidth`, `singleQuote` to the rest of the system?**
  _299 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `tokens.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06201155283724091 - nodes in this community are weakly interconnected._
- **Should `stores.test.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.061754385964912284 - nodes in this community are weakly interconnected._
- **Should `dashboard/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0669710806697108 - nodes in this community are weakly interconnected._