// Global app configuration. Environment-overridable where it makes sense.
export const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://www.matembotech.site';

// "New" badge threshold (days since publish). Configure via env.
export const NEW_BADGE_DAYS = parseInt(import.meta.env.VITE_NEW_BADGE_DAYS || '14', 10);

// Default author fallback when a prompt has no author or its author was deleted.
export const DEFAULT_AUTHOR = 'Matembo Tech';

// Grid page size (keep in sync with PromptsGrid).
export const PROMPTS_PER_PAGE = 10;
