# Graph Report - .  (2026-07-28)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 673 nodes · 1555 edges · 33 communities (25 shown, 8 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c498c5e6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- resultat/[id]/page.tsx
- tokens.ts
- dashboard/page.tsx
- questionnaire/types.ts
- assemble.ts
- assessment/compute.ts
- paiement/[id]/page.tsx
- Simulator.tsx
- dispatch.ts
- compilerOptions
- scripts
- devDependencies
- package.json
- verify-simulator.mjs
- verify-dashboard.mjs
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
- typescript

## God Nodes (most connected - your core abstractions)
1. `colors` - 32 edges
2. `fonts` - 32 edges
3. `alpha` - 27 edges
4. `scripts` - 25 edges
5. `useInView()` - 21 edges
6. `gradients` - 19 edges
7. `compilerOptions` - 16 edges
8. `Answers` - 16 edges
9. `verifyAccessToken()` - 15 edges
10. `Assessment` - 14 edges

## Surprising Connections (you probably didn't know these)
- `AdminReportPage()` --calls--> `assembleReport()`  [EXTRACTED]
  app/(admin)/admin/rapports/[id]/page.tsx → lib/report/assemble.ts
- `PrintableReportPage()` --calls--> `assembleReport()`  [EXTRACTED]
  app/(admin)/admin/rapports/[id]/impression/page.tsx → lib/report/assemble.ts
- `submitQuestionnaire()` --calls--> `dispatchEmail()`  [EXTRACTED]
  app/(marketing)/diagnostic/actions.ts → lib/email/dispatch.ts
- `submitQuestionnaire()` --calls--> `emailVariables()`  [EXTRACTED]
  app/(marketing)/diagnostic/actions.ts → lib/email/dispatch.ts
- `Screen` --references--> `ScreenId`  [EXTRACTED]
  content/diagnostic.ts → lib/questionnaire/types.ts

## Import Cycles
- None detected.

## Communities (33 total, 8 thin omitted)

### Community 0 - "resultat/[id]/page.tsx"
Cohesion: 0.05
Nodes (48): addCorrection(), setReportStatus(), metadata, dateFr(), metadata, PrintableReportPage(), AdminReportPage(), metadata (+40 more)

### Community 1 - "tokens.ts"
Cohesion: 0.11
Nodes (42): cormorant, dmSans, metadata, Footer(), Nav(), Badge(), GhostCta(), GoldCta() (+34 more)

### Community 2 - "dashboard/page.tsx"
Cohesion: 0.08
Nodes (53): setTaskStatus(), SELECTABLE, TaskStatusControl(), DashboardPage(), dateFr(), metadata, dateFr(), metadata (+45 more)

### Community 3 - "questionnaire/types.ts"
Cohesion: 0.07
Nodes (47): oneOf(), parseAnswers(), submitQuestionnaire(), metadata, Questionnaire(), intro, Option, Screen (+39 more)

### Community 4 - "assemble.ts"
Cohesion: 0.08
Nodes (44): AXIS_COMMENTS, AXIS_LABELS, NEXT_STEPS, OFFER_BLOCKS, REPORT_STATIC, RISK_BLOCKS, VERDICT_BLOCKS, academicStrength() (+36 more)

### Community 5 - "assessment/compute.ts"
Cohesion: 0.09
Nodes (36): PATH_LABELS, computeAssessment(), ACADEMIC, add(), BAR, CostEstimate, CostRange, estimateCosts() (+28 more)

### Community 6 - "paiement/[id]/page.tsx"
Cohesion: 0.10
Nodes (27): POST(), startCheckout(), CheckoutButton(), CheckoutPage(), metadata, checkout, applyDeduction(), createDeduction() (+19 more)

### Community 7 - "Simulator.tsx"
Cohesion: 0.12
Nodes (31): NUMERIC_FIELDS, parseInputs(), removeScenario(), saveScenario(), metadata, inputStyle, labelStyle, Output() (+23 more)

### Community 8 - "dispatch.ts"
Cohesion: 0.11
Nodes (27): EMAIL_TEMPLATES, baseUrl(), dispatchEmail(), emailVariables(), SUBMITTED, VARIABLES, ALLOWED_EMAIL_VARIABLES, AllowedEmailVariable (+19 more)

### Community 9 - "compilerOptions"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, graphify-out, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 10 - "scripts"
Cohesion: 0.08
Nodes (25): scripts, build, check:all, check:rules, check:skills, check:tokens, check:vocabulary, dev (+17 more)

### Community 11 - "devDependencies"
Cohesion: 0.11
Nodes (19): eslint, eslint-config-next, @eslint/eslintrc, devDependencies, eslint, eslint-config-next, @eslint/eslintrc, prettier (+11 more)

### Community 12 - "package.json"
Cohesion: 0.17
Nodes (11): next, dependencies, next, react, react-dom, description, name, private (+3 more)

### Community 13 - "verify-simulator.mjs"
Cohesion: 0.18
Nodes (6): BASE, bourses, consoleErrors, failures, final, tuition

### Community 14 - "verify-dashboard.mjs"
Cohesion: 0.22
Nodes (6): BASE, consoleErrors, done, failures, interdits, roadmap

### Community 15 - "verify-checkout.mjs"
Cohesion: 0.25
Nodes (5): BASE, checkoutText, consent, consoleErrors, failures

### Community 16 - "check-vocabulary.mjs"
Cohesion: 0.33
Nodes (5): ALLOWLIST, EXTS, FORBIDDEN, ROOTS, walk()

### Community 17 - "verify-backoffice.mjs"
Cohesion: 0.29
Nodes (4): BASE, detail, failures, printed

### Community 18 - "verify-questionnaire.mjs"
Cohesion: 0.29
Nodes (5): ANSWERS, BASE, consoleErrors, failures, totals

### Community 19 - ".prettierrc.json"
Cohesion: 0.40
Nodes (4): printWidth, semi, singleQuote, trailingComma

### Community 20 - "check-design-tokens.mjs"
Cohesion: 0.40
Nodes (3): EXTS, PALETTE, ROOTS

### Community 21 - "check-rules.mjs"
Cohesion: 0.40
Nodes (3): blocks, source, TODAY

### Community 22 - "verify-animations.mjs"
Cohesion: 0.40
Nodes (3): consoleErrors, failures, longest

## Knowledge Gaps
- **187 isolated node(s):** `session-start.sh script`, `printWidth`, `singleQuote`, `semi`, `trailingComma` (+182 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `colors` connect `tokens.ts` to `resultat/[id]/page.tsx`, `dashboard/page.tsx`, `questionnaire/types.ts`, `paiement/[id]/page.tsx`, `Simulator.tsx`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **Why does `fonts` connect `tokens.ts` to `resultat/[id]/page.tsx`, `dashboard/page.tsx`, `questionnaire/types.ts`, `paiement/[id]/page.tsx`, `Simulator.tsx`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **Why does `alpha` connect `tokens.ts` to `resultat/[id]/page.tsx`, `dashboard/page.tsx`, `questionnaire/types.ts`, `paiement/[id]/page.tsx`, `Simulator.tsx`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **What connects `session-start.sh script`, `printWidth`, `singleQuote` to the rest of the system?**
  _187 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `resultat/[id]/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05117117117117117 - nodes in this community are weakly interconnected._
- **Should `tokens.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10704225352112676 - nodes in this community are weakly interconnected._
- **Should `dashboard/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07950310559006211 - nodes in this community are weakly interconnected._