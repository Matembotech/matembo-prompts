import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchEverything } from '../lib/search';

const RECENTS_KEY = 'matembo.recent_searches';
const MAX_RECENTS = 5;
const DEBOUNCE_MS = 250;

function readRecents() {
  try {
    return JSON.parse(localStorage.getItem(RECENTS_KEY)) || [];
  } catch {
    return [];
  }
}
function writeRecents(list) {
  try {
    localStorage.setItem(RECENTS_KEY, JSON.stringify(list.slice(0, MAX_RECENTS)));
  } catch {
    /* storage may be unavailable; ignore */
  }
}

// Wrap matched substrings of `text` around `query` in <mark>.
function Highlight({ text, query }) {
  const q = (query || '').trim();
  const base = text ? String(text) : '';
  if (!q) return <>{base}</>;
  const lowerText = base.toLowerCase();
  const lowerQuery = q.toLowerCase();
  if (!lowerText.includes(lowerQuery)) return <>{base}</>;
  const parts = [];
  let i = 0;
  while (i < base.length) {
    const idx = lowerText.indexOf(lowerQuery, i);
    if (idx === -1) {
      parts.push(base.slice(i));
      break;
    }
    if (idx > i) parts.push(base.slice(i, idx));
    parts.push(
      <mark key={`${idx}`} style={{ background: 'transparent', color: 'inherit', fontWeight: 700 }}>
        {base.slice(idx, idx + lowerQuery.length)}
      </mark>
    );
    i = idx + lowerQuery.length;
  }
  return <>{parts}</>;
}

function SearchBar({ placeholder = 'Search prompts, categories, creators...' }) {
  const navigate = useNavigate();

  const [value, setValue] = useState('');
  const [results, setResults] = useState({ prompts: [], categories: [] });
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recents, setRecents] = useState(readRecents);

  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const trimmed = value.trim();

  // Debounced global search.
  useEffect(() => {
    if (!trimmed) return;
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const res = await searchEverything(trimmed);
        if (cancelled) return;
        setResults(res);
        setDone(true);
        setActiveIndex(-1);
      } catch (err) {
        if (cancelled) return;
        console.error(err);
        setResults({ prompts: [], categories: [] });
        setDone(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [trimmed]);

  // Flattened, focusable result items (categories first, then prompts).
  const items = useMemo(() => {
    const list = [];
    results.categories.forEach((c) => list.push({ type: 'category', href: `/category/${c.slug}`, ...c }));
    results.prompts.forEach((p) => list.push({ type: 'prompt', href: `/prompts/${p.slug}`, ...p }));
    return list;
  }, [results]);

  const hasResults = items.length > 0;
  const hasRecents = recents.length > 0 && !trimmed;
  const showPanel = open && (trimmed ? loading || done : hasRecents);

  const saveRecent = useCallback((term) => {
    if (!term) return;
    const next = [term, ...recents.filter((r) => r.toLowerCase() !== term.toLowerCase())].slice(0, MAX_RECENTS);
    setRecents(next);
    writeRecents(next);
  }, [recents]);

  const commit = useCallback((item) => {
    if (!item) return;
    saveRecent(value.trim());
    setOpen(false);
    inputRef.current?.blur();
    navigate(item.href);
  }, [navigate, saveRecent, value]);

  const goRecent = (term) => {
    setValue(term);
    setOpen(true);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const onKeyDown = (e) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = activeIndex >= 0 ? items[activeIndex] : items[0];
      commit(selected);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  const close = () => {
    setOpen(false);
    setActiveIndex(-1);
  };

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) close();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={containerRef} role="search" style={styles.wrap}>
      <style>{componentCSS}</style>

      {/* Input row */}
      <div style={styles.inputWrap}>
        <svg style={styles.icon} aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls="search-results"
          aria-label="Search prompts, categories, creators"
          placeholder={placeholder}
          value={value}
          onChange={(e) => { const v = e.target.value; setValue(v); setOpen(true); setLoading(Boolean(v.trim())); setDone(false); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          style={styles.input}
          className="search-input"
          autoComplete="off"
          spellCheck="false"
        />
        {loading && <span style={styles.spinner} aria-hidden="true" />}
        {value && !loading && (
          <button type="button" onClick={() => { setValue(''); inputRef.current?.focus(); }} style={styles.clearBtn} aria-label="Clear search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showPanel && (
        <div id="search-results" role="listbox" aria-label="Search results" style={styles.dropdown}>
          {!trimmed && hasRecents && (
            <div style={styles.group}>
              <div style={styles.groupLabel}>Recent searches</div>
              {recents.map((r) => (
                <button
                  key={r} type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => goRecent(r)}
                  style={styles.recentItem}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: '#9ca3af' }}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r}</span>
                </button>
              ))}
            </div>
          )}

          {loading && !done && <div style={styles.hint}>Searching…</div>}

          {trimmed && done && !loading && !hasResults && (
            <div style={styles.empty}>
              <p style={styles.emptyTitle}>No results found</p>
              <p style={styles.emptySub}>Try a different keyword like “portrait”, “cinematic”, or “isometric”.</p>
            </div>
          )}

          {hasResults &&
            <>
              {results.categories.length > 0 && (
                <div style={styles.group}>
                  <div style={styles.groupLabel}>Categories</div>
                  {items.filter((it) => it.type === 'category').map((it) => (
                    <CategoryItem key={it.id} item={it} query={trimmed} onSelect={() => commit(it)} />
                  ))}
                </div>
              )}
              {results.prompts.length > 0 && (
                <div style={styles.group}>
                  <div style={styles.groupLabel}>Prompts</div>
                  {items.filter((it) => it.type === 'prompt').map((it) => (
                    <PromptItem key={it.id} item={it} query={trimmed} onSelect={() => commit(it)} />
                  ))}
                </div>
              )}
            </>
          }
        </div>
      )}
    </div>
  );
}

function CategoryItem({ item, query, onSelect }) {
  return (
    <button type="button" role="option" aria-selected="false" data-search-item onMouseDown={(e) => e.preventDefault()} onClick={onSelect} style={styles.item}>
      <span style={styles.itemIcon}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
      </span>
      <span style={styles.itemMain}>
        <span style={styles.itemTitle}><Highlight text={item.name} query={query} /></span>
        <span style={styles.itemMeta}>Category</span>
      </span>
      <span style={styles.itemHint}>›</span>
    </button>
  );
}

function PromptItem({ item, query, onSelect }) {
  const author = item.author?.full_name || 'Matembo Tech';
  return (
    <button type="button" role="option" data-search-item onMouseDown={(e) => e.preventDefault()} onClick={onSelect} style={styles.item}>
      <span style={styles.thumbWrap}>
        {item.image_url ? <img src={item.image_url} alt="" style={styles.thumb} loading="lazy" /> : <span style={{ ...styles.thumb, background: '#f3f4f6' }} />}
      </span>
      <span style={styles.itemMain}>
        <span style={styles.itemTitle}><Highlight text={item.title || item.excerpt || 'Untitled prompt'} query={query} /></span>
        <span style={styles.itemMeta}>
          {item.category ? (item.category.name + ' · ') : ''}{author}
        </span>
        {item.excerpt && (
          <span style={styles.itemSnippet}><Highlight text={item.excerpt} query={query} /></span>
        )}
      </span>
      {item.badge && (
        <span style={item.badge === 'new' ? styles.badgeNew : styles.badgeTrend}>
          {item.badge === 'new' ? 'NEW' : 'Trending'}
        </span>
      )}
    </button>
  );
}

const styles = {
  wrap: { position: 'relative', width: '100%', maxWidth: '420px', fontFamily: "'DM Sans', sans-serif" },
  inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  icon: { position: 'absolute', left: '16px', color: '#9ca3af', pointerEvents: 'none' },
  input: {
    width: '100%', boxSizing: 'border-box',
    padding: '14px 44px 14px 44px',
    borderRadius: '999px',
    border: '1.5px solid #e5e7eb',
    background: '#ffffff',
    fontSize: '16px',
    color: '#0d0d0d',
    outline: 'none',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  clearBtn: {
    position: 'absolute', right: '8px',
    background: '#f3f4f6', border: 'none', borderRadius: '50%',
    width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#6b7280', cursor: 'pointer', padding: 0,
  },
  spinner: {
    position: 'absolute', right: '16px', width: '16px', height: '16px',
    border: '2px solid #e5e7eb', borderTopColor: '#0a6b5e', borderRadius: '50%',
    animation: 'searchspin 0.7s linear infinite',
  },
  dropdown: {
    position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
    background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.12)', overflow: 'hidden', zIndex: 60,
    maxHeight: 'min(420px, 70vh)', overflowY: 'auto',
  },
  group: { padding: '6px' },
  groupLabel: { fontSize: '11px', fontWeight: 700, color: '#9ca3af', padding: '6px 10px', textTransform: 'uppercase', letterSpacing: '0.06em' },
  hint: { padding: '18px 16px', fontSize: '13px', color: '#6b7280' },
  empty: { padding: '28px 20px', textAlign: 'center' },
  emptyTitle: { margin: '0 0 4px 0', fontSize: '15px', fontWeight: 700, color: '#0d0d0d' },
  emptySub: { margin: 0, fontSize: '13px', color: '#9ca3af' },
  recentItem: {
    width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
    padding: '9px 10px', background: 'transparent', border: 'none', borderRadius: '10px',
    fontSize: '14px', color: '#374151', cursor: 'pointer', textAlign: 'left',
  },
  item: {
    width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
    padding: '9px 10px', background: 'transparent', border: 'none', borderRadius: '10px',
    color: '#0d0d0d', textAlign: 'left', cursor: 'pointer',
  },
  itemIcon: { width: '32px', height: '32px', background: '#E1F5EE', color: '#0a6b5e', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  thumbWrap: { width: '42px', height: '42px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: '#f3f4f6' },
  thumb: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  itemMain: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1px' },
  itemTitle: { fontSize: '14px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  itemMeta: { fontSize: '12px', color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  itemSnippet: { fontSize: '12px', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  itemHint: { fontSize: '14px', color: '#c1c7cd', flexShrink: 0 },
  badgeNew: { background: '#e0f2fe', color: '#0369a1', fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '999px', flexShrink: 0 },
  badgeTrend: { background: '#fff7ed', color: '#c2410c', fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '999px', flexShrink: 0 },
};

const componentCSS = `
  [data-search-item] { border-radius: 10px; }
  [data-search-item]:hover { background: #f9fafb; }
  [data-search-item]:focus-visible { outline: 2px solid #0a6b5e; outline-offset: -2px; background: #f0fdfa; }
  .sb-recent:hover { background: #f9fafb; }
  @keyframes searchspin { to { transform: rotate(360deg); } }
  .search-input:focus { border-color: #0a6b5e; box-shadow: 0 0 0 3px rgba(10,107,94,0.12); }
`;

export default SearchBar;