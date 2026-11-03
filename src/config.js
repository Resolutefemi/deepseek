import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '..', 'package.json'), 'utf-8'),
);

function bool(value, fallback = false) {
  if (value == null || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

const UPSTREAM_ROOT = path.resolve(__dirname, '..', 'engine');

export const config = {
  version: pkg.version,
  host: process.env.HOST || '0.0.0.0',
  port: Number(process.env.PORT || 3000),

  deepseekTokens: (process.env.DEEP_SEEK_CHAT_AUTHORIZATION || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean),

  upstream: {
    host: process.env.DEEPSEEK_UPSTREAM_HOST || '127.0.0.1',
    port: Number(process.env.DEEPSEEK_UPSTREAM_PORT || 8000),
  },

  autoLaunchUpstream: bool(process.env.AUTO_LAUNCH_UPSTREAM, true),
  upstreamRoot: UPSTREAM_ROOT,

  chatSessionReuse: bool(process.env.CHAT_SESSION_REUSE, true),
  responsesSessionReuse: bool(process.env.RESPONSES_SESSION_REUSE, true),
  anthropicSessionReuse: bool(process.env.ANTHROPIC_SESSION_REUSE, false),
};

export function upstreamUrl(pathname = '/') {
  return `http://${config.upstream.host}:${config.upstream.port}${pathname}`;
}
