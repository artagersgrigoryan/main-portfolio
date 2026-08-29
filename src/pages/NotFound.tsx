import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';
import { useNoIndex } from '../hooks/useNoIndex';

/**
 * 404. The Vercel rewrite sends every path to index.html, so a wrong URL used
 * to return a full 200 page carrying the homepage's title and canonical —
 * which reads to a crawler as a duplicate homepage rather than a dead end.
 *
 * The status code is still 200 (a static SPA cannot set it), so `noindex` is
 * what actually keeps these out of the index.
 */
export default function NotFound() {
  usePageMeta({
    title: 'Page not found — Artagers Grigoryan',
    description: 'That page does not exist.',
    path: '/404',
  });
  useNoIndex();

  return (
    <section className="section-quiet">
      <div className="site-shell px-6">
        <p className="label-mono mb-3">Error 404</p>
        <h1 className="text-5xl md:text-7xl font-bold uppercase leading-none tracking-tight">
          This page
          <br />
          does not exist
        </h1>
        <p className="text-base lg:text-lg text-[#444] leading-relaxed font-light mt-8 max-w-xl">
          The link is wrong, or the page has moved. The work, the offer and the
          contact form are all still where you would expect them.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mt-10 sm:items-start">
          <Link to="/" className="btn-brutal-primary text-center">
            Back to the homepage
          </Link>
          <Link to="/contact" className="btn-brutal font-mono text-sm text-center">
            Start a project
          </Link>
        </div>
      </div>
    </section>
  );
}
