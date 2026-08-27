import { trackEvent } from '../lib/analytics';

const PROMPTSTATION_URL =
  'https://www.promptstation.online/en?utm_source=artagers_design&utm_medium=portfolio&utm_campaign=tool_promo';

/**
 * Engineering-as-marketing. A free tool aimed at exactly the buyer who needs a
 * designer, and the shortest available proof of the Design → Built tier.
 *
 * Email capture lives inside PromptStation (a separate codebase) — all this
 * section does is send tagged, tracked traffic.
 */
export default function ToolPromo() {
  return (
    <section className="border-t-2 border-[#0a0a0a] bg-[#f8f8f8]">
      <div className="site-shell flex flex-col lg:flex-row items-start lg:items-center gap-8 px-6 py-12">
        <div className="flex-1">
          <p className="label-mono mb-3">Free tool</p>
          <h2 className="heading-section">
            A free tool I built for people
            <br />
            who can't brief a project
          </h2>
          <p className="text-base text-[#444] leading-relaxed font-light mt-4 max-w-xl">
            Answer 13 questions, get a complete website brief you can paste into
            Cursor, v0, Bolt, Lovable or Arena. I founded it, designed it, built
            it and shipped it — which is also the shortest answer to “can you
            actually build things?”
          </p>
        </div>
        <a
          href={PROMPTSTATION_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-brutal-primary whitespace-nowrap shrink-0"
          onClick={() => trackEvent('promptstation_click', { location: 'home_tool_promo' })}
        >
          Try PromptStation free ↗
        </a>
      </div>
    </section>
  );
}
