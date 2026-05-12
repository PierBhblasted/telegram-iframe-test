import { useState } from 'react'
import IframeTest from './components/IframeTest'
import BotChatDemo from './components/BotChatDemo'
import './App.css'

type Tab = 'iframe' | 'bot'

export default function App() {
  const [tab, setTab] = useState<Tab>('iframe')

  return (
    <div className="app">
      <header>
        <h1>Telegram in-app — integration test</h1>
        <p className="subtitle">
          Goal: client can chat via Telegram without leaving the Lovable app
        </p>
      </header>

      <div className="tabs">
        <button
          className={tab === 'iframe' ? 'active' : ''}
          onClick={() => setTab('iframe')}
        >
          Option 1 — Embed Telegram Web (preferred)
        </button>
        <button
          className={tab === 'bot' ? 'active' : ''}
          onClick={() => setTab('bot')}
        >
          Option 2 — Bot API widget (fallback)
        </button>
      </div>

      {tab === 'iframe' && <IframeTest />}
      {tab === 'bot' && <BotChatDemo />}
    </div>
  )
}
