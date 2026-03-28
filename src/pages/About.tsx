import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useWorkExperience } from '../hooks/useSupabaseData';

gsap.registerPlugin(ScrollTrigger);

const EDUCATION = [
  { school: 'Pixel IT School', field: 'UX/UI Design', type: 'Professional' },
  { school: 'Vanadzor Technology Center', field: 'Graphic Design', type: 'Professional' },
  { school: 'Tavrizyan Art Collage', field: 'Fine Arts', type: 'Academic' },
];

const LANGUAGES = [
  { lang: 'Armenian', level: 'Native', pct: 100 },
  { lang: 'Russian', level: 'Fluent', pct: 85 },
  { lang: 'English', level: 'Conversational', pct: 60 },
];

const HOBBIES = [
  { emoji: '🧩', label: "Rubik's Cube", note: '30-second solve' },
  { emoji: '⌨️', label: 'Blind Typing', note: '60 WPM' },
  { emoji: '💻', label: 'Vibe Coding', note: 'Side projects' },
];

export default function About() {
  const { data: experience, loading } = useWorkExperience();
  const stickyImgRef = useRef<HTMLDivElement>(null);
  const bioRef = useRef<HTMLDivElement>(null);
  const expRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (loading || !expRef.current) return;
    const items = expRef.current.querySelectorAll('.exp-item');
    items.forEach((item, i) => {
      gsap.fromTo(
        item,
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          delay: i * 0.05,
          ease: 'power2.out',
          scrollTrigger: { trigger: item, start: 'top 88%', once: true },
        }
      );
    });
    return () => { ScrollTrigger.getAll().forEach(t => t.kill()); };
  }, [loading]);

  return (
    <main className="pt-14">
      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div className="border-b-2 border-[#0a0a0a] max-w-[1400px] mx-auto">
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
      <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row border-b-2 border-[#0a0a0a]">
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
              and lets the product do the talking.
            </p>
          </div>



          {/* Tech stack */}
          <div className="px-6 py-8">
            <p className="label-mono mb-4">Technical Stack</p>
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

            {/* Languages */}
            <div className="border-t-2 border-[#0a0a0a] p-6">
              <p className="label-mono mb-4">Languages</p>
              {LANGUAGES.map(({ lang, level, pct }) => (
                <div key={lang} className="mb-4">
                  <div className="flex justify-between font-mono text-xs mb-1.5">
                    <span className="uppercase tracking-wider">{lang}</span>
                    <span className="text-[#666]">{level}</span>
                  </div>
                  <div className="h-1 bg-[#e0e0e0] w-full">
                    <div
                      className="h-1 bg-[#0a0a0a]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Hobbies */}
            <div className="border-t-2 border-[#0a0a0a] p-6">
              <p className="label-mono mb-4">Off the Clock</p>
              {HOBBIES.map(({ emoji, label, note }) => (
                <div key={label} className="flex items-center gap-3 mb-3">
                  <span className="text-lg">{emoji}</span>
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

      {/* ── Work Experience ───────────────────────────────────────────── */}
      <section className="max-w-[1400px] mx-auto border-b-2 border-[#0a0a0a]">
        {/* Section header */}
        <div className="flex items-center justify-between px-6 py-5 border-b-2 border-[#0a0a0a]">
          <h2 className="font-mono text-xs uppercase tracking-widest text-[#666]">
            Work Experience ({experience.length})
          </h2>
          <span className="font-mono text-xs uppercase tracking-widest text-[#999]">
            Roles & Positions
          </span>
        </div>

        <div ref={expRef}>
          {loading ? (
            [0, 1, 2, 4].map((i) => (
              <div key={i} className="exp-item border-b-2 border-[#0a0a0a] px-6 py-8 animate-pulse">
                <div className="h-4 bg-[#f0f0f0] w-48 mb-3" />
                <div className="h-3 bg-[#f0f0f0] w-32 mb-6" />
                <div className="h-3 bg-[#f0f0f0] w-full" />
              </div>
            ))
          ) : (
            experience.map((exp, i) => (
              <div
                key={exp.id}
                className={`exp-item flex flex-col md:flex-row border-[#0a0a0a] ${i < experience.length - 1 ? 'border-b-2' : ''}`}
              >
                {/* Order number */}
                <div className="flex-shrink-0 w-16 flex items-start justify-center py-8 md:border-r-2 border-[#0a0a0a]">
                  <span className="font-mono text-xs text-[#ccc]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>

                {/* Date column */}
                <div className="flex-shrink-0 w-full md:w-48 px-6 py-8 md:border-r-2 border-[#0a0a0a] border-b-2 md:border-b-0">
                  <p className="font-mono text-xs text-[#666] uppercase tracking-widest leading-relaxed">
                    {exp.date_range}
                  </p>
                </div>

                {/* Content */}
                <div className="flex-1 px-6 py-8">
                  <div className="flex flex-wrap items-baseline gap-2 mb-3">
                    <h3 className="text-xl md:text-2xl font-bold">{exp.job_title}</h3>
                    <span className="font-mono text-xs text-[#666] uppercase tracking-widest">
                      @ {exp.company}
                    </span>
                  </div>
                  <p className="text-sm text-[#444] leading-relaxed font-light">
                    {exp.description}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ── Education ─────────────────────────────────────────────────── */}
      <section className="max-w-[1400px] mx-auto border-b-2 border-[#0a0a0a]">
        <div className="flex items-center justify-between px-6 py-5 border-b-2 border-[#0a0a0a]">
          <h2 className="font-mono text-xs uppercase tracking-widest text-[#666]">
            Education
          </h2>
        </div>
        {EDUCATION.map((edu, i) => (
          <div
            key={edu.school}
            className={`flex flex-col md:flex-row border-[#0a0a0a] ${i < EDUCATION.length - 1 ? 'border-b-2' : ''}`}
          >
            <div className="flex-shrink-0 w-16 flex items-start justify-center py-6 md:border-r-2 border-[#0a0a0a]">
              <span className="font-mono text-xs text-[#ccc]">{String(i + 1).padStart(2, '0')}</span>
            </div>
            <div className="flex-shrink-0 px-6 py-6 md:w-40 md:border-r-2 border-[#0a0a0a] border-b-2 md:border-b-0">
              <span className="font-mono text-[10px] uppercase tracking-widest border border-[#ccc] px-2 py-0.5 text-[#666]">
                {edu.type}
              </span>
            </div>
            <div className="flex-1 px-6 py-6">
              <h4 className="font-bold text-lg">{edu.school}</h4>
              <p className="font-mono text-xs text-[#666] uppercase tracking-widest mt-1">{edu.field}</p>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
