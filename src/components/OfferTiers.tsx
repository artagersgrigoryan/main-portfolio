import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useScrollReveal } from '../hooks/useScrollReveal';

gsap.registerPlugin(ScrollTrigger);

const TIERS = [
  {
    name: 'Product Design',
    pitch:
      'Research, flows, UI, and a design system your engineers can build from without a translation layer.',
    includes: [
      'Discovery and user flows',
      'Wireframes and high-fidelity UI',
      'Design system and components',
      'Dev-ready handoff, with support during the build',
    ],
    who: 'For teams that have engineers.',
    stack: { label: 'Designed in', value: 'Figma · Webflow · Tilda · Adobe CC' },
  },
  {
    name: 'Design → Built',
    pitch:
      "Everything above, plus I ship the working front-end. One person from problem to production: no handoff, no spec arguments, no “that isn't what I drew.”",
    includes: [
      'Everything in Product Design',
      'Production front-end in React / Next.js + TypeScript',
      'Deployment on Vercel or Railway',
      'Analytics and Search Console setup',
    ],
    who: 'For founders who need it live.',
    stack: {
      label: 'Built with',
      value: 'Next.js · React · TypeScript · Node · PostgreSQL · Prisma · Vercel',
    },
  },
];

/**
 * One tier. Its own component because each row calls the reveal hooks, and
 * hooks cannot run inside a .map().
 *
 * The outer/inner split on both columns is load-bearing: the parallax writes
 * yPercent on the outer element and the reveal writes y on the inner one, so
 * the two tweens never fight over a single transform. Same reason
 * .hero-title-wrap wraps .hero-title.
 */
function OfferTier({ tier, index }: { tier: (typeof TIERS)[number]; index: number }) {
  const leadOuterRef = useRef<HTMLDivElement>(null);
  const detailOuterRef = useRef<HTMLDivElement>(null);

  // Two beats, left then right — the work list's stagger, with two items.
  const leadRef = useScrollReveal<HTMLDivElement>({ y: 48, duration: 0.8, start: 'top 85%' });
  const detailRef = useScrollReveal<HTMLDivElement>({
    y: 48,
    duration: 0.8,
    start: 'top 85%',
    delay: 0.12,
  });

  // The hero's opposed drift at a tenth of the amplitude: the two columns
  // separate as the row crosses the viewport rather than travelling as a slab.
  // Desktop only — below 1024 the columns are stacked, so opposing them would
  // just pull the row apart vertically.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const mm = gsap.matchMedia();
    mm.add('(min-width: 1024px)', () => {
      const scrollTrigger = {
        trigger: leadOuterRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.6,
      };
      gsap.to(leadOuterRef.current, { yPercent: -2.5, ease: 'none', scrollTrigger });
      gsap.to(detailOuterRef.current, { yPercent: 2.5, ease: 'none', scrollTrigger });
    });

    return () => { mm.revert(); };
  }, []);

  return (
    <article className="offer-tier flex flex-col gap-6 lg:grid lg:items-start lg:gap-x-8 lg:grid-cols-[3rem_minmax(0,36rem)_minmax(0,34rem)]">
      {/* Lands on the same vertical line as the work list's 01–05 above. */}
      <span
        aria-hidden
        className="font-mono text-xs tracking-widest text-[#999] lg:pt-4"
      >
        {String(index + 1).padStart(2, '0')}
      </span>

      <div ref={leadOuterRef}>
        <div ref={leadRef}>
          <h3 className="text-4xl md:text-6xl xl:text-7xl font-bold uppercase leading-none tracking-tight">
            {tier.name}
          </h3>
          <p className="text-base lg:text-lg text-[#444] leading-relaxed font-light mt-6 max-w-xl">
            {tier.pitch}
          </p>

          {/* The tools sit with the pitch, not the deliverables: they answer
              "how", which belongs to the description, and it keeps the two
              columns close enough in height that neither trails off. */}
          <p className="label-mono mt-8">{tier.stack.label}</p>
          <p className="font-mono text-sm text-[#444] mt-1 leading-relaxed max-w-xl">
            {tier.stack.value}
          </p>
        </div>
      </div>

      {/* Stacked on mobile, the two mono blocks would otherwise run together
          at the flex gap; on desktop the grid owns the spacing. */}
      <div ref={detailOuterRef} className="mt-4 lg:mt-0">
        <div ref={detailRef}>
          <p className="font-mono text-[11px] uppercase tracking-widest">{tier.who}</p>

          <ul className="mt-6 space-y-3">
            {tier.includes.map((item, k) => (
              <li key={item} className="font-mono text-sm flex gap-3 leading-relaxed">
                {/* Decoration, so it can move on hover without promising a click. */}
                <span
                  aria-hidden
                  className="offer-arrow text-[#999] shrink-0"
                  style={{ transitionDelay: `${k * 50}ms` }}
                >
                  →
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}

/**
 * The offer. Two tiers, stated plainly — "hire me" without a shape is a dead CTA.
 *
 * Built in the language of the hero and the work list: full-width rows at a type
 * scale between the two, divided by space rather than a border, with the list's
 * dim-the-others hover. The box this used to sit in was doing the work that the
 * scale now does, and it left the work list as the last bordered thing on the
 * page — which is what makes the work read as the page's evidence.
 *
 * Everything is on screen at all times. Hover changes emphasis, never
 * disclosure: this is the section that says what you get, so hiding it behind a
 * pointer would cost every reader who does not have one.
 *
 * The stack lists live here rather than in the hero: they are evidence for the
 * tier a reader is already considering, not a headline claim.
 */
export default function OfferTiers() {
  const headerRef = useScrollReveal<HTMLDivElement>({ y: 32, duration: 0.7 });

  return (
    <section className="section-quiet">
      <div className="site-shell px-6">
        <div ref={headerRef}>
          <p className="label-mono mb-3">The offer</p>
          <h2 className="heading-section">What you can hire me for</h2>
        </div>

        <div className="offer-tiers mt-14 md:mt-20 flex flex-col gap-y-20 lg:gap-y-32">
          {TIERS.map((tier, i) => (
            <OfferTier key={tier.name} tier={tier} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
