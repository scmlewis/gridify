# Phase 4: Service Worker Activation & Manifest Integration

## Task Description

Integrate PWA updates. Set up `vite-plugin-pwa` within the project. Create a service-worker updates UI element displaying an operational prompt to reload client sessions when update signals flag active caches.

## Requirements

1. **Install vite-plugin-pwa** as a dev dependency
2. **Configure PWA manifest** — site name, theme color, icons, etc.
3. **Service Worker** — configure the SW with appropriate caching strategies
4. **Update prompt** — When a new SW is detected, show a toast/banner prompting user to refresh

## File Changes

### vite.config.ts
Add PWA plugin configuration:
```ts
import { VitePWA } from 'vite-plugin-pwa'

// Add to plugins array:
VitePWA({
  registerType: 'prompt',
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-cache',
          expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }
        }
      }
    ]
  },
  manifest: {
    name: 'Habit Tracker',
    short_name: 'Habits',
    description: 'A high-density habit tracker with contribution grid',
    theme_color: '#111827',
    background_color: '#111827',
    display: 'standalone',
    icons: [
      { src: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/favicon-512x512.png', sizes: '512x512', type: 'image/png' },
      { src: '/favicon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
    ]
  }
})
```

### src/components/UpdatePrompt.tsx
Create a toast/banner component that:
- Listens for the PWA update event via `useSWReg()` from vite-plugin-pwa
- Shows a non-intrusive banner at bottom of screen when update is available
- Has a "Refresh" button that calls `window.location.reload()`
- Dismissible with an X button
- Styled consistently with dark theme

### src/App.tsx
Import and render `<UpdatePrompt />` at the app root level.

### public/
Create placeholder icons:
- `favicon.svg` (already exists from Vite scaffold, can keep as-is)
- Generate simple SVG icons for PWA manifest (192x192 and 512x512 can be the same favicon SVG)

### index.html
Add PWA meta tags:
```html
<meta name="theme-color" content="#111827">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="apple-touch-icon" href="/favicon.svg">
```

## Caching Strategy

- **HTML shell**: CacheFirst (app shell is versioned via Vite build hashes)
- **CSS/JS assets**: StaleWhileRevalidate (fast load, background update)
- **Fonts**: CacheFirst with long expiration
- **Images**: CacheFirst

## Context

This is the final phase. All previous phases are complete:
- Phase 1: Database layer (db.ts, types.ts)
- Phase 2: ContributionGrid component + math utilities
- Phase 3: Dashboard UI with optimistic check-ins

The app currently works as a single-page React app. Adding PWA support will make it installable and work offline.

## Verification

After implementation:
1. `npm run build` should succeed
2. `npm run preview` should serve the built app
3. The manifest should be served at `/manifest.webmanifest`
4. Service worker should be registered
5. Update prompt component should be present in the DOM
