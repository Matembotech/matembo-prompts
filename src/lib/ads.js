// Google AdSense auto-ads loader.
// Loads the AdSense script only when a publisher ID is configured via
// VITE_ADSENSE_CLIENT_ID (e.g. "ca-pub-3169041654544428"). Set it in .env to
// enable ads, or leave it empty/blank to keep the site ad-free.
const CLIENT_ID = (import.meta.env.VITE_ADSENSE_CLIENT_ID || '').trim();

let loaded = false;

export function loadAutoAds() {
  if (!CLIENT_ID || loaded) return;
  if (window.googletag?.pubads) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CLIENT_ID}`;
  script.crossOrigin = 'anonymous';
  // Keep the tag connected even if AdSense blocks ad rendering (avoids
  // "adsbygoogle" accumulation warnings when ads are not served).
  document.head.appendChild(script);
  loaded = true;
}