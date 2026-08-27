# Lead-Generating Portfolio — Design Spec

**Date:** 2026-08-27
**Status:** Approved for planning
**Scope:** Restructure artagers.design from a portfolio index into a client-acquisition site, with a secondary recruiter path.

---

## 1. Problem

The site reads as a résumé, not a sales page. Concretely:

- The H1 is a personal name (`src/pages/Home.tsx:53`). A stranger learns nothing above the fold.
- `src/pages/Contact.tsx:75` advertises availability for "full-time positions" — telling a prospective client the engagement may end abruptly.
- `src/pages/About.tsx` is CV furniture (education, language percentage bars, hobbies) rather than a reason to hire.
- One conversion path exists: `/contact` → an empty textarea. No qualification, no alternative channel, no statement of what happens next.
- The strongest business claims already in the data (`src/hooks/useSupabaseData.ts:10` — *16 interfaces, two weeks, zero design revisions*) never appear as claims; they sit inside hover-card body copy.
- `@vercel/analytics` is installed (`src/App.tsx:65`) but tracks no custom events, so nothing about the funnel is measurable.
- No social proof of any kind: no named clients, no logos, no testimonials.
- `public/llms.txt` — the file AI crawlers quote verbatim — lists only design tools and omits the entire engineering capability.

## 2. Decisions

Settled during brainstorming. These are inputs to the plan, not open questions.

| Decision | Choice |
|---|---|
| Primary audience | Clients, with a secondary recruiter path |
| Positioning | Design-led; building is the closer, not a co-headline |
| Offer | Two tiers: Product Design, and Design → Built |
| Primary CTA | Qualified project brief, Telegram as escape hatch |
| Secondary CTA | `/hire` recruiter page |
| Proof strategy | Verification (live links, defensible metrics) — no testimonials available |
| Content budget | Existing material only; no new case studies |
| Hero direction | "From problem to production." |
| Channels | Conversion core now; search/community layers deferred |

**Proof constraint.** With no testimonials or client logos, the site cannot argue credibility — it must invite verification. Every claim gets a link a skeptic can open: App Store listing, live product, Behance research, this repository. A single collected testimonial would outperform anything in this spec; it is parked as the user's homework, and the proof sections are structured so testimonials slot in later without a rebuild.

## 3. Positioning

**Claim:** Product designer for iGaming, Web3 and data-heavy platforms, who ships the front-end when a client needs the product live rather than drawn.

**Why it holds.** The engineering half is real and independently corroborated: Next.js 15 App Router, Node, PostgreSQL, Prisma (schema design, migrations, seeding), auth and OTP reset flows, Railway and Vercel deployments, DNS management, Search Console and crawl-budget work. Within this repo, `src/components/SelectedWork.tsx:100-118` handles pointer and scroll input as separate modes, samples per frame rather than trusting ScrollTrigger enter/leave events (which fire in bursts on fast flicks), and pins `innerHeight` on resize because iOS moves it while the URL bar collapses. That is production debugging experience, not generated code.

**Risk.** Design + code stated flatly reads as *cheap generalist*. Grammar carries the whole distinction: design is the noun, building is the verb it enables. Never "designer & developer."

## 4. Truthful claims register

Copy currently on the site that must change because it cannot be defended in a sales call.

| Location | Current | Correction |
|---|---|---|
| `public/llms.txt`, OneRide bullets | "scaling service coverage across multiple routes", "grew a high-performing team and drove consistent user acquisition" | Replace with the accurate story (below) |
| `public/llms.txt` | "3+ years of experience" | "4+ years" |
| `public/llms.txt` | "Open to new projects, collaborations, and full-time positions" | Client-facing availability; full-time language lives on `/hire` |
| `src/components/Footer.tsx:23` | "Built by me → Vibe Coding" | "Designed and built by me" |
| `src/pages/About.tsx` HOBBIES | "Vibe Coding — Side projects" | Remove or reframe; it undercuts the Design → Built tier |
| `src/pages/Home.tsx:44` | "Available for work ◉" | Capacity statement, e.g. "2 project slots open" |
| `src/pages/Contact.tsx:75` | "and full-time positions" | Move to `/hire` |
| `src/pages/Home.tsx:76` | "Core Stack: Figma · Webflow · Tilda · Adobe CC" | Split into Design and Build columns |

**OneRide, accurate version.** Six months of research and design — user interviews and analysis documented in the Behance case study. Full UX flows and UI. Built with a developer and launched with three partners. Closed after two months and $3,000+ in costs, primarily because the human-side operational problems had not been modelled. This is stronger than the current claim: a founder who can name why something failed is more credible than one reporting unverifiable growth.

## 5. Information architecture

```
/                 Client sales page (was: portfolio index)
/work/:slug       Case study — FURY today; structure ready for more
/about            Client-facing story: who you'd be working with
/contact          Qualified project brief + Telegram escape hatch
/hire             NEW — recruiter path: value pitch, CV, experience
/admin            unchanged
```

CV content (work history, education, languages) **relocates** from `/about` to `/hire`. This requires no new writing and resolves the split-audience problem structurally rather than by compromise. `/about` keeps the story and personality.

`/hire` is linked from the nav and footer only — never competing with the primary CTA above the fold.

## 6. Homepage

Sections in order.

### 6.1 Hero

```
H1   FROM PROBLEM
     TO PRODUCTION.

Sub  I'm Artagers Grigoryan — product designer for iGaming, Web3 and
     data-heavy platforms. I design the product, and when you need it
     live rather than just drawn, I build and ship the front-end myself.

Meta Product Designer · Yerevan, Armenia · 2 project slots open

CTA  [ Start a project → ]   [ See the work ]
```

Capacity text lives in a documented constant at the top of `Home.tsx` for hand-editing. Not wired to Supabase — an admin field for a single string is not worth the schema change.

### 6.2 Proof strip

Four defensible figures, each traceable:

| 4+ years | 8 games | 3 platforms | Full-stack |
|---|---|---|---|
| Product design | One UI system, zero dev revisions | Web, iOS, Android | Next.js · Node · Postgres · Prisma |

### 6.3 Selected work

Existing `SelectedWork` / `ProjectRow` components; rows upgraded per §7. Recommended order: FURY, MakeYourCoin, PromptStation, OneRide — `display_order` remains admin-editable.

PromptStation deliberately appears twice on the page, in two different roles: here as **proof** (a shipped product among other shipped products) and again in §6.6 as an **offer** (a free tool the visitor can use right now). The framings must not repeat each other's copy. It stays a normal `case_studies` record so the list needs no special-casing.

### 6.4 What you can hire me for

**Product Design** — Research, flows, UI, and a design system your engineers can build from without a translation layer. Discovery and user flows · wireframes · high-fidelity UI · design system · dev-ready handoff with support during the build. *For teams that have engineers.*

**Design → Built** — Everything above, plus I ship the working front-end. One person from problem to production: no handoff, no spec arguments, no "that isn't what I drew." Adds production front-end (React/Next.js + TypeScript) · deployment on Vercel or Railway · analytics and Search Console setup. *For founders who need it live.*

No prices on the page. Budget is asked in the brief instead, so the market reveals the rate before it is published.

### 6.5 How I work

Four steps. This is the testimonial substitute — predictability lowers perceived risk when nobody is vouching for you.

1. **Brief and context** — I read your product, your competitors, and what you have already tried.
2. **Flows before pixels** — structure first; UI decisions get cheap once the flow is right.
3. **Design in the open** — you see work in progress, not a reveal at the end.
4. **Ship and support** — handoff that survives implementation, or I build it myself.

### 6.6 PromptStation

Promoted out of the work list into its own section. It is simultaneously the best proof of the Design → Built tier and a lead magnet aimed at exactly the right buyer.

> **A free tool I built for people who can't brief a project.**
> Answer 13 questions, get a complete website brief you can paste into Cursor, v0, Bolt, Lovable or Arena. I founded it, designed it, built it and shipped it — which is also the shortest answer to "can you actually build things?"
> [ Try PromptStation free ↗ ]

**Known limit:** email capture must live inside PromptStation, a separate codebase. In scope here: the section, UTM-tagged outbound links, and click tracking. Out of scope: capture itself.

### 6.7 CTA strip

Reworked from `Home.tsx:110`.

> **Got a product that needs designing — or shipping?**
> Tell me about it. A real answer within 24 hours, no discovery-call funnel.
> [ Start a project → ]

## 7. Verification system (data model)

Two additive, nullable columns on `case_studies`:

- `outcome` — the defensible one-line result
- `link_label` — what the link promises, so it reads as evidence rather than navigation

Nullable with fallbacks, so nothing breaks before values are filled in. Touches: SQL schema comment in `src/lib/supabase.ts`, the `CaseStudy` interface, `FALLBACK_CASE_STUDIES`, `ProjectRow`, and the Admin form.

Deliberately **not** adding `role` or `year` fields — `tags` already carries that weight.

Content for the four rows:

| Project | outcome | link_label |
|---|---|---|
| Telegram Mini-App Games | 16 responsive interfaces, solo, in two weeks — zero design revisions during development. | Read the case study → |
| MakeYourCoin | Token creation in under a minute across 7 chains. Shipped on web, iOS and Android. | Open on the App Store ↗ |
| PromptStation | Founded, designed, built and deployed solo. Next.js, live in production. | Try it live ↗ |
| OneRide | Six months of research and design, launched with three partners, closed after two. The post-mortem is the interesting part. | Read the research on Behance ↗ |

## 8. Contact → qualified brief

Replaces the single textarea at `src/pages/Contact.tsx:158`.

| Field | Type | Required |
|---|---|---|
| Name | text | yes |
| Email | email | yes |
| Project type | select: iGaming/casino · Web3/crypto · Dashboard/SaaS · Mobile app · Website/landing · Other | yes |
| What you need | select: Design only · Design → Built · Not sure yet | yes |
| Timeline | select: ASAP · 1–3 months · 3+ months · Just exploring | no |
| Budget range | select: Under $2k · $2–5k · $5–15k · $15k+ · Not sure yet | no |
| Links | text | no |
| Message | textarea | yes |

A Telegram one-tap button sits beside the form for people who will not fill in forms.

`api/contact.ts` gains validation for the new fields and a restructured MarkdownV2 message so leads arrive in Telegram pre-qualified. Existing length limits and escaping are preserved; new select fields are validated against their allowed-value lists server-side.

**Success state.** The current implementation resets after 4 seconds (`src/pages/Contact.tsx:47`). It becomes a persistent confirmation stating what happens next and when: *"Brief received. I read every one personally and reply within 24 hours — usually sooner. If it's urgent, message me on Telegram."*

## 9. `/hire` — recruiter path

Distinct argument from the client pages, same underlying assets.

- **H1:** Designer who ships.
- **The pitch:** a designer who writes production code means one less handoff, one less specification argument, and feasibility judgment present in the room while decisions are made. Can prototype in code rather than describing an interaction.
- **Experience** — the `work_experience` records currently rendered on `/about`.
- **Education and languages** — relocated from `/about`.
- **Stack** — Design and Build columns.
- **CTA** — email and LinkedIn. CV download is **deferred**: no PDF asset exists in `public/`. Add later by dropping a file in `public/` and linking it.

## 9b. `/about` — client-facing

Loses the CV (moved to `/hire`) and keeps the human half: how you got from fine art to product design, how you work, what you're like to spend three months with. Personality stays — it is a differentiator for a solo hire, provided it is not the page's substance.

Built from existing material; no new writing required beyond reordering what is already there.

## 10. Measurement

Custom `@vercel/analytics` events, since the funnel is currently invisible:

`cta_start_project` · `brief_started` (first field interaction) · `brief_submitted` · `telegram_click` · `verify_link_click` (with project name) · `promptstation_click` · `hire_page_view`

Drop-off is derived as `brief_started` minus `brief_submitted`; no per-field instrumentation.

## 11. Folded-in near-free wins

- **`llms.txt` full rewrite** — add the engineering stack, correct the years, fix OneRide, reframe availability toward client work. Currently the single biggest AI-search gap: an assistant asked "who can design and build a Web3 product in Yerevan" will not surface this profile.
- **Per-page meta descriptions and OG tags** — none currently exist; pages set only `document.title` via `useEffect`.
- **`robots.txt` and `sitemap.xml`** — add `/hire`, `/work/telegram-mini-app-games`.

## 11b. Visual scope

**Decision: structure and copy only.** The existing brutalist system is kept as-is and the visual redesign is deferred until the funnel produces data. Rationale: the system is coherent and distinctive — it is an asset, not a liability — and redesigning on guesswork before any conversion data exists optimises blind.

Two changes ship anyway, because they are structural consequences of the new sections rather than restyling:

1. **Primary CTA emphasis.** `src/pages/Home.tsx:114` currently uses `.btn-brutal` — the outlined, lowest-emphasis variant — on the black CTA strip. It becomes the filled variant at a larger size. No change to the visual language; the emphasis simply stops being inverted.
2. **A mid-level type step.** The scale currently jumps from a `clamp(3rem, 10vw, 9rem)` hero to 11px uppercase mono labels with nothing between. The new page has six section headers and needs a third step. One addition to `src/index.css`, in the existing idiom.

**Explicitly deferred to the later redesign pass:**

- An accent colour for public pages. `#f5c842` exists but is quarantined in Admin; a sales page benefits from exactly one accent for emphasis. Deferred by decision, not oversight.
- The uniform-weight problem: `.border-brutal`, `.grid-line-v` and `.grid-line-h` are all 2px, so every element carries identical visual weight and the page offers the eye no path. Acceptable for a browsing portfolio, suboptimal for a guided sales page.
- Section rhythm and spacing hierarchy.

Sequencing when the redesign happens: direction first (system rules), execution during section work, polish last. Never "redesign then re-content" — form follows content, and the content is what changes here.

## 12. Out of scope

New case studies · SEO service pages · schema markup · calendar booking · prerendering · email capture inside PromptStation · testimonial collection.

**Flagged for phase two:** `vite-plugin-singlefile` produces an unprerendered SPA. The Google and AI-search channel will underperform until routes render server-side. Naming it now so it does not surprise anyone later.

## 13. Risks

1. **Trust ceiling.** Without testimonials or named clients, verification gets most of the way and no further. Mitigated by structuring proof sections for later insertion.
2. **Generalist misread.** Design + build can cheapen both. Mitigated by strict grammar discipline in copy (§3).
3. **Build tier exposure.** Selling Design → Built commits to delivery deadlines on code. The claim burns if a client's CTO opens a shipped repo and finds a mess.
4. **Narrowing.** The iGaming/Web3 framing filters out generic inbound by design. That is the intent, but it is a real trade.

## 14. Success criteria

No baseline exists today — nothing is tracked. First milestone is visibility, not volume:

1. Every funnel step emits an event; the drop-off point is identifiable within two weeks of launch.
2. Every project row leads somewhere a skeptic can verify.
3. No claim on the site is undefendable in a sales call.
4. Thereafter: qualified briefs per month becomes the single tracked metric.
