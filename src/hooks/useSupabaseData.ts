import { useState, useEffect } from 'react';
import { supabase, type CaseStudy, type WorkExperience, type ContactLink } from '../lib/supabase';

// ─── Fallback Static Data (shown when Supabase is not configured) ─────────────

const FALLBACK_CASE_STUDIES: CaseStudy[] = [
  {
    id: '1',
    title: 'Casino Gaming Platform',
    description: 'End-to-end UX/UI redesign of a high-traffic online casino platform. Focused on conversion optimization, game discovery, and real-time data visualization for live dealer experiences.',
    image_url: 'https://images.unsplash.com/photo-1642790551116-18e150f248e3?w=800&q=80',
    link: '#',
    tags: ['Casino', 'Dashboard', 'UX Research'],
    display_order: 1,
    created_at: '',
  },
  {
    id: '2',
    title: 'Telegram Mini-App Games',
    description: 'Designed a suite of interactive mini-games for the Telegram ecosystem, optimizing for small-screen UX and viral loop mechanics within the TON blockchain environment.',
    image_url: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=80',
    link: '#',
    tags: ['Telegram', 'Gaming', 'Mobile'],
    display_order: 2,
    created_at: '',
  },
  {
    id: '3',
    title: 'OneRide Carsharing',
    description: 'Founded and led product design for a regional carsharing service in Armenia. Delivered driver and rider apps, an operations dashboard, and a full design system.',
    image_url: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80',
    link: '#',
    tags: ['Mobile App', 'Design System', 'Startup'],
    display_order: 3,
    created_at: '',
  },
  {
    id: '4',
    title: 'Blockchain Lottery Platform',
    description: 'UX for a provably-fair, blockchain-based lottery. Designed transparent game mechanics, wallet integration flows, and a real-time results dashboard.',
    image_url: 'https://images.unsplash.com/photo-1639762681057-408e52192e55?w=800&q=80',
    link: '#',
    tags: ['Blockchain', 'Web3', 'UI Design'],
    display_order: 4,
    created_at: '',
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
  { id: '2', label: 'Phone', value: '+374 98 718 748', href: 'tel:+37498718748', type: 'other', display_order: 2, created_at: '' },
  { id: '3', label: 'LinkedIn', value: 'linkedin.com/in/artagers', href: 'https://linkedin.com/in/artagers', type: 'linkedin', display_order: 3, created_at: '' },
  { id: '4', label: 'Dribbble', value: 'dribbble.com/artagers', href: 'https://dribbble.com/artagers', type: 'dribbble', display_order: 4, created_at: '' },
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
