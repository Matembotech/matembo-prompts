import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import './App.css'
import HeroSection from './components/HeroSection'
import PromptsGrid from './components/PromptsGrid'
import AdminPanel from './components/AdminPanel'
import About from './pages/About'
import Footer from './components/Footer'

function HomePage() {
  return (
    <>
      <HeroSection />
      <PromptsGrid />
    </>
  )
}

function AppContent() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/about" element={<About />} />
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

