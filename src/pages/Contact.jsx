import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import SEO, { SITE_URL } from '../components/SEO';

function Contact() {
  const [form, setForm] = useState({ full_name: '', email: '', subject: '', message: '', company: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [error, setError] = useState('');

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    // Honeypot: bots fill the hidden "company" field. If present, silently drop.
    if (form.company) {
      setStatus('success');
      return;
    }
    if (!form.full_name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    setStatus('sending');
    try {
      const { error: err } = await supabase.from('contact_messages').insert({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      });
      if (err) throw err;
      setStatus('success');
      setForm({ full_name: '', email: '', subject: '', message: '', company: '' });
    } catch (err) {
      console.error(err);
      setStatus('error');
      setError('Something went wrong sending your message. Please try again.');
    }
  };

  return (
    <div style={styles.container}>
      <style>{componentCSS}</style>

      <SEO
        title="Contact"
        description="Get in touch with Matembo Prompts. Ask a question, request a custom prompt, or share feedback."
        url={`${SITE_URL}/contact`}
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
          <span style={styles.label}>CONTACT</span>
          <h1 style={styles.heading}>Get in Touch</h1>
          <p style={styles.intro}>
            Have a question, a custom prompt request, or a collaboration idea? Send a message and we will get back to you.
          </p>

          {status === 'success' ? (
            <div style={styles.successBlock}>
              <div style={styles.successIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <h2 style={styles.successHeading}>Message Sent</h2>
              <p style={styles.successText}>Thanks for reaching out! We have received your message and will reply soon.</p>
              <Link to="/" style={styles.successLink}>← Back to prompts</Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} style={styles.form}>
              {/* Honeypot (hidden from humans) */}
              <input
                type="text"
                value={form.company}
                onChange={update('company')}
                style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, width: 0 }}
                tabIndex="-1"
                autoComplete="off"
                aria-hidden="true"
              />

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Your Name *</label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={update('full_name')}
                  placeholder="e.g. Jane Doe"
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Email Address *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={update('email')}
                  placeholder="you@example.com"
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Subject *</label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={update('subject')}
                  placeholder="What is this about?"
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Message *</label>
                <textarea
                  value={form.message}
                  onChange={update('message')}
                  placeholder="Write your message here..."
                  style={styles.textarea}
                  required
                />
              </div>

              {error && <p style={styles.errorMsg}>{error}</p>}

              <button type="submit" disabled={status === 'sending'} style={{ ...styles.submitBtn, ...(status === 'sending' ? styles.submitDisabled : {}) }}>
                {status === 'sending' ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
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
    maxWidth: '640px',
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
    margin: '0 0 16px 0',
    lineHeight: '1.15',
  },
  intro: {
    fontSize: '16px',
    color: '#4b5563',
    lineHeight: '1.8',
    margin: '0 0 40px 0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#0d0d0d',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    fontSize: '15px',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    outline: 'none',
    fontFamily: "'DM Sans', sans-serif",
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    height: '140px',
    padding: '12px 14px',
    fontSize: '15px',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    outline: 'none',
    fontFamily: "'DM Sans', sans-serif",
    resize: 'vertical',
    boxSizing: 'border-box',
  },
  errorMsg: {
    color: '#dc2626',
    fontSize: '14px',
    fontWeight: 500,
    margin: '0',
    padding: '10px 14px',
    background: '#fef2f2',
    borderRadius: '10px',
    border: '1px solid #fecaca',
  },
  submitBtn: {
    width: '100%',
    padding: '14px',
    border: 'none',
    borderRadius: '10px',
    background: '#0a6b5e',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
  },
  submitDisabled: {
    background: '#d1d5db',
    cursor: 'not-allowed',
  },
  successBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '16px',
    padding: '40px 24px',
  },
  successIcon: {
    width: '56px',
    height: '56px',
    background: '#16a34a',
    color: '#ffffff',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  successHeading: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '24px',
    fontWeight: '800',
    margin: '0 0 8px 0',
    color: '#0d0d0d',
  },
  successText: {
    fontSize: '15px',
    color: '#4b5563',
    lineHeight: '1.7',
    margin: '0 0 16px 0',
  },
  successLink: {
    color: '#0a6b5e',
    textDecoration: 'none',
    fontWeight: 700,
    fontSize: '14px',
  },
};

export default Contact;