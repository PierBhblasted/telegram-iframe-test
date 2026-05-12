import { useState, useRef, useEffect } from 'react'
import { useTelegramBot } from '../hooks/useTelegramBot'
import './BotChatDemo.css'

export default function BotChatDemo() {
  const [token, setToken] = useState('')
  const [activeToken, setActiveToken] = useState('')
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, connected, error, chatId, sendMessage } = useTelegramBot(activeToken)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleConnect = () => {
    if (token.trim()) setActiveToken(token.trim())
  }

  const handleSend = async () => {
    if (!input.trim() || !chatId) return
    await sendMessage(input.trim(), chatId)
    setInput('')
  }

  return (
    <div className="panel">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <h2>Bot API chat widget</h2>
        <span className="badge ok">WORKS</span>
      </div>

      <p>
        Custom React component that polls the Telegram Bot API. Client messages appear
        in real time; you reply directly in the app. No iframe. This is the architecture
        to port into Lovable.
      </p>

      {!activeToken ? (
        <div className="setup-box">
          <h3>Setup</h3>
          <ol>
            <li>Open Telegram and message <code>@BotFather</code></li>
            <li>Send <code>/newbot</code> and follow the steps</li>
            <li>Copy the bot token (format: <code>123456:ABC-xxx</code>)</li>
            <li>Have a client message your bot first (so there is a chat_id to reply to)</li>
          </ol>
          <div className="token-input">
            <input
              type="text"
              placeholder="Paste bot token here"
              value={token}
              onChange={e => setToken(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleConnect()}
            />
            <button onClick={handleConnect}>Connect</button>
          </div>
        </div>
      ) : (
        <div className="chat-widget">
          <div className="chat-header">
            <div className={`status-dot ${connected ? 'online' : 'offline'}`} />
            <span>{connected ? 'Connected — polling every 3s' : 'Connecting…'}</span>
            {error && <span className="err">{error}</span>}
            <button className="disconnect-btn" onClick={() => setActiveToken('')}>
              Disconnect
            </button>
          </div>

          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="empty-state">
                Waiting for a message from the client via Telegram…
              </div>
            )}
            {messages.map(msg => (
              <div key={msg.id} className={`message ${msg.isOwn ? 'own' : 'theirs'}`}>
                {!msg.isOwn && <div className="from">{msg.from}</div>}
                <div className="bubble">{msg.text}</div>
                <div className="time">
                  {new Date(msg.date * 1000).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input">
            <input
              type="text"
              placeholder={chatId ? 'Type a reply…' : 'Waiting for first message to get chat_id…'}
              value={input}
              disabled={!chatId}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend} disabled={!chatId || !input.trim()}>
              Send
            </button>
          </div>
        </div>
      )}

      <details>
        <summary style={{ cursor: 'pointer', color: '#38bdf8', fontSize: '0.85rem' }}>
          How to port this to Lovable (Supabase Edge Function architecture)
        </summary>
        <div className="code-block" style={{ marginTop: '0.75rem' }}>{`
// Option A — direct from browser (demo mode, token in env)
// Works for internal tools, not public apps (token exposed)
const res = await fetch(
  \`https://api.telegram.org/bot\${BOT_TOKEN}/getUpdates\`
)

// Option B — Supabase Edge Function (RECOMMENDED for Lovable)
// supabase/functions/telegram-proxy/index.ts
serve(async (req) => {
  const { action, payload } = await req.json()
  const BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')

  if (action === 'getUpdates') {
    const res = await fetch(
      \`https://api.telegram.org/bot\${BOT_TOKEN}/getUpdates?offset=\${payload.offset}\`
    )
    return new Response(await res.text(), { headers: { 'Content-Type': 'application/json' } })
  }

  if (action === 'sendMessage') {
    const res = await fetch(\`https://api.telegram.org/bot\${BOT_TOKEN}/sendMessage\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return new Response(await res.text(), { headers: { 'Content-Type': 'application/json' } })
  }
})

// Token lives in Supabase secrets, never sent to browser.
// Replace fetch calls in useTelegramBot.ts with calls to your edge function URL.
`}</div>
      </details>
    </div>
  )
}
