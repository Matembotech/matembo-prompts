import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import PromptCard from './PromptCard';

/* ── Inline SVG icons ── */
const IconWifiOff = ({ size = 40, color = '#9ca3af' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="1" y1="1" x2="23" y2="23" />
    <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
    <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
    <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
    <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    <line x1="12" y1="20" x2="12.01" y2="20" />
  </svg>
);

const IconGrid = ({ size = 48, color = '#d1d5db' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

/* ══════════════════════════════════════════════
   SKELETON CARD
   ══════════════════════════════════════════════ */
function SkeletonCard() {
  return (
    <div style={styles.skeletonCard}>
      <div style={{ ...styles.shimmer, height: '280px', borderRadius: '16px 16px 0 0' }} />
      <div style={styles.skeletonBody}>
        <div style={styles.skeletonBtnRow}>
          <div style={{ ...styles.shimmer, height: '36px', borderRadius: '999px', flex: 1 }} />
          <div style={{ ...styles.shimmer, height: '36px', borderRadius: '999px', flex: 1 }} />
        </div>
        <div style={{ ...styles.shimmer, height: '14px', borderRadius: '8px', width: '50%', marginTop: '12px' }} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   PROMPTS GRID COMPONENT
   ══════════════════════════════════════════════ */
function PromptsGrid() {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const PER_PAGE = 10;
  const totalPages = Math.ceil(totalCount / PER_PAGE);
  const needsPagination = totalCount > PER_PAGE;

  /* ─── Fetch prompts ─── */
  const fetchPrompts = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const { count, error: countError } = await supabase
        .from('prompts')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;
      setTotalCount(count);

      if (count <= PER_PAGE) {
        const { data, error: fetchError } = await supabase
          .from('prompts')
          .select('*')
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setPrompts(data || []);
        setCurrentPage(1);
      } else {
        const from = (page - 1) * PER_PAGE;
        const to = from + PER_PAGE - 1;

        const { data, error: fetchError } = await supabase
          .from('prompts')
          .select('*')
          .order('created_at', { ascending: false })
          .range(from, to);

        if (fetchError) throw fetchError;
        setPrompts(data || []);
      }
    } catch (err) {
      console.error('Error fetching prompts:', err);
      setError(err.message || 'Failed to load prompts');
    } finally {
      setLoading(false);
    }
  };

  /* ─── Pagination handler ─── */
  const goToPage = (page) => {
    setCurrentPage(page);
    fetchPrompts(page);
    const el = document.getElementById('prompts-grid-section');
    if (el) window.scrollTo({ top: el.offsetTop - 100, behavior: 'smooth' });
  };

  useEffect(() => {
    fetchPrompts();

    if (needsPagination) return;

    const channel = supabase
      .channel('prompts-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'prompts' },
        (payload) => {
          setPrompts((prev) => [payload.new, ...prev]);
          setTotalCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  /* ─── Build page numbers ─── */
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  /* ═══ RENDER ═══ */
  return (
    <>
      {/* Inject keyframes + responsive grid CSS */}
      <style>{componentCSS}</style>

      <section id="prompts-grid-section" style={styles.section}>
        {/* ── Section Header ── */}
        <div style={styles.header}>
          <span style={styles.headerLabel}>PROMPT LIBRARY</span>
          <h2 style={styles.headerHeading}>Explore Prompts</h2>
          <p style={styles.headerSubtitle}>
            Copy and use professionally crafted AI prompts for image and video generation
          </p>
          <div style={styles.headerDivider} />
        </div>

        {/* ── Loading: skeleton grid ── */}
        {loading && (
          <div className="prompts-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* ── Error state ── */}
        {!loading && error && (
          <div style={styles.stateCenter}>
            <IconWifiOff />
            <p style={styles.stateTitle}>Failed to load prompts. Please refresh.</p>
            <button onClick={fetchPrompts} className="interactive-btn" style={styles.retryBtn}>
              Try Again
            </button>
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && !error && prompts.length === 0 && (
          <div style={styles.stateCenter}>
            <IconGrid />
            <p style={styles.stateTitle}>No prompts yet. Check back soon!</p>
            <p style={styles.stateSubtitle}>Prompts will appear here once added.</p>
          </div>
        )}

        {/* ── Prompts grid ── */}
        {!loading && !error && prompts.length > 0 && (
          <div className="prompts-grid">
            {prompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                id={prompt.id}
                image_url={prompt.image_url}
                image_prompt={prompt.image_prompt}
                video_prompt={prompt.video_prompt}
                copy_count={prompt.copy_count}
              />
            ))}
          </div>
        )}

        {/* ── Pagination ── */}
        {!loading && !error && needsPagination && prompts.length > 0 && (
          <div style={styles.pagination}>
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                ...styles.pageBtn,
                ...(currentPage === 1 ? styles.pageBtnDisabled : {}),
              }}
            >
              ← Previous
            </button>

            {getPageNumbers().map((page) => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                style={{
                  ...styles.pageBtn,
                  ...(page === currentPage ? styles.pageBtnActive : {}),
                }}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              style={{
                ...styles.pageBtn,
                ...(currentPage >= totalPages ? styles.pageBtnDisabled : {}),
              }}
            >
              Next →
            </button>
          </div>
        )}

        {!loading && !error && needsPagination && prompts.length > 0 && (
          <p style={styles.pageInfo}>
            Page {currentPage} of {totalPages} ({totalCount} prompts)
          </p>
        )}
      </section>
    </>
  );
}

/* ══════════════════════════════════════════════
   COMPONENT-SCOPED CSS (keyframes + responsive)
   ══════════════════════════════════════════════ */
const componentCSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&display=swap');

@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.prompts-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  max-width: 1340px;
  margin: 0 auto;
  padding: 0 20px;
}

@media (max-width: 900px) {
  .prompts-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .prompts-grid {
    grid-template-columns: 1fr;
  }
}
`;

/* ══════════════════════════════════════════════
   INLINE STYLES
   ══════════════════════════════════════════════ */
const styles = {
  section: {
    background: '#f9fafb',
    padding: '80px 5%',
    width: '100%',
    fontFamily: "'DM Sans', sans-serif",
  },

  /* Header */
  header: {
    textAlign: 'center',
    paddingBottom: '48px',
    maxWidth: '1340px',
    margin: '0 auto',
  },
  headerLabel: {
    display: 'block',
    fontSize: '13px',
    fontWeight: 700,
    color: '#0a6b5e',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    marginBottom: '12px',
    fontFamily: "'DM Sans', sans-serif",
  },
  headerHeading: {
    fontSize: '40px',
    fontWeight: 800,
    color: '#0d0d0d',
    margin: '0 0 12px',
    fontFamily: "'Syne', sans-serif",
    lineHeight: 1.15,
  },
  headerSubtitle: {
    fontSize: '16px',
    color: '#6b7280',
    margin: '0',
    lineHeight: 1.6,
    maxWidth: '540px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  headerDivider: {
    width: '60px',
    height: '2px',
    background: '#f3f4f6',
    margin: '16px auto 0',
    borderRadius: '999px',
  },

  /* Skeleton */
  skeletonCard: {
    borderRadius: '16px',
    overflow: 'hidden',
    background: '#ffffff',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
  },
  shimmer: {
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
  },
  skeletonBody: {
    padding: '16px 20px 20px',
  },
  skeletonBtnRow: {
    display: 'flex',
    gap: '10px',
  },

  /* Center states (error / empty) */
  stateCenter: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '80px 20px',
    maxWidth: '1340px',
    margin: '0 auto',
  },
  stateTitle: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#374151',
    margin: 0,
    textAlign: 'center',
  },
  stateSubtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: '8px',
    padding: '10px 24px',
    borderRadius: '999px',
    border: '1.5px solid #0a6b5e',
    background: 'transparent',
    color: '#0a6b5e',
    fontSize: '14px',
    fontWeight: 700,
    fontFamily: "'DM Sans', sans-serif",
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },

  /* Pagination */
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '6px',
    marginTop: '40px',
    flexWrap: 'wrap',
  },
  pageBtn: {
    minWidth: '40px',
    height: '40px',
    padding: '0 12px',
    borderRadius: '10px',
    border: '1.5px solid #e5e7eb',
    background: '#ffffff',
    color: '#374151',
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif",
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageBtnActive: {
    background: '#0a6b5e',
    color: '#ffffff',
    borderColor: '#0a6b5e',
  },
  pageBtnDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  pageInfo: {
    textAlign: 'center',
    fontSize: '13px',
    color: '#9ca3af',
    marginTop: '12px',
    fontFamily: "'DM Sans', sans-serif",
  },
};

export default PromptsGrid;
