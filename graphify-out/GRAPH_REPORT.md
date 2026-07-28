# Graph Report - .  (2026-07-28)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 620 nodes · 1433 edges · 31 communities (24 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `bdf07a9a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- assemble.ts
- tokens.ts
- dashboard/page.tsx
- assessment/compute.ts
- paiement/[id]/page.tsx
- questionnaire/types.ts
- dispatch.ts
- scripts
- reports.ts
- resultat/[id]/page.tsx
- compilerOptions
- devDependencies
- verify-dashboard.mjs
- verify-checkout.mjs
- app/layout.tsx
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
1. `colors` - 30 edges
2. `fonts` - 30 edges
3. `alpha` - 26 edges
4. `scripts` - 24 edges
5. `useInView()` - 21 edges
6. `gradients` - 18 edges
7. `compilerOptions` - 16 edges
8. `Answers` - 16 edges
9. `Assessment` - 14 edges
10. `layout` - 13 edges

## Surprising Connections (you probably didn't know these)
- `AdminReportPage()` --calls--> `assembleReport()`  [EXTRACTED]
  app/(admin)/admin/rapports/[id]/page.tsx → lib/report/assemble.ts
- `Screen` --references--> `ScreenId`  [EXTRACTED]
  content/diagnostic.ts → lib/questionnaire/types.ts
- `setTaskStatus()` --calls--> `verifyAccessToken()`  [EXTRACTED]
  app/(app)/app/actions.ts → lib/access/session.ts
- `DashboardPage()` --calls--> `verifyAccessToken()`  [EXTRACTED]
  app/(app)/app/dashboard/page.tsx → lib/access/session.ts
- `RoadmapPage()` --calls--> `verifyAccessToken()`  [EXTRACTED]
  app/(app)/app/roadmap/page.tsx → lib/access/session.ts

## Import Cycles
- None detected.

## Communities (31 total, 7 thin omitted)

### Community 0 - "assemble.ts"
Cohesion: 0.05
Nodes (60): dateFr(), metadata, PrintableReportPage(), AXIS_COMMENTS, AXIS_LABELS, NEXT_STEPS, OFFER_BLOCKS, REPORT_STATIC (+52 more)

### Community 1 - "tokens.ts"
Cohesion: 0.11
Nodes (42): Footer(), Nav(), Badge(), GhostCta(), GoldCta(), SectionLabel(), SectionTitle(), metadata (+34 more)

### Community 2 - "dashboard/page.tsx"
Cohesion: 0.08
Nodes (54): setTaskStatus(), SELECTABLE, TaskStatusControl(), DashboardPage(), dateFr(), metadata, dateFr(), metadata (+46 more)

### Community 3 - "assessment/compute.ts"
Cohesion: 0.09
Nodes (36): computeAssessment(), BAR_MILESTONES, computeDeadlines(), Deadline, isRelevant(), MILESTONES, shiftMonths(), keys() (+28 more)

### Community 4 - "paiement/[id]/page.tsx"
Cohesion: 0.10
Nodes (27): POST(), startCheckout(), CheckoutButton(), CheckoutPage(), metadata, checkout, applyDeduction(), createDeduction() (+19 more)

### Community 5 - "questionnaire/types.ts"
Cohesion: 0.10
Nodes (32): intro, Option, Screen, ui, FRENCH_UNIVERSITIES, Partnership, PARTNERSHIPS, PartnershipDetection (+24 more)

### Community 6 - "dispatch.ts"
Cohesion: 0.10
Nodes (30): oneOf(), parseAnswers(), submitQuestionnaire(), EMAIL_TEMPLATES, baseUrl(), dispatchEmail(), emailVariables(), SUBMITTED (+22 more)

### Community 7 - "scripts"
Cohesion: 0.06
Nodes (35): next, dependencies, next, react, react-dom, description, name, private (+27 more)

### Community 8 - "reports.ts"
Cohesion: 0.12
Nodes (19): addCorrection(), setReportStatus(), metadata, AdminReportPage(), metadata, ReportControls(), STATUS_LABELS, announcedDelay() (+11 more)

### Community 9 - "resultat/[id]/page.tsx"
Cohesion: 0.12
Nodes (21): grantPlatformAccess(), AccessButton(), dateFr(), metadata, ResultPage(), PATH_LABELS, result, encoder (+13 more)

### Community 10 - "compilerOptions"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, graphify-out, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 11 - "devDependencies"
Cohesion: 0.10
Nodes (21): eslint, eslint-config-next, @eslint/eslintrc, devDependencies, eslint, eslint-config-next, @eslint/eslintrc, prettier (+13 more)

### Community 12 - "verify-dashboard.mjs"
Cohesion: 0.22
Nodes (6): BASE, consoleErrors, done, failures, interdits, roadmap

### Community 13 - "verify-checkout.mjs"
Cohesion: 0.25
Nodes (5): BASE, checkoutText, consent, consoleErrors, failures

### Community 14 - "app/layout.tsx"
Cohesion: 0.29
Nodes (3): cormorant, dmSans, metadata

### Community 15 - "check-vocabulary.mjs"
Cohesion: 0.33
Nodes (5): ALLOWLIST, EXTS, FORBIDDEN, ROOTS, walk()

### Community 16 - "verify-backoffice.mjs"
Cohesion: 0.29
Nodes (4): BASE, detail, failures, printed

### Community 17 - "verify-questionnaire.mjs"
Cohesion: 0.29
Nodes (5): ANSWERS, BASE, consoleErrors, failures, totals

### Community 18 - ".prettierrc.json"
Cohesion: 0.40
Nodes (4): printWidth, semi, singleQuote, trailingComma

### Community 19 - "check-design-tokens.mjs"
Cohesion: 0.40
Nodes (3): EXTS, PALETTE, ROOTS

### Community 20 - "check-rules.mjs"
Cohesion: 0.40
Nodes (3): blocks, source, TODAY

### Community 21 - "verify-animations.mjs"
Cohesion: 0.40
Nodes (3): consoleErrors, failures, longest

## Knowledge Gaps
- **172 isolated node(s):** `session-start.sh script`, `printWidth`, `singleQuote`, `semi`, `trailingComma` (+167 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `colors` connect `tokens.ts` to `assemble.ts`, `dashboard/page.tsx`, `paiement/[id]/page.tsx`, `reports.ts`, `resultat/[id]/page.tsx`, `app/layout.tsx`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Why does `fonts` connect `tokens.ts` to `assemble.ts`, `dashboard/page.tsx`, `paiement/[id]/page.tsx`, `reports.ts`, `resultat/[id]/page.tsx`, `app/layout.tsx`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Why does `alpha` connect `tokens.ts` to `reports.ts`, `resultat/[id]/page.tsx`, `dashboard/page.tsx`, `paiement/[id]/page.tsx`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **What connects `session-start.sh script`, `printWidth`, `singleQuote` to the rest of the system?**
  _172 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `assemble.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05284810126582278 - nodes in this community are weakly interconnected._
- **Should `tokens.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10837245696400626 - nodes in this community are weakly interconnected._
- **Should `dashboard/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07847082494969819 - nodes in this community are weakly interconnected._