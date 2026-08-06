// Author display name with a small initial avatar. Falls back to the site's
// default author when a prompt has no author.
import { resolveAuthorName, authorInitial } from '../lib/authors';
import { DEFAULT_AUTHOR } from '../lib/config';

export default function AuthorName({ author, fallback = DEFAULT_AUTHOR, size = 26, style }) {
  const name = resolveAuthorName(author, fallback);
  const initial = authorInitial(name);

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', ...style }}>
      <span
        aria-hidden="true"
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: '#e9f7f4',
          color: '#0a6b5e',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontFamily: "'DM Sans', sans-serif",
          fontSize: size > 30 ? 14 : 12,
          flexShrink: 0,
        }}
      >
        {initial}
      </span>
      <span
        style={{
          color: '#374151',
          fontSize: 13,
          fontWeight: 600,
          fontFamily: "'DM Sans', sans-serif",
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: 120,
        }}
      >
        {name}
      </span>
    </span>
  );
}