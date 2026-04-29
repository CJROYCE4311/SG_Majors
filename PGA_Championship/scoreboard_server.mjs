import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFile, stat, writeFile } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(root, '..');
const host = process.env.SCOREBOARD_HOST || '127.0.0.1';
const port = Number(process.env.SCOREBOARD_PORT || 4173);
const adminToken = process.env.SCOREBOARD_ADMIN_TOKEN || '';
const jsonPath = join(root, 'data', 'scoreboard.json');
const jsPath = join(root, 'data', 'scoreboard-data.js');

const contentTypes = {
    '.css': 'text/css; charset=utf-8',
    '.csv': 'text/csv; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.md': 'text/markdown; charset=utf-8',
    '.png': 'image/png',
};

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
            return sendJson(response, { ok: true });
        }

        if (request.method === 'POST' && url.pathname === '/api/publish') {
            requireAdmin(request);
            await git(['add', 'PGA_Championship/data/scoreboard.json', 'PGA_Championship/data/scoreboard-data.js']);
            await git(['commit', '-m', `Update PGA scoreboard ${new Date().toISOString()}`]);
            await git(['push']);
            return sendJson(response, { ok: true });
        }

        if (request.method !== 'GET') {
            return sendText(response, 405, 'Method not allowed');
        }

        return serveStatic(url.pathname === '/' ? '/index.html' : url.pathname, response);
    } catch (error) {
        const status = error.statusCode || 500;
        return sendText(response, status, error.message || 'Server error');
    }
});

server.listen(port, host, () => {
    console.log(`PGA scoreboard server running at http://${host}:${port}`);
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

function validateScoreboard(data) {
    if (!data || typeof data !== 'object') throw httpError(400, 'Scoreboard data must be an object');
    if (!Array.isArray(data.teams)) throw httpError(400, 'Scoreboard data must include a teams array');
    if (!data.scoring || typeof data.scoring !== 'object') throw httpError(400, 'Scoreboard data must include scoring settings');
    if (!data.calcutta || !Array.isArray(data.calcutta.payouts)) throw httpError(400, 'Scoreboard data must include Calcutta payouts');
}

function requireAdmin(request) {
    if (!adminToken) throw httpError(403, 'Set SCOREBOARD_ADMIN_TOKEN before saving or publishing');
    if (request.headers['x-scoreboard-token'] !== adminToken) throw httpError(401, 'Invalid admin token');
}

async function readBody(request) {
    let body = '';
    for await (const chunk of request) {
        body += chunk;
        if (body.length > 1024 * 1024) throw httpError(413, 'Request body is too large');
    }
    return body;
}

async function serveStatic(pathname, response) {
    const decoded = decodeURIComponent(pathname);
    const safePath = normalize(decoded).replace(/^(\.\.[/\\])+/, '');
    const filePath = resolve(root, `.${safePath}`);

    if (!filePath.startsWith(root)) throw httpError(403, 'Forbidden');
    const fileStat = await stat(filePath).catch(() => null);
    if (!fileStat || !fileStat.isFile()) throw httpError(404, 'Not found');

    const stream = createReadStream(filePath);
    response.writeHead(200, { 'Content-Type': contentTypes[extname(filePath)] || 'application/octet-stream' });
    stream.pipe(response);
}

function git(args) {
    return new Promise((resolvePromise, rejectPromise) => {
        const child = spawn('git', args, { cwd: repoRoot });
        let output = '';
        child.stdout.on('data', (chunk) => { output += chunk; });
        child.stderr.on('data', (chunk) => { output += chunk; });
        child.on('close', (code) => {
            if (code === 0) return resolvePromise(output);
            rejectPromise(httpError(500, output || `git ${args.join(' ')} failed`));
        });
    });
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
