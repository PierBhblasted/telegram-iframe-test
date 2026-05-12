export default function IframeTest() {
  return (
    <div className="panel">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <h2>iframe approach</h2>
        <span className="badge fail">FAILS</span>
      </div>

      <p>
        Attempting to embed <code>https://web.telegram.org</code> in an iframe.
        Telegram Web sends <strong>X-Frame-Options: DENY</strong> on every response,
        which makes browsers refuse to render it inside any frame — no workaround exists
        client-side.
      </p>

      <div className="code-block">{`// What you'd try in Lovable / React:
<iframe
  src="https://web.telegram.org/k/#@username"
  width="100%"
  height="600"
/>

// Browser console error you get:
// Refused to display 'https://web.telegram.org/' in a frame
// because it set 'X-Frame-Options' to 'deny'.`}</div>

      {/* Actual iframe attempt — will be blocked by browser */}
      <div className="iframe-container">
        <iframe
          src="https://web.telegram.org"
          title="Telegram Web (blocked)"
          onError={() => {}}
        />
        {/* Overlay shown because iframe will be blank/blocked */}
        <div className="iframe-overlay">
          <div className="icon">🚫</div>
          <h3>iframe blocked by browser</h3>
          <p>
            Telegram Web (and WhatsApp Web, Discord, etc.) sends{' '}
            <code>X-Frame-Options: DENY</code>. The iframe above is present in the DOM
            but renders nothing. Open DevTools → Console to see the error.
          </p>
        </div>
      </div>

      <ul>
        <li>No proxy trick fixes this — the header comes from Telegram's servers</li>
        <li>A reverse proxy stripping the header violates Telegram ToS</li>
        <li>Result: iframe approach is a dead end for all major chat platforms</li>
      </ul>
    </div>
  )
}
