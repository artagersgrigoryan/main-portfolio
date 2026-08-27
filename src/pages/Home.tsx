import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SelectedWork from '../components/SelectedWork';
import MarqueeBar from '../components/MarqueeBar';
import { Link } from 'react-router-dom';
import { useCaseStudies } from '../hooks/useSupabaseData';
import { trackEvent } from '../lib/analytics';
import { useLenis } from '../components/SmoothScroll';

/**
 * Hand-edited. "Available for work" read as *unemployed* to a prospective
 * client; capacity reads as demand. Not wired to Supabase — an admin field for
 * one string is not worth the schema change.
 */
const CAPACITY = '2 project slots open';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const { data: projects, loading } = useCaseStudies();
  const heroRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  useEffect(() => { document.title = 'Artagers Grigoryan — Product Designer'; }, []);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLDivElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);

  // ── Hero entrance ────────────────────────────────────────────────────
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo(headingRef.current, { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 1 })
      .fromTo(subRef.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, '-=0.5')
      .fromTo(metaRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, '-=0.3');
    return () => { tl.kill(); };
  }, []);

  return (
    <main className="pt-14">
      {/* ── Hero Section ─────────────────────────────────────────────── */}
      <section ref={heroRef} className="min-h-[90vh] flex flex-col justify-end border-b-2 border-[#0a0a0a]">
        <div className="site-shell w-full">
          {/* Top meta bar */}
          <div ref={metaRef} className="flex items-center border-b-2 border-[#0a0a0a] px-6 py-3">
            <span className="font-mono text-xs text-[#666] uppercase tracking-widest">
              Product Designer
            </span>
            <span className="mx-4 text-[#ccc]">|</span>
            <span className="font-mono text-xs text-[#666] uppercase tracking-widest">
              Yerevan, Armenia
            </span>
            <span className="ml-auto font-mono text-xs text-[#666] uppercase tracking-widest">
              {CAPACITY} ◉
            </span>
          </div>

          {/* Main heading */}
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

          {/* Sub section */}
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
        </div>
      </section>

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

      {/* ── Marquee ──────────────────────────────────────────────────── */}
      <MarqueeBar />

      {/* ── Case Studies ─────────────────────────────────────────────── */}
      <section id="work" className="site-shell">
        {/* Section header */}
        <div className="flex items-center justify-between px-6 py-6 border-b-2 border-[#0a0a0a]">
          <h2 className="font-mono text-xs uppercase tracking-widest text-[#666]">
            Selected Work ({projects.length})
          </h2>
          <span className="font-mono text-xs uppercase tracking-widest text-[#999]">
            Case Studies
          </span>
        </div>

        <SelectedWork projects={projects} loading={loading} />
      </section>

      {/* ── CTA Strip ────────────────────────────────────────────────── */}
      <section className="border-t-2 border-[#0a0a0a] bg-[#0a0a0a] text-white">
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
      </section>
    </main>
  );
}
