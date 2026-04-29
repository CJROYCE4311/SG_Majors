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

The first live scoreboard shell has been added to the PGA Championship website, and the private admin app now controls the player-facing PGA website content.

- Public scoreboard tab: `PGA_Championship/index.html`.
- Private site content source: `PGA_Championship/content/site-content.json`.
- Generated rules / instructions markdown: `PGA_Championship/sterling_grove_pga_championship_2026.md`.
- Source data: `PGA_Championship/data/scoreboard.json`.
- File-friendly website data: `PGA_Championship/data/scoreboard-data.js`.
- Admin editor: `PGA_Championship/scoreboard_admin.html`.
- Mac mini server: `PGA_Championship/scoreboard_server.mjs`.

The public page can be opened directly from a file URL because it reads from `scoreboard-data.js`. The Mac mini server uses `scoreboard.json` as the score source of truth, writes the matching JS data file, and can commit/push the managed PGA site files to the public website repo.

The private admin app has one editable area for each player-facing PGA website tab:

- Overview
- Players, including team name, player 1, player 1 handicap, player 2, player 2 handicap, and total handicap
- Format
- A/B Players, including the selectable A-player and B-player PGA professional pools
- Calcutta
- Scorecard / Scoreboard
- Rules

Saving site content writes `content/site-content.json`, regenerates the matching public sections in `index.html`, and regenerates `sterling_grove_pga_championship_2026.md`. Publishing stages only the managed PGA content/scoreboard files, commits them, and pushes the current branch.

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
- Current field: 17 players, which is likely one flight.
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
  - owner
  - projected or final payout
- Calcutta payout percentages:
  - 1st: 60%
  - 2nd: 30%
  - 3rd: 10%
- Total pot is the sum of all team auction prices.

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
- A player Saturday score
- A player Sunday score
- B player
- B player Saturday score
- B player Sunday score
- PGA total
- PGA score to par

### Calcutta

Use or update `pga_championship_calcutta_board.csv` with:

- team
- buyer / owner
- auction price
- team buyback amount
- total team Calcutta cost
- projected payout
- final payout

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
- Updating scores means editing the JSON file and refreshing the page.

Pros:

- Simple.
- Easy to host on Netlify or the Mac mini.
- Low risk during tournament weekend.

Cons:

- Manual data edits unless an admin tool is added.

### Phase 2: Private PGA Site Admin Editor

Run an admin-only site and score editor on the Mac mini:

- `PGA_Championship/scoreboard_admin.html`
- Run it through `PGA_Championship/scoreboard_server.mjs`.
- Protect private content loads, saves, and publish actions with `SCOREBOARD_ADMIN_TOKEN`.
- Admin editor writes website section content to `content/site-content.json`.
- Admin editor can update team names, player names, player handicaps, pairings, and team total handicaps from the Players tab.
- Admin editor uses one simple text box for the Format tab, since the format should rarely change.
- Admin editor uses the A/B Players tab to maintain the eligible PGA professional A-player and B-player pools.
- Admin editor uses the Scorecard tab to select one A player and one B player for each Sterling Grove team from those pools.
- Scorecard A/B selections are saved into `data/scoreboard.json` and mirrored into `data/scoreboard-data.js` for the public scoreboard.
- Scorecard also has expandable Calcutta entries per team, with owner dropdowns from the tournament player list, cost entry, and a running total pot.
- Server regenerates the public PGA page sections in `index.html`.
- Server regenerates `sterling_grove_pga_championship_2026.md`.
- Admin editor writes to `scoreboard.json`.
- Server writes the matching `scoreboard-data.js` file for the public website.
- Public scoreboard can be refreshed after score updates.

Local-only run command:

```bash
SCOREBOARD_ADMIN_TOKEN='set-a-real-token' node PGA_Championship/scoreboard_server.mjs
```

Phone-accessible LAN run command from the Mac mini:

```bash
SCOREBOARD_HOST=0.0.0.0 SCOREBOARD_PORT=4173 SCOREBOARD_ADMIN_TOKEN='set-a-real-token' node PGA_Championship/scoreboard_server.mjs
```

Then open `http://<mac-mini-lan-ip>:4173/scoreboard_admin.html` from the phone, enter the token, save changes, and use Commit and Push when the public site should be updated.

Pros:

- Easy live updates from a phone or laptop.
- Public users only see the scoreboard.

Cons:

- Needs a small backend service to write JSON safely.

### Phase 3: Git Push Workflow

If the public website is hosted from Netlify:

- Admin editor updates the managed PGA files on the Mac mini.
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
4. Verify the site, admin editor, and server from the Mac mini.
5. Continue edits only from the Mac mini after the move.
6. Public hosting:
   - Preferred: Netlify public site build from the Git repo.
   - Alternate: Mac mini served publicly through Tailscale Funnel, Cloudflare Tunnel, or another HTTPS tunnel.
7. If using Netlify:
   - Configure the Mac mini with GitHub credentials.
   - Run the admin server with `SCOREBOARD_ADMIN_TOKEN`.
   - Use the admin page save button to update data and the publish button to commit/push.
8. If using direct Mac mini hosting:
   - Run `scoreboard_server.mjs` with protected admin routes.
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

### Admin Entry

- Team setup.
- A/B PGA draft picks.
- Saturday team score entry.
- Sunday team score entry.
- PGA player score entry.
- Calcutta auction entry.
- Publish/update button.

## Immediate Decisions

- Confirm whether Sterling Grove team scores shown in the scoreboard are gross or net.
- Confirm Saturday and Sunday handicap allowances, if net scoring is used.
- Confirm whether Calcutta pot includes buybacks.
- Confirm Netlify site settings and build hook / deploy trigger timing.
- Confirm admin update method: use the private admin editor for site sections and scoreboard data.
- Confirm migration timing: move the entire `SG_Majors` folder to the Mac mini only after the local build is mostly complete.

## First Build Recommendation

The static scoreboard, data file, admin editor, and Mac mini server scaffold are now in place. The next build step is to keep building locally, add finalized teams when ready, and run a sample-data rehearsal before moving the entire `SG_Majors` folder to the Mac mini.
