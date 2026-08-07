import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchCategories } from '../lib/categories';
import { fetchPrompts } from '../lib/prompts';
import PromptCard from '../components/PromptCard';
import { IconWifiOff, IconGrid } from '../components/icons';

const PAGE_SIZE = 10;

function CategoryPage() {
  const { slug: slugParam } = useParams();
  const slug = String(slugParam || '').toLowerCase();

  const [category, setCategory] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [prompts, setPrompts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // Resolve slug -> category (case-insensitive).
  useEffect(() => {
    let active = true;
    setNotFound(false);
    fetchCategories(true)
      .then((list) => {
        if (!active) return;
        const match = list.find((c) => String(c.slug || '').toLowerCase() === slug);
        if (!match) { setCategory(null); setNotFound(true); setLoading(false); return; }
        setCategory(match);
      })
      .catch(() => {});
    return () => { active = false; };
  }, [slug]);

  // Fetch prompts for that category.
  useEffect(() => {
    if (!category) return;
    let active = true;
    setLoading(true);
    setError(null);
    fetchPrompts({ page, categoryId: category.id, pageSize: PAGE_SIZE })
      .then((res) => {
        if (!active) return;
        setPrompts(res.prompts);
        setTotalCount(res.totalCount);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || 'Failed to load prompts');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [category, page]);

  const goToPage = useCallback((next) => {
    const p = Math.min(Math.max(1, next), totalPages);
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [totalPages]);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <section style={styles.section}>
      <style>{componentCSS}</style>

      {/* Header */}
      <div style={styles.header}>
        <Link to="/" style={styles.backLink}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Prompts
        </Link>
        <h2 style={styles.heading}>{notFound ? 'Style Not Found' : (category?.name || 'Loading…')}</h2>
        <p style={styles.subtitle}>
          {notFound
            ? 'This style could not be found or has been removed.'
            : (error ? 'Something went wrong. Please try again.' : `${totalCount} prompt${totalCount === 1 ? '' : 's'} · ${category?.name || ''}`)}
        </p>
        <div style={styles.headerDivider} />
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="prompts-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={styles.skeletonCard}><div style={{ ...styles.shimmer, aspectRatio: '4 / 3', borderRadius: '16px 16px 0 0' }} /></div>
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div style={styles.stateCenter}>
          <IconWifiOff />
          <p style={styles.stateTitle}>Failed to load prompts. Please refresh.</p>
          <button onClick={() => setPage((p) => p)} className="interactive-btn" style={styles.retryBtn}>Try Again</button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && prompts.length === 0 && (
        <div style={styles.stateCenter}>
          <IconGrid />
          <p style={styles.stateTitle}>No prompts here yet.</p>
          <p style={styles.stateSubtitle}>Check back soon — prompts are added regularly.</p>
        </div>
      )}

      {/* Grid */}
      {!loading && !error && prompts.length > 0 && (
        <div className="prompts-grid">
          {prompts.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <>
          <div style={styles.pagination}>
            <button onClick={() => goToPage(page - 1)} disabled={page === 1} style={{ ...styles.pageBtn, ...(page === 1 ? styles.pageBtnDisabled : {}) }}>← Previous</button>
            {getPageNumbers().map((p) => (
              <button key={p} onClick={() => goToPage(p)} style={{ ...styles.pageBtn, ...(p === page ? styles.pageBtnActive : {}) }}>{p}</button>
            ))}
            <button onClick={() => goToPage(page + 1)} disabled={page >= totalPages} style={{ ...styles.pageBtn, ...(page >= totalPages ? styles.pageBtnDisabled : {}) }}>Next →</button>
          </div>
          <p style={styles.pageInfo}>Page {page} of {totalPages} ({totalCount} prompts)</p>
        </>
      )}
    </section>
  );
}

const componentCSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&display=swap');

.prompts-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  max-width: 1340px;
  margin: 0 auto;
  padding: 0 20px;
}
@media (max-width: 900px) { .prompts-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 600px) { .prompts-grid { grid-template-columns: repeat(1, 1fr); } }

@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
`;

const styles = {
  section: {
    background: '#f9fafb',
    padding: '40px 5% 80px',
    width: '100%',
    fontFamily: "'DM Sans', sans-serif",
    minHeight: '60vh',
  },
  header: {
    textAlign: 'center',
    padding: '72px 0 48px',
    maxWidth: '1340px',
    margin: '0 auto',
    position: 'relative',
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    color: '#0a6b5e',
    textDecoration: 'none',
    fontWeight: 700,
    fontSize: '14px',
    position: 'absolute',
    left: '20px',
    top: '8px',
  },
  heading: {
    fontSize: '40px',
    fontWeight: 800,
    color: '#0d0d0d',
    margin: '0 0 12px',
    fontFamily: "'Syne', sans-serif",
    lineHeight: 1.15,
  },
  subtitle: {
    fontSize: '16px',
    color: '#6b7280',
    margin: '0 auto',
    lineHeight: 1.6,
    maxWidth: '520px',
  },
  headerDivider: {
    width: '60px',
    height: '2px',
    background: '#f3f4f6',
    margin: '16px auto 0',
    borderRadius: '999px',
  },
  skeletonCard: {
    borderRadius: '16px',
    overflow: 'hidden',
    background: '#ffffff',
  },
  shimmer: {
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
  },
  stateCenter: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '80px 20px',
  },
  stateTitle: { fontSize: '18px', fontWeight: 700, color: '#374151', margin: 0, textAlign: 'center' },
  stateSubtitle: { fontSize: '14px', color: '#6b7280', margin: 0, textAlign: 'center' },
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
  },
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
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease',
  },
  pageBtnActive: { background: '#0a6b5e', color: '#ffffff', borderColor: '#0a6b5e' },
  pageBtnDisabled: { opacity: 0.4, cursor: 'not-allowed' },
  pageInfo: { textAlign: 'center', fontSize: '13px', color: '#9ca3af', marginTop: '12px', fontFamily: "'DM Sans', sans-serif" },
};

export default CategoryPage;