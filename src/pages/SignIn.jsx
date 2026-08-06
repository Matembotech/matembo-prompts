import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

function SignIn() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const { isAuthenticated, isAdmin, loading } = useAuth();

  const [mode, setMode] = useState('login'); // login | signup | otp
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  /* If the redirect target is the admin panel, only admins get through. */
  const resolvedRedirect =
    redirect.startsWith('/admin') && !isAdmin ? '/' : redirect;

  useEffect(() => {
    if (loading) return;
    if (isAuthenticated) {
      navigate(resolvedRedirect, { replace: true });
    }
  }, [isAuthenticated, loading, resolvedRedirect, navigate]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setBusy(true);
    try {
      const res =
        mode === 'login'
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({ email, password });

      if (res.error) {
        setError(res.error.message);
        return;
      }
      if (mode === 'signup') {
        // If confirmation is required, signUp returns WITHOUT a session.
        if (res.data?.session) return;
        setMessage('Account created! Check your email to confirm your account, then sign in.');
        setMode('login');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  const handleOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setBusy(true);
    try {
      const { error: err } = await supabase.auth.signInWithOtp({ email });
      if (err) {
        setError(err.message);
        return;
      }
      setMessage('Magic link sent! Check your email to continue.');
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* ── Nav ── */}
      <div style={styles.heroNav}>
        <Link to="/" style={styles.heroLogo}>
          <img src="/logo.webp" alt="Matembo Prompts Logo" style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }} />
          <span>Matembo Prompts</span>
        </Link>
        <Link to="/" style={styles.backLink}>← Back to prompts</Link>
      </div>

      <div style={styles.cardWrap}>
        <div style={styles.card}>
          <span style={styles.label}>ACCOUNT</span>
          <h1 style={styles.title}>{mode === 'signup' ? 'Create your account' : mode === 'otp' ? 'Email sign-in' : 'Sign in'}</h1>
          <p style={styles.subtitle}>
            Sign in to like, bookmark and track your favourite prompts.
          </p>

          {message && <p style={styles.message}>{message}</p>}
          {error && <p style={styles.error}>{error}</p>}

          {mode === 'otp' ? (
            <form onSubmit={handleOtp} style={styles.form}>
              <label style={styles.labelField}>Email</label>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={styles.input}
              />
              <button type="submit" disabled={busy} className="interactive-btn" style={styles.btnPrimary}>
                {busy ? 'Sending…' : 'Send magic link'}
              </button>
              <button type="button" onClick={() => setMode('login')} style={styles.btnGhost}>
                Back to password sign in
              </button>
            </form>
          ) : (
            <form onSubmit={handlePasswordSubmit} style={styles.form}>
              <label style={styles.labelField}>Email</label>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={styles.input}
              />
              {mode === 'login' && (
                <>
                  <label style={styles.labelField}>Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={styles.input}
                  />
                </>
              )}
              <button type="submit" disabled={busy} style={styles.btnPrimary}>
                {busy
                  ? 'Please wait…'
                  : mode === 'signup'
                    ? 'Create account'
                    : 'Sign in'}
              </button>

              {mode === 'login' ? (
                <div style={styles.switchRow}>
                  <button type="button" onClick={() => setMode('otp')} style={styles.btnGhost}>
                    Send a magic link instead
                  </button>
                  <span style={styles.switchDivider}>·</span>
                  <button type="button" onClick={() => setMode('signup')} style={styles.btnGhost}>
                    Create account
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => setMode('login')} style={styles.btnGhost}>
                  Already have an account? Sign in
                </button>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "'DM Sans', sans-serif",
    minHeight: '100vh',
    background: '#ffffff',
    color: '#0d0d0d',
    padding: '40px 8% 80px',
  },
  heroNav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px',
    maxWidth: '520px',
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
    color: '#0d0d0d',
  },
  backLink: {
    color: '#0a6b5e',
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: '15px',
  },
  cardWrap: {
    display: 'flex',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    maxWidth: '520px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: 700,
    color: '#0a6b5e',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    marginBottom: '10px',
  },
  title: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '34px',
    fontWeight: '800',
    color: '#0d0d0d',
    margin: '0 0 10px 0',
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: '16px',
    color: '#6b7280',
    margin: '0 0 28px 0',
    lineHeight: 1.6,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  labelField: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#374151',
    marginTop: '4px',
  },
  input: {
    padding: '12px 14px',
    borderRadius: '12px',
    border: '1.5px solid #e5e7eb',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '15px',
    color: '#0d0d0d',
    outline: 'none',
    transition: 'border-color 0.15s ease',
  },
  btnPrimary: {
    marginTop: '4px',
    padding: '13px 20px',
    borderRadius: '999px',
    border: 'none',
    background: '#0a6b5e',
    color: '#ffffff',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 700,
    fontSize: '15px',
    cursor: 'pointer',
    transition: 'background 0.2s ease',
  },
  btnGhost: {
    background: 'transparent',
    border: 'none',
    color: '#0a6b5e',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 600,
    fontSize: '14px',
    cursor: 'pointer',
    textAlign: 'center',
    padding: '6px',
  },
  switchRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    flexWrap: 'wrap',
    marginTop: '8px',
  },
  switchDivider: {
    color: '#d1d5db',
  },
  message: {
    background: '#ecfdf5',
    color: '#047857',
    border: '1px solid #bbf7d0',
    borderRadius: '10px',
    padding: '12px 14px',
    fontSize: '14px',
    margin: '0 0 16px 0',
  },
  error: {
    background: '#fff1f2',
    color: '#be123c',
    border: '1px solid #ffe4e6',
    borderRadius: '10px',
    padding: '12px 14px',
    fontSize: '14px',
    margin: '0 0 16px 0',
  },
};

export default SignIn;