import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { config, upstreamUrl } from './config.js';

let proc = null;
let status = 'idle';
let lastLog = [];

function log(line) {
  lastLog.push(String(line));
  if (lastLog.length > 200) lastLog.shift();
}

export async function isUp() {
  try {
    const res = await fetch(upstreamUrl('/v1/models'), { method: 'GET' });
    return res.ok || res.status === 200 || res.status === 404;
  } catch {
    return false;
  }
}

export function launch() {
  if (proc) return;
  const entry = path.join(config.upstreamRoot, 'dist', 'index.mjs');
  if (!existsSync(entry)) {
    status = 'missing';
    log(`Engine entry not found: ${entry}. Run 'npm run build' in deepseek-free-api first.`);
    return;
  }

  status = 'starting';
  const child = spawn(
    process.execPath,
    ['--enable-source-maps', '--no-node-snapshot', entry],
    {
      cwd: config.upstreamRoot,
      env: {
        ...process.env,
        DEEP_SEEK_CHAT_AUTHORIZATION: config.deepseekTokens.join(','),
        CHAT_SESSION_REUSE: config.chatSessionReuse ? 'true' : 'false',
        RESPONSES_SESSION_REUSE: config.responsesSessionReuse ? 'true' : 'false',
        ANTHROPIC_SESSION_REUSE: config.anthropicSessionReuse ? 'true' : 'false',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );

  proc = child;
  child.stdout.on('data', (d) => log(`[up] ${d}`));
  child.stderr.on('data', (d) => log(`[up:err] ${d}`));
  child.on('spawn', () => {
    status = 'starting';
    log('Engine spawned, awaiting HTTP readiness...');
  });
  child.on('exit', (code, sig) => {
    status = 'exited';
    log(`Engine exited (code=${code}, signal=${sig})`);
    proc = null;
  });
  child.on('error', (err) => {
    status = 'error';
    log(`Engine spawn error: ${err.message}`);
  });
}

export function stop() {
  if (proc) {
    proc.kill('SIGTERM');
    proc = null;
  }
}

export function getStatus() {
  return { status, spawned: Boolean(proc), lastLog: lastLog.slice(-30) };
}