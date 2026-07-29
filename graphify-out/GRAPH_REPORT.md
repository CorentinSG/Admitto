# Graph Report - .  (2026-07-29)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 720 nodes · 1651 edges · 38 communities (31 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `116953ba`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- tokens.ts
- reports.ts
- dashboard/page.tsx
- resultat/[id]/page.tsx
- assemble.ts
- Simulator.tsx
- dispatch.ts
- compilerOptions
- scripts
- assessment/compute.ts
- questionnaire/types.ts
- devDependencies
- session.ts
- Questionnaire.tsx
- derive.ts
- package.json
- Answers
- visibility.ts
- verify-simulator.mjs
- verify-dashboard.mjs
- import-partnerships.mjs
- verify-checkout.mjs
- check-vocabulary.mjs
- verify-backoffice.mjs
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
1. `colors` - 33 edges
2. `fonts` - 33 edges
3. `alpha` - 28 edges
4. `scripts` - 26 edges
5. `useInView()` - 21 edges
6. `gradients` - 19 edges
7. `compilerOptions` - 16 edges
8. `Answers` - 15 edges
9. `verifyAccessToken()` - 15 edges
10. `layout` - 13 edges

## Surprising Connections (you probably didn't know these)
- `PrintableReportPage()` --calls--> `assembleReport()`  [EXTRACTED]
  app/(admin)/admin/rapports/[id]/impression/page.tsx → lib/report/assemble.ts
- `AdminReportPage()` --calls--> `assembleReport()`  [EXTRACTED]
  app/(admin)/admin/rapports/[id]/page.tsx → lib/report/assemble.ts
- `setTaskStatus()` --calls--> `verifyAccessToken()`  [EXTRACTED]
  app/(app)/app/actions.ts → lib/access/session.ts
- `DashboardPage()` --calls--> `verifyAccessToken()`  [EXTRACTED]
  app/(app)/app/dashboard/page.tsx → lib/access/session.ts
- `RoadmapPage()` --calls--> `verifyAccessToken()`  [EXTRACTED]
  app/(app)/app/roadmap/page.tsx → lib/access/session.ts

## Import Cycles
- None detected.

## Communities (38 total, 7 thin omitted)

### Community 0 - "tokens.ts"
Cohesion: 0.08
Nodes (46): dateFr(), metadata, PrintableReportPage(), metadata, cormorant, dmSans, metadata, Footer() (+38 more)

### Community 1 - "reports.ts"
Cohesion: 0.06
Nodes (48): addCorrection(), setReportStatus(), metadata, ReportControls(), POST(), startCheckout(), CheckoutButton(), CheckoutPage() (+40 more)

### Community 2 - "dashboard/page.tsx"
Cohesion: 0.08
Nodes (56): setTaskStatus(), SELECTABLE, TaskStatusControl(), DashboardPage(), dateFr(), metadata, dateFr(), metadata (+48 more)

### Community 3 - "resultat/[id]/page.tsx"
Cohesion: 0.06
Nodes (42): AdminPartnershipsPage(), metadata, RELIABILITY_LABELS, AccessButton(), dateFr(), metadata, ResultPage(), FRENCH_UNIVERSITIES_DATA (+34 more)

### Community 4 - "assemble.ts"
Cohesion: 0.08
Nodes (44): AdminReportPage(), AXIS_COMMENTS, AXIS_LABELS, NEXT_STEPS, OFFER_BLOCKS, REPORT_STATIC, RISK_BLOCKS, VERDICT_BLOCKS (+36 more)

### Community 5 - "Simulator.tsx"
Cohesion: 0.12
Nodes (31): NUMERIC_FIELDS, parseInputs(), removeScenario(), saveScenario(), metadata, inputStyle, labelStyle, Output() (+23 more)

### Community 6 - "dispatch.ts"
Cohesion: 0.11
Nodes (27): EMAIL_TEMPLATES, baseUrl(), dispatchEmail(), emailVariables(), SUBMITTED, VARIABLES, ALLOWED_EMAIL_VARIABLES, AllowedEmailVariable (+19 more)

### Community 7 - "compilerOptions"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, graphify-out, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 8 - "scripts"
Cohesion: 0.08
Nodes (26): scripts, build, check:all, check:rules, check:skills, check:tokens, check:vocabulary, dev (+18 more)

### Community 9 - "assessment/compute.ts"
Cohesion: 0.20
Nodes (16): evaluateCondition(), fireRules(), StructuredProfile, RULES, TEXT_BLOCKS, PATH_PRIORITY, runEngineA(), profileOf() (+8 more)

### Community 10 - "questionnaire/types.ts"
Cohesion: 0.16
Nodes (19): oneOf(), parseAnswers(), submitQuestionnaire(), UNIVERSITY_IDS, computeAssessment(), BUDGET, CAREER_GOAL, EDUCATION (+11 more)

### Community 11 - "devDependencies"
Cohesion: 0.10
Nodes (21): eslint, eslint-config-next, @eslint/eslintrc, devDependencies, eslint, eslint-config-next, @eslint/eslintrc, prettier (+13 more)

### Community 12 - "session.ts"
Cohesion: 0.20
Nodes (15): grantPlatformAccess(), encoder, fromHex(), hmacKey(), issueAccessToken(), sessionSecret(), NOW, toHex() (+7 more)

### Community 13 - "Questionnaire.tsx"
Cohesion: 0.21
Nodes (9): metadata, Questionnaire(), intro, Option, Screen, SCREENS, ui, UNIVERSITIES (+1 more)

### Community 14 - "derive.ts"
Cohesion: 0.30
Nodes (10): currentPhase(), DerivedProfile, deriveProfile(), hasBlockingGaps(), JOURNEY_TYPES, lawYearsValidated(), monthsUntilIntake(), REF (+2 more)

### Community 15 - "package.json"
Cohesion: 0.17
Nodes (11): next, dependencies, next, react, react-dom, description, name, private (+3 more)

### Community 16 - "Answers"
Cohesion: 0.27
Nodes (9): BAR_MILESTONES, computeDeadlines(), Deadline, isRelevant(), MILESTONES, shiftMonths(), keys(), REF (+1 more)

### Community 17 - "visibility.ts"
Cohesion: 0.36
Nodes (9): CareerGoal, SCREEN_IDS, allowsTooEarlyGoal(), careerGoalOptions(), isAlreadyEnrolled(), needsVisaBranch(), progress(), showsForeignBarScreen() (+1 more)

### Community 18 - "verify-simulator.mjs"
Cohesion: 0.18
Nodes (6): BASE, bourses, consoleErrors, failures, final, tuition

### Community 19 - "verify-dashboard.mjs"
Cohesion: 0.22
Nodes (6): BASE, consoleErrors, done, failures, interdits, roadmap

### Community 20 - "import-partnerships.mjs"
Cohesion: 0.25
Nodes (5): dataPath, db, partnerships, snapshotDate, universities

### Community 21 - "verify-checkout.mjs"
Cohesion: 0.25
Nodes (5): BASE, checkoutText, consent, consoleErrors, failures

### Community 22 - "check-vocabulary.mjs"
Cohesion: 0.33
Nodes (5): ALLOWLIST, EXTS, FORBIDDEN, ROOTS, walk()

### Community 23 - "verify-backoffice.mjs"
Cohesion: 0.29
Nodes (4): BASE, detail, failures, printed

### Community 24 - "verify-questionnaire.mjs"
Cohesion: 0.29
Nodes (5): ANSWERS, BASE, consoleErrors, failures, totals

### Community 25 - ".prettierrc.json"
Cohesion: 0.40
Nodes (4): printWidth, semi, singleQuote, trailingComma

### Community 26 - "check-design-tokens.mjs"
Cohesion: 0.40
Nodes (3): EXTS, PALETTE, ROOTS

### Community 27 - "check-rules.mjs"
Cohesion: 0.40
Nodes (3): blocks, source, TODAY

### Community 28 - "verify-animations.mjs"
Cohesion: 0.40
Nodes (3): consoleErrors, failures, longest

## Knowledge Gaps
- **206 isolated node(s):** `session-start.sh script`, `printWidth`, `singleQuote`, `semi`, `trailingComma` (+201 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `colors` connect `tokens.ts` to `reports.ts`, `dashboard/page.tsx`, `resultat/[id]/page.tsx`, `Simulator.tsx`, `Questionnaire.tsx`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Why does `fonts` connect `tokens.ts` to `reports.ts`, `dashboard/page.tsx`, `resultat/[id]/page.tsx`, `Simulator.tsx`, `Questionnaire.tsx`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Why does `alpha` connect `tokens.ts` to `reports.ts`, `dashboard/page.tsx`, `resultat/[id]/page.tsx`, `Simulator.tsx`, `Questionnaire.tsx`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **What connects `session-start.sh script`, `printWidth`, `singleQuote` to the rest of the system?**
  _206 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `tokens.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08433734939759036 - nodes in this community are weakly interconnected._
- **Should `reports.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05775638652350981 - nodes in this community are weakly interconnected._
- **Should `dashboard/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07534246575342465 - nodes in this community are weakly interconnected._