# Optimisation des tokens — workflow Graphify

Objectif : réduire drastiquement le coût des sessions IA (Claude Code) sur ce repo.
Une exploration naïve (grep/lecture de fichiers entiers) coûte facilement 100k+ tokens ;
la navigation par graphe de connaissances en coûte ~2k pour la même information.

## 1. Le graphe de connaissances (Graphify)

### Installation (une fois par environnement)

```bash
pip install graphifyy --break-system-packages
```

### Construction / mise à jour

```bash
graphify .            # construction complète (première fois)
graphify . --update   # incrémental : ne ré-extrait que les fichiers modifiés
npm run graph:update  # alias npm du mode incrémental
```

Sans clé API LLM dans l'environnement (cas des sessions CI/sandbox), l'extraction
sémantique des documents est indisponible : utiliser le mode AST local pur, puis
générer le rapport :

```bash
graphify . --code-only        # AST Tree-sitter 100 % local, aucune clé requise
graphify cluster-only .       # génère/rafraîchit GRAPH_REPORT.md
```

Avec une clé (`ANTHROPIC_API_KEY`…), relancer `graphify .` complet pour indexer
aussi PLAN.md et les docs — les communautés reçoivent alors des noms sémantiques.

Sorties dans `graphify-out/` :

| Fichier | Rôle | Versionné ? |
|---|---|---|
| `GRAPH_REPORT.md` | Résumé lisible : god nodes, communautés, connexions inattendues | **Oui** (commité, lu en premier par toute session) |
| `graph.json` | Graphe interrogeable par `graphify query/explain/path` | Non (régénéré localement) |
| `graph.html` | Visualisation interactive | Non |

Le `.gitignore` est déjà configuré ainsi. Le hook `post-commit` (`.githooks/post-commit`)
relance `graphify . --update` en arrière-plan après chaque commit ; le hook `SessionStart`
de Claude Code signale l'état du graphe en début de session.

### Sources externes utiles au projet

Le graphe peut absorber la documentation de référence du produit :

```bash
graphify add https://www.nybarexam.org/          # règles BOLE
graphify add <url du cahier des charges hébergé>  # si disponible en ligne
```

## 2. Règles de travail (pour toute session IA ou tout développeur)

1. **Toujours lire `graphify-out/GRAPH_REPORT.md` en premier** — quelques centaines de
   tokens pour la carte complète du système.
2. **Requête ciblée avant recherche brute** :
   ```bash
   graphify query "où la déduction des 79 € est-elle appliquée ?" --budget 1500
   graphify explain "computeVerdict"
   graphify path "Questionnaire" "Report"
   ```
3. **Recherche brute (grep/glob) uniquement si** : pattern regex exact nécessaire,
   fichier trop récent pour être indexé, ou périmètre déjà réduit par le graphe à un
   sous-dossier précis.
4. **Lire des extraits, pas des fichiers entiers** : utiliser offset/limit quand le
   fichier dépasse ~300 lignes et que la zone utile est connue.
5. **Après une série de modifications** : `npm run graph:update` pour que la session
   suivante reparte d'un graphe frais.

## 3. Hygiène de contexte du repo

Ces règles réduisent le nombre de tokens que chaque session doit charger :

- **`CLAUDE.md` court et stable** : c'est le fichier lu à chaque session. Il pointe vers
  les documents détaillés (PLAN.md, docs/) au lieu de les dupliquer. Ne pas y coller de
  contenu volatil.
- **Un savoir = un seul endroit** : PLAN.md pour le produit, tokens.ts pour les couleurs,
  animations.tsx pour le contrat d'animation. Jamais de copie divergente.
- **Types fermés auto-documentés** (`as const` + unions) : le code porte la spécification,
  pas besoin de relire le CDC pour connaître les 6 verdicts.
- **Nommage explicite** : les noms de fichiers/fonctions doivent permettre de deviner le
  contenu sans l'ouvrir (`check-vocabulary.mjs`, `engine-b/verdict.ts`).
- **Pas de fichiers générés commités** (sauf `GRAPH_REPORT.md`) : node_modules, .next,
  coverage et graph.json sont ignorés — ils pollueraient toute recherche.

## 4. Sous-agents et parallélisme

Pour les tâches larges (audit, migration, revue), déléguer les balayages de fichiers à des
sous-agents (agent `Explore`) qui ne remontent que la conclusion : le contexte principal ne
paie pas les fichiers lus. Combiner avec le graphe : le sous-agent démarre lui aussi par
`GRAPH_REPORT.md`.
