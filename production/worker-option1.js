/**
 * Option 1 — pure Telegram proxy, no custom domain needed
 * Deployed to *.workers.dev (free Cloudflare tier)
 * The Lovable app stays on lovable.app — this Worker is only used as the iframe src
 */

const TELEGRAM_HOST = 'web.telegram.org'
const STRIP_HEADERS = [
  'x-frame-options',
  'content-security-policy',
  'content-security-policy-report-only',
]

export default {
  async fetch(request) {
    const url = new URL(request.url)

    const telegramUrl = new URL(request.url)
    telegramUrl.hostname = TELEGRAM_HOST
    telegramUrl.protocol = 'https:'
    telegramUrl.port = ''

    const proxyHeaders = new Headers(request.headers)
    proxyHeaders.set('host', TELEGRAM_HOST)
    proxyHeaders.delete('origin')
    proxyHeaders.delete('referer')

    const isWebSocket = request.headers.get('upgrade')?.toLowerCase() === 'websocket'

    const response = await fetch(telegramUrl.toString(), {
      method: request.method,
      headers: proxyHeaders,
      body: !isWebSocket && request.method !== 'GET' && request.method !== 'HEAD'
        ? request.body
        : undefined,
    })

    const headers = new Headers(response.headers)
    STRIP_HEADERS.forEach(h => headers.delete(h))
    headers.set('access-control-allow-origin', '*')

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  },
}
