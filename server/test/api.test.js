import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { graphifyBin } from '../src/graphify.js';
import { buildIndex, shortestPath, godNodes } from '../src/graph.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const project = path.join(repoRoot, 'fixtures', 'sample-app');
const app = createApp({
  allowedRoots: [repoRoot],
  defaultProject: project,
  graphifyBin: graphifyBin(repoRoot),
});

test('health', async () => {
  const res = await request(app).get('/api/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'ok');
});

test('analyze runs graphify and returns graph stats', async () => {
  const res = await request(app).post('/api/analyze').send({ project });
  assert.equal(res.status, 200, JSON.stringify(res.body));
  assert.ok(res.body.nodeCount > 0);
  assert.ok(res.body.linkCount > 0);
});

test('graph exposes nodes, links and communities', async () => {
  const res = await request(app).get('/api/graph');
  assert.equal(res.status, 200);
  assert.ok(res.body.nodes.some((n) => n.label === 'AuthService'));
  assert.ok(res.body.communities.length > 0);
});

test('god nodes are ordered by degree', async () => {
  const res = await request(app).get('/api/god-nodes?limit=3');
  assert.equal(res.status, 200);
  assert.equal(res.body[0].label, 'AuthService');
  assert.ok(res.body[0].degree >= res.body[1].degree);
});

test('search, node neighbours and path', async () => {
  const found = await request(app).get('/api/search?q=handlelogin');
  assert.equal(found.body[0].label, 'handleLogin()');

  const from = found.body[0].id;
  const to = (await request(app).get('/api/search?q=hashpassword')).body.find((n) => n.label === 'hashPassword()').id;

  const node = await request(app).get(`/api/node?id=${from}`);
  assert.equal(node.status, 200);
  assert.ok(node.body.neighbors.length > 0);

  const p = await request(app).get(`/api/path?from=${from}&to=${to}`);
  assert.equal(p.body.found, true);
  assert.equal(p.body.steps[0].node.id, from);
  assert.equal(p.body.steps.at(-1).node.id, to);
});

test('unknown node returns 404', async () => {
  assert.equal((await request(app).get('/api/node?id=nope')).status, 404);
});

test('report is served as markdown', async () => {
  const res = await request(app).get('/api/report');
  assert.equal(res.status, 200);
  assert.match(res.text, /God Nodes/);
});

test('paths outside the allowed roots are rejected', async () => {
  const outside = path.parse(repoRoot).root;
  assert.equal((await request(app).get('/api/graph').query({ project: outside })).status, 403);
  assert.equal((await request(app).post('/api/analyze').send({ project: outside })).status, 403);
  const traversal = path.join(project, '..', '..', '..');
  assert.equal((await request(app).get('/api/report').query({ project: traversal })).status, 403);
});

test('shortestPath handles disconnected and unknown nodes', () => {
  const g = buildIndex({
    nodes: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
    links: [{ source: 'a', target: 'b', relation: 'calls' }],
  });
  assert.deepEqual(shortestPath(g, 'a', 'c'), []);
  assert.equal(shortestPath(g, 'a', 'zzz'), null);
  assert.equal(shortestPath(g, 'a', 'b').length, 2);
  assert.equal(godNodes(g, 1)[0].degree, 1);
});
