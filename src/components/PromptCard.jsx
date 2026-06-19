import { useState } from 'react';
import { Link } from 'react-router-dom';
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

/* ── Format count ── */
function formatCount(n) {
  if (n >= 10000) return Math.floor(n / 1000) + 'k';
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(n);
}

/* ══════════════════════════════════════════════
   PROMPT CARD COMPONENT
   ══════════════════════════════════════════════ */
function PromptCard({ id, slug, title, image_url, image_prompt, video_prompt, copy_count }) {
  const [imgError, setImgError] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [copiedVideo, setCopiedVideo] = useState(false);
  const [localCount, setLocalCount] = useState(copy_count || 0);
  const [hovered, setHovered] = useState(false);

  const hasImagePrompt = image_prompt && image_prompt.trim().length > 0;
  const hasVideoPrompt = video_prompt && video_prompt.trim().length > 0;

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

  return (
    <div
        style={{
          ...styles.card,
          ...(hovered ? styles.cardHover : {}),
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <style>{btnCSS}</style>
        {/* ── Image ── */}
        <Link
          to={`/prompts/${slug || id}`}
          style={{
            ...styles.imageWrapper,
            cursor: imgError ? 'default' : 'pointer',
            display: 'block',
          }}
          onClick={(e) => imgError && e.preventDefault()}
        >
          {imgError ? (
            <div style={styles.placeholder}>
              <IconBrokenImage />
            </div>
          ) : (
            <img
              src={image_url}
              alt="AI prompt visual"
              loading="lazy"
              style={styles.image}
              onError={() => setImgError(true)}
            />
          )}
        </Link>

        {/* ── Body ── */}
        <div style={styles.body}>
          {title && <h3 style={styles.cardTitle}>{title}</h3>}
          {/* Copy Buttons */}
          {(hasImagePrompt || hasVideoPrompt) && (
            <div className="flex flex-col xl:flex-row gap-[10px]">
              {hasImagePrompt && (
                <button
                  onClick={handleCopyImage}
                  className="interactive-btn prompt-card-btn"
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
                  className="interactive-btn prompt-card-btn"
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

  /* Body */
  body: {
    padding: '16px 20px',
    borderLeft: '0.5px solid #e5e7eb',
    borderRight: '0.5px solid #e5e7eb',
    background: '#ffffff',
  },
  cardTitle: {
    fontSize: '15px',
    fontWeight: 700,
    color: '#0d0d0d',
    margin: '0 0 12px 0',
    fontFamily: "'DM Sans', sans-serif",
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  /* Buttons */
  btnBase: {
    flex: 1,
    minWidth: 0,
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
};

export default PromptCard;

const btnCSS = `
  @media (max-width: 600px) {
    .prompt-card-btn {
      font-size: 11px !important;
      padding: 7px 10px !important;
      min-width: 0;
    }
  }
`;
