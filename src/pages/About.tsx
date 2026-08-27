import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { usePageMeta } from '../hooks/usePageMeta';
import { trackEvent } from '../lib/analytics';

const HOBBIES = [
  {label: "Rubik's Cube", note: '30-second solve' },
  {label: 'Blind Typing', note: '60 WPM' },
  {label: 'Building things', note: 'Shipped side projects' },
];

export default function About() {
  usePageMeta({
    title: 'About — Artagers Grigoryan',
    description: 'How a fine-art background turned into designing and shipping products for iGaming, Web3 and mobility.',
    path: '/about',
  });
  const stickyImgRef = useRef<HTMLDivElement>(null);
  const bioRef = useRef<HTMLDivElement>(null);

  // ── Bio + image entrance ──────────────────────────────────────────────
  useEffect(() => {
    gsap.fromTo(
      bioRef.current,
      { opacity: 0, x: -40 },
      { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out', delay: 0.2 }
    );
    gsap.fromTo(
      stickyImgRef.current,
      { opacity: 0, x: 40 },
      { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out', delay: 0.4 }
    );
  }, []);

  return (
    <main className="pt-14">
      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div className="border-b-2 border-[#0a0a0a] site-shell">
        <div className="px-6 py-4 border-b-2 border-[#0a0a0a]">
          <span className="label-mono">About</span>
        </div>
        <div className="px-6 py-10">
          <h1 className="text-[clamp(3rem,8vw,7rem)] font-bold leading-none tracking-tight uppercase">
            The Designer
          </h1>
        </div>
      </div>

      {/* ── Bio + Sticky Image ────────────────────────────────────────── */}
      <div className="site-shell flex flex-col lg:flex-row border-b-2 border-[#0a0a0a]">
        {/* Bio — Left */}
        <div ref={bioRef} className="flex-1 border-b-2 lg:border-b-0 lg:border-r-2 border-[#0a0a0a]">
          {/* Name block */}
          <div className="px-6 py-8 border-b-2 border-[#0a0a0a]">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Artagers
              <br />
              Grigoryan
            </h2>
            <p className="font-mono text-sm text-[#666] mt-2 uppercase tracking-widest">
              Product Designer · Yerevan, Armenia
            </p>
          </div>

          {/* Bio text */}
          <div className="px-6 py-8 border-b-2 border-[#0a0a0a] space-y-4">
            <p className="text-base leading-relaxed text-[#333]">
              I'm a Product Designer with a deep focus on digital products that demand
              precision — online casinos, real-time dashboards, custom games, and
              Telegram ecosystem applications. I don't just make interfaces look good;
              I engineer them to perform.
            </p>
            <p className="text-base leading-relaxed text-[#333]">
              My background spans founding a carsharing service (OneRide), mentoring
              the next generation of designers at EIF, and shipping blockchain-based
              gaming experiences for international clients. Each project sharpens
              my systems thinking and obsession with detail.
            </p>
            <p className="text-base leading-relaxed text-[#333]">
              I believe the best design is invisible — it gets out of the user's way
              and lets the product do the talking. I came to product design from fine
              art, which is still why I care what things look like as much as whether
              they work.
            </p>
          </div>

          {/* Tech stack */}
          <div className="px-6 py-8">
            <p className="label-mono mb-4">Design Tools</p>
            <div className="flex flex-wrap gap-2">
              {[
                'Figma', 'Components & Variables', 'Webflow', 'Tilda',
                'Illustrator', 'Photoshop', 'Premiere Pro', 'After Effects',
              ].map((tool) => (
                <span
                  key={tool}
                  className="font-mono text-xs border-2 border-[#0a0a0a] px-3 py-1 uppercase tracking-wide"
                >
                  {tool}
                </span>
              ))}
            </div>
            <p className="label-mono mt-6 mb-2">Build</p>
            <p className="font-mono text-sm">
              Next.js · React · TypeScript
              <br />
              Node · PostgreSQL · Prisma · Vercel
            </p>
            <Link
              to="/contact"
              className="btn-brutal-primary inline-block mt-8"
              onClick={() => trackEvent('cta_start_project', { location: 'about' })}
            >
              Start a project →
            </Link>
            <p className="font-mono text-xs text-[#666] uppercase tracking-widest mt-8">
              Hiring rather than commissioning? <Link to="/hire" className="underline">See the CV →</Link>
            </p>
          </div>
        </div>

        {/* Sticky Image — Right */}
        <div className="lg:w-[420px] xl:w-[480px]">
          <div
            ref={stickyImgRef}
            className="lg:sticky lg:top-14 bg-[#f0f0f0] border-b-2 lg:border-b-0 border-[#0a0a0a]"
          >
            {/* Placeholder portrait with brutalist frame */}
            <div className="relative" style={{ aspectRatio: '3/4' }}>
              <img
                src="/profile.jpg"
                alt="Artagers Grigoryan — Product Designer"
                className="w-full h-full object-cover"
              />
              {/* Overlay label */}
              <div className="absolute bottom-0 left-0 right-0 bg-[#0a0a0a] text-white p-4">
                <p className="font-mono text-xs uppercase tracking-widest">
                  Artagers Grigoryan
                </p>
                <p className="font-mono text-[10px] text-[#888] uppercase tracking-widest mt-0.5">
                  Product Designer · Yerevan, Armenia
                </p>
              </div>
            </div>

            {/* Hobbies */}
            <div className="border-t-2 border-[#0a0a0a] p-6">
              <p className="label-mono mb-4">Off the Clock</p>
              {HOBBIES.map(({ label, note }) => (
                <div key={label} className="flex items-center gap-3 mb-3">
                  <div>
                    <span className="font-mono text-xs font-bold uppercase tracking-wide">{label}</span>
                    <span className="font-mono text-xs text-[#666] ml-2">— {note}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
