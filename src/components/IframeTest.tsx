import { useState } from 'react'
import './IframeTest.css'

type Mode = 'vite' | 'crossorigin' | 'direct'
type TgVersion = 'k' | 'a'

export default function IframeTest() {
  const [mode, setMode] = useState<Mode>('vite')
  const [version, setVersion] = useState<TgVersion>('k')
  const [workerUrl, setWorkerUrl] = useState('')
  const [iframeKey, setIframeKey] = useState(0)

  const src = (() => {
    if (mode === 'vite') return `/${version}/`
    if (mode === 'crossorigin') {
      const base = workerUrl.replace(/\/$/, '')
      return base ? `${base}/${version}/` : ''
    }
    return `https://web.telegram.org/${version}/`
  })()

  const reload = () => setIframeKey(k => k + 1)

  return (
    <div className="panel main-panel">
      <div className="panel-header">
        <div>
          <h2>Telegram Web in-app</h2>
          <p className="panel-desc">
            Three modes: Vite proxy (same-origin, works in dev), Cloudflare Worker
            (cross-origin test), and direct (proves the block).
          </p>
        </div>
      </div>

      <div className="controls-bar">
        <div className="mode-toggle">
          <button className={mode === 'vite' ? 'active' : ''} onClick={() => { setMode('vite'); reload() }}>
            Vite proxy
          </button>
          <button className={mode === 'crossorigin' ? 'active' : ''} onClick={() => { setMode('crossorigin'); reload() }}>
            Cloudflare Worker
          </button>
          <button className={mode === 'direct' ? 'active' : ''} onClick={() => { setMode('direct'); reload() }}>
            Direct
          </button>
        </div>

        <div className="mode-toggle">
          <button className={version === 'k' ? 'active' : ''} onClick={() => { setVersion('k'); reload() }}>
            Web K
          </button>
          <button className={version === 'a' ? 'active' : ''} onClick={() => { setVersion('a'); reload() }}>
            Web A
          </button>
        </div>

        <button className="reload-btn" onClick={reload}>↺</button>
      </div>

      {mode === 'vite' && (
        <div className="proxy-instructions">
          <div className="step-row">
            <span className="step-badge done">✓</span>
            <div>Same-origin via Vite proxy — works in dev, not in production without infra.</div>
          </div>
        </div>
      )}

      {mode === 'crossorigin' && (
        <div className="proxy-instructions">
          <div className="step-row">
            <span className="step-badge">1</span>
            <div>
              <strong>Deploy the Worker</strong> (one-time, free):
              <div className="inline-code">npm install -g wrangler</div>
              <div className="inline-code">wrangler login</div>
              <div className="inline-code">wrangler deploy production/worker-option1.js --name telegram-proxy --compatibility-date 2024-01-01</div>
              You get a URL like <code>https://telegram-proxy.YOURNAME.workers.dev</code>
            </div>
          </div>
          <div className="step-row">
            <span className="step-badge">2</span>
            <div style={{ flex: 1 }}>
              <strong>Paste the Worker URL below</strong> and click Load:
              <div className="token-input" style={{ marginTop: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="https://telegram-proxy.yourname.workers.dev"
                  value={workerUrl}
                  onChange={e => setWorkerUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && reload()}
                />
                <button onClick={reload} disabled={!workerUrl.trim()}>Load</button>
              </div>
            </div>
          </div>
          <div className="step-row warn-row">
            <span className="step-badge warn">!</span>
            <div>
              <strong>What to watch for:</strong> the iframe is cross-origin from this page.
              You will see a <code>window.top navigation</code> error in the console.
              The test: does Telegram still load and can you log in despite that error?
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
        {src ? (
          <iframe
            key={iframeKey}
            src={src}
            title="Telegram Web"
            allow="camera; microphone; notifications"
          />
        ) : null}

        {mode === 'direct' && (
          <div className="iframe-blocked-overlay">
            <div className="icon">🚫</div>
            <div>Frame blocked by browser</div>
            <div className="sub">Open DevTools → Console</div>
          </div>
        )}
        {mode === 'crossorigin' && !workerUrl && (
          <div className="iframe-blocked-overlay">
            <div className="icon">⏳</div>
            <div>Paste your Worker URL above</div>
          </div>
        )}
      </div>

      <div className="result-box">
        <strong>Option 1 verdict (cross-origin Worker):</strong>
        <ul>
          <li>If login works → use the Worker URL as iframe src in Lovable. Done, free, no custom domain.</li>
          <li>If <code>window.top</code> error breaks login → go Option 2 (Cloudflare Pages, same-origin).</li>
        </ul>
      </div>
    </div>
  )
}
