# 2026 PGA Championship Live Scoreboard Plan

## Goal

Build a live or near-live PGA Championship scoreboard that can be hosted on the Mac mini server and viewed by players from a shared URL during tournament weekend.

The scoreboard needs to show:

- Sterling Grove team scores.
- Drafted A and B PGA player scores.
- Combined tournament standings.
- Calcutta standings and payout information.
- One-flight leaderboard unless the field grows enough to justify flights.

## Current Build

The first live scoreboard shell has been added to the PGA Championship website, and the operator workflow has pivoted to the Excel control workbook as the definitive offline source.

- Public scoreboard tab: `PGA_Championship/index.html`.
- Definitive workbook: `PGA_Championship/pga_championship_control.xlsx`.
- Exported CSV files: `PGA_Championship/pga_championship_*.csv`.
- Site content source synced from canonical CSVs: `PGA_Championship/content/site-content.json`.
- Generated rules / instructions markdown: `PGA_Championship/sterling_grove_pga_championship_2026.md`.
- Generated scoreboard data: `PGA_Championship/data/scoreboard.json`.
- File-friendly website data: `PGA_Championship/data/scoreboard-data.js`.
- Public site build output: `dist/`.

The public page can be opened directly from a file URL because it reads from `scoreboard-data.js`. Tournament-night edits should be made in the workbook first, then published with:

```bash
node scripts/update-pga-scoreboard-from-workbook.mjs
```

That command exports workbook input tabs to CSV, validates the canonical data, regenerates scoreboard JSON/JS, syncs the public site content, renders `index.html` and markdown, and rebuilds `dist/`.

The browser admin prototype still exists in the repo, but it is no longer the preferred update path. Accuracy comes from presenting and reviewing the workbook `Dashboard`, `Results Board`, `Pick Board`, `Calcutta Board`, and `Checks` tabs, then letting the scripts generate the website from workbook exports.

Build direction: finish this locally first. Once the scoreboard is roughly 90% complete and tested, move the entire `SG_Majors` folder to the Mac mini and continue work there. Do not keep two active copies of the project.

## Tournament Scoring Model

### Sterling Grove Team Scores

- Saturday: 2-man shamble.
- Saturday team par: 144.
- Saturday scoring rule: both players' balls count on every hole.
- Sunday: 2-man best ball.
- Sunday team par: 72.
- Sunday scoring rule: the team's lower score on each hole counts.
- Sterling Grove weekend team par: 216.

### PGA Player Scores

- Each Sterling Grove team drafts one A player and one B player from PGA Championship players who make the cut.
- PGA scores count for Saturday and Sunday only.
- Each drafted PGA player has two weekend rounds.
- PGA player total par contribution:
  - A player Saturday/Sunday par: 144.
  - B player Saturday/Sunday par: 144.
  - Combined A/B PGA par: 288.

### Tournament Buy-In / Main Competition Standings

- Main tournament score uses Sterling Grove team score plus drafted PGA player scores.
- Main competition total par: 504.
  - Sterling Grove team weekend par: 216.
  - Drafted A/B PGA weekend par: 288.
- Ranking basis: lowest combined total score against par.
- One flight is expected unless the field grows enough to require flights.
- Current field: 19 players, which is likely one flight.
- Target field: at least 20 players / 10 teams.

### Calcutta Standings

- Calcutta is based solely on Sterling Grove team golf scores.
- PGA player scores do not count toward Calcutta standings.
- Calcutta leaderboard should show:
  - team
  - players
  - Saturday team score
  - Sunday team score
  - Sterling Grove total
  - score to par against 216
  - auction cost
  - owner / buyer
  - buyback status
  - projected or final payout
- Calcutta payout percentages:
  - 1st: 60%
  - 2nd: 30%
  - 3rd: 10%
- Total pot is the sum of all team auction prices plus any buybacks that are included in the Calcutta pot.

## Data Needed

### Teams

Create or update `pga_championship_teams.csv` with:

- team name
- player 1
- player 2
- player handicap indexes
- team flight, default `Championship`
- status

### Sterling Grove Scores

Create a scoreboard data file, recommended path:

- `PGA_Championship/data/scoreboard.json`

Team score fields:

- Saturday gross or net team score, depending on final committee scoring decision.
- Sunday gross or net best-ball score.
- Sterling Grove total.
- Sterling Grove score to par.

### PGA Draft Picks

Use or update `pga_championship_pro_picks.csv` with:

- team
- A player
- B player
- notes

Use or update `pga_championship_pro_scores.csv` with:

- pro name
- A/B tier
- Saturday score
- Sunday score
- notes

### Calcutta

Use or update `pga_championship_calcutta_board.csv` with:

- team
- buyer / owner
- auction price
- team buyback amount
- final place
- payout override, only when a manual final payout should override the schedule
- notes

## Recommended Architecture

### Phase 1: Static Website With JSON Data

This is the fastest reliable version and the current first build.

- Keep the public scoreboard as static HTML/CSS/JS.
- Add a `Scoreboard` tab to `PGA_Championship/index.html`.
- Store live data in `PGA_Championship/data/scoreboard.json`.
- Generate or maintain `PGA_Championship/data/scoreboard-data.js` so the page also works from a local `file://` URL.
- The scoreboard page reads the JSON and calculates:
  - team leaderboard
  - PGA player contribution
  - combined tournament leaderboard
  - Calcutta standings
  - pot and payout projections
- Updating scores means editing the workbook and running `node scripts/update-pga-scoreboard-from-workbook.mjs` when the website should be refreshed.

Pros:

- Simple.
- Easy to host on Netlify or the Mac mini.
- Low risk during tournament weekend.

Cons:

- Requires running the update script after workbook edits.

### Phase 2: Mac Mini Operator Workflow

Use the Mac mini as the always-on publish machine once the local build is ready:

- Keep one active copy of the repo on the Mac mini.
- Bring the laptop to the club for entry if preferred, then copy or push changes back to the Mac mini working copy.
- Edit `pga_championship_control.xlsx`.
- Review `Dashboard`, `Results Board`, `Pick Board`, `Calcutta Board`, and `Checks`.
- Run `node scripts/update-pga-scoreboard-from-workbook.mjs`.
- Preview the generated public page locally.
- Commit/push the generated files when publishing to the public site.

Pros:

- Simple and auditable.
- No admin token is needed for the workbook/CSV path.
- Public users only see the scoreboard.

Cons:

- Requires disciplined file sync if the laptop and Mac mini are both used.

### Phase 3: Git Push Workflow

If the public website is hosted from Netlify:

- Workbook/CSV updates regenerate the managed PGA files on the Mac mini.
- Mac mini commits and pushes the updated files to GitHub.
- Netlify builds from `netlify.toml` and publishes only the allowlisted player-facing files in `dist`.

Pros:

- Public URL is stable and easy to share.
- No need to expose the Mac mini directly to players.

Cons:

- Netlify may take a short time to update after each push.
- Requires GitHub auth/token setup on the Mac mini.

## Recommended Deployment Plan

Use this current machine as the build machine until the scoreboard is mostly complete. Then move the entire `SG_Majors` folder to the Mac mini and make that folder the one active working copy and always-on operator machine.

1. Finish the scoreboard locally until it is about 90% ready.
2. Test locally with sample teams, sample A/B PGA picks, sample scores, and sample Calcutta bids.
3. Move the entire `SG_Majors` folder to the Mac mini.
4. Verify the workbook update command, generated site, and local preview from the Mac mini.
5. Continue edits only from the Mac mini after the move.
6. Public hosting:
   - Preferred: Netlify public site build from the Git repo.
   - Alternate: Mac mini served publicly through Tailscale Funnel, Cloudflare Tunnel, or another HTTPS tunnel.
7. If using Netlify:
   - Configure the Mac mini with GitHub credentials.
   - Run `node scripts/update-pga-scoreboard-from-workbook.mjs` after workbook edits.
   - Commit and push the generated files.
8. If using direct Mac mini hosting:
   - Serve the generated public files from `dist/` or run `scoreboard_server.mjs` for local previews.
   - Use HTTPS through a tunnel.
9. Do a final rehearsal before Friday night:
   - create sample teams
   - enter sample Saturday scores
   - enter sample PGA A/B picks
   - enter sample Calcutta prices
   - verify all leaderboards and payout math

## Scoreboard Views

### Public Scoreboard

- Overall standings.
- Team
- Players
- Saturday SG score
- Sunday SG score
- SG total to par
- A player
- B player
- PGA total to par
- Combined total
- Combined to par
- Rank

### Calcutta Board

- Team
- Players
- Buyer
- Auction price
- Total pot contribution
- SG-only score
- SG-only to par
- Projected or final payout

### Operator Entry

- Team setup.
- A/B PGA draft picks.
- Saturday team score entry.
- Sunday team score entry.
- PGA player score entry.
- Calcutta auction entry.
- Workbook update command.

## Immediate Decisions

- Confirm whether Sterling Grove team scores shown in the scoreboard are gross or net.
- Confirm Saturday and Sunday handicap allowances, if net scoring is used.
- Confirm whether Calcutta pot includes buybacks.
- Confirm Netlify site settings and build hook / deploy trigger timing.
- Confirm publishing method: Netlify from GitHub, direct Mac mini hosting, or tunnel.
- Confirm migration timing: move the entire `SG_Majors` folder to the Mac mini only after the local build is mostly complete.

## First Build Recommendation

The static scoreboard, canonical CSVs, control workbook, and Mac mini publish plan are now in place. The next build step is to keep building locally, add finalized teams as they arrive, and run a sample-data rehearsal before moving the entire `SG_Majors` folder to the Mac mini.
