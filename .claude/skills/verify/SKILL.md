---
name: verify
description: How to build, run, and visually verify this portfolio site (Vite SPA) end-to-end
---

# Verifying changes in this repo

## Build & run

```bash
npm run build                    # TypeScript check + production build (singlefile → dist/index.html; public/ copied as-is)
npm run dev                      # Vite dev server; picks next free port if 5173 is busy — read the startup output
```

## Driving the app

**Claude-in-Chrome does not work against this user's Chrome** — every
executeScript-based tool (screenshot, find, get_page_text) times out with
"Page still loading (document_idle)", even on static files like /robots.txt.
Likely a conflict with another installed extension. Don't burn attempts on it.

**Use the cached Playwright headless Chromium instead** (no downloads needed):

```bash
SHELL_BIN=~/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell
"$SHELL_BIN" --headless --disable-gpu --screenshot=out.png \
  --window-size=1440,14000 --virtual-time-budget=15000 --hide-scrollbars \
  "http://localhost:PORT/route"
```

- Tall `--window-size` substitutes for scrolling; `--virtual-time-budget`
  fast-forwards GSAP/ScrollTrigger so `.gsap-hidden` / reveal-on-scroll content
  is visible. The FURY case page is ~18,600px tall.
- Crop slices for viewing: `sips --cropOffset <y> 0 -c <h> 1440 img.png`
  (mutates in place — work on a copy).
- Inspect rendered DOM: `--dump-dom` instead of `--screenshot`, then grep.
- Mobile check: `--window-size=390,3600`.

## Supabase data vs fallback

`.env` here has real Supabase credentials, so pages render **live DB data**,
not the fallback arrays in `src/hooks/useSupabaseData.ts`. To force the
fallback path, override with the placeholder values `isSupabaseConfigured()`
rejects:

```bash
VITE_SUPABASE_URL="https://YOUR_PROJECT_ID.supabase.co" \
VITE_SUPABASE_ANON_KEY="YOUR_ANON_KEY" \
npm run dev -- --port 5175 --strictPort
```

(Shell env overrides `.env` in Vite.)

## Flows worth driving

- Home → "Selected Work" cards: `link` starting with `/` renders a react-router
  `<a href="/work/…" data-discover="true">` (internal, same tab); `http…` renders
  `<a target="_blank">`; `#` renders an inert anchor with no href.
- `/work/telegram-mini-app-games`: hero + 4 sections + CTA; 16 jpgs + 2 mp4s
  from `/case-studies/fury-casino/` (curl them for 200s).
- Unknown routes (e.g. `/work/xyz`) render an empty content area — there is no
  404 route; that's pre-existing site-wide behavior.
