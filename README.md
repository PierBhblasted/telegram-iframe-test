# Telegram Integration Test — Lovable

Tests two approaches to embedding Telegram conversation in a web app.

## Results

| Approach | Result | Why |
|---|---|---|
| `<iframe src="https://web.telegram.org">` | **FAILS** | `X-Frame-Options: DENY` on Telegram's servers. Browser refuses to render. No client-side workaround. |
| Custom chat widget via Bot API | **WORKS** | Poll `getUpdates`, render messages, send via `sendMessage`. Full control over UI. |

---

## Run locally

```bash
npm install
npm run dev
# open http://localhost:5173
```

**Tab 1 — iframe test**: see the blocked iframe and DevTools error.

**Tab 2 — Bot API widget**: paste your bot token to see live chat. Instructions inside the app.

---

## Architecture for Lovable (production)

```
[Client on Telegram] ──► [Your Bot] ──► [Supabase Edge Function]
                                                  │
                                         [Lovable React App]
                                      (chat widget polls edge fn)
```

### Steps

1. **Create bot** via `@BotFather` → get token
2. **Add Supabase secret**: `TELEGRAM_BOT_TOKEN=<token>`
3. **Create edge function** `supabase/functions/telegram-proxy/index.ts` — proxies `getUpdates` and `sendMessage` to Telegram API (token never exposed to browser)
4. **Port `useTelegramBot` hook** — replace direct `api.telegram.org` calls with your edge function URL
5. **Drop `<BotChatWidget />` into Lovable** — done

### Why not use a webhook instead of polling?

Polling (3s interval) is simpler to set up in Lovable/Supabase and has no cold-start issues. For high-volume use, switch to webhook: set `setWebhook` to point at the edge function, which then pushes messages into a Supabase table; the React component subscribes via Supabase Realtime instead of polling.

---

## Files

```
src/
  hooks/useTelegramBot.ts        # polling logic — port this to Lovable
  components/IframeTest.tsx      # demonstrates iframe failure
  components/BotChatDemo.tsx     # working chat widget demo
```
