import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t-2 border-[#0a0a0a] bg-white mt-auto">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-stretch">
        {/* Left */}
        <div className="flex-1 px-6 py-6 border-b-2 md:border-b-0 md:border-r-2 border-[#0a0a0a]">
          <p className="font-mono text-xs text-[#666] uppercase tracking-widest">
            © {year} Artagers Grigoryan
          </p>
          <p className="font-mono text-xs text-[#999] mt-1">
            Product Designer · Yerevan, Armenia
          </p>
        </div>

        {/* Center */}
        <div className="flex items-center px-6 py-6 border-b-2 md:border-b-0 md:border-r-2 border-[#0a0a0a]">
          <span className="font-mono text-xs text-[#999] uppercase tracking-widest">
            Built by me → Vibe Coding
          </span>
        </div>

        {/* Right — Admin link (hidden, in footer) */}
        <div className="flex items-center px-6 py-6">
          <Link
            to="/admin"
            className="font-mono text-xs text-[#ccc] hover:text-[#0a0a0a] uppercase tracking-widest transition-colors"
          >
            ⚙ admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
