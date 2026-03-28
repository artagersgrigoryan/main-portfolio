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

  useEffect(() => {
    gsap.fromTo(
      navRef.current,
      { y: -60, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }
    );
  }, []);

  return (
    <header ref={navRef} className="fixed top-0 left-0 right-0 z-50 bg-white border-b-2 border-[#0a0a0a]">
      <div className="max-w-[1400px] mx-auto flex items-stretch h-14">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center px-6 border-r-2 border-[#0a0a0a] font-mono font-bold text-sm tracking-widest uppercase hover:bg-[#0a0a0a] hover:text-white transition-colors"
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
                className={`flex items-center px-8 border-l-2 border-[#0a0a0a] font-mono text-xs font-bold uppercase tracking-widest transition-colors ${
                  isActive
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

        {/* Mobile hamburger */}
        <button
          className="md:hidden ml-auto px-5 border-l-2 border-[#0a0a0a] font-mono text-xs uppercase tracking-widest"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t-2 border-[#0a0a0a] bg-white">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setMenuOpen(false)}
              className={`block px-6 py-4 border-b-2 border-[#0a0a0a] font-mono text-xs font-bold uppercase tracking-widest transition-colors ${
                location.pathname === link.href ? 'bg-[#0a0a0a] text-white' : 'hover:bg-[#0a0a0a] hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
