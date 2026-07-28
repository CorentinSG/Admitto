# Graph Report - .  (2026-07-28)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 201 nodes · 387 edges · 19 communities (14 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2be8fbef`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- homepage.ts
- compilerOptions
- devDependencies
- (marketing)/page.tsx
- scripts
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
1. `useInView()` - 23 edges
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
- `Founder()` --calls--> `useInView()`  [EXTRACTED]
  app/(marketing)/_sections/Founder.tsx → design/animations.tsx

## Import Cycles
- None detected.

## Communities (19 total, 5 thin omitted)

### Community 0 - "homepage.ts"
Cohesion: 0.21
Nodes (24): Badge(), GhostCta(), GoldCta(), SectionLabel(), SectionTitle(), dashboard, diagnostic, faq (+16 more)

### Community 1 - "compilerOptions"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, graphify-out, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 2 - "devDependencies"
Cohesion: 0.10
Nodes (21): eslint, eslint-config-next, @eslint/eslintrc, devDependencies, eslint, eslint-config-next, @eslint/eslintrc, prettier (+13 more)

### Community 3 - "(marketing)/page.tsx"
Cohesion: 0.18
Nodes (15): Footer(), Nav(), DashboardPreview(), Diagnostic(), Faq(), FinalCta(), Founder(), Hero() (+7 more)

### Community 4 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, build, check:all, check:tokens, check:vocabulary, dev, format, format:check (+9 more)

### Community 5 - "evaluate.ts"
Cohesion: 0.27
Nodes (8): evaluateCondition(), fireRules(), StructuredProfile, EngineAOutput, PRELIMINARY_PATHS, PreliminaryPath, Rule, RuleCondition

### Community 6 - "package.json"
Cohesion: 0.17
Nodes (11): next, dependencies, next, react, react-dom, description, name, private (+3 more)

### Community 7 - "verdict.ts"
Cohesion: 0.22
Nodes (8): AXES, Axis, AxisScore, AxisScores, computeVerdict(), Verdict, VerdictInput, VERDICTS

### Community 8 - "layout.tsx"
Cohesion: 0.29
Nodes (3): cormorant, dmSans, metadata

### Community 9 - "check-vocabulary.mjs"
Cohesion: 0.33
Nodes (4): ALLOWLIST, EXTS, FORBIDDEN, ROOTS

### Community 10 - ".prettierrc.json"
Cohesion: 0.40
Nodes (4): printWidth, semi, singleQuote, trailingComma

### Community 11 - "check-design-tokens.mjs"
Cohesion: 0.40
Nodes (3): EXTS, PALETTE, ROOTS

### Community 12 - "verify-animations.mjs"
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