import path from 'node:path';
import fs from 'node:fs';
import express from 'express';
import cors from 'cors';
import {
  loadGraph, summarize, godNodes, search, neighbors, shortestPath, graphFileFor, reportFileFor,
} from './graph.js';
import { runGraphify } from './graphify.js';

/**
 * @param {object} opts
 * @param {string[]} opts.allowedRoots    directories projects may live under
 * @param {string}   opts.defaultProject  project analysed when none is given
 * @param {string}   [opts.graphifyBin]
 * @param {string}   [opts.webDist]       built React app to serve
 */
export function createApp({ allowedRoots, defaultProject, graphifyBin = 'graphify', webDist }) {
  const roots = allowedRoots.map((r) => path.resolve(r));
  const cache = new Map(); // graph file -> { mtimeMs, graph }

  const isAllowed = (dir) => roots.some((r) => dir === r || dir.startsWith(r + path.sep));

  /** Resolve a project param to an allowed directory, or null. */
  const resolveProject = (p) => {
    const dir = path.resolve(p || defaultProject);
    return isAllowed(dir) ? dir : null;
  };

  const getGraph = (dir) => {
    const file = graphFileFor(dir);
    if (!fs.existsSync(file)) return null;
    const { mtimeMs } = fs.statSync(file);
    const hit = cache.get(file);
    if (hit && hit.mtimeMs === mtimeMs) return hit.graph;
    const graph = loadGraph(file);
    cache.set(file, { mtimeMs, graph });
    return graph;
  };

  const app = express();
  app.use(cors());
  app.use(express.json());

  const withGraph = (req, res, next) => {
    const dir = resolveProject(req.query.project);
    if (!dir) return res.status(403).json({ error: 'Project path is outside the allowed roots' });
    const graph = getGraph(dir);
    if (!graph) return res.status(404).json({ error: 'No graph found. Run analysis first.', project: dir });
    req.project = dir;
    req.graph = graph;
    next();
  };

  app.get('/api/health', (_req, res) => res.json({ status: 'ok', defaultProject }));

  app.get('/api/graph', withGraph, (req, res) => {
    const { nodes, links } = req.graph;
    res.json({ project: req.project, ...summarize(req.graph), nodes, links });
  });

  app.get('/api/god-nodes', withGraph, (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 10, 100);
    res.json(godNodes(req.graph, limit));
  });

  app.get('/api/search', withGraph, (req, res) => {
    res.json(search(req.graph, String(req.query.q ?? '')));
  });

  app.get('/api/node', withGraph, (req, res) => {
    const result = neighbors(req.graph, String(req.query.id ?? ''));
    if (!result) return res.status(404).json({ error: 'Node not found' });
    res.json(result);
  });

  app.get('/api/path', withGraph, (req, res) => {
    const steps = shortestPath(req.graph, String(req.query.from ?? ''), String(req.query.to ?? ''));
    if (!steps) return res.status(404).json({ error: 'Unknown node id' });
    res.json({ found: steps.length > 0, steps });
  });

  app.get('/api/report', (req, res) => {
    const dir = resolveProject(req.query.project);
    if (!dir) return res.status(403).json({ error: 'Project path is outside the allowed roots' });
    const file = reportFileFor(dir);
    if (!fs.existsSync(file)) return res.status(404).json({ error: 'No report found' });
    res.type('text/markdown').send(fs.readFileSync(file, 'utf8'));
  });

  app.post('/api/analyze', async (req, res) => {
    const dir = resolveProject(req.body?.project);
    if (!dir) return res.status(403).json({ error: 'Project path is outside the allowed roots' });
    if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
      return res.status(400).json({ error: 'Project path is not a directory' });
    }
    try {
      await runGraphify(graphifyBin, dir);
      const graph = getGraph(dir);
      if (!graph) return res.status(500).json({ error: 'graphify produced no graph.json' });
      res.json({ project: dir, nodeCount: graph.nodes.length, linkCount: graph.links.length });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  if (webDist && fs.existsSync(webDist)) {
    app.use(express.static(webDist));
    app.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(path.join(webDist, 'index.html')));
  }
  return app;
}
