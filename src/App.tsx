import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import SmoothScroll, { useLenis } from './components/SmoothScroll';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Admin from './pages/Admin';

// Scroll to top on route change
function ScrollReset() {
  const location = useLocation();
  const lenis = useLenis();
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
  const location = useLocation();
  const isAdmin = location.pathname === '/admin';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
      {!isAdmin && <Footer />}
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
      <Analytics />
      <SpeedInsights />
    </BrowserRouter>
  );
}
