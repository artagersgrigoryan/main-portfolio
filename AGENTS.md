# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Vite)
npm run build     # TypeScript check + production build
npm run preview   # Preview production build locally
```

No test runner is configured.

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

`src/App.tsx` wraps everything in `<BrowserRouter>` → `<SmoothScroll>` → `<Layout>`. The footer is hidden on `/admin`. `ScrollReset` (inside Layout) calls `lenis.scrollTo(0)` on every route change.

### Admin Panel

`/admin` is a CMS at `src/pages/Admin.tsx`, gated by **Supabase Auth** (`signInWithPassword`). Login requires an email + password configured in the Supabase dashboard (Authentication → Users). Auth state is tracked via `onAuthStateChange` subscription (not a one-shot `getSession` call). It supports add/edit/delete/reorder for all three Supabase tables. The `/admin` link is hidden in the footer — not in the navbar. The page injects `noindex, nofollow` into the document head on mount and removes it on unmount.

### Contact Form & Serverless Function

The contact form in `src/pages/Contact.tsx` POSTs to `/api/contact` — a Vercel serverless function at `api/contact.ts`. The function reads `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` from `process.env` (server-side only, no `VITE_` prefix) and forwards submissions to a Telegram chat via the Bot API using MarkdownV2 formatting. Input is validated (length limits: 100/200/3900 chars) and escaped before sending.

### Styling Conventions

- Tailwind CSS v4 (configured via `@tailwindcss/vite` plugin, no `tailwind.config.js`)
- Custom utility classes are defined in `src/index.css`: `.border-brutal`, `.border-brutal-thick`, `.btn-brutal`, `.btn-brutal-filled`, `.label-mono`, `.grid-line-v`, `.grid-line-h`
- Fonts: **Space Grotesk** (sans, body) and **Space Mono** (mono, labels/buttons) — loaded via Google Fonts in `index.html`
- Color palette: near-black `#0a0a0a` on white `#ffffff`; accent yellow `#f5c842` used in the Admin warning banner

### Path Alias

`@/` resolves to `src/` (configured in `vite.config.ts`).

### Build Output

`vite-plugin-singlefile` is enabled — the production build inlines all JS/CSS into a single `index.html` file.

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
- `sitemap.xml` — lists `/`, `/about`, `/contact`
- `llms.txt` — plain-text profile summary for AI crawlers (no JS required to read)
