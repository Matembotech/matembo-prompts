import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../supabaseClient';

/* ── Tabler-style SVG icons (inline to avoid external deps) ── */
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

const IconUsers = ({ size = 14, color = '#9ca3af' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconBrokenImage = ({ size = 36, color = '#9ca3af' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
    <line x1="3" y1="3" x2="21" y2="21" />
  </svg>
);

const IconX = ({ size = 28, color = 'white' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconZoomIn = ({ size = 18, color = 'white' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="11" y1="8" x2="11" y2="14" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

/* ── Format count ── */
function formatCount(n) {
  if (n >= 10000) return Math.floor(n / 1000) + 'k';
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(n);
}

/* ══════════════════════════════════════════════
   PROMPT CARD COMPONENT
   ══════════════════════════════════════════════ */
function PromptCard({ id, image_url, image_prompt, video_prompt, copy_count }) {
  const [imgError, setImgError] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [copiedVideo, setCopiedVideo] = useState(false);
  const [localCount, setLocalCount] = useState(copy_count || 0);
  const [hovered, setHovered] = useState(false);
  const [imgHovered, setImgHovered] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  const hasImagePrompt = image_prompt && image_prompt.trim().length > 0;
  const hasVideoPrompt = video_prompt && video_prompt.trim().length > 0;

  /* ─── Lightbox handlers ─── */
  const openLightbox = () => {
    if (imgError) return;
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

  /* ─── Increment counter (optimistic + Supabase) ─── */
  const incrementCount = () => {
    const newCount = localCount + 1;
    setLocalCount(newCount);
    supabase
      .from('prompts')
      .update({ copy_count: newCount })
      .eq('id', id)
      .then(({ error }) => {
        if (error) console.error('Failed to update copy_count:', error);
      });
  };

  /* ─── Copy handlers ─── */
  const handleCopyImage = async (e) => {
    e?.stopPropagation();
    try {
      await navigator.clipboard.writeText(image_prompt);
      setCopiedImage(true);
      incrementCount();
      setTimeout(() => setCopiedImage(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleCopyVideo = async (e) => {
    e?.stopPropagation();
    try {
      await navigator.clipboard.writeText(video_prompt);
      setCopiedVideo(true);
      incrementCount();
      setTimeout(() => setCopiedVideo(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

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
        <img src={image_url} alt="Lightbox" style={styles.lightboxImg} />
        
        {(hasImagePrompt || hasVideoPrompt) && (
          <div style={styles.lightboxButtonRow}>
            {hasImagePrompt && (
              <button
                onClick={handleCopyImage}
                className="interactive-btn"
                style={{
                  ...styles.btnBase,
                  ...(copiedImage ? styles.btnImageCopied : styles.lightboxBtnImageDefault),
                }}
              >
                <IconPhoto size={14} color="#ffffff" />
                <span>{copiedImage ? 'Copied! ✓' : 'Copy Image Prompt'}</span>
              </button>
            )}

            {hasVideoPrompt && (
              <button
                onClick={handleCopyVideo}
                className="interactive-btn"
                style={{
                  ...styles.btnBase,
                  ...(copiedVideo ? styles.btnVideoCopied : styles.lightboxBtnVideoDefault),
                }}
              >
                <IconVideo size={14} color="#ffffff" />
                <span>{copiedVideo ? 'Copied! ✓' : 'Copy Video Prompt'}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <div
        style={{
          ...styles.card,
          ...(hovered ? styles.cardHover : {}),
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* ── Image ── */}
        <div 
          style={{
            ...styles.imageWrapper,
            cursor: imgError ? 'default' : 'zoom-in',
          }}
          onMouseEnter={() => setImgHovered(true)}
          onMouseLeave={() => setImgHovered(false)}
          onClick={openLightbox}
        >
          {imgError ? (
            <div style={styles.placeholder}>
              <IconBrokenImage />
            </div>
          ) : (
            <>
              <img
                src={image_url}
                alt="AI prompt visual"
                loading="lazy"
                style={styles.image}
                onError={() => setImgError(true)}
              />
              <div style={{
                ...styles.zoomOverlay,
                ...(imgHovered && !imgError ? styles.zoomOverlayVisible : {})
              }}>
                <IconZoomIn />
              </div>
            </>
          )}
        </div>

        {/* ── Body ── */}
        <div style={styles.body}>
          {/* Copy Buttons */}
          {(hasImagePrompt || hasVideoPrompt) && (
            <div className="flex flex-col xl:flex-row gap-[10px]">
              {hasImagePrompt && (
                <button
                  onClick={handleCopyImage}
                  className="interactive-btn"
                  style={{
                    ...styles.btnBase,
                    ...(copiedImage ? styles.btnImageCopied : styles.btnImageDefault),
                  }}
                >
                  <IconPhoto size={14} color={copiedImage ? '#ffffff' : '#0a6b5e'} />
                  <span>{copiedImage ? 'Copied! ✓' : 'Copy Image Prompt'}</span>
                </button>
              )}

              {hasVideoPrompt && (
                <button
                  onClick={handleCopyVideo}
                  className="interactive-btn"
                  style={{
                    ...styles.btnBase,
                    ...(copiedVideo ? styles.btnVideoCopied : styles.btnVideoDefault),
                  }}
                >
                  <IconVideo size={14} color="#ffffff" />
                  <span>{copiedVideo ? 'Copied! ✓' : 'Copy Video Prompt'}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Counter ── */}
        <div style={styles.counter}>
          <IconUsers />
          <span style={styles.counterText}>
            {formatCount(localCount)} used this prompt
          </span>
        </div>
      </div>
      {lightboxJSX}
    </>
  );
}

/* ══════════════════════════════════════════════
   STYLES
   ══════════════════════════════════════════════ */
const styles = {
  card: {
    borderRadius: '16px',
    background: '#ffffff',
    overflow: 'hidden',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    cursor: 'default',
  },
  cardHover: {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 28px rgba(0,0,0,0.10)',
  },

  /* Image */
  imageWrapper: {
    width: '100%',
    height: '280px',
    overflow: 'hidden',
    borderRadius: '16px 16px 0 0',
    background: '#f3f4f6',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f3f4f6',
  },
  zoomOverlay: {
    position: 'absolute',
    bottom: '10px',
    right: '10px',
    background: 'rgba(0,0,0,0.5)',
    padding: '6px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    transition: 'opacity 0.2s ease',
    pointerEvents: 'none',
  },
  zoomOverlayVisible: {
    opacity: 1,
  },

  /* Body */
  body: {
    padding: '16px 20px',
    borderLeft: '0.5px solid #e5e7eb',
    borderRight: '0.5px solid #e5e7eb',
    background: '#ffffff',
  },

  /* Buttons */
  btnBase: {
    flex: 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '9px 14px',
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: 700,
    fontFamily: "'DM Sans', sans-serif",
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
  },
  btnImageDefault: {
    background: 'transparent',
    color: '#0a6b5e',
    border: '1.5px solid #0a6b5e',
  },
  btnImageCopied: {
    background: '#0a6b5e',
    color: '#ffffff',
    border: '1.5px solid #0a6b5e',
  },
  btnVideoDefault: {
    background: '#0a6b5e',
    color: '#ffffff',
    border: '1.5px solid #0a6b5e',
  },
  btnVideoCopied: {
    background: '#085048',
    color: '#ffffff',
    border: '1.5px solid #085048',
  },

  /* Counter */
  counter: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 20px 14px',
    borderTop: '1px solid #f3f4f6',
    borderLeft: '0.5px solid #e5e7eb',
    borderRight: '0.5px solid #e5e7eb',
    borderBottom: '0.5px solid #e5e7eb',
    borderRadius: '0 0 16px 16px',
    background: '#ffffff',
  },
  counterText: {
    fontSize: '12px',
    color: '#6b7280',
    fontFamily: "'DM Sans', sans-serif",
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
    flexDirection: 'column',
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
    maxHeight: 'calc(90vh - 80px)', // Leave space for buttons
    objectFit: 'contain',
    display: 'block',
  },
  lightboxButtonRow: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  lightboxBtnImageDefault: {
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#ffffff',
    border: '1.5px solid rgba(255, 255, 255, 0.3)',
  },
  lightboxBtnVideoDefault: {
    background: '#0a6b5e',
    color: '#ffffff',
    border: '1.5px solid #0a6b5e',
  },
};

export default PromptCard;
