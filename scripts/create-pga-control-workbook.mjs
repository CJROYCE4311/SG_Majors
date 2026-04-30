import fs from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { SpreadsheetFile, Workbook } from '@oai/artifact-tool';

const repoRoot = resolve(import.meta.dirname, '..');
const pgaDir = join(repoRoot, 'PGA_Championship');
const outputPath = join(pgaDir, 'pga_championship_control.xlsx');
const maxTeamRows = 100;
const maxProRows = 200;
const maxPlayerRows = 120;

const colors = {
  navy: '#0F172A',
  ink: '#111827',
  muted: '#475569',
  line: '#CBD5E1',
  header: '#D9EAD3',
  input: '#FEF3C7',
  formula: '#EEF2F7',
  panel: '#F8FAFC',
  gold: '#C9A227',
  green: '#166534',
  red: '#991B1B',
};

const csvFiles = {
  players: join(pgaDir, 'pga_championship_players.csv'),
  teams: join(pgaDir, 'pga_championship_teams.csv'),
  scores: join(pgaDir, 'pga_championship_scores.csv'),
  proPicks: join(pgaDir, 'pga_championship_pro_picks.csv'),
  proScores: join(pgaDir, 'pga_championship_pro_scores.csv'),
  calcutta: join(pgaDir, 'pga_championship_calcutta_board.csv'),
  payouts: join(pgaDir, 'pga_championship_payouts.csv'),
};

const workbook = Workbook.create();

const sheets = {
  dashboard: workbook.worksheets.add('Dashboard'),
  results: workbook.worksheets.add('Results Board'),
  picks: workbook.worksheets.add('Pick Board'),
  calcuttaBoard: workbook.worksheets.add('Calcutta Board'),
  instructions: workbook.worksheets.add('Instructions'),
  players: workbook.worksheets.add('Players'),
  teams: workbook.worksheets.add('Teams'),
  scores: workbook.worksheets.add('Team Scores'),
  proPicks: workbook.worksheets.add('Pro Picks'),
  proScores: workbook.worksheets.add('Pro Scores'),
  calcutta: workbook.worksheets.add('Calcutta'),
  payouts: workbook.worksheets.add('Payouts'),
  checks: workbook.worksheets.add('Checks'),
  master: workbook.worksheets.add('Master Data'),
};

await buildSourceSheet(sheets.players, csvFiles.players, maxPlayerRows);
await buildSourceSheet(sheets.teams, csvFiles.teams, maxTeamRows);
await buildSourceSheet(sheets.scores, csvFiles.scores, maxTeamRows);
await buildSourceSheet(sheets.proPicks, csvFiles.proPicks, maxTeamRows);
await buildSourceSheet(sheets.proScores, csvFiles.proScores, maxProRows);
await buildSourceSheet(sheets.calcutta, csvFiles.calcutta, maxTeamRows);
await buildSourceSheet(sheets.payouts, csvFiles.payouts, 20);

applyInputFormulas();
buildMasterData(sheets.master);
buildDashboard(sheets.dashboard);
buildResultsBoard(sheets.results);
buildPickBoard(sheets.picks);
buildCalcuttaBoard(sheets.calcuttaBoard);
buildInstructions(sheets.instructions);
buildChecks(sheets.checks);
applyWorkbookStyle();

const xlsx = await SpreadsheetFile.exportXlsx(workbook);
await xlsx.save(outputPath);
console.log(`Created ${outputPath}`);

async function buildSourceSheet(sheet, csvPath, minRows) {
  const rows = parseCsv(await fs.readFile(csvPath, 'utf8'))
    .map((row, rowIndex) => row.map((cell, columnIndex) => cellValueForWorkbook(sheet.name, rowIndex, columnIndex, cell)));
  const width = rows[0]?.length || 1;
  const padded = [...rows];
  while (padded.length < minRows + 1) {
    padded.push(Array(width).fill(null));
  }
  sheet.getRangeByIndexes(0, 0, padded.length, width).values = padded;
  styleHeader(sheet, width);
  sheet.freezePanes.freezeRows(1);
}

function cellValueForWorkbook(sheetName, rowIndex, columnIndex, value) {
  if (value === '') return null;
  if (rowIndex === 0) return value;
  if (sheetName === 'Payouts' && columnIndex === 2) return percentValue(value);
  if (sheetName === 'Payouts' && columnIndex === 0) return numericValue(value);
  if (sheetName === 'Team Scores' && columnIndex >= 1 && columnIndex <= 4) return numericValue(value);
  if (sheetName === 'Calcutta' && columnIndex >= 2 && columnIndex <= 5) return numericValue(value);
  return value;
}

function numericValue(value) {
  const number = Number(String(value).replace(/[$,]/g, ''));
  return Number.isFinite(number) ? number : value;
}

function percentValue(value) {
  const text = String(value || '').trim();
  if (!text) return null;
  const number = Number(text.replace('%', '').trim());
  if (!Number.isFinite(number)) return text;
  if (text.includes('%') || number > 1) return number / 100;
  return number;
}

function applyInputFormulas() {
  const teamRows = [];
  const scoreRows = [];
  const pickRows = [];
  const calcuttaRows = [];

  for (let row = 2; row <= maxTeamRows + 1; row += 1) {
    teamRows.push([
      teamHandicapFormula(row),
    ]);
    scoreRows.push([
      `=IF(Teams!A${row}="","",Teams!A${row})`,
      `=IF(A${row}="","",IF(AND(B${row}="",C${row}=""),"",SUM(B${row}:C${row})))`,
    ]);
    pickRows.push([`=IF(Teams!A${row}="","",Teams!A${row})`]);
    calcuttaRows.push([`=IF(Teams!A${row}="","",Teams!A${row})`]);
  }

  sheets.teams.getRangeByIndexes(1, 5, teamRows.length, 1).formulas = teamRows;
  sheets.scores.getRangeByIndexes(1, 0, scoreRows.length, 1).formulas = scoreRows.map((row) => [row[0]]);
  sheets.scores.getRangeByIndexes(1, 3, scoreRows.length, 1).formulas = scoreRows.map((row) => [row[1]]);
  sheets.proPicks.getRangeByIndexes(1, 0, pickRows.length, 1).formulas = pickRows;
  sheets.calcutta.getRangeByIndexes(1, 0, calcuttaRows.length, 1).formulas = calcuttaRows;
}

function teamHandicapFormula(row) {
  const p1 = handicapMathExpression(`C${row}`);
  const p2 = handicapMathExpression(`E${row}`);
  const total = `${p1}+${p2}`;
  return `=IF(OR(B${row}="",D${row}=""),"",IF(${total}<0,"+"&TEXT(ABS(${total}),"0.0"),TEXT(${total},"0.0")))`;
}

function handicapMathExpression(cell) {
  return `IF(LEFT(${cell},1)="+",-VALUE(MID(${cell},2,99)),VALUE(${cell}))`;
}

function buildMasterData(sheet) {
  const headers = [
    'team',
    'players',
    'p1_handicap',
    'p2_handicap',
    'team_handicap',
    'sat_sg',
    'sun_sg',
    'sg_total',
    'sg_to_par',
    'pro_a',
    'a_sat',
    'a_sun',
    'pro_b',
    'b_sat',
    'b_sun',
    'pro_total',
    'overall_total',
    'overall_to_par',
    'owner',
    'auction_price',
    'buyback',
    'pot_contribution',
    'final_place',
    'payout_override',
    'final_payout',
  ];
  sheet.getRangeByIndexes(0, 0, 1, headers.length).values = [headers];
  styleHeader(sheet, headers.length);

  const formulas = [];
  for (let row = 2; row <= maxTeamRows + 1; row += 1) {
    formulas.push([
      `=Teams!A${row}`,
      `=IF(A${row}="","",TEXTJOIN(" / ",TRUE,Teams!B${row},Teams!D${row}))`,
      `=IF(ISBLANK(Teams!C${row}),"",Teams!C${row})`,
      `=IF(ISBLANK(Teams!E${row}),"",Teams!E${row})`,
      `=IF(ISBLANK(Teams!F${row}),"",Teams!F${row})`,
      `=IF(ISBLANK('Team Scores'!D${row}),"",'Team Scores'!D${row})`,
      `=IF(ISBLANK('Team Scores'!E${row}),"",'Team Scores'!E${row})`,
      `=IF(AND(F${row}="",G${row}=""),"",SUM(F${row}:G${row}))`,
      `=IF(H${row}="","",H${row}-216)`,
      `=IF(ISBLANK('Pro Picks'!B${row}),"",'Pro Picks'!B${row})`,
      `=IF(J${row}="","",XLOOKUP(J${row},'Pro Scores'!$A$2:$A$${maxProRows + 1},'Pro Scores'!$C$2:$C$${maxProRows + 1},""))`,
      `=IF(J${row}="","",XLOOKUP(J${row},'Pro Scores'!$A$2:$A$${maxProRows + 1},'Pro Scores'!$D$2:$D$${maxProRows + 1},""))`,
      `=IF(ISBLANK('Pro Picks'!C${row}),"",'Pro Picks'!C${row})`,
      `=IF(M${row}="","",XLOOKUP(M${row},'Pro Scores'!$A$2:$A$${maxProRows + 1},'Pro Scores'!$C$2:$C$${maxProRows + 1},""))`,
      `=IF(M${row}="","",XLOOKUP(M${row},'Pro Scores'!$A$2:$A$${maxProRows + 1},'Pro Scores'!$D$2:$D$${maxProRows + 1},""))`,
      `=IF(AND(K${row}="",L${row}="",N${row}="",O${row}=""),"",SUM(K${row}:L${row},N${row}:O${row}))`,
      `=IF(AND(H${row}="",P${row}=""),"",SUM(H${row},P${row}))`,
      `=IF(Q${row}="","",Q${row}-504)`,
      `=IF(ISBLANK(Calcutta!B${row}),"",Calcutta!B${row})`,
      `=IF(ISBLANK(Calcutta!C${row}),"",Calcutta!C${row})`,
      `=IF(ISBLANK(Calcutta!D${row}),"",Calcutta!D${row})`,
      `=IF(AND(T${row}="",U${row}=""),"",SUM(T${row}:U${row}))`,
      `=IF(ISBLANK(Calcutta!E${row}),"",Calcutta!E${row})`,
      `=IF(ISBLANK(Calcutta!F${row}),"",Calcutta!F${row})`,
      `=IF(X${row}<>"",X${row},IF(W${row}<>"",XLOOKUP(W${row},Payouts!$A$2:$A$21,Payouts!$C$2:$C$21,0)*SUM(V$2:V$${maxTeamRows + 1}),""))`,
    ]);
  }

  sheet.getRangeByIndexes(1, 0, formulas.length, headers.length).formulas = formulas;
  sheet.freezePanes.freezeRows(1);
  setWidths(sheet, [140, 230, 80, 80, 90, 70, 70, 75, 75, 150, 60, 60, 150, 60, 60, 75, 85, 85, 140, 90, 90, 100, 85, 100, 100]);
  sheet.getRange(`T2:V${maxTeamRows + 1}`).format.numberFormat = '$#,##0';
  sheet.getRange(`Y2:Y${maxTeamRows + 1}`).format.numberFormat = '$#,##0';
}

function buildDashboard(sheet) {
  sheet.getRange('A1:H1').merge();
  sheet.getRange('A1').values = [['2026 PGA Championship Control Workbook']];
  sheet.getRange('A2:H2').merge();
  sheet.getRange('A2').values = [['Offline-first source of truth for teams, picks, scoring, Calcutta bids, and presentation boards']];

  sheet.getRange('A4:B6').values = [['Players', ''], ['Complete Teams', ''], ['Need Partners', '']];
  sheet.getRange('D4:E6').values = [['Calcutta Pot', ''], ['Payout Total', ''], ['Workbook Status', '']];
  sheet.getRange('B4:B6').formulas = [
    [`=SUMPRODUCT(--(Teams!B2:B${maxTeamRows + 1}<>""),--(Teams!A2:A${maxTeamRows + 1}<>""))+SUMPRODUCT(--(Teams!D2:D${maxTeamRows + 1}<>""),--(Teams!A2:A${maxTeamRows + 1}<>""))`],
    ['=Checks!B2'],
    ['=Checks!B3'],
  ];
  sheet.getRange('E4:E6').formulas = [
    ['=Checks!B6'],
    ['=Checks!B7'],
    ['=Checks!B8'],
  ];

  sheet.getRange('A8:H8').merge();
  sheet.getRange('A8').values = [['Event-Night Workflow']];
  sheet.getRange('A9:H13').values = [
    ['1', 'Update Players and Teams as the field changes.', '', '4', 'Enter Calcutta owners, bids, buybacks, and final places.', '', '', ''],
    ['2', 'Enter PGA A/B draft selections on Pro Picks.', '', '5', 'Use Dashboard, Results Board, Pick Board, and Calcutta Board for presentation.', '', '', ''],
    ['3', 'Enter Saturday player scores and Sunday team scores on Team Scores.', '', '6', 'Run the website update script only when ready to publish.', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['Rule', 'Yellow cells are inputs. Gray cells are formulas. Do not hand-edit board, check, or master tabs.', '', '', '', '', '', ''],
  ];
  ['9', '10', '11'].forEach((row) => {
    sheet.getRange(`B${row}:C${row}`).merge();
    sheet.getRange(`E${row}:H${row}`).merge();
  });
  sheet.getRange('B13:H13').merge();

  sheet.getRange('A15:H15').merge();
  sheet.getRange('A15').values = [['Current Team Board']];
  sheet.getRange('A16:D16').values = [['Team', 'Players', 'Total HDCP', 'Status']];
  styleHeader(sheet, 4, 15);

  const rows = [];
  for (let row = 2; row <= 21; row += 1) {
    rows.push([
      `=IF(Teams!A${row}="","",Teams!A${row})`,
      `=IF(Teams!A${row}="","",TEXTJOIN(" / ",TRUE,Teams!B${row},Teams!D${row}))`,
      displayHandicapFormula(`Teams!F${row}`, ''),
      `=IF(Teams!A${row}="","",IF(Teams!D${row}<>"","Complete","Needs partner"))`,
    ]);
  }
  sheet.getRangeByIndexes(16, 0, rows.length, 4).formulas = rows;
  setWidths(sheet, [170, 300, 110, 140, 90, 110, 40, 170]);
}

function displayHandicapFormula(handicapCell, playerCell) {
  if (!playerCell) {
    return `=IF(${handicapCell}="","",IF(LEFT(${handicapCell}&"",1)="+","+"&TEXT(VALUE(SUBSTITUTE(${handicapCell}&"","+","")),"0.0"),TEXT(${handicapCell},"0.0")))`;
  }
  const plusMatch = `COUNTIFS(Players!$A$2:$A$${maxPlayerRows + 1},${playerCell},Players!$B$2:$B$${maxPlayerRows + 1},"+*")`;
  return `=IF(${handicapCell}="","",IF(${plusMatch}>0,"+"&TEXT(ABS(VALUE(SUBSTITUTE(XLOOKUP(${playerCell},Players!$A$2:$A$${maxPlayerRows + 1},Players!$B$2:$B$${maxPlayerRows + 1},""),"+",""))),"0.0"),TEXT(${handicapCell},"0.0")))`;
}

function buildResultsBoard(sheet) {
  buildBoardTitle(sheet, 'Results Board', 'Combined Sterling Grove and PGA A/B draft scoring for presentation');
  const headers = [
    'Rank',
    'Team',
    'Players',
    'Sat SG',
    'Sun SG',
    'SG Total',
    'SG +/-',
    'A Pro',
    'B Pro',
    'Pro Total',
    'Overall',
    'Overall +/-',
    'Owner',
    'Cost',
    'Payout',
  ];
  sheet.getRangeByIndexes(2, 0, 1, headers.length).values = [headers];
  styleHeader(sheet, headers.length, 2);

  const formulas = [];
  for (let sourceRow = 2; sourceRow <= maxTeamRows + 1; sourceRow += 1) {
    const boardRow = sourceRow + 2;
    formulas.push([
      `=IF(K${boardRow}="","",RANK.EQ(K${boardRow},$K$4:$K$${maxTeamRows + 3},1))`,
      `=IF('Master Data'!A${sourceRow}="","",'Master Data'!A${sourceRow})`,
      `=IF('Master Data'!B${sourceRow}="","",'Master Data'!B${sourceRow})`,
      `=IF('Master Data'!F${sourceRow}="","",'Master Data'!F${sourceRow})`,
      `=IF('Master Data'!G${sourceRow}="","",'Master Data'!G${sourceRow})`,
      `=IF('Master Data'!H${sourceRow}="","",'Master Data'!H${sourceRow})`,
      `=IF('Master Data'!I${sourceRow}="","",'Master Data'!I${sourceRow})`,
      `=IF('Master Data'!J${sourceRow}="","",'Master Data'!J${sourceRow})`,
      `=IF('Master Data'!M${sourceRow}="","",'Master Data'!M${sourceRow})`,
      `=IF('Master Data'!P${sourceRow}="","",'Master Data'!P${sourceRow})`,
      `=IF('Master Data'!Q${sourceRow}="","",'Master Data'!Q${sourceRow})`,
      `=IF('Master Data'!R${sourceRow}="","",'Master Data'!R${sourceRow})`,
      `=IF('Master Data'!S${sourceRow}="","",'Master Data'!S${sourceRow})`,
      `=IF('Master Data'!T${sourceRow}="","",'Master Data'!T${sourceRow})`,
      `=IF('Master Data'!Y${sourceRow}="","",'Master Data'!Y${sourceRow})`,
    ]);
  }
  sheet.getRangeByIndexes(3, 0, formulas.length, headers.length).formulas = formulas;
  sheet.freezePanes.freezeRows(3);
  setWidths(sheet, [55, 150, 240, 70, 70, 75, 70, 150, 150, 80, 80, 80, 130, 85, 95]);
  sheet.getRange(`N4:O${maxTeamRows + 3}`).format.numberFormat = '$#,##0';
}

function buildPickBoard(sheet) {
  buildBoardTitle(sheet, 'Pick Board', 'Friday night A/B player selections and weekend PGA score contribution');
  const headers = ['Team', 'Players', 'A Pro', 'A Sat', 'A Sun', 'A Total', 'B Pro', 'B Sat', 'B Sun', 'B Total', 'Pro Total'];
  sheet.getRangeByIndexes(2, 0, 1, headers.length).values = [headers];
  styleHeader(sheet, headers.length, 2);
  const formulas = [];
  for (let sourceRow = 2; sourceRow <= maxTeamRows + 1; sourceRow += 1) {
    formulas.push([
      `=IF('Master Data'!A${sourceRow}="","",'Master Data'!A${sourceRow})`,
      `=IF('Master Data'!B${sourceRow}="","",'Master Data'!B${sourceRow})`,
      `=IF('Master Data'!J${sourceRow}="","",'Master Data'!J${sourceRow})`,
      `=IF('Master Data'!K${sourceRow}="","",'Master Data'!K${sourceRow})`,
      `=IF('Master Data'!L${sourceRow}="","",'Master Data'!L${sourceRow})`,
      `=IF(AND(D${sourceRow + 2}="",E${sourceRow + 2}=""),"",SUM(D${sourceRow + 2}:E${sourceRow + 2}))`,
      `=IF('Master Data'!M${sourceRow}="","",'Master Data'!M${sourceRow})`,
      `=IF('Master Data'!N${sourceRow}="","",'Master Data'!N${sourceRow})`,
      `=IF('Master Data'!O${sourceRow}="","",'Master Data'!O${sourceRow})`,
      `=IF(AND(H${sourceRow + 2}="",I${sourceRow + 2}=""),"",SUM(H${sourceRow + 2}:I${sourceRow + 2}))`,
      `=IF('Master Data'!P${sourceRow}="","",'Master Data'!P${sourceRow})`,
    ]);
  }
  sheet.getRangeByIndexes(3, 0, formulas.length, headers.length).formulas = formulas;
  sheet.freezePanes.freezeRows(3);
  setWidths(sheet, [150, 240, 150, 65, 65, 70, 150, 65, 65, 70, 75]);
}

function buildCalcuttaBoard(sheet) {
  buildBoardTitle(sheet, 'Calcutta Board', 'Auction bids, pot contribution, Sterling Grove-only standings, and projected payouts');
  const headers = ['Place', 'Team', 'Players', 'Owner', 'Auction', 'Buyback', 'Pot', 'SG Total', 'SG +/-', 'Final Place', 'Projected/Final Payout'];
  sheet.getRangeByIndexes(2, 0, 1, headers.length).values = [headers];
  styleHeader(sheet, headers.length, 2);
  const formulas = [];
  for (let sourceRow = 2; sourceRow <= maxTeamRows + 1; sourceRow += 1) {
    const boardRow = sourceRow + 2;
    formulas.push([
      `=IF(H${boardRow}="","",RANK.EQ(H${boardRow},$H$4:$H$${maxTeamRows + 3},1))`,
      `=IF('Master Data'!A${sourceRow}="","",'Master Data'!A${sourceRow})`,
      `=IF('Master Data'!B${sourceRow}="","",'Master Data'!B${sourceRow})`,
      `=IF('Master Data'!S${sourceRow}="","",'Master Data'!S${sourceRow})`,
      `=IF('Master Data'!T${sourceRow}="","",'Master Data'!T${sourceRow})`,
      `=IF('Master Data'!U${sourceRow}="","",'Master Data'!U${sourceRow})`,
      `=IF('Master Data'!V${sourceRow}="","",'Master Data'!V${sourceRow})`,
      `=IF('Master Data'!H${sourceRow}="","",'Master Data'!H${sourceRow})`,
      `=IF('Master Data'!I${sourceRow}="","",'Master Data'!I${sourceRow})`,
      `=IF('Master Data'!W${sourceRow}="","",'Master Data'!W${sourceRow})`,
      projectedPayoutFormula(boardRow, sourceRow),
    ]);
  }
  sheet.getRangeByIndexes(3, 0, formulas.length, headers.length).formulas = formulas;
  sheet.freezePanes.freezeRows(3);
  setWidths(sheet, [60, 150, 240, 140, 85, 85, 85, 75, 70, 85, 180]);
  sheet.getRange(`E4:G${maxTeamRows + 3}`).format.numberFormat = '$#,##0';
  sheet.getRange(`K4:K${maxTeamRows + 3}`).format.numberFormat = '$#,##0';
}

function projectedPayoutFormula(boardRow, sourceRow) {
  return `=IF('Master Data'!X${sourceRow}<>"",'Master Data'!X${sourceRow},IF(J${boardRow}<>"",XLOOKUP(J${boardRow},Payouts!$A$2:$A$21,Payouts!$C$2:$C$21,0)*SUM($G$4:$G$${maxTeamRows + 3}),IF(H${boardRow}<>"",XLOOKUP(A${boardRow},Payouts!$A$2:$A$21,Payouts!$C$2:$C$21,0)*SUM($G$4:$G$${maxTeamRows + 3}),"")))`;
}

function buildBoardTitle(sheet, title, subtitle) {
  sheet.getRange('A1:K1').merge();
  sheet.getRange('A1').values = [[title]];
  sheet.getRange('A2:K2').merge();
  sheet.getRange('A2').values = [[subtitle]];
}

function buildInstructions(sheet) {
  sheet.getRange('A1:F1').merge();
  sheet.getRange('A1').values = [['PGA Championship Workbook Guide']];
  sheet.getRange('A3:F12').values = [
    ['Offline-first workflow', '', '', '', '', ''],
    ['1', 'Before Friday night, update Players and Teams only once the field changes.', '', '', '', ''],
    ['2', 'Friday night: use Pro Picks for A/B selections and Calcutta for owners and bids.', '', '', '', ''],
    ['3', 'Saturday: enter each player net score on Team Scores; Saturday team total calculates automatically.', '', '', '', ''],
    ['4', 'Sunday: enter Sunday team net score on Team Scores.', '', '', '', ''],
    ['5', 'Enter PGA professional Saturday/Sunday scores on Pro Scores.', '', '', '', ''],
    ['6', 'Use Results Board, Pick Board, and Calcutta Board for presentation.', '', '', '', ''],
    ['7', 'Review Checks before publishing or sharing results.', '', '', '', ''],
    ['8', 'When service is available, run: node scripts/update-pga-scoreboard-from-workbook.mjs', '', '', '', ''],
    ['Rule', 'Yellow cells are event-night inputs. Gray cells are formulas. Do not edit presentation or check tabs.', '', '', '', ''],
  ];
  styleHeader(sheet, 6, 2);
  setWidths(sheet, [80, 560, 40, 40, 40, 40]);
}

function buildChecks(sheet) {
  sheet.getRange('A1:E1').values = [['check', 'value', 'expected', 'status', 'notes']];
  styleHeader(sheet, 5);
  sheet.getRange('A2:E11').values = [
    ['Complete teams', '', '', '', 'Both player slots filled on Teams.'],
    ['Singles needing partner', '', '0 when final', '', 'Rows with player 1 but no player 2.'],
    ['Teams with Saturday score', '', '', '', 'Counts calculated Saturday team totals.'],
    ['Teams with Sunday score', '', '', '', 'Counts Sunday team scores.'],
    ['Calcutta pot', '', '', '', 'Auction price plus buyback amounts.'],
    ['Payout total', '', '100%', '', 'Must equal 100%.'],
    ['Workbook status', '', '', '', 'Must be OK before publishing.'],
    ['Missing team names', '', '0', '', 'Rows with a player but no team name.'],
    ['Team rows', '', '', '', 'Rows with a team name.'],
    ['Payout rows', '', '', '', 'Active payout schedule rows.'],
  ];
  sheet.getRange('B2:B11').formulas = [
    [`=COUNTIFS(Teams!B2:B${maxTeamRows + 1},"<>",Teams!D2:D${maxTeamRows + 1},"<>")`],
    [`=SUMPRODUCT(--(Teams!B2:B${maxTeamRows + 1}<>""),--(Teams!D2:D${maxTeamRows + 1}=""))`],
    [`=COUNT('Master Data'!F2:F${maxTeamRows + 1})`],
    [`=COUNT('Master Data'!G2:G${maxTeamRows + 1})`],
    [`=SUM('Master Data'!V2:V${maxTeamRows + 1})`],
    [`=SUM(Payouts!C2:C21)`],
    [`=IF(AND(B9=0,ABS(B7-1)<0.0001),"OK","Review")`],
    [`=COUNTIFS(Teams!A2:A${maxTeamRows + 1},"",Teams!B2:B${maxTeamRows + 1},"<>")`],
    [`=COUNTIF(Teams!A2:A${maxTeamRows + 1},"<>")`],
    [`=COUNT(Payouts!A2:A21)`],
  ];
  sheet.getRange('D2:D11').formulas = [
    ['=IF(B2>=0,"OK","Check")'],
    ['=IF(B3=0,"OK","Open")'],
    ['=IF(B4>=0,"OK","Check")'],
    ['=IF(B5>=0,"OK","Check")'],
    ['=IF(B6>=0,"OK","Check")'],
    ['=IF(ABS(B7-1)<0.0001,"OK","Fix")'],
    ['=B8'],
    ['=IF(B9=0,"OK","Fix")'],
    ['=IF(B10>0,"OK","Check")'],
    ['=IF(B11>0,"OK","Check")'],
  ];
  sheet.getRange('B6:B6').format.numberFormat = '$#,##0';
  sheet.getRange('B7:B7').format.numberFormat = '0.0%';
  setWidths(sheet, [220, 120, 120, 120, 360]);
}

function applyWorkbookStyle() {
  for (const sheetName of Object.keys(sheets)) {
    const sheet = sheets[sheetName];
    sheet.showGridLines = false;
    const used = sheet.getUsedRange();
    if (used) {
      used.format = {
        font: { name: 'Aptos', size: 11, color: colors.ink },
        wrapText: false,
        verticalAlignment: 'center',
      };
    }
  }

  stylePresentationSheet(sheets.dashboard, 'A1:H2');
  stylePresentationSheet(sheets.results, 'A1:O2');
  stylePresentationSheet(sheets.picks, 'A1:K2');
  stylePresentationSheet(sheets.calcuttaBoard, 'A1:K2');
  stylePresentationSheet(sheets.instructions, 'A1:F1');

  styleDashboard();
  styleInputSheets();
  styleBoards();
  styleChecks();
  styleMasterData();
}

function styleDashboard() {
  sheets.dashboard.getRange('A4:E6').format = {
    fill: colors.panel,
    font: { bold: true, color: colors.ink },
    borders: { preset: 'outside', style: 'thin', color: colors.line },
  };
  sheets.dashboard.getRange('B4:B6').format = { font: { bold: true, size: 14, color: colors.navy } };
  sheets.dashboard.getRange('E4:E6').format = { font: { bold: true, size: 14, color: colors.navy } };
  sheets.dashboard.getRange('E4:E4').format.numberFormat = '$#,##0';
  sheets.dashboard.getRange('E5:E5').format.numberFormat = '0%';
  sheets.dashboard.getRange('A8:H8').format = sectionFormat();
  sheets.dashboard.getRange('A9:H13').format = {
    fill: colors.panel,
    borders: { preset: 'outside', style: 'thin', color: colors.line },
    wrapText: true,
  };
  sheets.dashboard.getRange('A15:H15').format = sectionFormat();
  sheets.dashboard.getRange('A16:D36').format.borders = { preset: 'all', style: 'thin', color: colors.line };
  sheets.dashboard.getRange('A17:D36').format.fill = '#FFFFFF';
}

function styleInputSheets() {
  const inputRanges = {
    players: [`A2:D${maxPlayerRows + 1}`],
    teams: [`A2:E${maxTeamRows + 1}`, `G2:H${maxTeamRows + 1}`],
    scores: [`B2:C${maxTeamRows + 1}`, `E2:F${maxTeamRows + 1}`],
    proPicks: [`B2:D${maxTeamRows + 1}`],
    proScores: [`A2:E${maxProRows + 1}`],
    calcutta: [`B2:F${maxTeamRows + 1}`],
    payouts: ['A2:C21'],
  };
  const formulaRanges = {
    teams: [`F2:F${maxTeamRows + 1}`],
    scores: [`A2:A${maxTeamRows + 1}`, `D2:D${maxTeamRows + 1}`],
    proPicks: [`A2:A${maxTeamRows + 1}`],
    calcutta: [`A2:A${maxTeamRows + 1}`],
  };
  Object.entries(inputRanges).forEach(([key, ranges]) => {
    ranges.forEach((range) => {
      sheets[key].getRange(range).format.fill = colors.input;
    });
  });
  Object.entries(formulaRanges).forEach(([key, ranges]) => {
    ranges.forEach((range) => {
      sheets[key].getRange(range).format.fill = colors.formula;
    });
  });

  const sourceWidths = {
    players: [180, 110, 120, 120],
    teams: [170, 180, 95, 180, 95, 110, 90, 240],
    scores: [170, 140, 140, 140, 140, 240],
    proPicks: [170, 180, 180, 240],
    proScores: [180, 90, 130, 130, 260],
    calcutta: [170, 160, 110, 120, 100, 130, 240],
    payouts: [80, 140, 100],
  };
  Object.entries(sourceWidths).forEach(([key, widths]) => setWidths(sheets[key], widths));
  sheets.payouts.getRange('C2:C21').format.numberFormat = '0%';
  sheets.calcutta.getRange('C2:D101').format.numberFormat = '$#,##0';
  sheets.calcutta.getRange('F2:F101').format.numberFormat = '$#,##0';
}

function styleBoards() {
  [sheets.results, sheets.picks, sheets.calcuttaBoard].forEach((sheet) => {
    const used = sheet.getUsedRange();
    if (used) used.format.borders = { preset: 'all', style: 'thin', color: colors.line };
    sheet.getRange('A4:O103').format.fill = '#FFFFFF';
  });
  sheets.results.getRange(`D4:G${maxTeamRows + 3}`).format.horizontalAlignment = 'center';
  sheets.results.getRange(`J4:L${maxTeamRows + 3}`).format.horizontalAlignment = 'center';
  sheets.picks.getRange(`D4:F${maxTeamRows + 3}`).format.horizontalAlignment = 'center';
  sheets.picks.getRange(`H4:K${maxTeamRows + 3}`).format.horizontalAlignment = 'center';
  sheets.calcuttaBoard.getRange(`A4:A${maxTeamRows + 3}`).format.horizontalAlignment = 'center';
  sheets.calcuttaBoard.getRange(`E4:G${maxTeamRows + 3}`).format.numberFormat = '$#,##0';
  sheets.calcuttaBoard.getRange(`K4:K${maxTeamRows + 3}`).format.numberFormat = '$#,##0';
}

function styleChecks() {
  sheets.checks.getRange('A1:E11').format.borders = { preset: 'all', style: 'thin', color: colors.line };
  sheets.checks.getRange('A2:E11').format.fill = colors.panel;
  sheets.checks.getRange('D2:D11').format = { font: { bold: true, color: colors.green } };
}

function styleMasterData() {
  setWidths(sheets.master, [140, 230, 80, 80, 90, 70, 70, 75, 75, 150, 60, 60, 150, 60, 60, 75, 85, 85, 140, 90, 90, 100, 85, 100, 100]);
  sheets.master.getRange(`T2:V${maxTeamRows + 1}`).format.numberFormat = '$#,##0';
  sheets.master.getRange(`Y2:Y${maxTeamRows + 1}`).format.numberFormat = '$#,##0';
}

function stylePresentationSheet(sheet, titleRange) {
  sheet.getRange(titleRange).format = {
    fill: colors.navy,
    font: { bold: true, color: '#FFFFFF', size: 18 },
    verticalAlignment: 'center',
  };
  const secondRow = titleRange.replace(/1:/, '2:').replace(/1$/, '2');
  if (secondRow !== titleRange) {
    sheet.getRange(secondRow).format = {
      fill: colors.navy,
      font: { color: '#E2E8F0', size: 11 },
      verticalAlignment: 'center',
    };
  }
}

function styleHeader(sheet, width, rowIndex = 0) {
  sheet.getRangeByIndexes(rowIndex, 0, 1, width).format = headerFormat();
}

function headerFormat() {
  return {
    fill: colors.header,
    font: { bold: true, color: colors.navy },
    horizontalAlignment: 'center',
    borders: { preset: 'all', style: 'thin', color: colors.line },
  };
}

function sectionFormat() {
  return {
    fill: colors.navy,
    font: { bold: true, color: '#FFFFFF' },
  };
}

function setWidths(sheet, widths) {
  widths.forEach((width, columnIndex) => {
    sheet.getRangeByIndexes(0, columnIndex, 1, 1).format.columnWidthPx = width;
  });
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
