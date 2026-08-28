import { useEffect, useRef, useState, type CSSProperties } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ProjectRow from './ProjectRow';
import type { CaseStudy } from '../lib/supabase';

gsap.registerPlugin(ScrollTrigger);

type QuickTo = ReturnType<typeof gsap.quickTo>;

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

const ROW_SELECTOR = '.project-row-wrapper';

/** Reference shape for cover sizing; the CSS defaults (1 / 0.625) are this. */
const BASE_RATIO = 1.6;

// One reveal, used by both the pointer and the touch loop. Kept together so
// the two device paths cannot drift apart the next time it is retuned.
const showPreview = (el: Element, reduced: boolean) =>
  gsap.to(el, { opacity: 1, scale: 1, duration: reduced ? 0 : 0.45, ease: 'power3.out' });

const hidePreview = (el: Element, reduced: boolean) =>
  gsap.to(el, { opacity: 0, scale: 0.92, duration: reduced ? 0 : 0.3, ease: 'power2.out' });

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
  /** Natural width/height of each cover, keyed by project id, once loaded. */
  const [ratios, setRatios] = useState<Record<string, number>>({});

  const quickRef = useRef<{ x?: QuickTo; y?: QuickTo; rot?: QuickTo }>({});

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

    const rows = gsap.utils.toArray<HTMLElement>(ROW_SELECTOR, listRef.current);
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
    const rows = gsap.utils.toArray<HTMLElement>(ROW_SELECTOR, list);
    if (!el || !rows.length) return;

    const reduced = prefersReducedMotion();
    const rowEls = rows.map((row) => row.querySelector('.work-row'));
    gsap.set(rowEls, { opacity: 0.35 });

    // Anchored to the row's top-right rather than its centre. The box is as
    // wide as the cover currently in it, so the anchor moves — but observing
    // that width is far cheaper than measuring it every frame, which would
    // force a layout flush inside the ticker on each tick.
    const RIGHT_GAP = 16;
    let elWidth = el.offsetWidth;
    let appliedX = NaN;
    const anchorRight = () => {
      const x = window.innerWidth - elWidth / 2 - RIGHT_GAP;
      if (x !== appliedX) {
        appliedX = x;
        gsap.set(el, { x });
      }
    };
    const ro = new ResizeObserver(() => { elWidth = el.offsetWidth; });
    ro.observe(el);

    let current = -1;
    let visible = false;

    // Sampled on resize only: iOS moves innerHeight every frame while the URL
    // bar collapses, which would jiggle the anchor line.
    let vh = window.innerHeight;
    const onResize = () => { vh = window.innerHeight; };
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
    const rects: DOMRect[] = [];
    const nearestRow = (a: number) => {
      let best = current;
      let bestDist = Infinity;
      let currentDist = Infinity;

      rows.forEach((row, i) => {
        const r = (rects[i] = row.getBoundingClientRect());
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
          hidePreview(el, reduced);
        }
        return;
      }

      const i = nearestRow(a);
      if (i < 0) return;
      setCurrent(i);

      const y = targetY(rects[i]);

      // Seed on the way in so it materialises in place instead of flying up the page.
      if (!visible) {
        visible = true;
        gsap.set(el, { y, rotation: 0 });
        showPreview(el, reduced);
      }

      anchorRight();

      // No tilt on touch: scroll deltas are too noisy for it to read as anything
      // but vibration. The cover just glides.
      const { y: yTo } = quickRef.current;
      if (yTo) yTo(y); else gsap.set(el, { y });
    };

    gsap.ticker.add(frame);
    frame();

    return () => {
      window.removeEventListener('resize', onResize);
      ro.disconnect();
      gsap.ticker.remove(frame);
      gsap.killTweensOf(el);
      gsap.set(el, { opacity: 0, scale: 0.92 });
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
  // So the cover has one owner. Visibility, the active row, the follow and the
  // tilt are all resolved here from the live cursor point, which is correct
  // whatever the events do, at any scroll speed, in either direction.
  useEffect(() => {
    if (loading || !hoverEnabled || !listRef.current) return;

    const el = previewRef.current;
    const list = listRef.current;
    const rows = gsap.utils.toArray<HTMLElement>(ROW_SELECTOR, list);
    if (!el || !rows.length) return;

    const reduced = prefersReducedMotion();

    let pointer: { x: number; y: number } | null = null;
    // Position at the previous frame. Unchanged coordinates mean the row came
    // to the cursor, not the cursor to the row.
    let prev: { x: number; y: number } | null = null;
    let shown = false;
    let current = -1;

    // Tracked on the window, not the list: the frame needs to know the cursor
    // has moved away just as much as it needs to know it is still here.
    const track = (e: MouseEvent) => { pointer = { x: e.clientX, y: e.clientY }; };
    const forget = () => { pointer = null; };
    window.addEventListener('mousemove', track, { passive: true });
    document.addEventListener('mouseleave', forget);

    const frame = () => {
      const p = pointer;
      const dx = p && prev ? p.x - prev.x : 0;
      const moved = !!p && (!prev || prev.x !== p.x || prev.y !== p.y);
      prev = p;

      // The list's own rect first. This runs every frame, and the cursor is
      // usually nowhere near the list — one layout read then answers it,
      // instead of one per row. Rows span the full width, so inside the list
      // only their vertical extent is left to test.
      let i = -1;
      if (p) {
        const b = list.getBoundingClientRect();
        if (p.x >= b.left && p.x <= b.right && p.y >= b.top && p.y <= b.bottom) {
          i = rows.findIndex((row) => {
            const r = row.getBoundingClientRect();
            return p.y >= r.top && p.y <= r.bottom;
          });
        }
      }

      if (i === -1) {
        if (shown) {
          shown = false;
          hidePreview(el, reduced);
        }
        return;
      }

      if (i !== current) {
        current = i;
        setActive(i);
      }

      // Only pointing opens the cover. A fast scroll drags every row under a
      // resting cursor in turn, and without this the whole list flickered past
      // and left the last one it touched on screen — the bottom project on the
      // way down, the top one on the way back up. Scrolling can still switch
      // the cover and close it; it just cannot be what opens it.
      if (!shown) {
        if (!moved) return;
        shown = true;
        // The cursor is where it is: materialise there rather than fly in.
        gsap.set(el, { x: p!.x, y: p!.y });
        showPreview(el, reduced);
      }

      const { x, y, rot } = quickRef.current;
      if (x && y) {
        x(p!.x);
        y(p!.y);
      } else {
        gsap.set(el, { x: p!.x, y: p!.y });
      }
      // Tilt with horizontal velocity, level again the moment it stops. The
      // frame already knows both, so this needs no idle timer of its own.
      if (rot) rot(moved ? clamp(dx * 0.35, -10, 10) : 0);
    };

    gsap.ticker.add(frame);
    frame();

    return () => {
      window.removeEventListener('mousemove', track);
      document.removeEventListener('mouseleave', forget);
      gsap.ticker.remove(frame);
      gsap.set(el, { opacity: 0, scale: 0.92 });
    };
  }, [loading, hoverEnabled, projects]);

  // Each cover keeps the shape it was exported at. Sizing is by AREA, not by
  // width: kw/kh give every cover the same area as the 16:10 box they used to
  // share, so a square and a panorama read as the same size instead of the
  // wider one dominating. Unloaded covers fall back to the CSS 16:10 default.
  const ratio = ratios[projects[active]?.id];
  const kw = ratio ? Math.sqrt(ratio / BASE_RATIO) : 0;

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
      <div ref={listRef} className="work-list">
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
          className="work-preview fixed left-0 top-0 z-40 pointer-events-none border-2 border-[#0a0a0a] bg-white overflow-hidden opacity-0 will-change-transform"
          style={
            {
              backfaceVisibility: 'hidden',
              ...(ratio && { '--preview-kw': kw, '--preview-kh': kw / ratio }),
            } as CSSProperties
          }
        >
          {projects.map((project, i) => (
            <img
              key={project.id}
              src={project.image_url}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              style={{ opacity: i === active ? 1 : 0, transition: 'opacity 0.25s ease' }}
              onLoad={(e) => {
                const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
                if (!w || !h) return;
                setRatios((prev) => (prev[project.id] ? prev : { ...prev, [project.id]: w / h }));
              }}
            />
          ))}
        </div>
      )}
    </>
  );
}
