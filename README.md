# DeepSeek Fastify Gateway

A **Fastify** OpenAI-compatible API that fronts the
[`deepseek-free-api`](https://github.com/LLM-Red-Team/deepseek-free-api) engine
(we clone the maintained fork `Fu-Jie/deepseek-free-api`, since the original is
archived) and drives it with **browser-captured DeepSeek tokens** supplied via
environment variables.

## Architecture

```
                        browser-captured DeepSeek token (chat.deepseek.com)
                                       |
                             DEEP_SEEK_CHAT_AUTHORIZATION env
                                       |
        OpenAI-compatible client -----------------> Fastify gateway (this repo)
                     (curl / ChatBox / LobeChat /      port 3000
                      Cursor / Codex CLI / Claude)            |
                                                              | proxy, injects env token
                                                              v
                                              deepseek-free-api engine (child proc)
                                                          port 8000
                                                              |
                                                              v
                                                    chat.deepseek.com (web protocol)
```

- The **Fastify gateway** owns the OpenAI-compatible surface: `POST /v1/chat/completions`
  (streaming + non-streaming), `GET /v1/models`, `POST /v1/responses`
  (Codex CLI), `POST /v1/messages` + `/anthropic/v1/messages` (Claude Code).
- It **auto-launches** the `deepseek-free-api` engine as a child process and
  proxies requests to it, **injecting the env token** as the Authorization
  header (source of truth over any caller-supplied key).
- SSE streaming is passed through byte-for-byte (no buffering), so streaming
  chat works end-to-end.

## Layout

- `deepseek-free-api/` — the cloned upstream engine (Koa-based, maintained fork).
- `deepseek-fastify-api/` — this Fastify gateway.

## Setup

### 1. Clone + build the upstream engine

```bash
git clone --depth 1 https://github.com/Fu-Jie/deepseek-free-api.git
cd deepseek-free-api
npm install            # approve native scripts for better-sqlite3 / esbuild
npm run build          # -> dist/index.mjs
```

### 2. Capture a DeepSeek token (browser)

1. Open https://chat.deepseek.com and start any conversation.
2. Press `F12` → **Application** tab → **Local Storage** →
   `https://chat.deepseek.com`.
3. Copy the **value** of the `userToken` key. This is your token.
4. Multiple accounts? Join several tokens with a comma
   (`TOKEN1,TOKEN2`) — the engine load-balances (each account runs one stream
   at a time).

### 3. Configure + run the Fastify gateway

```bash
cd deepseek-fastify-api
cp .env.example .env
# edit .env:  DEEP_SEEK_CHAT_AUTHORIZATION=<your captured token(s)>
npm install
npm start              # gateway on :3000, auto-spawns engine on :8000
```

## Usage

```bash
# Non-streaming chat
curl http://127.0.0.1:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-chat","messages":[{"role":"user","content":"hi"}]}'

# Streaming chat
curl -N http://127.0.0.1:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-r1","messages":[{"role":"user","content":"hi"}],"stream":true}'

# Model list
curl http://127.0.0.1:3000/v1/models

# Gateway health / upstream status
curl http://127.0.0.1:3000/healthz
```

Point any OpenAI-compatible client at `http://127.0.0.1:3000/v1` (any API key
value works for the header; the real DeepSeek token comes from `.env`).

## Environment variables

| Variable | Default | Purpose |
| :--- | :--- | :--- |
| `DEEP_SEEK_CHAT_AUTHORIZATION` | — | Browser-captured DeepSeek token(s), comma-separated |
| `PORT` | `3000` | Fastify gateway port |
| `HOST` | `0.0.0.0` | Fastify gateway bind host |
| `DEEPSEEK_UPSTREAM_HOST` | `127.0.0.1` | Engine host |
| `DEEPSEEK_UPSTREAM_PORT` | `8000` | Engine port |
| `AUTO_LAUNCH_UPSTREAM` | `true` | Auto-spawn the engine as a child process |
| `CHAT_SESSION_REUSE` | `true` | Mirror to engine (session reuse) |
| `RESPONSES_SESSION_REUSE` | `true` | Mirror to engine |
| `ANTHROPIC_SESSION_REUSE` | `false` | Mirror to engine |

## Notes

- Reverse-engineered APIs are unstable. For production, use the official
  DeepSeek API (https://platform.deepseek.com/).
- For personal use only. Do not expose as a public service.
- The engine logs a benign "获取 IP 地址失败" (get IP failed) warning at boot
  when it cannot reach chat.deepseek.com; it is non-fatal.