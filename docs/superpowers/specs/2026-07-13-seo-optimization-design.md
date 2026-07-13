# SEO Optimization Design — Gridify (Static-shell)

**Date:** 2026-07-13
**Status:** Approved (design)
**Goal:** Improve app discoverability and social sharing for Gridify, an offline-first React/Vite PWA habit tracker deployed to GitHub Pages at base `/gridify/`. No backend, single route, all user data in IndexedDB.

## Constraints & Reality

- Gridify is a client-side SPA with no server-side rendering. Search engines and crawlers only ever see the static `index.html` shell, never user content. Therefore SEO work is limited to static-shell improvements; there is no per-page content to index.
- This is intentional given the chosen goal (app discoverability + good share cards), not a limitation to fix here. Prerendering/SSR is explicitly out of scope.
- Base path is `/gridify/` (set in `vite.config.ts`). All absolute asset URLs must include this base.

## Site URL strategy

All absolute URLs (canonical, OG `og:url`, `og:image`, `twitter:image`, `sitemap.xml` location in `robots.txt`) are derived from a single source: the `VITE_SITE_URL` environment variable, e.g. `https://USERNAME.github.io/gridify`. A fallback default of `https://USERNAME.github.io/gridify` is used when the var is unset, so the build never breaks. The value is injected at build time via `import.meta.env.VITE_SITE_URL`.

## Changes

### 1. `index.html` — meta enrichment

Add the following inside `<head>`, preserving existing `title`, `viewport`, `theme-color`, icon links, and `lang="en"`:

- Description:
  `<meta name="description" content="Gridify — a high-density, offline-first habit tracker with a Git-style contribution grid. Track streaks, build patterns, and stay consistent.">`
- Keywords:
  `<meta name="keywords" content="habit tracker, habit grid, streak tracker, productivity, contribution grid, offline PWA">`
- Author / application name:
  `<meta name="author" content="Gridify">`
  `<meta name="application-name" content="Gridify">`
- Crawl directive:
  `<meta name="robots" content="index, follow, max-image-preview:large">`
- Canonical (value from `VITE_SITE_URL`):
  `<link rel="canonical" href="%SITE_URL%">`
- Open Graph:
  - `og:type` = `website`
  - `og:site_name` = `Gridify`
  - `og:title` = `Gridify — High-Density Habit Tracker`
  - `og:description` = same as meta description
  - `og:url` = `%SITE_URL%`
  - `og:image` = `%SITE_URL%/og-image.svg`
  - `og:image:width` = `1200`, `og:image:height` = `630`
  - `og:image:alt` = `Gridify habit tracker contribution grid`
- Twitter:
  - `twitter:card` = `summary_large_image`
  - `twitter:title` = `Gridify — High-Density Habit Tracker`
  - `twitter:description` = same as meta description
  - `twitter:image` = `%SITE_URL%/og-image.svg`

The `%SITE_URL%` tokens are replaced at build time. Because `index.html` is processed by Vite, the cleanest approach is to inject values via a tiny transform (e.g. a Vite plugin or a prebuild script) OR to set them with a small inline script. Decision: use a minimal Vite plugin in `vite.config.ts` that replaces `%SITE_URL%` placeholders in `index.html` during build and dev, reading `import.meta.env.VITE_SITE_URL` (with the documented fallback). This keeps `index.html` static and avoids runtime JS mutating the head.

### 2. Social share image — `public/og-image.svg`

A 1200×630 SVG social card:
- Background `#111827` (matches theme/brand).
- Decorative contribution-grid motif (a small matrix of rounded squares in varying intensities of the brand accent) on one side.
- App wordmark "Gridify" and tagline "Track habits. Build streaks. Stay consistent." in light text.
- Vector only, no external fonts (use system/embedded font stack or convert text to paths to avoid font-loading dependency). Reference it at `/gridify/og-image.svg`.

Note: SVG OG images render on most platforms (LinkedIn, Discord, Slack) but not reliably on Twitter/Facebook. PNG export is a future optional step, out of scope here.

### 3. `public/robots.txt`

```
User-agent: *
Allow: /
Sitemap: %SITE_URL%/sitemap.xml
```

The `Sitemap` line uses the resolved `VITE_SITE_URL`. Since `public/` files are copied verbatim by Vite (not processed for env vars), the sitemap URL is written with the resolved value at build time by the same Vite plugin (copy/replace), or a small prebuild step generates `robots.txt` and `sitemap.xml` into `public/`. Decision: generate both `robots.txt` and `sitemap.xml` via the build-time step using the resolved `VITE_SITE_URL`, writing them into `public/` (gitignored generated artifacts) or committed with a placeholder replaced at build. Final choice: the Vite plugin emits/replaces these files at build; committed copies use the `USERNAME` placeholder fallback so the repo is self-consistent.

### 4. `public/sitemap.xml`

Single URL entry for the app root:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>%SITE_URL%/</loc>
    <lastmod>2026-07-13</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

`%SITE_URL%` and `lastmod` resolved at build time.

### 5. JSON-LD structured data

Inline in `index.html` `<head>`:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Gridify",
  "description": "A high-density, offline-first habit tracker with a Git-style contribution grid.",
  "applicationCategory": "ProductivityApplication",
  "operatingSystem": "Web, Android, iOS",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "url": "%SITE_URL%/"
}
</script>
```

`%SITE_URL%` resolved at build time.

### 6. Light semantic HTML (low-risk)

In `src/App.tsx`, wrap the main app content region in a `<main>` landmark (the existing top-level `<div className="min-h-screen ...">` becomes or contains `<main>`). No behavioral or styling change; improves accessibility and document structure for crawlers.

## Out of scope

- Prerendering / SSR / `vite-ssg`.
- Per-route dynamic meta management (single route).
- Keyword-ranking / link-building campaigns.
- PNG social image export (SVG chosen).

## Verification

- `npm run build` succeeds and the generated `dist/index.html` contains the resolved `og:`, `twitter:`, canonical, JSON-LD, and description tags with correct `/gridify/` absolute URLs.
- `dist/robots.txt` and `dist/sitemap.xml` exist with the resolved sitemap URL.
- `dist/og-image.svg` is present and valid.
- `npm run lint` and `npm run test` pass (no logic change beyond the `<main>` wrapper, so tests should be unaffected; re-run to confirm).
- Manual: `npm run preview`, view source, confirm meta tags render and the OG image loads.
