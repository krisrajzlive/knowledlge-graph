# Codebase Knowledge Graph

Explore any codebase as an interactive knowledge graph.
[Graphify](https://graphify.net) extracts the graph, a **Node.js / Express** API serves and queries it,
and a **React** front end visualizes it.

- Force-directed graph coloured by community
- "God nodes": the most connected abstractions
- Symbol search, node neighbourhoods, shortest path between two nodes
- Graphify's `GRAPH_REPORT.md` rendered in the UI
- One-click re-analysis (runs `graphify update` on the server)
- Claude Code integration: `CLAUDE.md` directive + `PreToolUse` hooks so Claude consults the graph before searching raw files ([guide](https://graphify.net/graphify-claude-code-integration.html))

```
React (Vite)  ──/api──▶  Express  ──spawn──▶  graphify update <dir>
  react-force-graph        graph.json index        └─ graphify-out/{graph.json,GRAPH_REPORT.md,graph.html}
```

## Quick start

Requirements: Node 20+, Python 3.10+.

```bash
python -m venv .venv
.venv/Scripts/pip install graphifyy      # Windows; use .venv/bin/pip on macOS/Linux
npm install
npm run build
npm start                                # http://localhost:4000
```

For development with hot reload: `npm run dev` (UI on :5173, API on :4000).

By default the app analyses `fixtures/sample-app`. Point it elsewhere with environment variables:

| Variable | Purpose | Default |
| --- | --- | --- |
| `DEFAULT_PROJECT` | Directory analysed and displayed | `fixtures/sample-app` |
| `ALLOWED_ROOTS` | Extra directories projects may live under (`;` on Windows, `:` elsewhere) | repo root |
| `GRAPHIFY_BIN` | Path to the `graphify` executable | `.venv`, then `PATH` |
| `PORT` | API port | `4000` |

The API refuses any project path outside the allowed roots, and invokes Graphify with an argument array (no shell).

## API

| Endpoint | Description |
| --- | --- |
| `GET /api/graph` | Nodes, links and community summary |
| `GET /api/god-nodes?limit=` | Highest-degree symbols |
| `GET /api/search?q=` | Symbol search |
| `GET /api/node?id=` | Node with its neighbours |
| `GET /api/path?from=&to=` | Shortest path between nodes |
| `GET /api/report` | Graphify's markdown report |
| `POST /api/analyze` | Re-run Graphify and refresh the graph |

## Using Graphify with Claude Code

```bash
pip install graphifyy
graphify install
graphify claude install     # writes the CLAUDE.md section and .claude/settings.json hooks
graphify update .           # rebuild after code changes (AST only, no LLM)
```

`.claude/settings.json` contains machine-specific hook paths and is git-ignored; re-run
`graphify claude install` after cloning. The graph for this repository is committed under `graphify-out/`.

## Tests

```bash
npm test     # API tests (node:test + supertest, runs real Graphify) and React tests (Vitest)
```
