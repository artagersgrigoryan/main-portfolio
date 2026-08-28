import { Link } from 'react-router-dom';
import type { CaseStudy } from '../lib/supabase';
import { trackEvent } from '../lib/analytics';

interface ProjectRowProps {
  project: CaseStudy;
  index: number;
}

/**
 * ProjectRow — one line of the Selected Work list.
 *
 * Text only (index / title / tags / arrow) — the cover is drawn by the floating
 * preview in SelectedWork, which resolves the active row itself: by hit-testing
 * the cursor on pointer devices, by scroll position on touch ones. Rows report
 * no hover state of their own; that was the source of a stranded cover.
 */
export default function ProjectRow({ project, index }: ProjectRowProps) {
  // Links starting with "/" are internal case pages; "http…" opens externally; "#" is inert.
  const isInternal = project.link.startsWith('/');
  const isInert = project.link === '#';

  const rowClass = 'work-row group block px-6 py-8 lg:py-10 xl:py-12';

  const handleVerifyClick = () => {
    trackEvent('verify_link_click', { project: project.title });
  };

  const content = (
    <>
      <div className="project-row-text flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8">
        <span className="font-mono text-xs tracking-widest text-[#999] lg:w-12 shrink-0">
          {String(index + 1).padStart(2, '0')}
        </span>

        <h3 className="text-3xl lg:text-4xl xl:text-5xl font-bold uppercase leading-none tracking-tight transition-transform duration-500 ease-out lg:group-hover:translate-x-4">
          {project.title}
        </h3>

        {/* Description only reads on mobile — desktop rows stay one line */}
        <p className="lg:hidden text-sm text-[#444] leading-relaxed font-light">
          {project.description}
        </p>

        {project.outcome && (
          <p className="lg:max-w-sm text-sm text-[#444] leading-snug font-light lg:order-last lg:w-full">
            {project.outcome}
          </p>
        )}

        <div className="flex items-center gap-4 lg:ml-auto lg:gap-8">
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="font-mono text-[10px] uppercase tracking-widest border border-current px-2 py-0.5"
              >
                {tag}
              </span>
            ))}
          </div>
          <span
            className="font-mono text-[11px] uppercase tracking-widest shrink-0 ml-auto lg:ml-0 whitespace-nowrap transition-transform duration-500 ease-out lg:group-hover:translate-x-2"
          >
            {project.link_label || 'View project →'}
          </span>
        </div>
      </div>
    </>
  );

  return isInternal ? (
    <Link to={project.link} className={rowClass} onClick={handleVerifyClick}>
      {content}
    </Link>
  ) : (
    <a
      href={isInert ? undefined : project.link}
      target={isInert ? undefined : '_blank'}
      rel="noopener noreferrer"
      className={rowClass}
      onClick={(e) => { if (isInert) { e.preventDefault(); return; } handleVerifyClick(); }}
    >
      {content}
    </a>
  );
}
