import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import gsap from 'gsap';

const NAV_LINKS = [
  { label: 'Work', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const location = useLocation();
  const navRef = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    gsap.fromTo(
      navRef.current,
      { y: -60, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }
    );
  }, []);

  // ─── Menu Animation Logic ─────────────────────────────────────────────
  useEffect(() => {
    if (menuOpen) {
      // Body lock
      document.body.style.overflow = 'hidden';

      const tl = gsap.timeline();
      tl.fromTo(
        menuRef.current,
        { x: '100%' },
        { x: '0%', duration: 0.6, ease: 'expo.out' }
      );
      tl.fromTo(
        linksRef.current.filter(Boolean),
        { x: 50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: 'power2.out' },
        '-=0.3'
      );
    } else {
      document.body.style.overflow = '';
    }
  }, [menuOpen]);

  const handleClose = () => {
    gsap.to(menuRef.current, {
      x: '100%',
      duration: 0.5,
      ease: 'expo.in',
      onComplete: () => setMenuOpen(false)
    });
  };

  return (
    <header ref={navRef} className="fixed top-0 left-0 right-0 z-50 bg-white border-b-2 border-[#0a0a0a]">
      <div className="max-w-[1400px] mx-auto flex items-stretch h-14 relative z-[100] bg-white">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center px-6 border-r-2 border-[#0a0a0a] font-mono font-bold text-sm tracking-widest uppercase hover:bg-[#0a0a0a] hover:text-white transition-colors"
          onClick={() => setMenuOpen(false)}
        >
          AG
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-stretch ml-auto">
          {NAV_LINKS.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`flex items-center px-8 border-l-2 border-[#0a0a0a] font-mono text-xs font-bold uppercase tracking-widest transition-colors ${isActive
                    ? 'bg-[#0a0a0a] text-white'
                    : 'hover:bg-[#0a0a0a] hover:text-white'
                  }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            to="/contact"
            className="flex items-center px-6 border-l-2 border-[#0a0a0a] bg-[#0a0a0a] text-white font-mono text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-[#0a0a0a] transition-colors"
          >
            Hire Me →
          </Link>
        </nav>

        <button
          className="md:hidden ml-auto w-[100px] flex items-center justify-center border-l-2 border-[#0a0a0a] font-mono text-sm uppercase tracking-widest hover:bg-[#0a0a0a] hover:text-white transition-colors relative z-[100] bg-white h-full"
          onClick={() => {
            if (menuOpen) {
              handleClose();
            } else {
              setMenuOpen(true);
            }
          }}
          aria-label="Toggle menu"
        >
          {menuOpen ? "CLOSE" : "MENU"}
        </button>
      </div>

      {/* Mobile menu - Full Screen, Right to Left */}
      {menuOpen && (
        <div
          ref={menuRef}
          className="md:hidden fixed top-14 left-0 w-full h-[calc(100vh-3.5rem)] z-[90] bg-white flex flex-col justify-center items-center overflow-hidden"
          style={{ boxShadow: 'inset 0 2px 0 0 #0a0a0a' }}
        >
          <nav className="flex flex-col items-center w-full px-10 gap-8">
            {NAV_LINKS.map((link, i) => (
              <Link
                key={link.href}
                to={link.href}
                ref={(el) => { linksRef.current[i] = el; }}
                onClick={handleClose}
                className={`text-5xl font-bold uppercase tracking-tighter transition-all hover:tracking-normal ${location.pathname === link.href ? 'text-[#0a0a0a] underline decoration-4 underline-offset-8' : 'text-[#888] hover:text-[#0a0a0a]'
                  }`}
              >
                {link.label}
              </Link>
            ))}

            {/* CTA in menu */}
            <Link
              to="/contact"
              ref={(el) => { linksRef.current[NAV_LINKS.length] = el; }}
              onClick={handleClose}
              className="mt-8 px-10 py-4 border-2 border-[#0a0a0a] font-mono text-sm font-bold uppercase tracking-widest hover:bg-[#0a0a0a] hover:text-white transition-all active:scale-95"
            >
              Get in Touch →
            </Link>
          </nav>

          {/* Subtle Background Text */}
          <div className="absolute bottom-10 left-10 pointer-events-none opacity-10 select-none">
            <span className="font-mono text-8xl font-black uppercase leading-none">
              Navigation
            </span>
          </div>
        </div>
      )}
    </header>
  );
}
