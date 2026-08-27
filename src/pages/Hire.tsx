import { useEffect } from 'react';
import { useWorkExperience } from '../hooks/useSupabaseData';
import { trackEvent } from '../lib/analytics';

const EDUCATION = [
  { school: 'Pixel IT School', field: 'UX/UI Design', type: 'Professional' },
  { school: 'Vanadzor Technology Center', field: 'Graphic Design', type: 'Professional' },
  { school: 'Tavrizyan Art Collage', field: 'Fine Arts', type: 'Academic' },
];

const LANGUAGES = [
  { lang: 'Armenian', level: 'Native' },
  { lang: 'Russian', level: 'Fluent' },
  { lang: 'English', level: 'Conversational' },
];

const ARGUMENTS = [
  {
    title: 'One less handoff',
    body: 'I write the front-end I design. Nothing gets lost translating a Figma file into a ticket.',
  },
  {
    title: 'Feasibility in the room',
    body: 'I know what a design costs to build before it is agreed, not after the estimate comes back.',
  },
  {
    title: 'Prototypes, not descriptions',
    body: 'Interactions get built and clicked rather than explained in a comment thread.',
  },
];

export default function Hire() {
  const { data: experience } = useWorkExperience();

  useEffect(() => {
    document.title = 'Hire me — Artagers Grigoryan';
    trackEvent('hire_page_view');
  }, []);

  return (
    <main className="pt-14">
      <section className="site-shell border-b-2 border-[#0a0a0a]">
        <div className="px-6 py-4 border-b-2 border-[#0a0a0a]">
          <span className="label-mono">For hiring teams</span>
        </div>
        <div className="flex flex-col md:flex-row">
          <div className="flex-1 px-6 py-10 border-b-2 md:border-b-0 md:border-r-2 border-[#0a0a0a]">
            <h1 className="text-[clamp(2.5rem,7vw,6rem)] font-bold leading-none tracking-tight uppercase">
              Designer
              <br />
              Who Ships.
            </h1>
          </div>
          <div className="flex-1 flex flex-col justify-end px-6 py-10">
            <p className="text-base text-[#444] leading-relaxed font-light max-w-md">
              Product designer with four years across iGaming, Web3 and
              data-heavy platforms, who also builds and deploys production
              front-ends. Open to full-time and long-term contract roles,
              remote or in Yerevan.
            </p>
          </div>
        </div>
      </section>

      <section className="site-shell border-b-2 border-[#0a0a0a]">
        <div className="px-6 py-6 border-b-2 border-[#0a0a0a]">
          <h2 className="heading-section">What that's worth to a team</h2>
        </div>
        <div className="flex flex-col md:flex-row">
          {ARGUMENTS.map((arg, i) => (
            <div
              key={arg.title}
              className={`flex-1 px-6 py-8 border-[#0a0a0a] ${i < ARGUMENTS.length - 1 ? 'border-b-2 md:border-b-0 md:border-r-2' : ''}`}
            >
              <h3 className="text-lg font-bold uppercase tracking-tight leading-tight">{arg.title}</h3>
              <p className="text-sm text-[#444] leading-relaxed font-light mt-2">{arg.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="site-shell border-b-2 border-[#0a0a0a]">
        <div className="px-6 py-6 border-b-2 border-[#0a0a0a]">
          <h2 className="heading-section">Experience</h2>
        </div>
        {experience.map((job) => (
          <div key={job.id} className="px-6 py-8 border-b-2 border-[#0a0a0a] last:border-b-0 flex flex-col lg:flex-row gap-4 lg:gap-10">
            <p className="font-mono text-xs text-[#999] uppercase tracking-widest lg:w-48 shrink-0">
              {job.date_range}
            </p>
            <div>
              <h3 className="text-xl font-bold uppercase tracking-tight">{job.job_title}</h3>
              <p className="label-mono mt-1">{job.company}</p>
              <p className="text-sm text-[#444] leading-relaxed font-light mt-3 max-w-2xl">
                {job.description}
              </p>
            </div>
          </div>
        ))}
      </section>

      <section className="site-shell border-b-2 border-[#0a0a0a] flex flex-col md:flex-row">
        <div className="flex-1 px-6 py-8 border-b-2 md:border-b-0 md:border-r-2 border-[#0a0a0a]">
          <p className="label-mono mb-4">Design</p>
          <p className="font-mono text-sm leading-relaxed">
            Figma · Webflow · Tilda · Adobe CC · Illustrator · After Effects
          </p>
        </div>
        <div className="flex-1 px-6 py-8 border-b-2 md:border-b-0 md:border-r-2 border-[#0a0a0a]">
          <p className="label-mono mb-4">Build</p>
          <p className="font-mono text-sm leading-relaxed">
            Next.js · React · TypeScript · Node · PostgreSQL · Prisma · Vercel · Railway
          </p>
        </div>
        <div className="flex-1 px-6 py-8">
          <p className="label-mono mb-4">Languages</p>
          {LANGUAGES.map((l) => (
            <p key={l.lang} className="font-mono text-sm">
              {l.lang} — <span className="text-[#666]">{l.level}</span>
            </p>
          ))}
        </div>
      </section>

      <section className="site-shell border-b-2 border-[#0a0a0a]">
        <div className="px-6 py-6 border-b-2 border-[#0a0a0a]">
          <h2 className="heading-section">Education</h2>
        </div>
        <div className="flex flex-col md:flex-row">
          {EDUCATION.map((e, i) => (
            <div
              key={e.school}
              className={`flex-1 px-6 py-8 border-[#0a0a0a] ${i < EDUCATION.length - 1 ? 'border-b-2 md:border-b-0 md:border-r-2' : ''}`}
            >
              <p className="label-mono mb-2">{e.type}</p>
              <p className="font-bold uppercase tracking-tight">{e.school}</p>
              <p className="font-mono text-sm text-[#666] mt-1">{e.field}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#0a0a0a] text-white">
        <div className="site-shell flex flex-col md:flex-row items-center justify-between px-6 py-12 gap-6">
          <h3 className="text-2xl md:text-4xl font-bold leading-none uppercase">
            Hiring? Let's talk.
          </h3>
          <a
            href="mailto:artagersgrigoryan@gmail.com"
            className="btn-brutal-primary-invert whitespace-nowrap"
          >
            Email me →
          </a>
        </div>
      </section>
    </main>
  );
}
