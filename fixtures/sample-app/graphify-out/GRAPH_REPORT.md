# Graph Report - sample-app  (2026-10-05)

## Corpus Check
- 4 files · ~120 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 18 nodes · 26 edges · 4 communities (1 shown, 3 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `78a96c87`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- session.js
- server.js
- AuthService
- SessionStore

## God Nodes (most connected - your core abstractions)
1. `AuthService` - 6 edges
2. `hashPassword()` - 5 edges
3. `SessionStore` - 4 edges
4. `{ hashPassword }` - 1 edges
5. `{ AuthService }` - 1 edges
6. `auth` - 1 edges
7. `{ AuthService }` - 1 edges
8. `{ hashPassword }` - 1 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (4 total, 3 thin omitted)

### Community 0 - "session.js"
Cohesion: 0.43
Nodes (4): { hashPassword }, hashPassword(), { AuthService }, { hashPassword }

## Knowledge Gaps
- **5 isolated node(s):** `{ hashPassword }`, `{ AuthService }`, `auth`, `{ AuthService }`, `{ hashPassword }`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 7 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AuthService` connect `AuthService` to `session.js`, `server.js`, `SessionStore`?**
  _High betweenness centrality (0.303) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `session.js`?**
  _High betweenness centrality (0.155) - this node is a cross-community bridge._
- **Why does `hashPassword()` connect `session.js` to `AuthService`, `SessionStore`?**
  _High betweenness centrality (0.117) - this node is a cross-community bridge._
- **What connects `{ hashPassword }`, `{ AuthService }`, `auth` to the rest of the system?**
  _5 weakly-connected nodes found - possible documentation gaps or missing edges._