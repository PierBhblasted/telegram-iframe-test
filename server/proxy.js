import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'

const app = express()
const PORT = 3001

// Headers that prevent iframe embedding — we strip them
const BLOCKED_HEADERS = [
  'x-frame-options',
  'content-security-policy',
  'content-security-policy-report-only',
]

app.use('/', createProxyMiddleware({
  target: 'https://web.telegram.org',
  changeOrigin: true,
  ws: true, // proxy WebSocket connections too (Telegram uses them)
  on: {
    proxyRes(proxyRes) {
      BLOCKED_HEADERS.forEach(h => delete proxyRes.headers[h])
      proxyRes.headers['x-frame-options'] = 'ALLOWALL'
      proxyRes.headers['access-control-allow-origin'] = '*'
    },
    error(err, req, res) {
      console.error('Proxy error:', err.message)
      res.writeHead(502, { 'Content-Type': 'text/plain' })
      res.end('Proxy error: ' + err.message)
    },
  },
}))

app.listen(PORT, () => {
  console.log(`Telegram proxy running → http://localhost:${PORT}`)
  console.log('Point your iframe at http://localhost:3001')
})
