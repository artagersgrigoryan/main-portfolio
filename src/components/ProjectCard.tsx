import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import type { CaseStudy } from '../lib/supabase';

interface ProjectCardProps {
  project: CaseStudy;
  index: number;
}

/**
 * ProjectCard — Brutalist style case study card.
 * Features: border-driven layout, GSAP hover animation, monospace tags.
 */
export default function ProjectCard({ project, index }: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const arrowRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const enterHandler = () => {
      gsap.to(imgRef.current, { scale: 1.04, duration: 0.4, ease: 'power2.out' });
      gsap.to(arrowRef.current, { x: 6, duration: 0.3, ease: 'power2.out' });
    };

    const leaveHandler = () => {
      gsap.to(imgRef.current, { scale: 1, duration: 0.4, ease: 'power2.out' });
      gsap.to(arrowRef.current, { x: 0, duration: 0.3, ease: 'power2.out' });
    };

    card.addEventListener('mouseenter', enterHandler);
    card.addEventListener('mouseleave', leaveHandler);

    return () => {
      card.removeEventListener('mouseenter', enterHandler);
      card.removeEventListener('mouseleave', leaveHandler);
    };
  }, []);

  const isEven = index % 2 === 0;

  return (
    <div
      ref={cardRef}
      className="group border-2 border-[#0a0a0a] cursor-pointer"
      style={{ borderTopWidth: index === 0 ? '2px' : '0' }}
    >
      <a
        href={project.link !== '#' ? project.link : undefined}
        target={project.link !== '#' ? '_blank' : undefined}
        rel="noopener noreferrer"
        className="block"
        onClick={(e) => { if (project.link === '#') e.preventDefault(); }}
      >
        <div className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
          {/* Image Block */}
          <div className="relative w-full lg:w-[55%] overflow-hidden bg-[#f0f0f0]" style={{ aspectRatio: '16/9' }}>
            <img
              ref={imgRef}
              src={project.image_url}
              alt={project.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {/* Index number overlay */}
            <div className="absolute top-0 left-0 bg-[#0a0a0a] text-white font-mono text-xs px-3 py-1 z-10">
              {String(index + 1).padStart(2, '0')}
            </div>
          </div>

          {/* Content Block */}
          <div className={`flex flex-col justify-between p-8 w-full lg:w-[45%] ${isEven ? 'lg:border-l-2' : 'lg:border-r-2'} border-[#0a0a0a]`}>
            <div>
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-[10px] uppercase tracking-widest border border-[#0a0a0a] px-2 py-0.5"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Title */}
              <h3 className="text-3xl md:text-4xl font-bold leading-none tracking-tight mb-4">
                {project.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-[#444] leading-relaxed font-light">
                {project.description}
              </p>
            </div>

            {/* CTA */}
            <div className="mt-8 flex items-center gap-3 font-mono text-xs font-bold uppercase tracking-widest">
              <span>View Case Study</span>
              <span ref={arrowRef} className="inline-block">→</span>
            </div>
          </div>
        </div>
      </a>
    </div>
  );
}
