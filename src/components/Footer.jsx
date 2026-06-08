import { Link } from 'react-router-dom';

function Footer() {
  const scrollToTop = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToPrompts = (e) => {
    e.preventDefault();
    const el = document.getElementById('prompts-grid-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = '/#prompts-grid-section';
    }
  };

  return (
    <footer style={styles.footer}>
      <style>{`
        @media (max-width: 768px) {
          .footer-row {
            flex-direction: column !important;
            gap: 20px !important;
            text-align: center;
          }
        }
        .footer-link {
          transition: color 0.2s ease;
        }
        .footer-link:hover {
          color: #ffffff !important;
        }
        .footer-icon {
          transition: color 0.2s ease;
        }
        .footer-icon:hover {
          color: #ffffff !important;
        }
      `}</style>

      <div className="footer-row" style={styles.mainRow}>
        {/* Left */}
        <div style={styles.leftSection}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/logo.webp" alt="Logo" style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={styles.brand}>Matembo Prompts</span>
              <span style={styles.copyright}>© 2026 All rights reserved</span>
            </div>
          </div>
        </div>

        {/* Center */}
        <div style={styles.centerSection}>
          <a href="#" onClick={scrollToTop} style={styles.link} className="footer-link">Home</a>
          <a href="#prompts-grid-section" onClick={scrollToPrompts} style={styles.link} className="footer-link">Explore</a>
          <Link to="/about" style={styles.link} className="footer-link">About</Link>
          <Link to="/privacy" style={styles.link} className="footer-link">Privacy</Link>
          <Link to="/terms" style={styles.link} className="footer-link">Terms</Link>
        </div>

        {/* Right */}
        <div style={styles.rightSection}>
          <a href="https://www.instagram.com/matembo_dev/" target="_blank" rel="noreferrer" style={styles.iconLink} className="footer-icon">
            <IconInstagram />
          </a>
          <a href="https://www.linkedin.com/in/ibrahim-abdulrahman-maulid-458211368/" target="_blank" rel="noreferrer" style={styles.iconLink} className="footer-icon">
            <IconLinkedIn />
          </a>
          <a href="https://github.com/Matembotech" target="_blank" rel="noreferrer" style={styles.iconLink} className="footer-icon">
            <IconGitHub />
          </a>
          <a href="https://www.facebook.com/MatemboTech" target="_blank" rel="noreferrer" style={styles.iconLink} className="footer-icon">
            <IconFacebook />
          </a>
        </div>
      </div>

      <div style={styles.bottomRow}>
        <div style={styles.divider} />
        <Link to="/admin" style={styles.adminLink}>·</Link>
      </div>
    </footer>
  );
}

// Icons
const IconInstagram = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>;
const IconLinkedIn = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>;
const IconGitHub = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>;
const IconFacebook = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>;

const styles = {
  footer: {
    width: '100%',
    background: '#0d0d0d',
    padding: '24px 5% 12px 5%',
    fontFamily: "'DM Sans', sans-serif",
    boxSizing: 'border-box',
  },
  mainRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
  },
  leftSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  brand: {
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 500,
  },
  copyright: {
    color: '#6b7280',
    fontSize: '12px',
  },
  centerSection: {
    display: 'flex',
    gap: '24px',
    alignItems: 'center',
  },
  link: {
    color: '#6b7280',
    fontSize: '13px',
    textDecoration: 'none',
  },
  rightSection: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
  },
  iconLink: {
    color: '#6b7280',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomRow: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '24px',
    maxWidth: '1200px',
    margin: '24px auto 0',
  },
  divider: {
    width: '100%',
    height: '1px',
    background: '#1a1a1a',
    marginBottom: '8px',
  },
  adminLink: {
    color: '#1a1a1a',
    fontSize: '11px',
    textDecoration: 'none',
    cursor: 'pointer',
  }
};

export default Footer;
