# Graph Report - .  (2026-07-30)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1117 nodes · 2613 edges · 51 communities (44 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `90f72aec`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- tokens.ts
- dashboard/page.tsx
- reports.ts
- dispatch.ts
- questionnaire/types.ts
- app/consultations/page.tsx
- Simulator.tsx
- resultat/[id]/page.tsx
- stores.test.ts
- paiement/[id]/page.tsx
- documents/actions.ts
- scripts
- LegalPage.tsx
- assemble.ts
- compilerOptions
- devDependencies
- assessments.ts
- score.ts
- engine-a/run.ts
- estimate.ts
- derive.ts
- package.json
- verify-simulator.mjs
- verify-backoffice.mjs
- check-legal.mjs
- verify-dashboard.mjs
- wait.mjs
- verify-checkout.mjs
- verify-consultations.mjs
- verify-espace.mjs
- import-partnerships.mjs
- verify-legal.mjs
- check-vocabulary.mjs
- verify-questionnaire.mjs
- verify-all.mjs
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
1. `colors` - 50 edges
2. `fonts` - 50 edges
3. `alpha` - 44 edges
4. `scripts` - 36 edges
5. `currentAssessmentId()` - 26 edges
6. `gradients` - 23 edges
7. `useInView()` - 21 edges
8. `usingDatabase()` - 19 edges
9. `AssessmentStore` - 19 edges
10. `Answers` - 18 edges

## Surprising Connections (you probably didn't know these)
- `DocumentsPage()` --calls--> `currentAssessmentId()`  [EXTRACTED]
  app/(app)/app/documents/page.tsx → lib/auth/current.ts
- `Output()` --calls--> `formatUsd()`  [EXTRACTED]
  app/(app)/app/simulateur/Simulator.tsx → lib/simulator/compute.ts
- `FieldGroup` --references--> `ScenarioInputs`  [EXTRACTED]
  content/simulator.ts → lib/simulator/types.ts
- `AdminPartnershipsPage()` --calls--> `coverageRate()`  [EXTRACTED]
  app/(admin)/admin/partenariats/page.tsx → lib/partnerships/detect.ts
- `assembleReport()` --calls--> `universityName()`  [EXTRACTED]
  lib/report/assemble.ts → content/universities.ts

## Import Cycles
- None detected.

## Communities (51 total, 7 thin omitted)

### Community 0 - "tokens.ts"
Cohesion: 0.07
Nodes (55): EraseForm(), metadata, endSession(), SignOutButton(), cormorant, dmSans, metadata, Footer() (+47 more)

### Community 1 - "dashboard/page.tsx"
Cohesion: 0.06
Nodes (62): setTaskStatus(), SELECTABLE, TaskStatusControl(), DashboardPage(), dateFr(), metadata, dateFr(), metadata (+54 more)

### Community 2 - "reports.ts"
Cohesion: 0.05
Nodes (49): addCorrection(), setReportStatus(), setReviewPoint(), AdminMetricsPage(), Card(), grid, metadata, AdminQueuePage() (+41 more)

### Community 3 - "dispatch.ts"
Cohesion: 0.05
Nodes (44): BACKOFFICE_ROLES, isBackofficeRole(), Role, ROLES, { handlers, auth, signIn, signOut }, AUTH_EMAIL, EMAIL_TEMPLATES, baseUrl() (+36 more)

### Community 4 - "questionnaire/types.ts"
Cohesion: 0.06
Nodes (46): oneOf(), parseAnswers(), submitQuestionnaire(), metadata, Questionnaire(), intro, Option, Screen (+38 more)

### Community 5 - "app/consultations/page.tsx"
Cohesion: 0.07
Nodes (43): closeSlot(), grantConsultations(), openSlot(), AdminConsultationsPage(), metadata, slotLabel(), button, CloseSlotButton() (+35 more)

### Community 6 - "Simulator.tsx"
Cohesion: 0.08
Nodes (45): metadata, ModulesPage(), metadata, ModulePage(), NUMERIC_FIELDS, parseInputs(), removeScenario(), saveScenario() (+37 more)

### Community 7 - "resultat/[id]/page.tsx"
Cohesion: 0.06
Nodes (38): AdminPartnershipsPage(), metadata, RELIABILITY_LABELS, accountsAvailable(), dateFr(), metadata, ResultPage(), FRENCH_UNIVERSITIES_DATA (+30 more)

### Community 8 - "stores.test.ts"
Cohesion: 0.07
Nodes (37): POST(), eraseAccount(), GET(), timingSafeEqualString(), CurrentUser, databaseUrl(), db(), globalForPrisma (+29 more)

### Community 9 - "paiement/[id]/page.tsx"
Cohesion: 0.10
Nodes (28): POST(), startCheckout(), CheckoutButton(), CheckoutPage(), metadata, checkout, applyDeduction(), createDeduction() (+20 more)

### Community 10 - "documents/actions.ts"
Cohesion: 0.13
Nodes (29): removeDocument(), uploadDocument(), DocumentPanel(), DocumentView, DocumentsPage(), metadata, DOCUMENT_TYPE_HINTS, DOCUMENT_TYPE_LABELS (+21 more)

### Community 11 - "scripts"
Cohesion: 0.06
Nodes (36): scripts, build, check:all, check:legal, check:rules, check:skills, check:tokens, check:vocabulary (+28 more)

### Community 12 - "LegalPage.tsx"
Cohesion: 0.14
Nodes (20): Block(), label, LegalPage(), metadata, metadata, metadata, CGV, CONFIDENTIALITE (+12 more)

### Community 13 - "assemble.ts"
Cohesion: 0.13
Nodes (24): AXIS_COMMENTS, AXIS_LABELS, NEXT_STEPS, OFFER_BLOCKS, REPORT_STATIC, RISK_BLOCKS, VERDICT_BLOCKS, Verdict (+16 more)

### Community 14 - "compilerOptions"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, graphify-out, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 15 - "devDependencies"
Cohesion: 0.08
Nodes (25): eslint, eslint-config-next, @eslint/eslintrc, devDependencies, eslint, eslint-config-next, @eslint/eslintrc, playwright (+17 more)

### Community 16 - "assessments.ts"
Cohesion: 0.17
Nodes (16): Assessment, CostEstimate, BAR_MILESTONES, computeDeadlines(), Deadline, isRelevant(), MILESTONES, shiftMonths() (+8 more)

### Community 17 - "score.ts"
Cohesion: 0.19
Nodes (16): academicStrength(), buildVerdictInput(), clamp(), financialFit(), immigrationRisk(), professionalRealism(), scoreAxes(), REF (+8 more)

### Community 18 - "engine-a/run.ts"
Cohesion: 0.22
Nodes (13): evaluateCondition(), fireRules(), StructuredProfile, RULES, TEXT_BLOCKS, PATH_PRIORITY, runEngineA(), REF (+5 more)

### Community 19 - "estimate.ts"
Cohesion: 0.14
Nodes (13): dateFr(), metadata, PrintableReportPage(), ACADEMIC, add(), BAR, CostRange, estimateCosts() (+5 more)

### Community 20 - "derive.ts"
Cohesion: 0.25
Nodes (12): profileOf(), currentPhase(), deriveProfile(), flattenForRules(), hasBlockingGaps(), JOURNEY_TYPES, lawYearsValidated(), monthsUntilIntake() (+4 more)

### Community 21 - "package.json"
Cohesion: 0.11
Nodes (17): @auth/prisma-adapter, next, next-auth, dependencies, @auth/prisma-adapter, next, next-auth, @prisma/client (+9 more)

### Community 22 - "verify-simulator.mjs"
Cohesion: 0.17
Nodes (7): BASE, bourses, consoleErrors, EMAIL, failures, final, tuition

### Community 23 - "verify-backoffice.mjs"
Cohesion: 0.18
Nodes (8): BASE, blocked, boxes, detail, failures, printed, REQUESTER_EMAIL, review

### Community 24 - "check-legal.mjs"
Cohesion: 0.20
Nodes (8): COVERED, failures, held, models, OUT_OF_SCOPE, policy, schema, slugs

### Community 25 - "verify-dashboard.mjs"
Cohesion: 0.20
Nodes (7): BASE, consoleErrors, done, EMAIL, failures, interdits, roadmap

### Community 26 - "wait.mjs"
Cohesion: 0.47
Nodes (6): answerScreens(), submitDiagnostic(), waitFor(), waitForText(), waitForTextChange(), waitForTextGone()

### Community 27 - "verify-checkout.mjs"
Cohesion: 0.22
Nodes (6): BASE, checkoutText, consent, consoleErrors, EMAIL, failures

### Community 28 - "verify-consultations.mjs"
Cohesion: 0.22
Nodes (6): BASE, consoleErrors, EMAIL, failures, local, slotDate

### Community 29 - "verify-espace.mjs"
Cohesion: 0.22
Nodes (5): BASE, consoleErrors, declarative, EMAIL, failures

### Community 30 - "import-partnerships.mjs"
Cohesion: 0.25
Nodes (5): dataPath, db, partnerships, snapshotDate, universities

### Community 31 - "verify-legal.mjs"
Cohesion: 0.25
Nodes (5): BASE, consoleErrors, DOCUMENTS, EMAIL, failures

### Community 32 - "check-vocabulary.mjs"
Cohesion: 0.33
Nodes (5): ALLOWLIST, EXTS, FORBIDDEN, ROOTS, walk()

### Community 33 - "verify-questionnaire.mjs"
Cohesion: 0.29
Nodes (5): ANSWERS, BASE, consoleErrors, EMAIL, failures

### Community 34 - "verify-all.mjs"
Cohesion: 0.33
Nodes (3): broken, results, SUITES

### Community 36 - ".prettierrc.json"
Cohesion: 0.40
Nodes (4): printWidth, semi, singleQuote, trailingComma

### Community 37 - "check-design-tokens.mjs"
Cohesion: 0.40
Nodes (3): EXTS, PALETTE, ROOTS

### Community 38 - "check-rules.mjs"
Cohesion: 0.40
Nodes (3): blocks, source, TODAY

### Community 39 - "verify-animations.mjs"
Cohesion: 0.40
Nodes (3): consoleErrors, failures, longest

### Community 40 - "next.config.ts"
Cohesion: 0.50
Nodes (3): csp, nextConfig, securityHeaders

### Community 41 - "sign-in.mjs"
Cohesion: 0.83
Nodes (3): lastSignInLink(), mailLogPath(), signInByEmail()

## Knowledge Gaps
- **327 isolated node(s):** `session-start.sh script`, `printWidth`, `singleQuote`, `semi`, `trailingComma` (+322 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `colors` connect `tokens.ts` to `dashboard/page.tsx`, `reports.ts`, `questionnaire/types.ts`, `app/consultations/page.tsx`, `Simulator.tsx`, `resultat/[id]/page.tsx`, `paiement/[id]/page.tsx`, `documents/actions.ts`, `LegalPage.tsx`, `estimate.ts`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Why does `fonts` connect `tokens.ts` to `dashboard/page.tsx`, `reports.ts`, `questionnaire/types.ts`, `app/consultations/page.tsx`, `Simulator.tsx`, `resultat/[id]/page.tsx`, `paiement/[id]/page.tsx`, `documents/actions.ts`, `LegalPage.tsx`, `estimate.ts`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Why does `alpha` connect `tokens.ts` to `dashboard/page.tsx`, `reports.ts`, `questionnaire/types.ts`, `app/consultations/page.tsx`, `Simulator.tsx`, `resultat/[id]/page.tsx`, `paiement/[id]/page.tsx`, `documents/actions.ts`, `LegalPage.tsx`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **What connects `session-start.sh script`, `printWidth`, `singleQuote` to the rest of the system?**
  _327 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `tokens.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07153376814643383 - nodes in this community are weakly interconnected._
- **Should `dashboard/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06383619391749473 - nodes in this community are weakly interconnected._
- **Should `reports.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05109218807848945 - nodes in this community are weakly interconnected._