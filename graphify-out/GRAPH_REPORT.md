# Graph Report - .  (2026-07-28)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 518 nodes · 1130 edges · 28 communities (22 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6c25ce9c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- assemble.ts
- tokens.ts
- assessment/compute.ts
- questionnaire/types.ts
- paiement/[id]/page.tsx
- reports.ts
- dispatch.ts
- scripts
- compilerOptions
- devDependencies
- verify-checkout.mjs
- app/layout.tsx
- check-vocabulary.mjs
- verify-backoffice.mjs
- verify-questionnaire.mjs
- middleware.ts
- .prettierrc.json
- check-design-tokens.mjs
- check-rules.mjs
- verify-animations.mjs
- eslint.config.mjs
- render-report-pdf.mjs
- session-start.sh
- post-commit
- pre-commit
- next.config.ts

## God Nodes (most connected - your core abstractions)
1. `colors` - 25 edges
2. `fonts` - 25 edges
3. `alpha` - 22 edges
4. `scripts` - 22 edges
5. `useInView()` - 21 edges
6. `compilerOptions` - 16 edges
7. `gradients` - 15 edges
8. `Answers` - 14 edges
9. `layout` - 13 edges
10. `Assessment` - 13 edges

## Surprising Connections (you probably didn't know these)
- `AdminReportPage()` --calls--> `assembleReport()`  [EXTRACTED]
  app/(admin)/admin/rapports/[id]/page.tsx → lib/report/assemble.ts
- `submitQuestionnaire()` --calls--> `dispatchEmail()`  [EXTRACTED]
  app/(marketing)/diagnostic/actions.ts → lib/email/dispatch.ts
- `submitQuestionnaire()` --calls--> `emailVariables()`  [EXTRACTED]
  app/(marketing)/diagnostic/actions.ts → lib/email/dispatch.ts
- `Screen` --references--> `ScreenId`  [EXTRACTED]
  content/diagnostic.ts → lib/questionnaire/types.ts
- `DashboardPreview()` --calls--> `useInView()`  [EXTRACTED]
  app/(marketing)/_sections/DashboardPreview.tsx → design/animations.tsx

## Import Cycles
- None detected.

## Communities (28 total, 6 thin omitted)

### Community 0 - "assemble.ts"
Cohesion: 0.06
Nodes (55): dateFr(), metadata, PrintableReportPage(), AdminReportPage(), AXIS_COMMENTS, AXIS_LABELS, NEXT_STEPS, OFFER_BLOCKS (+47 more)

### Community 1 - "tokens.ts"
Cohesion: 0.13
Nodes (39): Footer(), Nav(), Badge(), GhostCta(), GoldCta(), SectionLabel(), SectionTitle(), DashboardPreview() (+31 more)

### Community 2 - "assessment/compute.ts"
Cohesion: 0.08
Nodes (44): Assessment, computeAssessment(), CostEstimate, BAR_MILESTONES, computeDeadlines(), Deadline, isRelevant(), MILESTONES (+36 more)

### Community 3 - "questionnaire/types.ts"
Cohesion: 0.09
Nodes (36): oneOf(), parseAnswers(), submitQuestionnaire(), metadata, Questionnaire(), intro, Option, Screen (+28 more)

### Community 4 - "paiement/[id]/page.tsx"
Cohesion: 0.10
Nodes (28): POST(), startCheckout(), CheckoutButton(), CheckoutPage(), metadata, checkout, applyDeduction(), createDeduction() (+20 more)

### Community 5 - "reports.ts"
Cohesion: 0.09
Nodes (23): addCorrection(), setReportStatus(), metadata, metadata, ReportControls(), dateFr(), metadata, ResultPage() (+15 more)

### Community 6 - "dispatch.ts"
Cohesion: 0.11
Nodes (27): EMAIL_TEMPLATES, baseUrl(), dispatchEmail(), emailVariables(), SUBMITTED, VARIABLES, ALLOWED_EMAIL_VARIABLES, AllowedEmailVariable (+19 more)

### Community 7 - "scripts"
Cohesion: 0.06
Nodes (33): next, dependencies, next, react, react-dom, description, name, private (+25 more)

### Community 8 - "compilerOptions"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, graphify-out, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 9 - "devDependencies"
Cohesion: 0.10
Nodes (21): eslint, eslint-config-next, @eslint/eslintrc, devDependencies, eslint, eslint-config-next, @eslint/eslintrc, prettier (+13 more)

### Community 10 - "verify-checkout.mjs"
Cohesion: 0.25
Nodes (5): BASE, checkoutText, consent, consoleErrors, failures

### Community 11 - "app/layout.tsx"
Cohesion: 0.29
Nodes (3): cormorant, dmSans, metadata

### Community 12 - "check-vocabulary.mjs"
Cohesion: 0.33
Nodes (5): ALLOWLIST, EXTS, FORBIDDEN, ROOTS, walk()

### Community 13 - "verify-backoffice.mjs"
Cohesion: 0.29
Nodes (4): BASE, detail, failures, printed

### Community 14 - "verify-questionnaire.mjs"
Cohesion: 0.29
Nodes (5): ANSWERS, BASE, consoleErrors, failures, totals

### Community 15 - "middleware.ts"
Cohesion: 0.60
Nodes (4): config, middleware(), notFound(), timingSafeEqual()

### Community 16 - ".prettierrc.json"
Cohesion: 0.40
Nodes (4): printWidth, semi, singleQuote, trailingComma

### Community 17 - "check-design-tokens.mjs"
Cohesion: 0.40
Nodes (3): EXTS, PALETTE, ROOTS

### Community 18 - "check-rules.mjs"
Cohesion: 0.40
Nodes (3): blocks, source, TODAY

### Community 19 - "verify-animations.mjs"
Cohesion: 0.40
Nodes (3): consoleErrors, failures, longest

## Knowledge Gaps
- **152 isolated node(s):** `session-start.sh script`, `printWidth`, `singleQuote`, `semi`, `trailingComma` (+147 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `colors` connect `tokens.ts` to `assemble.ts`, `questionnaire/types.ts`, `paiement/[id]/page.tsx`, `reports.ts`, `app/layout.tsx`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Why does `fonts` connect `tokens.ts` to `assemble.ts`, `questionnaire/types.ts`, `paiement/[id]/page.tsx`, `reports.ts`, `app/layout.tsx`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Why does `alpha` connect `tokens.ts` to `questionnaire/types.ts`, `paiement/[id]/page.tsx`, `reports.ts`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **What connects `session-start.sh script`, `printWidth`, `singleQuote` to the rest of the system?**
  _152 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `assemble.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.057902973395931145 - nodes in this community are weakly interconnected._
- **Should `tokens.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.13326282390269698 - nodes in this community are weakly interconnected._
- **Should `assessment/compute.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07743496672716274 - nodes in this community are weakly interconnected._