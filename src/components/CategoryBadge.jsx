// Category pill badge. Order of precedence: name (sluggifier), then slug.
function slugify(name = '') {
  return (name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function CategoryBadge({ category, style, size = 'md' }) {
  if (!category) return null;
  const hash = [...(category.name || category.slug || '')].reduce(
    (acc, ch) => acc + ch.charCodeAt(0),
    0
  );
  const palette = [
    { bg: '#e9f7f4', color: '#0a6b5e', border: '#d1ede6' },
    { bg: '#fff4e6', color: '#b45309', border: '#fee2c2' },
    { bg: '#eef1ff', color: '#4338ca', border: '#dfe3ff' },
    { bg: '#fbeefb', color: '#9d174d', border: '#f6daea' },
    { bg: '#ecfdf5', color: '#047857', border: '#d1fae5' },
    { bg: '#fff1f2', color: '#be123c', border: '#ffe4e6' },
  ];
  const tone = palette[hash % palette.length];
  const parent = Array.isArray(category.parent) ? category.parent[0] : category.parent;
  let label = category.name || slugify(category.slug || '');
  if (parent?.name) label = `${parent.name} · ${label}`;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: tone.bg,
        color: tone.color,
        border: `1px solid ${tone.border}`,
        fontWeight: 700,
        fontFamily: "'DM Sans', sans-serif",
        fontSize: size === 'sm' ? '11px' : '12px',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        textDecoration: 'none',
        padding: size === 'sm' ? '3px 9px' : '4px 10px',
        borderRadius: '999px',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {label}
    </span>
  );
}
