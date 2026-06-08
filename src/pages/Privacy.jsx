import { Link } from 'react-router-dom'
import SEO from '../components/SEO'

function Privacy() {
  return (
    <div style={styles.container}>
      <style>{componentCSS}</style>

      <SEO
        title="Privacy Policy"
        description="Privacy Policy for Matembo Prompts — learn how we handle your data, cookies, and third-party services."
        url="https://matembo-prompts.netlify.app/privacy"
      />

      <section style={styles.heroSection}>
        <div style={styles.heroNav}>
          <Link to="/" style={styles.heroLogo}>
            <img src="/logo.webp" alt="Matembo Prompts Logo" style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }} />
            <span style={{ color: '#0d0d0d' }}>Matembo Prompts</span>
          </Link>
          <Link to="/" style={styles.backLink}>Back to Prompts</Link>
        </div>

        <div style={styles.content}>
          <span style={styles.label}>LEGAL</span>
          <h1 style={styles.heading}>Privacy Policy</h1>
          <p style={styles.date}>Last updated: June 2026</p>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>1. Information We Collect</h2>
            <p style={styles.text}>
              Matembo Prompts does not require user accounts, logins, or personal information. We do not collect names, email addresses, or any personally identifiable information directly.
            </p>
            <p style={styles.text}>
              We use <strong>Google Analytics 4 (GA4)</strong> to understand how visitors interact with our site. Google Analytics collects anonymized data including pages visited, time spent on site, browser type, device type, and approximate geographic location. This data is aggregated and cannot be used to identify individual users.
            </p>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>2. Cookies</h2>
            <p style={styles.text}>
              Google Analytics uses first-party cookies to track visitor interactions. These cookies store anonymized identifiers and session data. You can disable cookies in your browser settings or use browser extensions to block Google Analytics tracking.
            </p>
            <p style={styles.text}>
              We do not use any other cookies or tracking technologies beyond Google Analytics.
            </p>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>3. Third-Party Services</h2>
            <p style={styles.text}>
              <strong>Google Analytics</strong> — processes anonymized traffic data. Google's privacy policy applies to the data they collect. Learn more at{' '}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={styles.link}>Google's Privacy Policy</a>.
            </p>
            <p style={styles.text}>
              <strong>Cloudinary</strong> — hosts and delivers the images displayed on this site. Cloudinary may log standard server request data (IP address, user agent) for security and performance purposes.{' '}
              <a href="https://cloudinary.com/privacy" target="_blank" rel="noopener noreferrer" style={styles.link}>Cloudinary Privacy Policy</a>.
            </p>
            <p style={styles.text}>
              <strong>Supabase</strong> — provides the database backend for storing and serving prompts. Supabase may log standard server request data.{' '}
              <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" style={styles.link}>Supabase Privacy Policy</a>.
            </p>
            <p style={styles.text}>
              <strong>Netlify</strong> — hosts and serves this website. Netlify may collect standard server logs.{' '}
              <a href="https://www.netlify.com/privacy/" target="_blank" rel="noopener noreferrer" style={styles.link}>Netlify Privacy Policy</a>.
            </p>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>4. How We Use Information</h2>
            <p style={styles.text}>
              The anonymized analytics data helps us understand which prompts are most popular, how users navigate the site, and how to improve the browsing experience. We do not sell, rent, or share any data with third parties beyond the services listed above.
            </p>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>5. Data Retention</h2>
            <p style={styles.text}>
              Google Analytics data is retained according to Google's default retention period (26 months for user-level data). We do not maintain separate copies of analytics data.
            </p>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>6. Your Rights</h2>
            <p style={styles.text}>
              Since we do not collect personal data directly, there is no personal data to access, correct, or delete. You can block Google Analytics tracking by using browser extensions, disabling cookies, or enabling your browser's &quot;Do Not Track&quot; setting.
            </p>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>7. Children's Privacy</h2>
            <p style={styles.text}>
              Matembo Prompts is not directed at children under 13. We do not knowingly collect data from children.
            </p>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>8. Changes to This Policy</h2>
            <p style={styles.text}>
              We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated date.
            </p>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>9. Contact</h2>
            <p style={styles.text}>
              For questions about this Privacy Policy, contact us at{' '}
              <a href="mailto:ibrahimmaulid551@gmail.com" style={styles.link}>ibrahimmaulid551@gmail.com</a>.
            </p>
          </div>
        </div>
      </section>
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
    padding: '40px 8% 120px',
  },
  heroNav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '60px',
    maxWidth: '1200px',
    margin: '0 auto 60px',
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
  backLink: {
    color: '#0a6b5e',
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: '15px',
    transition: 'opacity 0.2s',
  },
  content: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  label: {
    display: 'block',
    color: '#0a6b5e',
    fontSize: '13px',
    fontWeight: '700',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    marginBottom: '16px',
  },
  heading: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '48px',
    fontWeight: '800',
    color: '#0d0d0d',
    margin: '0 0 8px 0',
    lineHeight: '1.15',
  },
  date: {
    fontSize: '14px',
    color: '#9ca3af',
    margin: '0 0 50px 0',
  },
  section: {
    marginBottom: '40px',
  },
  sectionTitle: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '22px',
    fontWeight: '700',
    color: '#0d0d0d',
    margin: '0 0 16px 0',
  },
  text: {
    fontSize: '16px',
    color: '#4b5563',
    lineHeight: '1.8',
    margin: '0 0 12px 0',
  },
  link: {
    color: '#0a6b5e',
    textDecoration: 'underline',
    fontWeight: '600',
  },
};

export default Privacy
