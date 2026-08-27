import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePageMeta } from '../hooks/usePageMeta';

gsap.registerPlugin(ScrollTrigger);

const MEDIA = '/case-studies/fury-casino';

const META = [
  { k: 'Role', v: 'UI Designer — solo' },
  { k: 'Client', v: 'FURY — iGaming platform' },
  { k: 'Timeline', v: '2 weeks' },
  { k: 'Tools', v: 'Figma — components, styles, auto layout' },
];

interface TokenRow {
  group?: string;
  sw?: string;
  name?: string;
  value?: string;
  rounded?: boolean;
  stroke?: boolean;
}

const TOKENS: TokenRow[] = [
  { group: 'Background' },
  { sw: '#000000', name: 'Primary', value: '#000000' },
  { sw: '#0D0D0D', name: 'Secondary', value: '#0D0D0D' },
  { sw: '#272727', name: 'Alt', value: '#272727' },
  { group: 'Brand' },
  { sw: '#01CE3F', name: 'Primary', value: '#01CE3F' },
  { sw: '#0A2204', name: 'Secondary', value: '#0A2204' },
  { group: 'Text & Icons' },
  { sw: '#F7F7F7', name: 'Primary', value: '#F7F7F7' },
  { sw: '#A0A0A0', name: 'Secondary', value: '#A0A0A0' },
  { sw: '#001A09', name: 'Alt', value: '#001A09' },
  { group: 'Corner & Stroke' },
  { sw: '#141719', name: 'Rounded / Soft / Angle', value: '1000 / 6 / 0', rounded: true },
  { sw: 'transparent', name: 'Stroke Secondary', value: '#272727', stroke: true },
];

const TYPE_SCALE = [
  { name: 'H1', weight: 'Bold', desktop: '48/48', mobile: '40/40' },
  { name: 'H2', weight: 'Medium', desktop: '40/40', mobile: '32/32' },
  { name: 'H3', weight: 'Medium', desktop: '32/32', mobile: '28/28' },
  { name: 'H4', weight: 'Medium', desktop: '28/32', mobile: '24/24' },
  { name: 'H5', weight: 'Medium', desktop: '24/28', mobile: '20/20' },
  { name: 'H6', weight: 'Medium', desktop: '20/24', mobile: '16/16' },
  { name: 'Body', weight: 'Regular', desktop: '16/24', mobile: '14/24' },
  { name: 'Label', weight: 'Regular', desktop: '12/16', mobile: '12/12' },
  { name: 'Caption', weight: 'Regular', desktop: '11/12', mobile: '8/8' },
];

const GAMES = [
  { name: 'Crash', slug: 'crash', cap: 'A multiplier curve growing in real time — cash out before it crashes.' },
  { name: 'Limbo', slug: 'limbo', cap: 'Pure numbers game — target a multiplier, one giant readable result.' },
  { name: 'Dice', slug: 'dice', cap: 'Roll over/under with a dual-handle slider; multiplier, roll-over and win chance stay linked.' },
  { name: 'Mines', slug: 'mines', cap: '5×5 grid of gems and bombs; profit grows with every safe pick.' },
  { name: 'Plinko', slug: 'plinko', cap: 'Ball physics over a peg pyramid; risk level recolors the multiplier scale.' },
  { name: 'Wheel', slug: 'wheel', cap: 'Spinning segments; risk and segment count change the wheel composition.' },
  { name: 'Dragon Tower', slug: 'dragon-tower', cap: 'Climb the tower row by row — pick the safe tile, dodge the dragon.' },
  { name: 'Slice', slug: 'slice', cap: 'Hexagon reels with weighted multipliers landing under the pointer.' },
];

const STATS = [
  { big: '16', label: 'responsive interfaces — 8 games × desktop & mobile — in 2 weeks, solo' },
  { big: '0', label: 'design revisions requested during development' },
  { big: '1–2', label: 'days to design each new game once the system was in place' },
];

const RESULTS = [
  'Developers implemented the suite directly from the Figma files — the component variants and documented states left nothing to guess.',
  'Consistent betting experience across the whole suite — players learn the interface once and can play all eight games.',
  'Built entirely with components, shared styles and auto layout, so the system scales: game #9 would cost days, not weeks.',
];

// Section header bar (matches About.tsx section pattern)
function SectionHeader({ num, title }: { num: string; title: string }) {
  return (
    <div className="flex items-center justify-between px-6 py-5 border-b-2 border-[#0a0a0a]">
      <h2 className="font-mono text-xs uppercase tracking-widest text-[#666]">
        {num} — {title}
      </h2>
      <span className="font-mono text-xs uppercase tracking-widest text-[#999]">
        FURY Casino
      </span>
    </div>
  );
}

// Desktop + mobile screenshot pair
function Pair({ slug, name }: { slug: string; name: string }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[2.55fr_1fr] gap-4 items-start">
      <img
        src={`${MEDIA}/${slug}-desktop.jpg`}
        alt={`${name} — desktop`}
        loading="lazy"
        className="w-full border-2 border-[#0a0a0a]"
      />
      <img
        src={`${MEDIA}/${slug}-mobile.jpg`}
        alt={`${name} — mobile`}
        loading="lazy"
        className="w-full max-w-[70%] mx-auto md:max-w-none border-2 border-[#0a0a0a]"
      />
    </div>
  );
}

function Caption({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-xs text-[#666] leading-relaxed mt-3">{children}</p>
  );
}

export default function CaseStudyFury() {
  const heroRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);

  usePageMeta({
    title: 'FURY Telegram Mini-App Games — Case Study',
    description: 'Eight casino mini-games on one scalable UI system. 16 responsive interfaces designed solo in two weeks, with zero design revisions during development.',
    path: '/work/telegram-mini-app-games',
  });

  // ── Hero entrance ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!heroRef.current) return;
    const els = heroRef.current.querySelectorAll('.hero-el');
    gsap.fromTo(
      els,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1, delay: 0.15 }
    );
  }, []);

  // ── One-shot scroll reveals for content blocks ─────────────────────────
  useEffect(() => {
    if (!mainRef.current) return;

    const items = mainRef.current.querySelectorAll('.cs-reveal');
    const triggers: ScrollTrigger[] = [];

    gsap.set(items, { opacity: 0, y: 40 });

    items.forEach((item) => {
      const trigger = ScrollTrigger.create({
        trigger: item,
        start: 'top 90%',
        once: true,
        onEnter: () =>
          gsap.to(item, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }),
      });
      triggers.push(trigger);
    });

    return () => { triggers.forEach((t) => t.kill()); };
  }, []);

  return (
    <main ref={mainRef} className="pt-14">
      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <div ref={heroRef} className="border-b-2 border-[#0a0a0a] site-shell">
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-[#0a0a0a]">
          <span className="label-mono">Case Study · UI Design · iGaming</span>
          <Link
            to="/"
            className="font-mono text-xs uppercase tracking-widest hover:underline"
          >
            ← All Work
          </Link>
        </div>

        <div className="px-6 py-10 border-b-2 border-[#0a0a0a]">
          <h1 className="hero-el text-[clamp(2.2rem,6vw,5.5rem)] font-bold leading-none tracking-tight uppercase">
            Designing 8 Casino
            <br />
            Mini-Games on One
            <br />
            UI System
          </h1>
          <p className="hero-el text-base md:text-lg text-[#444] leading-relaxed font-light max-w-3xl mt-8">
            A scalable, fully responsive component system powering an entire
            "Originals" game suite — desktop and mobile — built in Figma with
            components, styles and auto layout. Solo, in two weeks.
          </p>
          <p className="hero-el font-mono text-xs uppercase tracking-widest mt-6">
            Limbo · Dice · Mines · Plinko · Wheel · Dragon Tower · Crash · Slice
          </p>
        </div>

        {/* Meta grid */}
        <div className="hero-el grid grid-cols-2 lg:grid-cols-4 border-b-2 border-[#0a0a0a]">
          {META.map(({ k, v }, i) => (
            <div
              key={k}
              className={`px-6 py-5 border-[#0a0a0a] ${i % 2 === 0 ? 'border-r-2' : ''} ${i < 2 ? 'border-b-2 lg:border-b-0' : ''} ${i === 1 ? 'lg:border-r-2' : ''}`}
            >
              <p className="label-mono mb-1">{k}</p>
              <p className="font-bold text-sm">{v}</p>
            </div>
          ))}
        </div>

        {/* Collage */}
        <div className="hero-el grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
          {['crash', 'mines', 'wheel', 'plinko'].map((slug) => (
            <img
              key={slug}
              src={`${MEDIA}/${slug}-desktop.jpg`}
              alt={`${slug} game — desktop`}
              loading="lazy"
              className="w-full border-2 border-[#0a0a0a]"
            />
          ))}
        </div>
      </div>

      {/* ── 01 The Problem ─────────────────────────────────────────────── */}
      <section className="site-shell border-b-2 border-[#0a0a0a]">
        <SectionHeader num="01" title="The Problem" />
        <div className="px-6 py-10">
          <p className="cs-reveal text-lg md:text-xl leading-relaxed max-w-3xl">
            FURY needed 8 different mini-games that feel like{' '}
            <strong>one product</strong>. Each game has unique mechanics — a
            multiplier curve, a mine grid, a plinko board — but players
            constantly switch between games, so the betting flow, controls and
            visual language had to stay identical everywhere. And every game
            needed a mobile version that isn't just a shrunken desktop.
          </p>
          <div className="cs-reveal bg-[#0a0a0a] text-white px-6 py-6 mt-8 max-w-3xl">
            <p className="font-mono text-sm md:text-base font-bold leading-relaxed">
              8 unique games × 2 platforms = 16 interfaces.
              <br />
              The challenge: design them without designing 16 times.
            </p>
          </div>
        </div>
      </section>

      {/* ── 02 My Approach ─────────────────────────────────────────────── */}
      <section className="site-shell border-b-2 border-[#0a0a0a]">
        <SectionHeader num="02" title="My Approach" />
        <div className="px-6 py-10 space-y-14">
          {/* System first */}
          <div className="cs-reveal">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              System first, games second
            </h3>
            <p className="text-base text-[#333] leading-relaxed max-w-3xl">
              Before any game screen, I built the shared foundation: a compact
              set of color and radius variables, a two-platform type scale, and
              the core components — bet panel, buttons, inputs, live-bets list,
              multiplier chips and result displays. Every game is assembled
              from these; nothing is drawn twice.
            </p>
          </div>

          {/* Foundations: tokens + type scale */}
          <div className="cs-reveal grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6">
            {/* Tokens */}
            <div className="border-2 border-[#0a0a0a]">
              <div className="px-5 py-3 border-b-2 border-[#0a0a0a]">
                <p className="label-mono">Variables — 12 tokens run the whole suite</p>
              </div>
              <div className="px-5 py-4">
                {TOKENS.map((t, i) =>
                  t.group ? (
                    <p key={i} className="font-mono text-[10px] font-bold uppercase tracking-widest mt-4 first:mt-0 mb-1">
                      {t.group}
                    </p>
                  ) : (
                    <div key={i} className="flex items-center gap-3 py-1.5">
                      <span
                        className="w-5 h-5 flex-none border border-[#ccc]"
                        style={{
                          background: t.sw,
                          borderColor: t.stroke ? '#272727' : undefined,
                          borderRadius: t.rounded ? '10px' : undefined,
                        }}
                      />
                      <span className="text-sm flex-1">{t.name}</span>
                      <span className="font-mono text-xs text-[#666]">{t.value}</span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Type scale */}
            <div className="border-2 border-[#0a0a0a]">
              <div className="px-5 py-3 border-b-2 border-[#0a0a0a]">
                <p className="label-mono">Type scale — desktop & mobile</p>
              </div>
              <div className="px-5 py-4">
                <div className="grid grid-cols-[1fr_auto_auto] gap-x-8 py-1.5">
                  <span />
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest">Desktop</span>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest">Mobile</span>
                </div>
                {TYPE_SCALE.map((row) => (
                  <div
                    key={row.name}
                    className="grid grid-cols-[1fr_auto_auto] gap-x-8 items-baseline py-1.5 border-t border-[#e0e0e0]"
                  >
                    <span className="text-sm">
                      <b>{row.name}</b>
                      <span className="text-[#666]"> · {row.weight}</span>
                    </span>
                    <span className="font-mono text-xs text-[#666] text-right">{row.desktop}</span>
                    <span className="font-mono text-xs text-[#666] text-right">{row.mobile}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <figure className="cs-reveal">
            <img
              src={`${MEDIA}/limbo-desktop.jpg`}
              alt="Limbo — the shared layout at its purest: bet panel + game canvas"
              loading="lazy"
              className="w-full border-2 border-[#0a0a0a]"
            />
            <Caption>
              Limbo shows the shared anatomy at its purest: bet panel (left),
              game canvas (right), recent multipliers (top).
            </Caption>
          </figure>

          {/* Anatomy */}
          <div className="cs-reveal">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Anatomy of a game screen
            </h3>
            <p className="text-base text-[#333] leading-relaxed max-w-3xl">
              Every game = <strong>bet panel + game canvas + history</strong>.
              Only the canvas changes per game. This kept the UX consistent
              across the suite — and once the system was in place, a complete
              new game (desktop + mobile) took just 1–2 days to design.
            </p>
          </div>
          <div className="cs-reveal grid grid-cols-1 md:grid-cols-2 gap-6">
            <figure>
              <img
                src={`${MEDIA}/dice-desktop.jpg`}
                alt="Dice"
                loading="lazy"
                className="w-full border-2 border-[#0a0a0a]"
              />
              <Caption>
                <b>Dice</b> — same bet panel, canvas swaps to a dual-handle
                probability slider.
              </Caption>
            </figure>
            <figure>
              <img
                src={`${MEDIA}/slice-desktop.jpg`}
                alt="Slice"
                loading="lazy"
                className="w-full border-2 border-[#0a0a0a]"
              />
              <Caption>
                <b>Slice</b> — canvas swaps to hexagon reels; controls stay
                untouched.
              </Caption>
            </figure>
          </div>

          {/* Desktop → mobile */}
          <div className="cs-reveal">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Desktop → mobile, not desktop shrunk
            </h3>
            <p className="text-base text-[#333] leading-relaxed max-w-3xl">
              On mobile the layout flips: the game canvas moves to the top so
              the action is always visible, controls stack below within thumb
              reach, and touch targets grow. Auto layout does the restacking —
              the components are identical on both platforms, only the
              structure reflows.
            </p>
          </div>
          <figure className="cs-reveal">
            <Pair slug="dragon-tower" name="Dragon Tower" />
            <Caption>
              <b>Dragon Tower</b> — desktop and mobile built from the same
              components.
            </Caption>
          </figure>
          <figure className="cs-reveal">
            <Pair slug="crash" name="Crash" />
            <Caption>
              <b>Crash</b> — on mobile the curve takes the full width up top;
              betting controls and the live-bets list stack below.
            </Caption>
          </figure>

          {/* One decision */}
          <div className="cs-reveal">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              One decision, explained
            </h3>
            <p className="text-base text-[#333] leading-relaxed max-w-3xl">
              The primary Bet button never moves. Across all 8 games it keeps
              the same color, size and slot — bottom of the bet panel on
              desktop, full-width under the controls on mobile. In fast,
              repeated betting sessions muscle memory matters more than
              novelty: a player who learns one game can play all eight without
              ever searching for the trigger. Everything playful lives in the
              game canvas; everything transactional stays boringly predictable.
            </p>
          </div>
          <figure className="cs-reveal">
            <Pair slug="mines" name="Mines" />
            <Caption>
              <b>Mines</b> — every tile is one component with variants: hidden,
              gem, bomb, revealed, dimmed. The actions stay anchored in the
              same slot on both platforms.
            </Caption>
          </figure>

          {/* Edge cases */}
          <div className="cs-reveal">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Edge cases & states
            </h3>
            <p className="text-base text-[#333] leading-relaxed max-w-3xl">
              Win and lose states, manual vs. auto-bet mode, empty history,
              provably-fair info, sound and turbo toggles — each designed as
              component variants so developers never had to guess.
            </p>
          </div>
          <div className="cs-reveal grid grid-cols-1 md:grid-cols-2 gap-6">
            <figure>
              <img
                src={`${MEDIA}/plinko-desktop.jpg`}
                alt="Plinko — high risk"
                loading="lazy"
                className="w-full border-2 border-[#0a0a0a]"
              />
              <Caption>
                <b>Plinko</b> — risk & rows options drive the multiplier scale.
              </Caption>
            </figure>
            <figure>
              <img
                src={`${MEDIA}/wheel-desktop.jpg`}
                alt="Wheel — segments"
                loading="lazy"
                className="w-full border-2 border-[#0a0a0a]"
              />
              <Caption>
                <b>Wheel</b> — risk & segment count as simple dropdowns.
              </Caption>
            </figure>
          </div>

          {/* Motion */}
          <div className="cs-reveal">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">Motion</h3>
            <p className="text-base text-[#333] leading-relaxed max-w-3xl">
              The result moments — the reveal, the win — are where these games
              live or die, so I designed them in motion, not just as static
              states.
            </p>
          </div>
          <div className="cs-reveal grid grid-cols-1 md:grid-cols-2 gap-6">
            <figure>
              <video
                src={`${MEDIA}/slice-animation.mp4`}
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                className="w-full border-2 border-[#0a0a0a] bg-black"
              />
              <Caption>
                <b>Slice</b> — reels ease to a stop, the winning hexagon lights
                up under the pointer.
              </Caption>
            </figure>
            <figure>
              <video
                src={`${MEDIA}/dragon-tower-animation.mp4`}
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                className="w-full border-2 border-[#0a0a0a] bg-black"
              />
              <Caption>
                <b>Dragon Tower</b> — tile reveals and the climb, row by row.
              </Caption>
            </figure>
          </div>
        </div>
      </section>

      {/* ── 03 The 8 Games ─────────────────────────────────────────────── */}
      <section className="site-shell border-b-2 border-[#0a0a0a]">
        <SectionHeader num="03" title="The 8 Games" />
        <div className="px-6 py-10">
          <p className="cs-reveal text-base text-[#333] leading-relaxed max-w-3xl mb-12">
            One system, eight personalities. The canvas gives each game its
            character; everything around it stays familiar. Every game shown
            desktop + mobile.
          </p>
          <div className="space-y-14">
            {GAMES.map((game) => (
              <div key={game.slug} className="cs-reveal">
                <span className="inline-block font-mono text-[10px] font-bold uppercase tracking-widest border-2 border-[#0a0a0a] px-3 py-1 mb-4">
                  {game.name}
                </span>
                <Pair slug={game.slug} name={game.name} />
                <Caption>{game.cap}</Caption>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 04 The Result ──────────────────────────────────────────────── */}
      <section className="site-shell border-b-2 border-[#0a0a0a]">
        <SectionHeader num="04" title="The Result" />
        <div className="cs-reveal grid grid-cols-1 md:grid-cols-3 border-b-2 border-[#0a0a0a]">
          {STATS.map(({ big, label }, i) => (
            <div
              key={big}
              className={`px-6 py-8 border-[#0a0a0a] ${i < STATS.length - 1 ? 'border-b-2 md:border-b-0 md:border-r-2' : ''}`}
            >
              <p className="text-5xl md:text-6xl font-bold">{big}</p>
              <p className="font-mono text-xs text-[#666] leading-relaxed mt-3 uppercase tracking-wide">
                {label}
              </p>
            </div>
          ))}
        </div>
        <div className="px-6 py-10">
          <ul className="cs-reveal space-y-4 max-w-3xl">
            {RESULTS.map((item) => (
              <li key={item} className="flex gap-4 text-base text-[#333] leading-relaxed">
                <span className="font-mono font-bold flex-none">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="cs-reveal mt-12">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">What I'd improve</h3>
            <p className="text-base text-[#333] leading-relaxed max-w-3xl">
              Slice and Dragon Tower got full motion studies; next time I'd
              make motion part of the system itself — shared durations, easings
              and win-celebration patterns specced for all eight games, not
              designed per game. And since the whole suite already runs on 12
              variables, I'd take the cheap win and ship an alternate theme to
              prove how far the system stretches.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      <section className="site-shell border-b-2 border-[#0a0a0a]">
        <div className="cs-reveal px-6 py-16 md:py-24 text-center">
          <p className="label-mono mb-4">Artagers Grigoryan</p>
          <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tight">
            Need UI that scales?
          </h2>
          <p className="text-base text-[#444] leading-relaxed font-light max-w-lg mx-auto mt-4">
            I design interfaces systematically — and I can code, so what you
            see is what ships.
          </p>
          <Link to="/contact" className="btn-brutal-filled inline-block mt-8">
            Get in touch →
          </Link>
        </div>
      </section>
    </main>
  );
}
