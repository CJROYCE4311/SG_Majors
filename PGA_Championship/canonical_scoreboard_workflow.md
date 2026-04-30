# PGA Championship Canonical Scoreboard Workflow

Goal: keep tournament-night updates simple, accurate, and auditable.

## Source of Truth

Use `pga_championship_control.xlsx` as the definitive event-night source. It is designed to work offline at the club, display picks/bids/results, and later export back to the canonical CSV files for website generation.

The workbook exports these CSV files:

- `pga_championship_players.csv`
- `pga_championship_teams.csv`
- `pga_championship_scores.csv`
- `pga_championship_pro_picks.csv`
- `pga_championship_pro_scores.csv`
- `pga_championship_calcutta_board.csv`
- `pga_championship_payouts.csv`

The CSV files remain useful for auditability and website generation, but the workbook is the file to edit and present from during the event.

## Workbook Tabs

- `Dashboard`: offline control center and team snapshot.
- `Results Board`: presentation-ready combined leaderboard.
- `Pick Board`: presentation-ready A/B pick board.
- `Calcutta Board`: presentation-ready bids, pot, and projected payout board.
- `Players`: player names, handicap indexes, WHS IDs, and status.
- `Teams`: one row per Sterling Grove team. Enter player handicaps here; team total calculates automatically.
- `Team Scores`: Saturday net score by player, Sunday net score by team.
- `Pro Picks`: one A player and one B player per team.
- `Pro Scores`: PGA pro Saturday and Sunday scores.
- `Calcutta`: owner, auction price, buyback, final place, and payout override.
- `Payouts`: Calcutta payout schedule.
- `Master Data`: formula-driven data that feeds the presentation boards.
- `Checks`: quick workbook checks before generating the site.

## Night-Of Update

1. Open `PGA_Championship/pga_championship_control.xlsx`.
2. Update the yellow input cells only: `Players`, `Teams`, `Team Scores`, `Pro Picks`, `Pro Scores`, `Calcutta`, `Payouts`.
3. Present from `Dashboard`, `Results Board`, `Pick Board`, and `Calcutta Board`.
4. Review `Checks`.
5. Save the workbook.
6. When ready to refresh the website, run:

```sh
node scripts/update-pga-scoreboard-from-workbook.mjs
```

The command exports the workbook input tabs to CSV, validates the CSV data, regenerates:

- `PGA_Championship/data/scoreboard.json`
- `PGA_Championship/data/scoreboard-data.js`
- `PGA_Championship/content/site-content.json`
- `PGA_Championship/index.html`
- `PGA_Championship/sterling_grove_pga_championship_2026.md`
- `dist/`

## Direct CSV Update

If Excel is not needed, edit the CSV files directly and run:

```sh
node scripts/build-pga-scoreboard.mjs
node scripts/sync-pga-site-content-from-csv.mjs
node PGA_Championship/scoreboard_server.mjs --render
node scripts/build-public-site.mjs
```

## Validation Rules

The builder fails before changing the website data if it finds:

- duplicate teams
- score, pick, or Calcutta rows for unknown teams
- team players missing from `pga_championship_players.csv`
- pro picks missing from `pga_championship_pro_scores.csv`
- team handicap totals that do not match player handicaps
- Saturday team totals that do not match the two player scores
- Calcutta payout percentages that do not total 100%

This means bad data should be corrected in the workbook or CSV before publishing.
