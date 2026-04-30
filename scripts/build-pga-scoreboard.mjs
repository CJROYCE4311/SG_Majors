import { readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const repoRoot = resolve(import.meta.dirname, '..');
const pgaDir = join(repoRoot, 'PGA_Championship');

const paths = {
  players: join(pgaDir, 'pga_championship_players.csv'),
  teams: join(pgaDir, 'pga_championship_teams.csv'),
  scores: join(pgaDir, 'pga_championship_scores.csv'),
  proPicks: join(pgaDir, 'pga_championship_pro_picks.csv'),
  proScores: join(pgaDir, 'pga_championship_pro_scores.csv'),
  calcutta: join(pgaDir, 'pga_championship_calcutta_board.csv'),
  payouts: join(pgaDir, 'pga_championship_payouts.csv'),
  scoreboardJson: join(pgaDir, 'data', 'scoreboard.json'),
  scoreboardJs: join(pgaDir, 'data', 'scoreboard-data.js'),
};

const requiredHeaders = {
  players: ['name', 'handicap_index', 'whs_id', 'status'],
  teams: ['team', 'player_1', 'p1_handicap', 'player_2', 'p2_handicap', 'total_handicap', 'flight', 'notes'],
  scores: ['team', 'player_1_saturday_net', 'player_2_saturday_net', 'saturday_team_total', 'sunday_team_net', 'notes'],
  proPicks: ['team', 'pro_a', 'pro_b', 'notes'],
  proScores: ['pro_name', 'tier', 'saturday_score', 'sunday_score', 'notes'],
  calcutta: ['team', 'owner', 'auction_price', 'buyback_amount', 'final_place', 'payout_override', 'notes'],
  payouts: ['place', 'label', 'percent'],
};

const errors = [];
const warnings = [];

const baseScoreboard = await readJson(paths.scoreboardJson);
const tables = {
  players: await readCsvTable(paths.players, requiredHeaders.players),
  teams: await readCsvTable(paths.teams, requiredHeaders.teams),
  scores: await readCsvTable(paths.scores, requiredHeaders.scores),
  proPicks: await readCsvTable(paths.proPicks, requiredHeaders.proPicks),
  proScores: await readCsvTable(paths.proScores, requiredHeaders.proScores),
  calcutta: await readCsvTable(paths.calcutta, requiredHeaders.calcutta),
  payouts: await readCsvTable(paths.payouts, requiredHeaders.payouts),
};

const playersByName = mapRows(tables.players.rows, 'name', 'players');
const teams = normalizeTeams(tables.teams.rows, playersByName);
const teamsByName = mapByNormalizedName(teams, 'teamName', 'teams');
const scoresByTeam = mapReferencedRows(tables.scores.rows, 'team', teamsByName, 'team scores');
const proPicksByTeam = mapReferencedRows(tables.proPicks.rows, 'team', teamsByName, 'pro picks');
const proScoresByName = mapRows(tables.proScores.rows, 'pro_name', 'pro scores', { allowBlankKey: true });
const calcuttaByTeam = mapReferencedRows(tables.calcutta.rows, 'team', teamsByName, 'Calcutta');
const payouts = normalizePayouts(tables.payouts.rows);

if (errors.length) {
  console.error('PGA scoreboard build failed:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

const scoreboard = {
  ...baseScoreboard,
  event: {
    ...(baseScoreboard.event || {}),
    lastUpdated: new Date().toISOString(),
  },
  calcutta: {
    ...(baseScoreboard.calcutta || {}),
    payouts,
  },
  teams: teams.map((team) => buildScoreboardTeam(team, {
    scoresByTeam,
    proPicksByTeam,
    proScoresByName,
    calcuttaByTeam,
  })),
};

await writeFile(paths.scoreboardJson, `${JSON.stringify(scoreboard, null, 2)}\n`);
await writeFile(paths.scoreboardJs, `window.PGA_SCOREBOARD_DATA = ${JSON.stringify(scoreboard, null, 2)};\n`);

const completedTeams = teams.filter((team) => team.player1 && team.player2).length;
console.log(`Built PGA scoreboard from canonical CSVs: ${teams.length} teams (${completedTeams} complete).`);
if (warnings.length) {
  console.log('Warnings:');
  warnings.forEach((warning) => console.log(`- ${warning}`));
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

async function readCsvTable(path, expectedHeaders) {
  const text = await readFile(path, 'utf8');
  const records = parseCsv(text);
  if (!records.length) {
    errors.push(`${relativePath(path)} is empty.`);
    return { headers: [], rows: [] };
  }
  const headers = records[0].map((header) => header.trim().replace(/^\uFEFF/, ''));
  const missing = expectedHeaders.filter((header) => !headers.includes(header));
  if (missing.length) {
    errors.push(`${relativePath(path)} is missing headers: ${missing.join(', ')}`);
  }
  const rows = records.slice(1)
    .map((record, index) => Object.fromEntries(headers.map((header, columnIndex) => [header, String(record[columnIndex] ?? '').trim()])))
    .filter((row) => Object.values(row).some((value) => value !== ''))
    .map((row, index) => ({ ...row, __row: index + 2, __file: relativePath(path) }));
  return { headers, rows };
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

function normalizeTeams(rows, playersByName) {
  const normalized = [];
  rows.forEach((row) => {
    if (!row.team) {
      errors.push(`${row.__file}:${row.__row} team is required.`);
      return;
    }
    const player1 = row.player_1;
    const player2 = row.player_2;
    const p1Handicap = row.p1_handicap || playerHandicap(player1, playersByName);
    const p2Handicap = row.p2_handicap || playerHandicap(player2, playersByName);
    const computedTotal = calculateTeamHandicap(p1Handicap, p2Handicap);
    const totalHandicap = row.total_handicap || computedTotal;

    validateTeamPlayer(row, player1, 'player_1', playersByName);
    validateTeamPlayer(row, player2, 'player_2', playersByName);
    if (row.total_handicap && computedTotal && handicapValue(row.total_handicap) !== handicapValue(computedTotal)) {
      errors.push(`${row.__file}:${row.__row} total_handicap ${row.total_handicap} does not match ${player1}/${player2} handicap total ${computedTotal}.`);
    }

    normalized.push({
      id: slugify(row.team),
      teamName: row.team,
      player1,
      p1Handicap,
      player2,
      p2Handicap,
      totalHandicap,
      flight: row.flight,
      notes: row.notes,
    });
  });

  requireUnique(normalized, (team) => normalizedKey(team.teamName), 'team names');
  return normalized;
}

function buildScoreboardTeam(team, sources) {
  const scoreRow = sources.scoresByTeam.get(normalizedKey(team.teamName)) || {};
  const pickRow = sources.proPicksByTeam.get(normalizedKey(team.teamName)) || {};
  const calcuttaRow = sources.calcuttaByTeam.get(normalizedKey(team.teamName)) || {};
  const saturdayPlayer1 = numberOrBlank(scoreRow.player_1_saturday_net);
  const saturdayPlayer2 = numberOrBlank(scoreRow.player_2_saturday_net);
  const enteredSaturdayTotal = numberOrBlank(scoreRow.saturday_team_total);
  const computedSaturdayTotal = saturdayTotalForTeam(saturdayPlayer1, saturdayPlayer2, team);
  const saturday = enteredSaturdayTotal === '' ? computedSaturdayTotal : enteredSaturdayTotal;

  if (enteredSaturdayTotal !== '' && computedSaturdayTotal !== '' && enteredSaturdayTotal !== computedSaturdayTotal) {
    errors.push(`${scoreRow.__file}:${scoreRow.__row} saturday_team_total ${enteredSaturdayTotal} does not match player scores total ${computedSaturdayTotal} for ${team.teamName}.`);
  }

  const proA = lookupPro(pickRow.pro_a, sources.proScoresByName, pickRow, 'pro_a');
  const proB = lookupPro(pickRow.pro_b, sources.proScoresByName, pickRow, 'pro_b');

  return {
    id: team.id,
    teamName: team.teamName,
    players: [team.player1, team.player2].filter(Boolean),
    handicapTotal: team.totalHandicap,
    scores: {
      saturdayPlayer1,
      saturdayPlayer2,
      saturday,
      sunday: numberOrBlank(scoreRow.sunday_team_net),
    },
    pros: {
      a: {
        name: pickRow.pro_a || '',
        round3: numberOrBlank(proA?.saturday_score),
        round4: numberOrBlank(proA?.sunday_score),
      },
      b: {
        name: pickRow.pro_b || '',
        round3: numberOrBlank(proB?.saturday_score),
        round4: numberOrBlank(proB?.sunday_score),
      },
    },
    calcutta: {
      owner: calcuttaRow.owner || '',
      buyer: calcuttaRow.owner || '',
      auctionPrice: numberOrBlank(calcuttaRow.auction_price),
      buybackAmount: numberOrBlank(calcuttaRow.buyback_amount),
      finalPlace: numberOrBlank(calcuttaRow.final_place),
      payout: numberOrBlank(calcuttaRow.payout_override),
    },
  };
}

function lookupPro(name, proScoresByName, row, fieldName) {
  if (!name) return null;
  const match = proScoresByName.get(normalizedKey(name));
  if (!match) {
    errors.push(`${row.__file}:${row.__row} ${fieldName} "${name}" does not exist in pga_championship_pro_scores.csv.`);
  }
  return match || null;
}

function normalizePayouts(rows) {
  const payouts = rows.map((row) => ({
    place: numberOrBlank(row.place),
    label: row.label,
    percent: percentValue(row.percent),
    __row: row.__row,
    __file: row.__file,
  }));

  payouts.forEach((payout) => {
    if (typeof payout.place !== 'number') errors.push(`${payout.__file}:${payout.__row} place must be a number.`);
    if (typeof payout.percent !== 'number') errors.push(`${payout.__file}:${payout.__row} percent must be a number or percentage.`);
  });

  const percentTotal = payouts.reduce((sum, payout) => sum + (typeof payout.percent === 'number' ? payout.percent : 0), 0);
  if (payouts.length && Math.abs(percentTotal - 1) > 0.0001) {
    errors.push(`Payout percentages must total 100%; current total is ${(percentTotal * 100).toFixed(1)}%.`);
  }

  requireUnique(payouts, (payout) => String(payout.place), 'payout places');
  return payouts.map(({ place, label, percent }) => ({ place, label, percent }));
}

function mapRows(rows, keyField, label, options = {}) {
  const map = new Map();
  rows.forEach((row) => {
    const raw = row[keyField];
    if (!raw) {
      if (!options.allowBlankKey) errors.push(`${row.__file}:${row.__row} ${keyField} is required in ${label}.`);
      return;
    }
    const key = normalizedKey(raw);
    if (map.has(key)) errors.push(`${row.__file}:${row.__row} duplicate ${label} entry "${raw}".`);
    map.set(key, row);
  });
  return map;
}

function mapReferencedRows(rows, keyField, validKeys, label) {
  const map = new Map();
  rows.forEach((row) => {
    if (!row[keyField]) return;
    const key = normalizedKey(row[keyField]);
    if (!validKeys.has(key)) {
      errors.push(`${row.__file}:${row.__row} ${label} row references unknown team "${row[keyField]}".`);
      return;
    }
    if (map.has(key)) errors.push(`${row.__file}:${row.__row} duplicate ${label} row for "${row[keyField]}".`);
    map.set(key, row);
  });
  return map;
}

function mapByNormalizedName(items, field, label) {
  const map = new Map();
  items.forEach((item) => {
    const key = normalizedKey(item[field]);
    if (!key) {
      errors.push(`${label} contains a row without ${field}.`);
      return;
    }
    if (map.has(key)) errors.push(`${label} contains duplicate ${field} "${item[field]}".`);
    map.set(key, item);
  });
  return map;
}

function validateTeamPlayer(row, playerName, fieldName, playersByName) {
  if (!playerName) return;
  if (!playersByName.has(normalizedKey(playerName))) {
    errors.push(`${row.__file}:${row.__row} ${fieldName} "${playerName}" does not exist in pga_championship_players.csv.`);
  }
}

function requireUnique(items, keyFn, label) {
  const seen = new Map();
  items.forEach((item) => {
    const key = keyFn(item);
    if (!key) return;
    if (seen.has(key)) errors.push(`Duplicate ${label}: "${key}".`);
    seen.set(key, item);
  });
}

function playerHandicap(playerName, playersByName) {
  if (!playerName) return '';
  return playersByName.get(normalizedKey(playerName))?.handicap_index || '';
}

function saturdayTotalForTeam(player1Score, player2Score, team) {
  if (typeof player1Score === 'number' && typeof player2Score === 'number') return player1Score + player2Score;
  if (!team.player2 && typeof player1Score === 'number') return player1Score;
  return '';
}

function numberOrBlank(value) {
  if (value === null || value === undefined || value === '') return '';
  const number = Number(String(value).replace(/[$,]/g, ''));
  return Number.isFinite(number) ? number : '';
}

function percentValue(value) {
  const text = String(value || '').trim();
  if (!text) return '';
  const number = Number(text.replace('%', '').trim());
  if (!Number.isFinite(number)) return '';
  if (text.includes('%') || number > 1) return number / 100;
  return number;
}

function calculateTeamHandicap(player1Handicap, player2Handicap) {
  const player1 = handicapValue(player1Handicap);
  const player2 = handicapValue(player2Handicap);
  if (player1 === null || player2 === null) return '';
  return formatHandicap(player1 + player2);
}

function handicapValue(value) {
  if (value === null || value === undefined || value === '') return null;
  const text = String(value).trim();
  const isPlusHandicap = text.startsWith('+');
  const number = Number(text.replace(/^\+/, ''));
  if (!Number.isFinite(number)) return null;
  const valueForMath = isPlusHandicap ? -number : number;
  return Math.round(valueForMath * 10) / 10;
}

function formatHandicap(value) {
  if (!Number.isFinite(value)) return '';
  const rounded = Math.round(value * 10) / 10;
  if (Object.is(rounded, -0)) return '0.0';
  if (rounded < 0) return `+${Math.abs(rounded).toFixed(1)}`;
  return rounded.toFixed(1);
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'team';
}

function normalizedKey(value) {
  return String(value || '').trim().toLowerCase();
}

function relativePath(path) {
  return path.replace(`${repoRoot}/`, '');
}
