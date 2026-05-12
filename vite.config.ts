import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const TELEGRAM_PATHS = ['/k', '/a', '/js', '/css', '/img', '/tg', '/favicon.ico']

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: Object.fromEntries(
      TELEGRAM_PATHS.map(path => [
        path,
        {
          target: 'https://web.telegram.org',
          changeOrigin: true,
          secure: true,
          ws: true,
          configure(proxy) {
            proxy.on('proxyRes', (proxyRes) => {
              delete proxyRes.headers['x-frame-options']
              delete proxyRes.headers['content-security-policy']
              delete proxyRes.headers['content-security-policy-report-only']
              proxyRes.headers['access-control-allow-origin'] = '*'
            })
          },
        },
      ])
    ),
  },
})
