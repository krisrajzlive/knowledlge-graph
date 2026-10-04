import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';
import { graphifyBin } from './graphify.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const defaultProject = path.resolve(process.env.DEFAULT_PROJECT ?? path.join(repoRoot, 'fixtures', 'sample-app'));
const extraRoots = (process.env.ALLOWED_ROOTS ?? '').split(path.delimiter).filter(Boolean);
const port = Number(process.env.PORT ?? 4000);

const app = createApp({
  allowedRoots: [repoRoot, defaultProject, ...extraRoots],
  defaultProject,
  graphifyBin: graphifyBin(repoRoot),
  webDist: path.join(repoRoot, 'web', 'dist'),
});

app.listen(port, () => console.log(`API listening on http://localhost:${port} (project: ${defaultProject})`));
