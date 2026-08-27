import { useState, useEffect } from 'react';
import { supabase, type CaseStudy, type WorkExperience, type ContactLink } from '../lib/supabase';

// ─── Fallback Static Data (shown when Supabase is not configured) ─────────────

const FALLBACK_CASE_STUDIES: CaseStudy[] = [
  {
    id: '1',
    title: 'Telegram Mini-App Games',
    description: 'Designed 8 casino mini-games for FURY on one scalable UI system — Crash, Mines, Plinko, Dice and more. 16 responsive interfaces (desktop + mobile) built solo in Figma in two weeks, with zero design revisions during development.',
    image_url: '/case-studies/fury-casino/crash-desktop.jpg',
    link: '/work/telegram-mini-app-games',
    tags: ['iGaming', 'UI System', 'Mobile'],
    display_order: 1,
    created_at: '',
    outcome: '16 responsive interfaces, solo, in two weeks — zero design revisions during development.',
    link_label: 'Read the case study →',
  },
  {
    id: '2',
    title: 'MakeYourCoin',
    description: 'Token-launch platform that lets anyone mint and deploy a crypto token in under a minute — no code. Template-based creation, minting and burning controls, and a management dashboard across Solana, Ethereum, BSC, Polygon, Arbitrum, Base and TON. Shipped on web, iOS and Android.',
    image_url: '/covers/makeyourcoin.jpg',
    link: 'https://apps.apple.com/us/app/makeyourcoin/id6740451339',
    tags: ['Web3', 'Crypto', 'Mobile App'],
    display_order: 2,
    created_at: '',
    outcome: 'Token creation in under a minute across 7 chains. Shipped on web, iOS and Android.',
    link_label: 'Open on the App Store ↗',
  },
  {
    id: '4',
    title: 'PromptStation',
    description: 'Answer 13 focused questions. Get a complete, professional website brief — paste it into any AI builder or coding tool. Verified for Bolt, Cursor, v0, Lovable, and Arena.ai.',
    image_url: '/covers/website-prompt-generator.png',
    link: 'https://www.promptstation.online/en?utm_source=artagers_design&utm_medium=portfolio&utm_campaign=work_row',
    tags: ['Vibecode'],
    display_order: 3,
    created_at: '',
    outcome: 'Founded, designed, built and deployed solo. Next.js, live in production.',
    link_label: 'Try it live ↗',
  },
  {
    id: '3',
    title: 'OneRide Carsharing',
    description: 'Founded a regional carsharing service in Armenia. Six months of user interviews and analysis, full UX flows and UI, built with a developer and launched with three partners. Closed after two months once the operational problems proved bigger than the product ones.',
    image_url: 'https://mir-s3-cdn-cf.behance.net/projects/max_808/5497ce222825727.Y3JvcCw0MTk5LDMyODUsMCww.jpg',
    link: 'https://www.behance.net/gallery/222825727/OneRide-Mobile-App',
    tags: ['Mobile App', 'Design System', 'Startup'],
    display_order: 4,
    created_at: '',
    outcome: 'Six months of research and design, launched with three partners, closed after two. The post-mortem is the interesting part.',
    link_label: 'Read the research on Behance ↗',
  },
];

const FALLBACK_WORK_EXPERIENCE: WorkExperience[] = [
  { id: '1', job_title: 'Product Designer', company: 'UXCentury', date_range: '2022 — Present', description: 'Leading UX/UI design for complex products including custom casino games, data-heavy real-time dashboards, and Telegram ecosystem mini-games on the TON blockchain.', display_order: 1, created_at: '' },
  { id: '2', job_title: 'Founder & Head of Design', company: 'OneRide', date_range: '2021 — 2022', description: 'Founded and designed a regional carsharing service from the ground up. Delivered the full product: rider app, driver app, admin operations dashboard, and complete design system.', display_order: 2, created_at: '' },
  { id: '3', job_title: 'Freelance UX/UI Designer', company: 'Independent', date_range: '2020 — Present', description: 'Specialized in blockchain-based gaming and lottery platforms. Designed provably-fair game interfaces, Web3 wallet flows, and real-time results dashboards for international clients.', display_order: 3, created_at: '' },
  { id: '4', job_title: 'UX/UI Mentor', company: 'EIF (Enterprise Incubator Foundation)', date_range: '2021 — 2022', description: 'Mentored emerging designers in UX/UI fundamentals, Figma proficiency, portfolio building, and navigating freelance platforms including Upwork.', display_order: 4, created_at: '' },
  { id: '5', job_title: 'UX/UI Designer', company: 'TechMind', date_range: '2019 — 2021', description: 'Delivered pixel-perfect responsive websites and mobile application designs, managing stakeholder communication from wireframe to final handoff.', display_order: 5, created_at: '' },
  { id: '6', job_title: 'UX/UI Designer & Co-Founder', company: 'UnityX', date_range: '2018 — 2019', description: 'Co-founded the studio and designed responsive websites and mobile applications. Established internal design workflows and client delivery standards.', display_order: 6, created_at: '' },
];

const FALLBACK_CONTACT_LINKS: ContactLink[] = [
  { id: '1', label: 'Email', value: 'artagersgrigoryan@gmail.com', href: 'mailto:artagersgrigoryan@gmail.com', type: 'email', display_order: 1, created_at: '' },
  { id: '2', label: 'Phone', value: '+374 98 718 748', href: 'tel:+37498718748', type: 'phone', display_order: 2, created_at: '' },
  { id: '3', label: 'LinkedIn', value: 'linkedin.com/in/artagers-grigoryan/', href: 'https://www.linkedin.com/in/artagers-grigoryan/', type: 'linkedin', display_order: 3, created_at: '' },
  { id: '4', label: 'Behance', value: 'behance.net/artagers_grigoryan', href: 'https://www.behance.net/artagers_grigoryan', type: 'other', display_order: 4, created_at: '' },
];

const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return url && key && !url.includes('YOUR_PROJECT_ID') && !key.includes('YOUR_ANON_KEY');
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useCaseStudies() {
  const [data, setData] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    if (!isSupabaseConfigured()) {
      setData(FALLBACK_CASE_STUDIES);
      setLoading(false);
      return;
    }
    const { data: rows } = await supabase
      .from('case_studies')
      .select('*')
      .order('display_order', { ascending: true });
    setData(rows || FALLBACK_CASE_STUDIES);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);
  return { data, loading, refetch: fetch };
}

export function useWorkExperience() {
  const [data, setData] = useState<WorkExperience[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    if (!isSupabaseConfigured()) {
      setData(FALLBACK_WORK_EXPERIENCE);
      setLoading(false);
      return;
    }
    const { data: rows } = await supabase
      .from('work_experience')
      .select('*')
      .order('display_order', { ascending: true });
    setData(rows || FALLBACK_WORK_EXPERIENCE);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);
  return { data, loading, refetch: fetch };
}

export function useContactLinks() {
  const [data, setData] = useState<ContactLink[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    if (!isSupabaseConfigured()) {
      setData(FALLBACK_CONTACT_LINKS);
      setLoading(false);
      return;
    }
    const { data: rows } = await supabase
      .from('contact_links')
      .select('*')
      .order('display_order', { ascending: true });
    setData(rows || FALLBACK_CONTACT_LINKS);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);
  return { data, loading, refetch: fetch };
}
