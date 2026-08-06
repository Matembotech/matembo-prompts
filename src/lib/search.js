// Global search. Queries content tables with ILIKE (fast via pg_trgm GIN
// indexes from migration 0016) and returns typed, normalized, ranked results.
import { supabase } from '../supabaseClient';
import { normalizePrompt } from './prompts';

// Lightweight columns for search result cards (avoids fetching heavy fields).
const SEARCH_PROMPT_COLUMNS = `
  id, slug, title, excerpt, image_url, category_id, author_id, subject_id,
  trending_until, created_at,
  categories ( id, slug, name ),
  profiles ( id, full_name ),
  subjects ( id, slug, name )
`;

const TRENDING = 'trending';
const NEW = 'new';

const NEW_BADGE_MS = () => Number(import.meta.env.VITE_NEW_BADGE_DAYS || '14') * 24 * 60 * 60 * 1000;

// Human-friendly label for a prompt result.
export function promptBadge(p) {
  if (p.trending_until && new Date(p.trending_until).getTime() > Date.now()) return TRENDING;
  if (p.created_at && Date.now() - new Date(p.created_at).getTime() <= NEW_BADGE_MS()) return NEW;
  return null;
}

// Escape a plain term so it is safe inside an ILIKE pattern.
function like(term) {
  return '%' + String(term).replace(/[%_\\]/g, (m) => '\\' + m) + '%';
}

// Search prompts across title, excerpt, description, image_prompt, video_prompt.
export async function searchPrompts(query, { limit = 6 } = {}) {
  const term = query.trim().toLowerCase();
  if (!term) return { prompts: [], nextCategory: null };
  const pattern = like(term);

  let builder = supabase
    .from('prompts')
    .select(SEARCH_PROMPT_COLUMNS)
    .or(
      `title.ilike.${pattern},excerpt.ilike.${pattern},description.ilike.${pattern},` +
      `image_prompt.ilike.${pattern},video_prompt.ilike.${pattern}`
    )
    .order('created_at', { ascending: false })
    .limit(limit);

  const { data, error } = await builder;
  if (error) throw error;
  return (data || []).map((row) => ({ ...normalizePrompt(row), badge: promptBadge(row) }));
}

// Search categories by display name. Returns rows that link to /category/:slug.
export async function searchCategories(query, { limit = 4 } = {}) {
  const term = query.trim().toLowerCase();
  if (!term) return [];
  const pattern = like(term);

  const { data, error } = await supabase
    .from('categories')
    .select('id, slug, name')
    .ilike('name', pattern)
    .order('name', { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

// Combined "global" search used by the search bar (prompts + categories).
export async function searchEverything(query, { promptLimit = 6, categoryLimit = 4 } = {}) {
  const [prompts, categories] = await Promise.all([
    searchPrompts(query, { limit: promptLimit }),
    searchCategories(query, { limit: categoryLimit }),
  ]);
  return { prompts, categories };
}