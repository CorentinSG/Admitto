# Graph Report - .  (2026-07-28)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 333 nodes · 679 edges · 22 communities (17 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2f0cb34a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- (marketing)/page.tsx
- questionnaire/types.ts
- assessment/compute.ts
- scripts
- compilerOptions
- devDependencies
- run.ts
- [id]/page.tsx
- verdict.ts
- layout.tsx
- verify-questionnaire.mjs
- check-vocabulary.mjs
- .prettierrc.json
- check-design-tokens.mjs
- check-rules.mjs
- verify-animations.mjs
- eslint.config.mjs
- session-start.sh
- post-commit
- pre-commit
- next.config.ts

## God Nodes (most connected - your core abstractions)
1. `useInView()` - 21 edges
2. `scripts` - 19 edges
3. `colors` - 18 edges
4. `fonts` - 18 edges
5. `alpha` - 16 edges
6. `compilerOptions` - 16 edges
7. `layout` - 13 edges
8. `gradients` - 12 edges
9. `thresholds` - 12 edges
10. `Answers` - 11 edges

## Surprising Connections (you probably didn't know these)
- `submitQuestionnaire()` --calls--> `computeAssessment()`  [EXTRACTED]
  app/(marketing)/diagnostic/actions.ts → lib/assessment/compute.ts
- `Screen` --references--> `ScreenId`  [EXTRACTED]
  content/diagnostic.ts → lib/questionnaire/types.ts
- `DashboardPreview()` --calls--> `useInView()`  [EXTRACTED]
  app/(marketing)/_sections/DashboardPreview.tsx → design/animations.tsx
- `Diagnostic()` --calls--> `useInView()`  [EXTRACTED]
  app/(marketing)/_sections/Diagnostic.tsx → design/animations.tsx
- `Faq()` --calls--> `useInView()`  [EXTRACTED]
  app/(marketing)/_sections/Faq.tsx → design/animations.tsx

## Import Cycles
- None detected.

## Communities (22 total, 5 thin omitted)

### Community 0 - "(marketing)/page.tsx"
Cohesion: 0.14
Nodes (39): Footer(), Nav(), Badge(), GhostCta(), GoldCta(), SectionLabel(), SectionTitle(), DashboardPreview() (+31 more)

### Community 1 - "questionnaire/types.ts"
Cohesion: 0.08
Nodes (38): oneOf(), parseAnswers(), submitQuestionnaire(), metadata, Questionnaire(), intro, Option, Screen (+30 more)

### Community 2 - "assessment/compute.ts"
Cohesion: 0.08
Nodes (36): Assessment, computeAssessment(), ACADEMIC, add(), BAR, CostEstimate, CostRange, estimateCosts() (+28 more)

### Community 3 - "scripts"
Cohesion: 0.06
Nodes (30): next, dependencies, next, react, react-dom, description, name, private (+22 more)

### Community 4 - "compilerOptions"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, graphify-out, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 5 - "devDependencies"
Cohesion: 0.10
Nodes (21): eslint, eslint-config-next, @eslint/eslintrc, devDependencies, eslint, eslint-config-next, @eslint/eslintrc, prettier (+13 more)

### Community 6 - "run.ts"
Cohesion: 0.21
Nodes (14): evaluateCondition(), fireRules(), StructuredProfile, RULES, TEXT_BLOCKS, PATH_PRIORITY, runEngineA(), REF (+6 more)

### Community 7 - "[id]/page.tsx"
Cohesion: 0.22
Nodes (9): dateFr(), metadata, ResultPage(), PATH_LABELS, result, announcedDelay(), DELAY_TIERS, isSaturated() (+1 more)

### Community 8 - "verdict.ts"
Cohesion: 0.22
Nodes (8): AXES, Axis, AxisScore, AxisScores, computeVerdict(), Verdict, VerdictInput, VERDICTS

### Community 9 - "layout.tsx"
Cohesion: 0.29
Nodes (3): cormorant, dmSans, metadata

### Community 10 - "verify-questionnaire.mjs"
Cohesion: 0.29
Nodes (5): ANSWERS, BASE, consoleErrors, failures, totals

### Community 11 - "check-vocabulary.mjs"
Cohesion: 0.33
Nodes (4): ALLOWLIST, EXTS, FORBIDDEN, ROOTS

### Community 12 - ".prettierrc.json"
Cohesion: 0.40
Nodes (4): printWidth, semi, singleQuote, trailingComma

### Community 13 - "check-design-tokens.mjs"
Cohesion: 0.40
Nodes (3): EXTS, PALETTE, ROOTS

### Community 14 - "check-rules.mjs"
Cohesion: 0.40
Nodes (3): blocks, source, TODAY

### Community 15 - "verify-animations.mjs"
Cohesion: 0.40
Nodes (3): consoleErrors, failures, longest

## Knowledge Gaps
- **117 isolated node(s):** `session-start.sh script`, `printWidth`, `singleQuote`, `semi`, `trailingComma` (+112 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `colors` connect `(marketing)/page.tsx` to `layout.tsx`, `questionnaire/types.ts`, `[id]/page.tsx`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `fonts` connect `(marketing)/page.tsx` to `layout.tsx`, `questionnaire/types.ts`, `[id]/page.tsx`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `Answers` connect `assessment/compute.ts` to `questionnaire/types.ts`, `run.ts`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **What connects `session-start.sh script`, `printWidth`, `singleQuote` to the rest of the system?**
  _117 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `(marketing)/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.13954802259887006 - nodes in this community are weakly interconnected._
- **Should `questionnaire/types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._
- **Should `assessment/compute.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08282828282828283 - nodes in this community are weakly interconnected._