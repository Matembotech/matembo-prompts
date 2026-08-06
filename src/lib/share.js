// Share helpers: canonical URLs + platform share links.
// Imported by ShareButton (card + detail).
import { SITE_URL } from './config';

export function canonicalPromptUrl(slug, id) {
  const identifier = slug || id;
  return `${SITE_URL}/prompts/${identifier}`;
}

export function u(text) {
  return encodeURIComponent(text ?? '');
}

export function buildShareLinks({ url, title, text }) {
  const fullUrl = url;
  const s = u(text || title || '');

  return {
    copy: fullUrl,
    whatsapp: `https://wa.me/?text=${s}%20${u(fullUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${u(fullUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${u(fullUrl)}&text=${s}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${u(fullUrl)}`,
    telegram: `https://t.me/share/url?url=${u(fullUrl)}&text=${s}`,
  };
}

export const SHARE_PLATFORMS = [
  { key: 'copy', label: 'Copy Link' },
  { key: 'whatsapp', label: 'WhatsApp' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'twitter', label: 'X (Twitter)' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'telegram', label: 'Telegram' },
];