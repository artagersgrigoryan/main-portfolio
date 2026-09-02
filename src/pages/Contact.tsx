import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useContactLinks } from '../hooks/useSupabaseData';
import {
  PROJECT_TYPES, NEEDS, TIMELINES, BUDGETS,
  briefFieldIssues, toBrief, type Brief, type FieldIssues,
} from '../../api/_brief';
import { trackEvent } from '../lib/analytics';
import { usePageMeta } from '../hooks/usePageMeta';
import { useLenis } from '../components/SmoothScroll';

const EMPTY_BRIEF: Brief = {
  name: '', email: '', projectType: '', need: '',
  timeline: '', budget: '', links: '', message: '',
};

/* Top to bottom, so a failed submit sends the visitor to the first thing they
   need to fix rather than an arbitrary one. */
const FIELD_IDS: Record<keyof Brief, string> = {
  name: 'brief-name',
  email: 'brief-email',
  projectType: 'brief-project-type',
  need: 'brief-need',
  timeline: 'brief-timeline',
  budget: 'brief-budget',
  links: 'brief-links',
  message: 'brief-message',
};

export default function Contact() {
  const { data: links } = useContactLinks();

  usePageMeta('/contact');
  const headerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  const [formData, setFormData] = useState<Brief>(EMPTY_BRIEF);
  const [errors, setErrors] = useState<FieldIssues>({});
  const [started, setStarted] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const markStarted = () => {
    if (started) return;
    setStarted(true);
    trackEvent('brief_started');
  };

  /* Editing a field clears its error. An error that survives the fix reads as
     the form arguing with you. */
  const setField = (field: keyof Brief) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  /** Focus the first field with a problem and bring it under the fixed navbar. */
  const revealFirstIssue = (issues: FieldIssues) => {
    const field = (Object.keys(FIELD_IDS) as (keyof Brief)[]).find(f => issues[f]);
    if (!field) return;
    const el = formRef.current?.querySelector<HTMLElement>(`#${FIELD_IDS[field]}`);
    if (!el) return;
    // preventScroll, then hand the scroll to Lenis — a native scroll here
    // fights the smooth-scroll loop and lands in the wrong place.
    el.focus({ preventScroll: true });
    if (lenis) lenis.scrollTo(el, { offset: -100 });
    else el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  };

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo(headerRef.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 })
      .fromTo(linksRef.current, { x: -40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7 }, '-=0.4')
      .fromTo(formRef.current, { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7 }, '-=0.5');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // The same rules the serverless function runs, so the form can never
    // disagree with the API about what a valid brief is.
    const issues = briefFieldIssues(toBrief(formData));
    if (Object.keys(issues).length > 0) {
      setErrors(issues);
      setStatus('idle');
      revealFirstIssue(issues);
      return;
    }

    setErrors({});
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
      setFormData(EMPTY_BRIEF);
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

          {/* noValidate: the inline errors below replace the browser's own
              bubbles, which point at one field at a time and vanish on click. */}
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            noValidate
            className="p-6 md:p-10 field-stack"
          >
            <BriefField id={FIELD_IDS.name} label="Your Name" required autoComplete="name"
              value={formData.name} onChange={setField('name')} onFocus={markStarted}
              placeholder="John Doe" error={errors.name?.message} />

            <BriefField id={FIELD_IDS.email} label="Email Address" required type="email" autoComplete="email"
              value={formData.email} onChange={setField('email')} onFocus={markStarted}
              placeholder="john@company.com" error={errors.email?.message} />

            <BriefSelect id={FIELD_IDS.projectType} label="Project type" value={formData.projectType} options={PROJECT_TYPES} required
              onChange={setField('projectType')} onFocus={markStarted} error={errors.projectType?.message} />
            <BriefSelect id={FIELD_IDS.need} label="What you need" value={formData.need} options={NEEDS} required
              onChange={setField('need')} onFocus={markStarted} error={errors.need?.message} />
            <BriefSelect id={FIELD_IDS.timeline} label="Timeline" value={formData.timeline} options={TIMELINES}
              onChange={setField('timeline')} onFocus={markStarted} error={errors.timeline?.message} />
            <BriefSelect id={FIELD_IDS.budget} label="Budget range" value={formData.budget} options={BUDGETS}
              onChange={setField('budget')} onFocus={markStarted} error={errors.budget?.message} />

            <BriefField id={FIELD_IDS.links} label="Links"
              value={formData.links} onChange={setField('links')} onFocus={markStarted}
              placeholder="Your site, deck, or Figma" error={errors.links?.message} />

            <BriefField id={FIELD_IDS.message} label="Message" required multiline rows={8}
              value={formData.message} onChange={setField('message')} onFocus={markStarted}
              placeholder="Tell me about your project, timeline, and goals..."
              error={errors.message?.message} />

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

/* `required` stays on the controls for assistive tech even though noValidate
   stops the browser acting on it — it is what announces the field as required. */

function BriefField({
  id, label, value, onChange, onFocus, error, required, type = 'text',
  placeholder, autoComplete, multiline, rows,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onFocus: () => void;
  error?: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  multiline?: boolean;
  rows?: number;
}) {
  const errorId = `${id}-error`;
  const shared = {
    id,
    value,
    required,
    placeholder,
    autoComplete,
    onFocus,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? errorId : undefined,
  };

  return (
    <div className={`field${error ? ' field-invalid' : ''}`}>
      <label htmlFor={id} className="field-label">
        {label}{required ? ' *' : ''}
      </label>
      {multiline ? (
        <textarea
          {...shared}
          rows={rows}
          onChange={(e) => onChange(e.target.value)}
          className="field-input resize-y"
        />
      ) : (
        <input
          {...shared}
          type={type}
          onChange={(e) => onChange(e.target.value)}
          className="field-input"
        />
      )}
      {error && <p id={errorId} className="field-error">{error}</p>}
    </div>
  );
}

function BriefSelect({
  id, label, value, options, required, onChange, onFocus, error,
}: {
  id: string;
  label: string;
  value: string;
  options: readonly string[];
  required?: boolean;
  onChange: (v: string) => void;
  onFocus: () => void;
  error?: string;
}) {
  const errorId = `${id}-error`;

  return (
    <div className={`field${error ? ' field-invalid' : ''}`}>
      <label htmlFor={id} className="field-label">
        {label}{required ? ' *' : ''}
      </label>
      <select
        id={id}
        required={required}
        value={value}
        // Drives the gray "Select…" state in CSS; :invalid would only cover
        // the required ones, leaving timeline and budget looking answered.
        data-empty={value === '' ? 'true' : undefined}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className="field-input field-select"
      >
        <option value="">Select…</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      {error && <p id={errorId} className="field-error">{error}</p>}
    </div>
  );
}
