/**
 * Cloudflare Worker — Telegram Web proxy for production
 *
 * Deploy this Worker on the same domain as your Lovable app.
 * Set the APP_ORIGIN secret to your Lovable app's URL.
 *
 * How it works:
 *   /k/*, /a/*, /apiws, /js/*, /css/*, /img/*, /file/*
 *     → proxy to web.telegram.org, strip X-Frame-Options + CSP
 *   everything else
 *     → pass through to your Lovable app origin
 *
 * The iframe in the React app just points to src="/k/" — same origin, no restrictions.
 */

const TELEGRAM_HOST = 'web.telegram.org'

const TELEGRAM_PATHS = ['/k', '/a', '/js', '/css', '/img', '/apiws', '/api', '/file']

const STRIP_HEADERS = [
  'x-frame-options',
  'content-security-policy',
  'content-security-policy-report-only',
]

function isTelegramPath(pathname) {
  return TELEGRAM_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (!isTelegramPath(url.pathname)) {
      // Pass through to Lovable app (or serve Cloudflare Pages static assets)
      const appOrigin = env.APP_ORIGIN
      if (!appOrigin) {
        return new Response('APP_ORIGIN not configured', { status: 500 })
      }
      const appUrl = new URL(request.url)
      const origin = new URL(appOrigin)
      appUrl.hostname = origin.hostname
      appUrl.protocol = origin.protocol
      appUrl.port = origin.port

      return fetch(appUrl.toString(), {
        method: request.method,
        headers: request.headers,
        body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
        redirect: 'follow',
      })
    }

    // Build the proxied Telegram URL
    const telegramUrl = new URL(request.url)
    telegramUrl.hostname = TELEGRAM_HOST
    telegramUrl.protocol = 'https:'
    telegramUrl.port = ''

    // Build clean headers — strip origin so Telegram sees a direct request
    const proxyHeaders = new Headers(request.headers)
    proxyHeaders.set('host', TELEGRAM_HOST)
    proxyHeaders.delete('origin')
    proxyHeaders.delete('referer')

    const isWebSocket = request.headers.get('upgrade')?.toLowerCase() === 'websocket'

    const telegramResponse = await fetch(telegramUrl.toString(), {
      method: request.method,
      headers: proxyHeaders,
      // body only for non-GET — WebSocket upgrades use GET
      body: !isWebSocket && request.method !== 'GET' && request.method !== 'HEAD'
        ? request.body
        : undefined,
    })

    // Strip framing-prevention headers, allow any origin
    const responseHeaders = new Headers(telegramResponse.headers)
    STRIP_HEADERS.forEach(h => responseHeaders.delete(h))
    responseHeaders.set('access-control-allow-origin', '*')
    responseHeaders.set('access-control-allow-credentials', 'true')

    return new Response(telegramResponse.body, {
      status: telegramResponse.status,
      statusText: telegramResponse.statusText,
      headers: responseHeaders,
    })
  },
}
