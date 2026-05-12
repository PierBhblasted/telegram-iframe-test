import { useState } from 'react'
import './IframeTest.css'

type Mode = 'proxy' | 'direct'

export default function IframeTest() {
  const [mode, setMode] = useState<Mode>('proxy')
  const [proxyRunning, setProxyRunning] = useState(false)
  const [iframeKey, setIframeKey] = useState(0) // force remount on mode change

  const src = mode === 'proxy'
    ? 'http://localhost:3001'
    : 'https://web.telegram.org'

  const reload = () => setIframeKey(k => k + 1)

  return (
    <div className="panel main-panel">
      <div className="panel-header">
        <div>
          <h2>Telegram Web in-app</h2>
          <p className="panel-desc">
            Embeds Telegram Web via a local proxy that strips framing restrictions.
            Run the proxy server first, then reload the frame.
          </p>
        </div>
      </div>

      <div className="controls-bar">
        <div className="mode-toggle">
          <button
            className={mode === 'proxy' ? 'active' : ''}
            onClick={() => { setMode('proxy'); reload() }}
          >
            Proxy mode (strips X-Frame-Options)
          </button>
          <button
            className={mode === 'direct' ? 'active' : ''}
            onClick={() => { setMode('direct'); reload() }}
          >
            Direct (shows browser block)
          </button>
        </div>

        <button className="reload-btn" onClick={reload} title="Reload iframe">
          ↺ Reload frame
        </button>
      </div>

      {mode === 'proxy' && (
        <div className="proxy-instructions">
          <div className="step-row">
            <span className={`step-badge ${proxyRunning ? 'done' : ''}`}>
              {proxyRunning ? '✓' : '1'}
            </span>
            <div>
              <strong>Start the proxy</strong> — open a terminal in the project root and run:
              <div className="inline-code">node server/proxy.js</div>
              You should see: <em>Telegram proxy running → http://localhost:3001</em>
            </div>
            <button
              className={`confirm-btn ${proxyRunning ? 'confirmed' : ''}`}
              onClick={() => { setProxyRunning(true); reload() }}
            >
              {proxyRunning ? 'Running ✓' : 'Mark as running'}
            </button>
          </div>
          <div className="step-row">
            <span className="step-badge">2</span>
            <div>
              <strong>Reload frame</strong> — click ↺ Reload frame above (or it reloads automatically).
              Telegram Web should appear below.
            </div>
          </div>
          <div className="step-row warn-row">
            <span className="step-badge warn">!</span>
            <div>
              If the frame loads but stays blank/crashes: Telegram Web's JS tries to connect
              directly to Telegram servers via WebSocket — the proxy handles WS too (<code>ws: true</code>),
              but auth cookies may not transfer. Note result in README.
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
          The iframe below will be blank — this is the browser enforcing the restriction.
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
        {mode === 'proxy' && !proxyRunning && (
          <div className="iframe-blocked-overlay">
            <div className="icon">⏳</div>
            <div>Start the proxy server first</div>
            <div className="sub">See step 1 above</div>
          </div>
        )}
      </div>

      <div className="result-box">
        <strong>Testing this approach:</strong>
        <ul>
          <li>Proxy strips <code>X-Frame-Options</code> and <code>Content-Security-Policy</code> → frame loads</li>
          <li>Telegram Web JS runs but connects to Telegram servers directly (bypasses proxy) → auth/WebSocket may work or not</li>
          <li>If Telegram UI appears and you can log in → architecture is viable</li>
          <li>If blank after login or broken → fall back to Tab 2 (Bot API widget)</li>
        </ul>
      </div>
    </div>
  )
}
