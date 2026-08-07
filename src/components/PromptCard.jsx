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

      {/* ── Full-card image background ── */}
      <div style={styles.backdrop}>
        {imgError ? (
          <div style={styles.placeholder}>
            <IconBrokenImage />
          </div>
        ) : (
          <img
            src={prompt.image_url}
            alt={prompt.image_prompt?.slice(0, 80) || 'AI prompt visual'}
            loading="lazy"
            style={{ ...styles.image, transform: hovered ? 'scale(1.05)' : 'scale(1)' }}
            onError={() => setImgError(true)}
          />
        )}
      </div>

      {/* Status + category badges pinned top-left */}
      {(prompt?.category || showNew || showTrending) && (
        <div style={styles.badgeCol}>
          {prompt?.category && (
            <CategoryBadge
              category={prompt.category}
              size="sm"
              style={styles.categoryBlack}
            />
          )}
          {(showNew || showTrending) && (
            <div style={styles.badgeRow}>
              {showNew && <NewBadge />}
              {showTrending && <TrendingBadge />}
            </div>
          )}
        </div>
      )}

      {/* Like control pinned top-right */}
      <div style={styles.likeOverlay}>
        <LikeButton promptId={prompt.id} count={prompt.like_count} size={16} overlay />
      </div>

      {/* ── Bottom overlay content on top of the image ── */}
      <div style={styles.body}>
        {prompt?.title && <h3 style={styles.cardTitle}>{prompt.title}</h3>}

        <PromptSnippet
          excerpt={prompt.excerpt}
          imagePrompt={prompt.image_prompt}
          videoPrompt={prompt.video_prompt}
          maxLength={130}
          lines={2}
          style={{
            marginBottom: '10px',
            color: 'rgba(255,255,255,0.9)',
            fontSize: 13.5,
            textShadow: '0 1px 3px rgba(0,0,0,0.5)',
          }}
        />

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
                <span>{copiedImage ? 'Copied ✓' : 'Copy Prompt'}</span>
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
                <span>{copiedVideo ? 'Copied ✓' : 'Copy Prompt'}</span>
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

        <div style={styles.footerRow}>
          <span style={styles.author}>
            by {resolveAuthorName(prompt.author, DEFAULT_AUTHOR)}
          </span>
          {prompt?.created_at && <span style={styles.date}>{timeAgo(prompt.created_at)}</span>}
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
    background: '#0d0d0d',
    overflow: 'hidden',
    position: 'relative',
    aspectRatio: '4 / 5',
    clipPath: 'none',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    cursor: 'pointer',
    outline: 'none',
  },
  cardHover: {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 28px rgba(0,0,0,0.14)',
  },

  /* Full-card image background */
  backdrop: {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    background: '#0d0d0d',
    borderRadius: '16px',
  },
  image: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center',
    display: 'block',
    transition: 'transform 0.4s ease',
  },
  placeholder: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#111827',
  },

  /* Pinned corners (floating above the card — no opaque background) */
  badgeCol: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '6px',
    zIndex: 3,
    pointerEvents: 'none',
  },
  categoryBlack: {
    background: '#0a0a0a',
    color: '#ffffff',
    border: '1px solid rgba(255,255,255,0.25)',
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
    zIndex: 3,
  },

  /* Bottom content overlay — translucent black so the image shows through */
  body: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    padding: '22px 18px 14px',
    zIndex: 2,
    color: '#ffffff',
    borderRadius: '18px 18px 0 0',
    background:
      'linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.82) 45%, rgba(0,0,0,0.45) 100%)',
    backdropFilter: 'blur(1.5px)',
  },
  cardTitle: {
    fontSize: '19px',
    fontWeight: 700,
    color: '#ffffff',
    margin: '0 0 6px 0',
    fontFamily: "'DM Sans', sans-serif",
    textShadow: '0 1px 4px rgba(0,0,0,0.6)',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 2,
  },
  actionsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  socialGroup: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    marginLeft: 'auto',
    flexShrink: 0,
    background: 'rgba(255,255,255,0.92)',
    borderRadius: '999px',
    padding: '2px 6px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
  },
  footerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    marginTop: '10px',
  },
  author: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.7)',
    fontWeight: 500,
    fontFamily: "'DM Sans', sans-serif",
    textTransform: 'lowercase',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  date: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.6)',
    fontWeight: 500,
    fontFamily: "'DM Sans', sans-serif",
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },

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
    background: 'rgba(255,255,255,0.94)',
    color: '#0a6b5e',
    border: '1.5px solid rgba(255,255,255,0.94)',
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
    background: 'rgba(255,255,255,0.94)',
    color: '#0a6b5e',
    border: '1.5px solid #0a6b5e',
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