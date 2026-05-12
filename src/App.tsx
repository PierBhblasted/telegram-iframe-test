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
        <h1>Telegram Integration Test</h1>
        <p className="subtitle">Testing what works for embedding Telegram in a Lovable app</p>
      </header>

      <div className="tabs">
        <button
          className={tab === 'iframe' ? 'active' : ''}
          onClick={() => setTab('iframe')}
        >
          Test 1: iframe approach
        </button>
        <button
          className={tab === 'bot' ? 'active' : ''}
          onClick={() => setTab('bot')}
        >
          Test 2: Bot API chat widget ✓
        </button>
      </div>

      {tab === 'iframe' && <IframeTest />}
      {tab === 'bot' && <BotChatDemo />}
    </div>
  )
}
