import { readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const repoRoot = resolve(import.meta.dirname, '..');
const pgaDir = join(repoRoot, 'PGA_Championship');

const paths = {
  content: join(pgaDir, 'content', 'site-content.json'),
  players: join(pgaDir, 'pga_championship_players.csv'),
  teams: join(pgaDir, 'pga_championship_teams.csv'),
  payouts: join(pgaDir, 'pga_championship_payouts.csv'),
};

const [contentText, playersText, teamsText, payoutsText] = await Promise.all([
  readFile(paths.content, 'utf8'),
  readFile(paths.players, 'utf8'),
  readFile(paths.teams, 'utf8'),
  readFile(paths.payouts, 'utf8'),
]);

const content = JSON.parse(contentText);
const players = rowsFromCsv(playersText).map((row) => ({
  name: row.name,
  handicap: row.handicap_index,
  whsId: row.whs_id || 'TBD',
  status: row.status || 'Confirmed',
}));

const teams = rowsFromCsv(teamsText).map((row) => ({
  teamName: row.team,
  player1: row.player_1,
  player1Handicap: row.p1_handicap,
  player2: row.player_2,
  player2Handicap: row.p2_handicap,
  totalHandicap: row.total_handicap,
}));

const payouts = rowsFromCsv(payoutsText).map((row) => ({
  place: numberValue(row.place),
  label: row.label,
  value: percentLabel(row.percent),
}));

const playerCount = teams.reduce((total, team) => total + (team.player1 ? 1 : 0) + (team.player2 ? 1 : 0), 0);
const completeTeamCount = teams.filter((team) => team.player1 && team.player2).length;
const singleCount = teams.filter((team) => team.player1 && !team.player2).length;
const payoutSummary = payouts.map((payout) => `${ordinal(payout.place)} ${payout.value}`).join(', ');

content.updatedAt = new Date().toISOString();
content.players = {
  ...(content.players || {}),
  intro: teamIntro(completeTeamCount),
  teams,
  players,
};

content.calcutta = {
  ...(content.calcutta || {}),
  payouts: payouts.map(({ label, value }) => ({ label, value })),
};

replaceSnapshotText(content, 'Field', `Current field is ${playerCount} confirmed players; ${completeTeamCount} two-man teams are assigned.`);
replaceArrayText(content.scoreboard?.calcuttaBoard, /^Payouts:/, `Payouts: ${payoutSummary}.`);
replaceArrayText(content.markdown?.logistics, /^The field currently has /, `The field currently has ${playerCount} players, with ${completeTeamCount} two-man teams assigned and ${singleCount} players still needing partners.`);
replaceArrayText(content.markdown?.flightCompetition, /^Flight structure:/, `Flight structure: expected to be one flight because the field currently has ${playerCount} players.`);

await writeFile(paths.content, `${JSON.stringify(content, null, 2)}\n`);
console.log(`Synced PGA site content from canonical CSVs: ${playerCount} players, ${teams.length} team rows, ${payouts.length} payouts.`);

function rowsFromCsv(text) {
  const records = parseCsv(text);
  if (!records.length) return [];
  const headers = records[0].map((header) => header.trim().replace(/^\uFEFF/, ''));
  return records.slice(1)
    .map((record) => Object.fromEntries(headers.map((header, index) => [header, String(record[index] ?? '').trim()])))
    .filter((row) => Object.values(row).some((value) => value !== ''));
}

function parseCsv(text) {
  const records = [];
  let record = [];
  let field = '';
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      record.push(field);
      field = '';
    } else if (char === '\n') {
      record.push(field.replace(/\r$/, ''));
      records.push(record);
      record = [];
      field = '';
    } else {
      field += char;
    }
  }

  if (field || record.length) {
    record.push(field.replace(/\r$/, ''));
    records.push(record);
  }

  return records;
}

function percentLabel(value) {
  const text = String(value || '').trim();
  if (!text) return '';
  if (text.includes('%')) return text;
  const number = Number(text);
  if (!Number.isFinite(number)) return text;
  const percent = number <= 1 ? number * 100 : number;
  return `${trimTrailingZero(percent)}%`;
}

function trimTrailingZero(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, '');
}

function numberValue(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : value;
}

function ordinal(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return String(value || '');
  const suffix = number % 100 >= 11 && number % 100 <= 13
    ? 'th'
    : { 1: 'st', 2: 'nd', 3: 'rd' }[number % 10] || 'th';
  return `${number}${suffix}`;
}

function teamIntro(completeTeamCount) {
  if (completeTeamCount === 0) {
    return 'Team assignments can be updated as pairings are confirmed. Single-player rows show players who still need a partner.';
  }
  if (completeTeamCount === 1) {
    return 'One two-man team is assigned. Single-player rows show players who still need a partner.';
  }
  return `${titleCaseNumber(completeTeamCount)} two-man teams are assigned. Single-player rows show players who still need a partner.`;
}

function titleCaseNumber(value) {
  const words = {
    2: 'Two',
    3: 'Three',
    4: 'Four',
    5: 'Five',
    6: 'Six',
    7: 'Seven',
    8: 'Eight',
    9: 'Nine',
    10: 'Ten',
  };
  return words[value] || String(value);
}

function replaceSnapshotText(content, label, text) {
  const item = content.overview?.snapshot?.find((snapshot) => snapshot.label === label);
  if (item) item.text = text;
}

function replaceArrayText(items, pattern, text) {
  if (!Array.isArray(items)) return;
  const index = items.findIndex((item) => pattern.test(item));
  if (index >= 0) items[index] = text;
}
