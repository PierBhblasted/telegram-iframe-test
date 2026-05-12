import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// All paths Telegram Web uses — including WebSocket endpoint /apiws
const TELEGRAM_PATHS = [
  '/k',
  '/a',
  '/js',
  '/css',
  '/img',
  '/tg',
  '/apiws',      // MTProto WebSocket — keeps QR token alive + receives auth confirmation
  '/api',        // HTTP fallback for MTProto
  '/file',
]

const proxyEntry = {
  target: 'https://web.telegram.org',
  changeOrigin: true,
  secure: true,
  ws: true,
  configure(proxy: import('http-proxy').Server) {
    proxy.on('proxyRes', (proxyRes) => {
      delete proxyRes.headers['x-frame-options']
      delete proxyRes.headers['content-security-policy']
      delete proxyRes.headers['content-security-policy-report-only']
      proxyRes.headers['access-control-allow-origin'] = '*'
      proxyRes.headers['access-control-allow-credentials'] = 'true'
    })
    proxy.on('error', (err) => {
      console.error('[telegram-proxy] error:', err.message)
    })
  },
}

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: Object.fromEntries(TELEGRAM_PATHS.map(p => [p, proxyEntry])),
  },
})
