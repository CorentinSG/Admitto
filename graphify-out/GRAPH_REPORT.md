# Graph Report - .  (2026-07-29)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 960 nodes · 2302 edges · 45 communities (38 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2527ad75`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- tokens.ts
- dashboard/page.tsx
- app/consultations/page.tsx
- resultat/[id]/page.tsx
- questionnaire/types.ts
- assemble.ts
- documents/actions.ts
- Simulator.tsx
- dispatch.ts
- session.ts
- offers.ts
- scripts
- compilerOptions
- devDependencies
- engine-a/run.ts
- notifications/run.ts
- metriques/page.tsx
- assessments.ts
- stores.test.ts
- AssessmentStore
- verify-simulator.mjs
- reports.ts
- verify-backoffice.mjs
- dependencies
- verify-dashboard.mjs
- import-partnerships.mjs
- verify-checkout.mjs
- verify-consultations.mjs
- verify-espace.mjs
- check-vocabulary.mjs
- verify-questionnaire.mjs
- package.json
- .prettierrc.json
- check-design-tokens.mjs
- check-rules.mjs
- verify-animations.mjs
- eslint.config.mjs
- check-skills.mjs
- render-report-pdf.mjs
- session-start.sh
- post-commit
- pre-commit
- next.config.ts

## God Nodes (most connected - your core abstractions)
1. `colors` - 43 edges
2. `fonts` - 43 edges
3. `alpha` - 38 edges
4. `scripts` - 33 edges
5. `verifyAccessToken()` - 24 edges
6. `gradients` - 22 edges
7. `useInView()` - 21 edges
8. `AssessmentStore` - 19 edges
9. `Answers` - 18 edges
10. `compilerOptions` - 16 edges

## Surprising Connections (you probably didn't know these)
- `PrintableReportPage()` --calls--> `assembleReport()`  [EXTRACTED]
  app/(admin)/admin/rapports/[id]/impression/page.tsx → lib/report/assemble.ts
- `RoadmapPage()` --calls--> `verifyAccessToken()`  [EXTRACTED]
  app/(app)/app/roadmap/page.tsx → lib/access/session.ts
- `grantPlatformAccess()` --calls--> `issueAccessToken()`  [EXTRACTED]
  app/(marketing)/resultat/[id]/access-actions.ts → lib/access/session.ts
- `Output()` --calls--> `formatUsd()`  [EXTRACTED]
  app/(app)/app/simulateur/Simulator.tsx → lib/simulator/compute.ts
- `FieldGroup` --references--> `ScenarioInputs`  [EXTRACTED]
  content/simulator.ts → lib/simulator/types.ts

## Import Cycles
- None detected.

## Communities (45 total, 7 thin omitted)

### Community 0 - "tokens.ts"
Cohesion: 0.06
Nodes (71): addCorrection(), setReportStatus(), setReviewPoint(), AdminQueuePage(), metadata, AdminReportPage(), metadata, ReportControls() (+63 more)

### Community 1 - "dashboard/page.tsx"
Cohesion: 0.07
Nodes (61): setTaskStatus(), SELECTABLE, TaskStatusControl(), DashboardPage(), dateFr(), metadata, dateFr(), metadata (+53 more)

### Community 2 - "app/consultations/page.tsx"
Cohesion: 0.07
Nodes (45): closeSlot(), grantConsultations(), openSlot(), AdminConsultationsPage(), metadata, slotLabel(), button, CloseSlotButton() (+37 more)

### Community 3 - "resultat/[id]/page.tsx"
Cohesion: 0.06
Nodes (40): AdminPartnershipsPage(), metadata, RELIABILITY_LABELS, grantPlatformAccess(), AccessButton(), dateFr(), metadata, ResultPage() (+32 more)

### Community 4 - "questionnaire/types.ts"
Cohesion: 0.07
Nodes (44): oneOf(), parseAnswers(), submitQuestionnaire(), metadata, Questionnaire(), intro, Option, Screen (+36 more)

### Community 5 - "assemble.ts"
Cohesion: 0.08
Nodes (42): AXIS_COMMENTS, AXIS_LABELS, NEXT_STEPS, OFFER_BLOCKS, REPORT_STATIC, RISK_BLOCKS, VERDICT_BLOCKS, academicStrength() (+34 more)

### Community 6 - "documents/actions.ts"
Cohesion: 0.11
Nodes (32): removeDocument(), uploadDocument(), DocumentPanel(), DocumentView, DocumentsPage(), metadata, DOCUMENT_TYPE_HINTS, DOCUMENT_TYPE_LABELS (+24 more)

### Community 7 - "Simulator.tsx"
Cohesion: 0.12
Nodes (31): NUMERIC_FIELDS, parseInputs(), removeScenario(), saveScenario(), metadata, inputStyle, labelStyle, Output() (+23 more)

### Community 8 - "dispatch.ts"
Cohesion: 0.10
Nodes (31): EMAIL_TEMPLATES, baseUrl(), dispatchEmail(), emailVariables(), SUBMITTED, VARIABLES, ALLOWED_EMAIL_VARIABLES, AllowedEmailVariable (+23 more)

### Community 9 - "session.ts"
Cohesion: 0.12
Nodes (29): metadata, ModulesPage(), metadata, ModulePage(), findModule(), isModulePublished(), moduleBlockers(), MODULES (+21 more)

### Community 10 - "offers.ts"
Cohesion: 0.13
Nodes (24): POST(), startCheckout(), CheckoutPage(), applyDeduction(), createDeduction(), DEDUCTIBLE_ON, Deduction, isDeductibleOn() (+16 more)

### Community 11 - "scripts"
Cohesion: 0.06
Nodes (33): scripts, build, check:all, check:rules, check:skills, check:tokens, check:vocabulary, db:deploy (+25 more)

### Community 12 - "compilerOptions"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, graphify-out, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 13 - "devDependencies"
Cohesion: 0.08
Nodes (25): eslint, eslint-config-next, @eslint/eslintrc, devDependencies, eslint, eslint-config-next, @eslint/eslintrc, playwright (+17 more)

### Community 14 - "engine-a/run.ts"
Cohesion: 0.19
Nodes (16): evaluateCondition(), fireRules(), StructuredProfile, RULES, TEXT_BLOCKS, PATH_PRIORITY, runEngineA(), profileOf() (+8 more)

### Community 15 - "notifications/run.ts"
Cohesion: 0.19
Nodes (16): POST(), timingSafeEqualString(), daysBetween(), deadlineList(), DeadlineNotice, dueNotices(), mostUrgentSent(), NOTICE_DAYS (+8 more)

### Community 16 - "metriques/page.tsx"
Cohesion: 0.17
Nodes (13): AdminMetricsPage(), Card(), grid, metadata, computeMetrics(), formatMetric(), medianHours(), Metric (+5 more)

### Community 17 - "assessments.ts"
Cohesion: 0.18
Nodes (13): Assessment, ACADEMIC, add(), BAR, CostEstimate, CostRange, estimateCosts(), LIVING (+5 more)

### Community 18 - "stores.test.ts"
Cohesion: 0.21
Nodes (12): databaseUrl(), db(), globalForPrisma, prisma(), usingDatabase(), globalStore, milestoneStore, globalStore (+4 more)

### Community 19 - "AssessmentStore"
Cohesion: 0.20
Nodes (4): dateFr(), metadata, PrintableReportPage(), AssessmentStore

### Community 20 - "verify-simulator.mjs"
Cohesion: 0.18
Nodes (6): BASE, bourses, consoleErrors, failures, final, tuition

### Community 21 - "reports.ts"
Cohesion: 0.22
Nodes (7): CorrectionEntry, globalStore, REPORT_PRIORITIES, ReportPriority, ReportRow, reportStore, withCorrections

### Community 22 - "verify-backoffice.mjs"
Cohesion: 0.20
Nodes (7): BASE, blocked, boxes, detail, failures, printed, review

### Community 23 - "dependencies"
Cohesion: 0.22
Nodes (9): next, dependencies, next, @prisma/client, react, react-dom, @prisma/client, react (+1 more)

### Community 24 - "verify-dashboard.mjs"
Cohesion: 0.22
Nodes (6): BASE, consoleErrors, done, failures, interdits, roadmap

### Community 25 - "import-partnerships.mjs"
Cohesion: 0.25
Nodes (5): dataPath, db, partnerships, snapshotDate, universities

### Community 26 - "verify-checkout.mjs"
Cohesion: 0.25
Nodes (5): BASE, checkoutText, consent, consoleErrors, failures

### Community 27 - "verify-consultations.mjs"
Cohesion: 0.25
Nodes (5): BASE, consoleErrors, failures, local, slotDate

### Community 28 - "verify-espace.mjs"
Cohesion: 0.25
Nodes (4): BASE, consoleErrors, declarative, failures

### Community 29 - "check-vocabulary.mjs"
Cohesion: 0.33
Nodes (5): ALLOWLIST, EXTS, FORBIDDEN, ROOTS, walk()

### Community 30 - "verify-questionnaire.mjs"
Cohesion: 0.29
Nodes (5): ANSWERS, BASE, consoleErrors, failures, totals

### Community 31 - "package.json"
Cohesion: 0.40
Nodes (4): description, name, private, version

### Community 32 - ".prettierrc.json"
Cohesion: 0.40
Nodes (4): printWidth, semi, singleQuote, trailingComma

### Community 33 - "check-design-tokens.mjs"
Cohesion: 0.40
Nodes (3): EXTS, PALETTE, ROOTS

### Community 34 - "check-rules.mjs"
Cohesion: 0.40
Nodes (3): blocks, source, TODAY

### Community 35 - "verify-animations.mjs"
Cohesion: 0.40
Nodes (3): consoleErrors, failures, longest

## Knowledge Gaps
- **274 isolated node(s):** `session-start.sh script`, `printWidth`, `singleQuote`, `semi`, `trailingComma` (+269 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `colors` connect `tokens.ts` to `dashboard/page.tsx`, `app/consultations/page.tsx`, `resultat/[id]/page.tsx`, `questionnaire/types.ts`, `documents/actions.ts`, `Simulator.tsx`, `session.ts`, `metriques/page.tsx`, `AssessmentStore`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Why does `fonts` connect `tokens.ts` to `dashboard/page.tsx`, `app/consultations/page.tsx`, `resultat/[id]/page.tsx`, `questionnaire/types.ts`, `documents/actions.ts`, `Simulator.tsx`, `session.ts`, `metriques/page.tsx`, `AssessmentStore`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Why does `alpha` connect `tokens.ts` to `dashboard/page.tsx`, `app/consultations/page.tsx`, `resultat/[id]/page.tsx`, `questionnaire/types.ts`, `documents/actions.ts`, `Simulator.tsx`, `session.ts`, `metriques/page.tsx`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **What connects `session-start.sh script`, `printWidth`, `singleQuote` to the rest of the system?**
  _274 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `tokens.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.055338258728089236 - nodes in this community are weakly interconnected._
- **Should `dashboard/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06751054852320675 - nodes in this community are weakly interconnected._
- **Should `app/consultations/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0744047619047619 - nodes in this community are weakly interconnected._