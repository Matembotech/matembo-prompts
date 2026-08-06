import { useLike } from '../hooks/useLike';
import { compactNumber } from '../lib/format';
import { IconHeart, IconHeartFilled } from './icons';

// Heart like button. Works for anonymous visitors (kept per device until
// sign-in).
//  - `overlay`: a vertical pill (heart above count) meant for the card image
//  - heart fills RED and the total increments when liked
export default function LikeButton({ promptId, count = 0, size = 22, overlay = false, onToggle }) {
  const { liked, count: liveCount, toggle } = useLike({ promptId, initialCount: count });

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggle();
    onToggle?.();
  };

  const red = '#e02424';
  const idle = overlay ? '#0d0d0d' : '#6b7280';

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={liked}
      aria-label={liked ? 'Unlike this prompt' : 'Like this prompt'}
      title={liked ? 'Unlike' : 'Like'}
      style={{ ...(overlay ? styles.overlay : styles.inline), color: liked ? red : idle }}
      onMouseEnter={(e) => (e.currentTarget.style.color = red)}
      onMouseLeave={(e) => (e.currentTarget.style.color = liked ? red : idle)}
    >
      {liked ? <IconHeartFilled size={size} /> : <IconHeart size={size} />}
      <span style={styles.count}>{compactNumber(liveCount)}</span>
    </button>
  );
}

const styles = {
  inline: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    padding: '8px 10px',
    borderRadius: '999px',
    color: '#6b7280',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    fontWeight: 700,
    transition: 'color 0.15s ease, background 0.15s ease',
  },
  overlay: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    minWidth: '52px',
    border: 'none',
    cursor: 'pointer',
    padding: '8px 6px',
    borderRadius: '10px',
    color: '#0d0d0d',
    background: 'rgba(255, 255, 255, 0.92)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.18)',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 700,
    transition: 'color 0.15s ease, background 0.15s ease',
  },
  count: {
    fontSize: 12,
    fontWeight: 700,
    lineHeight: 1,
  },
};