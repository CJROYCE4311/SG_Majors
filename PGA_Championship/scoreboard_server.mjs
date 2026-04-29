import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { createReadStream } from 'node:fs';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(root, '..');
const host = process.env.SCOREBOARD_HOST || '127.0.0.1';
const port = Number(process.env.SCOREBOARD_PORT || 4173);
const adminToken = process.env.SCOREBOARD_ADMIN_TOKEN || '';

const contentPath = join(root, 'content', 'site-content.json');
const indexPath = join(root, 'index.html');
const markdownPath = join(root, 'sterling_grove_pga_championship_2026.md');
const jsonPath = join(root, 'data', 'scoreboard.json');
const jsPath = join(root, 'data', 'scoreboard-data.js');

const managedFiles = [
    'PGA_Championship/content/site-content.json',
    'PGA_Championship/index.html',
    'PGA_Championship/sterling_grove_pga_championship_2026.md',
    'PGA_Championship/data/scoreboard.json',
    'PGA_Championship/data/scoreboard-data.js',
];

const contentTypes = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
};

if (process.argv.includes('--render')) {
    const content = await readSiteContent();
    await renderSiteContent(content);
    console.log('Rendered PGA public page and markdown from content/site-content.json');
    process.exit(0);
}

const server = createServer(async (request, response) => {
    try {
        const url = new URL(request.url, `http://${request.headers.host || `${host}:${port}`}`);

        if (request.method === 'GET' && url.pathname === '/api/scoreboard') {
            return sendJson(response, await readScoreboard());
        }

        if (request.method === 'POST' && url.pathname === '/api/scoreboard') {
            requireAdmin(request);
            const data = JSON.parse(await readBody(request));
            validateScoreboard(data);
            await writeScoreboard(data);
            return sendJson(response, { ok: true, message: 'Scoreboard data saved.' });
        }

        if (request.method === 'GET' && url.pathname === '/api/site-content') {
            requireAdmin(request);
            return sendJson(response, await readSiteContent());
        }

        if (request.method === 'POST' && url.pathname === '/api/site-content') {
            requireAdmin(request);
            const content = JSON.parse(await readBody(request));
            validateSiteContent(content);
            const normalized = await writeSiteContent(content);
            await renderSiteContent(normalized);
            return sendJson(response, {
                ok: true,
                message: 'Site content saved and public files regenerated.',
                updatedAt: normalized.updatedAt,
            });
        }

        if (request.method === 'POST' && url.pathname === '/api/publish') {
            requireAdmin(request);
            const unexpectedStagedFiles = (await stagedFiles()).filter((file) => !managedFiles.includes(file));
            if (unexpectedStagedFiles.length) {
                throw httpError(409, `Publish blocked because unrelated files are already staged: ${unexpectedStagedFiles.join(', ')}`);
            }
            await git(['add', ...managedFiles]);
            if (!(await hasStagedChanges())) {
                return sendJson(response, { ok: true, message: 'No managed PGA changes to publish.' });
            }
            const timestamp = new Date().toISOString();
            await git(['commit', '-m', `Update PGA site content ${timestamp}`]);
            await git(['push']);
            return sendJson(response, { ok: true, message: 'Committed and pushed managed PGA changes.' });
        }

        if (request.method !== 'GET') {
            return sendText(response, 405, 'Method not allowed');
        }

        return await serveStatic(url.pathname === '/' ? '/index.html' : url.pathname, response);
    } catch (error) {
        const status = error.statusCode || 500;
        return sendText(response, status, error.message || 'Server error');
    }
});

server.listen(port, host, () => {
    console.log(`PGA admin server running at http://${host}:${port}`);
    console.log('Set SCOREBOARD_ADMIN_TOKEN before saving, loading private content, or publishing.');
});

async function readScoreboard() {
    return JSON.parse(await readFile(jsonPath, 'utf8'));
}

async function writeScoreboard(data) {
    const normalized = {
        ...data,
        event: {
            ...(data.event || {}),
            lastUpdated: new Date().toISOString(),
        },
    };
    await writeFile(jsonPath, `${JSON.stringify(normalized, null, 2)}\n`);
    await writeFile(jsPath, `window.PGA_SCOREBOARD_DATA = ${JSON.stringify(normalized, null, 2)};\n`);
}

async function readSiteContent() {
    return JSON.parse(await readFile(contentPath, 'utf8'));
}

async function writeSiteContent(content) {
    const normalized = {
        ...content,
        updatedAt: new Date().toISOString(),
    };
    await mkdir(dirname(contentPath), { recursive: true });
    await writeFile(contentPath, `${JSON.stringify(normalized, null, 2)}\n`);
    return normalized;
}

async function renderSiteContent(content) {
    let html = await readFile(indexPath, 'utf8');
    html = replaceSection(html, 'overview', renderOverviewSection(content));
    html = replaceSection(html, 'players', renderPlayersSection(content));
    html = replaceSection(html, 'format', renderFormatSection(content));
    html = replaceSection(html, 'pickapro', renderPickAProSection(content));
    html = replaceSection(html, 'calcutta', renderCalcuttaSection(content));
    html = replaceSection(html, 'scoreboard', renderScoreboardSection(content));
    html = replaceSection(html, 'rules', renderRulesSection(content));
    await writeFile(indexPath, html);
    await writeFile(markdownPath, renderMarkdown(content));
}

function renderOverviewSection(content) {
    const overview = content.overview || {};
    const stats = asArray(overview.stats);
    const snapshot = asArray(overview.snapshot);

    return `<section id="overview" class="view-section active">
                    <h3 class="section-title">Overview</h3>
                    <div class="stats-grid">
${stats.map((stat) => `                        <div class="stat-card glass-panel${stat.highlight ? ' highlight-pulse' : ''}">
                            <h4>${escapeHtml(stat.label)}</h4>
                            <div class="stat-value text-gold" style="font-size: 1.8rem;">${escapeHtml(templateText(stat.value, content))}</div>
                            <p class="stat-sub">${escapeHtml(templateText(stat.sub, content))}</p>
                        </div>`).join('\n')}
                    </div>

                    <div class="card glass-panel mt-8" style="padding: 1.5rem;">
                        <h3 class="card-title">Event Snapshot</h3>
                        <ul class="info-list">
${renderLabelList(snapshot, 28)}
                        </ul>
                    </div>
                </section>`;
}

function renderPlayersSection(content) {
    const teams = teamRows(content);
    const playerCount = countTeamPlayers(content);
    return `<section id="players" class="view-section">
                    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 1.5rem;">
                        <h3 class="section-title" style="margin-bottom: 0;">Teams and Players</h3>
                        <span class="badge badge-gold">${playerCount} players</span>
                    </div>
                    <div class="card glass-panel">
                        <div style="padding: 1.5rem; border-bottom: 1px solid var(--border);">
                            <p>${escapeHtml(content.players?.intro)}</p>
                        </div>
                        <div style="overflow-x: auto;">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Team</th>
                                        <th>Player 1</th>
                                        <th>P1 HDCP</th>
                                        <th>Player 2</th>
                                        <th>P2 HDCP</th>
                                        <th>Total HDCP</th>
                                    </tr>
                                </thead>
                                <tbody>
${teams.map((team) => `                                    <tr><td class="font-bold">${escapeHtml(team.teamName || 'TBD')}</td><td>${escapeHtml(team.player1 || '--')}</td><td>${escapeHtml(team.player1Handicap || '--')}</td><td>${escapeHtml(team.player2 || '--')}</td><td>${escapeHtml(team.player2Handicap || '--')}</td><td>${escapeHtml(displayTeamHandicap(team))}</td></tr>`).join('\n')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>`;
}

function renderFormatSection(content) {
    const format = content.format || {};
    const body = formatText(format);
    return `<section id="format" class="view-section">
                    <h3 class="section-title">Format</h3>
                    <div class="card glass-panel" style="padding: 1.5rem;">
${renderTextBlock(body, 24)}
                    </div>
                </section>`;
}

function renderPickAProSection(content) {
    const pickapro = content.pickapro || {};
    const aPlayers = asArray(pickapro.aPlayers);
    const bPlayers = asArray(pickapro.bPlayers);
    return `<section id="pickapro" class="view-section">
                    <h3 class="section-title">A/B Player Draft</h3>
                    <div class="card glass-panel" style="padding: 1.5rem;">
                        <h3 class="card-title" style="border-bottom: none; margin-bottom: 0.5rem; padding-bottom: 0;">${escapeHtml(pickapro.title)}</h3>
                        <p style="margin-bottom: 1.5rem; color: var(--text-muted); border-bottom: 1px solid var(--border); padding-bottom: 1rem;">
                            ${escapeHtml(pickapro.intro)}
                        </p>
                        <div class="grid-2-col">
                            <div>
                                <h3 class="card-title">A Players</h3>
                                <ul class="info-list">
${renderPoolList(aPlayers, 36, 'A player list will be published after the cut.')}
                                </ul>
                            </div>
                            <div>
                                <h3 class="card-title">B Players</h3>
                                <ul class="info-list">
${renderPoolList(bPlayers, 36, 'B player list will be published after the cut.')}
                                </ul>
                            </div>
                        </div>
                        <div class="mt-8">
                            <h3 class="card-title">Draft Notes</h3>
                        <ul class="info-list">
${renderLabelList(pickapro.items, 28)}
                        </ul>
                        </div>
                    </div>
                </section>`;
}

function renderCalcuttaSection(content) {
    const calcutta = content.calcutta || {};
    return `<section id="calcutta" class="view-section">
                    <h3 class="section-title">Calcutta</h3>
                    <div class="card glass-panel" style="padding: 1.5rem; margin-bottom: 2rem;">
                        <h3 class="card-title" style="border-bottom: none; margin-bottom: 0.5rem; padding-bottom: 0;">Format Details</h3>
                        <ul class="info-list">
${renderPlainList(calcutta.format, 28)}
                        </ul>
                    </div>

                    <h3 class="section-title">Payout Schedule</h3>
                    <div class="stats-grid">
${asArray(calcutta.payouts).map((payout) => `                        <div class="stat-card glass-panel">
                            <h4>${escapeHtml(payout.label)}</h4>
                            <div class="stat-value text-gold" style="font-size: 1.8rem;">${escapeHtml(payout.value)}</div>
                        </div>`).join('\n')}
                    </div>
                </section>`;
}

function renderScoreboardSection(content) {
    const scoreboard = content.scoreboard || {};
    return `<section id="scoreboard" class="view-section">
                    <h3 class="section-title">Live Scoreboard</h3>
                    <div class="stats-grid scoreboard-summary">
                        <div class="stat-card glass-panel">
                            <h4>Last Updated</h4>
                            <div class="stat-value compact" id="scoreboard-updated">--</div>
                            <p class="stat-sub" id="scoreboard-status">Loading scoreboard data</p>
                        </div>
                        <div class="stat-card glass-panel">
                            <h4>Teams Entered</h4>
                            <div class="stat-value compact" id="scoreboard-team-count">--</div>
                            <p class="stat-sub">One flight expected</p>
                        </div>
                        <div class="stat-card glass-panel">
                            <h4>Calcutta Pot</h4>
                            <div class="stat-value compact" id="scoreboard-pot">--</div>
                            <p class="stat-sub">Sterling Grove team score only</p>
                        </div>
                        <div class="stat-card glass-panel">
                            <h4>Total Par</h4>
                            <div class="stat-value compact" id="scoreboard-tournament-par">496</div>
                            <p class="stat-sub">SG 216 + PGA 280</p>
                        </div>
                    </div>

                    <div class="grid-2-col">
                        <div class="card glass-panel">
                            <h3 class="card-title">Main Leaderboard</h3>
                            <ul class="info-list">
${renderPlainList(scoreboard.mainLeaderboard, 32)}
                            </ul>
                        </div>
                        <div class="card glass-panel">
                            <h3 class="card-title">Calcutta Board</h3>
                            <ul class="info-list">
${renderPlainList(scoreboard.calcuttaBoard, 32)}
                            </ul>
                        </div>
                    </div>

                    <div class="card glass-panel mt-8 scoreboard-card">
                        <div class="card-header-row">
                            <h3 class="card-title">Main Tournament Standings</h3>
                            <span class="badge">Team + PGA</span>
                        </div>
                        <div class="table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Rank</th>
                                        <th>Team</th>
                                        <th>Players</th>
                                        <th>Sat</th>
                                        <th>Sun</th>
                                        <th>SG Total</th>
                                        <th>PGA</th>
                                        <th>Total</th>
                                        <th>To Par</th>
                                    </tr>
                                </thead>
                                <tbody id="main-leaderboard-body">
                                    <tr><td colspan="9">Loading scoreboard data...</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="card glass-panel mt-8 scoreboard-card">
                        <div class="card-header-row">
                            <h3 class="card-title">Calcutta Board</h3>
                            <span class="badge badge-gold">Team score only</span>
                        </div>
                        <div class="table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Rank</th>
                                        <th>Team</th>
                                        <th>Players</th>
                                        <th>Day 1</th>
                                        <th>Day 2</th>
                                        <th>Team Total</th>
                                        <th>Net To Par</th>
                                        <th>Owner</th>
                                        <th>Cost</th>
                                        <th>Payout</th>
                                    </tr>
                                </thead>
                                <tbody id="calcutta-board-body">
                                    <tr><td colspan="10">Loading Calcutta data...</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="card glass-panel mt-8 scoreboard-card">
                        <div class="card-header-row">
                            <h3 class="card-title">A/B PGA Picks</h3>
                            <span class="badge">Weekend pro scores</span>
                        </div>
                        <div class="table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Team</th>
                                        <th>A Player</th>
                                        <th>A R3</th>
                                        <th>A R4</th>
                                        <th>B Player</th>
                                        <th>B R3</th>
                                        <th>B R4</th>
                                        <th>Pro Total</th>
                                    </tr>
                                </thead>
                                <tbody id="pga-picks-body">
                                    <tr><td colspan="8">Loading PGA picks...</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="card glass-panel mt-8" style="padding: 1.5rem;">
                        <h3 class="card-title">Player Notes</h3>
                        <ul class="info-list">
${renderLabelList(scoreboard.notes, 28)}
                        </ul>
                    </div>
                </section>`;
}

function renderRulesSection(content) {
    return `<section id="rules" class="view-section">
                    <h3 class="section-title">Rules and Scoring</h3>
                    <div class="card glass-panel" style="padding: 1.5rem;">
                        <ul class="info-list">
${renderLabelList(content.rules?.items, 28)}
                        </ul>
                    </div>
                </section>`;
}

function renderMarkdown(content) {
    const teams = teamRows(content);
    const playerCount = countTeamPlayers(content);
    const generatedAt = new Date(content.updatedAt || Date.now()).toLocaleString('en-US', { timeZone: 'America/Phoenix' });
    return `# 1st Annual PGA Championship Invitational at Sterling Grove CC

_Last generated from \`content/site-content.json\` on ${generatedAt} Arizona time._

## Event Snapshot

${asArray(content.overview?.snapshot).map((item) => `- ${item.label}: ${templateText(item.text, content)}`).join('\n')}

## Team Assignments

${content.players?.intro || ''}

Current confirmed players: ${playerCount}

| Team | Player 1 | P1 HDCP | Player 2 | P2 HDCP | Total HDCP |
| --- | --- | ---: | --- | ---: | ---: |
${teams.map((team) => `| ${escapeMarkdown(team.teamName || 'TBD')} | ${escapeMarkdown(team.player1 || 'TBD')} | ${escapeMarkdown(team.player1Handicap || 'TBD')} | ${escapeMarkdown(team.player2 || 'TBD')} | ${escapeMarkdown(team.player2Handicap || 'TBD')} | ${escapeMarkdown(displayTeamHandicap(team))} |`).join('\n')}

## Weekend Logistics

${renderMarkdownList(content.markdown?.logistics)}

## Official Format

${formatText(content.format)}

## Flight Competition

${renderMarkdownList(content.markdown?.flightCompetition)}

## Friday Night A/B Player Draft

${content.pickapro?.intro || ''}

### A Players

${renderMarkdownListWithFallback(content.pickapro?.aPlayers, 'A player list will be published after the cut.')}

### B Players

${renderMarkdownListWithFallback(content.pickapro?.bPlayers, 'B player list will be published after the cut.')}

### Draft Notes

${renderMarkdownLabelList(content.pickapro?.items)}

${renderMarkdownList(content.markdown?.pickaproDetails)}

## Calcutta

${renderMarkdownList(content.calcutta?.format)}

### Payout Schedule

${asArray(content.calcutta?.payouts).map((payout) => `- ${payout.label}: ${payout.value}`).join('\n')}

## Live Scoreboard Requirements

### Main Leaderboard

${renderMarkdownList(content.scoreboard?.mainLeaderboard)}

### Calcutta Board

${renderMarkdownList(content.scoreboard?.calcuttaBoard)}

### Player Notes

${renderMarkdownLabelList(content.scoreboard?.notes)}

### Implementation Notes

${renderMarkdownList(content.markdown?.liveScoreboard)}

## Rules and Scoring

${renderMarkdownLabelList(content.rules?.items)}

${renderMarkdownSections(content.markdown?.ruleDetails)}

## Handicapping Basis

${renderMarkdownList(content.markdown?.handicapping)}

## Tie Procedures

${renderMarkdownList(content.markdown?.tieProcedures)}

## Files To Complete

${renderMarkdownList(content.markdown?.files)}
`;
}

function renderPlainList(items, spaces) {
    return asArray(items)
        .map((item) => `${' '.repeat(spaces)}<li>${escapeHtml(templateText(item))}</li>`)
        .join('\n');
}

function renderPoolList(items, spaces, fallback) {
    const values = asArray(items).filter(Boolean);
    if (!values.length) return `${' '.repeat(spaces)}<li>${escapeHtml(fallback)}</li>`;
    return values
        .map((item) => `${' '.repeat(spaces)}<li>${escapeHtml(templateText(item))}</li>`)
        .join('\n');
}

function renderLabelList(items, spaces) {
    return asArray(items)
        .map((item) => `${' '.repeat(spaces)}<li><strong>${escapeHtml(templateText(item.label))}:</strong> ${escapeHtml(templateText(item.text))}</li>`)
        .join('\n');
}

function renderMarkdownList(items) {
    return asArray(items).map((item) => `- ${templateText(item)}`).join('\n');
}

function renderMarkdownListWithFallback(items, fallback) {
    const values = asArray(items).filter(Boolean);
    return values.length ? renderMarkdownList(values) : `- ${fallback}`;
}

function renderMarkdownLabelList(items) {
    return asArray(items).map((item) => `- ${item.label}: ${templateText(item.text)}`).join('\n');
}

function renderMarkdownSections(sections) {
    return asArray(sections)
        .map((section) => [
            `## ${section.title}`,
            section.intro || '',
            renderMarkdownList(section.items),
        ].filter(Boolean).join('\n\n'))
        .join('\n\n');
}

function formatText(format = {}) {
    if (format.body) return String(format.body).trim();
    return [
        format.saturdayTitle || 'Saturday',
        renderMarkdownList(format.saturday),
        '',
        format.sundayTitle || 'Sunday',
        renderMarkdownList(format.sunday),
    ].join('\n').trim();
}

function renderTextBlock(value, spaces) {
    const indent = ' '.repeat(spaces);
    const lines = String(value || '').split('\n');
    const html = [];
    let inList = false;

    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line) {
            if (inList) {
                html.push(`${indent}</ul>`);
                inList = false;
            }
            continue;
        }

        if (line.startsWith('- ')) {
            if (!inList) {
                html.push(`${indent}<ul class="info-list">`);
                inList = true;
            }
            html.push(`${indent}    <li>${escapeHtml(line.slice(2))}</li>`);
            continue;
        }

        if (inList) {
            html.push(`${indent}</ul>`);
            inList = false;
        }

        if (line.endsWith(':') || line.includes(':')) {
            html.push(`${indent}<h3 class="card-title">${escapeHtml(line)}</h3>`);
        } else {
            html.push(`${indent}<p style="margin-bottom: 1rem; color: var(--text-muted);">${escapeHtml(line)}</p>`);
        }
    }

    if (inList) html.push(`${indent}</ul>`);
    return html.join('\n');
}

function teamRows(content) {
    const teams = asArray(content.players?.teams);
    if (teams.length) {
        return teams.map(normalizeTeamRow).filter((team) => team.teamName || team.player1 || team.player2);
    }

    return asArray(content.players?.players).map((player, index) => normalizeTeamRow({
        teamName: `TBD ${index + 1}`,
        player1: player.name,
        player1Handicap: player.handicap,
        player2: '',
        player2Handicap: '',
        totalHandicap: '',
    }));
}

function normalizeTeamRow(team) {
    return {
        teamName: team.teamName || '',
        player1: team.player1 || '',
        player1Handicap: team.player1Handicap || '',
        player2: team.player2 || '',
        player2Handicap: team.player2Handicap || '',
        totalHandicap: team.totalHandicap || '',
    };
}

function countTeamPlayers(content) {
    return teamRows(content).reduce((total, team) => (
        total + (team.player1 ? 1 : 0) + (team.player2 ? 1 : 0)
    ), 0);
}

function displayTeamHandicap(team) {
    if (team.totalHandicap) return team.totalHandicap;
    const player1 = handicapValue(team.player1Handicap);
    const player2 = handicapValue(team.player2Handicap);
    if (player1 === null || player2 === null) return '--';
    return formatHandicap(player1 + player2);
}

function handicapValue(value) {
    if (value === null || value === undefined || value === '') return null;
    const text = String(value).trim();
    const isPlusHandicap = text.startsWith('+');
    const number = Number(text.replace(/^\+/, ''));
    if (!Number.isFinite(number)) return null;
    return isPlusHandicap ? -number : number;
}

function formatHandicap(value) {
    if (!Number.isFinite(value)) return '--';
    const rounded = Math.round(value * 10) / 10;
    if (Object.is(rounded, -0)) return '0.0';
    if (rounded < 0) return `+${Math.abs(rounded).toFixed(1)}`;
    return rounded.toFixed(1);
}

function templateText(value, content = null) {
    const text = value === undefined || value === null ? '' : String(value);
    const playerCount = content ? countTeamPlayers(content) : 0;
    const teamCount = content ? teamRows(content).length : 0;
    return text
        .replaceAll('{{playerCount}}', String(playerCount))
        .replaceAll('{{teamCount}}', String(teamCount));
}

function replaceSection(html, id, replacement) {
    const start = html.indexOf(`<section id="${id}"`);
    if (start < 0) throw httpError(500, `Could not find section "${id}" in index.html`);
    const end = html.indexOf('</section>', start);
    if (end < 0) throw httpError(500, `Could not find end of section "${id}" in index.html`);
    return `${html.slice(0, start)}${replacement}${html.slice(end + '</section>'.length)}`;
}

function validateScoreboard(data) {
    if (!data || typeof data !== 'object') throw httpError(400, 'Scoreboard data must be an object');
    if (!Array.isArray(data.teams)) throw httpError(400, 'Scoreboard data must include a teams array');
    if (!data.scoring || typeof data.scoring !== 'object') throw httpError(400, 'Scoreboard data must include scoring settings');
    if (!data.calcutta || !Array.isArray(data.calcutta.payouts)) throw httpError(400, 'Scoreboard data must include Calcutta payouts');
}

function validateSiteContent(content) {
    if (!content || typeof content !== 'object') throw httpError(400, 'Site content must be an object');
    const requiredSections = ['overview', 'players', 'format', 'pickapro', 'calcutta', 'scoreboard', 'rules'];
    for (const section of requiredSections) {
        if (!content[section] || typeof content[section] !== 'object') {
            throw httpError(400, `Site content must include a ${section} section`);
        }
    }
    if (!Array.isArray(content.players.teams) && !Array.isArray(content.players.players)) {
        throw httpError(400, 'Players section must include a teams array');
    }
    if (!Array.isArray(content.rules.items)) throw httpError(400, 'Rules section must include an items array');
}

function requireAdmin(request) {
    if (!adminToken) throw httpError(403, 'Set SCOREBOARD_ADMIN_TOKEN before saving, loading private content, or publishing');
    if (request.headers['x-scoreboard-token'] !== adminToken) throw httpError(401, 'Invalid admin token');
}

async function readBody(request) {
    let body = '';
    for await (const chunk of request) {
        body += chunk;
        if (body.length > 2 * 1024 * 1024) throw httpError(413, 'Request body is too large');
    }
    return body;
}

async function serveStatic(pathname, response) {
    const decoded = decodeURIComponent(pathname);
    const safePath = normalize(decoded).replace(/^(\.\.[/\\])+/, '');
    const filePath = resolve(root, `.${safePath}`);

    if (!filePath.startsWith(root)) throw httpError(403, 'Forbidden');
    if (safePath.startsWith('/content/') || extname(filePath) === '.md') throw httpError(404, 'Not found');

    const fileStat = await stat(filePath).catch(() => null);
    if (!fileStat || !fileStat.isFile()) throw httpError(404, 'Not found');

    const stream = createReadStream(filePath);
    response.writeHead(200, { 'Content-Type': contentTypes[extname(filePath)] || 'application/octet-stream' });
    stream.pipe(response);
}

function git(args) {
    return gitCommand(args).then(({ output }) => output);
}

async function hasStagedChanges() {
    const result = await gitCommand(['diff', '--cached', '--quiet'], [0, 1]);
    return result.code === 1;
}

async function stagedFiles() {
    const result = await gitCommand(['diff', '--cached', '--name-only']);
    return result.output.split('\n').map((line) => line.trim()).filter(Boolean);
}

function gitCommand(args, allowedCodes = [0]) {
    return new Promise((resolvePromise, rejectPromise) => {
        const child = spawn('git', args, { cwd: repoRoot });
        let output = '';
        child.stdout.on('data', (chunk) => { output += chunk; });
        child.stderr.on('data', (chunk) => { output += chunk; });
        child.on('close', (code) => {
            if (allowedCodes.includes(code)) return resolvePromise({ code, output });
            rejectPromise(httpError(500, output || `git ${args.join(' ')} failed`));
        });
    });
}

function asArray(value) {
    return Array.isArray(value) ? value : [];
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function escapeMarkdown(value) {
    return String(value ?? '').replace(/\|/g, '\\|');
}

function sendJson(response, data) {
    response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify(data, null, 2));
}

function sendText(response, status, text) {
    response.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end(text);
}

function httpError(statusCode, message) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}
