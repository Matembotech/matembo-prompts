import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { usePrompts } from '../hooks/usePrompts';
import { fetchBrowseCategories } from '../lib/categories';
import PromptCard from './PromptCard';
import { IconWifiOff, IconGrid } from './icons';

/* ══════════════════════════════════════════════
   SKELETON CARD
   ══════════════════════════════════════════════ */
function SkeletonCard() {
  return (
    <div style={styles.skeletonCard}>
      <div style={{ ...styles.shimmer, aspectRatio: '4 / 3', borderRadius: '16px 16px 0 0' }} />
      <div style={styles.skeletonBody}>
        <div style={{ ...styles.shimmer, height: '14px', borderRadius: '8px', width: '40%', marginBottom: '10px' }} />
        <div style={{ ...styles.shimmer, height: '18px', borderRadius: '8px', width: '80%', marginBottom: '12px' }} />
        <div style={{ ...styles.shimmer, height: '14px', borderRadius: '8px', width: '100%', marginBottom: '6px' }} />
        <div style={{ ...styles.shimmer, height: '14px', borderRadius: '8px', width: '60%', marginBottom: '14px' }} />
        <div style={styles.skeletonBtnRow}>
          <div style={{ ...styles.shimmer, height: '36px', borderRadius: '999px', flex: 1 }} />
          <div style={{ ...styles.shimmer, height: '36px', borderRadius: '999px', flex: 1 }} />
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   PROMPTS GRID COMPONENT
   ══════════════════════════════════════════════ */
function PromptsGrid({ categorySlug = null }) {
  const { prompts, loading, error, page, totalCount, totalPages, activeCategorySlug, selectCategory, goToPage } = usePrompts({ pageSize: 10 });

  // Dynamic, DB-driven category filter pills (active top-level categories that
  // currently have prompts). No hardcoded categories.
  const [filterCategories, setFilterCategories] = useState([]);
  useEffect(() => {
    let active = true;
    fetchBrowseCategories()
      .then((rows) => {
        if (!active) return;
        const withPrompts = rows
          .filter((c) => (Number(c.prompt_count) || 0) > 0)
          .sort((a, b) => (b.prompt_count || 0) - (a.prompt_count || 0));
        setFilterCategories(withPrompts.slice(0, 8));
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  // Apply an externally requested category filter (e.g. from Browse by Style).
  useEffect(() => {
    if (!categorySlug) return;
    selectCategory(categorySlug);
  }, [categorySlug, selectCategory]);

  const needsPagination = totalCount > 10;

  /* ─── Realtime: only on the unfiltered first page ─── */
  useEffect(() => {
    if (needsPagination || activeCategorySlug || page !== 1) return;

    const channel = supabase
      .channel('prompts-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'prompts' },
        () => {
          window.location.reload();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [needsPagination, activeCategorySlug, page]);

  const goToPageAndScroll = (next) => {
    goToPage(next);
    const el = document.getElementById('prompts-grid-section');
    if (el) window.scrollTo({ top: el.offsetTop - 100, behavior: 'smooth' });
  };

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
    <>
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

        {/* ── Filters: dynamic, DB-driven categories ── */}
        {!loading && (
          <div style={styles.filterRow} role="group" aria-label="Filter prompts">
            <FilterPill
              label="All"
              active={!activeCategorySlug}
              onClick={() => selectCategory(null)}
            />
            {filterCategories.map((c) => {
              const catSlug = String(activeCategorySlug || '').toLowerCase();
              const active = catSlug === String(c.slug).toLowerCase();
              return (
                <FilterPill
                  key={c.id}
                  label={c.name}
                  active={active}
                  onClick={() => selectCategory(c.slug)}
                />
              );
            })}
          </div>
        )}

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
            <button onClick={() => selectCategory(activeCategorySlug)} className="interactive-btn" style={styles.retryBtn}>
              Try Again
            </button>
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && !error && prompts.length === 0 && (
          <div style={styles.stateCenter}>
            <IconGrid />
            <p style={styles.stateTitle}>No prompts here yet.</p>
            <p style={styles.stateSubtitle}>
              {(activeCategorySlug) ? 'Try another filter or check back soon.' : 'Prompts will appear here once added.'}
            </p>
          </div>
        )}

        {/* ── Prompts grid ── */}
        {!loading && !error && prompts.length > 0 && (
          <div className="prompts-grid">
            {prompts.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          </div>
        )}

        {/* ── Pagination ── */}
        {!loading && !error && needsPagination && prompts.length > 0 && (
          <>
            <div style={styles.pagination}>
              <button
                onClick={() => goToPageAndScroll(page - 1)}
                disabled={page === 1}
                style={{ ...styles.pageBtn, ...(page === 1 ? styles.pageBtnDisabled : {}) }}
              >
                ← Previous
              </button>

              {getPageNumbers().map((p) => (
                <button
                  key={p}
                  onClick={() => goToPageAndScroll(p)}
                  style={{ ...styles.pageBtn, ...(p === page ? styles.pageBtnActive : {}) }}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => goToPageAndScroll(page + 1)}
                disabled={page >= totalPages}
                style={{ ...styles.pageBtn, ...(page >= totalPages ? styles.pageBtnDisabled : {}) }}
              >
                Next →
              </button>
            </div>
            <p style={styles.pageInfo}>
              Page {page} of {totalPages} ({totalCount} prompts)
            </p>
          </>
        )}
      </section>
    </>
  );
}

function FilterPill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      style={{
        ...styles.filterPill,
        ...(active ? styles.filterPillActive : {}),
      }}
    >
      {label}
    </button>
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
    grid-template-columns: repeat(1, 1fr);
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

  /* Category filter */
  filterRow: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '10px',
    margin: '0 auto 40px',
    maxWidth: '1340px',
    padding: '0 20px',
  },
  filterPill: {
    padding: '8px 18px',
    borderRadius: '999px',
    border: '1.5px solid #e5e7eb',
    background: '#ffffff',
    color: '#374151',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  filterPillActive: {
    background: '#0a6b5e',
    color: '#ffffff',
    borderColor: '#0a6b5e',
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
    marginTop: '16px',
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
