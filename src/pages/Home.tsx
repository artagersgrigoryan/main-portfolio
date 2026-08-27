import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SelectedWork from '../components/SelectedWork';
import MarqueeBar from '../components/MarqueeBar';
import OfferTiers from '../components/OfferTiers';
import ProcessSteps from '../components/ProcessSteps';
import ToolPromo from '../components/ToolPromo';
import { Link } from 'react-router-dom';
import { useCaseStudies } from '../hooks/useSupabaseData';
import { trackEvent } from '../lib/analytics';
import { useLenis } from '../components/SmoothScroll';
import { usePageMeta } from '../hooks/usePageMeta';

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

  usePageMeta({
    title: 'Artagers Grigoryan — Product Designer for iGaming, Web3 & Dashboards',
    description: 'Product designer who ships. iGaming, Web3 and data-heavy platforms — designed, and built when you need it live. Yerevan, Armenia.',
    path: '/',
  });
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLDivElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const plateRef = useRef<HTMLElement>(null);

  // ── Hero entrance ────────────────────────────────────────────────────
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo(headingRef.current, { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 1 })
      .fromTo(subRef.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, '-=0.5')
      .fromTo(metaRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, '-=0.3')
      .fromTo(plateRef.current, { opacity: 0 }, { opacity: 1, duration: 0.6 }, '-=0.4');
    return () => { tl.kill(); };
  }, []);

  return (
    <main className="pt-14">
      {/* ── Hero ─────────────────────────────────────────────────────────
          Quiet section. Four elements and nothing else: capacity, headline,
          one sentence, one pair of buttons. The stack columns that used to sit
          here moved into the offer tiers — they were the least important
          content on the page occupying two thirds of its most valuable space. */}
      <section ref={heroRef} className="min-h-[88vh] flex flex-col justify-end">
        <div className="site-shell w-full px-6 pb-20 md:pb-28">
          <div className="grid lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px] gap-14 lg:gap-16 items-end">
          <div>
          <div
            ref={metaRef}
            className="font-mono text-xs uppercase tracking-widest flex flex-wrap items-center gap-x-4 gap-y-1 mb-12 md:mb-16"
          >
            <span className="text-[#666]">Product Designer</span>
            <span aria-hidden className="text-[#ccc]">/</span>
            <span className="text-[#666]">Yerevan, Armenia</span>
            <span aria-hidden className="text-[#ccc]">/</span>
            <span className="text-[#0a0a0a]">{CAPACITY} ◉</span>
          </div>

          <h1
            ref={headingRef}
            className="text-[clamp(3rem,10vw,9rem)] lg:text-[clamp(3rem,6.6vw,6.5rem)] font-bold leading-[0.9] tracking-[-0.03em] uppercase"
          >
            From Problem
            <br />
            To <span className="inline-block border-b-[6px] border-[#0a0a0a]">Production</span>
          </h1>

          <div ref={subRef} className="mt-10 md:mt-14 max-w-2xl">
            <p className="text-lg md:text-xl text-[#444] leading-relaxed font-light">
              I'm Artagers Grigoryan — product designer for iGaming, Web3 and
              data-heavy platforms. I design the product, and when you need it
              live rather than just drawn, I build and ship the front-end myself.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-10">
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
          </div>

          {/* Portrait plate. Sits in the column that was already empty, so it
              costs the hero no hierarchy. Default state is a 1-bit dither —
              a printed plate — which resolves into the photograph on hover.
              Touch devices never hover, so the printed state is the one most
              visitors see; it has to work on its own. */}
          <figure ref={plateRef} className="portrait-plate hidden lg:block m-0">
            <div className="relative border-2 border-[#0a0a0a] bg-[#0a0a0a] overflow-hidden">
              <img
                src="/portrait-print.png"
                alt="Artagers Grigoryan"
                width={900}
                height={1125}
                className="block w-full"
              />
              <img
                src="/portrait-photo.jpg"
                alt=""
                aria-hidden
                width={900}
                height={1125}
                className="portrait-plate__photo absolute inset-0 block w-full h-full object-cover"
              />
            </div>
            <figcaption className="label-mono mt-3">
              Artagers Grigoryan · Yerevan
            </figcaption>
          </figure>
          </div>
        </div>
      </section>

      {/* ── Proof strip ──────────────────────────────────────────────────
          Quiet section. Four figures, each traceable to something a visitor
          can open. Unboxed and larger: as a bordered row it read as a table
          of specifications rather than as evidence. */}
      <section className="section-quiet">
        <div className="site-shell px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12">
            {[
              { figure: '4+ years', detail: 'Product design' },
              { figure: '8 games', detail: 'One UI system, zero dev revisions' },
              { figure: '3 platforms', detail: 'Web, iOS, Android' },
              { figure: 'Full-stack', detail: 'Next.js · Node · Postgres · Prisma' },
            ].map((item) => (
              <div key={item.figure}>
                <p className="text-3xl lg:text-5xl font-bold uppercase leading-none tracking-tight">
                  {item.figure}
                </p>
                <p className="label-mono mt-3 leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Marquee ──────────────────────────────────────────────────── */}
      <MarqueeBar />

      {/* ── Case Studies ─────────────────────────────────────────────── */}
      <section id="work" className="site-shell pt-16 md:pt-24">
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

      <OfferTiers />
      <ProcessSteps />
      <ToolPromo />

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
