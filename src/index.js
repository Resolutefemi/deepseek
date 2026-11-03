import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from './config.js';
import { proxyHandler } from './proxy.js';
import { launch, isUp, getStatus } from './upstream.js';

const app = Fastify({
  logger: { level: 'info' },
  trustProxy: true,
  bodyLimit: 100 * 1024 * 1024,
});

await app.register(cors, { origin: true, credentials: true });

// --- OpenAI-compatible passthrough routes ---
app.post('/v1/chat/completions', proxyHandler);
app.post('/v1/responses', proxyHandler);
app.post('/v1/messages', proxyHandler);
app.post('/anthropic/v1/messages', proxyHandler);
app.get('/v1/models', proxyHandler);
app.get('/v1/models/:model', proxyHandler);
app.post('/v1/completions', proxyHandler);
app.post('/v1/embeddings', proxyHandler);

// --- Gateway health / introspection ---
app.get('/healthz', async () => {
  const upstreamReady = await isUp();
  return {
    ok: true,
    version: config.version,
    upstream: {
      ready: upstreamReady,
      host: config.upstream.host,
      port: config.upstream.port,
    },
    tokensConfigured: config.deepseekTokens.length,
    runtime: getStatus(),
  };
});

app.get('/_status', async () => ({ ok: true, ...getStatus() }));

app.get('/', async () => ({
  name: 'deepseek-fastify-api',
  version: config.version,
  endpoints: [
    'POST /v1/chat/completions  (OpenAI-compatible chat + streaming)',
    'GET  /v1/models            (OpenAI-compatible model list)',
    'POST /v1/responses         (OpenAI Responses / Codex CLI)',
    'POST /v1/messages          (Anthropic Messages / Claude Code)',
  ],
}));

// --- Bootstrap ---
if (config.autoLaunchUpstream) {
  launch();
}

const start = async () => {
  try {
    await app.listen({ host: config.host, port: config.port });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();

const shutdown = async () => {
  const { stop } = await import('./upstream.js');
  stop();
  await app.close();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);