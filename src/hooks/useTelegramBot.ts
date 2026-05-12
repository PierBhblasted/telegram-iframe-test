import { useState, useEffect, useCallback, useRef } from 'react'

export interface TgMessage {
  id: number
  from: string
  text: string
  date: number
  isOwn: boolean
  chatId: number
}

export interface TgUpdate {
  update_id: number
  message?: {
    message_id: number
    from: { first_name: string; last_name?: string; username?: string }
    chat: { id: number; first_name?: string; type: string }
    text?: string
    date: number
  }
}

export function useTelegramBot(token: string) {
  const [messages, setMessages] = useState<TgMessage[]>([])
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [chatId, setChatId] = useState<number | null>(null)
  const offsetRef = useRef(0)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const apiBase = `https://api.telegram.org/bot${token}`

  const poll = useCallback(async () => {
    if (!token) return
    try {
      const res = await fetch(
        `${apiBase}/getUpdates?offset=${offsetRef.current}&timeout=5`
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: { ok: boolean; result: TgUpdate[] } = await res.json()
      if (!data.ok) throw new Error('Telegram API returned ok=false')

      setConnected(true)
      setError(null)

      for (const update of data.result) {
        offsetRef.current = update.update_id + 1
        if (update.message?.text) {
          const msg = update.message
          const name = [msg.from.first_name, msg.from.last_name].filter(Boolean).join(' ')
          if (!chatId) setChatId(msg.chat.id)
          setMessages(prev => [
            ...prev,
            {
              id: msg.message_id,
              from: name,
              text: msg.text!,
              date: msg.date,
              isOwn: false,
              chatId: msg.chat.id,
            },
          ])
        }
      }
    } catch (e) {
      setConnected(false)
      setError(e instanceof Error ? e.message : 'Unknown error')
    }
  }, [token, apiBase, chatId])

  useEffect(() => {
    if (!token) return
    poll()
    pollingRef.current = setInterval(poll, 3000)
    return () => { if (pollingRef.current) clearInterval(pollingRef.current) }
  }, [token, poll])

  const sendMessage = useCallback(async (text: string, targetChatId: number) => {
    const res = await fetch(`${apiBase}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: targetChatId, text }),
    })
    const data = await res.json()
    if (data.ok) {
      setMessages(prev => [
        ...prev,
        {
          id: data.result.message_id,
          from: 'You (agent)',
          text,
          date: data.result.date,
          isOwn: true,
          chatId: targetChatId,
        },
      ])
    }
    return data
  }, [apiBase])

  return { messages, connected, error, chatId, sendMessage }
}
