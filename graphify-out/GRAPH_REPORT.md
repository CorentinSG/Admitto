# Graph Report - .  (2026-07-28)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 201 nodes · 384 edges · 20 communities (15 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b138579e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ui.tsx
- compilerOptions
- devDependencies
- scripts
- homepage.ts
- (marketing)/page.tsx
- evaluate.ts
- package.json
- verdict.ts
- layout.tsx
- check-vocabulary.mjs
- .prettierrc.json
- check-design-tokens.mjs
- verify-animations.mjs
- eslint.config.mjs
- session-start.sh
- post-commit
- pre-commit
- next.config.ts

## God Nodes (most connected - your core abstractions)
1. `useInView()` - 21 edges
2. `scripts` - 17 edges
3. `colors` - 16 edges
4. `fonts` - 16 edges
5. `compilerOptions` - 16 edges
6. `alpha` - 14 edges
7. `layout` - 13 edges
8. `thresholds` - 12 edges
9. `SectionLabel()` - 10 edges
10. `SectionTitle()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `DashboardPreview()` --calls--> `useInView()`  [EXTRACTED]
  app/(marketing)/_sections/DashboardPreview.tsx → design/animations.tsx
- `Diagnostic()` --calls--> `useInView()`  [EXTRACTED]
  app/(marketing)/_sections/Diagnostic.tsx → design/animations.tsx
- `Faq()` --calls--> `useInView()`  [EXTRACTED]
  app/(marketing)/_sections/Faq.tsx → design/animations.tsx
- `FinalCta()` --calls--> `useInView()`  [EXTRACTED]
  app/(marketing)/_sections/FinalCta.tsx → design/animations.tsx
- `Journey()` --calls--> `useInView()`  [EXTRACTED]
  app/(marketing)/_sections/Journey.tsx → design/animations.tsx

## Import Cycles
- None detected.

## Communities (20 total, 5 thin omitted)

### Community 0 - "ui.tsx"
Cohesion: 0.35
Nodes (12): Badge(), GhostCta(), GoldCta(), SectionLabel(), SectionTitle(), thresholds, alpha, colors (+4 more)

### Community 1 - "compilerOptions"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, graphify-out, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 2 - "devDependencies"
Cohesion: 0.10
Nodes (21): eslint, eslint-config-next, @eslint/eslintrc, devDependencies, eslint, eslint-config-next, @eslint/eslintrc, prettier (+13 more)

### Community 3 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, build, check:all, check:tokens, check:vocabulary, dev, format, format:check (+9 more)

### Community 4 - "homepage.ts"
Cohesion: 0.13
Nodes (14): Footer(), dashboard, diagnostic, faq, finalCta, footer, founder, hero (+6 more)

### Community 5 - "(marketing)/page.tsx"
Cohesion: 0.21
Nodes (13): Nav(), DashboardPreview(), Diagnostic(), Faq(), FinalCta(), Founder(), Hero(), Journey() (+5 more)

### Community 6 - "evaluate.ts"
Cohesion: 0.27
Nodes (8): evaluateCondition(), fireRules(), StructuredProfile, EngineAOutput, PRELIMINARY_PATHS, PreliminaryPath, Rule, RuleCondition

### Community 7 - "package.json"
Cohesion: 0.17
Nodes (11): next, dependencies, next, react, react-dom, description, name, private (+3 more)

### Community 8 - "verdict.ts"
Cohesion: 0.22
Nodes (8): AXES, Axis, AxisScore, AxisScores, computeVerdict(), Verdict, VerdictInput, VERDICTS

### Community 9 - "layout.tsx"
Cohesion: 0.29
Nodes (3): cormorant, dmSans, metadata

### Community 10 - "check-vocabulary.mjs"
Cohesion: 0.33
Nodes (4): ALLOWLIST, EXTS, FORBIDDEN, ROOTS

### Community 11 - ".prettierrc.json"
Cohesion: 0.40
Nodes (4): printWidth, semi, singleQuote, trailingComma

### Community 12 - "check-design-tokens.mjs"
Cohesion: 0.40
Nodes (3): EXTS, PALETTE, ROOTS

### Community 13 - "verify-animations.mjs"
Cohesion: 0.40
Nodes (3): consoleErrors, failures, longest

## Knowledge Gaps
- **88 isolated node(s):** `session-start.sh script`, `printWidth`, `singleQuote`, `semi`, `trailingComma` (+83 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `devDependencies` to `package.json`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `scripts` connect `scripts` to `package.json`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **What connects `session-start.sh script`, `printWidth`, `singleQuote` to the rest of the system?**
  _88 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Should `scripts` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Should `homepage.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._