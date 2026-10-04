import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

/** Resolve the graphify executable: $GRAPHIFY_BIN, repo .venv, then PATH. */
export function graphifyBin(repoRoot) {
  if (process.env.GRAPHIFY_BIN) return process.env.GRAPHIFY_BIN;
  const exe = process.platform === 'win32' ? 'Scripts/graphify.exe' : 'bin/graphify';
  const venv = path.join(repoRoot, '.venv', exe);
  return fs.existsSync(venv) ? venv : 'graphify';
}

/** Run `graphify update <dir>`; arguments are passed as an array (no shell). */
export function runGraphify(bin, dir) {
  return new Promise((resolve, reject) => {
    const child = spawn(bin, ['update', dir], { windowsHide: true });
    let output = '';
    child.stdout.on('data', (d) => (output += d));
    child.stderr.on('data', (d) => (output += d));
    child.on('error', reject);
    child.on('close', (code) =>
      code === 0
        ? resolve(output)
        : reject(new Error(`graphify exited with ${code}: ${output.slice(-500)}`)),
    );
  });
}
