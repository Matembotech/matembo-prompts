import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import './App.css'
import SEO, { SITE_URL } from './components/SEO'
import HeroSection from './components/HeroSection'
import PromptsGrid from './components/PromptsGrid'
import AdminPanel from './components/AdminPanel'
import About from './pages/About'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import PromptDetail from './pages/PromptDetail'
import NotFound from './pages/NotFound'
import Footer from './components/Footer'
import CookieConsent from './components/CookieConsent'

function HomePage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Matembo Prompts',
    url: `${SITE_URL}/`,
    description: 'Browse, copy and use professionally crafted AI prompts for image and video generation.',
  };

  return (
    <>
      <SEO jsonLd={structuredData} />
      <HeroSection />
      <PromptsGrid />
    </>
  )
}

function AppContent() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  useEffect(() => {
    window.gtag?.('config', 'G-F4GQN76CQ2', {
      page_path: location.pathname + location.search,
    });
  }, [location]);

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/prompts/:slug" element={<PromptDetail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isAdmin && <Footer />}
      <CookieConsent />
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
