import { useState, useEffect, useRef } from 'react';
import { buildShareLinks, SHARE_PLATFORMS } from '../lib/share';
import { incrementShare } from '../lib/prompts';
import {
  IconShare,
  IconCheck,
  IconLink,
  IconWhatsApp,
  IconFacebook,
  IconXTwitter,
  IconLinkedIn,
  IconTelegram,
} from './icons';

const PLATFORM_ICONS = {
  copy: IconLink,
  whatsapp: IconWhatsApp,
  facebook: IconFacebook,
  twitter: IconXTwitter,
  linkedin: IconLinkedIn,
  telegram: IconTelegram,
};

// Share button with a small popover of share destinations.
// Stops propagation so it never triggers the wrapping <Link> navigation.
export default function ShareButton({
  url,
  title,
  text,
  size = 24,
  iconSize = 20,
  promptId,
  variant = 'icon', // 'icon' | 'pill'
  style,
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const toggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen((o) => !o);
  };

  const handleCopy = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      incrementShare(promptId);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      console.error('Copy share link failed:', err);
    }
  };

  const handlePlatform = (e, platformUrl) => {
    e.preventDefault();
    e.stopPropagation();
    incrementShare(promptId);
    window.open(platformUrl, '_blank', 'noopener,noreferrer');
    setOpen(false);
  };

  const links = buildShareLinks({ url, title, text });

  return (
    <div
      ref={rootRef}
      style={{
        position: 'relative',
        display: 'inline-flex',
        ...style,
      }}
    >
      <button
        type="button"
        onClick={toggle}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Share this prompt"
        title="Share"
        style={variant === 'pill' ? styles.pill(open) : styles.icon(open, size)}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = variant === 'pill' ? '#ffffff' : '#0a6b5e';
          if (variant === 'pill') e.currentTarget.style.opacity = '0.92';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = variant === 'pill' ? '#ffffff' : open ? '#0a6b5e' : '#6b7280';
          if (variant === 'pill') e.currentTarget.style.opacity = '1';
        }}
      >
        {variant === 'pill' && <IconShare size={iconSize} />}
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 10px)',
            right: 0,
            zIndex: 60,
            minWidth: 190,
            maxWidth: 'calc(100vw - 24px)',
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '14px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
            padding: '8px',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {SHARE_PLATFORMS.map(({ key, label }) => {
              const Icon = PLATFORM_ICONS[key];
              if (key === 'copy') {
                return (
                  <ItemButton key={key} onClick={handleCopy}>
                    <Icon size={iconSize} />
                    <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
                    {copied && <IconCheck size={15} style={{ marginLeft: 'auto', color: '#0a6b5e' }} />}
                  </ItemButton>
                );
              }
              return (
                <ItemButton key={key} onClick={(e) => handlePlatform(e, links[key])}>
                  <Icon size={iconSize} />
                  <span>{label}</span>
                </ItemButton>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function ItemButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={popoverItemStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#f3f4f6';
        e.currentTarget.style.color = '#0a6b5e';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = '#374151';
      }}
    >
      {children}
    </button>
  );
}

const styles = {
  icon: (open, size) => ({
    display: 'inline-flex',
    alignItems: 'center',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    padding: '4px 6px',
    borderRadius: '999px',
    color: open ? '#0a6b5e' : '#6b7280',
    transition: 'color 0.15s ease',
  }),
  pill: (open) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '7px',
    border: 'none',
    cursor: 'pointer',
    padding: '9px 16px',
    borderRadius: '999px',
    background: '#0a6b5e',
    color: '#ffffff',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '13px',
    fontWeight: 700,
    transition: 'opacity 0.15s ease, background 0.15s ease',
  }),
};

const popoverItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  width: '100%',
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  padding: '9px 10px',
  borderRadius: '9px',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 14,
  fontWeight: 600,
  color: '#374151',
  textAlign: 'left',
  transition: 'background 0.15s ease, color 0.15s ease',
};
