import React from 'react';

export default function StatsRow({ promptCount, prompts, isMobile }) {
  // Compute values
  const totalCopies = prompts.reduce((sum, p) => sum + (p.copy_count || 0), 0);
  const avgCopies = promptCount > 0 ? (totalCopies / promptCount).toFixed(1) : '0';
  
  let latestAdded = '—';
  if (prompts.length > 0 && prompts[0]?.created_at) {
    latestAdded = new Date(prompts[0].created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  return (
    <div style={{ ...styles.grid, gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: isMobile ? '8px' : '12px', marginBottom: isMobile ? '0' : '20px' }}>
      {/* 1. Total Prompts (green) */}
      <div style={{...styles.card, background: '#0F6E56', padding: isMobile ? '12px 14px' : '16px 18px'}}>
        <div style={styles.labelRow}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00C896" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
          </svg>
          <span style={{ ...styles.label, fontSize: isMobile ? '9px' : '10px' }}>TOTAL PROMPTS</span>
        </div>
        <div style={{ ...styles.value, fontSize: isMobile ? '22px' : '26px' }}>{promptCount}</div>
        <div style={styles.trendRow}>
          <span style={{...styles.trendText, color: '#00C896'}}>+active</span>
        </div>
      </div>

      {/* 2. Total Copies (violet) */}
      <div style={{...styles.card, background: '#6D28D9', padding: isMobile ? '12px 14px' : '16px 18px'}}>
        <div style={styles.labelRow}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C4B5FD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
          </svg>
          <span style={{ ...styles.label, fontSize: isMobile ? '9px' : '10px' }}>TOTAL COPIES</span>
        </div>
        <div style={{ ...styles.value, fontSize: isMobile ? '22px' : '26px' }}>{totalCopies}</div>
        <div style={styles.trendRow}>
          <span style={styles.trendText}>all time</span>
        </div>
      </div>

      {/* 3. Avg Copies (amber) */}
      <div style={{...styles.card, background: '#B45309', padding: isMobile ? '12px 14px' : '16px 18px'}}>
        <div style={styles.labelRow}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FCD34D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/>
          </svg>
          <span style={{ ...styles.label, fontSize: isMobile ? '9px' : '10px' }}>AVG COPIES</span>
        </div>
        <div style={{ ...styles.value, fontSize: isMobile ? '22px' : '26px' }}>{avgCopies}</div>
        <div style={styles.trendRow}>
          <span style={styles.trendText}>per prompt</span>
        </div>
      </div>

      {/* 4. Latest Added (slate) */}
      <div style={{...styles.card, background: '#1E293B', padding: isMobile ? '12px 14px' : '16px 18px'}}>
        <div style={styles.labelRow}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
          </svg>
          <span style={{ ...styles.label, fontSize: isMobile ? '9px' : '10px' }}>LATEST ADDED</span>
        </div>
        <div style={{ ...styles.value, fontSize: isMobile ? '22px' : '26px' }}>{latestAdded}</div>
        <div style={styles.trendRow}>
          <span style={styles.trendText}>most recent</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
    marginBottom: '20px',
  },
  card: {
    borderRadius: '12px',
    padding: '16px 18px',
    display: 'flex',
    flexDirection: 'column',
    border: 'none',
    boxShadow: 'none',
  },
  labelRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  label: {
    fontSize: '10px',
    color: 'rgba(255,255,255,0.65)',
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    fontWeight: 600,
  },
  value: {
    fontSize: '26px',
    fontWeight: 600,
    color: '#ffffff',
    marginTop: '6px',
    fontFamily: "'DM Sans', sans-serif",
  },
  trendRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginTop: '4px',
  },
  trendText: {
    fontSize: '10px',
    color: 'rgba(255,255,255,0.5)',
  }
};

