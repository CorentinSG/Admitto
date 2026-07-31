# Graph Report - /home/user/Admitto  (2026-07-31)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1447 nodes · 3438 edges · 76 communities (68 shown, 8 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d696114c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- tokens.ts
- stores.test.ts
- eligibility.ts
- app/consultations/page.tsx
- ecoles/page.tsx
- resultat/[id]/page.tsx
- paiement/[id]/page.tsx
- currentAssessmentId
- matrices/page.tsx
- log.ts
- scripts
- dashboard/page.tsx
- assemble.ts
- compilerOptions
- devDependencies
- exhaustive.test.ts
- rapports/[id]/page.tsx
- assessment/compute.ts
- timeline.ts
- generate.ts
- Answers
- modules.ts
- blocks.ts
- auth.config.ts
- reports.ts
- deadlines.ts
- rapport/[id]/page.tsx
- analytics/events.ts
- assessments.ts
- roadmap/types.ts
- Questionnaire.tsx
- dependencies
- derive.ts
- visibility.ts
- verify-dashboard.mjs
- verify-simulator.mjs
- verify-backoffice.mjs
- verify-matrices.mjs
- metriques/page.tsx
- connexion/actions.ts
- check-legal.mjs
- verify-acces.mjs
- verify-accessibilite.mjs
- verify-degraded.mjs
- admin/page.tsx
- notifications/run.ts
- wait.mjs
- verify-checkout.mjs
- verify-consultations.mjs
- verify-ecoles.mjs
- verify-espace.mjs
- import-partnerships.mjs
- verify-legal.mjs
- check-vocabulary.mjs
- verify-questionnaire.mjs
- AssessmentStore
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
4. `scripts` - 42 edges
5. `AssessmentStore` - 27 edges
6. `gradients` - 23 edges
7. `Answers` - 22 edges
8. `usingDatabase()` - 22 edges
9. `currentAssessmentId()` - 20 edges
10. `useInView()` - 18 edges

## Surprising Connections (you probably didn't know these)
- `PrintableReportPage()` --calls--> `assembleReportLive()`  [EXTRACTED]
  app/(admin)/admin/rapports/[id]/impression/page.tsx → lib/matrices/load.ts
- `POST()` --calls--> `log()`  [EXTRACTED]
  app/api/stripe/webhook/route.ts → lib/observability/log.ts
- `FieldGroup` --references--> `ScenarioInputs`  [EXTRACTED]
  content/simulator.ts → lib/simulator/types.ts
- `setTaskStatus()` --calls--> `currentAssessmentId()`  [EXTRACTED]
  app/(app)/app/actions.ts → lib/auth/current.ts
- `saveScenario()` --calls--> `currentAssessmentId()`  [EXTRACTED]
  app/(app)/app/simulateur/actions.ts → lib/auth/current.ts

## Import Cycles
- None detected.

## Communities (76 total, 8 thin omitted)

### Community 0 - "tokens.ts"
Cohesion: 0.05
Nodes (70): endSession(), SignOutButton(), ErrorScreen(), cormorant, dmSans, metadata, Footer(), label (+62 more)

### Community 1 - "stores.test.ts"
Cohesion: 0.06
Nodes (55): eraseAccount(), EraseForm(), GET(), metadata, NUMERIC_FIELDS, parseInputs(), removeScenario(), saveScenario() (+47 more)

### Community 2 - "eligibility.ts"
Cohesion: 0.06
Nodes (50): EMAIL_TEMPLATES, computeMetrics(), formatMetric(), medianHours(), Metric, Metrics, MetricsInput, rate() (+42 more)

### Community 3 - "app/consultations/page.tsx"
Cohesion: 0.07
Nodes (46): closeSlot(), grantConsultations(), openSlot(), AdminConsultationsPage(), metadata, slotLabel(), button, CloseSlotButton() (+38 more)

### Community 4 - "ecoles/page.tsx"
Cohesion: 0.08
Nodes (42): addSchool(), removeSchool(), updateSchool(), dateFr(), EcolesPage(), metadata, body, CandidateView (+34 more)

### Community 5 - "resultat/[id]/page.tsx"
Cohesion: 0.07
Nodes (36): metadata, RELIABILITY_LABELS, accountsAvailable(), dateFr(), metadata, ResultPage(), FRENCH_UNIVERSITIES_DATA, IMPORT_SOURCE (+28 more)

### Community 6 - "paiement/[id]/page.tsx"
Cohesion: 0.07
Nodes (36): POST(), startCheckout(), CheckoutButton(), metadata, checkout, journalId(), ANSWERS, later() (+28 more)

### Community 7 - "currentAssessmentId"
Cohesion: 0.10
Nodes (33): removeDocument(), uploadDocument(), DocumentPanel(), DocumentView, metadata, SimulatorPage(), DOCUMENT_TYPE_HINTS, DOCUMENT_TYPE_LABELS (+25 more)

### Community 8 - "matrices/page.tsx"
Cohesion: 0.09
Nodes (29): requireBackoffice(), saveBlockRevision(), saveRuleRevision(), BlockForm(), BlockView, field, label, meta (+21 more)

### Community 9 - "log.ts"
Cohesion: 0.08
Nodes (29): POST(), onRequestError(), timingSafeEqualString(), runEmailSequence(), purgeUnclaimedAssessments(), unclaimedCutoff(), runDeadlineNotifications(), clean() (+21 more)

### Community 10 - "scripts"
Cohesion: 0.05
Nodes (42): scripts, build, check:all, check:legal, check:rules, check:skills, check:suites, check:tokens (+34 more)

### Community 11 - "dashboard/page.tsx"
Cohesion: 0.10
Nodes (27): setTaskStatus(), SELECTABLE, TaskStatusControl(), DashboardPage(), dateFr(), metadata, dateFr(), metadata (+19 more)

### Community 12 - "assemble.ts"
Cohesion: 0.09
Nodes (34): AXIS_COMMENTS, AXIS_LABELS, NEXT_STEPS, OFFER_BLOCKS, REPORT_STATIC, RISK_BLOCKS, VERDICT_BLOCKS, AXES (+26 more)

### Community 13 - "compilerOptions"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, graphify-out, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 14 - "devDependencies"
Cohesion: 0.07
Nodes (27): axe-core, eslint, eslint-config-next, @eslint/eslintrc, devDependencies, axe-core, eslint, eslint-config-next (+19 more)

### Community 15 - "exhaustive.test.ts"
Cohesion: 0.14
Nodes (21): oneOf(), parseAnswers(), Combo, cycles, isRealDate(), problemsOf(), REFERENCE, PRELIMINARY_PATHS (+13 more)

### Community 16 - "rapports/[id]/page.tsx"
Cohesion: 0.12
Nodes (17): setReviewPoint(), metadata, ReportControls(), ReviewChecklist(), blockingPoints(), canSend(), missingDecisiveAnswers(), PATHS_REQUIRING_ARBITRATION (+9 more)

### Community 17 - "assessment/compute.ts"
Cohesion: 0.16
Nodes (19): PATH_LABELS, result, computeAssessment(), evaluateCondition(), fireRules(), StructuredProfile, RULES, TEXT_BLOCKS (+11 more)

### Community 18 - "timeline.ts"
Cohesion: 0.13
Nodes (19): BAR_MILESTONES, computeDeadlines(), Deadline, isRelevant(), MILESTONES, shiftMonths(), keys(), REF (+11 more)

### Community 19 - "generate.ts"
Cohesion: 0.18
Nodes (21): TASK_TEMPLATES, activePhases(), applicableTasks(), dueDateFor(), generateRoadmap(), initialStatus(), PHASE_ORDER, phaseIndex() (+13 more)

### Community 20 - "Answers"
Cohesion: 0.19
Nodes (18): ACADEMIC, add(), BAR, CostEstimate, CostRange, estimateCosts(), formatUsd(), LIVING (+10 more)

### Community 22 - "modules.ts"
Cohesion: 0.23
Nodes (13): metadata, metadata, findModule(), isModulePublished(), moduleBlockers(), MODULES, modulesCopy, PRODUCTION_ORDER (+5 more)

### Community 23 - "blocks.ts"
Cohesion: 0.14
Nodes (25): BLOCK_REGISTRY, BlockDecision, BlockDefinition, BlockKind, BlockRevisionRow, buildRegistry(), checkText(), clean() (+17 more)

### Community 24 - "auth.config.ts"
Cohesion: 0.17
Nodes (11): BACKOFFICE_ROLES, isBackofficeRole(), Role, ROLES, { auth }, config, JWT, next-auth (+3 more)

### Community 25 - "reports.ts"
Cohesion: 0.21
Nodes (11): addCorrection(), setReportStatus(), STATUS_LABELS, CorrectionEntry, globalStore, REPORT_PRIORITIES, REPORT_STATUSES, ReportPriority (+3 more)

### Community 26 - "deadlines.ts"
Cohesion: 0.23
Nodes (12): daysBetween(), deadlineList(), DeadlineNotice, dueNotices(), mostUrgentSent(), NOTICE_DAYS, noticeId(), noticeLead() (+4 more)

### Community 27 - "rapport/[id]/page.tsx"
Cohesion: 0.15
Nodes (6): metadata, PrintableReportPage(), ReportDocument(), metadata, ResultAccess, Report

### Community 28 - "analytics/events.ts"
Cohesion: 0.22
Nodes (10): TrackView(), buildFunnel(), EVENT_KINDS, EventKind, Funnel, FunnelStep, ProductEvent, ScreenDropOff (+2 more)

### Community 29 - "assessments.ts"
Cohesion: 0.20
Nodes (7): confirmUnsubscribe(), metadata, UnsubscribeButton(), desinscription, AssessmentRow, globalStore, globalUnsub

### Community 30 - "roadmap/types.ts"
Cohesion: 0.23
Nodes (10): formatDuration(), IMPORTANCE_RANK, NextBestAction, reasonFor(), selectNextBestAction(), EXCLUDED_STATUSES, Importance, IMPORTANCES (+2 more)

### Community 31 - "Questionnaire.tsx"
Cohesion: 0.22
Nodes (8): metadata, Questionnaire(), intro, Option, Screen, SCREENS, ui, ScreenId

### Community 32 - "dependencies"
Cohesion: 0.15
Nodes (13): @auth/prisma-adapter, next, next-auth, dependencies, @auth/prisma-adapter, next, next-auth, @prisma/client (+5 more)

### Community 33 - "derive.ts"
Cohesion: 0.27
Nodes (11): currentPhase(), DerivedProfile, deriveProfile(), hasBlockingGaps(), JOURNEY_TYPES, lawYearsValidated(), monthsUntilIntake(), PHASES (+3 more)

### Community 34 - "visibility.ts"
Cohesion: 0.31
Nodes (11): CAREER_GOAL, CareerGoal, SCREEN_IDS, allowsTooEarlyGoal(), careerGoalOptions(), isAlreadyEnrolled(), isConditionalScreen(), needsVisaBranch() (+3 more)

### Community 35 - "verify-dashboard.mjs"
Cohesion: 0.15
Nodes (10): BASE, consoleErrors, countBefore, done, dots, EMAIL, failures, interdits (+2 more)

### Community 36 - "verify-simulator.mjs"
Cohesion: 0.17
Nodes (7): BASE, bourses, consoleErrors, EMAIL, failures, final, tuition

### Community 37 - "verify-backoffice.mjs"
Cohesion: 0.18
Nodes (8): BASE, blocked, boxes, detail, failures, printed, REQUESTER_EMAIL, review

### Community 38 - "verify-matrices.mjs"
Cohesion: 0.18
Nodes (5): BASE, consoleErrors, failures, LABELS, verdictForm

### Community 39 - "metriques/page.tsx"
Cohesion: 0.22
Nodes (4): grid, metadata, eventStore, globalStore

### Community 40 - "connexion/actions.ts"
Cohesion: 0.38
Nodes (7): POST(), requestSignIn(), submitQuestionnaire(), security, parseEvent(), callerIp(), checkRateLimit()

### Community 41 - "check-legal.mjs"
Cohesion: 0.20
Nodes (8): COVERED, failures, held, models, OUT_OF_SCOPE, policy, schema, slugs

### Community 42 - "verify-acces.mjs"
Cohesion: 0.20
Nodes (6): ALICE, BASE, BOB, consoleErrors, failures, LABELS

### Community 43 - "verify-accessibilite.mjs"
Cohesion: 0.29
Nodes (9): analyse(), auditer(), AXE_SOURCE, BASE, check(), failures, require, revealAll() (+1 more)

### Community 44 - "verify-degraded.mjs"
Cohesion: 0.20
Nodes (7): args, BASE, CLOSED_PAGES, failures, PUBLIC_PAGES, REGIME, UNKNOWN_RESOURCES

### Community 45 - "admin/page.tsx"
Cohesion: 0.36
Nodes (4): metadata, announcedDelay(), DELAY_TIERS, isSaturated()

### Community 46 - "notifications/run.ts"
Cohesion: 0.44
Nodes (5): RunSummary, loadRoadmap(), TaskStatus, globalStore, roadmapStore

### Community 47 - "wait.mjs"
Cohesion: 0.47
Nodes (6): answerScreens(), submitDiagnostic(), waitFor(), waitForText(), waitForTextChange(), waitForTextGone()

### Community 48 - "verify-checkout.mjs"
Cohesion: 0.22
Nodes (6): BASE, checkoutText, consent, consoleErrors, EMAIL, failures

### Community 49 - "verify-consultations.mjs"
Cohesion: 0.22
Nodes (6): BASE, consoleErrors, EMAIL, failures, local, slotDate

### Community 50 - "verify-ecoles.mjs"
Cohesion: 0.22
Nodes (6): BASE, candidateName, consoleErrors, EMAIL, failures, targetRow

### Community 51 - "verify-espace.mjs"
Cohesion: 0.22
Nodes (5): BASE, consoleErrors, declarative, EMAIL, failures

### Community 52 - "import-partnerships.mjs"
Cohesion: 0.25
Nodes (5): dataPath, db, partnerships, snapshotDate, universities

### Community 53 - "verify-legal.mjs"
Cohesion: 0.25
Nodes (5): BASE, consoleErrors, DOCUMENTS, EMAIL, failures

### Community 54 - "check-vocabulary.mjs"
Cohesion: 0.33
Nodes (5): ALLOWLIST, EXTS, FORBIDDEN, ROOTS, walk()

### Community 55 - "verify-questionnaire.mjs"
Cohesion: 0.29
Nodes (5): ANSWERS, BASE, consoleErrors, EMAIL, failures

### Community 57 - "verify-all.mjs"
Cohesion: 0.33
Nodes (3): broken, results, SUITES

### Community 58 - "limits.ts"
Cohesion: 0.60
Nodes (3): RFC-5321, boundedText(), validEmail()

### Community 59 - "package.json"
Cohesion: 0.40
Nodes (4): description, name, private, version

### Community 60 - ".prettierrc.json"
Cohesion: 0.40
Nodes (4): printWidth, semi, singleQuote, trailingComma

### Community 61 - "check-design-tokens.mjs"
Cohesion: 0.50
Nodes (4): EXTS, PALETTE, ROOTS, walk()

### Community 62 - "check-rules.mjs"
Cohesion: 0.40
Nodes (3): blocks, source, TODAY

### Community 63 - "check-suites.mjs"
Cohesion: 0.40
Nodes (3): failures, HELPER_MODULES, helpers

### Community 64 - "verify-animations.mjs"
Cohesion: 0.40
Nodes (3): consoleErrors, failures, longest

### Community 65 - "next.config.ts"
Cohesion: 0.50
Nodes (3): csp, nextConfig, securityHeaders

### Community 66 - "sign-in.mjs"
Cohesion: 0.83
Nodes (3): lastSignInLink(), mailLogPath(), signInByEmail()

## Knowledge Gaps
- **422 isolated node(s):** `session-start.sh script`, `printWidth`, `singleQuote`, `semi`, `trailingComma` (+417 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `colors` connect `tokens.ts` to `stores.test.ts`, `app/consultations/page.tsx`, `ecoles/page.tsx`, `resultat/[id]/page.tsx`, `paiement/[id]/page.tsx`, `metriques/page.tsx`, `matrices/page.tsx`, `currentAssessmentId`, `dashboard/page.tsx`, `admin/page.tsx`, `rapports/[id]/page.tsx`, `modules.ts`, `reports.ts`, `rapport/[id]/page.tsx`, `assessments.ts`, `Questionnaire.tsx`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Why does `fonts` connect `tokens.ts` to `stores.test.ts`, `app/consultations/page.tsx`, `ecoles/page.tsx`, `resultat/[id]/page.tsx`, `paiement/[id]/page.tsx`, `metriques/page.tsx`, `matrices/page.tsx`, `currentAssessmentId`, `dashboard/page.tsx`, `admin/page.tsx`, `rapports/[id]/page.tsx`, `modules.ts`, `reports.ts`, `rapport/[id]/page.tsx`, `assessments.ts`, `Questionnaire.tsx`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Why does `alpha` connect `tokens.ts` to `stores.test.ts`, `app/consultations/page.tsx`, `ecoles/page.tsx`, `resultat/[id]/page.tsx`, `paiement/[id]/page.tsx`, `metriques/page.tsx`, `matrices/page.tsx`, `currentAssessmentId`, `dashboard/page.tsx`, `admin/page.tsx`, `rapports/[id]/page.tsx`, `modules.ts`, `reports.ts`, `rapport/[id]/page.tsx`, `assessments.ts`, `Questionnaire.tsx`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **What connects `session-start.sh script`, `printWidth`, `singleQuote` to the rest of the system?**
  _422 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `tokens.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05161290322580645 - nodes in this community are weakly interconnected._
- **Should `stores.test.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05617283950617284 - nodes in this community are weakly interconnected._
- **Should `eligibility.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.059673659673659674 - nodes in this community are weakly interconnected._