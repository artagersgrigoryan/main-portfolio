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

/** How working together actually goes. Predictability substitutes for testimonials. */
export default function ProcessSteps() {
  return (
    <section className="border-t-2 border-[#0a0a0a]">
      <div className="site-shell">
        <div className="px-6 py-6 border-b-2 border-[#0a0a0a]">
          <h2 className="heading-section">How I work</h2>
        </div>
        <div className="flex flex-col md:flex-row">
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className={`flex-1 px-6 py-8 border-[#0a0a0a] ${i < STEPS.length - 1 ? 'border-b-2 md:border-b-0 md:border-r-2' : ''}`}
            >
              <p className="font-mono text-xs tracking-widest text-[#999]">
                {String(i + 1).padStart(2, '0')}
              </p>
              <h3 className="text-lg font-bold uppercase tracking-tight mt-3 leading-tight">
                {step.title}
              </h3>
              <p className="text-sm text-[#444] leading-relaxed font-light mt-2">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
