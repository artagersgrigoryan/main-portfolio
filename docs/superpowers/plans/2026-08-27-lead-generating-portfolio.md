# Lead-Generating Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the portfolio from a résumé-shaped index into a client-acquisition site, with a secondary recruiter path at `/hire`.

**Architecture:** No framework or styling-system changes. Work is additive: new homepage sections as focused components, two nullable columns on `case_studies` to carry proof, an extended contact brief with server-side validation, one new route, and a measurement layer. The existing brutalist design system is preserved; only two utilities are added because the new sections structurally require them.

**Tech Stack:** React 19 · TypeScript 5.9 · Vite 7 · Tailwind CSS v4 (no config file — `@theme` in `src/index.css`) · Supabase · GSAP + ScrollTrigger · Lenis · Vercel serverless (`api/`) · `@vercel/analytics`

**Spec:** `docs/superpowers/specs/2026-08-27-lead-generating-portfolio-design.md`

## Global Constraints

- **Visual system is frozen.** No new colours, no accent colour, no spacing overhaul. The only permitted CSS additions are the three utilities in Task 1. Everything else reuses `.border-brutal`, `.btn-brutal`, `.btn-brutal-filled`, `.label-mono`, `.site-shell`.
- **Copy grammar rule.** Design is the noun; building is the verb it enables. Never write "designer & developer", "design + dev", or any phrasing that gives them equal billing.
- **Truth rule.** No claim ships that cannot be opened via a link or defended in a sales call. Copy strings in this plan are exact — do not improvise replacements.
- **Type checking.** `npx tsc --noEmit` must exit 0 at the end of every task. Baseline before this plan is clean.
- **Build.** `npm run build` must succeed at the end of every task.
- **Live data.** `.env` holds real Supabase credentials, so pages render **live DB rows**, not `FALLBACK_CASE_STUDIES`. To exercise the fallback path locally, per `.claude/skills/verify/SKILL.md`: `VITE_SUPABASE_URL="https://YOUR_PROJECT_ID.supabase.co" VITE_SUPABASE_ANON_KEY="YOUR_ANON_KEY" npm run dev -- --port 5175 --strictPort`
- **Visual verification.** Claude-in-Chrome does not work in this environment. Use the cached Playwright headless shell documented in `.claude/skills/verify/SKILL.md`.
- **Reduced motion.** Any new animation must respect `prefers-reduced-motion`, matching `src/hooks/useScrollReveal.ts`.
- **Commits.** Conventional-commit prefixes. **No `Co-Authored-By` trailer** (project preference).
- **No 404 route exists.** Unknown routes render an empty content area. That is pre-existing and out of scope.

---

### Task 1: Foundations — build integrity, measurement, two CSS utilities

Everything downstream depends on type checking actually running, on an analytics helper existing, and on the two utilities the new sections need.

**Files:**
- Modify: `package.json:9`
- Create: `src/lib/analytics.ts`
- Modify: `src/index.css` (append)
- Modify: `src/components/Footer.tsx:23`

**Interfaces:**
- Consumes: nothing.
- Produces: `trackEvent(event: AnalyticsEvent, props?: Record<string, string | number | boolean | null>): void` from `src/lib/analytics.ts`; CSS classes `.heading-section`, `.btn-brutal-primary`, `.btn-brutal-primary-invert`.

- [ ] **Step 1: Make the build type-check**

`package.json:9` currently reads `"build": "vite build"`. Both `CLAUDE.md` and the `verify` skill claim it type-checks; it does not, so type errors ship silently. Change it to:

```json
    "build": "tsc --noEmit && vite build",
```

- [ ] **Step 2: Verify the build now type-checks**

Run: `npm run build`
Expected: succeeds. Confirm `tsc` ran by temporarily introducing an error and seeing the build fail:

```bash
echo 'const broken: number = "string";' >> src/lib/cn-typecheck-probe.ts
npm run build   # expect: FAIL with TS2322
rm src/lib/cn-typecheck-probe.ts
npm run build   # expect: PASS
```

- [ ] **Step 3: Create the analytics helper**

The funnel is currently unmeasurable — `@vercel/analytics` is mounted at `src/App.tsx:65` but no custom events are sent. Create `src/lib/analytics.ts`:

```ts
import { track } from '@vercel/analytics';

/**
 * The full funnel vocabulary. Kept as a closed union so a typo in a call site
 * is a type error rather than a silently-missing metric.
 *
 * Drop-off is derived as `brief_started` minus `brief_submitted` — there is no
 * per-field instrumentation.
 */
export type AnalyticsEvent =
  | 'cta_start_project'
  | 'brief_started'
  | 'brief_submitted'
  | 'telegram_click'
  | 'verify_link_click'
  | 'promptstation_click'
  | 'hire_page_view';

/**
 * Fire-and-forget. Analytics must never break a user flow, so failures are
 * swallowed: an ad blocker eating the request is not an error worth surfacing.
 */
export function trackEvent(
  event: AnalyticsEvent,
  props?: Record<string, string | number | boolean | null>
): void {
  try {
    track(event, props);
  } catch {
    /* ignore */
  }
}
```

- [ ] **Step 4: Add the two required CSS utilities**

Append to `src/index.css`. Two additions only — the spec freezes everything else.

```css
/* ── Section heading ──────────────────────────────────────────────────────
   The scale jumps from the clamp(3rem,10vw,9rem) hero straight to 11px mono
   labels with nothing between. The new page has six section headers, so it
   needs a middle step. */
.heading-section {
  font-size: clamp(1.75rem, 3.5vw, 3rem);
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.02em;
  text-transform: uppercase;
}

/* ── Primary CTA ──────────────────────────────────────────────────────────
   The one element allowed to outweigh its neighbours. `.btn-brutal` and
   `.btn-brutal-filled` share identical 10px/20px padding with every other
   bordered box, which left the most important control on the page indis-
   tinguishable from a label. */
.btn-brutal-primary {
  border: 2px solid #0a0a0a;
  background: #0a0a0a;
  color: #ffffff;
  font-family: 'Space Mono', monospace;
  font-weight: 700;
  font-size: 15px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 18px 36px;
  cursor: pointer;
  transition: background 0.1s, color 0.1s;
}

.btn-brutal-primary:hover {
  background: #ffffff;
  color: #0a0a0a;
}

/* Inverted context (the black CTA strip): white fill so the button still
   dominates rather than receding into an outline. */
.btn-brutal-primary-invert {
  border: 2px solid #ffffff;
  background: #ffffff;
  color: #0a0a0a;
  font-family: 'Space Mono', monospace;
  font-weight: 700;
  font-size: 15px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 18px 36px;
  cursor: pointer;
  transition: background 0.1s, color 0.1s;
}

.btn-brutal-primary-invert:hover {
  background: transparent;
  color: #ffffff;
}
```

- [ ] **Step 5: Fix the footer claim**

`src/components/Footer.tsx:23` reads `Built by me → Vibe Coding`. To a client that reads as *AI wrote it, I watched*, undermining the Design → Built tier this whole plan sells. Replace the span's text content with:

```tsx
            Designed and built by me
```

- [ ] **Step 6: Verify and commit**

```bash
npx tsc --noEmit          # expect: exit 0
npm run build             # expect: success
git add package.json src/lib/analytics.ts src/index.css src/components/Footer.tsx
git commit -m "feat: add analytics helper, CTA emphasis utilities, type-checked build"
```

---

### Task 2: Verification system — outcome and link_label on case studies

Turns the work list from assertion into evidence. Each row gains a defensible result line and a link that says what it proves.

**Files:**
- Modify: `src/lib/supabase.ts:17-26` (interface) and the SQL comment block
- Modify: `src/hooks/useSupabaseData.ts:6-48` (fallback array)
- Modify: `src/components/ProjectRow.tsx`
- Modify: `src/pages/Admin.tsx:44-48,139,157-168`
- Manual: run SQL in the Supabase dashboard

**Interfaces:**
- Consumes: `trackEvent` from Task 1.
- Produces: `CaseStudy.outcome?: string | null` and `CaseStudy.link_label?: string | null`, consumed by nothing else.

- [ ] **Step 1: Extend the CaseStudy type**

In `src/lib/supabase.ts`, add two optional fields to the `CaseStudy` interface. Optional (not `| null` required) so existing rows and the Admin payload keep compiling:

```ts
export interface CaseStudy {
  id: string;
  title: string;
  description: string;
  image_url: string;
  link: string;
  tags: string[];
  display_order: number;
  created_at: string;
  /** One-line defensible result, e.g. "16 interfaces, two weeks, zero revisions". */
  outcome?: string | null;
  /** What the link promises, so it reads as evidence: "Open on the App Store ↗". */
  link_label?: string | null;
}
```

- [ ] **Step 2: Add the migration to the SQL comment block**

In the `-- ─── SQL Schema` comment in `src/lib/supabase.ts`, immediately after the `CREATE TABLE case_studies (...)` statement, add:

```sql
-- Migration 2026-08-27: verification fields
ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS outcome TEXT;
ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS link_label TEXT;
```

- [ ] **Step 3: Fill in the fallback array**

Replace the four records in `FALLBACK_CASE_STUDIES` (`src/hooks/useSupabaseData.ts:6-48`) — keep every existing field, add the two new ones, and **replace the OneRide description with the accurate story**. Exact values:

Record 1 (`Telegram Mini-App Games`), add:
```ts
    outcome: '16 responsive interfaces, solo, in two weeks — zero design revisions during development.',
    link_label: 'Read the case study →',
```

Record 2 (`MakeYourCoin`), add:
```ts
    outcome: 'Token creation in under a minute across 7 chains. Shipped on web, iOS and Android.',
    link_label: 'Open on the App Store ↗',
```

Record 3 (`OneRide Carsharing`) — replace `description` and add the two fields:
```ts
    description: 'Founded a regional carsharing service in Armenia. Six months of user interviews and analysis, full UX flows and UI, built with a developer and launched with three partners. Closed after two months once the operational problems proved bigger than the product ones.',
    outcome: 'Six months of research and design, launched with three partners, closed after two. The post-mortem is the interesting part.',
    link_label: 'Read the research on Behance ↗',
```

Record 4 — replace `title` (drop "Vibe Coded", per the global copy rule) and add the two fields:
```ts
    title: 'PromptStation',
    outcome: 'Founded, designed, built and deployed solo. Next.js, live in production.',
    link_label: 'Try it live ↗',
```

Then reorder so PromptStation sits third and OneRide fourth — the spec orders the list FURY, MakeYourCoin, PromptStation, OneRide, putting shipped-and-live proof above the closed venture.

**Move the array elements themselves, not just the numbers.** `useCaseStudies` applies `.order('display_order')` only to the Supabase query (`src/hooks/useSupabaseData.ts:86`); the fallback branch at `:79` returns `FALLBACK_CASE_STUDIES` unsorted, so the literal array order is the render order on that path. Swap the two object literals in the array **and** set `display_order: 3` on PromptStation and `display_order: 4` on OneRide, so both paths agree.

- [ ] **Step 4: Render outcome and the labelled link in ProjectRow**

In `src/components/ProjectRow.tsx`, the bare `→` glyph becomes a labelled proof link, and `outcome` renders under the title. Replace the arrow `<span>` block with:

```tsx
          <span
            className="font-mono text-[11px] uppercase tracking-widest shrink-0 ml-auto lg:ml-0 whitespace-nowrap transition-transform duration-500 ease-out lg:group-hover:translate-x-2"
          >
            {project.link_label || 'View project →'}
          </span>
```

And immediately after the mobile-only description `<p>`, add the outcome line — visible on every breakpoint, because it is the claim that does the selling:

```tsx
        {project.outcome && (
          <p className="lg:max-w-sm text-sm text-[#444] leading-snug font-light lg:order-last lg:w-full">
            {project.outcome}
          </p>
        )}
```

Then fire the tracking event. Add the import at the top of the file:

```tsx
import { trackEvent } from '../lib/analytics';
```

and a handler used by both branches of the return:

```tsx
  const handleVerifyClick = () => {
    trackEvent('verify_link_click', { project: project.title });
  };
```

Add `onClick={handleVerifyClick}` to the `<Link>`, and in the `<a>` branch merge it with the existing inert guard:

```tsx
      onClick={(e) => { if (isInert) { e.preventDefault(); return; } handleVerifyClick(); }}
```

- [ ] **Step 5: Add the fields to the Admin form**

In `src/pages/Admin.tsx`, three edits so the values are editable without a deploy.

Payload (`:44-48`) — add after `tags`:
```tsx
      outcome: editing.outcome || null,
      link_label: editing.link_label || null,
```

New-record initialiser (`:139`) — extend the object literal:
```tsx
onClick={() => setEditing({ title: '', description: '', image_url: '', link: '#', tags: [], outcome: '', link_label: '', display_order: data.length + 1 })}
```

Form fields — add after the existing `Project Link` field (`:164`):
```tsx
              <AdminField label="Outcome" value={editing.outcome || ''} onChange={v => setEditing({ ...editing, outcome: v })} placeholder="One defensible result — numbers beat adjectives" multiline />
              <AdminField label="Link Label" value={editing.link_label || ''} onChange={v => setEditing({ ...editing, link_label: v })} placeholder="Open on the App Store ↗" />
```

- [ ] **Step 6: Run the migration against the live database**

**This step is manual and must be done by the site owner** — the anon key cannot alter schema. In Supabase Dashboard → SQL Editor, run:

```sql
ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS outcome TEXT;
ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS link_label TEXT;
```

Then fill the four rows via `/admin` using the exact strings from Step 3. Until this runs, live rows render `outcome` as absent and the link label falls back to `View project →` — degraded, not broken.

**Also verify while in the dashboard** (Authentication → Policies): the schema comment in `src/lib/supabase.ts` creates `FOR ALL USING (true) WITH CHECK (true)`, which would let anyone holding the anon key — hardcoded at `src/lib/supabase.ts:11` — insert, update or delete rows. `CLAUDE.md` claims writes are authenticated-only. If the live policy matches the comment rather than `CLAUDE.md`, restrict the write policy to `auth.role() = 'authenticated'`.

- [ ] **Step 7: Verify rendering against the fallback path**

```bash
VITE_SUPABASE_URL="https://YOUR_PROJECT_ID.supabase.co" \
VITE_SUPABASE_ANON_KEY="YOUR_ANON_KEY" \
npm run dev -- --port 5175 --strictPort
```

Then screenshot and grep the DOM:

```bash
SHELL_BIN=~/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell
"$SHELL_BIN" --headless --disable-gpu --dump-dom --virtual-time-budget=15000 \
  "http://localhost:5175/" | grep -o "Open on the App Store\|Try it live\|zero design revisions\|closed after two"
```
Expected: all four strings present.

- [ ] **Step 8: Commit**

```bash
git add src/lib/supabase.ts src/hooks/useSupabaseData.ts src/components/ProjectRow.tsx src/pages/Admin.tsx
git commit -m "feat: add outcome and link_label proof fields to case studies"
```

---

### Task 3: Homepage — hero, proof strip, CTA strip

Replaces the name-as-headline opening and the outlined CTA. This task owns the top and bottom of `src/pages/Home.tsx`; Task 4 owns the middle.

**Files:**
- Modify: `src/pages/Home.tsx:30-90` (hero) and `:108-129` (CTA strip)

**Interfaces:**
- Consumes: `trackEvent` from Task 1; `.heading-section`, `.btn-brutal-primary`, `.btn-brutal-primary-invert` from Task 1.
- Produces: nothing consumed elsewhere.

- [ ] **Step 1: Add the capacity constant and imports**

At the top of `src/pages/Home.tsx`, after the existing imports, add:

```tsx
import { trackEvent } from '../lib/analytics';

/**
 * Hand-edited. "Available for work" read as *unemployed* to a prospective
 * client; capacity reads as demand. Not wired to Supabase — an admin field for
 * one string is not worth the schema change.
 */
const CAPACITY = '2 project slots open';
```

- [ ] **Step 2: Rewrite the hero meta bar**

Replace the third `<span>` in the meta bar (`src/pages/Home.tsx:44`, currently `Available for work ◉`) with:

```tsx
            <span className="ml-auto font-mono text-xs text-[#666] uppercase tracking-widest">
              {CAPACITY} ◉
            </span>
```

- [ ] **Step 3: Replace the H1**

The current H1 is the personal name — no value proposition above the fold. Replace the heading block (`src/pages/Home.tsx:48-60`) with:

```tsx
          <div className="px-6 py-16 md:py-24 border-b-2 border-[#0a0a0a]">
            <h1
              ref={headingRef}
              className="text-[clamp(3rem,10vw,9rem)] font-bold leading-[0.9] tracking-[-0.03em] uppercase"
            >
              From Problem
              <br />
              To <span className="inline-block border-b-[6px] border-[#0a0a0a]">Production</span>
            </h1>
          </div>
```

- [ ] **Step 4: Rewrite the sub-section — value proposition, split stack, CTAs**

Replace the three-column sub-section (`src/pages/Home.tsx:62-89`). The "Core Stack" column currently lists only design tools, which describes a tool user rather than someone who ships; it splits in two.

```tsx
          <div ref={subRef} className="flex flex-col md:flex-row">
            <div className="flex-1 px-6 py-8 border-b-2 md:border-b-0 md:border-r-2 border-[#0a0a0a]">
              <p className="text-base md:text-lg text-[#444] leading-relaxed max-w-lg font-light">
                I'm Artagers Grigoryan — product designer for iGaming, Web3 and
                data-heavy platforms. I design the product, and when you need it
                live rather than just drawn, I build and ship the front-end myself.
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-8">
                <Link
                  to="/contact"
                  className="btn-brutal-primary"
                  onClick={() => trackEvent('cta_start_project', { location: 'hero' })}
                >
                  Start a project →
                </Link>
                <a href="#work" className="btn-brutal font-mono text-sm">
                  See the work
                </a>
              </div>
            </div>
            <div className="flex-1 px-6 py-8 border-b-2 md:border-b-0 md:border-r-2 border-[#0a0a0a]">
              <p className="label-mono mb-2">Design</p>
              <p className="font-mono text-sm">
                Figma · Webflow · Tilda
                <br />
                Adobe CC · Illustrator · After Effects
              </p>
            </div>
            <div className="flex-1 px-6 py-8">
              <p className="label-mono mb-2">Build</p>
              <p className="font-mono text-sm">
                Next.js · React · TypeScript
                <br />
                Node · PostgreSQL · Prisma · Vercel
              </p>
            </div>
          </div>
```

- [ ] **Step 5: Add the proof strip**

Insert immediately after the closing `</section>` of the hero and before `<MarqueeBar />`:

```tsx
      {/* ── Proof strip ──────────────────────────────────────────────────
          Four figures, each traceable to something a visitor can open. */}
      <section className="border-b-2 border-[#0a0a0a]">
        <div className="site-shell flex flex-col md:flex-row">
          {[
            { figure: '4+ years', detail: 'Product design' },
            { figure: '8 games', detail: 'One UI system, zero dev revisions' },
            { figure: '3 platforms', detail: 'Web, iOS, Android' },
            { figure: 'Full-stack', detail: 'Next.js · Node · Postgres · Prisma' },
          ].map((item, i) => (
            <div
              key={item.figure}
              className={`flex-1 px-6 py-8 border-[#0a0a0a] ${i < 3 ? 'border-b-2 md:border-b-0 md:border-r-2' : ''}`}
            >
              <p className="text-2xl lg:text-3xl font-bold uppercase leading-none tracking-tight">
                {item.figure}
              </p>
              <p className="label-mono mt-2">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>
```

- [ ] **Step 6: Anchor the work section**

The hero's "See the work" button targets `#work`. Add the id to the case-studies `<section>` (`src/pages/Home.tsx:93`):

```tsx
      <section id="work" className="site-shell">
```

Lenis intercepts anchor navigation, so also add a click handler on the "See the work" anchor to scroll via Lenis. Import the hook at the top:

```tsx
import { useLenis } from '../components/SmoothScroll';
```

Add inside the component body:

```tsx
  const lenis = useLenis();
```

and replace the anchor's markup from Step 4 with:

```tsx
                <a
                  href="#work"
                  className="btn-brutal font-mono text-sm"
                  onClick={(e) => {
                    const target = document.getElementById('work');
                    if (lenis && target) {
                      e.preventDefault();
                      lenis.scrollTo(target);
                    }
                  }}
                >
                  See the work
                </a>
```

- [ ] **Step 7: Rewrite the CTA strip**

Replace the CTA strip body (`src/pages/Home.tsx:110-128`). The current link uses `.btn-brutal` — the *outlined* variant — making the most important control on the page the weakest-styled one.

```tsx
        <div className="site-shell flex flex-col md:flex-row items-center justify-between px-6 py-12 gap-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-[#666] mb-2">
              Let's talk
            </p>
            <h3 className="text-3xl md:text-5xl font-bold leading-none uppercase">
              Got a product that needs
              <br />
              designing — or shipping?
            </h3>
            <p className="text-sm text-[#999] font-light mt-4 max-w-md">
              Tell me about it. A real answer within 24 hours, no discovery-call funnel.
            </p>
          </div>
          <Link
            to="/contact"
            className="btn-brutal-primary-invert whitespace-nowrap"
            onClick={() => trackEvent('cta_start_project', { location: 'footer_strip' })}
          >
            Start a project →
          </Link>
        </div>
```

- [ ] **Step 8: Verify**

```bash
npx tsc --noEmit          # expect: exit 0
npm run build             # expect: success
npm run dev               # note the port from the startup output
```

Screenshot the homepage and confirm the hero reads as a value proposition, the proof strip renders four cells, and the CTA button is filled rather than outlined:

```bash
SHELL_BIN=~/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell
"$SHELL_BIN" --headless --disable-gpu --screenshot=/tmp/home.png \
  --window-size=1440,8000 --virtual-time-budget=15000 --hide-scrollbars \
  "http://localhost:5173/"
```

Also check mobile at `--window-size=390,6000` — the hero CTA pair and the four-cell proof strip must stack without overflow.

- [ ] **Step 9: Commit**

```bash
git add src/pages/Home.tsx
git commit -m "feat: lead homepage with value proposition, proof strip, dominant CTA"
```

---

### Task 4: Homepage — offer tiers, process, PromptStation

Three new sections between the work list and the CTA strip. Extracted as components because `Home.tsx` would otherwise pass 350 lines and stop being reviewable in one screen.

**Files:**
- Create: `src/components/OfferTiers.tsx`
- Create: `src/components/ProcessSteps.tsx`
- Create: `src/components/ToolPromo.tsx`
- Modify: `src/pages/Home.tsx`

**Interfaces:**
- Consumes: `trackEvent` from Task 1; `.heading-section` from Task 1.
- Produces: three default-exported components taking no props.

- [ ] **Step 1: Create OfferTiers**

Create `src/components/OfferTiers.tsx`. No prices — budget is asked in the brief instead, so the market reveals the rate before it is published.

```tsx
const TIERS = [
  {
    name: 'Product Design',
    pitch:
      'Research, flows, UI, and a design system your engineers can build from without a translation layer.',
    includes: [
      'Discovery and user flows',
      'Wireframes and high-fidelity UI',
      'Design system and components',
      'Dev-ready handoff, with support during the build',
    ],
    who: 'For teams that have engineers.',
  },
  {
    name: 'Design → Built',
    pitch:
      "Everything above, plus I ship the working front-end. One person from problem to production: no handoff, no spec arguments, no “that isn't what I drew.”",
    includes: [
      'Everything in Product Design',
      'Production front-end in React / Next.js + TypeScript',
      'Deployment on Vercel or Railway',
      'Analytics and Search Console setup',
    ],
    who: 'For founders who need it live.',
  },
];

/** The offer. Two tiers, stated plainly — "hire me" without a shape is a dead CTA. */
export default function OfferTiers() {
  return (
    <section className="border-t-2 border-[#0a0a0a]">
      <div className="site-shell">
        <div className="px-6 py-6 border-b-2 border-[#0a0a0a]">
          <h2 className="heading-section">What you can hire me for</h2>
        </div>
        <div className="flex flex-col md:flex-row">
          {TIERS.map((tier, i) => (
            <div
              key={tier.name}
              className={`flex-1 px-6 py-10 border-[#0a0a0a] ${i === 0 ? 'border-b-2 md:border-b-0 md:border-r-2' : ''}`}
            >
              <p className="label-mono mb-3">Tier {String(i + 1).padStart(2, '0')}</p>
              <h3 className="text-2xl lg:text-3xl font-bold uppercase leading-none tracking-tight">
                {tier.name}
              </h3>
              <p className="text-base text-[#444] leading-relaxed font-light mt-4 max-w-md">
                {tier.pitch}
              </p>
              <ul className="mt-6 space-y-2">
                {tier.includes.map((item) => (
                  <li key={item} className="font-mono text-sm flex gap-3">
                    <span aria-hidden className="text-[#999]">→</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="label-mono mt-6">{tier.who}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create ProcessSteps**

Create `src/components/ProcessSteps.tsx`. This is the testimonial substitute — with nobody vouching for you, predictability is what lowers perceived risk.

```tsx
const STEPS = [
  {
    title: 'Brief and context',
    body: 'I read your product, your competitors, and what you have already tried.',
  },
  {
    title: 'Flows before pixels',
    body: 'Structure first. UI decisions get cheap once the flow is right.',
  },
  {
    title: 'Design in the open',
    body: 'You see work in progress, not a reveal at the end.',
  },
  {
    title: 'Ship and support',
    body: 'Handoff that survives implementation — or I build it myself.',
  },
];

/** How working together actually goes. Predictability substitutes for testimonials. */
export default function ProcessSteps() {
  return (
    <section className="border-t-2 border-[#0a0a0a]">
      <div className="site-shell">
        <div className="px-6 py-6 border-b-2 border-[#0a0a0a]">
          <h2 className="heading-section">How I work</h2>
        </div>
        <div className="flex flex-col md:flex-row">
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className={`flex-1 px-6 py-8 border-[#0a0a0a] ${i < STEPS.length - 1 ? 'border-b-2 md:border-b-0 md:border-r-2' : ''}`}
            >
              <p className="font-mono text-xs tracking-widest text-[#999]">
                {String(i + 1).padStart(2, '0')}
              </p>
              <h3 className="text-lg font-bold uppercase tracking-tight mt-3 leading-tight">
                {step.title}
              </h3>
              <p className="text-sm text-[#444] leading-relaxed font-light mt-2">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create ToolPromo**

Create `src/components/ToolPromo.tsx`. PromptStation appears twice on the page by design: in the work list as *proof*, here as an *offer* the visitor can use immediately. The two must not share copy.

```tsx
import { trackEvent } from '../lib/analytics';

const PROMPTSTATION_URL =
  'https://www.promptstation.online/en?utm_source=artagers_design&utm_medium=portfolio&utm_campaign=tool_promo';

/**
 * Engineering-as-marketing. A free tool aimed at exactly the buyer who needs a
 * designer, and the shortest available proof of the Design → Built tier.
 *
 * Email capture lives inside PromptStation (a separate codebase) — all this
 * section does is send tagged, tracked traffic.
 */
export default function ToolPromo() {
  return (
    <section className="border-t-2 border-[#0a0a0a] bg-[#f8f8f8]">
      <div className="site-shell flex flex-col lg:flex-row items-start lg:items-center gap-8 px-6 py-12">
        <div className="flex-1">
          <p className="label-mono mb-3">Free tool</p>
          <h2 className="heading-section">
            A free tool I built for people
            <br />
            who can't brief a project
          </h2>
          <p className="text-base text-[#444] leading-relaxed font-light mt-4 max-w-xl">
            Most projects go wrong before design starts — in a brief that never
            said what the thing was for. PromptStation asks the 13 questions I
            would ask in a kickoff call, then hands you the answers as a
            document. Take it to your own developer, paste it into an AI
            builder, or bring it to me.
          </p>
        </div>
        <a
          href={PROMPTSTATION_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-brutal-primary whitespace-nowrap shrink-0"
          onClick={() => trackEvent('promptstation_click', { location: 'home_tool_promo' })}
        >
          Try PromptStation free ↗
        </a>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Mount all three on the homepage**

In `src/pages/Home.tsx`, add the imports:

```tsx
import OfferTiers from '../components/OfferTiers';
import ProcessSteps from '../components/ProcessSteps';
import ToolPromo from '../components/ToolPromo';
```

Then insert between the closing `</section>` of the case-studies block and the opening of the CTA strip, in this order:

```tsx
      <OfferTiers />
      <ProcessSteps />
      <ToolPromo />
```

- [ ] **Step 5: Verify**

```bash
npx tsc --noEmit          # expect: exit 0
npm run build             # expect: success
npm run dev
```

```bash
SHELL_BIN=~/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell
"$SHELL_BIN" --headless --disable-gpu --dump-dom --virtual-time-budget=15000 \
  "http://localhost:5173/" | grep -o "What you can hire me for\|Design → Built\|How I work\|Try PromptStation free"
```
Expected: all four strings present. Then screenshot at `--window-size=1440,10000` and at `--window-size=390,8000`; the two tiers and four process cells must stack cleanly on mobile.

- [ ] **Step 6: Commit**

```bash
git add src/components/OfferTiers.tsx src/components/ProcessSteps.tsx src/components/ToolPromo.tsx src/pages/Home.tsx
git commit -m "feat: add offer tiers, process, and free-tool sections to homepage"
```

---

### Task 5: Qualified brief — validation, API, and form

Replaces the blank textarea with a brief that filters tyre-kickers, and adds a Telegram escape hatch for people who will not fill in forms.

This is the only task with real branching logic, and the only code in the repo that can silently drop a lead. It gets unit tests, which means adding `vitest` — the sole new dependency in this plan. Note that `tsconfig.json:32` includes only `["src", "vite.config.ts"]`, so `api/` is currently **not type-checked at all**; that is fixed here.

**Files:**
- Create: `api/_brief.ts` (pure validation and formatting — the `_` prefix keeps Vercel from treating it as an endpoint)
- Create: `api/_brief.test.ts`
- Modify: `api/contact.ts`
- Modify: `src/pages/Contact.tsx`
- Modify: `tsconfig.json:32`
- Modify: `package.json` (add `vitest`, add `test` script)

**Interfaces:**
- Consumes: `trackEvent` from Task 1.
- Produces: from `api/_brief.ts` — `PROJECT_TYPES`, `NEEDS`, `TIMELINES`, `BUDGETS` (readonly string tuples), `interface Brief`, `type ValidationResult`, `validateBrief(body: unknown): ValidationResult`, `formatBriefMessage(brief: Brief): string`.

- [ ] **Step 1: Add vitest and type-check the api directory**

```bash
npm install --save-dev vitest@^3
```

In `package.json` scripts, add:
```json
    "test": "vitest run",
```

In `tsconfig.json`, change the include array to cover the serverless functions:
```json
  "include": ["src", "api", "vite.config.ts"]
```

Run `npx tsc --noEmit`. If pre-existing errors surface in `api/contact.ts`, fix them before continuing — do not proceed with a red baseline.

- [ ] **Step 2: Write the failing tests**

Create `api/_brief.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { validateBrief, formatBriefMessage } from './_brief';

const valid = {
  name: 'Jane Founder',
  email: 'jane@startup.com',
  projectType: 'Web3 / crypto',
  need: 'Design → Built',
  timeline: '1–3 months',
  budget: '$5–15k',
  links: 'https://startup.com',
  message: 'We need a token dashboard designed and shipped.',
};

describe('validateBrief', () => {
  it('accepts a complete valid brief', () => {
    const result = validateBrief(valid);
    expect(result.ok).toBe(true);
  });

  it('accepts a brief with the optional fields omitted', () => {
    const { timeline, budget, links, ...required } = valid;
    const result = validateBrief(required);
    expect(result.ok).toBe(true);
  });

  it('rejects a missing required field', () => {
    const result = validateBrief({ ...valid, message: '   ' });
    expect(result).toEqual({ ok: false, error: 'Missing required fields' });
  });

  it('rejects a message over the Telegram-safe limit', () => {
    const result = validateBrief({ ...valid, message: 'x'.repeat(3901) });
    expect(result).toEqual({ ok: false, error: 'Input too long' });
  });

  it('rejects a projectType outside the allowed list', () => {
    const result = validateBrief({ ...valid, projectType: 'Weapons' });
    expect(result).toEqual({ ok: false, error: 'Invalid selection' });
  });

  it('rejects a budget outside the allowed list', () => {
    const result = validateBrief({ ...valid, budget: 'a trillion' });
    expect(result).toEqual({ ok: false, error: 'Invalid selection' });
  });

  it('rejects a non-object body', () => {
    expect(validateBrief(null)).toEqual({ ok: false, error: 'Missing required fields' });
  });
});

describe('formatBriefMessage', () => {
  it('escapes MarkdownV2 reserved characters', () => {
    const result = validateBrief({ ...valid, name: 'A. Founder-Smith' });
    if (!result.ok) throw new Error('fixture should validate');
    const text = formatBriefMessage(result.value);
    expect(text).toContain('A\\. Founder\\-Smith');
  });

  it('omits optional fields that were not supplied', () => {
    const { timeline, budget, links, ...required } = valid;
    const result = validateBrief(required);
    if (!result.ok) throw new Error('fixture should validate');
    const text = formatBriefMessage(result.value);
    expect(text).not.toContain('Timeline');
    expect(text).not.toContain('Budget');
  });
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL — `Failed to resolve import "./_brief"`.

- [ ] **Step 4: Implement the validation module**

Create `api/_brief.ts`:

```ts
/**
 * Brief validation and Telegram formatting.
 *
 * Kept separate from the handler so it can be unit-tested without a request
 * object — this is the only branching logic in the repo that can silently
 * drop a lead. The `_` prefix keeps Vercel from treating the file as an
 * endpoint.
 */

export const PROJECT_TYPES = [
  'iGaming / casino',
  'Web3 / crypto',
  'Dashboard / SaaS',
  'Mobile app',
  'Website / landing',
  'Other',
] as const;

export const NEEDS = ['Design only', 'Design → Built', 'Not sure yet'] as const;

export const TIMELINES = ['ASAP', '1–3 months', '3+ months', 'Just exploring'] as const;

export const BUDGETS = ['Under $2k', '$2–5k', '$5–15k', '$15k+', 'Not sure yet'] as const;

export interface Brief {
  name: string;
  email: string;
  projectType: string;
  need: string;
  timeline: string;
  budget: string;
  links: string;
  message: string;
}

export type ValidationResult =
  | { ok: true; value: Brief }
  | { ok: false; error: string };

/** MarkdownV2 reserves these; Telegram rejects the whole message if any is bare. */
const escMd = (s: string) => s.replace(/[_*[\]()~`>#+=|{}.!\\-]/g, '\\$&');

const str = (v: unknown) => String(v ?? '').trim();

/** Empty passes — the caller decides whether a field is required. */
const inList = (value: string, allowed: readonly string[]) =>
  value === '' || allowed.includes(value);

export function validateBrief(body: unknown): ValidationResult {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, error: 'Missing required fields' };
  }

  const b = body as Record<string, unknown>;
  const brief: Brief = {
    name: str(b.name),
    email: str(b.email),
    projectType: str(b.projectType),
    need: str(b.need),
    timeline: str(b.timeline),
    budget: str(b.budget),
    links: str(b.links),
    message: str(b.message),
  };

  if (!brief.name || !brief.email || !brief.projectType || !brief.need || !brief.message) {
    return { ok: false, error: 'Missing required fields' };
  }

  if (
    brief.name.length > 100 ||
    brief.email.length > 200 ||
    brief.links.length > 500 ||
    brief.message.length > 3900
  ) {
    return { ok: false, error: 'Input too long' };
  }

  if (
    !inList(brief.projectType, PROJECT_TYPES) ||
    !inList(brief.need, NEEDS) ||
    !inList(brief.timeline, TIMELINES) ||
    !inList(brief.budget, BUDGETS)
  ) {
    return { ok: false, error: 'Invalid selection' };
  }

  return { ok: true, value: brief };
}

/** Optional fields are omitted rather than rendered blank, so the message stays scannable. */
export function formatBriefMessage(brief: Brief): string {
  const lines = [
    '📬 *New project brief*',
    '',
    `*Name:* ${escMd(brief.name)}`,
    `*Email:* ${escMd(brief.email)}`,
    `*Project:* ${escMd(brief.projectType)}`,
    `*Needs:* ${escMd(brief.need)}`,
  ];

  if (brief.timeline) lines.push(`*Timeline:* ${escMd(brief.timeline)}`);
  if (brief.budget) lines.push(`*Budget:* ${escMd(brief.budget)}`);
  if (brief.links) lines.push(`*Links:* ${escMd(brief.links)}`);

  lines.push('', '*Message:*', escMd(brief.message));

  return lines.join('\n');
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS — 9 tests.

- [ ] **Step 6: Rewire the handler**

Replace the body of `api/contact.ts` between the method guard and the Telegram fetch with the shared module. The final file:

```ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { validateBrief, formatBriefMessage } from './_brief';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const result = validateBrief(req.body);
  if (!result.ok) {
    return res.status(400).json({ error: result.error });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return res.status(500).json({ error: 'Server not configured' });
  }

  const response = await fetch(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: formatBriefMessage(result.value),
        parse_mode: 'MarkdownV2',
      }),
    }
  );

  await response.text(); // drain connection for reuse

  if (!response.ok) {
    return res.status(502).json({ error: 'Telegram API error' });
  }

  return res.status(200).json({ ok: true });
}
```

- [ ] **Step 7: Rebuild the contact form**

In `src/pages/Contact.tsx`, add imports:

```tsx
import { PROJECT_TYPES, NEEDS, TIMELINES, BUDGETS } from '../../api/_brief';
import { trackEvent } from '../lib/analytics';
```

Replace the `formData` state initialiser (`:13`):

```tsx
  const [formData, setFormData] = useState({
    name: '', email: '', projectType: '', need: '',
    timeline: '', budget: '', links: '', message: '',
  });
  const [started, setStarted] = useState(false);
```

Add a one-shot start tracker so drop-off is derivable:

```tsx
  const markStarted = () => {
    if (started) return;
    setStarted(true);
    trackEvent('brief_started');
  };
```

Replace the `handleSubmit` body's fetch payload and success handling:

```tsx
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Server error');

      trackEvent('brief_submitted', {
        projectType: formData.projectType,
        need: formData.need,
        budget: formData.budget || 'unspecified',
      });
      setStatus('sent');
      setFormData({
        name: '', email: '', projectType: '', need: '',
        timeline: '', budget: '', links: '', message: '',
      });
```

**Delete** the `setTimeout(() => setStatus('idle'), 4000);` line (`:47`) — a confirmation that erases itself after four seconds tells the visitor nothing about what happens next. Keep the reset only for the error branch by moving it inside the `catch`.

Add a reusable select, defined below the component in the same file:

```tsx
function BriefSelect({
  label, value, options, required, onChange, onFocus,
}: {
  label: string;
  value: string;
  options: readonly string[];
  required?: boolean;
  onChange: (v: string) => void;
  onFocus: () => void;
}) {
  return (
    <div className="border-2 border-[#0a0a0a] mb-[-2px]">
      <label className="block px-4 pt-4 label-mono">
        {label}{required ? ' *' : ''}
      </label>
      <select
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        className="w-full px-4 py-3 font-mono text-sm bg-transparent focus:bg-[#f8f8f8] transition-colors"
      >
        <option value="">Select…</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
```

Insert the four selects and the links field between the Email input and the Message textarea, and add `onFocus={markStarted}` to the existing name, email and message inputs:

```tsx
            <BriefSelect label="Project type" value={formData.projectType} options={PROJECT_TYPES} required
              onChange={(v) => setFormData({ ...formData, projectType: v })} onFocus={markStarted} />
            <BriefSelect label="What you need" value={formData.need} options={NEEDS} required
              onChange={(v) => setFormData({ ...formData, need: v })} onFocus={markStarted} />
            <BriefSelect label="Timeline" value={formData.timeline} options={TIMELINES}
              onChange={(v) => setFormData({ ...formData, timeline: v })} onFocus={markStarted} />
            <BriefSelect label="Budget range" value={formData.budget} options={BUDGETS}
              onChange={(v) => setFormData({ ...formData, budget: v })} onFocus={markStarted} />

            <div className="border-2 border-[#0a0a0a] mb-[-2px]">
              <label className="block px-4 pt-4 label-mono">Links</label>
              <input
                type="text"
                value={formData.links}
                onChange={(e) => setFormData({ ...formData, links: e.target.value })}
                onFocus={markStarted}
                placeholder="Your site, deck, or Figma"
                className="w-full px-4 py-3 font-mono text-sm bg-transparent focus:bg-[#f8f8f8] transition-colors placeholder:text-[#bbb]"
              />
            </div>
```

Replace the success message (`:190-193`) with a persistent confirmation:

```tsx
              {status === 'sent' && (
                <p className="font-mono text-xs text-green-700 uppercase tracking-widest max-w-sm leading-relaxed">
                  Brief received. I read every one personally and reply within 24 hours — usually sooner.
                </p>
              )}
```

Change the submit button class from `btn-brutal-filled py-4 px-10` to `btn-brutal-primary`.

- [ ] **Step 8: Add the Telegram escape hatch and remove the job-seeking line**

In the "Direct Channels" column of `src/pages/Contact.tsx`, add above the `links.map(...)` block:

```tsx
          <a
            href="https://t.me/artagers"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent('telegram_click', { location: 'contact' })}
            className="flex items-center gap-4 px-6 py-6 border-b-2 border-[#0a0a0a] bg-[#0a0a0a] text-white hover:bg-white hover:text-[#0a0a0a] transition-colors group"
          >
            <div className="w-10 h-10 border-2 border-current flex items-center justify-center font-mono text-sm font-bold shrink-0">
              ✈
            </div>
            <div>
              <p className="label-mono text-[#999] group-hover:text-[#666]">Prefer to just talk?</p>
              <p className="font-mono text-sm font-bold mt-0.5">Message me on Telegram</p>
            </div>
            <span className="ml-auto font-mono text-lg">→</span>
          </a>
```

**Confirm the Telegram handle with the site owner before shipping** — `https://t.me/artagers` is an assumption, not a verified URL.

Then replace the intro paragraph (`src/pages/Contact.tsx:75-77`), which currently advertises availability for full-time positions on a client-facing page:

```tsx
              Tell me what you're building. The more you put in the brief, the
              more useful my first reply is.
```

- [ ] **Step 9: Verify**

```bash
npm test                  # expect: 9 passing
npx tsc --noEmit          # expect: exit 0
npm run build             # expect: success
npm run dev
```

The serverless function does not run under `vite dev`, so exercise validation directly rather than through the browser:

```bash
npx vitest run api/_brief.test.ts
```

Then load `/contact` and confirm all eight fields render and the Telegram row appears:

```bash
SHELL_BIN=~/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell
"$SHELL_BIN" --headless --disable-gpu --dump-dom --virtual-time-budget=15000 \
  "http://localhost:5173/contact" | grep -c "<select"
```
Expected: `4`.

- [ ] **Step 10: Commit**

```bash
git add api/ src/pages/Contact.tsx tsconfig.json package.json package-lock.json
git commit -m "feat: replace contact textarea with qualified project brief"
```

---

### Task 6: `/hire` recruiter path and a client-facing `/about`

Resolves the split-audience problem structurally: the CV moves out of the client funnel to its own URL. No new writing — this is relocation.

**Files:**
- Create: `src/pages/Hire.tsx`
- Modify: `src/pages/About.tsx` (remove `EDUCATION`, `LANGUAGES`, experience list and their animations)
- Modify: `src/App.tsx` (route)
- Modify: `src/components/Navbar.tsx:5-9` (nav link)
- Modify: `src/components/Footer.tsx` (footer link)

**Interfaces:**
- Consumes: `trackEvent` from Task 1; `useWorkExperience` from `src/hooks/useSupabaseData.ts`; `.heading-section` from Task 1.
- Produces: default-exported `Hire` component; route `/hire`.

- [ ] **Step 1: Create the Hire page**

Create `src/pages/Hire.tsx`. The argument is different from the client pages even though the underlying facts are the same: for an employer, a designer who writes production code means one less handoff and feasibility judgement present while decisions are made.

```tsx
import { useEffect } from 'react';
import { useWorkExperience } from '../hooks/useSupabaseData';
import { trackEvent } from '../lib/analytics';

const EDUCATION = [
  { school: 'Pixel IT School', field: 'UX/UI Design', type: 'Professional' },
  { school: 'Vanadzor Technology Center', field: 'Graphic Design', type: 'Professional' },
  { school: 'Tavrizyan Art Collage', field: 'Fine Arts', type: 'Academic' },
];

const LANGUAGES = [
  { lang: 'Armenian', level: 'Native' },
  { lang: 'Russian', level: 'Fluent' },
  { lang: 'English', level: 'Conversational' },
];

const ARGUMENTS = [
  {
    title: 'One less handoff',
    body: 'I write the front-end I design. Nothing gets lost translating a Figma file into a ticket.',
  },
  {
    title: 'Feasibility in the room',
    body: 'I know what a design costs to build before it is agreed, not after the estimate comes back.',
  },
  {
    title: 'Prototypes, not descriptions',
    body: 'Interactions get built and clicked rather than explained in a comment thread.',
  },
];

export default function Hire() {
  const { data: experience } = useWorkExperience();

  useEffect(() => {
    document.title = 'Hire me — Artagers Grigoryan';
    trackEvent('hire_page_view');
  }, []);

  return (
    <main className="pt-14">
      <section className="site-shell border-b-2 border-[#0a0a0a]">
        <div className="px-6 py-4 border-b-2 border-[#0a0a0a]">
          <span className="label-mono">For hiring teams</span>
        </div>
        <div className="flex flex-col md:flex-row">
          <div className="flex-1 px-6 py-10 border-b-2 md:border-b-0 md:border-r-2 border-[#0a0a0a]">
            <h1 className="text-[clamp(2.5rem,7vw,6rem)] font-bold leading-none tracking-tight uppercase">
              Designer
              <br />
              Who Ships.
            </h1>
          </div>
          <div className="flex-1 flex flex-col justify-end px-6 py-10">
            <p className="text-base text-[#444] leading-relaxed font-light max-w-md">
              Product designer with four years across iGaming, Web3 and
              data-heavy platforms, who also builds and deploys production
              front-ends. Open to full-time and long-term contract roles,
              remote or in Yerevan.
            </p>
          </div>
        </div>
      </section>

      <section className="site-shell border-b-2 border-[#0a0a0a]">
        <div className="px-6 py-6 border-b-2 border-[#0a0a0a]">
          <h2 className="heading-section">What that's worth to a team</h2>
        </div>
        <div className="flex flex-col md:flex-row">
          {ARGUMENTS.map((arg, i) => (
            <div
              key={arg.title}
              className={`flex-1 px-6 py-8 border-[#0a0a0a] ${i < ARGUMENTS.length - 1 ? 'border-b-2 md:border-b-0 md:border-r-2' : ''}`}
            >
              <h3 className="text-lg font-bold uppercase tracking-tight leading-tight">{arg.title}</h3>
              <p className="text-sm text-[#444] leading-relaxed font-light mt-2">{arg.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="site-shell border-b-2 border-[#0a0a0a]">
        <div className="px-6 py-6 border-b-2 border-[#0a0a0a]">
          <h2 className="heading-section">Experience</h2>
        </div>
        {experience.map((job) => (
          <div key={job.id} className="px-6 py-8 border-b-2 border-[#0a0a0a] last:border-b-0 flex flex-col lg:flex-row gap-4 lg:gap-10">
            <p className="font-mono text-xs text-[#999] uppercase tracking-widest lg:w-48 shrink-0">
              {job.date_range}
            </p>
            <div>
              <h3 className="text-xl font-bold uppercase tracking-tight">{job.job_title}</h3>
              <p className="label-mono mt-1">{job.company}</p>
              <p className="text-sm text-[#444] leading-relaxed font-light mt-3 max-w-2xl">
                {job.description}
              </p>
            </div>
          </div>
        ))}
      </section>

      <section className="site-shell border-b-2 border-[#0a0a0a] flex flex-col md:flex-row">
        <div className="flex-1 px-6 py-8 border-b-2 md:border-b-0 md:border-r-2 border-[#0a0a0a]">
          <p className="label-mono mb-4">Design</p>
          <p className="font-mono text-sm leading-relaxed">
            Figma · Webflow · Tilda · Adobe CC · Illustrator · After Effects
          </p>
        </div>
        <div className="flex-1 px-6 py-8 border-b-2 md:border-b-0 md:border-r-2 border-[#0a0a0a]">
          <p className="label-mono mb-4">Build</p>
          <p className="font-mono text-sm leading-relaxed">
            Next.js · React · TypeScript · Node · PostgreSQL · Prisma · Vercel · Railway
          </p>
        </div>
        <div className="flex-1 px-6 py-8">
          <p className="label-mono mb-4">Languages</p>
          {LANGUAGES.map((l) => (
            <p key={l.lang} className="font-mono text-sm">
              {l.lang} — <span className="text-[#666]">{l.level}</span>
            </p>
          ))}
        </div>
      </section>

      <section className="site-shell border-b-2 border-[#0a0a0a]">
        <div className="px-6 py-6 border-b-2 border-[#0a0a0a]">
          <h2 className="heading-section">Education</h2>
        </div>
        <div className="flex flex-col md:flex-row">
          {EDUCATION.map((e, i) => (
            <div
              key={e.school}
              className={`flex-1 px-6 py-8 border-[#0a0a0a] ${i < EDUCATION.length - 1 ? 'border-b-2 md:border-b-0 md:border-r-2' : ''}`}
            >
              <p className="label-mono mb-2">{e.type}</p>
              <p className="font-bold uppercase tracking-tight">{e.school}</p>
              <p className="font-mono text-sm text-[#666] mt-1">{e.field}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#0a0a0a] text-white">
        <div className="site-shell flex flex-col md:flex-row items-center justify-between px-6 py-12 gap-6">
          <h3 className="text-2xl md:text-4xl font-bold leading-none uppercase">
            Hiring? Let's talk.
          </h3>
          <a
            href="mailto:artagersgrigoryan@gmail.com"
            className="btn-brutal-primary-invert whitespace-nowrap"
          >
            Email me →
          </a>
        </div>
      </section>
    </main>
  );
}
```

**Note:** no CV download — there is no PDF in `public/`. To add one later, drop the file in `public/` and link it from this CTA block.

- [ ] **Step 2: Register the route**

In `src/App.tsx`, add the import alongside the others:

```tsx
import Hire from './pages/Hire';
```

and the route after `/contact`:

```tsx
          <Route path="/hire" element={<Hire />} />
```

- [ ] **Step 3: Strip the CV out of About**

In `src/pages/About.tsx`, delete the `EDUCATION` and `LANGUAGES` constants, the `useWorkExperience` import and call, the experience and education JSX sections, and the two `useEffect` blocks that animate `.exp-item` and `.edu-item`. `noUnusedLocals` is enabled, so leaving any of them behind fails the build.

Keep: the bio, the sticky image, `HOBBIES`, and the bio/image entrance animation. Remove the `Vibe Coding` hobby entry per the global copy rule — replace that array element with:

```tsx
  { emoji: '💻', label: 'Building things', note: 'Shipped side projects' },
```

Add a link to the recruiter page at the end of the bio so the audience split is discoverable:

```tsx
        <p className="font-mono text-xs text-[#666] uppercase tracking-widest mt-8">
          Hiring rather than commissioning? <Link to="/hire" className="underline">See the CV →</Link>
        </p>
```

This requires `import { Link } from 'react-router-dom';` at the top of the file.

- [ ] **Step 4: Link `/hire` from nav and footer**

In `src/components/Navbar.tsx:5-9`, extend `NAV_LINKS`:

```tsx
const NAV_LINKS = [
  { label: 'Work', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Hire', href: '/hire' },
  { label: 'Contact', href: '/contact' },
];
```

In `src/components/Footer.tsx`, add a link beside the admin link:

```tsx
          <Link
            to="/hire"
            className="font-mono text-xs text-[#666] hover:text-[#0a0a0a] uppercase tracking-widest transition-colors mr-6"
          >
            For hiring teams
          </Link>
```

- [ ] **Step 5: Verify**

```bash
npx tsc --noEmit          # expect: exit 0 — catches any leftover unused const in About
npm run build             # expect: success
npm run dev
```

```bash
SHELL_BIN=~/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell
"$SHELL_BIN" --headless --disable-gpu --dump-dom --virtual-time-budget=15000 \
  "http://localhost:5173/hire" | grep -o "Designer\|What that's worth to a team\|Experience\|Education" | sort -u
"$SHELL_BIN" --headless --disable-gpu --dump-dom --virtual-time-budget=15000 \
  "http://localhost:5173/about" | grep -c "Tavrizyan"
```
Expected: the `/hire` grep lists all four; the `/about` count is `0` (education has moved).

- [ ] **Step 6: Commit**

```bash
git add src/pages/Hire.tsx src/pages/About.tsx src/App.tsx src/components/Navbar.tsx src/components/Footer.tsx
git commit -m "feat: add /hire recruiter page and refocus /about on the client story"
```

---

### Task 7: Discovery surface — meta tags, llms.txt, robots, sitemap

The site currently sets only `document.title`; there are no meta descriptions or OG tags anywhere, and `llms.txt` — the file AI crawlers quote verbatim — lists no engineering capability at all and still advertises full-time availability.

**Files:**
- Create: `src/hooks/usePageMeta.ts`
- Modify: `src/pages/Home.tsx`, `About.tsx`, `Contact.tsx`, `Hire.tsx`, `CaseStudyFury.tsx` (replace the `document.title` effects)
- Rewrite: `public/llms.txt`
- Modify: `public/sitemap.xml`, `public/robots.txt`

**Interfaces:**
- Consumes: nothing.
- Produces: `usePageMeta({ title, description, path }: PageMeta): void`.

- [ ] **Step 1: Create the meta hook**

Create `src/hooks/usePageMeta.ts`. It mirrors the tag-injection pattern already used by `src/pages/Admin.tsx` for its `noindex` tag:

```ts
import { useEffect } from 'react';

export interface PageMeta {
  title: string;
  description: string;
  /** Absolute path, e.g. "/hire". Used for og:url and canonical. */
  path: string;
}

const ORIGIN = 'https://artagers.design';

/** Creates the tag if absent, updates it if present, and leaves it in place on
 *  unmount — the next route's call overwrites it, so there is nothing to clean up. */
function setTag(selector: string, attrs: Record<string, string>) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement(selector.startsWith('link') ? 'link' : 'meta');
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v));
}

export function usePageMeta({ title, description, path }: PageMeta): void {
  useEffect(() => {
    document.title = title;
    const url = `${ORIGIN}${path}`;

    setTag('meta[name="description"]', { name: 'description', content: description });
    setTag('link[rel="canonical"]', { rel: 'canonical', href: url });
    setTag('meta[property="og:title"]', { property: 'og:title', content: title });
    setTag('meta[property="og:description"]', { property: 'og:description', content: description });
    setTag('meta[property="og:url"]', { property: 'og:url', content: url });
    setTag('meta[property="og:type"]', { property: 'og:type', content: 'website' });
    setTag('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
  }, [title, description, path]);
}
```

- [ ] **Step 2: Use the hook on every page**

Replace each page's `useEffect(() => { document.title = '…'; }, []);` with a `usePageMeta` call. Exact values:

`src/pages/Home.tsx`:
```tsx
  usePageMeta({
    title: 'Artagers Grigoryan — Product Designer for iGaming, Web3 & Dashboards',
    description: 'Product designer who ships. iGaming, Web3 and data-heavy platforms — designed, and built when you need it live. Yerevan, Armenia.',
    path: '/',
  });
```

`src/pages/About.tsx`:
```tsx
  usePageMeta({
    title: 'About — Artagers Grigoryan',
    description: 'How a fine-art background turned into designing and shipping products for iGaming, Web3 and mobility.',
    path: '/about',
  });
```

`src/pages/Contact.tsx`:
```tsx
  usePageMeta({
    title: 'Start a project — Artagers Grigoryan',
    description: 'Tell me what you are building. Project briefs answered within 24 hours.',
    path: '/contact',
  });
```

`src/pages/Hire.tsx` (replacing the `document.title` line in the existing effect, keeping the `trackEvent` call):
```tsx
  usePageMeta({
    title: 'Hire me — Artagers Grigoryan, Product Designer',
    description: 'Product designer with four years in iGaming, Web3 and data-heavy platforms who also builds production front-ends. Open to full-time and contract roles.',
    path: '/hire',
  });
```

`src/pages/CaseStudyFury.tsx`:
```tsx
  usePageMeta({
    title: 'FURY Telegram Mini-App Games — Case Study',
    description: 'Eight casino mini-games on one scalable UI system. 16 responsive interfaces designed solo in two weeks, with zero design revisions during development.',
    path: '/work/telegram-mini-app-games',
  });
```

Each file needs `import { usePageMeta } from '../hooks/usePageMeta';`.

- [ ] **Step 3: Rewrite llms.txt**

Replace `public/llms.txt` entirely. Four defects in the current file: it claims "3+ years", it lists zero engineering capability, it advertises full-time availability to client-seeking crawlers, and its OneRide entry claims growth that did not happen.

```
# Artagers Grigoryan — Product Designer who ships

> Product designer with 4+ years across iGaming, Web3, fintech and mobility, who also builds and deploys production front-ends. Designs the product, and ships the working interface when a client needs it live rather than drawn. Founder of PromptStation. Based in Yerevan, Armenia; works remotely worldwide.

## Contact

- Website: https://artagers.design
- Start a project: https://artagers.design/contact
- For hiring teams: https://artagers.design/hire
- Email: artagersgrigoryan@gmail.com
- Location: Yerevan, Armenia (GMT+4)

## What he does

- Product design for online casino and betting platforms, Web3 and crypto products, and data-heavy dashboards.
- Design systems and dev-ready handoff for teams that have engineers.
- End-to-end delivery — design plus production front-end — for founders who need a product live.

## Design skills

User research, information architecture, interaction design, visual design, prototyping, UI design, accessibility, design systems.

## Design tools

Figma, Webflow, Tilda, Adobe Illustrator, Photoshop, Premiere Pro, After Effects.

## Engineering

- Frontend: Next.js 15 (App Router), React, TypeScript.
- Backend: Node.js, PostgreSQL, Prisma ORM, schema design, migrations, seeding, auth and OTP reset flows.
- Infrastructure: Vercel, Railway, DNS and domain management, deployment and monitoring.
- Web growth: Google Search Console, XML sitemaps, crawl-budget management, analytics tag integration.

## Selected work

### FURY — Telegram mini-app casino games
Eight casino mini-games (Crash, Mines, Plinko, Dice and more) on one scalable UI system. 16 responsive interfaces for desktop and mobile, designed solo in Figma in two weeks, with zero design revisions during development.
https://artagers.design/work/telegram-mini-app-games

### MakeYourCoin — token launch platform
Token creation and deployment in under a minute with no code, across Solana, Ethereum, BSC, Polygon, Arbitrum, Base and TON. Template-based creation, minting and burning controls, and a management dashboard. Shipped on web, iOS and Android.
https://apps.apple.com/us/app/makeyourcoin/id6740451339

### PromptStation — founder, designer and developer
A free tool that turns 13 questions into a complete website brief for AI builders and coding tools. Founded, designed, built and deployed solo on Next.js.
https://www.promptstation.online/en

### OneRide — carsharing, founder
Founded a regional carsharing service in Armenia. Six months of user interviews and analysis, full UX flows and UI, built with a developer and launched with three partners. Closed after two months once the operational problems proved larger than the product ones. Research documented on Behance.
https://www.behance.net/gallery/222825727/OneRide-Mobile-App

## Experience

- Product Designer, UXCentury — casino and custom game platforms, betting dashboards, Telegram-ecosystem games.
- Freelance UX/UI Designer, 2022–present — blockchain gaming and lottery platforms, Telegram bot onboarding flows.
- Founder & Head of Product, OneRide — see above.
- UX/UI Mentor, EIF (Enterprise Incubator Foundation) — mentored cohorts in UX/UI, web design and Figma.
- UX/UI Designer, TechMind — user research, usability testing, wireframes and prototypes.
- Co-Founder & UX/UI Designer, UnityX — design studio for mobile and web clients.

## Languages

Armenian (native), Russian (fluent), English (conversational).

## Availability

Taking on new client projects. Also open to full-time roles — details at https://artagers.design/hire. Replies within 24 hours.
```

- [ ] **Step 4: Update sitemap and robots**

Rewrite `public/sitemap.xml` to include every real route:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://artagers.design/</loc><priority>1.0</priority></url>
  <url><loc>https://artagers.design/work/telegram-mini-app-games</loc><priority>0.9</priority></url>
  <url><loc>https://artagers.design/contact</loc><priority>0.8</priority></url>
  <url><loc>https://artagers.design/hire</loc><priority>0.7</priority></url>
  <url><loc>https://artagers.design/about</loc><priority>0.6</priority></url>
</urlset>
```

Confirm `public/robots.txt` still disallows `/admin` and references the sitemap; leave it otherwise unchanged.

- [ ] **Step 5: Verify**

```bash
npx tsc --noEmit          # expect: exit 0
npm run build             # expect: success
npm run dev
```

```bash
SHELL_BIN=~/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell
for route in "" "about" "contact" "hire"; do
  echo "--- /$route"
  "$SHELL_BIN" --headless --disable-gpu --dump-dom --virtual-time-budget=8000 \
    "http://localhost:5173/$route" | grep -o 'meta name="description" content="[^"]*"'
done
```
Expected: a distinct description for each of the four routes.

Confirm the static files are served from the build output:
```bash
npm run preview   # then, in another shell:
curl -s http://localhost:4173/llms.txt | head -3
curl -s http://localhost:4173/sitemap.xml | grep -c "<url>"   # expect: 5
```

- [ ] **Step 6: Commit**

```bash
git add src/hooks/usePageMeta.ts src/pages public/llms.txt public/sitemap.xml public/robots.txt
git commit -m "feat: add per-page meta tags and rewrite llms.txt with engineering capability"
```

---

## Post-implementation checklist (site owner)

These cannot be done from the codebase and the plan is not finished without them:

- [ ] Run the `case_studies` migration in the Supabase SQL Editor (Task 2, Step 6).
- [ ] Fill `outcome` and `link_label` for all four rows via `/admin`.
- [ ] Reorder the live rows so PromptStation sits above OneRide (the `/admin` reorder controls, or `display_order` directly).
- [ ] Update the OneRide row's `description` in the live database to the accurate version — the fallback array is not what production renders.
- [ ] Verify the RLS write policy is `authenticated`-only, not `USING (true)` (Task 2, Step 6).
- [ ] Confirm the Telegram handle used in Task 5, Step 8.
- [ ] Update the `work_experience` OneRide row in `/admin` — it still claims a high-performing team and consistent user acquisition.
- [ ] Send one test brief through the deployed `/contact` form and confirm it arrives formatted in Telegram.
- [ ] Optional, highest-value: ask one past client or your UXCentury lead for two sentences. The proof sections are built so a testimonial block can be added without rework.
