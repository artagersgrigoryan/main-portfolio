import { useEffect, useRef, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ─── Config ───────────────────────────────────────────────────────────────────
interface ScrollRevealOptions {
  /** Y-axis offset in pixels (default: 60) */
  y?: number;
  /** Initial opacity (default: 0) */
  opacity?: number;
  /** Initial scale (default: 1) */
  scale?: number;
  /** Animation duration in seconds (default: 0.8) */
  duration?: number;
  /** Delay in seconds (default: 0) */
  delay?: number;
  /** ScrollTrigger start position (default: 'top 88%') */
  start?: string;
}

/**
 * Scroll-triggered reveal animation using GSAP + ScrollTrigger.
 *
 * Uses CSS transforms (translateY, scale) + opacity for 60fps GPU-accelerated
 * performance. Automatically disabled when `prefers-reduced-motion` is enabled.
 *
 * @example
 * const ref = useScrollReveal<HTMLDivElement>({ y: 40, duration: 0.6 });
 * return <div ref={ref}>...</div>;
 */
export function useScrollReveal<T extends HTMLElement>(
  options: ScrollRevealOptions = {}
): RefObject<T | null> {
  const ref = useRef<T>(null);

  const {
    y = 60,
    opacity = 0,
    scale = 1,
    duration = 0.8,
    delay = 0,
    start = 'top 88%',
  } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // ── Accessibility: skip animation for reduced-motion users ──────────
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      gsap.set(el, { opacity: 1, y: 0, scale: 1 });
      return;
    }

    // ── Animate on scroll ───────────────────────────────────────────────
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { y, opacity, scale },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration,
          delay,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start,
            once: true,
          },
        }
      );
    });

    return () => ctx.revert();
  }, [y, opacity, scale, duration, delay, start]);

  return ref;
}

/**
 * Apply scroll-reveal to a collection of children inside a container.
 * Useful for lists/grids where each child should animate in with a stagger.
 *
 * @example
 * const containerRef = useScrollRevealChildren<HTMLDivElement>('.card', { stagger: 0.1 });
 * return <div ref={containerRef}>...</div>;
 */
export function useScrollRevealChildren<T extends HTMLElement>(
  childSelector: string,
  options: ScrollRevealOptions & { stagger?: number } = {}
): RefObject<T | null> {
  const ref = useRef<T>(null);

  const {
    y = 60,
    opacity = 0,
    scale = 1,
    duration = 0.8,
    delay = 0,
    start = 'top 88%',
    stagger = 0.05,
  } = options;

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const children = container.querySelectorAll(childSelector);
    if (!children.length) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      gsap.set(children, { opacity: 1, y: 0, scale: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      children.forEach((child, i) => {
        gsap.fromTo(
          child,
          { y, opacity, scale },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration,
            delay: delay + i * stagger,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: child,
              start,
              once: true,
            },
          }
        );
      });
    });

    return () => ctx.revert();
  }, [childSelector, y, opacity, scale, duration, delay, start, stagger]);

  return ref;
}
