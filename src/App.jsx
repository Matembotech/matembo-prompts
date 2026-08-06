import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import './App.css'
import SEO, { SITE_URL } from './components/SEO'
import HeroSection from './components/HeroSection'
import PromptsGrid from './components/PromptsGrid'
import BrowseByStyle from './components/BrowseByStyle'
import AdminPanel from './components/AdminPanel'
import About from './pages/About'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import Contact from './pages/Contact'
import PromptDetail from './pages/PromptDetail'
import SignIn from './pages/SignIn'
import CategoryPage from './pages/CategoryPage'
import NotFound from './pages/NotFound'
import Footer from './components/Footer'
import CookieConsent from './components/CookieConsent'

function HomePage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Matembo Prompts',
    url: `${SITE_URL}/`,
    description: "East Africa's #1 AI Image Prompt Library — discover, copy, and create stunning AI images with professionally crafted prompts for AI creators.",
  };

  return (
    <>
      <SEO jsonLd={structuredData} />
      <HeroSection />
      <PromptsGrid />
      <BrowseByStyle />
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
        <Route path="/contact" element={<Contact />} />
        <Route path="/prompts/:slug" element={<PromptDetail />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/signin" element={<SignIn />} />
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
