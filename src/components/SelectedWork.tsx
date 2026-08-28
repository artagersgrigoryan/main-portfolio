import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ProjectRow from './ProjectRow';
import type { CaseStudy } from '../lib/supabase';

gsap.registerPlugin(ScrollTrigger);

type QuickTo = ReturnType<typeof gsap.quickTo>;

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

interface SelectedWorkProps {
  projects: CaseStudy[];
  loading: boolean;
}

/**
 * SelectedWork — list of case studies with a cover reveal.
 *
 * Pointer devices: hovering a row fades in a single floating cover that trails
 * the cursor (GSAP quickTo) and tilts with pointer velocity.
 * Touch devices: identical animation, but scroll position stands in for the
 * cursor — the cover fades in for whichever row is in the middle of the
 * viewport and trails its centre as the page scrolls.
 */
export default function SelectedWork({ projects, loading }: SelectedWorkProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [hoverEnabled, setHoverEnabled] = useState(false);

  const quickRef = useRef<{ x?: QuickTo; y?: QuickTo; rot?: QuickTo }>({});
  const seededRef = useRef(false);
  const lastXRef = useRef(0);
  /** Live cursor position; null once the pointer leaves the window. */
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const shownRef = useRef(false);
  const activeRef = useRef(0);
  const idleRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // ── Pointer capability ────────────────────────────────────────────────
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setHoverEnabled(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // ── Row entrance (staggered, one-shot) ────────────────────────────────
  useEffect(() => {
    if (loading || !listRef.current) return;

    const rows = gsap.utils.toArray<HTMLElement>('.project-row-wrapper', listRef.current);
    if (!rows.length) return;

    if (prefersReducedMotion()) {
      gsap.set(rows, { opacity: 1, y: 0 });
      return;
    }

    gsap.set(rows, { opacity: 0, y: 40 });
    const triggers = ScrollTrigger.batch(rows, {
      start: 'top 90%',
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, { y: 0, opacity: 1, duration: 0.7, stagger: 0.08, ease: 'power3.out' }),
    });

    return () => { triggers.forEach((t) => t.kill()); };
  }, [loading, projects]);

  // ── Floating preview setup (both modes) ───────────────────────────────
  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;

    gsap.set(el, { xPercent: -50, yPercent: -50, opacity: 0, scale: 0.92, rotation: 0 });

    if (!prefersReducedMotion()) {
      quickRef.current = {
        x: gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' }),
        y: gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' }),
        rot: gsap.quickTo(el, 'rotation', { duration: 0.7, ease: 'power3.out' }),
      };
    }

    return () => {
      quickRef.current = {};
      seededRef.current = false;
      clearTimeout(idleRef.current);
      gsap.killTweensOf(el);
    };
  }, [hoverEnabled, projects]);

  // ── Touch: scroll position replaces the cursor ────────────────────────
  // Same preview, same fade/scale/lag — the target is the active row instead of
  // the pointer. No velocity tilt here; see the note in frame().
  //
  // This is sampled every frame rather than driven by ScrollTrigger enter/leave
  // events: a fast or reversing flick fires those in bursts (or skips them), which
  // desynced the followed row from the displayed cover and made the preview
  // flicker. Picking the row nearest the anchor line each frame is correct at any
  // scroll speed or direction.
  useEffect(() => {
    if (loading || hoverEnabled || !listRef.current) return;

    const el = previewRef.current;
    const list = listRef.current;
    const rows = gsap.utils.toArray<HTMLElement>('.project-row-wrapper', list);
    if (!el || !rows.length) return;

    const reduced = prefersReducedMotion();
    const rowEls = rows.map((row) => row.querySelector('.work-row'));
    gsap.set(rowEls, { opacity: 0.35 });

    // Anchored to the row's top-right rather than its centre.
    const RIGHT_GAP = 16;
    let rightX = window.innerWidth - el.offsetWidth / 2 - RIGHT_GAP;
    let lastWidth = window.innerWidth;

    let current = -1;
    let visible = false;

    // Sampled on resize only: iOS moves innerHeight every frame while the URL
    // bar collapses, which would jiggle the anchor line.
    let vh = window.innerHeight;
    const onResize = () => {
      vh = window.innerHeight;
      lastWidth = window.innerWidth;
      rightX = lastWidth - el.offsetWidth / 2 - RIGHT_GAP;
      gsap.set(el, { x: rightX });
    };
    window.addEventListener('resize', onResize);

    /** Reading line: the row crossing this is the one being looked at. */
    const anchor = () => vh * 0.45;
    const targetY = (r: DOMRect) => r.top + r.height * 0.15;

    /**
     * Row whose centre sits closest to the anchor line. A new candidate has to
     * beat the current row by a clear margin — without that, two rows sitting
     * equidistant swap every frame and the cover strobes between them.
     */
    const SWITCH_MARGIN = 40;
    const nearestRow = (a: number) => {
      let best = current;
      let bestDist = Infinity;
      let currentDist = Infinity;

      rows.forEach((row, i) => {
        const r = row.getBoundingClientRect();
        const d = Math.abs(r.top + r.height / 2 - a);
        if (i === current) currentDist = d;
        if (d < bestDist) { bestDist = d; best = i; }
      });

      if (current >= 0 && best !== current && bestDist > currentDist - SWITCH_MARGIN) {
        return current;
      }
      return best;
    };

    const setCurrent = (i: number) => {
      if (i === current) return;
      if (current >= 0) {
        gsap.to(rowEls[current], { opacity: 0.35, duration: reduced ? 0 : 0.4, ease: 'power3.out' });
      }
      current = i;
      setActive(i);
      gsap.to(rowEls[i], { opacity: 1, duration: reduced ? 0 : 0.4, ease: 'power3.out' });
    };

    // Runs on GSAP's ticker, which is the same loop Lenis is driven from.
    const frame = () => {
      const a = anchor();
      const listRect = list.getBoundingClientRect();
      const inView = listRect.top <= a && listRect.bottom >= a;

      if (!inView) {
        if (visible) {
          visible = false;
          gsap.to(el, { opacity: 0, scale: 0.92, duration: reduced ? 0 : 0.3, ease: 'power2.out' });
        }
        return;
      }

      const i = nearestRow(a);
      if (i < 0) return;
      setCurrent(i);

      const y = targetY(rows[i].getBoundingClientRect());

      // Seed on the way in so it materialises in place instead of flying up the page.
      if (!visible) {
        visible = true;
        gsap.set(el, { x: rightX, y, rotation: 0 });
        gsap.to(el, { opacity: 1, scale: 1, duration: reduced ? 0 : 0.45, ease: 'power3.out' });
      }

      // No tilt on touch: scroll deltas are too noisy for it to read as anything
      // but vibration. The cover just glides.
      const { y: yTo } = quickRef.current;
      if (yTo) yTo(y); else gsap.set(el, { y });
    };

    gsap.ticker.add(frame);
    frame();

    return () => {
      window.removeEventListener('resize', onResize);
      gsap.ticker.remove(frame);
      gsap.killTweensOf(el);
      gsap.set(rowEls, { opacity: 1 });
    };
  }, [loading, hoverEnabled, projects]);

  // ── Pointer: the row under the cursor, resolved every frame ───────────
  // mouseenter/mouseleave cannot answer this on their own. Scrolling with the
  // mouse held still slides rows past a stationary cursor, and Chrome fires
  // those enter/leave pairs unevenly — the list can scroll clean out of view
  // leaving a final, unmatched mouseenter behind. That is what stranded the
  // cover: visible, frozen, floating over whatever section had scrolled in.
  //
  // So visibility and the active row are owned here, not by the handlers.
  // Hit-testing the live cursor point each frame is correct whatever the
  // events do, at any scroll speed, in either direction.
  useEffect(() => {
    if (loading || !hoverEnabled || !listRef.current) return;

    const el = previewRef.current;
    const rows = gsap.utils.toArray<HTMLElement>('.project-row-wrapper', listRef.current);
    if (!el || !rows.length) return;

    const reduced = prefersReducedMotion();

    // Tracked on the window, not the list: the frame needs to know the cursor
    // has moved away just as much as it needs to know it is still here.
    const track = (e: MouseEvent) => { pointerRef.current = { x: e.clientX, y: e.clientY }; };
    const forget = () => { pointerRef.current = null; };
    window.addEventListener('mousemove', track, { passive: true });
    document.addEventListener('mouseleave', forget);

    const frame = () => {
      const p = pointerRef.current;
      const i = p
        ? rows.findIndex((row) => {
            const r = row.getBoundingClientRect();
            return p.y >= r.top && p.y <= r.bottom && p.x >= r.left && p.x <= r.right;
          })
        : -1;

      if (i === -1) {
        if (shownRef.current) {
          shownRef.current = false;
          gsap.to(el, { opacity: 0, scale: 0.92, duration: reduced ? 0 : 0.3, ease: 'power2.out' });
        }
        return;
      }

      if (i !== activeRef.current) {
        activeRef.current = i;
        setActive(i);
      }

      if (!shownRef.current) {
        shownRef.current = true;
        // The cursor is where it is: materialise there rather than fly in.
        gsap.set(el, { x: p!.x, y: p!.y });
        gsap.to(el, { opacity: 1, scale: 1, duration: reduced ? 0 : 0.45, ease: 'power3.out' });
      }
    };

    gsap.ticker.add(frame);
    frame();

    return () => {
      window.removeEventListener('mousemove', track);
      document.removeEventListener('mouseleave', forget);
      gsap.ticker.remove(frame);
      shownRef.current = false;
    };
  }, [loading, hoverEnabled, projects]);

  // ── Pointer handlers ──────────────────────────────────────────────────
  const handleMove = (e: React.MouseEvent) => {
    const el = previewRef.current;
    if (!el || !hoverEnabled) return;

    const { x, y, rot } = quickRef.current;

    // First move after entering: materialise under the cursor, don't fly in.
    if (!seededRef.current || !x || !y) {
      gsap.set(el, { x: e.clientX, y: e.clientY });
      seededRef.current = true;
      lastXRef.current = e.clientX;
      return;
    }

    x(e.clientX);
    y(e.clientY);

    if (rot) {
      rot(clamp((e.clientX - lastXRef.current) * 0.35, -10, 10));
      // Settle back to level once the pointer stops moving.
      clearTimeout(idleRef.current);
      idleRef.current = setTimeout(() => rot(0), 90);
    }
    lastXRef.current = e.clientX;
  };

  const handleLeave = () => {
    seededRef.current = false;
    clearTimeout(idleRef.current);
  };

  // ── Loading skeleton ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div>
        {[0, 1, 2].map((i) => (
          <div key={i} className="border-b-2 border-[#0a0a0a] px-6 py-10 xl:py-12">
            <div className="h-9 xl:h-12 bg-[#f0f0f0] w-2/3 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div
        ref={listRef}
        className="work-list"
        onMouseMove={hoverEnabled ? handleMove : undefined}
        onMouseLeave={hoverEnabled ? handleLeave : undefined}
      >
        {projects.map((project, i) => (
          <div key={project.id} className="project-row-wrapper border-b-2 border-[#0a0a0a]">
            <ProjectRow project={project} index={i} />
          </div>
        ))}
      </div>

      {/* Floating cover — one element for the whole list: follows the cursor
          on pointer devices, the active row's centre on touch devices */}
      {projects.length > 0 && (
        <div
          ref={previewRef}
          aria-hidden
          className="fixed left-0 top-0 z-40 pointer-events-none w-[46vw] max-w-[200px] lg:w-[360px] lg:max-w-none xl:w-[420px] border-2 border-[#0a0a0a] bg-white overflow-hidden opacity-0 will-change-transform"
          style={{ aspectRatio: '16 / 10', backfaceVisibility: 'hidden' }}
        >
          {projects.map((project, i) => (
            <img
              key={project.id}
              src={project.image_url}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              style={{ opacity: i === active ? 1 : 0, transition: 'opacity 0.25s ease' }}
            />
          ))}
        </div>
      )}
    </>
  );
}
