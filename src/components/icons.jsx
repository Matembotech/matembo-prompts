// Consolidated inline SVG icons (stroke-based, follow the existing site's
// inline-icon style). Import the named icons you need.
/* eslint-disable react-refresh/only-export-components */

const base = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

const svg = (paths) => (props = {}) => (
  <svg {...base} {...props}>
    {paths}
  </svg>
);

export const IconThumbUp = svg(
  <>
    <path d="M7 10v12" />
    <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
  </>
);

export const IconThumbFilled = (props = {}) => (
  <g {...base} {...props}>
    <path
      d="M7 10v12M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"
      fill="currentColor"
      stroke="none"
    />
  </g>
);

export const IconBookmark = svg(
  <>
    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16Z" />
  </>
);

export const IconBookmarkFilled = svg(
  <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16Z" fill="currentColor" stroke="none" />
);

export const IconShare = svg(
  <>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </>
);

export const IconEye = svg(
  <>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
    <circle cx="12" cy="12" r="3" />
  </>
);

export const IconTrendingUp = svg(
  <>
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </>
);

export const IconSparkles = svg(
  <>
    <path d="M12 3l1.9 5.6L19.5 10.5l-5.6 1.9L12 18l-1.9-5.6L4.5 10.5l5.6-1.9Z" />
    <path d="M19 2l.6 1.9L21.5 4.5l-1.9.6L19 7l-.6-1.9L16.5 4.5l1.9-.6Z" />
  </>
);

export const IconCheck = svg(<polyline points="20 6 9 17 4 12" />);

export const IconCopy = svg(
  <>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </>
);

export const IconLink = svg(
  <>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </>
);

export const IconCornerUpRight = svg(
  <>
    <polyline points="15 14 20 9 15 4" />
    <path d="M4 20v-7a4 4 0 0 1 4-4h12" />
  </>
);

export const IconPhoto = svg(
  <>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </>
);

export const IconVideo = svg(
  <>
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </>
);

export const IconBrokenImage = svg(
  <>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
    <line x1="3" y1="3" x2="21" y2="21" />
  </>
);

export const IconGrid = svg(
  <>
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </>
);

export const IconWifiOff = svg(
  <>
    <line x1="1" y1="1" x2="23" y2="23" />
    <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
    <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
    <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
    <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    <line x1="12" y1="20" x2="12.01" y2="20" />
  </>
);

export const IconSearch = svg(
  <>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </>
);

export const IconHeart = svg(
  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" />
);

export const IconHeartFilled = svg(
  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" fill="currentColor" stroke="none" />
);

// Brand icons (filled, for share popover)
const svgFill = (paths) => (props = {}) => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" {...props}>
    {paths}
  </svg>
);

export const IconWhatsApp = svgFill(
  <path d="M12 2a10 10 0 0 0-8.62 15L2 22l5.16-1.35A10 10 0 1 0 12 2Zm5.28 14.12c-.23.64-1.32 1.23-1.83 1.28-.49.04-1.11.24-3.33-.7-2.98-1.25-4.88-4.5-5.03-4.71-.15-.2-1.05-1.55-1.05-2.96s.66-2.05.92-2.33c.26-.28.56-.35.74-.35l.54.01c.28 0 .63-.11.98.75.37.9 1.25 3.06 1.35 3.32.1.26.12.5.02.73-.1.32-.55.97-.78 1.2-.14.18-.34.4-.14.78.13.3.7 1.14 1.5 1.85 1.01.9 1.86 1.18 2.13 1.31.3.15.48.13.65-.07.17-.18.76-.88.94-1.19.18-.27.36-.24.61-.15.25.08 1.57.78 1.83.82.26.18.44.27.5.42.07.15.07.9-.16 1.5Z" />
);

export const IconFacebook = svgFill(
  <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.09 24 18.1 24 12.07Z" />
);

export const IconXTwitter = svgFill(
  <path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.4l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93Zm-1.29 19.5h2.04L6.49 3.24H4.3l13.31 17.4Z" />
);

export const IconLinkedIn = svgFill(
  <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45Z" />
);

export const IconTelegram = svgFill(
  <path d="M11.94.11A11.94 11.94 0 1 0 23.88 12 11.94 11.94 0 0 0 11.94.11Zm5.86 8.8-1.98 9.33c-.15.67-.55.83-1.1.52l-3.1-2.28-1.5 1.44c-.16.17-.3.3-.62.3l.22-3.14 5.72-5.16c.25-.22-.05-.35-.38-.13l-7.07 4.45-3.03-.95c-.66-.21-.67-.66.14-.98l11.84-4.57c.55-.2 1.05.13.86 1Z" />
);