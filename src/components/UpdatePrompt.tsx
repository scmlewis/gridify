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
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 shadow-lg">
      <div className="flex items-center gap-3">
        <span className="text-sm text-zinc-200">
          {needRefresh ? 'New version available' : 'Ready for offline use'}
        </span>
        {needRefresh && (
          <button
            onClick={() => updateServiceWorker(true)}
            className="rounded bg-purple-600 px-3 py-1 text-sm font-medium text-white hover:bg-purple-500"
          >
            Refresh
          </button>
        )}
        <button
          onClick={() => setDismissed(true)}
          className="ml-1 text-zinc-400 hover:text-zinc-200"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
