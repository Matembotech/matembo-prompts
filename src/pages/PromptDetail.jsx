import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import SEO, { SITE_URL } from '../components/SEO';
import { fetchPromptByIdentifier, fetchRecommendations, incrementView, incrementCopy } from '../lib/prompts';
import { canonicalPromptUrl } from '../lib/share';
import { isNewPrompt, isTrendingPrompt } from '../lib/badges';
import { timeAgo } from '../lib/format';
import CategoryBadge from '../components/CategoryBadge';
import PromptCard from '../components/PromptCard';
import { resolveAuthorName } from '../lib/authors';
import { DEFAULT_AUTHOR } from '../lib/config';
import LikeButton from '../components/LikeButton';
import BookmarkButton from '../components/BookmarkButton';
import ShareButton from '../components/ShareButton';
import { NewBadge, TrendingBadge } from '../components/Badges';

/* ── Inline SVG icons ── */
const IconPhoto = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const IconVideo = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

const IconX = ({ size = 28, color = 'white' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconArrowLeft = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const IconBrokenImage = ({ size = 48, color = '#9ca3af' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
    <line x1="3" y1="3" x2="21" y2="21" />
  </svg>
);

function getPromptIdentifier(prompt, fallback) {
  return prompt?.slug || prompt?.id || fallback;
}

/* ── Skeleton for loading ── */
function DetailSkeleton() {
  return (
    <div style={styles.container}>
      <div style={styles.heroSection}>
        <div style={styles.heroNav}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ ...styles.shimmer, width: '36px', height: '36px', borderRadius: '8px' }} />
            <div style={{ ...styles.shimmer, width: '160px', height: '18px', borderRadius: '4px' }} />
          </div>
          <div style={{ ...styles.shimmer, width: '120px', height: '15px', borderRadius: '4px' }} />
        </div>
        <div style={styles.heroContent}>
          <div style={{ flex: 1 }}>
            <div style={{ ...styles.shimmer, width: '100%', height: '400px', borderRadius: '16px' }} />
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ ...styles.shimmer, width: '80%', height: '32px', borderRadius: '8px' }} />
            <div style={{ ...styles.shimmer, width: '100%', height: '16px', borderRadius: '8px' }} />
            <div style={{ ...styles.shimmer, width: '100%', height: '16px', borderRadius: '8px' }} />
            <div style={{ ...styles.shimmer, width: '60%', height: '16px', borderRadius: '8px' }} />
            <div style={{ ...styles.shimmer, width: '120px', height: '40px', borderRadius: '999px', marginTop: '12px' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function PromptDetail() {
  const { slug } = useParams();
  const [prompt, setPrompt] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const [imgError, setImgError] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [copiedVideo, setCopiedVideo] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  const hasImagePrompt = prompt?.image_prompt && prompt.image_prompt.trim().length > 0;
  const hasVideoPrompt = prompt?.video_prompt && prompt.video_prompt.trim().length > 0;
  const showNew = isNewPrompt(prompt?.created_at);
  const showTrending = isTrendingPrompt(prompt?.trending_until);

  /* ─── Fetch prompt ─── */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setNotFound(false);
    window.scrollTo(0, 0);

    fetchPromptByIdentifier(slug)
      .then((data) => {
        if (cancelled) return;
        setPrompt(data);

        // Increment view count in background (safe RPC).
        incrementView(data.id);

        // Fetch Recommendations (randomize from recent 20)
        fetchRecommendations(data.id, 3)
          .then((recs) => {
            if (!cancelled) setRecommendations(recs);
          })
          .catch(() => {});
      })
      .catch((fetchError) => {
        if (cancelled) return;
        if (fetchError?.code === 'PGRST116') {
          setNotFound(true);
        } else {
          setError(fetchError.message || 'Failed to load prompt');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  /* ─── Lightbox handlers ─── */
  const openLightbox = () => {
    if (imgError || !prompt?.image_url) return;
    setLightboxOpen(true);
    setClosing(false);
  };

  const closeLightbox = () => {
    setClosing(true);
    setTimeout(() => {
      setLightboxOpen(false);
      setClosing(false);
    }, 250);
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') closeLightbox();
    };
    if (lightboxOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [lightboxOpen]);

  /* ─── Copy handlers ─── */
  const handleCopyImage = async () => {
    try {
      await navigator.clipboard.writeText(prompt.image_prompt);
      setCopiedImage(true);
      incrementCopy(prompt?.id);
      setTimeout(() => setCopiedImage(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleCopyVideo = async () => {
    try {
      await navigator.clipboard.writeText(prompt.video_prompt);
      setCopiedVideo(true);
      incrementCopy(prompt?.id);
      setTimeout(() => setCopiedVideo(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error('Copy link failed:', err);
    }
  };

  /* ─── SEO data ─── */
  const seoTitle = prompt?.title 
    ? prompt.title 
    : prompt?.image_prompt
      ? prompt.image_prompt.slice(0, 60).replace(/\s+\S*$/, '')
      : 'AI Prompt';

  const seoDescription = prompt?.description
    ? prompt.description
    : hasVideoPrompt
      ? prompt.video_prompt.slice(0, 160)
      : hasImagePrompt
        ? prompt.image_prompt.slice(0, 160)
        : undefined;

  const canonicalIdentifier = getPromptIdentifier(prompt, slug);
  const canonicalUrl = `${SITE_URL}/prompts/${canonicalIdentifier}`;
  const structuredData = prompt ? {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: seoTitle,
    description: seoDescription,
    image: prompt.image_url,
    url: canonicalUrl,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Matembo Prompts',
      url: SITE_URL,
    },
  } : null;

  /* ─── Loading skeleton ─── */
  if (loading) return <DetailSkeleton />;

  /* ─── Not found ─── */
  if (notFound) {
    return (
      <div style={styles.container}>
        <SEO title="Prompt Not Found" noindex />
        <div style={styles.heroSection}>
          <div style={styles.heroNav}>
            <Link to="/" style={styles.heroLogo}>
              <img src="/logo.webp" alt="Matembo Prompts Logo" style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }} />
              <span style={{ color: '#0d0d0d' }}>Matembo Prompts</span>
            </Link>
            <Link to="/" style={styles.backLink}>
              <IconArrowLeft size={16} /> Back to Prompts
            </Link>
          </div>
          <div style={{ ...styles.stateCenter, minHeight: '60vh' }}>
            <h2 style={styles.headingLight}>Prompt Not Found</h2>
            <p style={styles.stateText}>This prompt may have been removed or the link is incorrect.</p>
            <Link to="/" className="interactive-btn" style={styles.btnOutline}>Back to Prompts</Link>
          </div>
        </div>
      </div>
    );
  }

  /* ─── Error ─── */
  if (error) {
    return (
      <div style={styles.container}>
        <SEO title="Error" noindex />
        <div style={styles.heroSection}>
          <div style={styles.heroNav}>
            <Link to="/" style={styles.heroLogo}>
              <img src="/logo.webp" alt="Matembo Prompts Logo" style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }} />
              <span style={{ color: '#0d0d0d' }}>Matembo Prompts</span>
            </Link>
            <Link to="/" style={styles.backLink}>
              <IconArrowLeft size={16} /> Back to Prompts
            </Link>
          </div>
          <div style={{ ...styles.stateCenter, minHeight: '60vh' }}>
            <h2 style={styles.headingLight}>Something went wrong</h2>
            <p style={styles.stateText}>{error}</p>
            <Link to="/" className="interactive-btn" style={styles.btnOutline}>Back to Prompts</Link>
          </div>
        </div>
      </div>
    );
  }

  /* ─── Lightbox portal ─── */
  const lightboxJSX = lightboxOpen ? createPortal(
    <div
      style={{
        ...styles.lightboxOverlay,
        opacity: closing ? 0 : 1,
      }}
      onClick={closeLightbox}
    >
      <button
        style={styles.lightboxCloseBtn}
        onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
      >
        <IconX />
      </button>

      <div
        style={{
          ...styles.lightboxContent,
          transform: closing ? 'scale(0.92)' : 'scale(1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <img src={prompt.image_url} alt="Prompt lightbox" style={styles.lightboxImg} />
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div style={styles.container}>
      <style>{componentCSS}</style>

      <SEO
        title={seoTitle}
        description={seoDescription}
        url={canonicalUrl}
        image={prompt?.image_url}
        type="article"
        jsonLd={structuredData}
      />

      {/* ── Hero / Header ── */}
      <section style={styles.heroSection}>
        <div style={styles.heroNav}>
          <Link to="/" style={styles.heroLogo}>
            <img src="/logo.webp" alt="Matembo Prompts Logo" style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }} />
            <span style={{ color: '#0d0d0d' }}>Matembo Prompts</span>
          </Link>
          <Link to="/" style={styles.backLink}>
            <IconArrowLeft size={16} /> Back to Prompts
          </Link>
        </div>

        <div className="detail-hero-layout" style={styles.heroContent}>
          {/* ── Image ── */}
          <div style={styles.imageCol}>
            <div
              style={{ ...styles.imageWrapper, cursor: imgError ? 'default' : 'zoom-in' }}
              onClick={openLightbox}
            >
              {imgError ? (
                <div style={styles.placeholder}>
                  <IconBrokenImage />
                </div>
              ) : (
                <img
                  src={prompt.image_url}
                  alt={prompt.image_prompt?.slice(0, 80) || 'AI prompt visual'}
                  style={styles.image}
                  onError={() => setImgError(true)}
                />
              )}
            </div>
            {!imgError && (
              <p style={styles.imageHint}>Click image to view full size</p>
            )}
          </div>

          {/* ── Prompt Content ── */}
          <div style={styles.contentCol}>
            
            {/* Title & Description */}
            <div style={styles.metaBlock}>
              {(showNew || showTrending) && (
                <div style={styles.topBadgeRow}>
                  {showNew && <NewBadge />}
                  {showTrending && <TrendingBadge />}
                </div>
              )}
              {prompt?.category && (
                <div style={{ marginBottom: '10px' }}>
                  <CategoryBadge category={prompt.category} />
                </div>
              )}
              <h1 style={styles.detailTitle}>{prompt.title || 'AI Prompt'}</h1>
              {prompt.description && <p style={styles.detailDesc}>{prompt.description}</p>}

              {/* Date */}
              <div style={styles.detailMetaRow}>
                {prompt?.created_at && <span style={styles.detailDate}>{timeAgo(prompt.created_at)}</span>}
              </div>

              {/* Social actions */}
              <div style={styles.detailSocialRow}>
                <LikeButton promptId={prompt.id} count={prompt.like_count} size={30} />
                <BookmarkButton promptId={prompt.id} size={28} />
                <ShareButton
                  promptId={prompt.id}
                  url={canonicalPromptUrl(prompt.slug || prompt.id, prompt.id)}
                  title={prompt.title}
                  text={prompt.excerpt || prompt.image_prompt || prompt.video_prompt}
                />
              </div>
            </div>

            {hasImagePrompt && (
              <div style={styles.promptBlock}>
                <h3 style={styles.promptLabel}>Image Prompt</h3>
                <p style={styles.promptText}>{prompt.image_prompt}</p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    onClick={handleCopyImage}
                    className="interactive-btn"
                    style={{
                      ...styles.copyBtn,
                      ...(copiedImage ? styles.copyBtnCopied : styles.copyBtnDefault),
                    }}
                  >
                    <IconPhoto size={14} color={copiedImage ? '#ffffff' : '#0a6b5e'} />
                    <span>{copiedImage ? 'Copied! ✓' : 'Copy Image Prompt'}</span>
                  </button>
                  <button onClick={handleCopyLink} className="interactive-btn" style={styles.shareBtn}>
                    {copiedLink ? 'Link Copied! ✓' : 'Share Link'}
                  </button>
                </div>
              </div>
            )}

            {hasVideoPrompt && (
              <div style={styles.promptBlock}>
                <h3 style={styles.promptLabel}>Video Prompt</h3>
                <p style={styles.promptText}>{prompt.video_prompt}</p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    onClick={handleCopyVideo}
                    className="interactive-btn"
                    style={{
                      ...styles.copyBtn,
                      ...(copiedVideo ? styles.copyBtnVideoCopied : styles.copyBtnVideoDefault),
                    }}
                  >
                    <IconVideo size={14} color="#ffffff" />
                    <span>{copiedVideo ? 'Copied! ✓' : 'Copy Video Prompt'}</span>
                  </button>
                  {!hasImagePrompt && (
                    <button onClick={handleCopyLink} className="interactive-btn" style={styles.shareBtn}>
                      {copiedLink ? 'Link Copied! ✓' : 'Share Link'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Author at the end */}
            <div style={styles.authorFooter}>
              by {resolveAuthorName(prompt.author, DEFAULT_AUTHOR)}
            </div>
          </div>
        </div>
      </section>

      {/* ── Recommendations ── */}
      {recommendations.length > 0 && (
        <section style={styles.recommendationsSection}>
          <div style={styles.recContainer}>
            <h3 style={styles.recHeading}>You May Also Like</h3>
            <div className="detail-rec-grid">
              {recommendations.map(rec => (
                <PromptCard key={rec.id} prompt={rec} />
              ))}
            </div>
          </div>
        </section>
      )}

      {lightboxJSX}
    </div>
  );
}

/* ══════════════════════════════════════════════
   COMPONENT CSS
   ══════════════════════════════════════════════ */
const componentCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&display=swap');

  @keyframes shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  @media (max-width: 900px) {
    .detail-hero-layout {
      flex-direction: column !important;
      align-items: center;
    }
  }

  .detail-rec-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
  @media (max-width: 900px) {
    .detail-rec-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  @media (max-width: 600px) {
    .detail-rec-grid {
      grid-template-columns: 1fr;
    }
  }
`;

/* ══════════════════════════════════════════════
   STYLES
   ══════════════════════════════════════════════ */
const styles = {
  container: {
    fontFamily: "'DM Sans', sans-serif",
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#ffffff',
    color: '#0d0d0d',
  },

  /* Shimmer skeleton */
  shimmer: {
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
  },

  /* Hero */
  heroSection: {
    padding: '40px 8% 100px',
    minHeight: '100vh',
  },
  heroNav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px',
    marginBottom: '60px',
    width: '100%',
    maxWidth: '1400px',
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
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'opacity 0.2s',
  },
  heroContent: {
    display: 'flex',
    gap: '60px',
    maxWidth: '1400px',
    margin: '0 auto',
    alignItems: 'flex-start',
  },

  /* Image column */
  imageCol: {
    flex: '1 1 500px',
  },
  imageWrapper: {
    width: '100%',
    borderRadius: '16px',
    overflow: 'hidden',
    background: '#f3f4f6',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 'auto',
    maxHeight: '600px',
    objectFit: 'contain',
    display: 'block',
  },
  placeholder: {
    width: '100%',
    minHeight: '400px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f3f4f6',
  },
  imageHint: {
    fontSize: '12px',
    color: '#6b7280',
    textAlign: 'center',
    marginTop: '12px',
  },

  /* Content column */
  contentCol: {
    flex: '1 1 400px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },

  /* Meta block */
  metaBlock: {
    marginBottom: '8px',
  },
  topBadgeRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '12px',
  },
  detailMetaRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    marginTop: '18px',
  },
  detailDate: {
    fontSize: '13px',
    color: '#9ca3af',
    fontWeight: 500,
    fontFamily: "'DM Sans', sans-serif",
    whiteSpace: 'nowrap',
  },
  authorFooter: {
    marginTop: '24px',
    paddingTop: '12px',
    borderTop: '1px solid #f3f4f6',
    fontSize: '13px',
    color: '#9ca3af',
    fontWeight: 500,
    fontFamily: "'DM Sans', sans-serif",
    textTransform: 'lowercase',
  },
  detailSocialRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '16px',
    padding: '10px 14px',
    background: '#f9fafb',
    border: '1px solid #f3f4f6',
    borderRadius: '999px',
    width: 'fit-content',
  },
  detailTitle: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '32px',
    fontWeight: '800',
    color: '#0d0d0d',
    margin: '0 0 12px 0',
    lineHeight: '1.2',
    overflowWrap: 'break-word',
  },
  detailDesc: {
    fontSize: '16px',
    color: '#4b5563',
    lineHeight: '1.6',
    margin: '0',
  },

  /* Prompt blocks */
  promptBlock: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  promptLabel: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '16px',
    fontWeight: '700',
    color: '#0a6b5e',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    margin: '0 0 12px 0',
  },
  promptText: {
    fontSize: '15px',
    color: '#4b5563',
    lineHeight: '1.7',
    margin: '0 0 16px 0',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },

  /* Copy buttons */
  copyBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    borderRadius: '999px',
    fontSize: '14px',
    fontWeight: '700',
    fontFamily: "'DM Sans', sans-serif",
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: '1.5px solid',
  },
  copyBtnDefault: {
    background: 'transparent',
    color: '#0a6b5e',
    borderColor: '#0a6b5e',
  },
  copyBtnCopied: {
    background: '#0a6b5e',
    color: '#ffffff',
    borderColor: '#0a6b5e',
  },
  copyBtnVideoDefault: {
    background: '#0a6b5e',
    color: '#ffffff',
    borderColor: '#0a6b5e',
  },
  copyBtnVideoCopied: {
    background: '#085048',
    color: '#ffffff',
    borderColor: '#085048',
  },
  shareBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px 20px',
    borderRadius: '999px',
    fontSize: '14px',
    fontWeight: '700',
    fontFamily: "'DM Sans', sans-serif",
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    background: '#f3f4f6',
    color: '#374151',
    border: '1.5px solid #e5e7eb',
  },

  /* States (error / not found) */
  stateCenter: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
  },
  headingLight: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '42px',
    fontWeight: '800',
    color: '#0d0d0d',
    margin: '0',
  },
  stateText: {
    fontSize: '16px',
    color: '#6b7280',
    margin: '0',
  },
  btnOutline: {
    display: 'inline-flex',
    alignItems: 'center',
    background: 'transparent',
    color: '#0d0d0d',
    border: '2px solid #0d0d0d',
    padding: '12px 28px',
    borderRadius: '999px',
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: '15px',
    transition: 'all 0.3s',
    fontFamily: "'DM Sans', sans-serif",
  },

  /* Recommendations */
  recommendationsSection: {
    background: '#f9fafb',
    padding: '80px 8%',
    borderTop: '1px solid #e5e7eb',
  },
  recContainer: {
    maxWidth: '1400px',
    margin: '0 auto',
  },
  recHeading: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '28px',
    fontWeight: '800',
    color: '#0d0d0d',
    marginBottom: '32px',
  },

  /* Lightbox */
  lightboxOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 9999,
    background: 'rgba(0, 0, 0, 0.92)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'opacity 0.25s ease',
  },
  lightboxCloseBtn: {
    position: 'fixed',
    top: '20px',
    right: '24px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '50%',
    padding: '8px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
  },
  lightboxContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    transition: 'transform 0.25s ease',
    maxWidth: '90vw',
    maxHeight: '90vh',
    width: '100%',
  },
  lightboxImg: {
    maxWidth: '90vw',
    maxHeight: '90vh',
    objectFit: 'contain',
    display: 'block',
  },
};

export default PromptDetail;
