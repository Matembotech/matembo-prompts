// "New" and "Trending" badges (pure presentational; state decided by lib/badges).
import { IconSparkles, IconTrendingUp } from './icons';

const baseStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  fontWeight: 700,
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '11px',
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  padding: '3px 10px',
  borderRadius: '999px',
  whiteSpace: 'nowrap',
};

export function NewBadge({ style }) {
  return (
    <span style={{ ...baseStyle, background: '#0a6b5e', color: '#ffffff', ...style }}>
      <IconSparkles size={11} /> New
    </span>
  );
}

export function TrendingBadge({ style }) {
  return (
    <span
      style={{
        ...baseStyle,
        background: 'linear-gradient(135deg, #f97316, #f59e0b)',
        color: '#ffffff',
        ...style,
      }}
    >
      <IconTrendingUp size={12} /> Trending
    </span>
  );
}