import { useState } from 'react'
import './IframeTest.css'

type Mode = 'proxy' | 'direct'
type TgVersion = 'k' | 'a'

export default function IframeTest() {
  const [mode, setMode] = useState<Mode>('proxy')
  const [version, setVersion] = useState<TgVersion>('k')
  const [iframeKey, setIframeKey] = useState(0)

  const src = mode === 'proxy'
    ? `/${version}/`
    : `https://web.telegram.org/${version}/`

  const reload = () => setIframeKey(k => k + 1)

  return (
    <div className="panel main-panel">
      <div className="panel-header">
        <div>
          <h2>Telegram Web in-app</h2>
          <p className="panel-desc">
            Vite proxies Telegram paths on the same port — same-origin iframe, no navigation blocks.
            If QR login fails, switch to version A (older, more iframe-tolerant).
          </p>
        </div>
      </div>

      <div className="controls-bar">
        <div className="mode-toggle">
          <button className={mode === 'proxy' ? 'active' : ''} onClick={() => { setMode('proxy'); reload() }}>
            Via Vite proxy
          </button>
          <button className={mode === 'direct' ? 'active' : ''} onClick={() => { setMode('direct'); reload() }}>
            Direct (shows block)
          </button>
        </div>

        <div className="mode-toggle">
          <button className={version === 'k' ? 'active' : ''} onClick={() => { setVersion('k'); reload() }}>
            Web K (modern)
          </button>
          <button className={version === 'a' ? 'active' : ''} onClick={() => { setVersion('a'); reload() }}>
            Web A (legacy)
          </button>
        </div>

        <button className="reload-btn" onClick={reload}>↺ Reload frame</button>
      </div>

      {mode === 'proxy' && (
        <div className="proxy-instructions">
          <div className="step-row">
            <span className="step-badge done">✓</span>
            <div>
              <strong>No extra setup</strong> — just <code>npm run dev</code>.
              iframe src = <code>/{version}/</code> → proxied through Vite on same port → same-origin.
            </div>
          </div>
          <div className="step-row warn-row">
            <span className="step-badge warn">!</span>
            <div>
              <strong>If QR shows "AUTH_TOKEN_EXPIRED":</strong> the MTProto WebSocket that keeps
              the QR token alive may be dropping. Check <strong>DevTools → Network → WS</strong> tab —
              you should see active WebSocket connections to <code>wss://*.web.telegram.org/apiws</code>.
              If none: try <strong>Web A</strong> (legacy version handles WS differently).
            </div>
          </div>
          <div className="step-row warn-row">
            <span className="step-badge warn">!</span>
            <div>
              <strong>Alternative login:</strong> if QR keeps failing, try{' '}
              <strong>phone number login</strong> inside the frame — it doesn't rely on
              the persistent WebSocket the same way QR does.
            </div>
          </div>
        </div>
      )}

      {mode === 'direct' && (
        <div className="direct-warning">
          <strong>Expected console error:</strong>
          <div className="inline-code">
            Refused to display 'https://web.telegram.org/' in a frame because it set 'X-Frame-Options' to 'deny'.
          </div>
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
            <div className="sub">Open DevTools → Console to see the error</div>
          </div>
        )}
      </div>

      <div className="result-box">
        <strong>Proxied paths (Vite → web.telegram.org):</strong>
        <ul>
          <li><code>/k/</code> <code>/a/</code> — app entry points</li>
          <li><code>/js/</code> <code>/css/</code> <code>/img/</code> — static assets</li>
          <li><code>/apiws</code> — MTProto WebSocket (QR token keep-alive + auth confirmation)</li>
          <li><code>/api/</code> <code>/file/</code> — HTTP API fallbacks</li>
        </ul>
      </div>
    </div>
  )
}
