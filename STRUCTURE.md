# Portfolio — Folder Structure

```
/
├── index.html                        # Entry HTML with Google Fonts (Space Grotesk + Space Mono)
├── .env.example                      # Environment variables template
├── STRUCTURE.md                      # This file
│
└── src/
    ├── main.tsx                      # React entry point
    ├── App.tsx                       # Router + Layout shell
    ├── index.css                     # Global styles, Tailwind theme, brutalist utilities
    ├── vite-env.d.ts                 # Vite/ImportMeta type declarations
    │
    ├── lib/
    │   └── supabase.ts               # Supabase client + TypeScript types + SQL schema (in comments)
    │
    ├── hooks/
    │   └── useSupabaseData.ts        # Data hooks: useCaseStudies, useWorkExperience, useContactLinks
    │                                 # (includes static fallbacks when Supabase is not configured)
    │
    ├── components/
    │   ├── Navbar.tsx                # Fixed top navigation with GSAP entrance animation
    │   ├── Footer.tsx                # Footer with hidden /admin link
    │   ├── ProjectCard.tsx           # Brutalist case study card with GSAP hover effects ★
    │   └── MarqueeBar.tsx            # Scrolling skills marquee strip
    │
    └── pages/
        ├── Home.tsx                  # Hero + Case Studies list (GSAP scroll animations)
        ├── About.tsx                 # Bio + Sticky image + Work Experience + Education
        ├── Contact.tsx               # Contact links + Contact form
        └── Admin.tsx                 # Password-protected CMS for all content
```

## Database Tables (Supabase PostgreSQL)

| Table            | Columns                                                        |
|------------------|----------------------------------------------------------------|
| `case_studies`   | id, title, description, image_url, link, tags[], display_order |
| `work_experience`| id, job_title, company, date_range, description, display_order |
| `contact_links`  | id, label, value, href, type, display_order                    |

All tables have `display_order INTEGER` for drag/swap reordering via the Admin panel.

## SQL Schema

The complete SQL schema (with seed data) is embedded as a comment block in:
`src/lib/supabase.ts` — copy the block into your **Supabase SQL Editor** and run it.

## Setup Guide

1. Create a Supabase project at https://supabase.com
2. Go to SQL Editor → paste schema from `src/lib/supabase.ts`
3. Copy `.env.example` → `.env` and fill in your keys
4. Run `npm run dev`
5. Visit `/admin` (link in footer) — default password: `artagers2025`

## Admin Panel Features

- **Case Studies**: Add, Edit, Delete, Reorder (↑↓ swap by display_order)
- **Work Experience**: Add, Edit, Delete, Reorder positions
- **Contact Links**: Add, Edit, Delete, Reorder channels
- Password gate (change `ADMIN_PASSWORD` in `src/pages/Admin.tsx`)
- Yellow banner when Supabase is not configured (graceful fallback mode)
