# 1st Annual PGA Championship Invitational at Sterling Grove CC

## Event Snapshot

- Event: 2026 PGA Championship Invitational at Sterling Grove Country Club
- Weekend: Friday, May 15, 2026 through Sunday, May 17, 2026
- Tournament rounds: Saturday, May 16, 2026 and Sunday, May 17, 2026
- Location: Sterling Grove Country Club
- Competition: Pick-a-Pro flight tournament plus Calcutta
- Event type: invitational using a PGA Championship pick-a-pro format with Sterling Grove team play
- Field: 17 confirmed players so far; two-man teams and flights are not formed yet
- Entry fee: $200 per two-man team for the flight competition
- Flight expectation: one flight unless participation grows enough to justify multiple flights

## Confirmed Player Pool

Teams have not been formed yet. Current confirmed players:

| Player | HDCP | WHS Id |
| --- | ---: | --- |
| James Feutz | +0.6 | 5660746 |
| Eric Weiss | 0.4 | 9002584 |
| Jon Vrolyks | 4.8 | 464737 |
| Zane Eisenbarth | 5.4 | 11664981 |
| Paul Benga | 6.4 | 164216 |
| Michael Falagrady | 6.9 | 95016 |
| Travis Ingram | 6.9 | 3210029 |
| Mark Lewis | 9.4 | 8450232 |
| Shane Bolosan | 9.4 | 11994127 |
| Scott Lucas | 9.7 | TBD |
| Rich McKeon | 10.9 | TBD |
| Christopher Royce | 13.5 | 11809990 |
| Vasan Srinivasan | 15.1 | 401762 |
| Mark Albedyll | 16.0 | TBD |
| Patrick Schueppert | 16.5 | 11278400 |
| Robert Hill "Captain" | 19.4 | 11246342 |
| Eric Lamb | 26.2 | TBD |

## Weekend Logistics

- Everyone will gather at the club on Friday night, May 15, 2026, after the PGA Championship cut has been made.
- The group will try to secure the Flex Room for the Friday night gathering; details to follow.
- Friday night activities include drafting A/B PGA Championship players who make the cut and bidding on the Calcutta.
- Each two-man team will draft one A player and one B player from the eligible PGA Championship players who make the cut.
- The selected PGA Championship players' weekend scores from Round 3 and Round 4 will be added to each team's Sterling Grove golf scores for the flight competition.
- The group may meet again after the Sunday round to watch the finish of the PGA Championship and settle Calcutta payouts.
- Players need to send Christopher Royce who their partners will be.
- The field currently has 17 players, and the group should encourage additional participation.
- If a registered player knows someone who wants to play, that person should contact Christopher Royce or receive the Squabbit sign-up link and the WhatsApp group invite.

## Official Format

- Day 1 format: 2-man shamble.
- Day 1 date: Saturday, May 16, 2026.
- Day 1 tee shots: both players tee off, then the team selects the best drive.
- Day 1 play after selected drive: both players play their own ball from the selected drive location until holed.
- Day 1 scoring: both players' scores count on every hole.
- Day 1 team par: 144.
- Day 1 drive rule: no minimum drive requirement.
- Day 2 format: 2-man best ball.
- Day 2 date: Sunday, May 17, 2026.
- Day 2 scoring: each player plays his own ball, and the team's lower score on each hole counts.
- Day 2 team par: 72.
- Sterling Grove team weekend par: 216.
- Drafted A/B PGA player weekend par: 288.
- Main tournament total par: 504.
- Main tournament scoring: Sterling Grove team score plus selected A player and B player Round 3 and Round 4 scores from the PGA Championship.
- Pick-a-Pro format: each team drafts one A player and one B player on Friday night.
- Eligible pro pool: only PGA Championship players who make the cut are eligible for selection.
- A/B pools: the tournament committee will publish the A player list and B player list before Friday night selections begin.
- Multiple teams may select the same PGA Championship players.
- Only weekend professional scores count.
- Net scores follow USGA Rules of Golf and World Handicap System guidance, subject to any announced local event rules.

## Flight Competition

- Entry fee: $200 per two-man team.
- Flight structure: expected to be one flight because the field currently has 17 players.
- Target field: at least 20 players / 10 teams.
- If participation grows significantly, the committee can decide whether flights are needed.
- Final team count, purse, and payouts should be confirmed once teams are finalized.
- Final flight names, team assignments, and payouts should be confirmed once the team count is final.

## Calcutta

- The Calcutta will be run on Friday night, May 15, 2026, using the same format as the Masters Tournament.
- Auction coverage: one Calcutta across all flights.
- Auction opening bid: $50 per team.
- Auction increments: $25.
- Calcutta scoring: based on Sterling Grove team golf scores only, not the added PGA Championship pro scores.
- Buyback rule: if a team is not the highest bidder for itself, the team may buy back half of the winning bid.
- Calcutta payouts: 1st 50%, 2nd 25%, 3rd 15%, 4th 10%.
- Final dollar payouts will be calculated after the total Calcutta pot is known.

## Live Scoreboard Requirements

- The public website should include a live or updated scoreboard for tournament weekend.
- The scoreboard should show Sterling Grove team scores, drafted A/B PGA player scores, combined tournament standings, and Calcutta standings.
- Main tournament standings should include Sterling Grove team score plus drafted A/B PGA player weekend scores.
- Calcutta standings should use Sterling Grove team scores only.
- Calcutta display should include team cost, total pot, payout percentages, owner/buyer, buyback status, and projected/final payouts.
- The scoreboard should be hosted from an always-on system, preferably the Mac mini server, or published to a public static URL from the Mac mini.
- The first scoreboard build uses `PGA_Championship/data/scoreboard.json` as source data and `PGA_Championship/data/scoreboard-data.js` for the public website.
- The local admin editor is `PGA_Championship/scoreboard_admin.html`, with server support in `PGA_Championship/scoreboard_server.mjs`.
- The build should be finished locally first; once the scoreboard is roughly 90% complete, move the entire `SG_Majors` folder to the Mac mini and continue there.
- Implementation details are tracked in `live_scoreboard_plan_2026.md`.

## Rules and Scoring

- USGA Rules of Golf apply for the event.
- Net scoring must follow USGA/WHS handicap procedures unless a local tournament rule is announced before play.
- Day 1 placement rule: after the selected drive, both players place the ball within one club-length of the selected drive, not nearer the hole, and in the same condition.
- Day 1 shamble scoring: each player plays his own ball from the selected drive location until holed, and both balls count.
- Day 2 best ball scoring: each player plays his own ball, and the team's lower net score on each hole counts.
- Players should enter individual scores in the tournament scoring app so Saturday can count both balls and Sunday can count the team best ball.
- Ruling questions should be addressed by the tournament commissioners or committee.
- In case of confusion or doubt, players should play a second ball and have the ruling determined after the round.
- Tournament scores should not be posted to GHIN unless the committee determines the round is acceptable for posting.
- If a player is out of the hole, he should pick up to maintain pace of play.
- Otherwise, everyone should putt out. Failure to do so may result in disqualification.
- Paper scorecards and the tournament scoring app may both be used.
- The paper scorecard is final unless the committee announces a different official scoring source before play.
- Scorecards must be signed by both the competitor and marker and turned in immediately after the round.
- Pairings, tee times, and Sunday order of play should be set by the tournament committee after Saturday results.

## Handicapping Basis

- Course setup: Sterling Grove blue tees unless the committee announces otherwise.
- Saturday shamble handicap allowance should be confirmed by the committee before play.
- Sunday best ball handicap allowance should be confirmed by the committee before play.
- Course handicap should be calculated using the active Sterling Grove tee rating, slope, and par for the tees played.
- Handicaps should be locked the week of the event to prevent late changes.
- Net strokes should be allocated by hole handicap under USGA/WHS procedures.

## Friday Night A/B Player Draft

- The A/B player board should be finalized after the PGA Championship cut line is official.
- Only players who make the cut may be included on the board.
- The committee should separate the board into A players and B players before the draft begins.
- Each Sterling Grove team drafts one A player and one B player.
- A team keeps its selected pros for both Round 3 and Round 4.
- If a selected pro withdraws after the Friday night selection, the committee should decide whether a replacement is allowed before Round 3 begins.
- If no replacement is allowed, the withdrawn player's posted score or committee-assigned score should be applied consistently to every affected team.

## Tie Procedures

- Flight competition ties should be resolved using the Masters Tournament procedure unless the committee announces a PGA-specific procedure before play.
- Preferred tiebreak order:
- Day 2 back 9 net team score.
- Day 2 back 6 net team score.
- Day 2 back 3 net team score.
- Day 2 18th hole net team score.
- Committee decision or playoff, if needed.
- Calcutta ties should use Sterling Grove team golf scores only, because Calcutta scoring excludes PGA Championship pro scores.

## Files To Complete

- `pga_championship_players.csv`: confirmed player list, handicap indexes, and WHS IDs.
- `pga_championship_teams.csv`: team list, player names, flights, and handicaps once teams are formed.
- `pga_championship_pro_picks.csv`: Friday night A/B player selections and weekend pro scores.
- `pga_championship_scores.csv`: Sterling Grove Day 1 and Day 2 team scores.
- `pga_championship_calcutta_board.csv`: auction prices, owners, buybacks, and final payouts.
- `live_scoreboard_plan_2026.md`: implementation plan for the public scoreboard and Mac mini deployment.
- `data/scoreboard.json`: source data for teams, scores, PGA picks, and Calcutta.
- `data/scoreboard-data.js`: public website data file for the live scoreboard tab.
- `scoreboard_admin.html`: local admin editor for scoreboard updates.
- `scoreboard_server.mjs`: Mac mini server for saving and publishing scoreboard data.
