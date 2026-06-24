import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if the user has already consented
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.banner}>
        <div style={styles.content}>
          <h3 style={styles.title}>We use cookies 🍪</h3>
          <p style={styles.text}>
            We use cookies to personalize content, show ads, provide social media features, and analyze traffic. By clicking &quot;Accept&quot;, you consent to our use of cookies as described in our <Link to="/privacy" style={styles.link}>Privacy Policy</Link>.
          </p>
        </div>
        <button onClick={handleAccept} className="interactive-btn" style={styles.button}>
          Accept All
        </button>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    bottom: '20px',
    left: '20px',
    right: '20px',
    zIndex: 9999,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  banner: {
    pointerEvents: 'auto',
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    borderRadius: '16px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    maxWidth: '500px',
    width: '100%',
    fontFamily: "'DM Sans', sans-serif",
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  title: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '700',
    color: '#0d0d0d',
    fontFamily: "'Syne', sans-serif",
  },
  text: {
    margin: 0,
    fontSize: '13px',
    color: '#4b5563',
    lineHeight: '1.5',
  },
  link: {
    color: '#0a6b5e',
    fontWeight: '600',
    textDecoration: 'underline',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#0a6b5e',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    width: '100%',
    transition: 'background-color 0.2s',
  },
};

export default CookieConsent;
