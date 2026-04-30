import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const repoRoot = resolve(import.meta.dirname, '..');
const workbookPath = process.argv[2] || 'PGA_Championship/pga_championship_control.xlsx';
const python = process.env.PYTHON || 'python3';

run(python, ['scripts/export-pga-workbook-to-csv.py', workbookPath]);
run(process.execPath, ['scripts/build-pga-scoreboard.mjs']);
run(process.execPath, ['scripts/sync-pga-site-content-from-csv.mjs']);
run(process.execPath, ['PGA_Championship/scoreboard_server.mjs', '--render']);
run(process.execPath, ['scripts/build-public-site.mjs']);

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    stdio: 'inherit',
    shell: false,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}
