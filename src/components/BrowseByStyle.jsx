import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCategoryStats, getRootCategories } from '../lib/categories';

function BrowseByStyle() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchCategoryStats()
      .then((list) => {
        if (!active) return;
        const roots = getRootCategories(list)
          .filter((c) => c.is_active !== false)
          .map((c) => ({ ...c, prompt_count: Number(c.prompt_count) || 0 }))
          .sort((a, b) => b.prompt_count - a.prompt_count);
        setItems(roots);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section style={styles.section}>
      <style>{componentCSS}</style>

      {/* Header */}
      <div style={styles.header}>
        <span style={styles.headerLabel}>BROWSE</span>
        <h2 style={styles.heading}>Browse by Style</h2>
        <p style={styles.subtitle}>Find the perfect aesthetic for your next project.</p>
        <div style={styles.headerDivider} />
      </div>

      {/* Skeleton */}
      {loading && (
        <div className="browse-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={styles.skeletonCard} />
          ))}
        </div>
      )}

      {/* Grid */}
      {!loading && items.length > 0 && (
        <div className="browse-grid">
          {items.map((c) => (
            <Link key={c.id} to={`/category/${c.slug}`} style={styles.card} className="browse-card">
              <span style={styles.initial}>{c.name.trim().charAt(0) || '?'}</span>
              <span style={styles.cardText}>
                <span style={styles.cardName}>{c.name}</span>
                <span style={styles.cardCount}>{c.prompt_count.toLocaleString()} Prompts</span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

const componentCSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&display=swap');

.browse-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  max-width: 1340px;
  margin: 0 auto;
  padding: 0 20px;
}
@media (max-width: 1023px) {
  .browse-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 767px) {
  .browse-grid { grid-template-columns: 1fr; }
}

.browse-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 24px rgba(0,0,0,0.08);
  border-color: #0a6b5e;
}

@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
`;

const styles = {
  section: {
    background: '#ffffff',
    padding: '80px 5%',
    width: '100%',
    fontFamily: "'DM Sans', sans-serif",
  },
  header: {
    textAlign: 'center',
    paddingBottom: '40px',
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
    height: '96px',
    borderRadius: '14px',
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
  },
  initial: {
    width: '46px',
    height: '46px',
    borderRadius: '50%',
    background: '#e9f7f4',
    color: '#0a6b5e',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: '18px',
    fontFamily: "'Syne', sans-serif",
    flexShrink: 0,
  },
  card: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '14px',
    padding: '18px 20px',
    textDecoration: 'none',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
  },
  cardText: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  cardName: {
    fontSize: '15px',
    fontWeight: 700,
    color: '#0d0d0d',
    fontFamily: "'DM Sans', sans-serif",
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  cardCount: {
    fontSize: '12px',
    color: '#9ca3af',
    fontWeight: 500,
    marginTop: '2px',
  },
};

export default BrowseByStyle;