import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ─── Context ──────────────────────────────────────────────────────────────────
const LenisContext = createContext<Lenis | null>(null);

export function useLenis() {
  return useContext(LenisContext);
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface SmoothScrollProps {
  children: ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function SmoothScroll({ children }: SmoothScrollProps) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Respect user's reduced-motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const lenis = new Lenis({
      lerp: prefersReducedMotion ? 1 : 0.1,       // 1 = instant (no smoothing)
      duration: prefersReducedMotion ? 0 : 1.2,
      smoothWheel: !prefersReducedMotion,
      // Keep native anchor scroll working
      anchors: true,
    });

    lenisRef.current = lenis;

    // ── Sync Lenis → GSAP ScrollTrigger ─────────────────────────────────
    lenis.on('scroll', ScrollTrigger.update);

    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000); // GSAP ticker uses seconds, Lenis expects ms
    };
    gsap.ticker.add(tickerCallback);

    // Disable Lenis's own rAF loop since GSAP drives it
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return (
    <LenisContext.Provider value={lenisRef.current}>
      {children}
    </LenisContext.Provider>
  );
}
