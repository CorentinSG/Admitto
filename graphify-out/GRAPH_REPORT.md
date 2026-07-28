# Graph Report - .  (2026-07-28)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 430 nodes · 929 edges · 26 communities (20 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `522940e6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- tokens.ts
- assessment/compute.ts
- resultat/[id]/page.tsx
- questionnaire/types.ts
- assemble.ts
- scripts
- compilerOptions
- devDependencies
- score.ts
- layout.tsx
- verify-backoffice.mjs
- verify-questionnaire.mjs
- check-vocabulary.mjs
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
1. `colors` - 23 edges
2. `fonts` - 23 edges
3. `useInView()` - 21 edges
4. `scripts` - 21 edges
5. `alpha` - 20 edges
6. `compilerOptions` - 16 edges
7. `Answers` - 14 edges
8. `gradients` - 13 edges
9. `layout` - 13 edges
10. `thresholds` - 12 edges

## Surprising Connections (you probably didn't know these)
- `AdminReportPage()` --calls--> `assembleReport()`  [EXTRACTED]
  app/(admin)/admin/rapports/[id]/page.tsx → lib/report/assemble.ts
- `Screen` --references--> `ScreenId`  [EXTRACTED]
  content/diagnostic.ts → lib/questionnaire/types.ts
- `PrintableReportPage()` --calls--> `assembleReport()`  [EXTRACTED]
  app/(admin)/admin/rapports/[id]/impression/page.tsx → lib/report/assemble.ts
- `DashboardPreview()` --calls--> `useInView()`  [EXTRACTED]
  app/(marketing)/_sections/DashboardPreview.tsx → design/animations.tsx
- `Diagnostic()` --calls--> `useInView()`  [EXTRACTED]
  app/(marketing)/_sections/Diagnostic.tsx → design/animations.tsx

## Import Cycles
- None detected.

## Communities (26 total, 6 thin omitted)

### Community 0 - "tokens.ts"
Cohesion: 0.13
Nodes (39): Footer(), Nav(), Badge(), GhostCta(), GoldCta(), SectionLabel(), SectionTitle(), DashboardPreview() (+31 more)

### Community 1 - "assessment/compute.ts"
Cohesion: 0.08
Nodes (42): Assessment, computeAssessment(), CostEstimate, BAR_MILESTONES, computeDeadlines(), Deadline, isRelevant(), MILESTONES (+34 more)

### Community 2 - "resultat/[id]/page.tsx"
Cohesion: 0.07
Nodes (29): addCorrection(), setReportStatus(), metadata, dateFr(), metadata, PrintableReportPage(), AdminReportPage(), metadata (+21 more)

### Community 3 - "questionnaire/types.ts"
Cohesion: 0.09
Nodes (37): oneOf(), parseAnswers(), submitQuestionnaire(), metadata, Questionnaire(), intro, Option, Screen (+29 more)

### Community 4 - "assemble.ts"
Cohesion: 0.09
Nodes (35): AXIS_COMMENTS, AXIS_LABELS, NEXT_STEPS, OFFER_BLOCKS, REPORT_STATIC, RISK_BLOCKS, VERDICT_BLOCKS, AXES (+27 more)

### Community 5 - "scripts"
Cohesion: 0.06
Nodes (32): next, dependencies, next, react, react-dom, description, name, private (+24 more)

### Community 6 - "compilerOptions"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, graphify-out, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 7 - "devDependencies"
Cohesion: 0.10
Nodes (21): eslint, eslint-config-next, @eslint/eslintrc, devDependencies, eslint, eslint-config-next, @eslint/eslintrc, prettier (+13 more)

### Community 8 - "score.ts"
Cohesion: 0.22
Nodes (15): ACADEMIC, add(), BAR, CostRange, estimateCosts(), LIVING, academicStrength(), buildVerdictInput() (+7 more)

### Community 9 - "layout.tsx"
Cohesion: 0.29
Nodes (3): cormorant, dmSans, metadata

### Community 10 - "verify-backoffice.mjs"
Cohesion: 0.29
Nodes (4): BASE, detail, failures, printed

### Community 11 - "verify-questionnaire.mjs"
Cohesion: 0.29
Nodes (5): ANSWERS, BASE, consoleErrors, failures, totals

### Community 12 - "check-vocabulary.mjs"
Cohesion: 0.33
Nodes (4): ALLOWLIST, EXTS, FORBIDDEN, ROOTS

### Community 13 - "middleware.ts"
Cohesion: 0.60
Nodes (4): config, middleware(), notFound(), timingSafeEqual()

### Community 14 - ".prettierrc.json"
Cohesion: 0.40
Nodes (4): printWidth, semi, singleQuote, trailingComma

### Community 15 - "check-design-tokens.mjs"
Cohesion: 0.40
Nodes (3): EXTS, PALETTE, ROOTS

### Community 16 - "check-rules.mjs"
Cohesion: 0.40
Nodes (3): blocks, source, TODAY

### Community 17 - "verify-animations.mjs"
Cohesion: 0.40
Nodes (3): consoleErrors, failures, longest

## Knowledge Gaps
- **138 isolated node(s):** `session-start.sh script`, `printWidth`, `singleQuote`, `semi`, `trailingComma` (+133 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `colors` connect `tokens.ts` to `layout.tsx`, `resultat/[id]/page.tsx`, `questionnaire/types.ts`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Why does `fonts` connect `tokens.ts` to `layout.tsx`, `resultat/[id]/page.tsx`, `questionnaire/types.ts`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Why does `Answers` connect `assessment/compute.ts` to `score.ts`, `questionnaire/types.ts`, `assemble.ts`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **What connects `session-start.sh script`, `printWidth`, `singleQuote` to the rest of the system?**
  _138 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `tokens.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.13326282390269698 - nodes in this community are weakly interconnected._
- **Should `assessment/compute.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08385744234800839 - nodes in this community are weakly interconnected._
- **Should `resultat/[id]/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06862745098039216 - nodes in this community are weakly interconnected._