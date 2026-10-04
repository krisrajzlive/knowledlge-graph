# Graph Report - codebase-knowledge-graph  (2026-10-04)

## Corpus Check
- 20 files · ~2,857 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 2 file(s) not represented in the graph (top: (none) 1, .css 1)

## Summary
- 130 nodes · 201 edges · 8 communities (7 shown, 1 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- app.js
- web/package.json
- server/package.json
- package.json
- App.jsx
- auth.js
- devDependencies
- CLAUDE.md

## God Nodes (most connected - your core abstractions)
1. `createApp()` - 12 edges
2. `App()` - 10 edges
3. `request()` - 7 edges
4. `scripts` - 5 edges
5. `godNodes()` - 5 edges
6. `scripts` - 5 edges
7. `qs()` - 5 edges
8. `getGodNodes()` - 5 edges
9. `searchNodes()` - 5 edges
10. `getNode()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `createApp()` --calls--> `godNodes()`  [EXTRACTED]
  server/src/app.js → server/src/graph.js
- `createApp()` --calls--> `graphFileFor()`  [EXTRACTED]
  server/src/app.js → server/src/graph.js
- `createApp()` --calls--> `loadGraph()`  [EXTRACTED]
  server/src/app.js → server/src/graph.js
- `createApp()` --calls--> `neighbors()`  [EXTRACTED]
  server/src/app.js → server/src/graph.js
- `createApp()` --calls--> `reportFileFor()`  [EXTRACTED]
  server/src/app.js → server/src/graph.js

## Import Cycles
- None detected.

## Communities (8 total, 1 thin omitted)

### Community 0 - "app.js"
Cohesion: 0.14
Nodes (21): createApp(), buildIndex(), godNodes(), graphFileFor(), isFileNode(), loadGraph(), neighbors(), reportFileFor() (+13 more)

### Community 1 - "web/package.json"
Cohesion: 0.07
Nodes (24): jsdom, react, react-dom, react-force-graph-2d, @testing-library/jest-dom, @testing-library/react, vite, @vitejs/plugin-react (+16 more)

### Community 2 - "server/package.json"
Cohesion: 0.12
Nodes (16): cors, express, supertest, dependencies, cors, express, devDependencies, supertest (+8 more)

### Community 3 - "package.json"
Cohesion: 0.13
Nodes (14): description, devDependencies, concurrently, license, name, private, scripts, build (+6 more)

### Community 4 - "App.jsx"
Cohesion: 0.36
Nodes (12): analyze(), getGodNodes(), getGraph(), getNode(), getPath(), getReport(), qs(), request() (+4 more)

### Community 5 - "auth.js"
Cohesion: 0.25
Nodes (5): AuthService, { hashPassword }, hashPassword(), auth, { AuthService }

### Community 6 - "devDependencies"
Cohesion: 0.29
Nodes (7): devDependencies, jsdom, @testing-library/jest-dom, @testing-library/react, vite, @vitejs/plugin-react, vitest

## Knowledge Gaps
- **55 isolated node(s):** `{ hashPassword }`, `{ AuthService }`, `auth`, `name`, `version` (+50 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 63 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `devDependencies` to `web/package.json`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Why does `react` connect `web/package.json` to `App.jsx`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **What connects `{ hashPassword }`, `{ AuthService }`, `auth` to the rest of the system?**
  _55 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.13709677419354838 - nodes in this community are weakly interconnected._
- **Should `web/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.07311827956989247 - nodes in this community are weakly interconnected._
- **Should `server/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._