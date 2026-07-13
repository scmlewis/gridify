import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { promises as fs } from 'node:fs'
import path from 'node:path'

const FALLBACK_SITE_URL = 'https://USERNAME.github.io/gridify'

function seoPlugin(siteUrl: string): Plugin {
  return {
    name: 'gridify-seo',
    transformIndexHtml(html) {
      return html.replaceAll('%SITE_URL%', siteUrl)
    },
    async writeBundle(outputOptions) {
      const outDir = outputOptions.dir
      if (!outDir) return
      for (const name of ['robots.txt', 'sitemap.xml']) {
        const file = path.join(outDir, name)
        try {
          const contents = await fs.readFile(file, 'utf8')
          await fs.writeFile(file, contents.split(FALLBACK_SITE_URL).join(siteUrl))
        } catch {
          // file not emitted (e.g. not in public/) — nothing to rewrite
        }
      }
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const siteUrl = env.VITE_SITE_URL || FALLBACK_SITE_URL

  return {
  base: '/gridify/',
  plugins: [
    react(),
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
        name: 'Gridify',
        short_name: 'Gridify',
        description: 'A high-density habit tracker with contribution grid',
        theme_color: '#111827',
        background_color: '#111827',
        display: 'standalone',
        icons: [
          { src: '/gridify/favicon.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: '/gridify/favicon.svg', sizes: '512x512', type: 'image/svg+xml' }
        ]
      }
    }),
    seoPlugin(siteUrl)
  ],
}
})
