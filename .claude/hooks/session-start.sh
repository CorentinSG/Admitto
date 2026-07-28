#!/bin/sh
# SessionStart hook — prépare l'environnement pour que lint/tests/build
# fonctionnent immédiatement dans les sessions Claude Code (web ou locales).
# Doit rester idempotent et silencieux en cas de succès.

set -u

# 1. Dépendances npm (npm ci si lockfile présent et node_modules absent/incomplet)
if [ -f package-lock.json ] && [ ! -d node_modules/next ]; then
  echo "[session-start] npm ci…"
  npm ci --no-audit --no-fund || npm install --no-audit --no-fund || true
fi

# 2. Hooks git (garde-fous pre-commit)
git config core.hooksPath .githooks 2>/dev/null || true

# 3. Graphify : signaler l'état du graphe sans bloquer la session
if [ -f graphify-out/GRAPH_REPORT.md ]; then
  echo "[session-start] Graphe Graphify disponible : lire graphify-out/GRAPH_REPORT.md avant toute exploration."
else
  echo "[session-start] Pas de graphe Graphify. Construire avec : pip install graphifyy --break-system-packages && graphify ."
fi

exit 0
