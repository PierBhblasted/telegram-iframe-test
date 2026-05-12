# Production deployment

## Architecture

```
Browser
  │
  ├── GET /  → Cloudflare Worker → Lovable app (your-app.lovable.app)
  ├── GET /k/ → Cloudflare Worker → web.telegram.org/k/  (X-Frame-Options stripped)
  ├── GET /apiws → Cloudflare Worker → web.telegram.org/apiws  (WebSocket, QR keep-alive)
  └── GET /js/, /css/ etc → Cloudflare Worker → web.telegram.org/...

Same domain for app + iframe → same-origin → no browser restrictions
```

## Steps

### 1. Custom domain on Cloudflare

- Add your domain to Cloudflare (free plan works)
- Point your Lovable app to it: Lovable → Settings → Custom domain → `app.yourdomain.com`

### 2. Deploy the Worker

```bash
npm install -g wrangler
wrangler login

cd production/

# Set your Lovable app URL as a secret (never hardcode it)
wrangler secret put APP_ORIGIN
# → paste: https://your-app.lovable.app

# Edit wrangler.toml → set your real domain in [[routes]]

wrangler deploy
```

### 3. Add the component to Lovable

Copy `TelegramFrame.tsx` into your Lovable project and use it:

```tsx
<TelegramFrame className="w-full h-[700px] rounded-xl overflow-hidden" />
```

That's it. The iframe loads `/k/` — same origin as the app — Worker strips X-Frame-Options before the browser ever sees it.

### 4. Verify

- Open your app at `https://app.yourdomain.com`
- Telegram Web should appear in the iframe
- QR code login and phone login both work (Worker proxies `/apiws` WebSocket for QR token keep-alive)

## What the Worker does vs. does NOT do

| Does | Does not |
|---|---|
| Strip X-Frame-Options + CSP from Telegram responses | Store or read Telegram messages |
| Forward WebSocket upgrades (MTProto / QR auth) | Require Telegram credentials |
| Pass all other traffic to your Lovable app | Break auto-updates of the Lovable app |

## Troubleshooting

**Worker returns 500 "APP_ORIGIN not configured"**
→ Run `wrangler secret put APP_ORIGIN` and paste your Lovable URL.

**Telegram shows blank after Worker deploy**
→ Check Cloudflare Worker logs (`wrangler tail`) for errors. Confirm the route pattern in `wrangler.toml` matches your domain exactly.

**QR login still fails AUTH_TOKEN_EXPIRED**
→ Confirm `/apiws` is in `TELEGRAM_PATHS` in the Worker (it is by default). Check the WS connection in DevTools → Network → WS.
