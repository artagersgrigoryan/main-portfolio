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
 * The offer. Two tiers, stated plainly — "hire me" without a shape is a dead CTA.
 *
 * One of only two sections that still carries borders, and the rules are pulled
 * in as a box rather than run full-bleed. With every other section divided by
 * space, the box is what marks this as the page's centre of gravity.
 *
 * The stack lists live here rather than in the hero: they are evidence for the
 * tier a reader is already considering, not a headline claim.
 */
export default function OfferTiers() {
  return (
    <section className="site-shell px-6 pt-16 md:pt-24">
      <p className="label-mono mb-3">The offer</p>
      <h2 className="heading-section">What you can hire me for</h2>

      <div className="mt-10 md:mt-14 border-2 border-[#0a0a0a] flex flex-col md:flex-row">
        {TIERS.map((tier, i) => (
          <div
            key={tier.name}
            className={`flex-1 px-6 py-10 md:px-8 border-[#0a0a0a] ${i === 0 ? 'border-b-2 md:border-b-0 md:border-r-2' : ''}`}
          >
            <p className="label-mono mb-3">Tier {String(i + 1).padStart(2, '0')}</p>
            <h3 className="text-2xl lg:text-3xl font-bold uppercase leading-none tracking-tight">
              {tier.name}
            </h3>
            <p className="text-base text-[#444] leading-relaxed font-light mt-4 max-w-md">
              {tier.pitch}
            </p>
            <ul className="mt-6 space-y-2">
              {tier.includes.map((item) => (
                <li key={item} className="font-mono text-sm flex gap-3">
                  <span aria-hidden className="text-[#999]">→</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="label-mono mt-8">{tier.stack.label}</p>
            <p className="font-mono text-sm text-[#444] mt-1 leading-relaxed">
              {tier.stack.value}
            </p>
            <p className="label-mono mt-6">{tier.who}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
