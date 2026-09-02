# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Vite); picks the next free port if 5173 is taken
npm run build     # tsc --noEmit → vite build → prerender heads → prerender bodies
npm run preview   # Preview production build locally
npm test          # vitest run (currently 12 tests, all in api/_brief.test.ts)

npx vitest run api/_brief.test.ts -t "rejects"   # single file / single test by name
```

`CLAUDE.md` and `AGENTS.md` are byte-for-byte identical except for the title and the tool named in the opening line. Edit both together.

## Architecture

**Stack:** React 19 + TypeScript + Vite + Tailwind CSS v4 + Supabase + GSAP + Lenis

This is a personal portfolio site (product designer) with a brutalist black-and-white aesthetic, doubling as a lead-generation funnel (see `docs/superpowers/specs/` and `docs/superpowers/plans/` for the intent behind the current homepage).

### Data Flow

All content (case studies, work experience, contact links) is stored in **Supabase** and fetched via hooks in `src/hooks/useSupabaseData.ts`. Each hook (`useCaseStudies`, `useWorkExperience`, `useContactLinks`) has a static fallback array that renders when Supabase env vars are absent — so the site works without a database configured. The `isSupabaseConfigured()` guard checks for `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

Note that `.env` here holds real credentials, so local runs show **live DB data**, not the fallbacks. To exercise the fallback path, override with the placeholder values `isSupabaseConfigured()` rejects (shell env beats `.env` in Vite):

```bash
VITE_SUPABASE_URL="https://YOUR_PROJECT_ID.supabase.co" \
VITE_SUPABASE_ANON_KEY="YOUR_ANON_KEY" npm run dev
```

### Build Output — two prerender passes

`npm run build` runs four steps: `tsc --noEmit`, `vite build`, `scripts/prerender.mjs`, then `scripts/prerender-bodies.mjs`.

1. **`scripts/prerender.mjs` — heads.** Writes one static HTML file per route (`dist/about/index.html`, `dist/hire/index.html`, …), each carrying that route's real title, description, canonical and OG tags, read from `src/data/routeMeta.json`. Without it, Vercel's rewrite made every path byte-identical to the homepage before JS ran — Googlebot renders JS and recovered, but Bing, LinkedIn, Slack and most LLM crawlers did not. It also injects the `<link rel="preload" as="image">` for a route's LCP image when `routeMeta.json` gives it a `preloadImage`, and forces `noindex` on `/404`.
2. **`scripts/prerender-bodies.mjs` — bodies.** Serves `dist/` over a throwaway HTTP server the way Vercel does, loads each route in headless Playwright Chromium, forces finished animation state (`opacity: 1`, transforms removed), drops the cursor-following `.work-preview`, and inlines the resulting `#root` innerHTML into that route's HTML — also stamping `<html data-prerendered="true">`. This is **fail-soft on purpose**: no Playwright, no browser, or a per-route error logs and exits 0, leaving the head-only shells in place. A slow deploy beats a failed one. The `npm run build` script installs Chromium with `PLAYWRIGHT_BROWSERS_PATH=0` (into `node_modules`) because that is the only place Vercel's build image keeps it.

`vercel.json` rewrites only what the filesystem does not match, and sends it to `/404/index.html` so unknown URLs carry 404 metadata and `noindex` in static HTML rather than the homepage's.

`vite-plugin-singlefile` was **removed** — it inlined every asset into one `index.html`, which cannot coexist with one HTML file per route. JS and CSS are now separate cacheable assets shared across routes.

### Prerendered bodies vs. entrance animations

This is the invariant most likely to be broken by an innocent-looking change. Bodies are prerendered but the app still `createRoot`s (not `hydrateRoot`) — React replaces the static DOM on boot. Every entrance animation starts at `opacity: 0`, so run unchanged they would blink out content the visitor is already reading.

`src/lib/entrance.ts` is the contract:
- `alreadyPainted(el)` — true only on a prerendered first load *and* when the element is in the viewport. Animation hooks call it and skip straight to the visible state. Below-the-fold content was never seen, so it keeps its reveal.
- `releaseEntranceGuard()` — called by `ScrollReset` on the first client-side navigation, after which React owns the DOM and every animation behaves normally.

Any new entrance animation must consult `alreadyPainted` the way `useScrollReveal` and `SelectedWork` do, or it will flash on first paint.

### Animation System

Two animation layers are wired together in `src/components/SmoothScroll.tsx`:
- **Lenis** provides smooth-scroll inertia; its rAF loop is driven by GSAP's ticker (not its own) so they stay in sync.
- **GSAP + ScrollTrigger** drives all entrance animations. `src/hooks/useScrollReveal.ts` exports `useScrollReveal` (single element) and `useScrollRevealChildren` (staggered list) — both respect `prefers-reduced-motion` and the prerender guard above.

Elements that animate in must start hidden; use the `.gsap-hidden` CSS class or set `opacity: 0` in the GSAP `fromTo` call.

`SelectedWork.tsx` owns the floating cover preview for the work list: it resolves the active row itself (cursor hit-testing on pointer devices, scroll position on touch) rather than letting rows report hover state — that was the source of a stranded cover. `ProjectRow.tsx` is text-only by design.

### Routing & Layout

`src/App.tsx` wraps everything in `<BrowserRouter>` → `<SmoothScroll>` → `<Layout>`. Routes: `/`, `/about`, `/contact`, `/hire`, `/work/telegram-mini-app-games`, `/admin`, and `*` → `NotFound`. There is **no `/work/:slug`** — the FURY case study is its own hardcoded route and component; a second case study means a second route (plus a `routeMeta.json` entry and a `sitemap.xml` line).

`Admin` and `CaseStudyFury` are `lazy()`-loaded — together they were 120 KB of a 202 KB bundle every mobile visitor parsed before the homepage could paint. Keep them out of the main chunk. The footer is hidden on `/admin`. `ScrollReset` (inside Layout) calls `lenis.scrollTo(0)` on every route change and releases the entrance guard.

`/hire` is the secondary recruiter-facing path (CV, experience, education) — the navbar links to it as "CV", separate from the client-facing "Hire Me →" CTA which targets `/contact`.

Each page calls `usePageMeta('/some-path')` (`src/hooks/usePageMeta.ts`) to set per-route `<title>`, meta description, canonical URL, and Open Graph / Twitter card tags. The copy itself lives in **`src/data/routeMeta.json`**, not in the components — `scripts/prerender.mjs` reads the same file to bake those tags into static HTML at build time, and two sources would drift invisibly (the static tags are the ones crawlers read and the ones you never see in a browser). Adding a route means adding an entry there. `RoutePath` is typed from that JSON's keys, so a wrong path is a type error.

`src/hooks/useNoIndex.ts` adds `robots: noindex, nofollow` for as long as a page is mounted and restores `index, follow` on unmount — used by `/admin` and `NotFound`. It has to be reversible because one `index.html` serves every route.

All canonical and OG URLs use `https://www.artagers.design`. The apex 308-redirects to www, so naming the apex would point every canonical at a redirect.

### Analytics

`src/lib/analytics.ts` exports `trackEvent`, a thin wrapper around `@vercel/analytics`'s `track()` with a closed `AnalyticsEvent` union (so a typo in an event name is a type error) and swallowed failures (an ad blocker must never break a user flow). Events: `cta_start_project` (every CTA routing to `/contact` — hero, navbar, mobile menu, footer strip, About; each passes a `location` prop), `brief_started`, `brief_submitted`, `telegram_click`, `verify_link_click`, `promptstation_click`, `hire_page_view`.

GA4 (`G-YQ33QWSJ7C`) is loaded **by the GTM container** in `index.html`, not by its own snippet. Both were running at one point: 449 KB of analytics against a 202 KB app, with `gtag/js` fetched twice. Do not re-add a standalone gtag tag.

### Admin Panel

`/admin` is a CMS at `src/pages/Admin.tsx`, gated by **Supabase Auth** (`signInWithPassword`). Login requires an email + password configured in the Supabase dashboard (Authentication → Users). Auth state is tracked via `onAuthStateChange` subscription (not a one-shot `getSession` call). It supports add/edit/delete/reorder for all three Supabase tables. The `/admin` link is hidden in the footer — not in the navbar.

Cover images upload through `src/lib/uploadImage.ts` to a public Supabase Storage bucket (`covers`), so covers can be swapped without a redeploy. Uploads are downscaled to 2000px and re-encoded as JPEG at q0.82 in the browser before hitting the network. Reads are public, writes are authenticated-only — the anon key ships in the client bundle, so a write-open bucket would let anyone upload. The bucket + policy SQL is a comment block at the bottom of that file.

### Contact Form & Serverless Function

The contact form in `src/pages/Contact.tsx` is a qualified project brief (name, email, project type, need, timeline, budget, links, message) that POSTs to `/api/contact` — a Vercel serverless function at `api/contact.ts`. Validation and Telegram-message formatting live in `api/_brief.ts` (the `_` prefix keeps Vercel from treating it as its own endpoint), so they can be unit-tested without a request object — see `api/_brief.test.ts`, the only test file in the repo. `briefFieldIssues()` is the single source of validation truth: it returns one issue per offending field, the form renders those messages inline under the fields, and `validateBrief` collapses them into the coarse error the API returns (`required` → `tooLong` → `format` → `invalid`, the order the handler has always reported). Changing a rule means changing it once. Field length caps live in `MAX_LENGTHS` (100/200/500/3900 for name/email/links/message); the formatted MarkdownV2 message is also checked against Telegram's combined 4096-character payload limit, since per-field caps can sum past it once escaping adds backslashes. The form sets `noValidate` and renders its own errors — native validation bubbles point at one field at a time and vanish on click. The function reads `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` from `process.env` (server-side only, no `VITE_` prefix) and forwards the formatted brief to a Telegram chat via the Bot API.

### Styling Conventions

- Tailwind CSS v4 (configured via `@tailwindcss/vite` plugin, no `tailwind.config.js`); the theme lives in the `@theme` block at the top of `src/index.css`
- All custom classes are defined in `src/index.css` — layout/system (`.site-shell`, `.border-brutal`, `.border-brutal-thick`, `.btn-brutal`, `.btn-brutal-filled`, `.btn-brutal-primary`, `.btn-brutal-primary-invert`, `.label-mono`, `.heading-section`, `.section-quiet`, `.grid-line-v`, `.grid-line-h`, `.gsap-hidden`) plus component-scoped blocks (`.hero-*`, `.work-row` / `.work-list`, `.offer-tier` / `.offer-arrow`, `.marquee-inner`). The visual system is frozen — reuse these rather than adding new ones.

### Form Fields

Every control on the site uses one field system in `src/index.css`: a `.field` box wrapping a `.field-label` and a `.field-input` (plus `.field-select` for dropdowns, `.field-invalid` + `.field-error` for errors, and `.field-stack` to space a form's fields 8px apart). Both `Contact.tsx` and `Admin.tsx`'s `AdminField` render this markup — the classes exist because seven copies of the same Tailwind string had already drifted.

Four rules in that block are load-bearing, not cosmetic:

- **The box owns the focus state, the control never does.** `.field:focus-within` draws an inset ring and fills `#f8f8f8`; `.field-input` explicitly sets `outline: none`. An outline on the input nests a black box inside the wrapper's black border, which is what made the old fields look broken. The global `input:focus-visible` rule above it is only for controls that are *not* in a `.field`.
- **The focus ring is `box-shadow: inset`, never a `border-width` change.** Growing a border on focus would shift every field below it down by a pixel.
- **`.field-input` is `font-size: 16px`.** Below 16px, iOS Safari zooms the whole page when a field takes focus.
- **`:-webkit-autofill` is overridden twice over** — an inset box-shadow *and* an absurd `transition-delay` — because either alone has a hole. The `prefers-reduced-motion` block re-asserts the delay with `!important`; its blanket `transition-duration: 0.01ms` would otherwise hand reduced-motion users Chrome's autofill background.
- Fonts: **Space Grotesk** (sans, body) and **Space Mono** (mono, labels/buttons) — loaded via Google Fonts in `index.html`
- Color palette: near-black `#0a0a0a` on white `#ffffff`; accent yellow `#f5c842` used in the Admin warning banner

### Homepage Sections

`src/pages/Home.tsx` composes `MarqueeBar`, `SelectedWork` (+ `ProjectRow`), `OfferTiers`, `ProcessSteps`, and `ToolPromo`. The copy for the offer tiers, process steps and tool promo is hardcoded in those components (not Supabase) — they are positioning, not content. `ToolPromo` sends UTM-tagged traffic to PromptStation, a separate codebase.

### Path Alias

`@/` resolves to `src/` (configured in `vite.config.ts` and `tsconfig.json`). `tsconfig.json` type-checks `src`, `api`, and `vite.config.ts` with `strict`, `noUnusedLocals` and `noUnusedParameters` on — an unused import fails the build, not just the lint.

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
- `hero-portrait.webp` / `hero-portrait-sm.webp` — the LCP image pair preloaded via `routeMeta.json`
- `covers/`, `case-studies/fury-casino/` — case study imagery and video

## Stale Docs

`STRUCTURE.md` predates the current architecture (it lists a `ProjectCard.tsx` that no longer exists and a hardcoded admin password that was replaced by Supabase Auth). `.claude/skills/verify/SKILL.md` still describes the removed singlefile build. Trust this file over both; fix them if you touch them.
