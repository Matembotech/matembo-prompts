import { useBookmark } from '../hooks/useBookmark';
import { IconBookmark, IconBookmarkFilled } from './icons';

// Round bookmark/save button. Works for anonymous visitors too (state is kept
// per device until they sign in, then synced to the database).
export default function BookmarkButton({ promptId, saved = false, size = 24, onToggle }) {
  const { saved: isSaved, toggle } = useBookmark({ promptId, initialCount: saved });

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggle();
    onToggle?.();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={isSaved}
      aria-label={isSaved ? 'Remove bookmark' : 'Save this prompt'}
      title={isSaved ? 'Remove from bookmarks' : 'Save'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        padding: '8px 10px',
        borderRadius: '999px',
        color: isSaved ? '#0a6b5e' : '#6b7280',
        transition: 'color 0.15s ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = '#0a6b5e')}
      onMouseLeave={(e) => (e.currentTarget.style.color = isSaved ? '#0a6b5e' : '#6b7280')}
    >
      {isSaved ? <IconBookmarkFilled size={size} /> : <IconBookmark size={size} />}
    </button>
  );
}