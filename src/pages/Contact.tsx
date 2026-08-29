import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useContactLinks } from '../hooks/useSupabaseData';
import { PROJECT_TYPES, NEEDS, TIMELINES, BUDGETS } from '../../api/_brief';
import { trackEvent } from '../lib/analytics';
import { usePageMeta } from '../hooks/usePageMeta';

export default function Contact() {
  const { data: links } = useContactLinks();

  usePageMeta('/contact');
  const headerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: '', email: '', projectType: '', need: '',
    timeline: '', budget: '', links: '', message: '',
  });
  const [started, setStarted] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const markStarted = () => {
    if (started) return;
    setStarted(true);
    trackEvent('brief_started');
  };

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo(headerRef.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 })
      .fromTo(linksRef.current, { x: -40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7 }, '-=0.4')
      .fromTo(formRef.current, { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7 }, '-=0.5');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || 'Server error');
      }

      trackEvent('brief_submitted', {
        projectType: formData.projectType,
        need: formData.need,
        budget: formData.budget || 'unspecified',
      });
      setStatus('sent');
      setFormData({
        name: '', email: '', projectType: '', need: '',
        timeline: '', budget: '', links: '', message: '',
      });
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : '');
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'email': return '✉';
      case 'phone': return '✆';
      case 'linkedin': return 'in';
      case 'dribbble': return '⊙';
      default: return '→';
    }
  };

  return (
    <main className="pt-14 min-h-screen flex flex-col">
      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div ref={headerRef} className="border-b-2 border-[#0a0a0a] site-shell w-full">
        <div className="px-6 py-4 border-b-2 border-[#0a0a0a]">
          <span className="label-mono">Contact</span>
        </div>
        <div className="flex flex-col md:flex-row">
          <div className="flex-1 px-6 py-10 border-b-2 md:border-b-0 md:border-r-2 border-[#0a0a0a]">
            <h1 className="text-[clamp(2.5rem,7vw,6rem)] font-bold leading-none tracking-tight uppercase">
              Let's Work
              <br />
              Together.
            </h1>
          </div>
          <div className="flex-1 flex flex-col justify-end px-6 py-10">
            <p className="text-base text-[#444] leading-relaxed font-light max-w-md">
              Tell me what you're building. The more you put in the brief, the
              more useful my first reply is.
            </p>
            <p className="font-mono text-xs text-[#666] uppercase tracking-widest mt-4">
              Response time: within 24 hours
            </p>
          </div>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <div className="flex-1 site-shell w-full flex flex-col lg:flex-row border-b-2 border-[#0a0a0a]">
        {/* Contact Links — Left */}
        <div ref={linksRef} className="lg:w-[380px] xl:w-[420px] border-b-2 lg:border-b-0 lg:border-r-2 border-[#0a0a0a]">
          <div className="px-6 py-5 border-b-2 border-[#0a0a0a]">
            <p className="label-mono">Direct Channels</p>
          </div>

          <a
            href="https://t.me/artagers"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent('telegram_click', { location: 'contact' })}
            className="flex items-center gap-4 px-6 py-6 border-b-2 border-[#0a0a0a] bg-[#0a0a0a] text-white hover:bg-white hover:text-[#0a0a0a] transition-colors group"
          >
            <div className="w-10 h-10 border-2 border-current flex items-center justify-center font-mono text-sm font-bold shrink-0">
              ✈
            </div>
            <div>
              <p className="label-mono text-[#999] group-hover:text-[#666]">Prefer to just talk?</p>
              <p className="font-mono text-sm font-bold mt-0.5">Message me on Telegram</p>
            </div>
            <span className="ml-auto font-mono text-lg">→</span>
          </a>

          {links.map((link, i) => (
            <a
              key={link.id}
              href={link.href}
              target={link.type === 'email' || link.type === 'other' && link.href.startsWith('tel') ? undefined : '_blank'}
              rel="noopener noreferrer"
              className={`flex items-center gap-4 px-6 py-6 border-[#0a0a0a] group transition-colors hover:bg-[#0a0a0a] hover:text-white ${i < links.length - 1 ? 'border-b-2' : ''}`}
            >
              {/* Icon box */}
              <div className="w-10 h-10 border-2 border-current flex items-center justify-center font-mono text-sm font-bold shrink-0 group-hover:bg-white group-hover:text-[#0a0a0a] transition-colors">
                {getIcon(link.type)}
              </div>
              <div>
                <p className="label-mono group-hover:text-[#888]">{link.label}</p>
                <p className="font-mono text-sm font-bold mt-0.5 break-all">{link.value}</p>
              </div>
              <span className="ml-auto font-mono text-lg group-hover:translate-x-1 transition-transform">→</span>
            </a>
          ))}

          {/* Location */}
          <div className="px-6 py-6 border-t-2 border-[#0a0a0a] bg-[#f8f8f8]">
            <p className="label-mono mb-2">Location</p>
            <p className="font-mono text-sm font-bold">Yerevan, Armenia</p>
            <p className="font-mono text-xs text-[#666] mt-1">GMT+4 · Available remotely worldwide</p>
          </div>
        </div>

        {/* Contact Form — Right */}
        <div className="flex-1">
          <div className="px-6 py-5 border-b-2 border-[#0a0a0a]">
            <p className="label-mono">The Brief</p>
          </div>

          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="p-6 md:p-10 space-y-0"
          >
            {/* Name */}
            <div className="border-2 border-[#0a0a0a] mb-[-2px]">
              <label htmlFor="brief-name" className="block px-4 pt-4 label-mono">
                Your Name *
              </label>
              <input
                id="brief-name"
                type="text"
                required
                autoComplete="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                onFocus={markStarted}
                placeholder="John Doe"
                className="w-full px-4 py-3 font-mono text-sm bg-transparent focus:bg-[#f8f8f8] transition-colors placeholder:text-[#bbb]"
              />
            </div>

            {/* Email */}
            <div className="border-2 border-[#0a0a0a] mb-[-2px]">
              <label htmlFor="brief-email" className="block px-4 pt-4 label-mono">
                Email Address *
              </label>
              <input
                id="brief-email"
                type="email"
                required
                autoComplete="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                onFocus={markStarted}
                placeholder="john@company.com"
                className="w-full px-4 py-3 font-mono text-sm bg-transparent focus:bg-[#f8f8f8] transition-colors placeholder:text-[#bbb]"
              />
            </div>

            <BriefSelect id="brief-project-type" label="Project type" value={formData.projectType} options={PROJECT_TYPES} required
              onChange={(v) => setFormData({ ...formData, projectType: v })} onFocus={markStarted} />
            <BriefSelect id="brief-need" label="What you need" value={formData.need} options={NEEDS} required
              onChange={(v) => setFormData({ ...formData, need: v })} onFocus={markStarted} />
            <BriefSelect id="brief-timeline" label="Timeline" value={formData.timeline} options={TIMELINES}
              onChange={(v) => setFormData({ ...formData, timeline: v })} onFocus={markStarted} />
            <BriefSelect id="brief-budget" label="Budget range" value={formData.budget} options={BUDGETS}
              onChange={(v) => setFormData({ ...formData, budget: v })} onFocus={markStarted} />

            <div className="border-2 border-[#0a0a0a] mb-[-2px]">
              <label htmlFor="brief-links" className="block px-4 pt-4 label-mono">Links</label>
              <input
                id="brief-links"
                type="text"
                value={formData.links}
                onChange={(e) => setFormData({ ...formData, links: e.target.value })}
                onFocus={markStarted}
                placeholder="Your site, deck, or Figma"
                className="w-full px-4 py-3 font-mono text-sm bg-transparent focus:bg-[#f8f8f8] transition-colors placeholder:text-[#bbb]"
              />
            </div>

            {/* Message */}
            <div className="border-2 border-[#0a0a0a]">
              <label htmlFor="brief-message" className="block px-4 pt-4 label-mono">
                Message *
              </label>
              <textarea
                id="brief-message"
                required
                rows={8}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                onFocus={markStarted}
                placeholder="Tell me about your project, timeline, and goals..."
                className="w-full px-4 py-3 font-mono text-sm bg-transparent focus:bg-[#f8f8f8] transition-colors placeholder:text-[#bbb] resize-none"
              />
            </div>

            {/* Submit */}
            <div className="pt-6 flex items-center gap-6">
              <button
                type="submit"
                disabled={status === 'sending'}
                className="btn-brutal-primary disabled:opacity-50"
              >
                {status === 'sending' ? 'Sending...' : status === 'sent' ? 'Sent ✓' : 'Send the brief →'}
              </button>

              {status === 'sent' && (
                <p className="font-mono text-xs text-green-700 uppercase tracking-widest max-w-sm leading-relaxed">
                  Brief received. I read every one personally and reply within 24 hours — usually sooner. If it's urgent, message me on Telegram.
                </p>
              )}
              {status === 'error' && (
                <p className="font-mono text-xs text-red-600 uppercase tracking-widest">
                  {errorMessage || 'Something went wrong. Please try again.'}
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

function BriefSelect({
  id, label, value, options, required, onChange, onFocus,
}: {
  id: string;
  label: string;
  value: string;
  options: readonly string[];
  required?: boolean;
  onChange: (v: string) => void;
  onFocus: () => void;
}) {
  return (
    <div className="border-2 border-[#0a0a0a] mb-[-2px]">
      <label htmlFor={id} className="block px-4 pt-4 label-mono">
        {label}{required ? ' *' : ''}
      </label>
      <select
        id={id}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        className="w-full px-4 py-3 font-mono text-sm bg-transparent focus:bg-[#f8f8f8] transition-colors"
      >
        <option value="">Select…</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
