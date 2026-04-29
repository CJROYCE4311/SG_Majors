const data = window.MASTERS_SCOREBOARD_DATA;

if (!data) {
    throw new Error('Masters scoreboard data is missing.');
}

const teams = data.teams.map(enrichTeam);
const flights = [...new Set(teams.map((team) => team.flight))];
const calcuttaRows = [...teams].sort((a, b) => a.sgTotal - b.sgTotal || a.teamName.localeCompare(b.teamName));

setText('event-status', data.event.status);
setText('event-updated', `Updated ${formatDate(data.event.lastUpdated)}`);
setText('team-count', String(teams.length));
setText('calcutta-pot', formatMoney(data.calcutta.pot));
setText('team-par', String(data.scoring.teamPar));
setText('total-par', String(data.scoring.tournamentPar));

renderFlights();
renderCalcutta();
renderCalcuttaPayouts();
renderPros();

function enrichTeam(team) {
    const sgTotal = team.scores.day1 + team.scores.day2;
    const proTotal = team.pros.a.round3 + team.pros.a.round4 + team.pros.b.round3 + team.pros.b.round4;
    const total = team.total || sgTotal + proTotal;

    return {
        ...team,
        sgTotal,
        sgToPar: sgTotal - data.scoring.teamPar,
        proTotal,
        total,
        totalToPar: total - data.scoring.tournamentPar,
    };
}

function renderFlights() {
    const target = document.getElementById('flight-leaderboards');
    target.innerHTML = flights.map((flight) => {
        const flightTeams = teams
            .filter((team) => team.flight === flight)
            .sort((a, b) => a.total - b.total || a.teamName.localeCompare(b.teamName));

        return `
            <div class="card glass-panel scoreboard-card">
                <div class="flight-title-row">
                    <h3 class="card-title">${escapeHtml(flight)} Flight</h3>
                    <span class="badge">${flightTeams.length} teams</span>
                </div>
                <div class="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Team</th>
                                <th>Day 1</th>
                                <th>Day 2</th>
                                <th>SG Total</th>
                                <th>Pros</th>
                                <th>Pro Total</th>
                                <th>Total</th>
                                <th>To Par</th>
                                <th>Payout</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${flightTeams.map(renderFlightRow).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }).join('');
}

function renderFlightRow(team) {
    return `
        <tr>
            <td><span class="badge ${team.flightRank === '1' ? 'badge-gold' : ''}">${escapeHtml(team.flightRank)}</span></td>
            <td class="team-cell">
                <div class="team-name">${escapeHtml(team.teamName)}</div>
                <div class="team-detail">${escapeHtml(team.players.join(' / '))}</div>
                ${team.note ? `<div class="team-detail">${escapeHtml(team.note)}</div>` : ''}
            </td>
            <td><span class="score-pill">${team.scores.day1}</span></td>
            <td><span class="score-pill">${team.scores.day2}</span></td>
            <td>${team.sgTotal}</td>
            <td>
                <div>${escapeHtml(team.pros.a.name)}</div>
                <div class="team-detail">${escapeHtml(team.pros.b.name)}</div>
            </td>
            <td>${team.proTotal}</td>
            <td class="font-bold">${team.total}</td>
            <td>${formatToPar(team.totalToPar)}</td>
            <td class="money">${team.flightPayout ? formatMoney(team.flightPayout) : '-'}</td>
        </tr>
    `;
}

function renderCalcutta() {
    const target = document.getElementById('calcutta-body');
    target.innerHTML = calcuttaRows.map((team) => `
        <tr>
            <td><span class="badge ${team.calcutta.finalPlace === 1 ? 'badge-gold' : ''}">${escapeHtml(team.calcutta.rank)}</span></td>
            <td class="team-cell">
                <div class="team-name">${escapeHtml(team.teamName)}</div>
                <div class="team-detail">${escapeHtml(team.players.join(' / '))}</div>
            </td>
            <td>${escapeHtml(team.flight)}</td>
            <td>${escapeHtml(team.players.join(' / '))}</td>
            <td>${team.scores.day1}</td>
            <td>${team.scores.day2}</td>
            <td class="font-bold">${team.sgTotal}</td>
            <td>${formatToPar(team.sgToPar)}</td>
            <td>${escapeHtml(team.calcutta.owner)}</td>
            <td class="money">${formatMoney(team.calcutta.auctionPrice)}</td>
            <td class="money">${team.calcutta.payout ? formatMoney(team.calcutta.payout) : '-'}</td>
        </tr>
    `).join('');
}

function renderCalcuttaPayouts() {
    const target = document.getElementById('calcutta-payouts-body');
    target.innerHTML = data.calcutta.payouts.map((payout) => `
        <tr>
            <td>${escapeHtml(payout.label)} (${Math.round(payout.percent * 100)}%)</td>
            <td class="team-name">${escapeHtml(payout.team)}</td>
            <td>${escapeHtml(payout.owner)}</td>
            <td class="money">${formatMoney(payout.payout)}</td>
        </tr>
    `).join('');
}

function renderPros() {
    const target = document.getElementById('pros-body');
    target.innerHTML = [...data.proScores]
        .sort((a, b) => a.total - b.total || a.name.localeCompare(b.name))
        .map((pro) => `
            <tr>
                <td class="team-name">${escapeHtml(pro.name)}</td>
                <td>${pro.round3}</td>
                <td>${pro.round4}</td>
                <td class="font-bold">${pro.total}</td>
                <td>${formatToPar(pro.total - 144)}</td>
            </tr>
        `).join('');
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

function formatMoney(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(value);
}

function formatToPar(value) {
    if (value === 0) return 'E';
    return value > 0 ? `+${value}` : String(value);
}

function formatDate(value) {
    const date = new Date(value);
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(date);
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
