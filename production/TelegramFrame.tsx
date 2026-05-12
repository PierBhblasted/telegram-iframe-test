/**
 * Drop this component into your Lovable app.
 * No extra config needed — the Cloudflare Worker handles the proxy.
 * The iframe src="/k/" is same-origin → no browser restrictions.
 */

interface TelegramFrameProps {
  className?: string
}

export default function TelegramFrame({ className }: TelegramFrameProps) {
  return (
    <iframe
      src="/k/"
      title="Telegram"
      allow="camera; microphone; notifications"
      className={className}
      style={{ border: 'none', width: '100%', height: '100%' }}
    />
  )
}

// Usage in Lovable:
//
// <TelegramFrame className="w-full h-[600px] rounded-xl" />
//
// Or full-screen panel:
// <div className="fixed inset-0 z-50">
//   <TelegramFrame />
// </div>
