const STEPS = [
  {
    title: 'Brief and context',
    body: 'I read your product, your competitors, and what you have already tried.',
  },
  {
    title: 'Flows before pixels',
    body: 'Structure first. UI decisions get cheap once the flow is right.',
  },
  {
    title: 'Design in the open',
    body: 'You see work in progress, not a reveal at the end.',
  },
  {
    title: 'Ship and support',
    body: 'Handoff that survives implementation — or I build it myself.',
  },
];

/**
 * How working together actually goes. Predictability substitutes for testimonials.
 *
 * Quiet section: no cells, no rules. The steps are a real sequence, so they run
 * vertically with hanging numbers — four equal boxes side by side said nothing
 * about order. The narrow measure against a full-bleed page is itself a weight
 * signal: this section is meant to be read, not scanned.
 */
export default function ProcessSteps() {
  return (
    <section className="section-quiet">
      <div className="site-shell px-6">
        <p className="label-mono mb-3">Process</p>
        <h2 className="heading-section">How I work</h2>

        <ol className="mt-12 md:mt-16 max-w-3xl">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-6 md:gap-10 py-6 md:py-8">
              <span
                aria-hidden
                className="font-mono text-sm text-[#bbb] shrink-0 w-8 pt-1.5"
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="text-xl md:text-2xl font-bold uppercase tracking-tight leading-tight">
                  {step.title}
                </h3>
                <p className="text-base text-[#444] leading-relaxed font-light mt-2 max-w-xl">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
