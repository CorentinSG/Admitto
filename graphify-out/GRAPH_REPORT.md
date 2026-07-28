# Graph Report - .  (2026-07-28)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 147 nodes · 148 edges · 18 communities (12 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3b81e732`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- devDependencies
- compilerOptions
- scripts
- layout.tsx
- evaluate.ts
- package.json
- verdict.ts
- include
- check-vocabulary.mjs
- animations.tsx
- .prettierrc.json
- check-design-tokens.mjs
- eslint.config.mjs
- session-start.sh
- post-commit
- pre-commit
- next.config.ts

## God Nodes (most connected - your core abstractions)
1. `scripts` - 16 edges
2. `compilerOptions` - 16 edges
3. `include` - 5 edges
4. `lib` - 4 edges
5. `colors` - 3 edges
6. `fonts` - 3 edges
7. `evaluateCondition()` - 3 edges
8. `fireRules()` - 3 edges
9. `Rule` - 3 edges
10. `exclude` - 3 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (18 total, 6 thin omitted)

### Community 0 - "devDependencies"
Cohesion: 0.10
Nodes (21): eslint, eslint-config-next, @eslint/eslintrc, devDependencies, eslint, eslint-config-next, @eslint/eslintrc, prettier (+13 more)

### Community 1 - "compilerOptions"
Cohesion: 0.11
Nodes (19): dom, dom.iterable, esnext, compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules (+11 more)

### Community 2 - "scripts"
Cohesion: 0.12
Nodes (16): scripts, build, check:all, check:tokens, check:vocabulary, dev, format, format:check (+8 more)

### Community 3 - "layout.tsx"
Cohesion: 0.21
Nodes (9): cormorant, dmSans, metadata, alpha, colors, fonts, goldButtonStyle, gradients (+1 more)

### Community 4 - "evaluate.ts"
Cohesion: 0.27
Nodes (8): evaluateCondition(), fireRules(), StructuredProfile, EngineAOutput, PRELIMINARY_PATHS, PreliminaryPath, Rule, RuleCondition

### Community 5 - "package.json"
Cohesion: 0.17
Nodes (11): next, dependencies, next, react, react-dom, description, name, private (+3 more)

### Community 6 - "verdict.ts"
Cohesion: 0.22
Nodes (8): AXES, Axis, AxisScore, AxisScores, computeVerdict(), Verdict, VerdictInput, VERDICTS

### Community 7 - "include"
Cohesion: 0.22
Nodes (8): graphify-out, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts, **/*.tsx, exclude, include

### Community 8 - "check-vocabulary.mjs"
Cohesion: 0.33
Nodes (4): ALLOWLIST, EXTS, FORBIDDEN, ROOTS

### Community 10 - ".prettierrc.json"
Cohesion: 0.40
Nodes (4): printWidth, semi, singleQuote, trailingComma

### Community 11 - "check-design-tokens.mjs"
Cohesion: 0.40
Nodes (3): EXTS, PALETTE, ROOTS

## Knowledge Gaps
- **86 isolated node(s):** `session-start.sh script`, `printWidth`, `singleQuote`, `semi`, `trailingComma` (+81 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `devDependencies` to `package.json`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **Why does `scripts` connect `scripts` to `package.json`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Why does `compilerOptions` connect `compilerOptions` to `include`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **What connects `session-start.sh script`, `printWidth`, `singleQuote` to the rest of the system?**
  _86 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `scripts` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._