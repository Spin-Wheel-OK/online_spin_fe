import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const envFile = join(root, '.cloudflare.local');

if (!existsSync(envFile)) {
  console.error('Missing FE/.cloudflare.local — create it with:');
  console.error('  CLOUDFLARE_API_TOKEN=...');
  console.error('  CLOUDFLARE_ACCOUNT_ID=...');
  process.exit(1);
}

const env = { ...process.env };
for (const line of readFileSync(envFile, 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/i);
  if (m) env[m[1]] = m[2];
}

const require = createRequire(import.meta.url);
const wranglerPkg = require.resolve('wrangler/package.json');
const wranglerBin = join(dirname(wranglerPkg), require(wranglerPkg).bin.wrangler);

const r = spawnSync(process.execPath, [
  wranglerBin,
  'pages', 'deploy', 'dist',
  '--project-name=ok-spin-wheel',
  '--branch=main',
  '--commit-dirty=true',
], { cwd: root, env, stdio: 'inherit' });

process.exit(r.status ?? 1);
