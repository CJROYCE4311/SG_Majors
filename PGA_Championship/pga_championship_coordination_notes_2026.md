# 2026 PGA Championship Coordination Notes

## Leadership Handoff

- Paul Benga is busy at work and asked Eric Weiss and Christopher Royce to take the lead on organizing this tournament.
- Eric Weiss and Christopher Royce will coordinate player communication, tee-time coverage, team formation, and tournament setup details.
- Paul Benga remains part of the player pool unless he later confirms otherwise.

## Event Snapshot

- Event: 2026 PGA Championship Invitational at Sterling Grove Country Club
- Tournament rounds: Saturday, May 16, 2026 and Sunday, May 17, 2026
- Format: 2-man teams; Saturday shamble with both balls counting, Sunday best ball
- Current status: 19 players are registered; four two-man teams are assigned and tee times still need to be finalized

## Confirmed Registered Players

| Player | Handicap Index | WHS Id |
| --- | ---: | --- |
| James Feutz | +0.6 | 5660746 |
| Eric Weiss | 0.4 | 9002584 |
| Ron Marino | 4.4 | TBD |
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
| Mike Wilkins | 15.3 | 2669992 |
| Mark Albedyll | 16.0 | TBD |
| Patrick Schueppert | 16.5 | 11278400 |
| Robert Hill "Captain" | 19.4 | 11246342 |
| Eric Lamb | 26.2 | TBD |

## Member Directory Contact Info

Pulled from the Sterling Grove member directory for PGA Championship coordination. Use only for tournament communication.

| Player | Directory Match | Home | Cell | Email | Notes |
| --- | --- | --- | --- | --- | --- |
| James Feutz | Mr. James Feutz | 2533801401 | 253-380-1401 | jamesfeutzgolf@gmail.com |  |
| Eric Weiss | Eric Weiss |  | 6232623835 | ericweiss1019@gmail.com |  |
| Ron Marino | TBD |  |  |  | Verify member directory contact information. |
| Jon Vrolyks | Not found |  |  |  | No matching Vrolyks/Vrolyk record found in member directory search. |
| Zane Eisenbarth | Mr. Zane Eisenbarth |  | 315-491-0614 | zane.eisenbarth@yahoo.com |  |
| Paul Benga | Mr Paul Benga |  | 480-620-2088 | benga7@gmail.com |  |
| Michael Falagrady | Michael Falagrady |  | 303-520-9579 | llndrennen@gmail.com |  |
| Travis Ingram | Mr. Travis Ingram | 5035543556 | 5035543556 | travisi4@yahoo.com |  |
| Mark Lewis | Mr. Mark Lewis |  | (330) 354-9100 | m.lewis@unitedforgrowthinc.com |  |
| Shane Bolosan | Mr Shane Bolosan |  | 480-319-4645 | shane.bolosan@gmail.com |  |
| Scott Lucas | Scott Lucas |  | 503.752.0247 | merlefan@yahoo.com |  |
| Rich McKeon | Richard McKeon |  | 3104907416 | richmckeon@gmail.com | Directory uses Richard. |
| Christopher Royce | Christopher Royce | 719.510.4311 |  | christopher.royce@gmail.com |  |
| Vasan Srinivasan | Possible match: Kumar Srinivasan |  | 917.833.7769 | kumar.srinivasan2@gmail.com | No exact Vasan record found; verify before using. |
| Mike Wilkins | TBD |  |  |  | Verify member directory contact information. |
| Mark Albedyll | Mark Albedyll |  | 206-321-1911 | malbedyll@yahoo.com |  |
| Patrick Schueppert | Mr. Patrick Schueppert | 480-469-2552 | 702-499-6923 | pschueppert2@gmail.com |  |
| Robert Hill "Captain" | Mr. Robert Hill |  | 623-256-2407 | hankhill34@gmail.com |  |
| Eric Lamb | Mr Eric Lamb |  | 916-709-3832 | e.lamb44@gmail.com |  |

## Tournament Format Update

- Friday night: meet at the club after the PGA Championship cut to draft A and B PGA players who make the cut and bid on the Calcutta.
- Friday room plan: try to secure the Flex Room for the Friday night gathering; details to follow.
- Saturday format: 2-man shamble.
- Saturday tee shots: both players tee off, then the team chooses the best drive.
- Saturday play after selected drive: both players play their own ball from the selected drive location until holed.
- Saturday scoring: both balls count on every hole.
- Saturday team par: 144.
- Saturday drive rule: no 6-drive requirement.
- Sunday format: 2-man best ball.
- Sunday scoring: both players play their own ball, and the team's lower score on each hole counts.
- Sunday team par: 72.
- Sterling Grove team weekend par: 216.
- Drafted A/B PGA player weekend par: 280.
- Main tournament total par: 496.
- Main tournament standings include Sterling Grove team scores plus drafted A/B PGA player weekend scores.
- Calcutta standings are based only on Sterling Grove team scores.
- Players should enter individual scores in the scoring app so Saturday can count both balls and Sunday can count best ball correctly.

## Live Scoreboard Plan

- Build a public scoreboard for tournament weekend that players can view from a shared URL.
- Include the combined tournament leaderboard:
  - Sterling Grove Saturday shamble score
  - Sterling Grove Sunday best-ball score
  - A player Saturday/Sunday score
  - B player Saturday/Sunday score
  - combined score and score to par
- Include the Calcutta leaderboard:
  - team
  - players
  - buyer / owner
  - auction cost
  - buyback status
  - total pot
  - payout percentages
  - projected or final payouts
- Use one flight unless the field grows enough to justify flights.
- Current operator workflow:
  - update `pga_championship_control.xlsx` or the canonical CSV files
  - run `node scripts/update-pga-scoreboard-from-workbook.mjs`
  - validate the generated scoreboard locally
  - commit and publish the generated public site data
- Canonical score data now lives in:
  - `pga_championship_teams.csv`
  - `pga_championship_scores.csv`
  - `pga_championship_pro_picks.csv`
  - `pga_championship_pro_scores.csv`
  - `pga_championship_calcutta_board.csv`
  - `pga_championship_payouts.csv`
- The browser admin prototype is no longer the preferred update path. Accuracy comes from workbook/CSV review plus script validation.
- See `live_scoreboard_plan_2026.md` for the full implementation and deployment plan.

## Tee-Time Booking Plan

- Tee times need to be booked 2 weeks ahead of time for both tournament rounds.
- Saturday tournament round: Saturday, May 16, 2026.
- Saturday tee-time booking target: Saturday, May 2, 2026.
- Sunday tournament round: Sunday, May 17, 2026.
- Sunday tee-time booking target: Sunday, May 3, 2026.
- Players should secure tee times themselves and offer those tee times for tournament use.
- Any player who books a tee time should immediately post the day, time, and available spots in the WhatsApp group.
- Eric and Christopher should track which tee times are secured and confirm whether each time is suitable for tournament play.

## WhatsApp Group To Create

- Create a new WhatsApp group for the registered PGA Championship players.
- Suggested group name: `SG PGA Championship 2026`
- Add all confirmed registered players listed above.
- Use the group to coordinate:
  - tee times for Saturday, May 16, 2026
  - tee times for Sunday, May 17, 2026
  - 2-man team pairings
  - any players still needing a partner
  - Friday night pick-a-pro and Calcutta details
  - Saturday and Sunday scoring logistics
  - additional players who may want to join

## Immediate Action Checklist

- Create the WhatsApp group.
- Add every confirmed registered player.
- Send the tee-time and team-pairing reminder message.
- Try to secure the Flex Room for the Friday night draft and Calcutta.
- Ask players who can book tee times to claim Saturday, Sunday, or both.
- Record every secured tee time with the booking player, date, time, and foursome slots.
- Ask players to pair into 2-man teams and post their team in the WhatsApp group.
- Identify any unpaired players and help match them.
- Ask players to send Christopher Royce their confirmed partner.
- Encourage more participation from anyone who knows another member who wants to play.
- Share the Squabbit sign-up link and WhatsApp group invite with interested eligible players.
- Update `pga_championship_teams.csv` once teams are confirmed.
- Update the main tournament Markdown file once tee times and teams are final.

## WhatsApp Reminder Message Draft

Hey guys - quick PGA Championship update.

Paul is buried with work right now, so Eric and I are going to help take the lead on getting this tournament organized.

Format update:

- Friday night we will meet at the club after the PGA cut to draft the A and B PGA players who make the cut and bid on the Calcutta.
- We are going to try to secure the Flex Room for Friday night. Details to follow.
- Saturday will be a 2-man shamble. Both players tee off, the team picks the best drive, then both players play their own ball in. Both balls count, so Saturday is par 144. No 6-drive requirement.
- Sunday will be 2-man best ball, par 72.

The biggest thing we need right away is tee times. Our tournament rounds are Saturday, May 16 and Sunday, May 17, and tee times need to be booked 2 weeks ahead:

- Saturday round tee times open / need to be booked on Saturday, May 2
- Sunday round tee times open / need to be booked on Sunday, May 3

If you are able to grab a tee time for either day, please do it and post the day/time in this chat so we can track what we have available for the tournament.

Also, please start pairing up into 2-man teams. Once you have a team, send me both player names or post them here. If you need a partner, just say so and we will help match people up.

We have 19 players as of now, with four teams assigned, and would love to get more participation. If you know someone who wants to play, have them contact me, or send them the Squabbit sign-up link and the WhatsApp group invite.

Thanks everyone.

## Tee-Time Tracking Table

| Round | Tournament Date | Booking Target | Tee Time | Booked By | Players / Spots | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Saturday | May 16, 2026 | May 2, 2026 | TBD | TBD | TBD | Needed |
| Sunday | May 17, 2026 | May 3, 2026 | TBD | TBD | TBD | Needed |

## Team Tracking Table

| Team | Player 1 | Player 2 | Status |
| --- | --- | --- | --- |
| Benga and Ingram | Paul Benga | Travis Ingram | Confirmed |
| Royce and Lewis | Christopher Royce | Mark Lewis | Confirmed |
| Weiss and Marino | Eric Weiss | Ron Marino | Confirmed |
| Bolosan and Wilkins | Shane Bolosan | Mike Wilkins | Confirmed |
| TBD 1 | James Feutz | TBD | Needs partner |
| TBD 2 | Jon Vrolyks | TBD | Needs partner |
| TBD 3 | Zane Eisenbarth | TBD | Needs partner |
| TBD 4 | Michael Falagrady | TBD | Needs partner |
| TBD 5 | Scott Lucas | TBD | Needs partner |
| TBD 6 | Rich McKeon | TBD | Needs partner |
| TBD 7 | Vasan Srinivasan | TBD | Needs partner |
| TBD 8 | Mark Albedyll | TBD | Needs partner |
| TBD 9 | Patrick Schueppert | TBD | Needs partner |
| TBD 10 | Robert Hill "Captain" | TBD | Needs partner |
| TBD 11 | Eric Lamb | TBD | Needs partner |
