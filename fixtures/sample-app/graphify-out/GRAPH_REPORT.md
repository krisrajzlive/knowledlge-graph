# Graph Report - sample-app  (2026-10-04)

## Corpus Check
- 3 files · ~64 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 11 nodes · 14 edges · 3 communities (0 shown, 3 thin omitted)
- Extraction: 86% EXTRACTED · 14% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- auth.js
- server.js
- AuthService

## God Nodes (most connected - your core abstractions)
1. `AuthService` - 4 edges
2. `hashPassword()` - 3 edges
3. `{ hashPassword }` - 1 edges
4. `{ AuthService }` - 1 edges
5. `auth` - 1 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (3 total, 3 thin omitted)

## Knowledge Gaps
- **3 isolated node(s):** `{ hashPassword }`, `{ AuthService }`, `auth`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 4 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AuthService` connect `AuthService` to `auth.js`, `server.js`?**
  _High betweenness centrality (0.256) - this node is a cross-community bridge._
- **Why does `hashPassword()` connect `auth.js` to `AuthService`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **What connects `{ hashPassword }`, `{ AuthService }`, `auth` to the rest of the system?**
  _3 weakly-connected nodes found - possible documentation gaps or missing edges._