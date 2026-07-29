# Graph Report - .  (2026-07-29)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 785 nodes · 1822 edges · 41 communities (34 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `287c3207`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- tokens.ts
- dashboard/page.tsx
- resultat/[id]/page.tsx
- questionnaire/types.ts
- partenariats/page.tsx
- documents/actions.ts
- Simulator.tsx
- paiement/[id]/page.tsx
- session.ts
- assemble.ts
- dispatch.ts
- compilerOptions
- scripts
- assessment/compute.ts
- devDependencies
- score.ts
- derive.ts
- package.json
- Answers
- verify-simulator.mjs
- verify-dashboard.mjs
- estimate.ts
- import-partnerships.mjs
- verify-checkout.mjs
- verify-espace.mjs
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
1. `colors` - 37 edges
2. `fonts` - 37 edges
3. `alpha` - 32 edges
4. `scripts` - 27 edges
5. `useInView()` - 21 edges
6. `gradients` - 20 edges
7. `verifyAccessToken()` - 18 edges
8. `compilerOptions` - 16 edges
9. `Answers` - 15 edges
10. `layout` - 13 edges

## Surprising Connections (you probably didn't know these)
- `PrintableReportPage()` --calls--> `assembleReport()`  [EXTRACTED]
  app/(admin)/admin/rapports/[id]/impression/page.tsx → lib/report/assemble.ts
- `AdminReportPage()` --calls--> `assembleReport()`  [EXTRACTED]
  app/(admin)/admin/rapports/[id]/page.tsx → lib/report/assemble.ts
- `setTaskStatus()` --calls--> `verifyAccessToken()`  [EXTRACTED]
  app/(app)/app/actions.ts → lib/access/session.ts
- `RoadmapPage()` --calls--> `verifyAccessToken()`  [EXTRACTED]
  app/(app)/app/roadmap/page.tsx → lib/access/session.ts
- `grantPlatformAccess()` --calls--> `issueAccessToken()`  [EXTRACTED]
  app/(marketing)/resultat/[id]/access-actions.ts → lib/access/session.ts

## Import Cycles
- None detected.

## Communities (41 total, 7 thin omitted)

### Community 0 - "tokens.ts"
Cohesion: 0.11
Nodes (42): cormorant, dmSans, metadata, Footer(), Nav(), Badge(), GhostCta(), GoldCta() (+34 more)

### Community 1 - "dashboard/page.tsx"
Cohesion: 0.08
Nodes (50): setTaskStatus(), SELECTABLE, TaskStatusControl(), DashboardPage(), dateFr(), metadata, dateFr(), metadata (+42 more)

### Community 2 - "resultat/[id]/page.tsx"
Cohesion: 0.06
Nodes (33): addCorrection(), setReportStatus(), metadata, dateFr(), metadata, PrintableReportPage(), metadata, ReportControls() (+25 more)

### Community 3 - "questionnaire/types.ts"
Cohesion: 0.09
Nodes (36): oneOf(), parseAnswers(), submitQuestionnaire(), metadata, Questionnaire(), intro, Option, Screen (+28 more)

### Community 4 - "partenariats/page.tsx"
Cohesion: 0.09
Nodes (30): AdminPartnershipsPage(), metadata, RELIABILITY_LABELS, FRENCH_UNIVERSITIES_DATA, IMPORT_SOURCE, PARTNERSHIPS_DATA, PARTNERSHIP_LABELS, TUITION_LABELS (+22 more)

### Community 5 - "documents/actions.ts"
Cohesion: 0.12
Nodes (31): removeDocument(), uploadDocument(), DocumentPanel(), DocumentView, DocumentsPage(), metadata, DOCUMENT_TYPE_HINTS, DOCUMENT_TYPE_LABELS (+23 more)

### Community 6 - "Simulator.tsx"
Cohesion: 0.12
Nodes (31): NUMERIC_FIELDS, parseInputs(), removeScenario(), saveScenario(), metadata, inputStyle, labelStyle, Output() (+23 more)

### Community 7 - "paiement/[id]/page.tsx"
Cohesion: 0.10
Nodes (27): POST(), startCheckout(), CheckoutButton(), CheckoutPage(), metadata, checkout, applyDeduction(), createDeduction() (+19 more)

### Community 8 - "session.ts"
Cohesion: 0.12
Nodes (29): metadata, ModulesPage(), metadata, ModulePage(), findModule(), isModulePublished(), moduleBlockers(), MODULES (+21 more)

### Community 9 - "assemble.ts"
Cohesion: 0.10
Nodes (30): AdminReportPage(), AXIS_COMMENTS, AXIS_LABELS, NEXT_STEPS, OFFER_BLOCKS, REPORT_STATIC, RISK_BLOCKS, VERDICT_BLOCKS (+22 more)

### Community 10 - "dispatch.ts"
Cohesion: 0.11
Nodes (27): EMAIL_TEMPLATES, baseUrl(), dispatchEmail(), emailVariables(), SUBMITTED, VARIABLES, ALLOWED_EMAIL_VARIABLES, AllowedEmailVariable (+19 more)

### Community 11 - "compilerOptions"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, graphify-out, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 12 - "scripts"
Cohesion: 0.07
Nodes (27): scripts, build, check:all, check:rules, check:skills, check:tokens, check:vocabulary, dev (+19 more)

### Community 13 - "assessment/compute.ts"
Cohesion: 0.20
Nodes (16): evaluateCondition(), fireRules(), StructuredProfile, RULES, TEXT_BLOCKS, PATH_PRIORITY, runEngineA(), profileOf() (+8 more)

### Community 14 - "devDependencies"
Cohesion: 0.10
Nodes (21): eslint, eslint-config-next, @eslint/eslintrc, devDependencies, eslint, eslint-config-next, @eslint/eslintrc, prettier (+13 more)

### Community 15 - "score.ts"
Cohesion: 0.21
Nodes (15): academicStrength(), buildVerdictInput(), clamp(), financialFit(), immigrationRisk(), professionalRealism(), scoreAxes(), REF (+7 more)

### Community 16 - "derive.ts"
Cohesion: 0.30
Nodes (10): currentPhase(), DerivedProfile, deriveProfile(), hasBlockingGaps(), JOURNEY_TYPES, lawYearsValidated(), monthsUntilIntake(), REF (+2 more)

### Community 17 - "package.json"
Cohesion: 0.17
Nodes (11): next, dependencies, next, react, react-dom, description, name, private (+3 more)

### Community 18 - "Answers"
Cohesion: 0.27
Nodes (9): BAR_MILESTONES, computeDeadlines(), Deadline, isRelevant(), MILESTONES, shiftMonths(), keys(), REF (+1 more)

### Community 19 - "verify-simulator.mjs"
Cohesion: 0.18
Nodes (6): BASE, bourses, consoleErrors, failures, final, tuition

### Community 20 - "verify-dashboard.mjs"
Cohesion: 0.22
Nodes (6): BASE, consoleErrors, done, failures, interdits, roadmap

### Community 21 - "estimate.ts"
Cohesion: 0.29
Nodes (7): ACADEMIC, add(), BAR, CostEstimate, CostRange, estimateCosts(), LIVING

### Community 22 - "import-partnerships.mjs"
Cohesion: 0.25
Nodes (5): dataPath, db, partnerships, snapshotDate, universities

### Community 23 - "verify-checkout.mjs"
Cohesion: 0.25
Nodes (5): BASE, checkoutText, consent, consoleErrors, failures

### Community 24 - "verify-espace.mjs"
Cohesion: 0.25
Nodes (4): BASE, consoleErrors, declarative, failures

### Community 25 - "check-vocabulary.mjs"
Cohesion: 0.33
Nodes (5): ALLOWLIST, EXTS, FORBIDDEN, ROOTS, walk()

### Community 26 - "verify-backoffice.mjs"
Cohesion: 0.29
Nodes (4): BASE, detail, failures, printed

### Community 27 - "verify-questionnaire.mjs"
Cohesion: 0.29
Nodes (5): ANSWERS, BASE, consoleErrors, failures, totals

### Community 28 - ".prettierrc.json"
Cohesion: 0.40
Nodes (4): printWidth, semi, singleQuote, trailingComma

### Community 29 - "check-design-tokens.mjs"
Cohesion: 0.40
Nodes (3): EXTS, PALETTE, ROOTS

### Community 30 - "check-rules.mjs"
Cohesion: 0.40
Nodes (3): blocks, source, TODAY

### Community 31 - "verify-animations.mjs"
Cohesion: 0.40
Nodes (3): consoleErrors, failures, longest

## Knowledge Gaps
- **222 isolated node(s):** `session-start.sh script`, `printWidth`, `singleQuote`, `semi`, `trailingComma` (+217 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `colors` connect `tokens.ts` to `dashboard/page.tsx`, `resultat/[id]/page.tsx`, `questionnaire/types.ts`, `partenariats/page.tsx`, `documents/actions.ts`, `Simulator.tsx`, `paiement/[id]/page.tsx`, `session.ts`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Why does `fonts` connect `tokens.ts` to `dashboard/page.tsx`, `resultat/[id]/page.tsx`, `questionnaire/types.ts`, `partenariats/page.tsx`, `documents/actions.ts`, `Simulator.tsx`, `paiement/[id]/page.tsx`, `session.ts`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Why does `alpha` connect `tokens.ts` to `dashboard/page.tsx`, `resultat/[id]/page.tsx`, `questionnaire/types.ts`, `partenariats/page.tsx`, `documents/actions.ts`, `Simulator.tsx`, `paiement/[id]/page.tsx`, `session.ts`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **What connects `session-start.sh script`, `printWidth`, `singleQuote` to the rest of the system?**
  _222 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `tokens.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10602503912363068 - nodes in this community are weakly interconnected._
- **Should `dashboard/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07884615384615384 - nodes in this community are weakly interconnected._
- **Should `resultat/[id]/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06229508196721312 - nodes in this community are weakly interconnected._