import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const distDir = 'dist';

const publicFiles = [
  'index.html',
  'Masters_Tournament/SG_masters_logo.png',
  'Masters_Tournament/index.html',
  'Masters_Tournament/live_leaderboard.css',
  'Masters_Tournament/live_leaderboard.html',
  'Masters_Tournament/live_leaderboard.js',
  'Masters_Tournament/script.js',
  'Masters_Tournament/style.css',
  'Masters_Tournament/data/scoreboard-data.js',
  'Masters_Tournament/data/scoreboard.json',
  'PGA_Championship/SG_PGA_championship_logo.png',
  'PGA_Championship/index.html',
  'PGA_Championship/script.js',
  'PGA_Championship/style.css',
  'PGA_Championship/data/scoreboard-data.js',
  'PGA_Championship/data/scoreboard.json',
];

await rm(distDir, { recursive: true, force: true });

for (const file of publicFiles) {
  const outputPath = join(distDir, file);
  await mkdir(dirname(outputPath), { recursive: true });
  await cp(file, outputPath);
}

await writeFile(
  join(distDir, '_redirects'),
  [
    '/masters /Masters_Tournament/index.html 200',
    '/masters/leaderboard /Masters_Tournament/live_leaderboard.html 200',
    '/pga /PGA_Championship/index.html 200',
    '',
  ].join('\n'),
);

console.log(`Built public site with ${publicFiles.length} files.`);
