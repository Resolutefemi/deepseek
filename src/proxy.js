import { config, upstreamUrl } from './config.js';

const HOP = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'host',
  'content-length',
  'content-encoding',
]);

const PASSTHROUGH_HEADERS = [
  'content-type',
  'x-request-id',
  'x-ratelimit-limit-tokens',
  'x-ratelimit-limit-requests',
  'x-ratelimit-remaining-tokens',
  'x-ratelimit-remaining-requests',
  'x-ratelimit-reset-tokens',
  'x-ratelimit-reset-requests',
];

function buildAuthHeader(incomingAuth) {
  if (config.deepseekTokens.length > 0) {
    return `Bearer ${config.deepseekTokens.join(',')}`;
  }
  return incomingAuth;
}

async function waitDrain(res) {
  await new Promise((resolve) => res.once('drain', resolve));
}

async function readAll(reader) {
  const chunks = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(Buffer.from(value));
  }
  return Buffer.concat(chunks);
}

export async function proxyHandler(request, reply) {
  const { method, headers } = request.raw;
  const target = upstreamUrl(request.raw.url);

  const outHeaders = {};
  for (const [key, value] of Object.entries(headers)) {
    const k = key.toLowerCase();
    if (HOP.has(k)) continue;
    if (k === 'authorization') continue;
    outHeaders[key] = value;
  }
  outHeaders.authorization = buildAuthHeader(headers.authorization);
  outHeaders.accept = headers.accept || '*/*';

  let body;
  const parsedBody = request.body;
  if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
    if (parsedBody !== undefined) {
      body =
        typeof parsedBody === 'string' ? parsedBody : JSON.stringify(parsedBody);
      outHeaders['content-type'] = 'application/json';
    }
  }

  let upstreamRes;
  try {
    upstreamRes = await fetch(target, {
      method,
      headers: outHeaders,
      body,
      redirect: 'follow',
    });
  } catch (err) {
    console.error('Fetch error:', err);
    reply.code(502);
    return reply.send({
      error: { message: String(err.message || err), type: 'proxy_error' },
    });
  }

  reply.code(upstreamRes.status);
  reply.removeHeader('content-length');
  reply.removeHeader('transfer-encoding');
  for (const h of PASSTHROUGH_HEADERS) {
    const v = upstreamRes.headers.get(h);
    if (v) reply.header(h, v);
  }

  if (!upstreamRes.body) {
    return reply.send();
  }

  const reader = upstreamRes.body.getReader();
  reply.hijack();
  const res = reply.raw;

  const run = async () => {
    const buf = await readAll(reader);
    if (!buf || buf.length === 0) {
      res.end();
      return;
    }
    res.writeHead(upstreamRes.status, {
      'content-type': String(
        upstreamRes.headers.get('content-type') ||
          'application/json; charset=utf-8',
      ),
      'content-length': String(buf.length),
      'cache-control': 'no-cache, no-transform',
      'x-accel-buffering': 'no',
      connection: 'keep-alive',
    });
    res.write(buf);
    res.end();
  };

  try {
    await run();
  } catch (err) {
    console.error('Proxy pump error:', err);
    if (!res.writableEnded) res.destroy(err);
  }
}