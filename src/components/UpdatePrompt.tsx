import { useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

export function UpdatePrompt() {
  const [dismissed, setDismissed] = useState(false)

  const {
    offlineReady: [offlineReady],
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl) {
      void swUrl
    },
  })

  if (dismissed || (!offlineReady && !needRefresh)) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-surface-card px-4 py-3 shadow-lg border border-border" style={{ boxShadow: '0 4px 20px rgba(43, 168, 162, 0.12)' }}>
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-text-primary">
          {needRefresh ? 'New version available' : 'Ready for offline use'}
        </span>
        {needRefresh && (
          <button
            onClick={() => updateServiceWorker(true)}
            className="rounded-full bg-accent-gold px-3 py-1 text-sm font-bold text-surface-base hover:bg-accent-light active:scale-95 transition-all"
          >
            Refresh
          </button>
        )}
        <button
          onClick={() => setDismissed(true)}
          className="ml-1 text-text-muted hover:text-coral transition-colors"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
