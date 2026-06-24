import { Link } from 'react-router-dom'
import SEO from '../components/SEO'

function Terms() {
  return (
    <div style={styles.container}>
      <style>{componentCSS}</style>

      <SEO
        title="Terms of Service"
        description="Terms of Service for Matembo Prompts — conditions governing the use of our AI prompt library and website."
        url="https://matembo-prompts.netlify.app/terms"
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
          <h1 style={styles.heading}>Terms of Service</h1>
          <p style={styles.date}>Last updated: June 2026</p>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>1. Acceptance of Terms</h2>
            <p style={styles.text}>
              By accessing or using Matembo Prompts, you agree to be bound by these Terms of Service. If you do not agree, please do not use the website.
            </p>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>2. Description of Service</h2>
            <p style={styles.text}>
              Matembo Prompts is a free online library of AI image and video generation prompts. Users can browse, copy, and use prompts for their own creative projects. The service is provided &quot;as is&quot; without warranties of any kind.
            </p>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>3. Use of Prompts</h2>
            <p style={styles.text}>
              All prompts published on Matembo Prompts are free to use for personal and commercial projects. You may copy, modify, and use the prompts in any AI image or video generation tool including Midjourney, DALL-E, Stable Diffusion, Kling, Sora, Seedance, and similar platforms.
            </p>
            <p style={styles.text}>
              You may not republish, redistribute, or resell the prompts as a standalone collection without explicit written permission from Matembo Prompts. Attribution is appreciated but not required.
            </p>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>4. Intellectual Property</h2>
            <p style={styles.text}>
              The prompt text, website design, logo, and branding are the intellectual property of Matembo Prompts and Matembo Tech Software Company. All rights reserved. Images displayed on the site are AI-generated for illustrative purposes.
            </p>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>5. User Conduct</h2>
            <p style={styles.text}>
              You agree not to use the website in any way that is unlawful, harmful, or interferes with the operation of the service. Automated scraping, excessive API calls, and denial-of-service attacks are prohibited.
            </p>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>6. Third-Party Links</h2>
            <p style={styles.text}>
              Our website may contain links to third-party websites and services including social media platforms, Matembo Tech, and other external resources. We are not responsible for the content or practices of these third parties.
            </p>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>7. Limitation of Liability</h2>
            <p style={styles.text}>
              Matembo Prompts and Matembo Tech Software Company shall not be liable for any direct, indirect, incidental, or consequential damages arising from the use or inability to use the website or its content. The prompts are provided for creative purposes only; we make no guarantees about the output quality of any AI tool.
            </p>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>8. Modifications to Service</h2>
            <p style={styles.text}>
              We reserve the right to modify, suspend, or discontinue any aspect of the service at any time without prior notice. We may also update these Terms of Service; continued use after changes constitutes acceptance of the new terms.
            </p>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>9. Governing Law</h2>
            <p style={styles.text}>
              These terms are governed by the laws of Tanzania. Any disputes arising under these terms shall be resolved in the courts of Tanzania.
            </p>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>10. Contact</h2>
            <p style={styles.text}>
              For questions about these Terms of Service, contact us at{' '}
              <a href="mailto:ibrahimmaulid551@gmail.com" style={styles.link}>ibrahimmaulid551@gmail.com</a>
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

export default Terms
