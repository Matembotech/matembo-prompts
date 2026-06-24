import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const navLinks = [];

const tags = [
  'Image Prompts',
  'Video Prompts',
  'Cinematic',
  'Portrait',
  'Action',
];

function HeroSection() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* ─── NAVIGATION BAR ─── */}
      <nav
        id="main-nav"
        className={`
          fixed top-0 left-0 right-0 z-50 h-16
          bg-white/95 backdrop-blur-sm p-3
          transition-shadow duration-300
          ${scrolled ? 'shadow-md' : 'border-b border-gray-100'}
        `}
      >
        <div className="max-w-[1340px] mx-auto h-full md:px-10 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" id="nav-logo" className="flex items-center gap-3 no-underline group">
            {/* Logo mark icon */}
            <img
              src="/logo.webp"
              alt="Matembo Prompts Logo"
              fetchpriority="high"
              loading="eager"
              className="w-9 h-9 rounded-lg object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="text-[10px] font-medium tracking-[0.18em] uppercase text-text-muted leading-none mb-0.5 font-[var(--font-body)]">
                Matembo Prompts
              </span>
              <span className="text-[17px] font-extrabold text-text-primary leading-tight tracking-tight font-[var(--font-heading)]">
                AI Prompts
              </span>
            </div>
          </Link>

          {/* Center nav links — desktop */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                id={`nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                className="
                  relative px-2 py-2 text-[15px] font-medium text-text-muted
                  font-[var(--font-body)] rounded-full
                  transition-all duration-300
                  hover:text-primary hover:bg-primary/5
                  after:absolute after:bottom-0.5 after:left-1/2 after:-translate-x-1/2
                  after:w-0 after:h-[2px] after:bg-primary after:rounded-full
                  after:transition-all after:duration-300
                  hover:after:w-5
                "
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right CTA + Mobile toggle */}
          <div className="flex items-center gap-6">
            <Link 
              to="/about"
              className="hidden md:flex items-center gap-1 group text-[15px] font-[600] text-[#0a6b5e] border-b-2 border-[#0a6b5e] pb-[2px] transition-colors duration-200 hover:text-[#085048] hover:border-[#085048] font-[var(--font-body)]"
            >
              See The Story Behind
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </Link>

            <a
              href="#prompts-grid-section"
              id="nav-add-prompt"
              className="
                hidden sm:inline-flex items-center gap-2
                px-5 py-2.5 rounded-full
                bg-text-primary text-white
                text-[14px] font-bold font-[var(--font-body)]
                transition-all duration-300
                hover:bg-gray-800 hover:shadow-lg hover:-translate-y-[1px]
                active:translate-y-0
              "
            >
              Prompts
            </a>

            {/* Mobile menu button */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-gray-100 transition-colors"
              aria-label="Toggle mobile menu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {mobileMenuOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        <div
          className={`
            md:hidden overflow-hidden transition-all duration-300 bg-white border-b border-gray-100
            ${mobileMenuOpen ? 'max-h-72 opacity-100' : 'max-h-0 opacity-0'}
          `}
        >
          <div className="px-6 py-4 flex flex-col gap-1">
            <Link
              to="/about"
              className="group flex items-center justify-between px-4 py-3 text-[15px] font-[600] text-[#0a6b5e] bg-[#0a6b5e]/5 hover:bg-[#0a6b5e]/10 rounded-xl transition-colors font-[var(--font-body)]"
              onClick={() => setMobileMenuOpen(false)}
            >
              See The Story Behind
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </Link>
            <a
              href="#prompts-grid-section"
              className="
                mt-2 flex items-center justify-center gap-2
                px-5 py-3 rounded-full
                bg-text-primary text-white
                text-[14px] font-bold font-[var(--font-body)]
                sm:hidden
              "
              onClick={() => setMobileMenuOpen(false)}
            >
              Prompts
            </a>
          </div>
        </div>
      </nav>

      {/* ─── HERO SECTION ─── */}
      <section
        id="hero-section"
        className="
          pt-24 md:pt-16 min-h-screen bg-white
          flex items-start md:items-center
        "
      >
        <div className="max-w-[1340px] mx-auto w-full px-5 sm:px-6 md:px-10 py-8 md:py-0">
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-12">
            {/* ─── LEFT: Text Content ─── */}
            <div className="w-full md:w-1/2 flex flex-col items-start text-left order-1">
              {/* Uppercase label */}
              <span
                id="hero-label"
                className="
                  inline-flex items-center gap-2
                  text-[11px] font-semibold tracking-[0.2em] uppercase
                  text-text-muted font-[var(--font-body)]
                  mb-6 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100
                "
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                AI Design Prompts
              </span>

              {/* Headline */}
              <h1
                id="hero-headline"
                style={{ fontFamily: "'Syne', sans-serif" }}
                className="
                  font-[800]
                  text-[38px] sm:text-[50px] md:text-[60px] lg:text-[70px]
                  leading-[1.05] tracking-tight
                  text-text-primary
                  mb-[30px]
                "
              >
                Craft Stunning
                <br />
                <span className="text-primary">AI Visuals</span>
                <br />
                With One Prompt
              </h1>

              {/* Subtitle */}
              <p
                id="hero-subtitle"
                className="
                  text-[16px] sm:text-[17px] leading-relaxed
                  text-text-muted font-[var(--font-body)]
                  max-w-[420px] mb-8
                "
              >
                Matembo Prompts — where AI creators come to steal prompts.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
                <a
                  href="#prompts-grid-section"
                  id="hero-cta"
                  className="
                    inline-flex items-center gap-2.5
                    px-7 py-3.5 rounded-full
                    bg-primary text-white
                    text-[16px] font-bold font-[var(--font-body)]
                    transition-all duration-300
                    hover:bg-primary-dark hover:shadow-xl hover:shadow-primary/20
                    hover:-translate-y-[2px]
                    active:translate-y-0 active:shadow-lg
                  "
                >
                  Explore Prompts
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </a>
                
                <Link
                  to="/about"
                  className="
                    inline-flex items-center gap-2.5
                    px-7 py-3.5 rounded-full
                    bg-white text-primary border-2 border-primary/20
                    text-[16px] font-bold font-[var(--font-body)]
                    transition-all duration-300
                    hover:border-primary hover:bg-primary/5
                    hover:-translate-y-[2px]
                    active:translate-y-0
                  "
                >
                  Read The Story
                </Link>
              </div>

              {/* Tags */}
              <div id="hero-tags" className="flex flex-wrap gap-2.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="
                      px-4 py-1.5 rounded-full
                      text-[13px] font-medium font-[var(--font-body)]
                      text-text-muted border border-tag-border
                      transition-all duration-300 cursor-pointer
                      hover:border-primary hover:text-primary hover:bg-primary/5
                    "
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* ─── RIGHT: Hero Visual ─── */}
            <div className="w-full md:w-1/2 flex justify-center md:justify-end order-2">
              <div
                id="hero-visual"
                className="
                  relative w-full max-w-[480px] md:max-w-none
                  aspect-[4/5] md:aspect-auto md:h-[min(560px,72vh)]
                "
              >
                {/* Ambient glow behind the card */}
                <div className="absolute -inset-6 bg-primary/10 rounded-[40px] blur-3xl opacity-60" />

                {/* Main card */}
                <div
                  className="
                    relative w-full h-full
                    rounded-3xl overflow-hidden
                    bg-primary
                    shadow-2xl shadow-primary/25
                  "
                >
                  <img
                    src="/hero/hero-main.png"
                    alt="AI-generated cinematic visual — futuristic portrait with teal accents"
                    fetchpriority="high"
                    loading="eager"
                    className="
                      w-full h-full object-cover
                      scale-110 -translate-x-2 translate-y-3
                      transition-transform duration-700 ease-out
                      hover:scale-115 hover:-translate-x-1 hover:translate-y-1
                    "
                  />

                  {/* Gradient overlays for depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/20 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default HeroSection;
