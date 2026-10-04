import fs from 'node:fs';
import path from 'node:path';

/** Load a Graphify graph.json and normalise it into an indexed structure. */
export function loadGraph(file) {
  return buildIndex(JSON.parse(fs.readFileSync(file, 'utf8')));
}

export function buildIndex(raw) {
  const nodes = (raw.nodes ?? []).map((n) => ({
    id: n.id,
    label: n.label ?? n.id,
    community: n.community ?? 0,
    communityName: n.community_name ?? `Community ${n.community ?? 0}`,
    fileType: n.file_type ?? 'unknown',
    sourceFile: n.source_file ?? null,
    sourceLocation: n.source_location ?? null,
  }));
  const links = (raw.links ?? raw.edges ?? []).map((l) => ({
    source: typeof l.source === 'object' ? l.source.id : l.source,
    target: typeof l.target === 'object' ? l.target.id : l.target,
    relation: l.relation ?? 'related',
    confidence: l.confidence ?? 'EXTRACTED',
  }));
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const adj = new Map(nodes.map((n) => [n.id, []]));
  for (const l of links) {
    if (!byId.has(l.source) || !byId.has(l.target)) continue;
    adj.get(l.source).push({ id: l.target, relation: l.relation, direction: 'out' });
    adj.get(l.target).push({ id: l.source, relation: l.relation, direction: 'in' });
  }
  return { nodes, links, byId, adj };
}

export function summarize(g) {
  const communities = new Map();
  for (const n of g.nodes) {
    const c = communities.get(n.community) ?? { id: n.community, name: n.communityName, size: 0 };
    c.size += 1;
    communities.set(n.community, c);
  }
  return {
    nodeCount: g.nodes.length,
    linkCount: g.links.length,
    communities: [...communities.values()].sort((a, b) => b.size - a.size),
  };
}

const isFileNode = (n) => n.sourceFile && path.basename(n.sourceFile) === n.label;

/** Symbols with the highest degree: the core abstractions (file nodes excluded). */
export function godNodes(g, limit = 10) {
  return g.nodes
    .filter((n) => !isFileNode(n))
    .map((n) => ({ ...n, degree: g.adj.get(n.id).length }))
    .sort((a, b) => b.degree - a.degree)
    .slice(0, limit);
}

export function search(g, query, limit = 20) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return g.nodes
    .filter((n) => n.label.toLowerCase().includes(q))
    .sort((a, b) => a.label.length - b.label.length)
    .slice(0, limit);
}

export function neighbors(g, id) {
  const node = g.byId.get(id);
  if (!node) return null;
  return {
    node,
    degree: g.adj.get(id).length,
    neighbors: g.adj.get(id).map((e) => ({ ...e, node: g.byId.get(e.id) })).filter((e) => e.node),
  };
}

/** Shortest path (BFS, undirected). null = unknown node, [] = no path. */
export function shortestPath(g, from, to) {
  if (!g.byId.has(from) || !g.byId.has(to)) return null;
  const prev = new Map([[from, null]]);
  const queue = [from];
  while (queue.length) {
    const cur = queue.shift();
    if (cur === to) break;
    for (const e of g.adj.get(cur)) {
      if (!prev.has(e.id)) {
        prev.set(e.id, { id: cur, relation: e.relation });
        queue.push(e.id);
      }
    }
  }
  if (!prev.has(to)) return [];
  const out = [];
  let at = to;
  while (at) {
    const p = prev.get(at);
    out.unshift({ node: g.byId.get(at), via: p?.relation ?? null });
    at = p?.id;
  }
  return out;
}

export const graphFileFor = (dir) => path.join(dir, 'graphify-out', 'graph.json');
export const reportFileFor = (dir) => path.join(dir, 'graphify-out', 'GRAPH_REPORT.md');
