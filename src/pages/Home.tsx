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
  const portraitRef = useRef<HTMLImageElement>(null);
  const titleWrapRef = useRef<HTMLDivElement>(null);

  // ── Hero entrance ────────────────────────────────────────────────────
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo(headingRef.current, { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 1 })
      .fromTo(subRef.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, '-=0.5')
      .fromTo(metaRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, '-=0.3')
      .fromTo(portraitRef.current, { opacity: 0 }, { opacity: 1, duration: 0.7 }, '-=0.5');
    return () => { tl.kill(); };
  }, []);

  // ── Opposed parallax ─────────────────────────────────────────────────
  // Portrait lags the page, headline leads it, so the two planes separate as
  // the hero scrolls away. Skipped entirely under reduced motion.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      const scrollTrigger = {
        trigger: heroRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5,
      };
      gsap.to(portraitRef.current, { yPercent: 9, ease: 'none', scrollTrigger });
      gsap.to(titleWrapRef.current, { yPercent: -26, ease: 'none', scrollTrigger });
    });

    return () => ctx.revert();
  }, []);

  return (
    <main className="pt-14">
      {/* ── Hero ─────────────────────────────────────────────────────────
          The cutout stands in front of the headline rather than beside it, so
          the type runs full-bleed instead of making room for a box. On scroll
          the two layers drift in opposition — the portrait lags, the headline
          leads — which separates them instead of colliding. */}
      <section ref={heroRef} className="hero-shell relative overflow-hidden">

        <div className="site-shell relative px-6 flex flex-col flex-1 hero-pad">
          <img
            ref={portraitRef}
            src="/hero-portrait.webp"
            srcSet="/hero-portrait-sm.webp 700w, /hero-portrait.webp 1200w"
            sizes="(max-width: 1023px) 80vw, 46vw"
            alt="Artagers Grigoryan"
            width={1200}
            height={1689}
            className="hero-portrait"
          />
          <div ref={metaRef} className="hero-status">
            <span className="hero-status__item">Yerevan, Armenia</span>
            <span className="hero-status__item">{CAPACITY}</span>
          </div>

          <div ref={titleWrapRef} className="hero-title-wrap">
            <h1 ref={headingRef} className="hero-title">
              <span className="hero-title__line">From Problem</span>
              <span className="hero-title__line">To Production</span>
            </h1>
          </div>

          <div ref={subRef} className="hero-lower">
            <p className="hero-lede">
              <strong className="font-bold text-[#0a0a0a]">Artagers Grigoryan</strong> — product
              designer for iGaming, Web3 and complex digital environments. I design the product,
              and when you need it live rather than just drawn, I build and ship the front-end
              myself.
            </p>

            <div className="hero-actions">
              <Link
                to="/contact"
                className="btn-brutal-primary text-center"
                onClick={() => trackEvent('cta_start_project', { location: 'hero' })}
              >
                Start project →
              </Link>
              <a
                href="#work"
                className="btn-brutal font-mono text-sm text-center"
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
