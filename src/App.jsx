import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import './App.css'
import SEO from './components/SEO'
import HeroSection from './components/HeroSection'
import PromptsGrid from './components/PromptsGrid'
import AdminPanel from './components/AdminPanel'
import About from './pages/About'
import PromptDetail from './pages/PromptDetail'
import NotFound from './pages/NotFound'
import Footer from './components/Footer'

function HomePage() {
  return (
    <>
      <SEO />
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
        <Route path="/prompts/:id" element={<PromptDetail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isAdmin && <Footer />}
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

