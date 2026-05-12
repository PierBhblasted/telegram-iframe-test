import { useState } from 'react'
import './IframeTest.css'

type Mode = 'proxy' | 'direct'

export default function IframeTest() {
  const [mode, setMode] = useState<Mode>('proxy')
  const [iframeKey, setIframeKey] = useState(0)

  // Proxy mode: Vite proxies /k/ to web.telegram.org on same port → same origin → no cross-origin block
  // Direct mode: proves the browser blocks it without proxy
  const src = mode === 'proxy'
    ? '/k/'
    : 'https://web.telegram.org/k/'

  const reload = () => setIframeKey(k => k + 1)

  return (
    <div className="panel main-panel">
      <div className="panel-header">
        <div>
          <h2>Telegram Web in-app</h2>
          <p className="panel-desc">
            Vite proxies <code>/k/</code> → <code>web.telegram.org/k/</code> on the same port,
            stripping X-Frame-Options. Parent and iframe are same-origin — no navigation restrictions.
            No separate proxy server needed.
          </p>
        </div>
      </div>

      <div className="controls-bar">
        <div className="mode-toggle">
          <button
            className={mode === 'proxy' ? 'active' : ''}
            onClick={() => { setMode('proxy'); reload() }}
          >
            Via Vite proxy (same-origin)
          </button>
          <button
            className={mode === 'direct' ? 'active' : ''}
            onClick={() => { setMode('direct'); reload() }}
          >
            Direct src (shows block)
          </button>
        </div>

        <button className="reload-btn" onClick={reload} title="Reload iframe">
          ↺ Reload frame
        </button>
      </div>

      {mode === 'proxy' && (
        <div className="proxy-instructions">
          <div className="step-row">
            <span className="step-badge done">✓</span>
            <div>
              <strong>No extra setup needed</strong> — Vite handles the proxy. Just run{' '}
              <div className="inline-code">npm run dev</div>
              and the frame below loads Telegram Web at{' '}
              <code>localhost:5173/k/</code> — same origin as this page.
            </div>
          </div>
          <div className="step-row warn-row">
            <span className="step-badge warn">!</span>
            <div>
              What to check: does Telegram show the login/QR screen? Can you log in?
              Does the chat list appear? Note any remaining errors in DevTools.
            </div>
          </div>
        </div>
      )}

      {mode === 'direct' && (
        <div className="direct-warning">
          <strong>Expected error in DevTools Console:</strong>
          <div className="inline-code">
            Refused to display 'https://web.telegram.org/' in a frame because it set 'X-Frame-Options' to 'deny'.
          </div>
          Frame below is blank — browser enforcing the restriction.
        </div>
      )}

      <div className="iframe-wrap">
        <iframe
          key={iframeKey}
          src={src}
          title="Telegram Web"
          allow="camera; microphone; notifications"
        />
        {mode === 'direct' && (
          <div className="iframe-blocked-overlay">
            <div className="icon">🚫</div>
            <div>Frame blocked by browser</div>
            <div className="sub">Open DevTools → Console to see the X-Frame-Options error</div>
          </div>
        )}
      </div>

      <div className="result-box">
        <strong>Why this works (same-origin proxy):</strong>
        <ul>
          <li>iframe src = <code>/k/</code> → resolves to <code>localhost:5173/k/</code></li>
          <li>Parent page = <code>localhost:5173</code> → same protocol, host, port</li>
          <li>Cross-origin navigation restrictions don't apply between same-origin frames</li>
          <li>Vite strips <code>X-Frame-Options</code> + <code>CSP</code> before the browser sees them</li>
        </ul>
      </div>
    </div>
  )
}
