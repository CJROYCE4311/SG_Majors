// Data Models
const tigerData = [
  { rank: "1", team: "Team DeLaFunk", players: "Greg Funk, Jeff De Laveaga", hcp: "5.1", proA: "Cameron Young", proB: "Russell Henley", day1: 67, day2: 64, total: 403, payout: "$1,200" },
  { rank: "2", team: "Team Sticks", players: "James Feutz, Nate Adams", hcp: "-6.4", proA: "Scottie Scheffler", proB: "John Rahm", day1: 64, day2: 66, total: 404, payout: "$500" },
  { rank: "3", team: "Team Down The Middle", players: "Kiernan Mattson, Matt Pullen", hcp: "3.4", proA: "Xander Schauffele", proB: "Jordan Spieth", day1: 66, day2: 69, total: 411, payout: "$300" },
  { rank: "4", team: "Team Winning", players: "Christopher Royce, Justin Deuker", hcp: "15.8", proA: "Justin Rose", proB: "John Rahm", day1: 65, day2: 69, total: 414, payout: "-" },
  { rank: "5", team: "Team Foot Wedge", players: "Mike Muller, Zane Eisenbarth", hcp: "12.5", proA: "Scottie Scheffler", proB: "John Rahm", day1: 69, day2: 73, total: 416, payout: "-" },
  { rank: "6", team: "Team Vanilla Slice", players: "Korey Jerome, Travis Ingram", hcp: "16.3", proA: "Patrick Reed", proB: "Patrick Cantlay", day1: 69, day2: 66, total: 419, payout: "-" },
  { rank: "T-7", team: "Pink Lady", players: "Eric Weiss, Ron Marino", hcp: "7.2", proA: "Patrick Reed", proB: "Patrick Cantlay", day1: 64, day2: 72, total: 420, payout: "-" },
  { rank: "T-7", team: "Team Beard", players: "Derek Becko, Dusty Wasmund", hcp: "10.5", proA: "Patrick Reed", proB: "Patrick Cantlay", day1: 67, day2: 69, total: 420, payout: "-" },
  { rank: "T-9", team: "Team Timex", players: "Jon Vrolyks, Nick Rucci", hcp: "17.5", proA: "Rory McIlroy", proB: "John Rahm", day1: 64, day2: 73, total: 422, payout: "-" },
  { rank: "T-9", team: "Team Low Expectations", players: "Michael Falagrady, Paul Benga", hcp: "12.0", proA: "Rory McIlroy", proB: "John Rahm", day1: 70, day2: 67, total: 422, payout: "-" },
];

const roryData = [
  { rank: "1", team: "Papa Becko And The Bomber", players: "Joe Becko, Scott Lucas", hcp: "21.9", proA: "Scottie Scheffler", proB: "Victor Hovland", day1: 65, day2: 68, total: 404, payout: "$1,200" },
  { rank: "T-2", team: "Team Docks To Docs", players: "Larry Caplan, Wayne Fellows", hcp: "28.1", proA: "Scottie Scheffler", proB: "John Rahm", day1: 74, day2: 66, total: 414, payout: "Won Playoff" },
  { rank: "T-2", team: "Team 5 O'Clock Somewhere", players: "Mark Lewis, Patrick Schueppert", hcp: "25.8", proA: "Scottie Scheffler", proB: "Victor Hovland", day1: 71, day2: 72, total: 414, payout: "Lost Playoff" },
  { rank: "4", team: "Patty Ice And The Scrabble Rack", players: "Mark Szostkiewicz, Pat Jarrett", hcp: "19.3", proA: "Justin Rose", proB: "Jordan Spieth", day1: 68, day2: 71, total: 416, payout: "-" },
  { rank: "5", team: "Team Sand", players: "Jim Restivo, Steve Wilson", hcp: "25.5", proA: "Ludvig Aberg", proB: "Victor Hovland", day1: 69, day2: 69, total: 417, payout: "-" },
  { rank: "6", team: "Team Index", players: "Kevin Barber, Robert Hill", hcp: "36.6", proA: "Cameron Young", proB: "Marco Penge", day1: 69, day2: 67, total: 423, payout: "-" },
  { rank: "7", team: "Team Rough Extractions", players: "Kevin Mueller, Trevor Bellows", hcp: "17.9", proA: "Wyndham Clark", proB: "Patrick Cantlay", day1: 70, day2: 71, total: 425, payout: "-" },
  { rank: "8", team: "Team Beat LA", players: "Jeff Cloepfil, Steve McCormick", hcp: "20.3", proA: "Patrick Reed", proB: "Justin Thomas", day1: 70, day2: 67, total: 426, payout: "-" },
  { rank: "9", team: "Team Island Time", players: "JC Mason, Shane Bolosan", hcp: "22.1", proA: "Rory McIlroy", proB: "Sungjae Im", day1: 68, day2: 70, total: 428, payout: "-" },
  { rank: "10", team: "Team 20", players: "Brad Ackley, Rob Oliver", hcp: "32.0", proA: "Rory McIlroy", proB: "Marco Penge", day1: 69, day2: 72, total: 434, payout: "-" },
];

const calcuttaPayoutData = [
  { place: "1st", team: "Team Sticks", owner: "Feutz", payout: "$3,150" },
  { place: "2nd", team: "Team DeLaFunk", owner: "Royce", payout: "$1,575" },
  { place: "3rd", team: "Papa Becko And The Bomber", owner: "Bellows", payout: "$945" },
  { place: "4th", team: "Team Winning", owner: "DeLaveaga", payout: "$630" }
];

const calcuttaBoardData = [
  { rank: "1", team: "Team Down The Middle", owner: "Restivo", price: "$500" },
  { rank: "2", team: "Pink Lady", owner: "Lewis", price: "$400" },
  { rank: "3", team: "Team DeLaFunk", owner: "Royce", price: "$325" },
  { rank: "4", team: "Team Sticks", owner: "Feutz", price: "$500" },
  { rank: "5", team: "Team Low Expectations", owner: "Lewis", price: "$400" },
  { rank: "6", team: "Team Vanilla Slice", owner: "Ingram", price: "$300" },
  { rank: "7", team: "Team Foot Wedge", owner: "Jon", price: "$350" },
  { rank: "8", team: "Team Timex", owner: "Jon", price: "$425" },
  { rank: "9", team: "Team Beard", owner: "Dusty", price: "$275" },
  { rank: "10", team: "Team 5 O'Clock Somewhere", owner: "Restivo", price: "$300" },
  { rank: "11", team: "Team Rough Extractions", owner: "Royce", price: "$275" },
  { rank: "12", team: "Team Winning", owner: "DeLaveaga", price: "$450" },
  { rank: "13", team: "Papa Becko And The Bomber", owner: "Bellows", price: "$375" },
  { rank: "14", team: "Team Index", owner: "Bellows", price: "$125" },
  { rank: "15", team: "Patty Ice And The Scrabble Rack", owner: "Jarrett", price: "$175" },
  { rank: "16", team: "Team Beat LA", owner: "Jon", price: "$200" },
  { rank: "17", team: "Team Island Time", owner: "Bolosan", price: "$200" },
  { rank: "18", team: "Team Sand", owner: "Jon", price: "$250" },
  { rank: "19", team: "Team Docks To Docs", owner: "Jarrett", price: "$250" },
  { rank: "20", team: "Team 20", owner: "DeLaveaga", price: "$225" },
];

const proScoresData = [
  { pro: "Scottie Scheffler", r3: 65, r4: 68, total: 133 },
  { pro: "Russell Henley", r3: 66, r4: 68, total: 134 },
  { pro: "Xander Schauffele", r3: 70, r4: 68, total: 138 },
  { pro: "Cameron Young", r3: 65, r4: 73, total: 138 },
  { pro: "Jordan Spieth", r3: 70, r4: 68, total: 138 },
  { pro: "Victor Hovland", r3: 71, r4: 67, total: 138 },
  { pro: "Patrick Cantlay", r3: 66, r4: 73, total: 139 },
  { pro: "Justin Rose", r3: 69, r4: 70, total: 139 },
  { pro: "John Rahm", r3: 73, r4: 68, total: 141 },
  { pro: "Ludvig Aberg", r3: 69, r4: 72, total: 141 },
  { pro: "Justin Thomas", r3: 71, r4: 73, total: 144 },
  { pro: "Rory McIlroy", r3: 73, r4: 71, total: 144 },
  { pro: "Wyndham Clark", r3: 72, r4: 73, total: 145 },
  { pro: "Patrick Reed", r3: 72, r4: 73, total: 145 },
  { pro: "Sungjae Im", r3: 69, r4: 77, total: 146 },
  { pro: "Marco Penge", r3: 71, r4: 78, total: 149 },
];

function buildFlightTable(data) {
  let html = `<div style="overflow-x:auto;">
    <table>
      <thead>
        <tr>
          <th>Rank</th>
          <th>Team / Players</th>
          <th class="text-center">HCP</th>
          <th>Pro A / B</th>
          <th class="text-center">D1/D2</th>
          <th class="text-center font-bold">Total</th>
          <th class="text-right">Payout</th>
        </tr>
      </thead>
      <tbody>`;
  
  data.forEach(row => {
    let rowHtml = `<tr>
      <td><span class="badge ${row.rank === '1' ? 'badge-gold' : ''}">${row.rank}</span></td>
      <td>
        <div class="font-bold text-gold">${row.team}</div>
        <div style="font-size: 0.8rem; color: var(--text-muted)">${row.players}</div>
      </td>
      <td class="text-center">${row.hcp}</td>
      <td>
        <div style="font-size: 0.9rem">${row.proA}</div>
        <div style="font-size: 0.8rem; color: var(--text-muted)">${row.proB}</div>
      </td>
      <td class="text-center">
        ${row.day1} / ${row.day2}
      </td>
      <td class="text-center font-bold" style="font-size: 1.1rem">${row.total}</td>
      <td class="text-right font-bold text-gold">${row.payout}</td>
    </tr>`;
    html += rowHtml;
  });

  html += `</tbody></table></div>`;
  return html;
}

function buildSimpleTable(headers, data, keys) {
    let html = `<div style="overflow-x:auto;">
    <table>
      <thead>
        <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
      </thead>
      <tbody>`;
    data.forEach(row => {
        html += `<tr>${keys.map(k => `<td>${row[k]}</td>`).join('')}</tr>`;
    });
    html += `</tbody></table></div>`;
    return html;
}

// Initialize tables
document.getElementById('tiger-flight-table').innerHTML = buildFlightTable(tigerData);
document.getElementById('rory-flight-table').innerHTML = buildFlightTable(roryData);
document.getElementById('calcutta-payouts').innerHTML = buildSimpleTable(
    ['Place', 'Team', 'Owner', 'Payout'], calcuttaPayoutData, ['place', 'team', 'owner', 'payout']
);
document.getElementById('calcutta-board').innerHTML = buildSimpleTable(
    ['Rank', 'Team', 'Owner', 'Price'], calcuttaBoardData, ['rank', 'team', 'owner', 'price']
);
document.getElementById('pro-scores-table').innerHTML = buildSimpleTable(
    ['Pro', 'Round 3', 'Round 4', 'Total'], proScoresData, ['pro', 'r3', 'r4', 'total']
);

// Tab Navigation logic
document.querySelectorAll('.nav-btn').forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        // Hide all views
        document.querySelectorAll('.view-section').forEach(view => view.classList.remove('active'));
        
        // Add active class to clicked button
        button.classList.add('active');
        // Show corresponding view
        const targetId = button.getAttribute('data-tab');
        document.getElementById(targetId).classList.add('active');
    });
});
