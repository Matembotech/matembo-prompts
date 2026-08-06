import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { incrementCopy } from '../lib/prompts';
import { canonicalPromptUrl } from '../lib/share';
import { isNewPrompt, isTrendingPrompt } from '../lib/badges';
import { timeAgo } from '../lib/format';
import { NewBadge, TrendingBadge } from './Badges';
import CategoryBadge from './CategoryBadge';
import PromptSnippet from './PromptSnippet';
import LikeButton from './LikeButton';
import BookmarkButton from './BookmarkButton';
import ShareButton from './ShareButton';
import { resolveAuthorName } from '../lib/authors';
import { DEFAULT_AUTHOR } from '../lib/config';
import { IconPhoto, IconVideo, IconBrokenImage } from './icons';

function PromptCard({ prompt }) {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [copiedVideo, setCopiedVideo] = useState(false);
  const [hovered, setHovered] = useState(false);

  const slug = prompt?.slug || prompt?.id;
  const detailPath = `/prompts/${slug}`;
  const hasImagePrompt = prompt?.image_prompt && prompt.image_prompt.trim().length > 0;
  const hasVideoPrompt = prompt?.video_prompt && prompt.video_prompt.trim().length > 0;

  const openPrompt = () => navigate(detailPath);

  const handleCopyImage = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(prompt.image_prompt);
      setCopiedImage(true);
      incrementCopy(prompt.id);
      setTimeout(() => setCopiedImage(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleCopyVideo = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(prompt.video_prompt);
      setCopiedVideo(true);
      incrementCopy(prompt.id);
      setTimeout(() => setCopiedVideo(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const showNew = isNewPrompt(prompt?.created_at);
  const showTrending = isTrendingPrompt(prompt?.trending_until);

  return (
    <article
      role="link"
      tabIndex={0}
      aria-label={`Open prompt: ${prompt?.title || 'AI Prompt'}`}
      onClick={openPrompt}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openPrompt();
        }
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...styles.card,
        ...(hovered ? styles.cardHover : {}),
      }}
    >
      <style>{btnCSS}</style>

      {/* ── Image + badges ── */}
      <div style={styles.imageWrapper}>
        {imgError ? (
          <div style={styles.placeholder}>
            <IconBrokenImage />
          </div>
        ) : (
          <img
            src={prompt.image_url}
            alt={prompt.image_prompt?.slice(0, 80) || 'AI prompt visual'}
            loading="lazy"
            style={styles.image}
            onError={() => setImgError(true)}
          />
        )}
        {/* Category badge + New/Trending pinned to the top-left of the image */}
        {(prompt?.category || showNew || showTrending) && (
          <div style={styles.badgeCol}>
            {prompt?.category && <CategoryBadge category={prompt.category} size="sm" />}
            {(showNew || showTrending) && (
              <div style={styles.badgeRow}>
                {showNew && <NewBadge />}
                {showTrending && <TrendingBadge />}
              </div>
            )}
          </div>
        )}

        {/* Like control pinned to the top-right of the image */}
        <div style={styles.likeOverlay}>
          <LikeButton promptId={prompt.id} count={prompt.like_count} size={16} overlay />
        </div>
      </div>

      {/* ── Body ── */}
      <div style={styles.body}>
        {prompt?.title && <h3 style={styles.cardTitle}>{prompt.title}</h3>}

        <PromptSnippet
          excerpt={prompt.excerpt}
          imagePrompt={prompt.image_prompt}
          videoPrompt={prompt.video_prompt}
          maxLength={150}
          lines={3}
          style={{ marginBottom: '14px' }}
        />

        {/* ── Meta row: date ── */}
        <div style={styles.metaRow}>
          {prompt?.created_at && (
            <span style={styles.date}>{timeAgo(prompt.created_at)}</span>
          )}
        </div>

        {/* ── Actions ── */}
        {(hasImagePrompt || hasVideoPrompt) && (
          <div style={styles.actionsRow}>
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
                <span>{copiedImage ? 'Copied! ✓' : 'Copy Prompt'}</span>
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
                <span>{copiedVideo ? 'Copied! ✓' : 'Copy Prompt'}</span>
              </button>
            )}

            <div style={styles.socialGroup}>
              <BookmarkButton promptId={prompt.id} />
              <ShareButton
                variant="pill"
                promptId={prompt.id}
                url={canonicalPromptUrl(slug, prompt.id)}
                title={prompt.title}
                text={prompt.excerpt || prompt.image_prompt || prompt.video_prompt}
                iconSize={16}
              />
            </div>
          </div>
        )}

        {/* ── Author at the end of the card ── */}
        <div style={styles.authorFooter}>
          by {resolveAuthorName(prompt.author, DEFAULT_AUTHOR)}
        </div>
      </div>
    </article>
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
    cursor: 'pointer',
    outline: 'none',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  cardHover: {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 28px rgba(0,0,0,0.10)',
  },

  /* Image */
  imageWrapper: {
    width: '100%',
    aspectRatio: '4 / 3',
    maxHeight: '360px',
    overflow: 'hidden',
    borderRadius: '16px 16px 0 0',
    background: '#f3f4f6',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'top',
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
  badgeCol: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '6px',
    zIndex: 2,
    pointerEvents: 'none',
  },
  badgeRow: {
    display: 'flex',
    gap: '6px',
    pointerEvents: 'none',
  },
  likeOverlay: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    zIndex: 2,
  },

  /* Body */
  body: {
    padding: '16px 20px 18px',
    borderLeft: '0.5px solid #e5e7eb',
    borderRight: '0.5px solid #e5e7eb',
    borderBottom: '0.5px solid #e5e7eb',
    borderRadius: '0 0 16px 16px',
    background: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#0d0d0d',
    margin: '0 0 8px 0',
    fontFamily: "'DM Sans', sans-serif",
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  /* Meta row */
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '8px',
    marginBottom: '10px',
  },
  date: {
    fontSize: '12px',
    color: '#9ca3af',
    fontWeight: 500,
    fontFamily: "'DM Sans', sans-serif",
    whiteSpace: 'nowrap',
  },
  authorFooter: {
    marginTop: '14px',
    paddingTop: '10px',
    borderTop: '1px solid #f3f4f6',
    fontSize: '12px',
    color: '#9ca3af',
    fontWeight: 500,
    fontFamily: "'DM Sans', sans-serif",
    textTransform: 'lowercase',
  },

  /* Actions */
  actionsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    marginTop: 'auto',
  },
  socialGroup: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    marginLeft: 'auto',
    flexShrink: 0,
  },

  /* Buttons */
  btnBase: {
    minWidth: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '8px 14px',
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
