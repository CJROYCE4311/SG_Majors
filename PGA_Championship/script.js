document.querySelectorAll('.nav-btn').forEach((button) => {
    button.addEventListener('click', () => {
        const targetId = button.getAttribute('data-tab');

        document.querySelectorAll('.nav-btn').forEach((navButton) => {
            navButton.classList.remove('active');
        });

        document.querySelectorAll('.view-section').forEach((section) => {
            section.classList.remove('active');
        });

        button.classList.add('active');
        document.getElementById(targetId).classList.add('active');
    });
});

const scoreboardData = window.PGA_SCOREBOARD_DATA;

if (scoreboardData) {
    renderScoreboard(scoreboardData);
} else {
    setScoreboardEmptyState('Scoreboard data is not available yet.');
}

function renderScoreboard(data) {
    const teams = Array.isArray(data.teams) ? data.teams : [];
    const scoring = data.scoring || {};
    const calcutta = data.calcutta || {};
    const payouts = Array.isArray(calcutta.payouts) ? calcutta.payouts : [];
    const pot = teams.reduce((total, team) => total + moneyValue(team.calcutta?.auctionPrice) + moneyValue(team.calcutta?.buybackAmount), 0);
    const enrichedTeams = teams.map((team) => enrichTeam(team, scoring, payouts, pot));
    const mainRows = [...enrichedTeams].sort((a, b) => compareScores(a.mainTotal, b.mainTotal));
    const calcuttaRows = [...enrichedTeams].sort((a, b) => compareScores(a.sgTotal, b.sgTotal));

    setText('scoreboard-updated', formatDate(data.event?.lastUpdated));
    setText('scoreboard-status', data.event?.status || 'Scores will update here during tournament weekend.');
    setText('scoreboard-team-count', String(teams.length));
    setText('scoreboard-pot', formatMoney(pot));
    setText('scoreboard-tournament-par', String(scoring.tournamentPar || 504));

    renderMainLeaderboard(mainRows);
    renderCalcuttaBoard(calcuttaRows);
    renderPgaPicks(enrichedTeams);
}

function enrichTeam(team, scoring, payouts, pot) {
    const saturday = scoreValue(team.scores?.saturday);
    const sunday = scoreValue(team.scores?.sunday);
    const sgTotal = sumScores([saturday, sunday]);
    const proScores = [
        scoreValue(team.pros?.a?.round3),
        scoreValue(team.pros?.a?.round4),
        scoreValue(team.pros?.b?.round3),
        scoreValue(team.pros?.b?.round4),
    ];
    const proTotal = sumScores(proScores);
    const mainTotal = sumScores([sgTotal, proTotal]);
    const sgPar = completedPar([
        [saturday, scoring.saturday?.par || 144],
        [sunday, scoring.sunday?.par || 72],
    ]);
    const proPar = completedPar(proScores.map((score) => [score, 72]));
    const mainPar = sgPar + proPar;
    const projectedPayout = projectedPayoutForPlace(team.calcutta?.finalPlace, payouts, pot);

    return {
        ...team,
        saturday,
        sunday,
        sgTotal,
        proTotal,
        mainTotal,
        sgToPar: typeof sgTotal === 'number' && sgPar ? sgTotal - sgPar : null,
        mainToPar: typeof mainTotal === 'number' && mainPar ? mainTotal - mainPar : null,
        projectedPayout,
    };
}

function renderMainLeaderboard(teams) {
    const body = document.getElementById('main-leaderboard-body');
    if (!body) return;
    if (!teams.length) {
        body.innerHTML = emptyRow(9, 'Teams are not finalized yet.');
        return;
    }

    body.innerHTML = teams.map((team, index) => `
        <tr>
            <td>${rankLabel(team.mainTotal, index)}</td>
            <td class="font-bold">${escapeHtml(team.teamName || team.id || 'TBD')}</td>
            <td>${escapeHtml(formatPlayers(team.players))}</td>
            <td>${formatScore(team.saturday)}</td>
            <td>${formatScore(team.sunday)}</td>
            <td>${formatScore(team.sgTotal)}</td>
            <td>${formatScore(team.proTotal)}</td>
            <td class="font-bold">${formatScore(team.mainTotal)}</td>
            <td>${formatToPar(team.mainToPar)}</td>
        </tr>
    `).join('');
}

function renderCalcuttaBoard(teams) {
    const body = document.getElementById('calcutta-board-body');
    if (!body) return;
    if (!teams.length) {
        body.innerHTML = emptyRow(8, 'Calcutta bids will appear after Friday night auction.');
        return;
    }

    body.innerHTML = teams.map((team, index) => `
        <tr>
            <td>${rankLabel(team.sgTotal, index)}</td>
            <td class="font-bold">${escapeHtml(team.teamName || team.id || 'TBD')}</td>
            <td>${formatScore(team.sgTotal)}</td>
            <td>${formatToPar(team.sgToPar)}</td>
            <td>${escapeHtml(team.calcutta?.buyer || '--')}</td>
            <td>${formatMoney(team.calcutta?.auctionPrice)}</td>
            <td>${formatMoney(team.calcutta?.buybackAmount)}</td>
            <td class="font-bold">${formatMoney(team.projectedPayout)}</td>
        </tr>
    `).join('');
}

function renderPgaPicks(teams) {
    const body = document.getElementById('pga-picks-body');
    if (!body) return;
    if (!teams.length) {
        body.innerHTML = emptyRow(8, 'A/B PGA player picks will appear after the Friday night draft.');
        return;
    }

    body.innerHTML = teams.map((team) => `
        <tr>
            <td class="font-bold">${escapeHtml(team.teamName || team.id || 'TBD')}</td>
            <td>${escapeHtml(team.pros?.a?.name || '--')}</td>
            <td>${formatScore(team.pros?.a?.round3)}</td>
            <td>${formatScore(team.pros?.a?.round4)}</td>
            <td>${escapeHtml(team.pros?.b?.name || '--')}</td>
            <td>${formatScore(team.pros?.b?.round3)}</td>
            <td>${formatScore(team.pros?.b?.round4)}</td>
            <td>${formatScore(team.proTotal)}</td>
        </tr>
    `).join('');
}

function setScoreboardEmptyState(message) {
    setText('scoreboard-status', message);
    const emptyTables = [
        ['main-leaderboard-body', 9],
        ['calcutta-board-body', 8],
        ['pga-picks-body', 8],
    ];
    emptyTables.forEach(([id, colspan]) => {
        const body = document.getElementById(id);
        if (body) body.innerHTML = emptyRow(colspan, message);
    });
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

function scoreValue(value) {
    if (value === null || value === undefined || value === '') return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
}

function moneyValue(value) {
    const number = scoreValue(value);
    return typeof number === 'number' ? number : 0;
}

function sumScores(scores) {
    const valid = scores.filter((score) => typeof score === 'number');
    return valid.length ? valid.reduce((total, score) => total + score, 0) : null;
}

function completedPar(entries) {
    return entries.reduce((total, [score, par]) => total + (typeof score === 'number' ? par : 0), 0);
}

function compareScores(a, b) {
    if (typeof a !== 'number' && typeof b !== 'number') return 0;
    if (typeof a !== 'number') return 1;
    if (typeof b !== 'number') return -1;
    return a - b;
}

function projectedPayoutForPlace(place, payouts, pot) {
    const match = payouts.find((payout) => Number(payout.place) === Number(place));
    return match ? pot * Number(match.percent || 0) : null;
}

function rankLabel(score, index) {
    return typeof score === 'number' ? String(index + 1) : '--';
}

function formatPlayers(players) {
    return Array.isArray(players) && players.length ? players.join(' / ') : '--';
}

function formatScore(value) {
    const number = scoreValue(value);
    return typeof number === 'number' ? String(number) : '--';
}

function formatToPar(value) {
    if (typeof value !== 'number') return '--';
    if (value === 0) return 'E';
    return value > 0 ? `+${value}` : String(value);
}

function formatMoney(value) {
    const number = scoreValue(value);
    if (typeof number !== 'number') return '--';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(number);
}

function formatDate(value) {
    if (!value) return '--';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(date);
}

function emptyRow(colspan, message) {
    return `<tr><td colspan="${colspan}" class="empty-state">${escapeHtml(message)}</td></tr>`;
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
