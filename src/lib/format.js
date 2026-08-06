// Date/formatting helpers used across the UI.

export function timeAgo(dateInput) {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return '';
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 45) return 'just now';
  const units = [
    { name: 'year', seconds: 31536000 },
    { name: 'month', seconds: 2592000 },
    { name: 'week', seconds: 604800 },
    { name: 'day', seconds: 86400 },
    { name: 'hour', seconds: 3600 },
    { name: 'minute', seconds: 60 },
  ];
  for (const unit of units) {
    const value = Math.floor(seconds / unit.seconds);
    if (value >= 1) return `${value}${unit.name[0]} ago`; // e.g. "3d ago"
  }
  return 'just now';
}

// 1200 -> "1.2k", 1500000 -> "1.5M"
export function compactNumber(value) {
  const n = Number(value) || 0;
  if (n < 1000) return String(n);
  if (n < 1_000_000) {
    const k = n / 1000;
    return `${k >= 100 ? Math.round(k) : k.toFixed(1)}k`;
  }
  return `${(n / 1_000_000).toFixed(1)}M`;
}
