# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Vite)
npm run build     # TypeScript check + production build
npm run preview   # Preview production build locally
npm test          # Run the vitest suite (12 tests)
```

## Architecture

**Stack:** React 19 + TypeScript + Vite + Tailwind CSS v4 + Supabase + GSAP + Lenis

This is a personal portfolio site (UX/UI designer) with a brutalist black-and-white aesthetic.

### Data Flow

All content (case studies, work experience, contact links) is stored in **Supabase** and fetched via hooks in `src/hooks/useSupabaseData.ts`. Each hook (`useCaseStudies`, `useWorkExperience`, `useContactLinks`) has a static fallback array that renders when Supabase env vars are absent — so the site works without a database configured. The `isSupabaseConfigured()` guard checks for `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

### Animation System

Two animation layers are wired together in `src/components/SmoothScroll.tsx`:
- **Lenis** provides smooth-scroll inertia; its rAF loop is driven by GSAP's ticker (not its own) so they stay in sync.
- **GSAP + ScrollTrigger** drives all entrance animations. `src/hooks/useScrollReveal.ts` exports `useScrollReveal` (single element) and `useScrollRevealChildren` (staggered list) — both respect `prefers-reduced-motion`.

Elements that animate in must start hidden; use the `.gsap-hidden` CSS class or set `opacity: 0` in the GSAP `fromTo` call.

### Routing & Layout

`src/App.tsx` wraps everything in `<BrowserRouter>` → `<SmoothScroll>` → `<Layout>`. Routes include `/`, `/about`, `/hire`, `/contact`, `/work/:slug` and `/admin`. `/hire` is the secondary recruiter-facing path (CV, experience, education) — the navbar links to it as "CV", separate from the client-facing "Hire Me →" CTA which targets `/contact`. The footer is hidden on `/admin`. `ScrollReset` (inside Layout) calls `lenis.scrollTo(0)` on every route change.

Each page calls `usePageMeta('/some-path')` (`src/hooks/usePageMeta.ts`) to set per-route `<title>`, meta description, canonical URL, and Open Graph / Twitter card tags. The copy itself lives in **`src/data/routeMeta.json`**, not in the components — `scripts/prerender.mjs` reads the same file to bake those tags into static HTML at build time, and two sources would drift invisibly (the static tags are the ones crawlers read and the ones you never see in a browser). Adding a route means adding an entry there.

All canonical and OG URLs use `https://www.artagers.design`. The apex 308-redirects to www, so naming the apex would point every canonical at a redirect.

### Analytics

`src/lib/analytics.ts` exports `trackEvent`, a thin wrapper around `@vercel/analytics`'s `track()` with a closed `AnalyticsEvent` union (so a typo in an event name is a type error) and swallowed failures (an ad blocker must never break a user flow). Key events: `cta_start_project` (fired from every CTA that routes to `/contact` — homepage, navbar, mobile menu, About), `brief_started`, `brief_submitted`, `telegram_click`, `hire_page_view`.

### Admin Panel

`/admin` is a CMS at `src/pages/Admin.tsx`, gated by **Supabase Auth** (`signInWithPassword`). Login requires an email + password configured in the Supabase dashboard (Authentication → Users). Auth state is tracked via `onAuthStateChange` subscription (not a one-shot `getSession` call). It supports add/edit/delete/reorder for all three Supabase tables. The `/admin` link is hidden in the footer — not in the navbar. The page injects `noindex, nofollow` into the document head on mount and removes it on unmount.

### Contact Form & Serverless Function

The contact form in `src/pages/Contact.tsx` is a qualified project brief (name, email, project type, need, timeline, budget, links, message) that POSTs to `/api/contact` — a Vercel serverless function at `api/contact.ts`. Validation and Telegram-message formatting live in `api/_brief.ts` (the `_` prefix keeps Vercel from treating it as its own endpoint), so they can be unit-tested without a request object — see `api/_brief.test.ts`. Field length caps are 100/200/500/3900 chars (name/email/links/message); the formatted MarkdownV2 message is also checked against Telegram's combined 4096-character payload limit, since per-field caps can sum past it once escaping adds backslashes. The function reads `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` from `process.env` (server-side only, no `VITE_` prefix) and forwards the formatted brief to a Telegram chat via the Bot API.

### Styling Conventions

- Tailwind CSS v4 (configured via `@tailwindcss/vite` plugin, no `tailwind.config.js`)
- Custom utility classes are defined in `src/index.css`: `.border-brutal`, `.border-brutal-thick`, `.btn-brutal`, `.btn-brutal-filled`, `.btn-brutal-primary`, `.btn-brutal-primary-invert`, `.label-mono`, `.heading-section`, `.site-shell`, `.grid-line-v`, `.grid-line-h`. The visual system is frozen — reuse these rather than adding new ones.
- Fonts: **Space Grotesk** (sans, body) and **Space Mono** (mono, labels/buttons) — loaded via Google Fonts in `index.html`
- Color palette: near-black `#0a0a0a` on white `#ffffff`; accent yellow `#f5c842` used in the Admin warning banner

### Path Alias

`@/` resolves to `src/` (configured in `vite.config.ts`).

### Build Output

`npm run build` is `tsc --noEmit && vite build && node scripts/prerender.mjs`.

The prerender step writes one static HTML file per route (`dist/about/index.html`, `dist/hire/index.html`, …), each carrying that route's real title, description, canonical and OG tags. Without it, Vercel's rewrite made every path byte-identical to the homepage before JS ran — Googlebot renders JS and recovered, but Bing, LinkedIn, Slack and most LLM crawlers did not. The body still renders client-side; this buys correct metadata for every crawler, not prerendered body copy (that would need a headless browser in the build).

`vercel.json` rewrites only what the filesystem does not match, and sends it to `/404/index.html` so unknown URLs carry 404 metadata and `noindex` in static HTML rather than the homepage's.

`vite-plugin-singlefile` was **removed** — it inlined every asset into one `index.html`, which cannot coexist with one HTML file per route. JS and CSS are now separate cacheable assets shared across routes.

## Environment Variables

```
VITE_SUPABASE_URL=          # client-side, safe to expose
VITE_SUPABASE_ANON_KEY=     # client-side, safe to expose

TELEGRAM_BOT_TOKEN=         # server-side only — never use VITE_ prefix
TELEGRAM_CHAT_ID=           # server-side only — never use VITE_ prefix
```

Copy `.env.example` → `.env`. The SQL schema to bootstrap the database is embedded as a comment block in `src/lib/supabase.ts`. Supabase RLS is configured to allow public reads and authenticated-only writes — the anon key cannot mutate data.

## Static Files (`public/`)

- `favicon.svg` — "AG" SVG favicon
- `robots.txt` — disallows `/admin`, references sitemap
- `sitemap.xml` — lists `/`, `/work/telegram-mini-app-games`, `/contact`, `/hire`, `/about`
- `llms.txt` — plain-text profile summary for AI crawlers (no JS required to read); must stay consistent with the data actually rendered by `src/hooks/useSupabaseData.ts`'s fallback arrays
