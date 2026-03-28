import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useContactLinks } from '../hooks/useSupabaseData';

export default function Contact() {
  const { data: links } = useContactLinks();
  const headerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo(headerRef.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 })
      .fromTo(linksRef.current, { x: -40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7 }, '-=0.4')
      .fromTo(formRef.current, { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7 }, '-=0.5');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
    const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;

    if (!botToken || !chatId || botToken.includes('YOUR_')) {
      console.error('Telegram credentials are not configured in .env');
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
      return;
    }

    const text = `📬 *New Contact Form Submission*\n\n*Name:* ${formData.name}\n*Email:* ${formData.email}\n*Message:*\n${formData.message}`;

    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: 'Markdown',
        }),
      });

      if (!response.ok) throw new Error('Telegram API responded with an error');

      setStatus('sent');
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setStatus('idle'), 4000);
    } catch (error) {
      console.error('Error sending message:', error);
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
      <div ref={headerRef} className="border-b-2 border-[#0a0a0a] max-w-[1400px] mx-auto w-full">
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
              Open to new projects, collaborations, and full-time positions.
              Reach out via the form or any of the channels below.
            </p>
            <p className="font-mono text-xs text-[#666] uppercase tracking-widest mt-4">
              Response time: within 24 hours
            </p>
          </div>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <div className="flex-1 max-w-[1400px] mx-auto w-full flex flex-col lg:flex-row border-b-2 border-[#0a0a0a]">
        {/* Contact Links — Left */}
        <div ref={linksRef} className="lg:w-[380px] xl:w-[420px] border-b-2 lg:border-b-0 lg:border-r-2 border-[#0a0a0a]">
          <div className="px-6 py-5 border-b-2 border-[#0a0a0a]">
            <p className="label-mono">Direct Channels</p>
          </div>

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
            <p className="label-mono">Send a Message</p>
          </div>

          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="p-6 md:p-10 space-y-0"
          >
            {/* Name */}
            <div className="border-2 border-[#0a0a0a] mb-[-2px]">
              <label className="block px-4 pt-4 label-mono">
                Your Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                className="w-full px-4 py-3 font-mono text-sm bg-transparent focus:bg-[#f8f8f8] transition-colors placeholder:text-[#bbb]"
              />
            </div>

            {/* Email */}
            <div className="border-2 border-[#0a0a0a] mb-[-2px]">
              <label className="block px-4 pt-4 label-mono">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@company.com"
                className="w-full px-4 py-3 font-mono text-sm bg-transparent focus:bg-[#f8f8f8] transition-colors placeholder:text-[#bbb]"
              />
            </div>

            {/* Message */}
            <div className="border-2 border-[#0a0a0a]">
              <label className="block px-4 pt-4 label-mono">
                Message *
              </label>
              <textarea
                required
                rows={8}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Tell me about your project, timeline, and goals..."
                className="w-full px-4 py-3 font-mono text-sm bg-transparent focus:bg-[#f8f8f8] transition-colors placeholder:text-[#bbb] resize-none"
              />
            </div>

            {/* Submit */}
            <div className="pt-6 flex items-center gap-6">
              <button
                type="submit"
                disabled={status === 'sending'}
                className="btn-brutal-filled py-4 px-10 font-mono text-sm disabled:opacity-50"
              >
                {status === 'sending' ? 'Sending...' : status === 'sent' ? 'Sent ✓' : 'Send Message →'}
              </button>

              {status === 'sent' && (
                <p className="font-mono text-xs text-green-700 uppercase tracking-widest">
                  Message received! I'll get back to you soon.
                </p>
              )}
              {status === 'error' && (
                <p className="font-mono text-xs text-red-600 uppercase tracking-widest">
                  Something went wrong. Please try again.
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
