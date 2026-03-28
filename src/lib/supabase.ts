import { createClient } from '@supabase/supabase-js';

// ─── Supabase Configuration ───────────────────────────────────────────────────
// Replace these with your actual Supabase project URL and anon key.
// You can find them in: Supabase Dashboard → Settings → API
//
// For production: use environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
// ─────────────────────────────────────────────────────────────────────────────

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://phpvknojrbrhqmkjdkls.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBocHZrbm9qcmJyaHFta2pka2xzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MDkzMzgsImV4cCI6MjA5MDI4NTMzOH0.9o_8eWZByV_Fu6JuUw9N7Ki8jtd7PABjydFQs-KuFOE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── Database Types ───────────────────────────────────────────────────────────

export interface CaseStudy {
  id: string;
  title: string;
  description: string;
  image_url: string;
  link: string;
  tags: string[];
  display_order: number;
  created_at: string;
}

export interface WorkExperience {
  id: string;
  job_title: string;
  company: string;
  date_range: string;
  description: string;
  display_order: number;
  created_at: string;
}

export interface ContactLink {
  id: string;
  label: string;
  value: string;
  href: string;
  type: 'email' | 'phone' | 'linkedin' | 'dribbble' | 'other';
  display_order: number;
  created_at: string;
}

// ─── SQL Schema (run in Supabase SQL Editor) ──────────────────────────────────
/*

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Case Studies table
CREATE TABLE case_studies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  link TEXT NOT NULL DEFAULT '#',
  tags TEXT[] DEFAULT '{}',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Work Experience table
CREATE TABLE work_experience (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  job_title TEXT NOT NULL,
  company TEXT NOT NULL,
  date_range TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact Links table
CREATE TABLE contact_links (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  href TEXT NOT NULL DEFAULT '#',
  type TEXT NOT NULL DEFAULT 'other',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) — Enable for all tables
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_links ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read" ON case_studies FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON work_experience FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON contact_links FOR SELECT USING (true);

-- Allow all operations (for admin — restrict with auth in production)
CREATE POLICY "Allow all for admin" ON case_studies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for admin" ON work_experience FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for admin" ON contact_links FOR ALL USING (true) WITH CHECK (true);

-- Seed initial data — Case Studies
INSERT INTO case_studies (title, description, image_url, link, tags, display_order) VALUES
('Casino Gaming Platform', 'End-to-end UX/UI redesign of a high-traffic online casino platform. Focused on conversion optimization, game discovery, and real-time data visualization for live dealer experiences.', 'https://images.unsplash.com/photo-1642790551116-18e150f248e3?w=800&q=80', '#', ARRAY['Casino', 'Dashboard', 'UX Research'], 1),
('Telegram Mini-App Games', 'Designed a suite of interactive mini-games for the Telegram ecosystem, optimizing for small-screen UX and viral loop mechanics within the TON blockchain environment.', 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=80', '#', ARRAY['Telegram', 'Gaming', 'Mobile'], 2),
('OneRide Carsharing', 'Founded and led product design for a regional carsharing service in Armenia. Delivered driver and rider apps, an operations dashboard, and a full design system.', 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80', '#', ARRAY['Mobile App', 'Design System', 'Startup'], 3),
('Blockchain Lottery Platform', 'UX for a provably-fair, blockchain-based lottery. Designed transparent game mechanics, wallet integration flows, and a real-time results dashboard.', 'https://images.unsplash.com/photo-1639762681057-408e52192e55?w=800&q=80', '#', ARRAY['Blockchain', 'Web3', 'UI Design'], 4);

-- Seed initial data — Work Experience
INSERT INTO work_experience (job_title, company, date_range, description, display_order) VALUES
('Product Designer', 'UXCentury', '2022 — Present', 'Leading UX/UI design for complex products including custom casino games, data-heavy real-time dashboards, and Telegram ecosystem mini-games on the TON blockchain.', 1),
('Founder & Head of Design', 'OneRide', '2021 — 2022', 'Founded and designed a regional carsharing service from the ground up. Delivered the full product: rider app, driver app, admin operations dashboard, and complete design system.', 2),
('Freelance UX/UI Designer', 'Independent', '2020 — Present', 'Specialized in blockchain-based gaming and lottery platforms. Designed provably-fair game interfaces, Web3 wallet flows, and real-time results dashboards for international clients.', 3),
('UX/UI Mentor', 'EIF (Enterprise Incubator Foundation)', '2021 — 2022', 'Mentored emerging designers in UX/UI fundamentals, Figma proficiency, portfolio building, and navigating freelance platforms including Upwork.', 4),
('UX/UI Designer', 'TechMind', '2019 — 2021', 'Delivered pixel-perfect responsive websites and mobile application designs, managing stakeholder communication from wireframe to final handoff.', 5),
('UX/UI Designer & Co-Founder', 'UnityX', '2018 — 2019', 'Co-founded the studio and designed responsive websites and mobile applications. Established internal design workflows and client delivery standards.', 6);

-- Seed initial data — Contact Links
INSERT INTO contact_links (label, value, href, type, display_order) VALUES
('Email', 'artagersgrigoryan@gmail.com', 'mailto:artagersgrigoryan@gmail.com', 'email', 1),
('Phone', '+374 98 718 748', 'tel:+37498718748', 'phone', 2),
('LinkedIn', 'linkedin.com/in/artagers', 'https://linkedin.com/in/artagers', 'linkedin', 3),
('Dribbble', 'dribbble.com/artagers', 'https://dribbble.com/artagers', 'dribbble', 4);

*/
