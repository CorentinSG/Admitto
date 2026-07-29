# Graph Report - .  (2026-07-29)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 929 nodes · 2207 edges · 42 communities (35 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d37f4ca8`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- app/consultations/page.tsx
- tokens.ts
- reports.ts
- dashboard/page.tsx
- resultat/[id]/page.tsx
- questionnaire/types.ts
- documents/actions.ts
- Simulator.tsx
- dispatch.ts
- session.ts
- assemble.ts
- scripts
- compilerOptions
- notifications/run.ts
- devDependencies
- assessment/compute.ts
- engine-a/run.ts
- score.ts
- derive.ts
- package.json
- verify-simulator.mjs
- verify-backoffice.mjs
- verify-dashboard.mjs
- import-partnerships.mjs
- verify-checkout.mjs
- verify-consultations.mjs
- verify-espace.mjs
- check-vocabulary.mjs
- verify-questionnaire.mjs
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
4. `scripts` - 28 edges
5. `verifyAccessToken()` - 24 edges
6. `gradients` - 22 edges
7. `useInView()` - 21 edges
8. `AssessmentStore` - 18 edges
9. `compilerOptions` - 16 edges
10. `Answers` - 16 edges

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

## Communities (42 total, 7 thin omitted)

### Community 0 - "app/consultations/page.tsx"
Cohesion: 0.05
Nodes (67): closeSlot(), grantConsultations(), openSlot(), AdminConsultationsPage(), metadata, slotLabel(), CloseSlotButton(), GrantForm() (+59 more)

### Community 1 - "tokens.ts"
Cohesion: 0.08
Nodes (47): button, field, cormorant, dmSans, metadata, Footer(), Nav(), Badge() (+39 more)

### Community 2 - "reports.ts"
Cohesion: 0.05
Nodes (50): addCorrection(), setReportStatus(), setReviewPoint(), AdminMetricsPage(), Card(), grid, metadata, AdminQueuePage() (+42 more)

### Community 3 - "dashboard/page.tsx"
Cohesion: 0.08
Nodes (52): setTaskStatus(), SELECTABLE, TaskStatusControl(), DashboardPage(), dateFr(), metadata, dateFr(), metadata (+44 more)

### Community 4 - "resultat/[id]/page.tsx"
Cohesion: 0.06
Nodes (42): AdminPartnershipsPage(), metadata, RELIABILITY_LABELS, grantPlatformAccess(), AccessButton(), dateFr(), metadata, ResultPage() (+34 more)

### Community 5 - "questionnaire/types.ts"
Cohesion: 0.09
Nodes (35): oneOf(), parseAnswers(), submitQuestionnaire(), metadata, Questionnaire(), intro, Option, Screen (+27 more)

### Community 6 - "documents/actions.ts"
Cohesion: 0.12
Nodes (31): removeDocument(), uploadDocument(), DocumentPanel(), DocumentView, DocumentsPage(), metadata, DOCUMENT_TYPE_HINTS, DOCUMENT_TYPE_LABELS (+23 more)

### Community 7 - "Simulator.tsx"
Cohesion: 0.12
Nodes (31): NUMERIC_FIELDS, parseInputs(), removeScenario(), saveScenario(), metadata, inputStyle, labelStyle, Output() (+23 more)

### Community 8 - "dispatch.ts"
Cohesion: 0.10
Nodes (31): EMAIL_TEMPLATES, baseUrl(), dispatchEmail(), emailVariables(), SUBMITTED, VARIABLES, ALLOWED_EMAIL_VARIABLES, AllowedEmailVariable (+23 more)

### Community 9 - "session.ts"
Cohesion: 0.12
Nodes (29): metadata, ModulesPage(), metadata, ModulePage(), findModule(), isModulePublished(), moduleBlockers(), MODULES (+21 more)

### Community 10 - "assemble.ts"
Cohesion: 0.11
Nodes (28): AXIS_COMMENTS, AXIS_LABELS, NEXT_STEPS, OFFER_BLOCKS, REPORT_STATIC, RISK_BLOCKS, VERDICT_BLOCKS, Axis (+20 more)

### Community 11 - "scripts"
Cohesion: 0.07
Nodes (28): scripts, build, check:all, check:rules, check:skills, check:tokens, check:vocabulary, dev (+20 more)

### Community 12 - "compilerOptions"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, graphify-out, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 13 - "notifications/run.ts"
Cohesion: 0.16
Nodes (18): POST(), timingSafeEqualString(), daysBetween(), deadlineList(), DeadlineNotice, dueNotices(), mostUrgentSent(), NOTICE_DAYS (+10 more)

### Community 14 - "devDependencies"
Cohesion: 0.10
Nodes (21): eslint, eslint-config-next, @eslint/eslintrc, devDependencies, eslint, eslint-config-next, @eslint/eslintrc, prettier (+13 more)

### Community 15 - "assessment/compute.ts"
Cohesion: 0.15
Nodes (17): ACADEMIC, add(), BAR, CostEstimate, CostRange, estimateCosts(), LIVING, BAR_MILESTONES (+9 more)

### Community 16 - "engine-a/run.ts"
Cohesion: 0.21
Nodes (14): evaluateCondition(), fireRules(), StructuredProfile, RULES, TEXT_BLOCKS, PATH_PRIORITY, runEngineA(), REF (+6 more)

### Community 17 - "score.ts"
Cohesion: 0.21
Nodes (15): academicStrength(), buildVerdictInput(), clamp(), financialFit(), immigrationRisk(), professionalRealism(), scoreAxes(), REF (+7 more)

### Community 18 - "derive.ts"
Cohesion: 0.25
Nodes (12): profileOf(), currentPhase(), deriveProfile(), flattenForRules(), hasBlockingGaps(), JOURNEY_TYPES, lawYearsValidated(), monthsUntilIntake() (+4 more)

### Community 19 - "package.json"
Cohesion: 0.17
Nodes (11): next, dependencies, next, react, react-dom, description, name, private (+3 more)

### Community 20 - "verify-simulator.mjs"
Cohesion: 0.18
Nodes (6): BASE, bourses, consoleErrors, failures, final, tuition

### Community 21 - "verify-backoffice.mjs"
Cohesion: 0.20
Nodes (7): BASE, blocked, boxes, detail, failures, printed, review

### Community 22 - "verify-dashboard.mjs"
Cohesion: 0.22
Nodes (6): BASE, consoleErrors, done, failures, interdits, roadmap

### Community 23 - "import-partnerships.mjs"
Cohesion: 0.25
Nodes (5): dataPath, db, partnerships, snapshotDate, universities

### Community 24 - "verify-checkout.mjs"
Cohesion: 0.25
Nodes (5): BASE, checkoutText, consent, consoleErrors, failures

### Community 25 - "verify-consultations.mjs"
Cohesion: 0.25
Nodes (5): BASE, consoleErrors, failures, local, slotDate

### Community 26 - "verify-espace.mjs"
Cohesion: 0.25
Nodes (4): BASE, consoleErrors, declarative, failures

### Community 27 - "check-vocabulary.mjs"
Cohesion: 0.33
Nodes (5): ALLOWLIST, EXTS, FORBIDDEN, ROOTS, walk()

### Community 28 - "verify-questionnaire.mjs"
Cohesion: 0.29
Nodes (5): ANSWERS, BASE, consoleErrors, failures, totals

### Community 29 - ".prettierrc.json"
Cohesion: 0.40
Nodes (4): printWidth, semi, singleQuote, trailingComma

### Community 30 - "check-design-tokens.mjs"
Cohesion: 0.40
Nodes (3): EXTS, PALETTE, ROOTS

### Community 31 - "check-rules.mjs"
Cohesion: 0.40
Nodes (3): blocks, source, TODAY

### Community 32 - "verify-animations.mjs"
Cohesion: 0.40
Nodes (3): consoleErrors, failures, longest

## Knowledge Gaps
- **257 isolated node(s):** `session-start.sh script`, `printWidth`, `singleQuote`, `semi`, `trailingComma` (+252 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `colors` connect `tokens.ts` to `app/consultations/page.tsx`, `reports.ts`, `dashboard/page.tsx`, `resultat/[id]/page.tsx`, `questionnaire/types.ts`, `documents/actions.ts`, `Simulator.tsx`, `session.ts`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Why does `fonts` connect `tokens.ts` to `app/consultations/page.tsx`, `reports.ts`, `dashboard/page.tsx`, `resultat/[id]/page.tsx`, `questionnaire/types.ts`, `documents/actions.ts`, `Simulator.tsx`, `session.ts`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Why does `alpha` connect `tokens.ts` to `app/consultations/page.tsx`, `reports.ts`, `dashboard/page.tsx`, `resultat/[id]/page.tsx`, `questionnaire/types.ts`, `documents/actions.ts`, `Simulator.tsx`, `session.ts`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **What connects `session-start.sh script`, `printWidth`, `singleQuote` to the rest of the system?**
  _257 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `app/consultations/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.050793650793650794 - nodes in this community are weakly interconnected._
- **Should `tokens.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08487394957983194 - nodes in this community are weakly interconnected._
- **Should `reports.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05126452494873548 - nodes in this community are weakly interconnected._