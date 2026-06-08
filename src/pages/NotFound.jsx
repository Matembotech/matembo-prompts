import { Link } from 'react-router-dom'
import SEO from '../components/SEO'

function NotFound() {
  return (
    <div style={styles.container}>
      <style>{componentCSS}</style>

      <SEO
        title="Page Not Found"
        description="The page you're looking for doesn't exist. Browse our library of professionally crafted AI prompts instead."
      />

      <div style={styles.heroSection}>
        <div style={styles.heroNav}>
          <Link to="/" style={styles.heroLogo}>
            <img src="/logo.webp" alt="Matembo Prompts Logo" style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }} />
            <span style={{ color: '#0d0d0d' }}>Matembo Prompts</span>
          </Link>
        </div>

        <div style={styles.center}>
          <h1 style={styles.code}>404</h1>
          <h2 style={styles.heading}>Page Not Found</h2>
          <p style={styles.text}>
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link to="/" className="interactive-btn" style={styles.btn}>
            Back to Prompts
          </Link>
        </div>
      </div>
    </div>
  )
}

const componentCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&display=swap');
`;

const styles = {
  container: {
    fontFamily: "'DM Sans', sans-serif",
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#ffffff',
    color: '#0d0d0d',
  },
  heroSection: {
    padding: '40px 8% 100px',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  heroNav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    maxWidth: '1400px',
    margin: '0 auto 0',
  },
  heroLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textDecoration: 'none',
    fontWeight: '800',
    fontSize: '18px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
  center: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    gap: '16px',
  },
  code: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '120px',
    fontWeight: '800',
    color: '#0a6b5e',
    lineHeight: '1',
    margin: '0 0 8px 0',
  },
  heading: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '36px',
    fontWeight: '800',
    color: '#0d0d0d',
    margin: '0',
  },
  text: {
    fontSize: '16px',
    color: '#6b7280',
    margin: '0 0 24px 0',
    maxWidth: '400px',
  },
  btn: {
    display: 'inline-flex',
    alignItems: 'center',
    background: '#0a6b5e',
    color: '#ffffff',
    padding: '14px 32px',
    borderRadius: '999px',
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: '15px',
    transition: 'all 0.3s',
    fontFamily: "'DM Sans', sans-serif",
    border: 'none',
    cursor: 'pointer',
  },
};

export default NotFound
