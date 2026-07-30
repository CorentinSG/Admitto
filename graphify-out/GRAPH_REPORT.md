# Graph Report - .  (2026-07-30)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1233 nodes · 2933 edges · 65 communities (57 shown, 8 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0c95777d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- tokens.ts
- dashboard/page.tsx
- app/consultations/page.tsx
- stores.test.ts
- eligibility.ts
- ecoles/page.tsx
- resultat/[id]/page.tsx
- documents/actions.ts
- paiement/[id]/page.tsx
- scripts
- LegalPage.tsx
- assemble.ts
- compilerOptions
- devDependencies
- assessments.ts
- engine-a/run.ts
- score.ts
- modules.ts
- rate-limit.ts
- metriques/page.tsx
- questionnaire/types.ts
- Questionnaire.tsx
- auth.config.ts
- rapports/[id]/page.tsx
- review.ts
- reportStore
- admin/page.tsx
- dependencies
- verify-simulator.mjs
- verify-backoffice.mjs
- Answers
- check-legal.mjs
- verify-dashboard.mjs
- deadlines/route.ts
- visibility.ts
- wait.mjs
- verify-checkout.mjs
- verify-consultations.mjs
- verify-ecoles.mjs
- verify-espace.mjs
- reports.ts
- import-partnerships.mjs
- verify-legal.mjs
- check-vocabulary.mjs
- verify-questionnaire.mjs
- AssessmentStore
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
1. `colors` - 55 edges
2. `fonts` - 55 edges
3. `alpha` - 48 edges
4. `scripts` - 38 edges
5. `AssessmentStore` - 27 edges
6. `currentAssessmentId()` - 26 edges
7. `gradients` - 23 edges
8. `useInView()` - 21 edges
9. `usingDatabase()` - 20 edges
10. `Answers` - 19 edges

## Surprising Connections (you probably didn't know these)
- `DocumentsPage()` --calls--> `currentAssessmentId()`  [EXTRACTED]
  app/(app)/app/documents/page.tsx → lib/auth/current.ts
- `ModulePage()` --calls--> `currentAssessmentId()`  [EXTRACTED]
  app/(app)/app/modules/[slug]/page.tsx → lib/auth/current.ts
- `ModulesPage()` --calls--> `currentAssessmentId()`  [EXTRACTED]
  app/(app)/app/modules/page.tsx → lib/auth/current.ts
- `SimulatorPage()` --calls--> `currentAssessmentId()`  [EXTRACTED]
  app/(app)/app/simulateur/page.tsx → lib/auth/current.ts
- `Output()` --calls--> `formatUsd()`  [EXTRACTED]
  app/(app)/app/simulateur/Simulator.tsx → lib/simulator/compute.ts

## Import Cycles
- None detected.

## Communities (65 total, 8 thin omitted)

### Community 0 - "tokens.ts"
Cohesion: 0.06
Nodes (64): SELECTABLE, eraseAccount(), EraseForm(), metadata, endSession(), SignOutButton(), cormorant, dmSans (+56 more)

### Community 1 - "dashboard/page.tsx"
Cohesion: 0.05
Nodes (74): setTaskStatus(), TaskStatusControl(), DashboardPage(), dateFr(), metadata, dateFr(), metadata, RoadmapPage() (+66 more)

### Community 2 - "app/consultations/page.tsx"
Cohesion: 0.07
Nodes (47): closeSlot(), grantConsultations(), openSlot(), AdminConsultationsPage(), metadata, slotLabel(), button, CloseSlotButton() (+39 more)

### Community 3 - "stores.test.ts"
Cohesion: 0.07
Nodes (50): GET(), NUMERIC_FIELDS, parseInputs(), removeScenario(), saveScenario(), metadata, SimulatorPage(), inputStyle (+42 more)

### Community 4 - "eligibility.ts"
Cohesion: 0.06
Nodes (48): POST(), EMAIL_TEMPLATES, baseUrl(), dispatchEmail(), emailVariables(), deductionVariables(), Eligibility, Ineligible (+40 more)

### Community 5 - "ecoles/page.tsx"
Cohesion: 0.08
Nodes (48): addSchool(), removeSchool(), updateSchool(), dateFr(), EcolesPage(), metadata, AddForm(), body (+40 more)

### Community 6 - "resultat/[id]/page.tsx"
Cohesion: 0.08
Nodes (30): AdminPartnershipsPage(), metadata, RELIABILITY_LABELS, accountsAvailable(), dateFr(), metadata, ResultPage(), FRENCH_UNIVERSITIES_DATA (+22 more)

### Community 7 - "documents/actions.ts"
Cohesion: 0.11
Nodes (32): removeDocument(), uploadDocument(), DocumentPanel(), DocumentView, DocumentsPage(), metadata, DOCUMENT_TYPE_HINTS, DOCUMENT_TYPE_LABELS (+24 more)

### Community 8 - "paiement/[id]/page.tsx"
Cohesion: 0.10
Nodes (26): POST(), startCheckout(), CheckoutButton(), CheckoutPage(), metadata, checkout, applyDeduction(), createDeduction() (+18 more)

### Community 9 - "scripts"
Cohesion: 0.05
Nodes (38): scripts, build, check:all, check:legal, check:rules, check:skills, check:suites, check:tokens (+30 more)

### Community 10 - "LegalPage.tsx"
Cohesion: 0.14
Nodes (20): Block(), label, LegalPage(), metadata, metadata, metadata, CGV, CONFIDENTIALITE (+12 more)

### Community 11 - "assemble.ts"
Cohesion: 0.13
Nodes (23): AXIS_COMMENTS, AXIS_LABELS, NEXT_STEPS, OFFER_BLOCKS, REPORT_STATIC, RISK_BLOCKS, VERDICT_BLOCKS, Verdict (+15 more)

### Community 12 - "compilerOptions"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, graphify-out, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 13 - "devDependencies"
Cohesion: 0.08
Nodes (25): eslint, eslint-config-next, @eslint/eslintrc, devDependencies, eslint, eslint-config-next, @eslint/eslintrc, playwright (+17 more)

### Community 14 - "assessments.ts"
Cohesion: 0.15
Nodes (15): PATH_LABELS, Assessment, ACADEMIC, add(), BAR, CostEstimate, CostRange, estimateCosts() (+7 more)

### Community 15 - "engine-a/run.ts"
Cohesion: 0.19
Nodes (15): evaluateCondition(), fireRules(), StructuredProfile, RULES, TEXT_BLOCKS, PATH_PRIORITY, runEngineA(), profileOf() (+7 more)

### Community 16 - "score.ts"
Cohesion: 0.19
Nodes (16): academicStrength(), buildVerdictInput(), clamp(), financialFit(), immigrationRisk(), professionalRealism(), scoreAxes(), REF (+8 more)

### Community 17 - "modules.ts"
Cohesion: 0.23
Nodes (15): metadata, ModulesPage(), metadata, ModulePage(), findModule(), isModulePublished(), moduleBlockers(), MODULES (+7 more)

### Community 18 - "rate-limit.ts"
Cohesion: 0.16
Nodes (14): submitQuestionnaire(), security, callerIp(), checkRateLimit(), globalStore, Limit, purgeRateLimitHits(), RATE_LIMIT_SCOPES (+6 more)

### Community 19 - "metriques/page.tsx"
Cohesion: 0.17
Nodes (13): AdminMetricsPage(), Card(), grid, metadata, computeMetrics(), formatMetric(), medianHours(), Metric (+5 more)

### Community 20 - "questionnaire/types.ts"
Cohesion: 0.16
Nodes (17): oneOf(), parseAnswers(), BUDGET, CareerGoal, EDUCATION, ENGLISH, FOREIGN_BAR, ForeignBar (+9 more)

### Community 21 - "Questionnaire.tsx"
Cohesion: 0.15
Nodes (13): metadata, Questionnaire(), intro, Option, Screen, SCREENS, ui, UNIVERSITIES (+5 more)

### Community 22 - "auth.config.ts"
Cohesion: 0.17
Nodes (11): BACKOFFICE_ROLES, isBackofficeRole(), Role, ROLES, { auth }, config, JWT, next-auth (+3 more)

### Community 23 - "rapports/[id]/page.tsx"
Cohesion: 0.21
Nodes (10): addCorrection(), setReportStatus(), setReviewPoint(), metadata, ReportControls(), ReviewChecklist(), STATUS_LABELS, ReviewPoint (+2 more)

### Community 24 - "review.ts"
Cohesion: 0.18
Nodes (14): AdminQueuePage(), AdminReportPage(), blockingPoints(), canSend(), missingDecisiveAnswers(), PATHS_REQUIRING_ARBITRATION, REVIEW_SEVERITIES, reviewChecklist() (+6 more)

### Community 25 - "reportStore"
Cohesion: 0.14
Nodes (9): metadata, ReportDocument(), universityName(), formatUsd(), assembleReport(), Report, sourcesUsed(), report() (+1 more)

### Community 26 - "admin/page.tsx"
Cohesion: 0.22
Nodes (6): metadata, metadata, rapport, announcedDelay(), DELAY_TIERS, isSaturated()

### Community 27 - "dependencies"
Cohesion: 0.15
Nodes (13): @auth/prisma-adapter, next, next-auth, dependencies, @auth/prisma-adapter, next, next-auth, @prisma/client (+5 more)

### Community 28 - "verify-simulator.mjs"
Cohesion: 0.17
Nodes (7): BASE, bourses, consoleErrors, EMAIL, failures, final, tuition

### Community 29 - "verify-backoffice.mjs"
Cohesion: 0.18
Nodes (8): BASE, blocked, boxes, detail, failures, printed, REQUESTER_EMAIL, review

### Community 30 - "Answers"
Cohesion: 0.31
Nodes (8): BAR_MILESTONES, computeDeadlines(), isRelevant(), MILESTONES, shiftMonths(), keys(), REF, Answers

### Community 31 - "check-legal.mjs"
Cohesion: 0.20
Nodes (8): COVERED, failures, held, models, OUT_OF_SCOPE, policy, schema, slugs

### Community 32 - "verify-dashboard.mjs"
Cohesion: 0.20
Nodes (7): BASE, consoleErrors, done, EMAIL, failures, interdits, roadmap

### Community 33 - "deadlines/route.ts"
Cohesion: 0.36
Nodes (5): timingSafeEqualString(), purgeUnclaimedAssessments(), unclaimedCutoff(), PurgeSummary, purgeTechnicalData()

### Community 34 - "visibility.ts"
Cohesion: 0.50
Nodes (7): allowsTooEarlyGoal(), careerGoalOptions(), isAlreadyEnrolled(), needsVisaBranch(), progress(), showsForeignBarScreen(), visibleScreens()

### Community 35 - "wait.mjs"
Cohesion: 0.47
Nodes (6): answerScreens(), submitDiagnostic(), waitFor(), waitForText(), waitForTextChange(), waitForTextGone()

### Community 36 - "verify-checkout.mjs"
Cohesion: 0.22
Nodes (6): BASE, checkoutText, consent, consoleErrors, EMAIL, failures

### Community 37 - "verify-consultations.mjs"
Cohesion: 0.22
Nodes (6): BASE, consoleErrors, EMAIL, failures, local, slotDate

### Community 38 - "verify-ecoles.mjs"
Cohesion: 0.22
Nodes (6): BASE, candidateName, consoleErrors, EMAIL, failures, targetRow

### Community 39 - "verify-espace.mjs"
Cohesion: 0.22
Nodes (5): BASE, consoleErrors, declarative, EMAIL, failures

### Community 40 - "reports.ts"
Cohesion: 0.25
Nodes (6): CorrectionEntry, globalStore, REPORT_PRIORITIES, ReportPriority, ReportRow, withCorrections

### Community 41 - "import-partnerships.mjs"
Cohesion: 0.25
Nodes (5): dataPath, db, partnerships, snapshotDate, universities

### Community 42 - "verify-legal.mjs"
Cohesion: 0.25
Nodes (5): BASE, consoleErrors, DOCUMENTS, EMAIL, failures

### Community 43 - "check-vocabulary.mjs"
Cohesion: 0.33
Nodes (5): ALLOWLIST, EXTS, FORBIDDEN, ROOTS, walk()

### Community 44 - "verify-questionnaire.mjs"
Cohesion: 0.29
Nodes (5): ANSWERS, BASE, consoleErrors, EMAIL, failures

### Community 46 - "verify-all.mjs"
Cohesion: 0.33
Nodes (3): broken, results, SUITES

### Community 47 - "package.json"
Cohesion: 0.40
Nodes (4): description, name, private, version

### Community 48 - ".prettierrc.json"
Cohesion: 0.40
Nodes (4): printWidth, semi, singleQuote, trailingComma

### Community 49 - "check-design-tokens.mjs"
Cohesion: 0.40
Nodes (3): EXTS, PALETTE, ROOTS

### Community 50 - "check-rules.mjs"
Cohesion: 0.40
Nodes (3): blocks, source, TODAY

### Community 51 - "check-suites.mjs"
Cohesion: 0.40
Nodes (3): failures, HELPER_MODULES, helpers

### Community 52 - "verify-animations.mjs"
Cohesion: 0.40
Nodes (3): consoleErrors, failures, longest

### Community 53 - "next.config.ts"
Cohesion: 0.50
Nodes (3): csp, nextConfig, securityHeaders

### Community 54 - "sign-in.mjs"
Cohesion: 0.83
Nodes (3): lastSignInLink(), mailLogPath(), signInByEmail()

## Knowledge Gaps
- **356 isolated node(s):** `session-start.sh script`, `printWidth`, `singleQuote`, `semi`, `trailingComma` (+351 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `colors` connect `tokens.ts` to `dashboard/page.tsx`, `app/consultations/page.tsx`, `stores.test.ts`, `ecoles/page.tsx`, `resultat/[id]/page.tsx`, `documents/actions.ts`, `paiement/[id]/page.tsx`, `LegalPage.tsx`, `modules.ts`, `metriques/page.tsx`, `Questionnaire.tsx`, `rapports/[id]/page.tsx`, `reportStore`, `admin/page.tsx`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Why does `fonts` connect `tokens.ts` to `dashboard/page.tsx`, `app/consultations/page.tsx`, `stores.test.ts`, `ecoles/page.tsx`, `resultat/[id]/page.tsx`, `documents/actions.ts`, `paiement/[id]/page.tsx`, `LegalPage.tsx`, `modules.ts`, `metriques/page.tsx`, `Questionnaire.tsx`, `rapports/[id]/page.tsx`, `reportStore`, `admin/page.tsx`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Why does `alpha` connect `tokens.ts` to `dashboard/page.tsx`, `app/consultations/page.tsx`, `stores.test.ts`, `ecoles/page.tsx`, `resultat/[id]/page.tsx`, `documents/actions.ts`, `paiement/[id]/page.tsx`, `LegalPage.tsx`, `modules.ts`, `metriques/page.tsx`, `Questionnaire.tsx`, `rapports/[id]/page.tsx`, `admin/page.tsx`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **What connects `session-start.sh script`, `printWidth`, `singleQuote` to the rest of the system?**
  _356 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `tokens.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05658709106984969 - nodes in this community are weakly interconnected._
- **Should `dashboard/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.053289473684210525 - nodes in this community are weakly interconnected._
- **Should `app/consultations/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07146087743102668 - nodes in this community are weakly interconnected._