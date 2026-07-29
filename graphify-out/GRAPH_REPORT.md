# Graph Report - .  (2026-07-29)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 997 nodes · 2372 edges · 48 communities (40 shown, 8 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7ef64c14`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- tokens.ts
- dashboard/page.tsx
- assemble.ts
- app/consultations/page.tsx
- stores.test.ts
- reports.ts
- questionnaire/types.ts
- documents/actions.ts
- paiement/[id]/page.tsx
- dispatch.ts
- scripts
- compilerOptions
- devDependencies
- auth.ts
- notifications/run.ts
- engine-a/run.ts
- partenariats/page.tsx
- modules.ts
- metriques/page.tsx
- assessments.ts
- resultat/[id]/page.tsx
- dependencies
- partnerships/types.ts
- verify-simulator.mjs
- verify-backoffice.mjs
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
- sign-in.mjs
- eslint.config.mjs
- check-skills.mjs
- render-report-pdf.mjs
- session-start.sh
- post-commit
- pre-commit
- next.config.ts
- { GET, POST }

## God Nodes (most connected - your core abstractions)
1. `colors` - 47 edges
2. `fonts` - 47 edges
3. `alpha` - 41 edges
4. `scripts` - 33 edges
5. `currentAssessmentId()` - 26 edges
6. `gradients` - 23 edges
7. `useInView()` - 21 edges
8. `AssessmentStore` - 19 edges
9. `Answers` - 18 edges
10. `compilerOptions` - 16 edges

## Surprising Connections (you probably didn't know these)
- `DocumentsPage()` --calls--> `currentAssessmentId()`  [EXTRACTED]
  app/(app)/app/documents/page.tsx → lib/auth/current.ts
- `ModulePage()` --calls--> `currentAssessmentId()`  [EXTRACTED]
  app/(app)/app/modules/[slug]/page.tsx → lib/auth/current.ts
- `ModulesPage()` --calls--> `currentAssessmentId()`  [EXTRACTED]
  app/(app)/app/modules/page.tsx → lib/auth/current.ts
- `Output()` --calls--> `formatUsd()`  [EXTRACTED]
  app/(app)/app/simulateur/Simulator.tsx → lib/simulator/compute.ts
- `FieldGroup` --references--> `ScenarioInputs`  [EXTRACTED]
  content/simulator.ts → lib/simulator/types.ts

## Import Cycles
- None detected.

## Communities (48 total, 8 thin omitted)

### Community 0 - "tokens.ts"
Cohesion: 0.08
Nodes (52): SlotView, endSession(), SignOutButton(), cormorant, dmSans, metadata, Footer(), Nav() (+44 more)

### Community 1 - "dashboard/page.tsx"
Cohesion: 0.07
Nodes (63): setTaskStatus(), SELECTABLE, TaskStatusControl(), DashboardPage(), dateFr(), metadata, dateFr(), metadata (+55 more)

### Community 2 - "assemble.ts"
Cohesion: 0.05
Nodes (61): dateFr(), metadata, PrintableReportPage(), AXIS_COMMENTS, AXIS_LABELS, NEXT_STEPS, OFFER_BLOCKS, REPORT_STATIC (+53 more)

### Community 3 - "app/consultations/page.tsx"
Cohesion: 0.07
Nodes (44): closeSlot(), grantConsultations(), openSlot(), AdminConsultationsPage(), metadata, slotLabel(), button, CloseSlotButton() (+36 more)

### Community 4 - "stores.test.ts"
Cohesion: 0.08
Nodes (44): NUMERIC_FIELDS, parseInputs(), removeScenario(), saveScenario(), metadata, inputStyle, labelStyle, Output() (+36 more)

### Community 5 - "reports.ts"
Cohesion: 0.07
Nodes (36): addCorrection(), setReportStatus(), setReviewPoint(), AdminQueuePage(), metadata, AdminReportPage(), metadata, ReportControls() (+28 more)

### Community 6 - "questionnaire/types.ts"
Cohesion: 0.09
Nodes (35): oneOf(), parseAnswers(), submitQuestionnaire(), metadata, Questionnaire(), intro, Option, Screen (+27 more)

### Community 7 - "documents/actions.ts"
Cohesion: 0.11
Nodes (32): removeDocument(), uploadDocument(), DocumentPanel(), DocumentView, DocumentsPage(), metadata, DOCUMENT_TYPE_HINTS, DOCUMENT_TYPE_LABELS (+24 more)

### Community 8 - "paiement/[id]/page.tsx"
Cohesion: 0.10
Nodes (28): POST(), startCheckout(), CheckoutButton(), CheckoutPage(), metadata, checkout, applyDeduction(), createDeduction() (+20 more)

### Community 9 - "dispatch.ts"
Cohesion: 0.09
Nodes (31): EMAIL_TEMPLATES, baseUrl(), dispatchEmail(), emailVariables(), SUBMITTED, VARIABLES, ALLOWED_EMAIL_VARIABLES, AllowedEmailVariable (+23 more)

### Community 10 - "scripts"
Cohesion: 0.06
Nodes (33): scripts, build, check:all, check:rules, check:skills, check:tokens, check:vocabulary, db:deploy (+25 more)

### Community 11 - "compilerOptions"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, graphify-out, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 12 - "devDependencies"
Cohesion: 0.08
Nodes (25): eslint, eslint-config-next, @eslint/eslintrc, devDependencies, eslint, eslint-config-next, @eslint/eslintrc, playwright (+17 more)

### Community 13 - "auth.ts"
Cohesion: 0.13
Nodes (13): BACKOFFICE_ROLES, isBackofficeRole(), Role, ROLES, { handlers, auth, signIn, signOut }, AUTH_EMAIL, { auth }, config (+5 more)

### Community 14 - "notifications/run.ts"
Cohesion: 0.17
Nodes (16): POST(), timingSafeEqualString(), daysBetween(), deadlineList(), DeadlineNotice, dueNotices(), mostUrgentSent(), NOTICE_DAYS (+8 more)

### Community 15 - "engine-a/run.ts"
Cohesion: 0.19
Nodes (15): evaluateCondition(), fireRules(), StructuredProfile, RULES, TEXT_BLOCKS, PATH_PRIORITY, runEngineA(), profileOf() (+7 more)

### Community 16 - "partenariats/page.tsx"
Cohesion: 0.16
Nodes (12): AdminPartnershipsPage(), metadata, RELIABILITY_LABELS, FRENCH_UNIVERSITIES_DATA, IMPORT_SOURCE, PARTNERSHIPS_DATA, UNIVERSITIES, universityName() (+4 more)

### Community 17 - "modules.ts"
Cohesion: 0.23
Nodes (15): metadata, ModulesPage(), metadata, ModulePage(), findModule(), isModulePublished(), moduleBlockers(), MODULES (+7 more)

### Community 18 - "metriques/page.tsx"
Cohesion: 0.17
Nodes (13): AdminMetricsPage(), Card(), grid, metadata, computeMetrics(), formatMetric(), medianHours(), Metric (+5 more)

### Community 19 - "assessments.ts"
Cohesion: 0.20
Nodes (13): Assessment, computeAssessment(), CostEstimate, bestCostAdvantage(), detectPartnerships(), EDUCATION_RANK, LEVEL_RANK, meetsLevel() (+5 more)

### Community 20 - "resultat/[id]/page.tsx"
Cohesion: 0.21
Nodes (7): accountsAvailable(), dateFr(), metadata, ResultPage(), PATH_LABELS, result, PreliminaryPath

### Community 21 - "dependencies"
Cohesion: 0.15
Nodes (13): @auth/prisma-adapter, next, next-auth, dependencies, @auth/prisma-adapter, next, next-auth, @prisma/client (+5 more)

### Community 22 - "partnerships/types.ts"
Cohesion: 0.18
Nodes (11): PARTNERSHIP_LABELS, TUITION_LABELS, LanguageTest, PARTNERSHIP_TYPES, PartnershipType, PartnerUniversity, RELIABILITY_STATUSES, ReliabilityStatus (+3 more)

### Community 23 - "verify-simulator.mjs"
Cohesion: 0.18
Nodes (6): BASE, bourses, consoleErrors, failures, final, tuition

### Community 24 - "verify-backoffice.mjs"
Cohesion: 0.20
Nodes (7): BASE, blocked, boxes, detail, failures, printed, review

### Community 25 - "verify-dashboard.mjs"
Cohesion: 0.22
Nodes (6): BASE, consoleErrors, done, failures, interdits, roadmap

### Community 26 - "import-partnerships.mjs"
Cohesion: 0.25
Nodes (5): dataPath, db, partnerships, snapshotDate, universities

### Community 27 - "verify-checkout.mjs"
Cohesion: 0.25
Nodes (5): BASE, checkoutText, consent, consoleErrors, failures

### Community 28 - "verify-consultations.mjs"
Cohesion: 0.25
Nodes (5): BASE, consoleErrors, failures, local, slotDate

### Community 29 - "verify-espace.mjs"
Cohesion: 0.25
Nodes (4): BASE, consoleErrors, declarative, failures

### Community 30 - "check-vocabulary.mjs"
Cohesion: 0.33
Nodes (5): ALLOWLIST, EXTS, FORBIDDEN, ROOTS, walk()

### Community 31 - "verify-questionnaire.mjs"
Cohesion: 0.29
Nodes (5): ANSWERS, BASE, consoleErrors, failures, totals

### Community 32 - "package.json"
Cohesion: 0.40
Nodes (4): description, name, private, version

### Community 33 - ".prettierrc.json"
Cohesion: 0.40
Nodes (4): printWidth, semi, singleQuote, trailingComma

### Community 34 - "check-design-tokens.mjs"
Cohesion: 0.40
Nodes (3): EXTS, PALETTE, ROOTS

### Community 35 - "check-rules.mjs"
Cohesion: 0.40
Nodes (3): blocks, source, TODAY

### Community 36 - "verify-animations.mjs"
Cohesion: 0.40
Nodes (3): consoleErrors, failures, longest

### Community 37 - "sign-in.mjs"
Cohesion: 0.83
Nodes (3): lastSignInLink(), mailLogPath(), signInByEmail()

## Knowledge Gaps
- **283 isolated node(s):** `session-start.sh script`, `printWidth`, `singleQuote`, `semi`, `trailingComma` (+278 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `colors` connect `tokens.ts` to `dashboard/page.tsx`, `assemble.ts`, `app/consultations/page.tsx`, `stores.test.ts`, `reports.ts`, `questionnaire/types.ts`, `documents/actions.ts`, `paiement/[id]/page.tsx`, `partenariats/page.tsx`, `modules.ts`, `metriques/page.tsx`, `resultat/[id]/page.tsx`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Why does `fonts` connect `tokens.ts` to `dashboard/page.tsx`, `assemble.ts`, `app/consultations/page.tsx`, `stores.test.ts`, `reports.ts`, `questionnaire/types.ts`, `documents/actions.ts`, `paiement/[id]/page.tsx`, `partenariats/page.tsx`, `modules.ts`, `metriques/page.tsx`, `resultat/[id]/page.tsx`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Why does `alpha` connect `tokens.ts` to `dashboard/page.tsx`, `app/consultations/page.tsx`, `stores.test.ts`, `reports.ts`, `questionnaire/types.ts`, `documents/actions.ts`, `paiement/[id]/page.tsx`, `partenariats/page.tsx`, `modules.ts`, `metriques/page.tsx`, `resultat/[id]/page.tsx`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **What connects `session-start.sh script`, `printWidth`, `singleQuote` to the rest of the system?**
  _283 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `tokens.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07664150080073209 - nodes in this community are weakly interconnected._
- **Should `dashboard/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0654320987654321 - nodes in this community are weakly interconnected._
- **Should `assemble.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.051582278481012656 - nodes in this community are weakly interconnected._