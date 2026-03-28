import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ProjectCard from '../components/ProjectCard';
import MarqueeBar from '../components/MarqueeBar';
import { useCaseStudies } from '../hooks/useSupabaseData';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const { data: projects, loading } = useCaseStudies();
  const heroRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLDivElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo(headingRef.current, { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 1 })
      .fromTo(subRef.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, '-=0.5')
      .fromTo(metaRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, '-=0.3');

    return () => { tl.kill(); };
  }, []);

  useEffect(() => {
    if (loading || !projectsRef.current) return;

    const cards = projectsRef.current.querySelectorAll('.project-card-wrapper');
    cards.forEach((card) => {
      gsap.fromTo(
        card,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            once: true,
          },
        }
      );
    });

    return () => { ScrollTrigger.getAll().forEach(t => t.kill()); };
  }, [loading]);

  return (
    <main className="pt-14">
      {/* ── Hero Section ─────────────────────────────────────────────── */}
      <section ref={heroRef} className="min-h-[90vh] flex flex-col justify-end border-b-2 border-[#0a0a0a]">
        <div className="max-w-[1400px] mx-auto w-full">
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
              Available for work ◉
            </span>
          </div>

          {/* Main heading */}
          <div className="px-6 py-16 md:py-24 border-b-2 border-[#0a0a0a]">
            <h1
              ref={headingRef}
              className="text-[clamp(3rem,10vw,9rem)] font-bold leading-[0.9] tracking-[-0.03em] uppercase"
            >
              Artagers
              <br />
              <span className="inline-block border-b-[6px] border-[#0a0a0a]">Grigoryan</span>
            </h1>
          </div>

          {/* Sub section */}
          <div ref={subRef} className="flex flex-col md:flex-row">
            <div className="flex-1 px-6 py-8 border-b-2 md:border-b-0 md:border-r-2 border-[#0a0a0a]">
              <p className="text-base md:text-lg text-[#444] leading-relaxed max-w-lg font-light">
                Artagers Grigoryan. Specializing in UX/UI for online casinos,
                custom games, complex dashboards, and Telegram ecosystem games.
              </p>
            </div>
            <div className="flex-1 px-6 py-8 border-b-2 md:border-b-0 md:border-r-2 border-[#0a0a0a]">
              <p className="label-mono mb-2">Core Stack</p>
              <p className="font-mono text-sm">
                Figma · Webflow · Tilda
                <br />
                Adobe CC · Illustrator · After Effects
              </p>
            </div>
            <div className="flex-1 px-6 py-8">
              <p className="label-mono mb-2">Domains</p>
              <p className="font-mono text-sm">
                Casino UX · Game Design
                <br />
                Dashboards · Web3 · Telegram
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Marquee ──────────────────────────────────────────────────── */}
      <MarqueeBar />

      {/* ── Case Studies ─────────────────────────────────────────────── */}
      <section className="max-w-[1400px] mx-auto">
        {/* Section header */}
        <div className="flex items-center justify-between px-6 py-6 border-b-2 border-[#0a0a0a]">
          <h2 className="font-mono text-xs uppercase tracking-widest text-[#666]">
            Selected Work ({projects.length})
          </h2>
          <span className="font-mono text-xs uppercase tracking-widest text-[#999]">
            Case Studies
          </span>
        </div>

        {/* Cards */}
        <div ref={projectsRef}>
          {loading ? (
            // Skeleton
            [0, 1, 2].map((i) => (
              <div key={i} className="project-card-wrapper border-b-2 border-[#0a0a0a]">
                <div className="flex flex-col lg:flex-row h-[300px] animate-pulse">
                  <div className="lg:w-[55%] bg-[#f0f0f0]" />
                  <div className="lg:w-[45%] p-8 space-y-4">
                    <div className="h-3 bg-[#f0f0f0] w-24" />
                    <div className="h-8 bg-[#f0f0f0] w-3/4" />
                    <div className="h-4 bg-[#f0f0f0] w-full" />
                    <div className="h-4 bg-[#f0f0f0] w-2/3" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            projects.map((project, i) => (
              <div key={project.id} className="project-card-wrapper border-b-2 border-[#0a0a0a]">
                <ProjectCard project={project} index={i} />
              </div>
            ))
          )}
        </div>
      </section>

      {/* ── CTA Strip ────────────────────────────────────────────────── */}
      <section className="border-t-2 border-[#0a0a0a] bg-[#0a0a0a] text-white">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between px-6 py-12 gap-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-[#666] mb-2">
              Let's collaborate
            </p>
            <h3 className="text-3xl md:text-5xl font-bold leading-none">
              Have a project?
              <br />
              Let's talk.
            </h3>
          </div>
          <a
            href="/contact"
            onClick={(e) => { e.preventDefault(); window.location.href = '/contact'; }}
            className="btn-brutal-filled border-white text-white hover:bg-white hover:text-[#0a0a0a] font-mono text-sm py-4 px-8 whitespace-nowrap"
          >
            Get In Touch →
          </a>
        </div>
      </section>
    </main>
  );
}
