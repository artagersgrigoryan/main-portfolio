import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useRef, lazy, Suspense } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import SmoothScroll, { useLenis } from './components/SmoothScroll';
import { releaseEntranceGuard } from './lib/entrance';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Hire from './pages/Hire';
import NotFound from './pages/NotFound';

// Split out of the main bundle: the case study is a long asset-heavy page most
// visitors never open, and every mobile visitor would otherwise download and
// parse it before the homepage could paint.
const CaseStudyFury = lazy(() => import('./pages/CaseStudyFury'));

// Scroll to top on route change
function ScrollReset() {
  const location = useLocation();
  const lenis = useLenis();
  const first = useRef(true);

  // The prerendered body only exists for the URL that was requested. Once the
  // router moves, React owns the DOM and entrance animations resume normally.
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    releaseEntranceGuard();
  }, [location.pathname]);

  useEffect(() => {
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [location.pathname, lenis]);
  return null;
}

function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1">
        {/* Only the two lazy routes can suspend; everything else is in the
            main bundle and renders synchronously, so this never flashes. */}
        <Suspense fallback={<div className="min-h-screen" />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/hire" element={<Hire />} />
          <Route path="/work/telegram-mini-app-games" element={<CaseStudyFury />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </div>
      <Footer />
      <ScrollReset />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <SmoothScroll>
        <Layout />
      </SmoothScroll>
      <SpeedInsights />
      <Analytics />
    </BrowserRouter>
  );
}
